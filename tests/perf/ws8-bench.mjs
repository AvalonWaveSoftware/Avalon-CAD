// WS8 startup bench (ADR v2). Needs the staged desktop app (node desktop/stage.mjs), AVALON_ELECTRON_LINUX and
// AVALON_PLAYWRIGHT. For each of RUNS fresh profiles: a first Electron launch (empty HTTP/code cache) and a second
// launch on the same profile; ready = launch → window.__cad.model.engine.local. Also the browser ready time
// (tools/readme-shots harness, fresh context; the static server sends no-store, so no code cache there).
//   node tests/perf/ws8-bench.mjs [--check]   (ADR: desktop cold ≤2000 ms gated; second launch ≥30 % reported only, deferred to after WS9)
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),pw=require(process.env.AVALON_PLAYWRIGHT||'playwright');
const RUNS=+(process.env.AVALON_WS8_RUNS||3),check=process.argv.includes('--check');
const med=a=>{const s=[...a].sort((x,y)=>x-y);return s[s.length>>1];};
async function launch(profile){const t0=performance.now();
 const app=await pw._electron.launch({executablePath:process.env.AVALON_ELECTRON_LINUX,args:['--no-sandbox','--ozone-platform=x11','--no-zygote','--disable-dev-shm-usage',path.resolve('tests/desktop-harness.cjs')],env:{...process.env,AVALON_TEST_FILES:profile,XDG_CONFIG_HOME:profile},timeout:60000});
 try{const page=await app.firstWindow();await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,{},{timeout:90000,polling:20});
  const ms=performance.now()-t0,worker=await page.evaluate(()=>performance.getEntriesByType('resource').filter(r=>/\.(wasm|js)/.test(r.name)).map(r=>r.name.split('/').pop()+':'+Math.round(r.responseEnd-r.startTime)).join(' '));return {ms,worker};}
 finally{await app.close();}}
const first=[],second=[];
for(let i=0;i<RUNS;i++){const profile=fs.mkdtempSync(path.join(os.tmpdir(),'ws8-profile-'));
 try{const a=await launch(profile),b=await launch(profile);first.push(a.ms);second.push(b.ms);if(process.env.DEBUG)console.log(a.worker,'|',b.worker);}
 finally{fs.rmSync(profile,{recursive:true,force:true});}}
let browser=[];{const H=await import(process.cwd()+'/tools/readme-shots/harness.mjs'),env=await H.start();
 try{for(let i=0;i<RUNS;i++){const t0=performance.now(),page=await H.open(env,{desktop:true});browser.push(performance.now()-t0);await page.context().close();}}finally{await env.close();}}
const out={load:os.loadavg()[0].toFixed(2),desktopColdMs:Math.round(med(first)),desktopSecondMs:Math.round(med(second)),secondFaster:+(1-med(second)/med(first)).toFixed(3),browserReadyMs:Math.round(med(browser)),runs:{first:first.map(Math.round),second:second.map(Math.round),browser:browser.map(Math.round)}};
console.log(JSON.stringify(out));
if(check){const bad=[];if(out.desktopColdMs>2000)bad.push('desktop cold '+out.desktopColdMs+' ms > 2000');// Architect ruling (WS8, options 1+2): the ≥30 % second-launch target moves to after WS9; reported, not gated.
 if(out.secondFaster<.3)console.log('note: second launch '+(out.secondFaster*100).toFixed(1)+' % faster (target ≥30 % deferred to after WS9)');
 if(bad.length){console.log('WS8 FAIL: '+bad.join('; '));process.exit(1);}console.log('WS8 PASS');}
