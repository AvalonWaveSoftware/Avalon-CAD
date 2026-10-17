// WS2 (ADR v2) bench: one-object move preview at 21/60/100 distinct objects, worker time (engine job + topology
// shipping + the postMessage structured clone, simulated with structuredClone(..., {transfer})) and preview message
// bytes, with TOPOLOGY_SERVICE off and on (median of 5 after warm-up). Run from the repo root:
//   node tests/perf/ws2-bench.mjs [--check]        (--check exits 1 when a WS2 budget is exceeded with the switch on)
// The "off" run uses a temporary copy of web/ with TOPOLOGY_SERVICE=false (tests/perf/.ws2-off, removed afterwards).
import fs from 'node:fs';import {execFileSync} from 'node:child_process';
const R=process.cwd()+'/',variant=process.env.WS2_VARIANT;
if(!variant){const off=R+'tests/perf/.ws2-off/';fs.rmSync(off,{recursive:true,force:true});fs.cpSync(R+'web',off+'web',{recursive:true});
 const flags=off+'web/perf-flags.mjs';fs.writeFileSync(flags,fs.readFileSync(flags,'utf8').replace('TOPOLOGY_SERVICE=true','TOPOLOGY_SERVICE=false'));
 const out={};try{for(const v of ['off','on'])out[v]=JSON.parse(execFileSync(process.execPath,[new URL(import.meta.url).pathname],{env:{...process.env,WS2_VARIANT:v},encoding:'utf8',maxBuffer:1<<26}).trim().split('\n').at(-1));}finally{fs.rmSync(off,{recursive:true,force:true});}
 const budgets={move21Ms:40,move60Ms:60,move100Ms:90,adrMessage100Bytes:1.6e6},fail=Object.entries(budgets).filter(([k,v])=>out.on[k]>v);
 console.log(JSON.stringify({...out,budgets,pass:!fail.length},null,1));if(process.argv.includes('--check')&&fail.length)process.exit(1);process.exit(0);}
const W=variant==='off'?R+'tests/perf/.ws2-off/web/':R+'web/';
const {loadPyodide}=await import(R+'node_modules/pyodide/pyodide.mjs');const {initKernel}=await import(W+'kernel.mjs');const {initLocalEngine}=await import(W+'local-engine.mjs');
const {blank,object,defaults}=await import(W+'templates.mjs');const {TOPOLOGY_SERVICE}=await import(W+'perf-flags.mjs');
const ship=TOPOLOGY_SERVICE?(await import(W+'topology-pack.mjs')).shipTopologies:null,client=TOPOLOGY_SERVICE?(await import(W+'topology-client.mjs')).topologyClient():null;
const K=await initKernel(),E=await initLocalEngine(K,{loadPyodide,pythonURL:R+'node_modules/pyodide/',pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
const types=['box','cylinder','sphere','tube','cone'];let id=0;
const proj=n=>{const p=blank();for(let i=0;i<n;i++){const t=types[i%5],q={...defaults[t]};q.h=(q.h||10)+i*.1;if(t==='sphere')q.diameter+=i*.1;const o=object(t,q,[(i%10)*35,Math.floor(i/10)*35,0]);o.layerId=p.activeLayer;p.objects.push(o);}return p;};
// messageBytes: every typed array plus the JSON length of everything else (ids, bounds, hashes, an object-graph
// topology). adrBytes: the audit's §2 accounting (mesh buffers of the union, display and parts, plus topology bodies:
// packed bytes when on, JSON length when off); per-part ids/bounds are not counted there.
const size=v=>{let typed=0;const rest=JSON.stringify(v,(k,x)=>{if(ArrayBuffer.isView(x)){typed+=x.byteLength;return 0;}return x;});return typed+rest.length;};
const adrSize=r=>{let n=0;const add=o=>{for(const k of ['vertices','triangles','flatTriangles','smoothingGroups','displayPositions','displayNormals'])if(ArrayBuffer.isView(o[k]))n+=o[k].byteLength;};add(r);for(const q of r.parts||[]){add(q);if(q.topology)n+=JSON.stringify(q.topology,(k,x)=>ArrayBuffer.isView(x)?Array.from(x):x).length;}
 for(const b of r.topologies||[])n+=b.meta.byteLength+b.nums.byteLength+b.typed.reduce((s,x)=>s+x.byteLength,0);return n;};
function job(p){const t=performance.now();const msg={id:++id,type:'preview',project:p,tolerance:.15},r=E.process(client?client.outgoing(msg):msg);if(r.error)throw Error(r.error);
 const transfers=[];for(const key of ['vertices','triangles','flatTriangles','smoothingGroups','displayPositions','displayNormals'])if(ArrayBuffer.isView(r[key]))transfers.push(r[key].buffer);
 for(const q of r.parts||[]){for(const key of ['vertices','triangles','flatTriangles','smoothingGroups'])if(q[key])transfers.push(q[key].buffer);if(!ship&&q.topology)transfers.push(q.topology.vertices.buffer,q.topology.triangles.buffer);}
 if(ship)transfers.push(...ship(r));const engineMs=performance.now()-t,bytes=size(r),adr=adrSize(r),t2=performance.now(),c=structuredClone(r,{transfer:transfers}),ms=engineMs+performance.now()-t2;
 const u=performance.now();if(client)client.incoming(c);return {ms,bytes,adr,uiMs:performance.now()-u};}
const med=a=>[...a].sort((x,y)=>x-y)[a.length>>1],out={variant,TOPOLOGY_SERVICE};
for(const n of [21,60,100]){const p=proj(n);job(p);for(let i=0;i<3;i++){p.objects[i].position[0]+=1;job(p);}const ms=[],bytes=[],ui=[],adr=[];
 for(let i=0;i<5;i++){p.objects[(i*7)%n].position[0]+=1;const r=job(p);ms.push(r.ms);bytes.push(r.bytes);adr.push(r.adr);ui.push(r.uiMs);}
 out[`move${n}Ms`]=+med(ms).toFixed(1);out[`message${n}Bytes`]=med(bytes);out[`adrMessage${n}Bytes`]=med(adr);out[`uiIngest${n}Ms`]=+med(ui).toFixed(2);}
console.log(JSON.stringify(out));
