// ADR unified-desktop-layout: one look on every platform.
//   node tests/platform-parity.mjs --staged   staged-output check only (fast, no browser; part of test:desktop)
//   node tests/platform-parity.mjs            + browser layout check (ruling 5) and the help-line overlap sweep
// 1. Staged output: the Mac stage (stageDesktop) and the RPM stage (cp -r app/assets, as build-rpm.sh) are byte-identical
//    to app/assets; plain <body>, one stylesheet; no desktop-only CSS hooks anywhere.
// 2. Layout (1024x688, mouse, no touch): Mac-staged (AvalonDesktop mac stub), RPM-staged (linux stub) and web; boxes of
//    header, toolbar, mode strip, selection bar, dock, sheet, Objects toggle/panel and help line within +-2 px, whole
//    screen <= 0.5 % differing pixels. Scenes: blank, a selected box, Objects panel open, Add sheet open.
// 3. Phone 412x915 touch: the help line is not displayed.
// 4. Sweep: widths 320..1920 (and heights 480/688/900), panel closed and open: the help line is either hidden or
//    entirely inside the viewport and overlapping no viewport control; at 1024x688 it is shown in both states, 18 px
//    right of the toggle (or panel) and vertically centred on the toggle.
// 5. ADR-0001 sidecar-apply-perf: the desktop app (Mac/RPM stage + AvalonDesktop) opens sheets with no animation (2.7.2
//    behaviour); web (mouse 1024x688 and phone 412x915) keeps the 180 ms rise animation.
// 6. Sheet jump fix (approved by Master Chief): at 700 and 1440 px wide the web sheet stays horizontally centred (<= 1 px)
//    through its slide-up (paused at 0..100 %); at phone width it keeps the full-width rise.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import os from 'node:os';import {createRequire} from 'node:module';
import {stageDesktop} from '../desktop/stage.mjs';import {diffPixels} from './perf/png.mjs';
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..'),ASSETS=path.join(ROOT,'app/assets');
const files=d=>fs.readdirSync(d,{recursive:true}).filter(f=>fs.statSync(path.join(d,f)).isFile()).sort();
// 1. staged output
const mac=path.join(stageDesktop(ROOT),'web'),rpm=fs.mkdtempSync(path.join(os.tmpdir(),'avalon-rpm-'))+'/web';fs.cpSync(ASSETS,rpm,{recursive:true});
for(const [name,dir] of [['Mac stage',mac],['RPM stage',rpm]]){assert.deepEqual(files(dir),files(ASSETS),name+' has exactly the app/assets files');for(const f of files(ASSETS))assert.ok(fs.readFileSync(path.join(dir,f)).equals(fs.readFileSync(path.join(ASSETS,f))),name+' '+f+' byte-identical');}
const html=fs.readFileSync(path.join(ASSETS,'index.html'),'utf8');assert.ok(html.includes('<body>'),'plain <body>');assert.equal((html.match(/rel="stylesheet"/g)||[]).length,1);assert.match(html,/href="style\.css\?v=/);
assert.equal(files(ASSETS).filter(f=>f.endsWith('.css')).join(),'style.css','one stylesheet');assert.ok(!fs.existsSync(path.join(ROOT,'desktop/desktop.css')),'desktop/desktop.css is gone');
const css=fs.readFileSync(path.join(ASSETS,'style.css'),'utf8');for(const hook of ['.desktop','body.desktop',':not(.desktop)','[data-platform','AvalonDesktop'])assert.ok(!css.includes(hook),'no '+hook+' in CSS');
for(const f of ['web/main.mjs','app/assets/main.js']){const s=fs.readFileSync(path.join(ROOT,f),'utf8');assert.ok(!/classList\.add\(\s*['"](desktop|mac|linux|platform)/.test(s)&&!/body\.className\s*=/.test(s)&&!/document\.body\.classList/.test(s),f+' writes no platform class');}
fs.rmSync(path.dirname(rpm),{recursive:true,force:true});
console.log('platform-parity staged: Mac and RPM stages byte-identical to app/assets, plain <body>, one stylesheet, no desktop-only hooks');
if(process.argv.includes('--staged'))process.exit(0);
// browser parts
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT||'playwright');
const MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const servers=[];const serve=async dir=>{const s=http.createServer((q,r)=>{const f=path.resolve(dir,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!f.startsWith(dir+path.sep)||!fs.existsSync(f)){r.writeHead(404);return r.end();}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});await new Promise(r=>s.listen(0,'127.0.0.1',r));servers.push(s);return 'http://127.0.0.1:'+s.address().port;};
const rpm2=fs.mkdtempSync(path.join(os.tmpdir(),'avalon-rpm-'))+'/web';fs.cpSync(ASSETS,rpm2,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const BOXES={header:'header',toolbar:'.toolbar',modes:'#touchModes',selection:'.selection',dock:'.dock',sheet:'#sheet',toggle:'#objectsToggle',panel:'#objectsPanel',help:'#desktopHelp'};
const box={id:'b',name:'Box',type:'box',params:{w:40,d:30,h:20},position:[0,0,10],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'};
const project={format:'tristancad',version:2,name:'Parity',objects:[box],layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1',buildPlaneEnabled:true};
async function open(origin,{platform=null,viewport={width:1024,height:688},touch=false}={}){
 const ctx=await browser.newContext({viewport,deviceScaleFactor:1,hasTouch:touch,isMobile:touch,serviceWorkers:'block'});await ctx.route('**/*',r=>r.request().url().startsWith(origin+'/')?r.continue():r.abort());
 const page=await ctx.newPage();page.setDefaultTimeout(120000);
 if(platform)await page.addInitScript(p=>{window.AvalonDesktop={platform:p,saveFile:async()=>({canceled:true}),openFile:async()=>({canceled:true}),onAction:()=>{},onFile:()=>{},onNotice:()=>{}};},platform);
 await page.goto(origin+'/index.html');await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true);
 await page.addStyleTag({content:'#busy{visibility:hidden!important}#toast{display:none!important}'});return {ctx,page};}
const settle=page=>page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(r,300)))));
const boxes=page=>page.evaluate(B=>Object.fromEntries(Object.entries(B).map(([k,s])=>{const e=document.querySelector(s);if(!e)return [k,null];const b=e.getBoundingClientRect(),st=getComputedStyle(e);return [k,st.display==='none'||st.visibility==='hidden'||e.hidden?'hidden':[b.left,b.top,b.width,b.height].map(v=>Math.round(v*10)/10)];})),BOXES);
async function scene(page,name){
 if(name==='blank')return;
 await page.evaluate(p=>window.__cad.load(p),project);await page.waitForFunction(()=>window.__cad.model?.parts?.length===1&&!/Building/.test(document.getElementById('busy').textContent));
 await page.waitForFunction(()=>window.__cad.model.parts[0].topology);await page.evaluate(()=>window.__cad.touch.selectFace('b',0));
 if(name==='panel')await page.locator('#objectsToggle').click();
 if(name==='sheet')await page.locator('#addBtn').click();}
const results=[];
try{const origins={mac:await serve(mac),rpm:await serve(rpm2),web:await serve(ASSETS)};
 for(const name of ['blank','selected','panel','sheet']){const shots={},bx={};
  for(const [p,origin] of Object.entries(origins)){const {ctx,page}=await open(origin,{platform:p==='mac'?'mac':p==='rpm'?'linux':null});await scene(page,name);await page.mouse.move(1,1);await settle(page);bx[p]=await boxes(page);shots[p]=await page.screenshot();await ctx.close();}
  for(const p of ['rpm','web']){for(const k of Object.keys(BOXES)){const a=bx.mac[k],b=bx[p][k];if(Array.isArray(a)&&Array.isArray(b))a.forEach((v,i)=>assert.ok(Math.abs(v-b[i])<=2,`${name} ${k} box mac vs ${p}: ${a} / ${b}`));else assert.deepEqual(a,b,`${name} ${k} visibility mac vs ${p}`);}
   const d=diffPixels(shots.mac,shots[p]),n=typeof d==='number'?d:d.differing,pct=n/(1024*688)*100;assert.ok(pct<=0.5,`${name} mac vs ${p}: ${pct.toFixed(3)} % pixels differ`);results.push(`${name} mac/${p} ${n} px`);}
  assert.ok(Array.isArray(bx.web.help),name+': help line shown at 1024x688');
  if(name==='panel'){const P=bx.web.panel,H=bx.web.help;assert.ok(Math.abs(H[0]-(P[0]+P[2]+18))<=1,'help 18 px right of the open panel');}
  else{const T=bx.web.toggle,H=bx.web.help;assert.ok(Math.abs(H[0]-(T[0]+T[2]+18))<=1,'help 18 px right of the toggle');assert.ok(Math.abs((H[1]+H[3]/2)-(T[1]+T[3]/2))<=1,'help centred on the toggle');}
  if(name==='blank')results.push('help box '+JSON.stringify(bx.web.help)+' toggle '+JSON.stringify(bx.web.toggle));}
 // 3. phone
 {const {ctx,page}=await open(origins.web,{viewport:{width:412,height:915},touch:true});assert.equal(await page.evaluate(()=>getComputedStyle(document.getElementById('desktopHelp')).display),'none','phone: no help line');await ctx.close();}
 // 5. sheet animation: desktop app none (2.7.2), web rise
 {const anim=[];for(const [p,origin,opt] of [['mac',origins.mac,{platform:'mac'}],['rpm',origins.rpm,{platform:'linux'}],['web',origins.web,{}],['phone',origins.web,{viewport:{width:412,height:915},touch:true}]]){
   const {ctx,page}=await open(origin,opt);
   const a=await page.evaluate(()=>{const s=document.getElementById('sheet');document.getElementById('addBtn').click();const st=getComputedStyle(s);return {name:st.animationName,duration:st.animationDuration,running:s.getAnimations().map(x=>x.animationName)};});
   await ctx.close();anim.push(p+' '+a.name);
   if(p==='mac'||p==='rpm'){assert.equal(a.name,'none',p+': desktop app .sheet animation is none');assert.deepEqual(a.running,[],p+': no sheet animation runs');}
   else{const k=p==='phone'?'rise':'rise-centred';assert.equal(a.name,k,p+': web .sheet keeps its slide-up animation ('+k+')');assert.equal(a.duration,'0.18s',p+': it lasts 180 ms');assert.deepEqual(a.running,[k],p+': it runs when the sheet opens');}}
  results.push('sheet animation: '+anim.join(', '));}
 // 6. sheet jump fix: at >= 700 px the sheet slides up already centred (composed translate(-50%,y) keyframes); the
 //    phone sheet (full width, no centring) keeps its rise. Sampled with the animation paused at 0..100 %.
 {const out=[];for(const [w,h,touch] of [[700,800,false],[1440,900,false],[412,915,true]]){const {ctx,page}=await open(origins.web,{viewport:{width:w,height:h},touch});
   const f=await page.evaluate(()=>{const s=document.getElementById('sheet');document.getElementById('addBtn').click();const a=s.getAnimations()[0];a.pause();const cw=document.documentElement.clientWidth;
    return [0,.1,.25,.5,.75,.9,1].map(x=>{a.currentTime=Math.min(179.9,180*x);const b=s.getBoundingClientRect();return {x,left:b.left,top:b.top,width:b.width,offset:b.left+b.width/2-cw/2,cw};});});
   await ctx.close();const end=f.at(-1);
   for(const s of f){assert.ok(Math.abs(s.offset)<=1,`${w}x${h} sheet centred at ${s.x*100} % of the animation (offset ${s.offset.toFixed(1)} px)`);assert.ok(Math.abs(s.width-end.width)<=.5,`${w}x${h} sheet width constant`);}
   if(touch)f.forEach(s=>assert.ok(Math.abs(s.left)<=.5&&Math.abs(s.width-s.cw)<=.5,`phone sheet stays full width at ${s.x*100} %`));else assert.ok(Math.abs(end.width-540)<=.5,`${w}: 540 px sheet`);
   assert.ok(f[0].top-end.top>=49&&f[0].top-end.top<=51,`${w}x${h}: slides up 50 px (${(f[0].top-end.top).toFixed(1)})`);for(let i=1;i<f.length;i++)assert.ok(f[i].top<=f[i-1].top+.01,`${w}x${h}: moves up monotonically`);
   out.push(`${w}: max offset ${Math.max(...f.map(s=>Math.abs(s.offset))).toFixed(2)} px`);}
  results.push('sheet slide centred: '+out.join(', '));}
 // 4. sweep
 let shown=0,hidden=0;const CONTROLS='#objectsToggle,#objectsPanel:not([hidden]),.views,.axis,#bounds,#liveMeasure:not([hidden]),#empty:not([hidden])>*';
 for(const height of [480,688,900]){const {ctx,page}=await open(origins.web,{viewport:{width:1024,height}});await scene(page,'selected');
  for(const panel of [false,true]){if(panel!==(await page.evaluate(()=>!document.getElementById('objectsPanel').hidden)))await page.locator('#objectsToggle').click();
   for(let width=320;width<=1920;width+=40){await page.setViewportSize({width,height});await settle(page);
    const r=await page.evaluate(C=>{const h=document.getElementById('desktopHelp'),st=getComputedStyle(h);if(st.display==='none'||st.visibility==='hidden')return {hidden:true};const vp=document.getElementById('viewport').getBoundingClientRect(),b=h.getBoundingClientRect();
     const hits=[...document.getElementById('viewport').querySelectorAll(C)].filter(e=>{const c=e.getBoundingClientRect();return c.width&&c.height&&c.left<b.right&&c.right>b.left&&c.top<b.bottom&&c.bottom>b.top;}).map(e=>e.id||e.className);
     return {hidden:false,inside:b.left>=vp.left&&b.right<=vp.right&&b.top>=vp.top&&b.bottom<=vp.bottom,hits};},CONTROLS);
    if(r.hidden){hidden++;continue;}shown++;assert.ok(r.inside,`help inside the viewport at ${width}x${height} panel=${panel}`);assert.deepEqual(r.hits,[],`help overlaps nothing at ${width}x${height} panel=${panel}`);}}
  await ctx.close();}
 results.push(`sweep: ${shown} shown / ${hidden} hidden states, no overlap`);
}finally{for(const s of servers)s.close();await browser.close();fs.rmSync(path.dirname(rpm2),{recursive:true,force:true});}
console.log('PASS platform-parity:',results.join('; '));
