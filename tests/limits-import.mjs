// limits-3.0 rev6 (Waydroid QA D1/D2): the Android import path as Java drives it (nativeImportStart(name,size), 24,576-byte
// base64 slices, nativeImportEnd), real app, built assets, window.Android stub, phone-size page, headless Chromium.
//  1. Cancel during a large STL import and during a large 3MF import: the job bar's Cancel shows exactly the approved
//     "Canceled. Nothing was changed.", the model is unchanged, the page does not crash, and the next import works.
//  2. D2: a binary STL whose header starts with "PK" imports as an STL under its own name (Java no longer renames it),
//     and MainActivity.java no longer renames or builds one big base64 String.
//  3. Both transports decode exactly (with the byte count, and without it).
//  4. Memory: a 523k-triangle STL imports and Apply & add under a 96 MB V8 old-space limit (before: it crashed the
//     renderer at every limit below 192 MB on the box). Skipped with AVALON_LIMITS_SKIP_MEM=1.
//   node tests/limits-import.mjs   (after npm run build:web)
import assert from 'node:assert/strict';import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';
import {zip,model} from './import-3mf-reference.mjs';
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT);
const assets=path.resolve(process.env.AVALON_ASSETS||'app/assets'),MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};
const server=http.createServer((q,r)=>{const f=path.resolve(assets,new URL(q.url,'http://x').pathname.slice(1)||'index.html');if(!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');r.setHeader('Cache-Control','no-store');fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const ARGS=['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'];
const CANCELED='Canceled. Nothing was changed.',STL_TOAST='Choose placement, then Apply to add the imported STL.',MF_TOAST='Choose placement, then Apply to add the imported 3MF.';
// --- fixtures ---
const cubeV=[0,0,0,10,0,0,10,10,0,0,10,0,0,0,10,10,0,10,10,10,10,0,10,10],cubeT=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7];
function stlOf(tris,header=''){const b=Buffer.alloc(84+50*tris.length/9);b.write(header,0,'latin1');b.writeUInt32LE(tris.length/9,80);for(let i=0;i<tris.length/9;i++)for(let k=0;k<9;k++)b.writeFloatLE(tris[i*9+k],84+i*50+12+(k/3|0)*12+k%3*4);return b;}
const cubeTris=cubeT.flatMap(i=>cubeV.slice(i*3,i*3+3));
const cubeSTL=stlOf(cubeTris),pkSTL=stlOf(cubeTris,'PK\u0003\u0004 binary STL header that starts like a zip');
// A closed UV sphere of about n triangles, indexed (vertices shared, poles once): [vertices, triangles].
function indexedSphere(n){const rows=Math.max(3,Math.round(Math.sqrt(n/4))),cols=rows*2,v=[0,0,50],t=[];
 for(let i=1;i<rows;i++)for(let j=0;j<cols;j++){const a=Math.PI*i/rows,b=2*Math.PI*j/cols;v.push(50*Math.sin(a)*Math.cos(b),50*Math.sin(a)*Math.sin(b),50*Math.cos(a));}v.push(0,0,-50);
 const at=(i,j)=>1+(i-1)*cols+(j%cols),south=1+(rows-1)*cols;
 for(let j=0;j<cols;j++){t.push(0,at(1,j),at(1,j+1));t.push(south,at(rows-1,j+1),at(rows-1,j));}
 for(let i=1;i<rows-1;i++)for(let j=0;j<cols;j++){t.push(at(i,j),at(i+1,j),at(i,j+1),at(i,j+1),at(i+1,j),at(i+1,j+1));}return [v,t];}
const sphere=n=>{const [v,t]=indexedSphere(n);return stlOf(t.flatMap(i=>v.slice(i*3,i*3+3)));};
// The Waydroid QA sample: an N x M UV sphere (radius 50, resting on z=0) with shared top-pole vertices and, because sin(pi) is not
// exactly 0, a south pole of M distinct points about 1e-14 apart. 512 x 512 is 523,264 triangles (QA's large523k.stl, byte for byte
// after the 80-byte header).
function qaSTL(N,M,R=50){const p=(i,j)=>{const th=Math.PI*i/N,ph=2*Math.PI*j/M;return [R*Math.sin(th)*Math.cos(ph),R*Math.sin(th)*Math.sin(ph),R+R*Math.cos(th)].map(Math.fround);},t=[];
 for(let i=0;i<N;i++)for(let j=0;j<M;j++){const a=p(i,j),b=p(i+1,j),c=p(i+1,j+1),e=p(i,j+1);if(i>0)t.push([a,b,e]);if(i<N-1)t.push([b,c,e]);}
 const b=Buffer.alloc(84+50*t.length);b.write('QA',0);b.writeUInt32LE(t.length,80);t.forEach((tr,k)=>tr.forEach((v,j)=>v.forEach((c,i)=>b.writeFloatLE(c,84+k*50+12+j*12+i*4))));return b;}
const bigSTL=sphere(40000),[sv,st]=indexedSphere(40000),big3MF=zip(model(sv,st));
const sleepNode=ms=>new Promise(r=>setTimeout(r,ms));
// --- helpers ---
async function open(browser){const page=await browser.newPage({viewport:{width:412,height:915}});page.crashed=false;page.on('crash',()=>{page.crashed=true;});page.on('pageerror',e=>console.error('pageerror',e.message));if(process.env.DBG)page.on('console',m=>console.error('console',m.text().slice(0,200)));
 await page.addInitScript(()=>{window.Android={beginFile(){},appendFile(){},finishFile(){}};const post=Worker.prototype.postMessage;Worker.prototype.postMessage=function(m,t){if(window.__holdMs&&(m?.type==='importSTL'||m?.type==='import3MF')){const ms=window.__holdMs;setTimeout(()=>post.call(this,m,t),ms);return;}return post.call(this,m,t);};});
 await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,null,{timeout:120000});return page;}
// What MainActivity.sendImport does: 24,576 raw bytes (32,768 base64 characters) per slice, the byte count first.
async function javaImport(page,name,bytes,{size=true}={}){const b=Buffer.from(bytes),slices=[];for(let at=0;at<b.length;at+=24576)slices.push(b.subarray(at,Math.min(at+24576,b.length)).toString('base64'));
 await page.evaluate(()=>{const t=document.getElementById('toast');t.hidden=true;t.textContent='';});
 await page.evaluate(([n,s])=>window.nativeImportStart(n,s),[name,size?b.length:undefined]);
 for(let i=0;i<slices.length;i+=8)await page.evaluate(all=>{for(const x of all)window.nativeImportChunk(x);},slices.slice(i,i+8));// Java sends one slice per call; a few per call keeps the harness fast without holding the file as text
 await page.evaluate(()=>window.nativeImportEnd());}
const toastOf=page=>page.waitForFunction(()=>{const t=document.getElementById('toast');return !t.hidden&&t.textContent?{text:t.textContent,error:t.classList.contains('error')}:null;},null,{timeout:+process.env.TOASTMS||120000}).then(h=>h.jsonValue());
let browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:ARGS});const out=[];
try{
 const page=await open(browser);
 // 2. Java source (D1/D2)
 const java=fs.readFileSync('app/src/com/avalonwavesoftware/cad/MainActivity.java','utf8');
 assert.ok(!/bytes\[0\]==80/.test(java)&&!/name\+"\.3mf"/.test(java),'MainActivity no longer renames a picked file that starts with PK');
 assert.ok(/Base64\.encodeToString\(bytes,at,/.test(java)&&/nativeImportStart\("\+JSONObject\.quote\(label\)\+","\+bytes\.length/.test(java),'MainActivity encodes one slice at a time and sends the byte count');
 // 2./3. exact decode and the name kept: pk-header.stl is an STL (sniffing by content, never by the first two bytes)
 for(const size of [true,false]){
  await javaImport(page,'pk-header.stl',pkSTL,{size});let t=await toastOf(page);assert.equal(t.text,STL_TOAST,'pk-header.stl imports as an STL ('+(size?'with':'without')+' the byte count)');assert.equal(t.error,false);
  const o=await page.evaluate(()=>{const s=document.querySelector('#applyObject');return !!s&&window.__cad.project.objects.length;});assert.ok(o!==false,'the placement sheet is open');
  await page.evaluate(()=>document.querySelector('#applyObject').click());await page.waitForFunction(n=>window.__cad.project.objects.length>n,o,{timeout:60000});
  const m=await page.evaluate(()=>{const ob=window.__cad.project.objects.at(-1);return {type:ob.type,name:ob.name,tris:ob.params.mesh.triangles.length/3};});
  assert.deepEqual(m,{type:'mesh',name:'pk-header',tris:12},'pk-header.stl became a 12-triangle mesh named pk-header');
  await javaImport(page,'real-3mf.stl',zip(model(cubeV,cubeT)),{size});t=await toastOf(page);assert.equal(t.text,MF_TOAST,'a real 3MF named .stl still imports as 3MF');
  await page.evaluate(()=>document.querySelector('#applyObject').click());await page.waitForFunction(n=>window.__cad.project.objects.length>n,o+1,{timeout:60000});
 }
 out.push('pk-header.stl imports as STL with and without the byte count; a real 3MF named .stl still imports as 3MF');
 // 1. Cancel during a large import (the import message is held 2.7 s so the 2 s job bar is up while the import is pending)
 for(const [name,bytes,ok] of [['large.stl',bigSTL,STL_TOAST],['large.3mf',big3MF,MF_TOAST]]){
  const before=await page.evaluate(()=>({n:window.__cad.project.objects.length,json:JSON.stringify(window.__cad.project.objects),sheet:!!document.querySelector('#applyObject')}));
  await page.evaluate(()=>{window.__holdMs=2700;});await javaImport(page,name,bytes);
  await page.waitForFunction(()=>{const b=document.getElementById('jobWatch');return b&&getComputedStyle(b).display!=='none';},null,{timeout:30000});
  await page.click('#jobCancel');let t=await toastOf(page);
  await page.waitForTimeout(1200);t=await page.evaluate(()=>({text:document.getElementById('toast').textContent,error:document.getElementById('toast').classList.contains('error')}));
  assert.equal(t.text,CANCELED,name+': exactly the approved Canceled text');assert.equal(t.error,false,name+': the neutral toast style, not the red error style');
  const after=await page.evaluate(()=>({n:window.__cad.project.objects.length,json:JSON.stringify(window.__cad.project.objects),sheet:!!document.querySelector('#applyObject'),bar:getComputedStyle(document.getElementById('jobWatch')).display}));
  assert.equal(after.n,before.n,name+': no object added');assert.equal(after.json,before.json,name+': the model is unchanged');assert.equal(after.sheet,before.sheet,name+': no placement sheet opened');assert.equal(after.bar,'none',name+': the job bar is gone');
  assert.ok(!page.crashed,name+': the page did not crash');
  await page.evaluate(()=>{window.__holdMs=0;});await sleepNode(300);
  await javaImport(page,name,bytes);t=await toastOf(page);assert.equal(t.text,ok,name+': the next import after the Cancel works');assert.equal(t.error,false);
  await page.evaluate(()=>document.querySelector('#applyObject').click());await page.waitForFunction(n=>window.__cad.project.objects.length>n,before.n,{timeout:120000});
  const m=await page.evaluate(()=>window.__cad.model?.triangles?.length/3);assert.ok(!page.crashed);
  out.push(`${name}: Cancel -> "${CANCELED}", model unchanged, no crash; next import added it`);
  await page.evaluate(()=>{const C=window.__cad,q=structuredClone(C.project);q.objects=q.objects.slice(0,0);C.load(q);});await page.waitForTimeout(500);
 }
 await page.close();
}finally{await browser.close();}
// 4. memory
if(!process.env.AVALON_LIMITS_SKIP_MEM){
 const LIMIT=+process.env.AVALON_LIMITS_MB||96,huge=qaSTL(512,512);
 browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:[...ARGS,`--js-flags=--max-old-space-size=${LIMIT}`]});
 try{const page=await open(browser);await javaImport(page,'large523k.stl',huge);const t=await toastOf(page);assert.equal(t.text,STL_TOAST,'523k import under the '+LIMIT+' MB limit');assert.ok(!page.crashed);
  await page.evaluate(()=>document.querySelector('#applyObject').click());await page.waitForFunction(()=>window.__cad.project.objects.length>0,null,{timeout:180000});
  await page.waitForFunction(()=>window.__cad.model?.triangles?.length>1000000,null,{timeout:180000});assert.ok(!page.crashed,'no renderer crash');
  const tris=await page.evaluate(()=>window.__cad.model.triangles.length/3);out.push(`523k-triangle STL imported and added under a ${LIMIT} MB V8 limit (${tris} display triangles), no crash`);}
 finally{await browser.close();}
}
server.close();
console.log('PASS: limits-import: '+out.join('; '));
