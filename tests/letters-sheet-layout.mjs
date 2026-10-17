// QA note 4 / Amendment A1: the Letters, numbers & symbols sheet (94 tiles) at phone and desktop sizes.
// Checks: tiles >= 44 px, same tiles in the same order everywhere (columns follow the shared .shapegrid rules), the
// sheet scrolls to the last tile, and the title and Close button stay reachable after scrolling to the bottom.
//   node tests/letters-sheet-layout.mjs [--shots DIR]
import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';import assert from 'node:assert/strict';
import {ASSETS} from './perf/dom-baseline.mjs';
const require=createRequire(import.meta.url);const {chromium}=require(process.env.AVALON_PLAYWRIGHT||'playwright');
const shotsI=process.argv.indexOf('--shots'),SHOTS=shotsI>0?path.resolve(process.argv[shotsI+1]):null;if(SHOTS)fs.mkdirSync(SHOTS,{recursive:true});
const server=http.createServer((req,res)=>{const name=new URL(req.url,'http://x').pathname.slice(1)||'index.html',file=path.resolve(ASSETS,name);if(!file.startsWith(ASSETS+path.sep)||!fs.existsSync(file)){res.writeHead(404);return res.end();}
 res.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'}[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const sizes=[['phone-412x915',{viewport:{width:412,height:915},deviceScaleFactor:2,hasTouch:true,isMobile:true}],['phone-360x640',{viewport:{width:360,height:640},deviceScaleFactor:2,hasTouch:true,isMobile:true}],
 ['phone-landscape-915x412',{viewport:{width:915,height:412},deviceScaleFactor:2,hasTouch:true,isMobile:true}],['desktop-1440x900',{viewport:{width:1440,height:900}}],['desktop-1024x640',{viewport:{width:1024,height:640}}]];
const results={};let order=null;
try{for(const [name,opt] of sizes){const ctx=await browser.newContext({...opt,serviceWorkers:'block'}),page=await ctx.newPage();
 await page.goto(origin+'/index.html');await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,null,{timeout:120000});
 await page.locator('#addBtn').click();await page.locator('#lettersBtn').click();await page.waitForFunction(()=>document.querySelectorAll('#sheetContent [data-glyph] svg').length===94,null,{timeout:120000});
 const r=await page.evaluate(async()=>{const tiles=[...document.querySelectorAll('#sheetContent [data-glyph]')],box=e=>e.getBoundingClientRect();
  const sizes=tiles.map(t=>box(t)),cols=new Set(sizes.map(b=>Math.round(b.top))).size?Math.max(...Object.values(sizes.reduce((m,b)=>(m[Math.round(b.top)]=(m[Math.round(b.top)]||0)+1,m),{}))):0;
  // the element that scrolls the tiles
  let sc=tiles[0].parentElement;while(sc&&!(sc.scrollHeight>sc.clientHeight+1&&/(auto|scroll)/.test(getComputedStyle(sc).overflowY)))sc=sc.parentElement;
  const scrolls=!!sc;if(sc){sc.scrollTop=sc.scrollHeight;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}
  const vis=e=>{const b=box(e),x=b.left+b.width/2,y=b.top+b.height/2;const hit=document.elementFromPoint(x,y);return b.bottom>0&&b.top<innerHeight&&b.right>0&&b.left<innerWidth&&(hit===e||e.contains(hit));};
  const last=tiles[tiles.length-1];
  return {order:tiles.map(t=>t.dataset.glyph).join(','),minW:Math.min(...sizes.map(b=>b.width)),minH:Math.min(...sizes.map(b=>b.height)),cols,scrolls,scroller:sc?(sc.id||sc.className):null,
   lastVisible:vis(last),titleVisible:vis(document.querySelector('#sheetTitle')),closeVisible:vis(document.querySelector('#closeSheet'))};});
 if(SHOTS)await page.screenshot({path:path.join(SHOTS,'letters-'+name+'-bottom.png')});
 // the Close button still works from the bottom
 await page.locator('#closeSheet').click();await page.waitForFunction(()=>document.querySelector('#sheet').hidden);r.closeWorks=true;
 results[name]=r;await ctx.close();}
}finally{await browser.close();server.close();}
for(const [name,r] of Object.entries(results)){const {order:o,...rest}=r;console.log(name,JSON.stringify(rest));
 assert.ok(r.minW>=44&&r.minH>=44,name+' tiles >= 44 px');assert.equal(r.lastVisible,true,name+' last tile reachable');assert.equal(r.titleVisible,true,name+' title reachable after scrolling');
 assert.equal(r.closeVisible,true,name+' Close reachable after scrolling');if(order===null)order=o;assert.equal(o,order,name+' same tiles and order');assert.equal(o.split(",").length,94);}
console.log('PASS: letters sheet at',Object.keys(results).length,'sizes: 94 tiles >= 44 px in one order, sheet scrolls to the last tile, title and Close stay reachable and Close works');
