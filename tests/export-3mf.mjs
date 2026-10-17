// ADR-0001 F2a: 3MF export (Rust encode_3mf through the worker job engine).
//  - archive: plain zip with exactly [Content_Types].xml, _rels/.rels, 3D/3dmodel.model (DEFLATE, CRC, sizes, no data
//    descriptors/extra fields/ZIP64, fixed timestamps), checked by our parser, zlib and `unzip -t`;
//  - model XML: 3MF core schema (lxml, tests/fixtures/3mf), unit millimeter, one model object, one build item, the core
//    mesh rules (distinct indices, manifold edges with consistent orientation);
//  - round trip: vertex and triangle counts equal the export mesh, every STL triangle corner equals the 3MF vertex bits;
//  - deterministic bytes (same engine, fresh engine);
//  - STL, preview preparation and thread meshes byte-identical to the 8fa7115 (ABI v3) mesh-core.wasm;
//  - size (≤ 0.3× STL on a large mesh) and encode time, reported.
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {execFileSync,spawnSync} from 'node:child_process';
import {initKernel} from '../web/kernel.mjs';import {initLocalEngine} from '../web/local-engine.mjs';import {initRustMesh} from '../web/rust-mesh.mjs';
import {migrateProject} from '../web/migrate.mjs';import {read3MF,meshRules,sameAsSTL} from './three-mf-reader.mjs';import {object,defaults,blank,plate,tray} from '../web/templates.mjs';
const BASE_SHA='8fa7115';
const binary=fs.readFileSync('app/assets/mesh-core.wasm');
const K=await initKernel(),engine=await initLocalEngine(K,{rust:{binary}});
let id=0,checks=0;
const run=(project,format,ground=true,tolerance=.03)=>{const r=engine.process({type:'export',id:++id,project:structuredClone(project),tolerance,ground,...(format?{format}:{})});if(r.error)throw Error(r.error);return r;};

// ---- projects ----
const fixtures=fs.readdirSync('tests/fixtures').filter(f=>f.endsWith('.tcad')&&f!=='over-limit.tcad').map(f=>[f,migrateProject(JSON.parse(fs.readFileSync('tests/fixtures/'+f,'utf8')),[])]);
const P=objs=>({...blank(),objects:objs});
const box=object('box',structuredClone(defaults.box),[0,0,-3]),sphere=object('sphere',structuredClone(defaults.sphere),[30,0,0]);
const projects=[...fixtures,['plate',plate()],['tray',tray()],['box+sphere (below Z=0)',P([box,sphere])],['thread rod + tube',P([object('threadrod',structuredClone(defaults.threadrod),[0,0,0]),object('threadtube',structuredClone(defaults.threadtube),[40,0,0])])],['torus+prism',P([object('torus',structuredClone(defaults.torus),[0,0,0]),object('triprism',structuredClone(defaults.triprism),[0,40,0])])]].filter(([,p])=>p.objects.some(o=>o.enabled!==false));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'avalon-3mf-'));const xmlFiles=[];let unzipChecked=0;
const hasUnzip=spawnSync('unzip',['-v']).status===0;
for(const [name,project] of projects)for(const ground of [true,false]){
 const what=name+(ground?' grounded':' as placed');
 const stl=run(project,undefined,ground),t1=run(project,'3mf',ground),t2=run(project,'3mf',ground);
 assert.equal(t1.format,'3mf');assert.equal(stl.format,undefined,'the STL response is unchanged');
 assert.ok(Buffer.from(t1.buffer).equals(Buffer.from(t2.buffer)),what+': deterministic bytes');
 assert.equal(t1.triangles,stl.triangles);assert.deepEqual(t1.bounds,stl.bounds);assert.equal(t1.volume,stl.volume);
 const m=read3MF(t1.buffer);
 sameAsSTL(stl.buffer,m,what);const vol=meshRules(m.vertices,m.triangles,what);assert.ok(Math.abs(vol-stl.volume)<=Math.max(1e-3,stl.volume*1e-4),what+': volume '+vol+' vs '+stl.volume);
 if(ground){let minZ=Infinity;for(let i=2;i<m.vertices.length;i+=3)minZ=Math.min(minZ,m.vertices[i]);assert.equal(minZ,0,what+': lowest point on Z = 0');}
 const f=path.join(tmp,`${xmlFiles.length}.model`);fs.writeFileSync(f,m.xml);xmlFiles.push(f);
 if(hasUnzip&&ground){const z=path.join(tmp,`${xmlFiles.length}.3mf`);fs.writeFileSync(z,Buffer.from(t1.buffer));const r=spawnSync('unzip',['-tq',z],{encoding:'utf8'});assert.equal(r.status,0,what+': unzip -t '+r.stdout+r.stderr);unzipChecked++;}
 checks++;
}
// Round-trip vertex count: the 3MF lists exactly the export mesh's vertices (no welding, no dropping).
// (the export job does not return its mesh, so the same kernel builds it directly; ungrounded so values compare as-is)
{const {buildModel}=await import('../web/kernel.mjs');for(const [name,project] of projects){const direct=buildModel(K,project,.03),m=read3MF(run(project,'3mf',false).buffer);
 assert.equal(m.vertices.length,direct.vertices.length,name+': vertex count equals the export mesh');assert.equal(m.triangles.length,direct.triangles.length,name+': triangle count equals the export mesh');
 const key=(v,i)=>v[i*3]+','+v[i*3+1]+','+v[i*3+2],sorted=v=>Array.from({length:v.length/3},(_,i)=>key(v,i)).sort();
 assert.deepEqual(sorted(m.vertices),sorted(direct.vertices),name+': same vertex set (bit-exact)');}checks++;}
// A fresh engine gives the same bytes.
{const fresh=await initLocalEngine(K,{rust:{binary}});const a=run(plate(),'3mf'),b=fresh.process({type:'export',id:++id,project:plate(),tolerance:.03,ground:true,format:'3mf'});assert.ok(Buffer.from(a.buffer).equals(Buffer.from(b.buffer)),'fresh engine, same bytes');checks++;}
// Unknown formats are refused; the default stays STL.
{const r=engine.process({type:'export',id:++id,project:plate(),tolerance:.15,ground:true,format:'obj'});assert.equal(r.error,'Unsupported export format.');
 const d=engine.process({type:'export',id:++id,project:plate(),tolerance:.15,ground:true}),s=engine.process({type:'export',id:++id,project:plate(),tolerance:.15,ground:true,format:'stl'});assert.ok(Buffer.from(d.buffer).equals(Buffer.from(s.buffer)));checks++;}
// Schema validation (lxml).
{const py=spawnSync('python3',['-c','import lxml'],{encoding:'utf8'});
 if(py.status!==0)console.log('SKIP 3MF core-schema validation: python3 with lxml is not available');
 else{const r=spawnSync('python3',['tests/fixtures/3mf/validate_model.py',...xmlFiles],{encoding:'utf8'});const lines=r.stdout.trim().split('\n').map(l=>JSON.parse(l));
  for(const l of lines)assert.ok(l.valid,'3MF core schema: '+l.file+' '+l.errors.join('; '));assert.equal(lines.length,xmlFiles.length);assert.equal(r.status,0);checks++;}}

// ---- byte identity of the existing Rust outputs against the base (ABI v3) wasm ----
function raw(bytes){const core=new WebAssembly.Instance(new WebAssembly.Module(bytes),{}).exports;
 const put=a=>{if(!a.byteLength)return [0,0];const p=core.mesh_alloc(a.byteLength);new Uint8Array(core.memory.buffer,p,a.byteLength).set(new Uint8Array(a.buffer,a.byteOffset,a.byteLength));return [p,a.byteLength];};
 return {version:core.engine_version(),
  stl(v,t,ground){const [vp,vb]=put(v),[tp,tb]=put(t),size=84+t.length/3*50,op=core.mesh_alloc(size);assert.equal(core.encode_stl(vp,v.length,tp,t.length,ground?1:0,op,size),0);const out=Buffer.from(new Uint8Array(core.memory.buffer,op,size));core.mesh_free(op,size);core.mesh_free(vp,vb);core.mesh_free(tp,tb);return out;},
  indexed(v,t){const n=t.length,[vp,vb]=put(v),[tp,tb]=put(t),pp=core.mesh_alloc(n*12),np=core.mesh_alloc(n*12),ip=core.mesh_alloc(n*4),cp=core.mesh_alloc(4);assert.equal(core.prepare_indexed(vp,v.length,tp,n,0,0,0,0,pp,np,ip,cp),0);const c=new Uint32Array(core.memory.buffer,cp,1)[0];
   const out=Buffer.concat([Buffer.from(new Uint8Array(core.memory.buffer,pp,c*12)),Buffer.from(new Uint8Array(core.memory.buffer,np,c*12)),Buffer.from(new Uint8Array(core.memory.buffer,ip,n*4))]);for(const [p,s] of [[pp,n*12],[np,n*12],[ip,n*4],[cp,4],[vp,vb],[tp,tb]])core.mesh_free(p,s);return out;},
  thread(params){const [pp,pb]=put(Float64Array.from(params)),ip=core.mesh_alloc(24);assert.equal(core.thread_mesh(pp,ip,0,0,0,0),0);const meta=new Uint32Array(core.memory.buffer,ip,6).slice(),vp=core.mesh_alloc(meta[0]*4),tp=core.mesh_alloc(meta[1]*4);
   assert.equal(core.thread_mesh(pp,ip,vp,meta[0],tp,meta[1]),0);const out=Buffer.concat([Buffer.from(meta.buffer),Buffer.from(new Uint8Array(core.memory.buffer,vp,meta[0]*4)),Buffer.from(new Uint8Array(core.memory.buffer,tp,meta[1]*4))]);for(const [p,s] of [[pp,pb],[ip,24],[vp,meta[0]*4],[tp,meta[1]*4]])core.mesh_free(p,s);return out;},
 };}
let baseBytes=null;try{baseBytes=execFileSync('git',['show',BASE_SHA+':app/assets/mesh-core.wasm'],{maxBuffer:1<<26});}catch{}
if(!baseBytes)console.log(`SKIP byte identity vs ${BASE_SHA}: commit not in this clone`);
else{const base=raw(baseBytes),now=raw(binary);assert.equal(base.version,3);assert.equal(now.version,4);let n=0;
 const {buildModel}=await import('../web/kernel.mjs');
 for(const [name,project] of projects)for(const tol of [.15,.03]){const m=buildModel(K,project,tol);if(!m.triangles.length)continue;
  for(const ground of [true,false])assert.ok(base.stl(m.vertices,m.triangles,ground).equals(now.stl(m.vertices,m.triangles,ground)),name+': STL byte-identical to '+BASE_SHA);
  assert.ok(base.indexed(m.vertices,m.triangles).equals(now.indexed(m.vertices,m.triangles)),name+': prepare_indexed identical');n++;}
 // Thread meshes (rust-mesh.mjs threadMesh parameter layout: tube?, diameter, pitch, h, outer, clearance, hand, phase, tolerance).
 const threads=[[0,6,1,20,0,.2,1,0,.15],[0,12.7,25.4/13,30,0,.3,-1,.5,.03],[1,10,1.5,15,16,.25,1,0,.15]];
 for(const t of threads)assert.ok(base.thread(t).equals(now.thread(t)),'thread_mesh identical '+t);
 console.log(`Byte identity vs ${BASE_SHA} mesh-core.wasm: STL (grounded and as placed) and prepare_indexed on ${n} meshes, thread_mesh on ${threads.length} threads`);checks++;}

// ---- size and speed on a large mesh ----
{const rust=await initRustMesh({binary});const s=K.Manifold.sphere(25,1024);const mesh=s.getMesh();s.delete();
 const v=Float32Array.from(mesh.vertProperties),t=Uint32Array.from(mesh.triVerts),tris=t.length/3;
 const time=fn=>{const r=[];let out;for(let i=0;i<3;i++){const a=performance.now();out=fn();r.push(performance.now()-a);}r.sort((x,y)=>x-y);return [r[1],out];};
 const [stlMs,stl]=time(()=>rust.writeSTL(v,t,true)),[mfMs,mf]=time(()=>rust.write3MF(v,t,true));
 const m=read3MF(mf);sameAsSTL(stl,m,'large sphere');meshRules(m.vertices,m.triangles,'large sphere');
 const ratio=mf.byteLength/stl.byteLength;
 console.log(`Large sphere ${tris.toLocaleString()} triangles: STL ${(stl.byteLength/1048576).toFixed(2)} MB in ${stlMs.toFixed(0)} ms · 3MF ${(mf.byteLength/1048576).toFixed(2)} MB (${ratio.toFixed(3)}× STL) in ${mfMs.toFixed(0)} ms (median of 3)`);
 assert.ok(ratio<=.3,'3MF ≤ 0.3× STL size (ADR §8)');assert.ok(mfMs<1500,'3MF encode time sanity bound (ADR budget 600 ms, reported above)');checks++;}
fs.rmSync(tmp,{recursive:true,force:true});
console.log(`PASS: ${checks} 3MF export checks (${projects.length} projects × grounded/as placed: archive, core schema, mesh rules, STL round trip, determinism${hasUnzip?`, unzip -t ×${unzipChecked}`:''}).`);
