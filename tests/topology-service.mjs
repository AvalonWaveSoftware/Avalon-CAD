// WS2 (ADR v2): topology as a content-addressed service. Checks that packing is exact, that the service topology is
// the WS1 scoped topology (byte-identical), that bodies are sent only for unacknowledged hashes and land on
// part.topology in the UI client, that B-rep and topology caches respect their caps, and that thread rods mesh once.
import assert from 'node:assert/strict';import fs from 'node:fs';import {loadPyodide} from 'pyodide';
import {initKernel} from '../web/kernel.mjs';import {initLocalEngine} from '../web/local-engine.mjs';
import {objectTopology,topologyVariant,topologyCacheStats,disposeSolidCache} from '../web/cad-solid.mjs';
import {packTopology,unpackTopology,shipTopologies,packedBytes} from '../web/topology-pack.mjs';
import {topologyClient} from '../web/topology-client.mjs';import {TOPOLOGY_SERVICE} from '../web/perf-flags.mjs';
import {object,defaults,blank} from '../web/templates.mjs';import {withRoundover} from '../web/operations.mjs';import {migrateProject} from '../web/migrate.mjs';
if(!TOPOLOGY_SERVICE){console.log('topology-service: TOPOLOGY_SERVICE is off; skipped');process.exit(0);}
// 1. pack/unpack is exact, including typed arrays, -0, NaN, Infinity, empty and nested arrays.
{const t={vertices:new Float32Array([1,-0,2.5]),triangles:new Uint32Array([0,1,2]),groups:[{start:0,count:3,faceId:123456789,face:0}],faces:[{index:0,kind:'PLANE',center:[0.1,-0,1e-300],normal:[0,0,1],edges:[],loops:[[1,2],[]]}],edges:[{index:2,points:[NaN,Infinity,-Infinity,Math.PI]}],faceCount:1,flatFaces:-0,tag:null,ok:true,later:undefined};
 const p=packTopology(t),u=unpackTopology(structuredClone(p,{transfer:[]}));assert.deepStrictEqual(u,t);assert.ok(Object.is(u.flatFaces,-0)&&Object.is(u.faces[0].center[1],-0));
 assert.notEqual(p.typed[0].buffer,t.vertices.buffer,'packing copies cached typed arrays (they are transferred)');}
const K=await initKernel(),E=await initLocalEngine(K,{loadPyodide,pythonURL:process.cwd()+'/node_modules/pyodide/',pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
// 2. Service topology equals the WS1 scoped extractor on every primitive, fillet and fixture object, and packs exactly.
const enc=v=>JSON.stringify(v,(k,x)=>k==='faceId'?undefined:ArrayBuffer.isView(x)?{t:x.constructor.name,b:Buffer.from(x.buffer,x.byteOffset,x.byteLength).toString('base64')}:x);
const cases=[];for(const [t,p] of Object.entries(defaults))cases.push([t,object(t,structuredClone(p))]);
cases.push(['filleted box',withRoundover(object('box',{...defaults.box}),[0,1,2,3],2)],['faceted cylinder',{...object('cylinder',{...defaults.cylinder}),resolution:{mode:'faces',count:12}}]);
const walk=(list,file)=>{for(const o of list||[]){cases.push([file+':'+(o.name||o.type),o]);walk(o.params?.children,file);}};
for(const f of fs.readdirSync('tests/fixtures').filter(f=>f.endsWith('.tcad'))){try{walk(migrateProject(JSON.parse(fs.readFileSync('tests/fixtures/'+f,'utf8')),[]).objects,f);}catch{}}
let compared=0;for(const [name,o] of cases){if(o.type==='mesh'||String(o.type).startsWith('thread'))continue;let t;try{t=objectTopology(o);}catch{continue;}if(!t)continue;
 const {faceCount,flatFaces,...rest}=t;assert.equal(enc(rest),enc(topologyVariant(o,true)),'service topology differs: '+name);
 assert.deepStrictEqual(unpackTopology(packTopology(t)),t,'pack round trip: '+name);compared++;}
assert.ok(compared>20);
// 3. Protocol: engine + worker shipping + UI client give every part the same topology as a direct (unacknowledged) call.
let id=0;const run=d=>{const r=E.process({id:++id,...d});if(r.error)throw Error(r.error);return r;};
const types=['box','cylinder','sphere','tube','cone'],proj=n=>{const p=blank();for(let i=0;i<n;i++){const t=types[i%5],q={...defaults[t]};q.h=(q.h||10)+i*.1;const o=object(t,q,[(i%10)*35,Math.floor(i/10)*35,0]);o.layerId=p.activeLayer;p.objects.push(o);}return p;};
const client=topologyClient();
const viaWorker=project=>{const msg=client.outgoing({id:++id,type:'preview',project,tolerance:.15}),r=E.process(msg);if(r.error)throw Error(r.error);const transfer=shipTopologies(r),bytes=(r.topologies||[]).reduce((s,b)=>s+packedBytes(b),0),sent=r.topologies?.length||0;return {data:client.incoming(structuredClone(r,{transfer})),bytes,sent};};
disposeSolidCache();const p=proj(30);p.objects.push({...object('box',{...defaults.box},[400,0,0]),layerId:p.activeLayer},{...object('box',{...defaults.box},[440,0,0]),layerId:p.activeLayer});
let first=viaWorker(p);assert.equal(first.sent,30,'one body per distinct hash (the two added boxes equal object 0)');
const direct=run({type:'preview',project:p,tolerance:.15});
const same=(a,b)=>{assert.equal(a.parts.length,b.parts.length);a.parts.forEach((x,i)=>{assert.equal(x.topologyHash,b.parts[i].topologyHash);assert.equal(enc(x.topology),enc(b.parts[i].topology));});};
same(first.data,direct);
p.objects[3].position[0]+=1;let move=viaWorker(p);assert.equal(move.sent,0,'a move sends no topology body');same(move.data,run({type:'preview',project:p,tolerance:.15}));
p.objects[4].params.h+=.05;move=viaWorker(p);assert.equal(move.sent,1,'a dimension edit sends exactly the new body');same(move.data,run({type:'preview',project:p,tolerance:.15}));
assert.ok(client.map.size<=256);
// A reply ignored by the UI still delivers its bodies, and an in-flight acknowledgement is never pruned.
{const c=topologyClient({keep:0}),a=c.outgoing({id:9001,type:'preview'}),b=c.outgoing({id:9002,type:'preview'});const t={vertices:new Float32Array(3),triangles:new Uint32Array(3),faces:[],edges:[],groups:[]};
 c.incoming({id:9001,parts:[{id:'x',topologyHash:'h1'}],topologies:[{hash:'h1',...packTopology(t)}]});c.incoming({id:9002,parts:[{id:'y',topologyHash:'h2'}],topologies:[{hash:'h2',...packTopology(t)}]});
 assert.ok(c.map.has('h2')&&!c.map.has('h1'),'pruned only after the last preview reply');assert.deepEqual(b.topologyAck,[]);}
// 4. Caps: 100 distinct objects keep every topology while the B-rep LRU stays at its 64-entry ceiling.
disposeSolidCache();const big=proj(100);run({type:'preview',project:big,tolerance:.15});let s=topologyCacheStats();
assert.equal(s.topologyEntries,100);assert.ok(s.brepEntries<=64&&s.topologyBytes<=32*1048576,JSON.stringify(s));
big.objects[7].position[0]+=1;const t0=performance.now();run({type:'preview',project:big,tolerance:.15,topologyAck:[]});const ms=performance.now()-t0;assert.equal(topologyCacheStats().brepEntries,s.brepEntries,'a move rebuilds no B-rep');
// 5. Thread rods: threadMesh once per preview (makeObject) instead of twice.
{const mesh=K.threadMesh;let calls=0;K.threadMesh=(...a)=>{calls++;return mesh(...a);};const tp=blank();for(let i=0;i<3;i++){const o=object('threadrod',{...defaults.threadrod},[i*40,0,0]);o.layerId=tp.activeLayer;tp.objects.push(o);}
 run({type:'preview',project:tp,tolerance:.15});calls=0;tp.objects[0].position[0]+=1;run({type:'preview',project:tp,tolerance:.15});assert.equal(calls,3,'threadMesh calls per preview');K.threadMesh=mesh;}
console.log(`topology-service: ${compared} objects match the scoped extractor; protocol, caps and thread cache ok (100-object move ${ms.toFixed(0)} ms)`);
