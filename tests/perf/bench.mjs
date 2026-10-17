// Run from repo root: node tests/perf/bench.mjs (copied from /workspace/avalon-cad-audit-report, WS0)
import fs from 'node:fs';import {performance as P} from 'node:perf_hooks';
const R=process.cwd()+'/';
let t=P.now();const {loadPyodide}=await import(R+'node_modules/pyodide/pyodide.mjs');
const {initKernel,buildModel}=await import(R+'web/kernel.mjs');const {initLocalEngine}=await import(R+'web/local-engine.mjs');
const {blank,object,defaults}=await import(R+'web/templates.mjs');const {withRoundover}=await import(R+'web/operations.mjs');
const {prepareDisplayMesh}=await import(R+'web/display-geometry.mjs');
console.log('module import ms',(P.now()-t).toFixed(0));
t=P.now();const K=await initKernel();console.log('initKernel (manifold+OCCT) ms',(P.now()-t).toFixed(0));
t=P.now();const E=await initLocalEngine(K,{loadPyodide,pythonURL:R+'node_modules/pyodide/',pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
console.log('initLocalEngine (pyodide+rust) ms',(P.now()-t).toFixed(0));
let id=0;const run=d=>{const r=E.process({id:++id,...d});if(r.error)throw Error(r.error);return r;};
function proj(n,kind='mix',fillet=false){const p=blank();p.buildPlaneEnabled=true;const types=['box','cylinder','sphere','tube','cone'];
 for(let i=0;i<n;i++){const ty=kind==='mix'?types[i%5]:kind;let o=object(ty,structuredClone(defaults[ty]),[ (i%10)*35,Math.floor(i/10)*35,0]);o.layerId=p.activeLayer;if(fillet&&o.type==='box')o=withRoundover(o,[0,1,2,3],2);p.objects.push(o);}return p;}
const med=a=>a.sort((x,y)=>x-y)[a.length>>1];
function time(label,fn,reps=5){fn();const a=[];let r;for(let i=0;i<reps;i++){const s=P.now();r=fn();a.push(P.now()-s);}console.log(label,'median ms',med(a).toFixed(1),r?.tri!==undefined?'tris '+r.tri:'');return med(a);}
for(const n of [1,10,30,60,100]){const p=proj(n);
 time(`preview python path n=${n}`,()=>{const r=run({type:'preview',project:p,tolerance:.15});return {tri:r.triangles.length/3};});
 time(`preview JS buildModel n=${n}`,()=>{const r=buildModel(K,p,.15,true);return {tri:r.triangles.length/3};});
 time(`structuredClone project n=${n}`,()=>{structuredClone(p)},20);
}
const one=proj(1,'box');one.objects[0].position=[0,0,0];
time('single box preview',()=>{const r=run({type:'preview',project:one,tolerance:.15});return {tri:r.triangles.length/3};});
const fp=proj(10,'box',true);
time('10 filleted boxes preview (OCCT) tol .15',()=>{const r=run({type:'preview',project:fp,tolerance:.15});return {tri:r.triangles.length/3};},3);
const f1=proj(1,'box',true);
time('1 filleted box export tol .005',()=>{const r=run({type:'export',project:f1,tolerance:.005});return {tri:(r.triangles?.length||0)/3};},3);
// incremental: 1 changed object among 30 -> cost of rebuilding just it
const p30=proj(30);const single={...p30,objects:[p30.objects[7]]};
time('30-obj project, rebuild only 1 object (cache lower bound)',()=>{const r=run({type:'preview',project:single,tolerance:.15});return {tri:r.triangles.length/3};});
// mesh object serialization
const sp=proj(1,'sphere');sp.objects[0].params.diameter=60;const r=run({type:'export',project:sp,tolerance:.005});
const mo=object('mesh',{mesh:{vertices:Array.from(r.vertices||[]),triangles:Array.from(r.triangles||[])}},[0,0,0],'stl');
const pm=blank();pm.objects.push(mo);
time(`structuredClone project w/ imported mesh (${(r.triangles?.length||0)/3} tris)`,()=>{structuredClone(pm)},10);
time('JSON.stringify same (undo snapshot/autosave)',()=>{JSON.stringify(pm)},10);
console.log('JSON bytes',JSON.stringify(pm).length);
const sph=run({type:'preview',project:sp,tolerance:.15});
time('JS prepareDisplayMesh on preview sphere '+sph.triangles.length/3+' tris',()=>{prepareDisplayMesh(sph.vertices,sph.triangles)},5);
console.log('preview result keys',Object.keys(sph).join(','),'displayPositions?',!!sph.displayPositions);
console.log('rss MB',(process.memoryUsage().rss/1e6).toFixed(0));
