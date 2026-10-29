// ADR-0001 F2a option B: desktop end-to-end export bench (not a gate). Real Electron window on the staged app
// (run `node desktop/stage.mjs` first); tests/desktop-harness.cjs answers the save dialog, so pickerMs is 0.
// Opens a project (default: the 524k sphere sample) and reads each export's [Avalon export] line.
// Cold = a fresh app launch per export (formats interleaved); warm = more exports of each format, alternating, in one session.
// Usage: xvfb-run -a node tests/perf/export-e2e-bench.mjs [both|stl|3mf] [cold=5] [warm=5] [project.tcad]
// Env: AVALON_PLAYWRIGHT (playwright module path), AVALON_ELECTRON_LINUX (electron binary).
import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{_electron:electron}=require(process.env.AVALON_PLAYWRIGHT||'playwright');
const fmts=process.argv[2]==='3mf'||process.argv[2]==='stl'?[process.argv[2]]:['stl','3mf'],cold=+process.argv[3]||5,warm=+(process.argv[4]??5);
const source=process.argv[5]||'/workspace/avalon-cad-artifacts/export-3mf/samples/sphere-524k.tcad';
const work=await fs.mkdtemp(path.join(os.tmpdir(),'avalon-e2e-')),root=path.join(work,'files');await fs.mkdir(root);
const project=path.join(root,path.basename(source));await fs.copyFile(source,project);
const out={cold:[],warm:[]};
for(let run=0;run<cold;run++)for(const fmt of fmts){
 const app=await electron.launch({executablePath:process.env.AVALON_ELECTRON_LINUX,args:['--no-sandbox','--ozone-platform=x11','--no-zygote','--disable-dev-shm-usage',path.resolve('tests/desktop-harness.cjs')],env:{...process.env,AVALON_TEST_FILES:root,XDG_CONFIG_HOME:path.join(work,'profile'+run+fmt)},timeout:60000});
 try{const page=await app.firstWindow();await page.waitForFunction(()=>window.__cad?.model?.engine?.local,{},{timeout:60000});
  await app.evaluate(({dialog},f)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[f]});},project);
  const before=await page.evaluate(()=>window.__cad.project.name);
  await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.send('avalon:action','open'));
  await page.locator('#replaceCurrent').click({timeout:60000}).catch(()=>{});
  await page.waitForFunction(b=>window.__cad.project.name!==b&&window.__cad.model?.volume>0,before,{timeout:300000});await page.waitForTimeout(2000);
  const once=async f=>{await page.evaluate(()=>{window.__avalonExport=null;});await page.locator('#exportBtn').click();await page.locator('#exportFormat').selectOption(f);await page.waitForTimeout(300);
   await page.locator('#downloadSTL').click();const line=await page.waitForFunction(()=>window.__avalonExport,null,{timeout:300000}).then(h=>h.jsonValue());await page.locator('#closeSheet').click();await page.waitForTimeout(500);return line;};
  out.cold.push(await once(fmt));if(run===0&&fmt===fmts.at(-1))for(let i=0;i<warm;i++)for(const f of fmts)out.warm.push(await once(f));
 }finally{await app.close();}}
const med=a=>{const s=[...a].sort((x,y)=>x-y);return s[s.length>>1];};
for(const fmt of fmts)for(const k of ['cold','warm']){const L=out[k].filter(l=>l.fmt===fmt);if(L.length)console.log(fmt,k,'n='+L.length,'median totalMs',med(L.map(l=>l.totalMs)),'encodeMs',med(L.map(l=>l.encodeMs)),'saveMs',med(L.map(l=>l.saveMs)),'writeMs',med(L.map(l=>l.writeMs)),'| all',L.map(l=>l.totalMs).join(','));}
for(const l of [...out.cold.slice(0,2),...out.warm.slice(-2)])console.log('[Avalon export] '+JSON.stringify(l));
console.log('load',os.loadavg().map(x=>x.toFixed(1)).join(' '));
await fs.rm(work,{recursive:true,force:true});
