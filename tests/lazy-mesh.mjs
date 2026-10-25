// F1 lazy imported-mesh preview (web/lazy-mesh.mjs) against the Manifold preview path (options.noLazyMesh).
//  1. Engine: the 524k sample with its triangle order rotated by 7, plus rotate/scale/move/floor placements: the same
//     triangles (exact float32 vertex triples, any order), bounds, floor adjustments and part topology.
//  2. Pixels: the app (Android mode, as leak-loads) renders the rotated-by-7 project; lazy vs Manifold (the served
//     worker.js forced to noLazyMesh) must be pixel-identical (the loaded mesh is selected, so the view includes its selection overlay).
// Run from the repo root after build:web. Env: AVALON_CHROMIUM, LAZY_SAMPLE.
import assert from 'node:assert/strict';import fs from 'node:fs';import http from 'node:http';import path from 'node:path';import {createRequire} from 'node:module';
import {initKernel} from '../web/kernel.mjs';import {initLocalEngine} from '../web/local-engine.mjs';import {decodePNG} from './perf/png.mjs';
const SAMPLE=process.env.LAZY_SAMPLE||'/workspace/avalon-cad-artifacts/export-3mf/samples/sphere-524k.tcad';
const base=JSON.parse(fs.readFileSync(SAMPLE,'utf8'));
const rot7=p=>{for(const o of p.objects)if(o.type==='mesh'){const m=o.params.mesh,k=21;m.triangles=m.triangles.slice(k).concat(m.triangles.slice(0,k));}return p;};
const K=await initKernel(),rust={binary:fs.readFileSync('app/assets/mesh-core.wasm')};
const lazy=await initLocalEngine(K,{rust}),man=await initLocalEngine(K,{rust,noLazyMesh:true});
const tris=(v,t)=>{const out=[];for(let i=0;i<t.length;i+=3){const p=[0,1,2].map(k=>v[t[i+k]*3]+','+v[t[i+k]*3+1]+','+v[t[i+k]*3+2]);const j=p.indexOf([...p].sort()[0]);out.push(p[j]+'|'+p[(j+1)%3]+'|'+p[(j+2)%3]);}return out.sort().join(';');};
const cases=[['rotated-by-7',p=>p],['rotate 30/45/90 + move',p=>{p.objects[0].rotation=[30,45,90];p.objects[0].position=[1.5,-2.25,3];return p;}],
 ['scale + rotate -90/0/180 + floor',p=>{Object.assign(p.objects[0],{scale:[1.2,.8,1.1],rotation:[-90,0,180],position:[0,0,-5]});p.buildPlaneEnabled=true;return p;}]];
for(const [name,f] of cases){const p=f(rot7(structuredClone(base)));
 const a=lazy.process({type:'preview',project:structuredClone(p),tolerance:.15,id:1}),b=man.process({type:'preview',project:structuredClone(p),tolerance:.15,id:1});
 assert.ok(!a.error&&!b.error,name+': '+(a.error||b.error));assert.equal(lazy.engineCache?.stats.localBuilds??0,0,name+': lazy path built a Manifold');
 assert.ok(tris(a.vertices,a.triangles)===tris(b.vertices,b.triangles),name+': triangles');
 for(const k of ['bounds','floorAdjustments'])assert.deepEqual(a[k],b[k],name+' '+k);
 assert.deepEqual(a.parts[0].bounds,b.parts[0].bounds,name+' part bounds');assert.deepEqual([a.parts[0].topologyHash,a.parts[0].topology],[b.parts[0].topologyHash,b.parts[0].topology],name+' topology');
 assert.deepEqual(Object.keys(a).sort(),Object.keys(b).sort(),name+' keys');}
// a mesh that is not closed takes the Manifold path (same result, including its error)
{const p=rot7(structuredClone(base));p.objects[0].params.mesh.triangles=p.objects[0].params.mesh.triangles.slice(3);const a=lazy.process({type:'preview',project:structuredClone(p),tolerance:.15,id:1}),b=man.process({type:'preview',project:structuredClone(p),tolerance:.15,id:1});assert.deepEqual(a.error,b.error,'open mesh');}
console.log('lazy-mesh engine: '+cases.length+' placements match the Manifold preview; open mesh falls back');
// pixels
const req=createRequire(process.env.NODE_PATH?path.join(process.env.NODE_PATH.split(':')[0],'/'):import.meta.url);const {chromium}=req('playwright');
const ROOT=path.resolve('app/assets'),TEXT=JSON.stringify(rot7(structuredClone(base)));
const serve=force=>http.createServer((q,r)=>{const n=decodeURIComponent(new URL(q.url,'http://x').pathname.slice(1));if(n==='__p.json'){r.end(TEXT);return;}const f=path.resolve(ROOT,n||'index.html');if(!f.startsWith(ROOT+path.sep)||!fs.existsSync(f)){r.writeHead(404);r.end();return;}
 r.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.css':'text/css','.wasm':'application/wasm','.json':'application/json'}[path.extname(f)]||'application/octet-stream');
 if(force&&n==='worker.js'){const s=fs.readFileSync(f,'utf8');assert.ok(s.includes('.noLazyMesh'));r.end(s.replaceAll('.noLazyMesh','.noLazyMesh||!0'));return;}fs.createReadStream(f).pipe(r);});
async function shots(force){const server=serve(force);await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({executablePath:process.env.AVALON_CHROMIUM,headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{const ctx=await browser.newContext({viewport:{width:1024,height:549},deviceScaleFactor:1,hasTouch:true,isMobile:true,serviceWorkers:'block'});
  await ctx.addInitScript(()=>{window.Android={log:()=>{},openFile(){},beginFile(){},appendFile(){},finishFile(){}};});
  const page=await ctx.newPage();await page.goto('http://127.0.0.1:'+server.address().port+'/index.html');await page.waitForFunction(()=>window.__cad?.model?.engine,{},{timeout:240000});
  await page.evaluate(async()=>{window.__cad.load(await (await fetch('/__p.json')).json());});
  await page.waitForFunction(()=>window.__cad.model?.triangles?.length>3000&&!/Building|Preparing/.test(document.querySelector('#busy').textContent),{},{timeout:240000});await page.waitForTimeout(1500);
  const out=[await page.locator('canvas').first().screenshot()];
  return out;}finally{await browser.close();server.close();}}
const L=await shots(false),M=await shots(true);
for(let i=0;i<L.length;i++){const a=decodePNG(L[i]),b=decodePNG(M[i]);assert.equal(a.width,b.width);let diff=0;for(let j=0;j<a.data.length;j+=4)if(a.data[j]!==b.data[j]||a.data[j+1]!==b.data[j+1]||a.data[j+2]!==b.data[j+2]||a.data[j+3]!==b.data[j+3])diff++;
 if(diff){fs.writeFileSync('build/lazy-mesh-lazy-'+i+'.png',L[i]);fs.writeFileSync('build/lazy-mesh-manifold-'+i+'.png',M[i]);}
 assert.equal(diff,0,'view '+i+': '+diff+' px differ (build/lazy-mesh-*.png)');}
console.log('lazy-mesh pixels: rotated-by-7 524k, lazy vs Manifold, '+L.length+' views, 0 px');
