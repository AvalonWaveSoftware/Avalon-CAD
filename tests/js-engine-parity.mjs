import {fileURLToPath} from 'node:url';
// WS7 parity: the JS job engine (web/js-engine.mjs) against the Python oracle (engine/python/model_jobs.py through
// Pyodide, options.oracle) on the same kernel: every result must be identical, typed arrays byte for byte, and every
// error message verbatim. Fixtures x all job kinds, error cases, and seeded random projects and booleans.
import assert from 'node:assert/strict';
import {BUNDLE_SPLIT} from '../web/perf-flags.mjs';import fs from 'node:fs';import {loadPyodide} from 'pyodide';
import {initKernel} from '../web/kernel.mjs';import {initLocalEngine} from '../web/local-engine.mjs';import {object,defaults,blank,advancedDefaults,glyphDefaults} from '../web/templates.mjs';import {loadGlyphs} from '../web/glyph-geometry.mjs';await loadGlyphs();
import {migrateProject} from '../web/migrate.mjs';import {hollowGuard} from '../web/shell-rules.mjs';import {JS_ENGINE} from '../web/perf-flags.mjs';
const K=await initKernel(),opts={loadPyodide,pythonURL:fileURLToPath(new URL('../node_modules/pyodide/',import.meta.url)),pythonSource:fs.readFileSync('engine/python/model_jobs.py','utf8'),rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}};
const js=await initLocalEngine(K,opts),py=await initLocalEngine(K,{...opts,oracle:true});
assert.equal(js.python===null,JS_ENGINE);assert.ok(py.python);assert.deepEqual(js.info,py.info);
let id=0,jobs=0,errors=0;
const norm=v=>{if(ArrayBuffer.isView(v))return {bytes:Buffer.from(v.buffer,v.byteOffset,v.byteLength).toString('base64'),kind:v.constructor.name};if(v instanceof ArrayBuffer||Object.prototype.toString.call(v)==='[object ArrayBuffer]')return {ab:Buffer.from(v).toString('base64')};
 if(Array.isArray(v))return v.map(norm);if(v&&typeof v==='object'){const o={};for(const k of Object.keys(v).sort())o[k]=norm(v[k]);return o;}return v;};
function same(job,what){const a=js.process({...structuredClone(job),id:++id}),b=py.process({...structuredClone(job),id});
 assert.deepEqual(norm(a),norm(b),what);jobs++;if(a.error)errors++;return a;}
const fixtures=fs.readdirSync('tests/fixtures').filter(f=>f.endsWith('.tcad')).map(f=>[f,migrateProject(JSON.parse(fs.readFileSync('tests/fixtures/'+f,'utf8')),[])]);
for(const [f,p] of fixtures)for(const plane of [false,true]){const q={...p,buildPlaneEnabled:plane};
 for(const type of ['preview','check','export',...(BUNDLE_SPLIT?[]:['conjoin'])])same({type,project:q,tolerance:.15,ground:plane},f+' '+type);
 // WS9: with BUNDLE_SPLIT the JS engine drops the dead conjoin job (the Python oracle still has it).
 if(BUNDLE_SPLIT){const r=js.process({type:'conjoin',project:q,tolerance:.15,ground:plane,id:++id});assert.equal(r.error,'Unsupported geometry command.',f+' conjoin');}
 same({type:'groundProject',project:q},f+' ground');}
// ADR-0001 F2a: 3MF export through both job engines (the format field reaches finish_result in each).
for(const [f,p] of fixtures)for(const plane of [false,true])same({type:'export',project:{...p,buildPlaneEnabled:plane},tolerance:.15,ground:plane,format:'3mf'},f+' 3mf');
// Error cases: messages must be verbatim.
const box=object('box',structuredClone(defaults.box),[0,0,0]),cyl=object('cylinder',structuredClone(defaults.cylinder),[10,0,0]),cut=object('cylinder',{diameter:6,h:40},[0,0,0]);cut.mode='cut';
const P=objs=>({...blank(),objects:objs});
for(const [what,job] of Object.entries({
 'unsupported':{type:'nope'},'no type':{},
 'bad format':{type:'preview',project:{...P([box]),format:'x'}},'bad export format':{type:'export',project:P([box]),format:'obj'},'stl export format':{type:'export',project:P([box]),format:'stl'},'bad version':{type:'check',project:{...P([box]),version:3}},
 'too many':{type:'check',project:P(Array.from({length:101},(_,i)=>({...box,id:'b'+i})))},
 'bad type':{type:'check',project:P([{...box,type:'blob'}])},'dup id':{type:'check',project:P([box,{...box}])},'num id':{type:'check',project:P([{...box,id:7}])},
 'bad coords':{type:'check',project:P([{...box,position:[0,0,1e6]}])},'nan coords':{type:'check',project:P([{...box,rotation:[0,NaN,0]}])},'short coords':{type:'check',project:P([{...box,position:[0,0]}])},
 'bad layer':{type:'check',project:{...P([{...box,layerId:'zz'}])}},'only cuts':{type:'preview',project:P([cut])},'empty':{type:'preview',project:P([])},
 'bool subtract':{type:'boolean',objects:[box,cyl],operation:'subtract'},'bool one':{type:'boolean',objects:[box],operation:'add'},'bool none':{type:'boolean',objects:[],operation:'add'},
 'bool ok':{type:'boolean',objects:[box,cyl],operation:'add'},'bool cut':{type:'boolean',objects:[box,cyl],cutouts:[cut],operation:'add'},'bool fill':{type:'boolean',objects:[box,cyl],cutouts:[cut],operation:'add',fillOverlaps:true},
 'bool one+cut':{type:'boolean',objects:[box],cutouts:[cut],operation:'add'},'bool all cut':{type:'boolean',objects:[{...cut,mode:'solid',id:'s'}],cutouts:[{...cut,id:'c2',params:{diameter:20,h:60}}],operation:'add'},
 'bool layers':{type:'boolean',objects:[box,{...cyl,layerId:'layer-2'}],operation:'add'},
 'place':{type:'place',object:box,position:[5,6,7],floor:true},'place bad':{type:'place',object:box,position:[0,0,NaN],floor:false},'place short':{type:'place',object:box,position:[1,2]},
}))same(job,what);
// Seeded random projects (layers, cuts, exclusions, build plane, disabled) through every kind.
let seed=7;const rnd=()=>((seed=Math.imul(seed^seed>>>15,0x2c1b3c6d)+0x6d2b79f5>>>0)/4294967296),pick=a=>a[Math.floor(rnd()*a.length)],num=(a,b)=>Math.round((a+rnd()*(b-a))*4)/4;
// ADR new-primitives-polyhedra-text: the eight new object types join the random scenes.
const TYPES=['box','cylinder','sphere','wedge','cone','rounded','tube','pyramid','torus','triprism','tetrahedron','octahedron','decahedron','dodecahedron','icosahedron','glyph'],ALL={...defaults,...advancedDefaults,...glyphDefaults};
const N=+(process.env.AVALON_JS_PARITY_PROJECTS||150);
for(let n=0;n<N;n++){const p=blank();p.layers.push({id:'layer-2',name:'Layer 2'});p.buildPlaneEnabled=rnd()<.4;
 for(let i=0,c=1+Math.floor(rnd()*6);i<c;i++){const t=pick(TYPES),o=object(t,structuredClone(ALL[t]),[num(-20,20),num(-20,20),num(-8,10)]);o.rotation=[num(0,90),0,num(0,180)];if(rnd()<.3)o.mode='cut';if(rnd()<.3)o.layerId='layer-2';if(rnd()<.1)o.enabled=false;p.objects.push(o);}
 const c=p.objects.find(o=>o.mode==='cut'),s=p.objects.find(o=>o.mode!=='cut');if(c&&s&&rnd()<.5)s.excludedCutouts=[c.id];
 const tol=pick([.15,.05]);for(const type of ['preview','check','export'])same({type,project:p,tolerance:tol,ground:rnd()<.5},'random '+n+' '+type);
 const solids=p.objects.filter(o=>o.mode!=='cut'&&o.layerId==='layer-1'),cuts=p.objects.filter(o=>o.mode==='cut'&&o.layerId==='layer-1');
 if(solids.length)same({type:'boolean',objects:solids,cutouts:cuts,operation:'add',fillOverlaps:rnd()<.5,tolerance:tol},'random boolean '+n);
}
// ADR-0001 F6: chamfer and mixed round + chamfer objects (format v3) through every job kind, and the chamfer error verbatim.
{const b=object('box',{w:30,d:20,h:10},[0,0,5]),c=object('cylinder',structuredClone(defaults.cylinder),[25,0,10]),h=object('cylinder',{diameter:6,h:40},[0,0,0]);h.mode='cut';
 b.fillets=[{edges:[0],radius:2},{edges:[1,2],radius:1,kind:'chamfer'}];c.fillets=[{edges:[0],radius:1.5,kind:'chamfer'}];const p={...P([b,c,h]),version:3};
 for(const type of ['preview','check','export'])for(const plane of [false,true])same({type,project:{...p,buildPlaneEnabled:plane},tolerance:.15,ground:plane},'chamfer '+type);
 same({type:'boolean',objects:[b,c],cutouts:[h],operation:'add',tolerance:.15},'chamfer boolean');same({type:'place',object:b,position:[5,6,7],floor:true},'chamfer place');
 const bad={...P([{...b,fillets:[{edges:[0,1],radius:40,kind:'chamfer'}]}]),version:3},r=same({type:'check',project:bad,tolerance:.15},'impossible chamfer');assert.match(r.error,/That chamfer is too large/);}
// ADR-0001 F7: glyph finish (Emboss plate, Engrave) through every job kind.
{const G=(char,x,pos)=>object('glyph',{...glyphDefaults.glyph,char,...x},pos),e=G('A',{plate:2,plateMargin:1.5},[0,0,4]),n=G('o',{depth:1,plate:2,plateMargin:1,engrave:true},[30,0,1]),f=G('T',{plate:1.5},[0,30,3]);
 const p={...P([e,n,f]),version:3};for(const type of ['preview','check','export'])same({type,project:p,tolerance:.15,ground:true},'glyph finish '+type);
 same({type:'boolean',objects:[e,f],cutouts:[],operation:'add',tolerance:.15},'glyph finish boolean');}
// ADR-0001 F8: hollow closed boxes and extrusions (Manifold-built in makeObject, shared by both job engines) through
// every job kind, a hollow in a boolean, and the hollow errors verbatim (rule and guard).
{const b=object('box',{w:30,d:20,h:10},[0,0,5]),s=object('polygon',{points:[[0,0],[30,0],[30,20],[10,25],[0,20]],h:10},[40,0,5]),g=object('glyph',{...glyphDefaults.glyph,char:'O'},[0,40,2.5]);
 b.shell={thickness:2};s.shell={thickness:1.5};g.shell={thickness:.8};const p={...P([b,s,g]),version:3};
 for(const type of ['preview','check','export'])for(const plane of [false,true])same({type,project:{...p,buildPlaneEnabled:plane},tolerance:.15,ground:plane},'hollow '+type);
 same({type:'boolean',objects:[b,s],operation:'add',tolerance:.15},'hollow boolean');same({type:'place',object:b,position:[5,6,7],floor:true},'hollow place');
 for(const [what,o] of [['hollow too thick',{...b,shell:{thickness:6}}],['hollow glyph empty',{...g,shell:{thickness:2}}]]){const r=same({type:'check',project:{...P([o]),version:3},tolerance:.15},what);assert.ok(r.error,what);}
 // batch-3.0 (Architect 11:18 CT): box 30×20×6 @2 (inner 26×16×2) is a valid hollow, accepted by both engines.
 {const r=same({type:'check',project:{...P([{...b,params:{w:30,d:20,h:6}}]),version:3},tolerance:.15},'hollow 30×20×6 @2');assert.ok(!r.error,'hollow 30×20×6 @2: '+r.error);}
 // The guard itself, on made-up measurements (outer V 1000 mm³, area 600 mm², bounds ±5; wall 1 mm so the cap is 600 mm³).
 {const out={volume:1000,area:600,box:[-5,-5,-5,5,5,5]},ok={volume:400,box:[-5,-5,-5,5,5,5]};assert.equal(hollowGuard(out,ok,1),true,'guard accepts a plausible hollow');
  assert.equal(hollowGuard(out,{...ok,volume:1000},1),false,'guard: no material removed (v = V)');assert.equal(hollowGuard(out,{...ok,volume:1200},1),false,'guard: v > V');assert.equal(hollowGuard(out,{...ok,volume:995},1),false,'guard: cavity under 1 % (empty hollow)');
  assert.equal(hollowGuard(out,{...ok,box:[-5,-5,-5,5,5,5.1]},1),false,'guard: bounds changed');assert.equal(hollowGuard(out,{...ok,volume:700},1),false,'guard: wall volume above wall × area');
  assert.equal(hollowGuard(out,{...ok,volume:0},1),false,'guard: empty result');}}
console.log(`JS engine parity: ${jobs} jobs identical to the Python oracle (${errors} verbatim error messages)`);js.destroy();py.destroy();
