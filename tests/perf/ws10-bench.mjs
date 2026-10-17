// WS10 bench (ADR v2 WS10 + Architect rulings of 2026-10-16 18:00 / 19:01):
//  1. weld: prepare_mesh of this wasm (FxHash) is byte-identical to the WS9 wasm (std SipHash) on a mesh corpus, and
//     prepare_indexed expanded through its index is byte-identical to prepare_mesh;
//  2. worker time (Node, median of 7 moves): the 12-edge fillet box at tolerance 0.005 (reported against ADR section 4 <= 30 ms and the <= 20 ms WS6 estimate, moved here
//     from WS6; gated only against a regression over 10 %, see perf-ws10.md) and one move among 100 distinct objects;
//     preview message bytes at 100 objects;
//  3. browser (pinned Chromium, SwiftShader): bytes handed to WebGL for the display mesh per one-object move at 100
//     objects (budget <= 1.2 MB) and the display mesh's GPU bytes.
// off = INDEXED_DISPLAY=false (web/ copy for Node, scratch build for the browser), on = as shipped.
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const R=fileURLToPath(new URL('../../',import.meta.url)),mode=process.argv[2];
const median=a=>{a=[...a].sort((x,y)=>x-y);return +a[a.length>>1].toFixed(1);};
const distinct=(T,n)=>{const p=T.blank();p.buildPlaneEnabled=true;const types=['box','cylinder','sphere','tube','cone'];const D={box:{w:30,d:30,h:15},cylinder:{diameter:20,h:20},sphere:{diameter:25},tube:{diameter:25,inner:18,h:20},cone:{diameter:25,top:8,h:25}};
 for(let i=0;i<n;i++){const t=types[i%5];const q={...D[t]};q.h=(q.h||10)+i*.1;if(t==='sphere')q.diameter+=i*.1;p.objects.push({id:'o'+i,name:t+i,type:t,params:q,position:[(i%10)*35,Math.floor(i/10)*35,0],rotation:[0,0,0],mode:'solid',enabled:true,layerId:p.activeLayer});}return p;};
if(mode==='--node'){// child: one variant's worker numbers
 const W=process.argv[3];const {initKernel}=await import(W+'kernel.mjs');const {initLocalEngine}=await import(W+'local-engine.mjs');const T=await import(W+'templates.mjs');
 const K=await initKernel(),rt=await initLocalEngine(K,{rust:{binary:fs.readFileSync(R+'app/assets/mesh-core.wasm')}});
 let id=0;const time=d=>{const t=performance.now(),r=rt.process({id:++id,...d});if(r.error)throw Error(r.error);return [performance.now()-t,r];};
 const p=T.blank(),o=T.object('box',{w:30,d:30,h:15},[0,0,7.5]);o.fillets=[{edges:[0,1,2,3,4,5,6,7,8,9,10,11],radius:2}];o.resolution={mode:'tolerance',tolerance:.005};p.objects.push(o);
 time({type:'preview',project:p,tolerance:.15});const fm=[];for(let k=0;k<7;k++){o.position=[o.position[0]+1,0,7.5];fm.push(time({type:'preview',project:p,tolerance:.15})[0]);}
 const q=distinct(T,100);time({type:'preview',project:q,tolerance:.15});const mm=[];let bytes=0;
 for(let k=0;k<7;k++){q.objects[0].position[0]+=1;const [t,r]=time({type:'preview',project:q,tolerance:.15});mm.push(t);bytes=0;for(const key of ['vertices','triangles','flatTriangles','smoothingGroups','displayPositions','displayNormals','displayIndex'])if(ArrayBuffer.isView(r[key]))bytes+=r[key].byteLength;}
 rt.destroy();console.log(JSON.stringify({filletMove:median(fm),move100:median(mm),previewBytes100:bytes}));process.exit(0);}
const load=()=>os.loadavg()[0].toFixed(2),loadStart=load();
// 1. weld identity
const {initRustMesh}=await import(R+'web/rust-mesh.mjs');
let oldWasm=null;try{oldWasm=execFileSync('git',['-C',R,'show','a06e5eb:app/assets/mesh-core.wasm'],{maxBuffer:1<<24});}catch{}
const fresh=await initRustMesh({binary:fs.readFileSync(R+'app/assets/mesh-core.wasm')}),old=oldWasm&&await initRustMesh({binary:oldWasm});
const {initKernel}=await import(R+'web/kernel.mjs');const {initLocalEngine}=await import(R+'web/local-engine.mjs');const T=await import(R+'web/templates.mjs');
const K=await initKernel(),rt=await initLocalEngine(K,{rust:{binary:fs.readFileSync(R+'app/assets/mesh-core.wasm')}});
const eq=(a,b)=>Buffer.from(a.buffer,a.byteOffset,a.byteLength).equals(Buffer.from(b.buffer,b.byteOffset,b.byteLength));
const corpus=[];const add=p=>{const r=rt.process({id:corpus.length+1,type:'preview',project:p,tolerance:.15});if(r.error)throw Error(r.error);corpus.push(r);};
{const p=T.blank(),o=T.object('box',{w:30,d:30,h:15},[0,0,7.5]);o.fillets=[{edges:[0,1,2,3,4,5,6,7,8,9,10,11],radius:2}];o.resolution={mode:'tolerance',tolerance:.005};p.objects.push(o);add(p);}
add(distinct(T,100));for(const t of ['threadrod','threadtube']){const p=T.blank();p.objects.push(T.object(t,T.defaults[t]));add(p);}
const {migrateProject}=await import(R+'web/migrate.mjs');let skipped=0;
for(const f of fs.readdirSync(R+'tests/fixtures').filter(f=>f.endsWith('.tcad')))try{add(migrateProject(JSON.parse(fs.readFileSync(R+'tests/fixtures/'+f,'utf8'))));}catch{skipped++;}
let weld=true,expand=true,corners=0,unique=0;
for(const m of corpus){const b=fresh.prepare(m.vertices,m.triangles,m.flatTriangles,m.smoothingGroups);
 if(old){const a=old.prepare(m.vertices,m.triangles,m.flatTriangles,m.smoothingGroups);weld&&=eq(a.positions,b.positions)&&eq(a.normals,b.normals);}
 const c=fresh.prepareIndexed(m.vertices,m.triangles,m.flatTriangles,m.smoothingGroups),n=c.index.length,P=new Float32Array(n*3),N=new Float32Array(n*3);
 for(let i=0;i<n;i++)for(let k=0;k<3;k++){P[i*3+k]=c.positions[c.index[i]*3+k];N[i*3+k]=c.normals[c.index[i]*3+k];}expand&&=eq(P,b.positions)&&eq(N,b.normals);corners+=n;unique+=c.positions.length/3;}
rt.destroy();
console.log('weld (FxHash) vs WS9 wasm, '+corpus.length+' meshes ('+skipped+' fixtures rejected by the engine):',old?(weld?'byte-identical PASS':'DIFFERENT FAIL'):'skipped (no git)');
console.log('indexed expands to prepare_mesh:',expand?'byte-identical PASS':'FAIL',`(${unique} vertices for ${corners} corners)`);
// 2. worker numbers per variant
const res={};
for(const [v,flag] of [['off','false'],['on','true']]){const dir=R+`tests/perf/.variant-ws10-${v}/`;fs.rmSync(dir,{recursive:true,force:true});fs.cpSync(R+'web',dir+'web',{recursive:true});
 const f=dir+'web/perf-flags.mjs';fs.writeFileSync(f,fs.readFileSync(f,'utf8').replace('INDEXED_DISPLAY=true','INDEXED_DISPLAY='+flag));
 try{res[v]=JSON.parse(execFileSync(process.execPath,[fileURLToPath(import.meta.url),'--node',dir+'web/'],{encoding:'utf8',maxBuffer:1<<26}).trim().split('\n').pop());}finally{fs.rmSync(dir,{recursive:true,force:true});}}
// 3. browser uploads
const {buildVariant,removeVariant}=await import('./variant-build.mjs');
const offDir=await buildVariant('ws10-off',s=>s.replace('INDEXED_DISPLAY=true','INDEXED_DISPLAY=false'));
try{const http=await import('node:http');const {createRequire}=await import('node:module');const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT||'playwright');
 const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
 try{for(const [v,assets] of [['off',path.join(offDir,'app/assets')],['on',path.join(R,'app/assets')]]){
  const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!f.startsWith(assets+path.sep)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
  await new Promise(r=>server.listen(0,'127.0.0.1',r));const ctx=await browser.newContext({viewport:{width:1440,height:900},serviceWorkers:'block'});
  try{const page=await ctx.newPage();page.setDefaultTimeout(180000);await page.goto('http://127.0.0.1:'+server.address().port+'/');await page.waitForFunction(()=>window.__cad?.model);
   await page.evaluate(src=>{window.__cad.load((new Function('T','return ('+src+')(T,100)'))(window.__cad.templates));},distinct.toString());
   await page.waitForFunction(()=>window.__cad.model?.parts?.length===100,null,{timeout:180000});const per=[];
   for(let k=0;k<5;k++)per.push(await page.evaluate(async()=>{const p=structuredClone(window.__cad.project);p.objects[0].position[0]+=1;const before=window.__cad.model,u=window.__cad.uploads;window.__cad.load(p);
    await new Promise(r=>{const c=()=>window.__cad.model!==before?r():setTimeout(c,1);c();});await new Promise(r=>requestAnimationFrame(()=>r()));return window.__cad.uploads-u;}));
   const gpu=await page.evaluate(()=>{const g=window.__cad.display.geometry;let b=0;for(const k in g.attributes)b+=g.attributes[k].array.byteLength;if(g.index)b+=g.index.array.byteLength;return b;});
   Object.assign(res[v],{upload100:median(per),gpuBytes100:gpu});}finally{await ctx.close();server.close();}}}
 finally{await browser.close();}}finally{removeVariant(offDir);}
const MB=x=>+(x/1048576).toFixed(3);let ok=weld&&expand&&!!old;
const row=(label,k,budget,fmt=x=>x)=>{const pass=budget==null||res.on[k]<=budget;if(budget!=null)ok&&=pass;console.log(label.padEnd(44),'off',String(fmt(res.off[k])).padStart(10),' on',String(fmt(res.on[k])).padStart(10),budget==null?'':`budget <= ${fmt(budget)} ${pass?'PASS':'FAIL'}`);};
row('fillet move, tol 0.005 (ms)','filletMove');{const r=res.on.filletMove/res.off.filletMove;const pass=r<=1.1;ok&&=pass;
 console.log(''.padEnd(44),`(reported: ADR section 4 <= 30 ms / WS6 estimate <= 20 ms ${res.on.filletMove<=20?'met':res.on.filletMove<=30?'<=30 met':'not met'}; gated: no regression over 10 % vs off ${pass?'PASS':'FAIL'})`);}row('move, 100 objects (ms)','move100');row('preview message, 100 objects (MB)','previewBytes100',null,MB);
row('WebGL upload per move, 100 objects (MB)','upload100',1.2*1048576,MB);row('display GPU bytes, 100 objects (MB)','gpuBytes100',null,MB);
console.log(JSON.stringify({loadStart,loadEnd:load(),...res}));console.log(ok?'WS10 PASS':'WS10 FAIL');if(!ok)process.exitCode=1;
