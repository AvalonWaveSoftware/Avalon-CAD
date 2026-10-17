// WS3 step 4 (browser): after an edit, pick meshes of unchanged parts are the same objects (same geometry, no new
// buffers); only the edited part's pick mesh is rebuilt. With ENGINE_CACHE off every pick mesh is rebuilt.
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);const {chromium}=require(process.env.AVALON_PLAYWRIGHT||'playwright');
const ASSETS=path.resolve(process.env.AVALON_ASSETS||fileURLToPath(new URL('../app/assets',import.meta.url)));
const {ENGINE_CACHE}=await import('../web/perf-flags.mjs');
const server=http.createServer((req,res)=>{const file=path.resolve(ASSETS,new URL(req.url,'http://x').pathname.slice(1)||'index.html');if(!file.startsWith(ASSETS+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
 res.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.wasm':'application/wasm'}[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{const page=await(await browser.newContext({viewport:{width:1000,height:700}})).newPage();page.on('pageerror',e=>console.error('pageerror',e.message));
 await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,{},{timeout:90000});
 const objects=Array.from({length:30},(_,i)=>({id:'o'+i,name:'o'+i,type:['box','cylinder','sphere'][i%3],params:[{w:10,d:10,h:10},{diameter:10,h:10},{diameter:10}][i%3],position:[(i%6)*20,Math.floor(i/6)*20,5],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'}));
 await page.evaluate(objects=>window.__cad.load({format:'tristancad',version:2,name:'picks',objects,layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1'}),objects);
 await page.waitForFunction(()=>window.__cad.picks?.length===30,{},{timeout:120000});
 const r=await page.evaluate(async()=>{const before=window.__cad.picks.slice(),old=window.__cad.model;window.__cad.picks.forEach((m,i)=>m.userData.__tag=i);
  const p=structuredClone(window.__cad.project);p.objects[7].position[0]+=3;window.__cad.load(p);
  await new Promise((res,rej)=>{const t0=performance.now();const f=()=>window.__cad.model!==old&&window.__cad.picks.length===30?res():performance.now()-t0>60000?rej(Error('no rebuild')):setTimeout(f,20);f();});
  const after=window.__cad.picks;return {same:after.filter((m,i)=>m===before[i]).length,moved:after[7]===before[7],hashes:after.filter(m=>m.userData.contentHash).length,bounds:after[7].userData.bounds.min[0]};});
 console.log('pick reuse:',JSON.stringify(r));
 if(ENGINE_CACHE){assert.equal(r.hashes,30);assert.equal(r.same,29,'unchanged parts keep their pick meshes');assert.equal(r.moved,false,'the moved part gets a new pick mesh');}else assert.equal(r.same,0);
 console.log('Pick-mesh reuse checks passed');
}finally{await browser.close();server.close();}
