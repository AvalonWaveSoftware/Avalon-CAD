// Regression (worker-drain-fix): web/worker.mjs drain() must dispatch each job to exactly one branch. On e368ec1 the
// measure branch started a new `if` after the encode3mf line, so an 'encode3mf' job (the 3MF pool fallback) fell through
// to runJob / engine.process, which replaced its 3MF bytes. In the real worker bundles (pinned Chromium):
//  - worker-sidecar.js (OCCT_SIDECAR on) and worker.js (off): 'encode3mf' returns exactly the bytes mesh-core's
//    write3MF gives for that mesh in Node;
//  - 'measure' (object mode, two boxes 10 mm apart) still answers 10 mm on both bundles.
//   node tests/worker-drain.mjs
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import http from 'node:http';import {createRequire} from 'node:module';
import {initRustMesh} from '../web/rust-mesh.mjs';import {object} from '../web/templates.mjs';
const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..'),ASSETS=path.join(ROOT,'app/assets');
// A closed 20 mm cube (12 triangles), as the export pool would hand it back.
const V=new Float32Array([0,0,0,20,0,0,20,20,0,0,20,0,0,0,20,20,0,20,20,20,20,0,20,20]);
const T=new Uint32Array([0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7]);
const rust=await initRustMesh({binary:fs.readFileSync(path.join(ASSETS,'mesh-core.wasm'))});
const want=Buffer.from(rust.write3MF(V.slice(),T.slice(),true));assert.ok(want.length>100,'reference 3MF');
const MIME={'.html':'text/html','.js':'text/javascript','.json':'application/json','.wasm':'application/wasm','.txt':'text/plain'};
const server=http.createServer((q,r)=>{const u=new URL(q.url,'http://x').pathname;if(u==='/drain.html'){r.setHeader('Content-Type','text/html');r.end('<!doctype html><title>drain</title>');return;}
 const f=path.resolve(ASSETS,u.slice(1));if(!f.startsWith(ASSETS+path.sep)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}r.setHeader('Content-Type',MIME[path.extname(f)]||'application/octet-stream');fs.createReadStream(f).pipe(r);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const {chromium}=createRequire(import.meta.url)(process.env.AVALON_PLAYWRIGHT||'playwright');
const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const a=object('box',{w:30,d:20,h:10}),b=object('box',{w:30,d:20,h:10},[40,0,0]);
const out={};
try{const page=await browser.newPage();page.setDefaultTimeout(120000);await page.goto(origin+'/drain.html');
 for(const bundle of ['worker-sidecar.js','worker.js'])out[bundle]=await page.evaluate(async([bundle,V,T,a,b])=>{
  const w=new Worker(bundle+'?v=drain',{type:'module'}),pending=new Map();
  w.onmessage=e=>{const d=e.data;if(d?.interim||!pending.has(d?.id))return;pending.get(d.id)(d);pending.delete(d.id);};
  const ask=d=>new Promise(r=>{pending.set(d.id,r);w.postMessage(d);});
  try{const enc=await ask({id:1,type:'encode3mf',vertices:new Float32Array(V),triangles:new Uint32Array(T),ground:true});
   const m=await ask({id:2,type:'measure',mode:'object',a:{object:a},b:{object:b}});
   return {error:enc.error||null,bytes:enc.buffer?Array.from(new Uint8Array(enc.buffer)):null,keys:Object.keys(enc).filter(k=>k!=='buffer'&&k!=='engine').sort(),measure:m.error||m.distance};}
  finally{w.terminate();}},[bundle,Array.from(V),Array.from(T),a,b]);}
finally{await browser.close();server.close();}
for(const [bundle,r] of Object.entries(out)){
 assert.equal(r.error,null,bundle+' encode3mf error');assert.ok(r.bytes,bundle+' encode3mf returned no 3MF buffer ('+r.keys.join(',')+')');
 assert.ok(Buffer.from(r.bytes).equals(want),bundle+' encode3mf bytes differ from mesh-core write3MF');
 assert.ok(typeof r.measure==='number'&&Math.abs(r.measure-10)<1e-6,bundle+' measure: '+r.measure);}
console.log(`worker drain: encode3mf byte-identical (${want.length} B) and measure 10 mm on worker-sidecar.js (sidecar on) and worker.js (sidecar off)`);
