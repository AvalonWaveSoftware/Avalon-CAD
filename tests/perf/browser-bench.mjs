// Real-Chromium (SwiftShader) bench of the bundled app. Run from repo root:
//   npm install --no-save playwright && node tests/perf/browser-bench.mjs
import {execSync} from 'node:child_process';
const H=await import(process.cwd()+'/tools/readme-shots/harness.mjs');
const env=await H.start();const out={};
const t0=Date.now();const page=await H.open(env,{desktop:true});out.readyMs=Date.now()-t0;
const cdp=await page.context().newCDPSession(page);await cdp.send('Performance.enable');
const metrics=async()=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
out.resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(r=>({n:r.name.split('/').pop(),kb:Math.round(r.transferSize/1024),start:Math.round(r.startTime),end:Math.round(r.responseEnd)})));
out.nav=await page.evaluate(()=>{const n=performance.getEntriesByType('navigation')[0];return {dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd)};});
await H.idle(page);
// idle main-thread cost
let a=await metrics();await page.waitForTimeout(5000);let b=await metrics();
out.idle5s={taskMs:Math.round((b.TaskDuration-a.TaskDuration)*1000),scriptMs:Math.round((b.ScriptDuration-a.ScriptDuration)*1000),frames:await page.evaluate(()=>new Promise(r=>{let n=0;const s=performance.now();const f=()=>{n++;if(performance.now()-s<1000)requestAnimationFrame(f);else r(n)};requestAnimationFrame(f);}))};
// edit loop with N distinct objects
for(const n of [10,30,100]){
 await page.evaluate(n=>{const T=window.__cad.templates;const p=T.blank();p.buildPlaneEnabled=true;const types=['box','cylinder','sphere','tube','cone'];const D={box:{w:30,d:30,h:15},cylinder:{diameter:20,h:20},sphere:{diameter:25},tube:{diameter:25,inner:18,h:20},cone:{diameter:25,top:8,h:25}};
  for(let i=0;i<n;i++){const t=types[i%5];const q={...D[t]};q.h=(q.h||10)+i*.1;if(t==='sphere')q.diameter+=i*.1;p.objects.push({id:'o'+i,name:t+i,type:t,params:q,position:[(i%10)*35,Math.floor(i/10)*35,0],rotation:[0,0,0],mode:'solid',enabled:true,layerId:p.activeLayer});}
  window.__cad.load(p);},n);
 await page.waitForFunction(n=>window.__cad.model?.parts?.length===n,n,{timeout:120000});await H.idle(page);
 const res=[];for(let k=0;k<3;k++){const m0=await metrics();const ms=await page.evaluate(async()=>{const p=structuredClone(window.__cad.project);p.objects[0].position[0]+=1;const before=window.__cad.model;const s=performance.now();window.__cad.load(p);await new Promise(r=>{const c=()=>window.__cad.model!==before?r():setTimeout(c,1);c();});return performance.now()-s;});const m1=await metrics();res.push({e2eMs:Math.round(ms),mainTaskMs:Math.round((m1.TaskDuration-m0.TaskDuration)*1000)});}
 const gpu=await page.evaluate(()=>{const g=window.__cad.display?.geometry;let bytes=0,tris=0;if(g){for(const k in g.attributes)bytes+=g.attributes[k].array.byteLength;tris=g.attributes.position.count/3;}let pick=0;for(const o of []);return {displayTris:tris,displayBytes:bytes};});
 out['edit_n'+n]={runs:res,...gpu,jsHeapMB:Math.round((await metrics()).JSHeapUsedSize/1e6)};
}
out.procMB=execSync("ps -eo rss,args | grep -i 'chrom' | grep -v grep | awk '{s+=$1} END {print int(s/1024)}'").toString().trim();
out.procTop=execSync("ps -eo rss,args --sort=-rss | grep -i chrom | grep -v grep | head -4 | awk '{print int($1/1024)\"MB\", ($0 ~ /type=renderer/?\"renderer\":($0 ~ /type=gpu/?\"gpu\":\"other\"))}'").toString().trim().split('\n');
console.log(JSON.stringify(out,null,1));await env.close();
