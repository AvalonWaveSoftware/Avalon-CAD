// WS9 bench: BUNDLE_SPLIT off vs on, each built into a scratch tree (tests/perf/variant-build.mjs).
// Gated (ADR v2 WS9): main.js <= 690 KB (690,000 B). Reported: time-to-interactive (launch → first preview answered,
// window.__cad.model.engine.local) for a first Electron launch on a fresh profile (cold) and a second launch on the
// same profile (warm), and the browser ready time. Median of AVALON_WS9_RUNS (default 5). Needs AVALON_ELECTRON_LINUX.
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createRequire} from 'node:module';
import {buildVariant,removeVariant,ROOT} from './variant-build.mjs';
const require=createRequire(import.meta.url),pw=require(process.env.AVALON_PLAYWRIGHT||'playwright');
const RUNS=+(process.env.AVALON_WS9_RUNS||5),check=process.argv.includes('--check');
const med=a=>{const s=[...a].sort((x,y)=>x-y);return Math.round(s[s.length>>1]);};
async function launch(root,profile,seed){const t0=performance.now();
 const app=await pw._electron.launch({executablePath:process.env.AVALON_ELECTRON_LINUX,args:['--no-sandbox','--ozone-platform=x11','--no-zygote','--disable-dev-shm-usage',path.join(root,'tests/desktop-harness.cjs')],env:{...process.env,AVALON_TEST_FILES:profile,XDG_CONFIG_HOME:profile},timeout:60000});
 try{const page=await app.firstWindow();await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,{},{timeout:90000,polling:20});const ms=performance.now()-t0;
  if(seed){await page.evaluate(p=>window.__cad.load(JSON.parse(p)),seed);await page.waitForFunction(()=>(JSON.parse(localStorage.getItem('tristancad.autosave')||'{}').objects||[]).length>0,{},{timeout:30000});await page.waitForTimeout(300);}
  if(seed===undefined&&process.env.DEBUG)console.log(await page.evaluate(()=>window.__cad.project.objects.length),'objects');return ms;}finally{await app.close();}}
// A real warm launch reopens the autosaved project, whose first preview needs OCCT: seeded with a fixture.
const SEED=fs.readFileSync(path.join(ROOT,'tests/fixtures/'+(process.env.AVALON_WS9_FIXTURE||'simple-subtract.tcad')),'utf8');
async function measure(root){const cold=[],warm=[],project=[],browser=[];
 for(let i=0;i<RUNS;i++){const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ws9-profile-'));try{cold.push(await launch(root,profile));warm.push(await launch(root,profile));}finally{fs.rmSync(profile,{recursive:true,force:true});}
  const seeded=fs.mkdtempSync(path.join(os.tmpdir(),'ws9-profile-'));try{await launch(root,seeded,SEED);project.push(await launch(root,seeded));}finally{fs.rmSync(seeded,{recursive:true,force:true});}}
 process.env.AVALON_ASSETS=path.join(root,'app/assets');const H=await import(path.join(ROOT,'tools/readme-shots/harness.mjs')+'?'+path.basename(root)),env=await H.start();
 try{for(let i=0;i<RUNS;i++){const t0=performance.now(),page=await H.open(env,{desktop:true});browser.push(performance.now()-t0);await page.context().close();}}finally{await env.close();}
 return {mainJs:fs.statSync(path.join(root,'app/assets/main.js')).size,coldTTI:med(cold),warmTTI:med(warm),warmProjectTTI:med(project),browserReady:med(browser),runs:{cold:cold.map(Math.round),warm:warm.map(Math.round),project:project.map(Math.round)}};}
const res={loadStart:os.loadavg()[0].toFixed(2)},dirs={};
try{dirs.off=await buildVariant('ws9-off',s=>s.replace('BUNDLE_SPLIT=true','BUNDLE_SPLIT=false'));dirs.on=await buildVariant('ws9-on',s=>s);
 for(const v of ['off','on'])res[v]=await measure(dirs[v]);}finally{for(const d of Object.values(dirs))removeVariant(d);}
res.loadEnd=os.loadavg()[0].toFixed(2);
for(const [l,k] of [['main.js (B)','mainJs'],['desktop cold TTI (ms)','coldTTI'],['desktop warm TTI (ms)','warmTTI'],['  warm, saved project','warmProjectTTI'],['browser ready (ms)','browserReady']])console.log(l.padEnd(24),'off',String(res.off[k]).padStart(8),' on',String(res.on[k]).padStart(8));
console.log('warm vs cold (on):',(100*(1-res.on.warmTTI/res.on.coldTTI)).toFixed(1)+' % faster; warm on vs off:',(100*(1-res.on.warmTTI/res.off.warmTTI)).toFixed(1)+' % faster');
console.log(JSON.stringify(res));
// Read as 690 KiB since WS12, as in tests/startup-split.mjs (WS12 decision 4: 690,497 B accepted).
if(check){const ok=res.on.mainJs<=757760;console.log(ok?'WS9 PASS':'WS9 FAIL: main.js '+res.on.mainJs+' B > 757,760 B (740 KiB, ADR-0001 Q15)');if(!ok)process.exitCode=1;}
