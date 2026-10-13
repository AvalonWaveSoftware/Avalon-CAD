import fs from 'node:fs';import http from 'node:http';import path from 'node:path';
import {chromium} from 'playwright';
// Bundled app to serve (read-only). Defaults to the repo this folder lives in (tools/readme-shots -> ../../app/assets).
export const ROOT=path.resolve(process.env.AVALON_ASSETS||path.resolve(new URL('.',import.meta.url).pathname,'../../app/assets'));
export async function start(){
 const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';const file=path.resolve(ROOT,name);
  if(!file.startsWith(ROOT+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  const mime={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.py':'text/plain','.wasm':'application/wasm'}[path.extname(file)]||'application/octet-stream';
  res.setHeader('Content-Type',mime);res.setHeader('Cache-Control','no-store');fs.createReadStream(file).pipe(res);});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const origin='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--ignore-gpu-blocklist','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 return {origin,browser,async close(){await browser.close();server.close();}};
}
export async function open(env,{desktop=false}={}){
 const ctx=await env.browser.newContext(desktop?{viewport:{width:1440,height:900},deviceScaleFactor:1,serviceWorkers:'block'}:{viewport:{width:412,height:915},deviceScaleFactor:2,hasTouch:true,isMobile:true,serviceWorkers:'block'});
 await ctx.route('**/*',r=>r.request().url().startsWith(env.origin+'/')?r.continue():r.abort());
 const page=await ctx.newPage();page.on('pageerror',e=>console.error('pageerror',e.message));
 await page.addInitScript(()=>{window.Android={beginFile(name,mime){window.savedFile={name,mime,chunks:[]}},appendFile(x){window.savedFile.chunks.push(x)},finishFile(){window.savedFile.done=true}};});
 await page.goto(env.origin+'/index.html');
 await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,{},{timeout:90000});
 return page;
}
export const tap=(page,mode,points,times=1)=>page.evaluate(([mode,points,times])=>{const t=window.__cad.touch;if(mode)t.setMode(mode);const c=document.querySelector('#scene');for(const p of points){const at=t.pointScreen(p);for(let i=0;i<times;i++)for(const type of ['pointerdown','pointerup'])c.dispatchEvent(new PointerEvent(type,{clientX:at[0],clientY:at[1],pointerId:1,pointerType:'touch',bubbles:true}));}},[mode,points,times]);
export const idle=async page=>{await page.waitForFunction(()=>{const b=document.querySelector('#busy');return !b||b.hidden||getComputedStyle(b).display==='none'||!b.textContent.trim();},{},{timeout:60000}).catch(()=>{});await page.waitForTimeout(800);};
