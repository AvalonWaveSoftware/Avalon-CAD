// ADR-0001 F2a option A: the 3MF worker pool (web/export-3mf-pool.mjs + app/assets/export-pool.js) on Node workers.
//  - the 8 fixed parts give the same bytes for 1, 2, 4 and 8 workers, equal to the single-call chunked encoder
//    (write3MF, the reference and the fallback), on fixtures, templates, threads, a below-Z=0 pair and the 524k sphere;
//  - export3MF: pool path (cold, then warm), forced fallback, and fallback when workers cannot be constructed, fail to
//    load, never become ready, or die mid-encode; every path gives identical bytes and the export never fails;
//  - the pool is created lazily (first 3MF export), kept for the session, and torn down by dispose3MFPool (project close);
//  - pool size min(cores - 1, 4), at most 2 on Android.
import assert from 'node:assert/strict';
import fs from 'node:fs';import {pathToFileURL} from 'node:url';
import {initKernel} from '../web/kernel.mjs';import {initLocalEngine} from '../web/local-engine.mjs';
import {migrateProject} from '../web/migrate.mjs';import {object,defaults,blank,plate,tray} from '../web/templates.mjs';
import {createPool,export3MF,dispose3MFPool,current3MFPool,poolSize} from '../web/export-3mf-pool.mjs';
import {nodeWorker,live} from './node-web-worker.mjs';
import {read3MF} from './three-mf-reader.mjs';
const binary=fs.readFileSync('app/assets/mesh-core.wasm');
const K=await initKernel(),engine=await initLocalEngine(K,{rust:{binary}});
const SCRIPTS={built:pathToFileURL('app/assets/export-pool.js').href,source:pathToFileURL('web/export-pool-worker.mjs').href};
assert.ok(fs.existsSync('app/assets/export-pool.js'),'run node build-web.mjs first');
let id=0,checks=0;const same=(a,b,msg)=>{assert.ok(Buffer.from(a).equals(Buffer.from(b)),msg);checks++;};
// The geometry worker, in-process: 'export' and the 'encode3mf' fallback, exactly as worker.mjs answers them.
const calls=[];
const request=async(type,data)=>{calls.push(type);
 if(type==='encode3mf')return {buffer:engine.rust.write3MF(data.vertices,data.triangles,data.ground!==false)};
 const r=engine.process({type,id:++id,...structuredClone(data)});if(r.error)throw Error(r.error);return r;};
const assetURL=name=>name==='export-pool.js'?SCRIPTS.built:pathToFileURL('app/assets/'+name).href;
const opts=extra=>({makeWorker:nodeWorker,binary,log:null,...extra});

// ---- pool size ----
assert.equal(poolSize(8,false),4);assert.equal(poolSize(3,false),2);assert.equal(poolSize(1,false),1);assert.equal(poolSize(16,true),2);assert.equal(poolSize(2,true),1);checks+=5;

// ---- meshes ----
const P=objs=>({...blank(),objects:objs});
const fixtures=fs.readdirSync('tests/fixtures').filter(f=>f.endsWith('.tcad')&&f!=='over-limit.tcad').map(f=>[f,migrateProject(JSON.parse(fs.readFileSync('tests/fixtures/'+f,'utf8')),[])]);
const projects=[...fixtures,['plate',plate()],['tray',tray()],['box+sphere (below Z=0)',P([object('box',structuredClone(defaults.box),[0,0,-3]),object('sphere',structuredClone(defaults.sphere),[30,0,0])])],
 ['thread rod',P([object('threadrod',structuredClone(defaults.threadrod),[0,0,0])])],['one box',P([object('box',structuredClone(defaults.box),[0,0,0])])]];
const meshes=[];
for(const [name,project] of projects)for(const ground of [true,false]){
 const r=engine.process({type:'export',id:++id,project:structuredClone(project),tolerance:.03,ground,format:'3mf-mesh'});if(r.error)continue;
 meshes.push({name:`${name} ground=${ground}`,ground,...r.mesh3mf});}
{const s=K.Manifold.sphere(25,1024);const m=s.getMesh();s.delete();const vertices=Float32Array.from(m.vertProperties),triangles=Uint32Array.from(m.triVerts);
 meshes.push({name:'sphere 524k',ground:true,vertices,triangles,minZ:engine.rust.prepare3MF(vertices,triangles,true)});}
assert.ok(meshes.length>=10,'meshes');
const reference=meshes.map(m=>engine.rust.write3MF(m.vertices,m.triangles,m.ground));
reference.forEach((b,i)=>{const z=read3MF(b);assert.ok(z,meshes[i].name);checks++;});

// ---- 1, 2, 4 and 8 workers: identical bytes ----
for(const [label,script] of Object.entries(SCRIPTS))for(const size of [1,2,4,8]){
 const pool=createPool({size,script,binary,makeWorker:nodeWorker});assert.equal(await pool.ready,true,`${label} pool of ${size} starts`);
 for(let i=0;i<meshes.length;i++)same(await pool.encode(meshes[i]),reference[i],`${label} ${size} workers: ${meshes[i].name}`);
 pool.dispose();}
console.log(`identical bytes for 1/2/4/8 workers (built + source worker) on ${meshes.length} meshes incl. the 524k sphere`);

// ---- export3MF paths ----
const job={project:plate(),tolerance:.03,ground:true};
const want=engine.rust.write3MF(...(m=>[m.vertices,m.triangles,true])(engine.process({type:'export',id:++id,...structuredClone(job),format:'3mf-mesh'}).mesh3mf));
dispose3MFPool();assert.equal(current3MFPool(),null);
calls.length=0;let r=await export3MF({request,payload:structuredClone(job),assetURL,options:opts({size:2})});
assert.deepEqual([r.encoder.path,r.encoder.workers,r.encoder.cold],['pool',2,true]);same(r.buffer,want,'pool cold');assert.deepEqual(calls,['export']);
assert.equal(r.format,'3mf');assert.ok(r.triangles>0&&r.bounds);assert.equal(r.mesh3mf,undefined);assert.equal(globalThis.__avalon3MF,r.encoder);
const pool1=current3MFPool();assert.ok(pool1);
r=await export3MF({request,payload:structuredClone(job),assetURL,options:opts({size:2})});
assert.deepEqual([r.encoder.path,r.encoder.cold],['pool',false]);assert.equal(current3MFPool(),pool1,'pool kept for the session');same(r.buffer,want,'pool warm');
// Teardown on project close.
const before=[...live];assert.equal(before.length,2);dispose3MFPool();assert.equal(current3MFPool(),null);assert.ok(before.every(w=>w.terminated)&&live.size===0,'pool workers terminated on project close');checks++;
r=await export3MF({request,payload:structuredClone(job),assetURL,options:opts({size:2})});assert.equal(r.encoder.cold,true,'a new pool after close');same(r.buffer,want,'pool after close');dispose3MFPool();
// Forced fallback.
calls.length=0;r=await export3MF({request,payload:structuredClone(job),assetURL,options:opts({forceFallback:true})});
assert.deepEqual([r.encoder.path,r.encoder.workers,r.encoder.reason],['fallback',0,'forced']);assert.deepEqual(calls,['export','encode3mf']);same(r.buffer,want,'forced fallback');assert.equal(live.size,0);
// Workers cannot be constructed (CSP / WebView without module workers).
r=await export3MF({request,payload:structuredClone(job),assetURL,options:opts({makeWorker:()=>{throw Error('SecurityError: blocked by CSP');}})});
assert.equal(r.encoder.path,'fallback');assert.match(r.encoder.reason,/CSP/);same(r.buffer,want,'no workers');
// The pool stays broken for the session (no retry per export) until the project closes.
r=await export3MF({request,payload:structuredClone(job),assetURL,options:opts()});assert.equal(r.encoder.path,'fallback');same(r.buffer,want,'broken pool');dispose3MFPool();
// The worker script does not load.
r=await export3MF({request,payload:structuredClone(job),assetURL:n=>n==='export-pool.js'?pathToFileURL('app/assets/missing-pool.js').href:assetURL(n),options:opts({size:2})});
assert.equal(r.encoder.path,'fallback');same(r.buffer,want,'missing script');dispose3MFPool();assert.equal(live.size,0);
// mesh-core.wasm fails to instantiate in the workers (e.g. memory).
r=await export3MF({request,payload:structuredClone(job),assetURL,options:opts({size:2,binary:new Uint8Array([0,97,115,109,9,9,9,9]).buffer})});
assert.equal(r.encoder.path,'fallback');assert.match(r.encoder.reason,/failed to start/);same(r.buffer,want,'bad wasm');dispose3MFPool();
// Workers never answer.
const silent=()=>({postMessage(){},terminate(){this.terminated=true;}});
r=await export3MF({request,payload:structuredClone(job),assetURL,options:opts({size:2,makeWorker:silent,timeout:200})});
assert.equal(r.encoder.path,'fallback');assert.match(r.encoder.reason,/timed out/);same(r.buffer,want,'silent workers');dispose3MFPool();
// A worker dies mid-encode.
let made=0;const dying=url=>{const w=nodeWorker(url);if(++made===2){const post=w.postMessage;w.postMessage=(m,t)=>{if(m.op==='part'){w.terminate();setTimeout(()=>w.onerror?.({message:'worker crashed'}),5);return;}post(m,t);};}return w;};
r=await export3MF({request,payload:structuredClone(job),assetURL,options:opts({size:2,makeWorker:dying})});
assert.equal(r.encoder.path,'fallback');assert.match(r.encoder.reason,/crashed/);same(r.buffer,want,'worker died');dispose3MFPool();
for(const w of live)w.terminate();
console.log(`export-3mf-pool OK (${checks} checks)`);
process.exit(0);
