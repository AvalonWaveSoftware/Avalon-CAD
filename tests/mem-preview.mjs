// mem-preview (2b), Architect ruling 2026-10-25 23:02: a hollow in a preview job is meshed from the exact OCCT B-rep at
// the coarser of the object's and the preview's tolerance; check (committed) and export keep the object's resolution.
// Scene: the Waydroid QA D1 session at Smooth shape (0.005 mm): open-top tube (mirrored), hollow torus 30/8, a copy,
// a box. Preview runs as the Android worker (deferred hollows → computeShells → re-run), then check and exports in the
// same engine (shared caches: a coarse preview mesh must never reach them).
//   node tests/mem-preview.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';import crypto from 'node:crypto';
const R=new URL('..',import.meta.url).pathname.replace(/\/$/,'');const imp=m=>import(R+'/web/'+m);
const {initKernel}=await imp('kernel.mjs'),{initLocalEngine}=await imp('local-engine.mjs'),{objectTopology}=await imp('cad-solid.mjs'),SM=await imp('shell-mesh.mjs'),{object,blank,defaults}=await imp('templates.mjs'),{mirrorObject}=await imp('operations.mjs');
const K=await initKernel(),E=await initLocalEngine(K,{rust:{binary:fs.readFileSync(R+'/app/assets/mesh-core.wasm')}});
const h=x=>crypto.createHash('sha256').update(Buffer.from(x.buffer?x.buffer:x,x.byteOffset||0,x.byteLength)).digest('hex').slice(0,16);
const res={mode:'tolerance',tolerance:.005};const tube={...object('tube',{...defaults.tube},[0,0,10]),resolution:res,id:'t'};const top=objectTopology(tube).faces.findIndex(f=>f.normal?.[2]>.999);
tube.shell={thickness:1.5,open:[top]};const torus={...object('torus',{...defaults.torus},[40,0,4]),resolution:res,shell:{thickness:2},id:'o'};
const p={...blank(),version:3,groups:[{id:'g1',name:'G'}],objects:[mirrorObject(tube,'YZ'),torus,{...tube,id:'c'},{...object('box',{...defaults.box},[-45,0,7.5]),id:'b'}]};for(const o of p.objects.slice(0,3))o.groupId='g1';
let id=0;const out={};
const job=(type,tolerance=.15,extra={})=>{SM.deferShells(type==='preview');let r=E.process({id:++id,type,project:structuredClone(p),tolerance,...extra});const sh=SM.takeDeferredShells();return {r,sh};};
// preview as the Android worker: deferred hollows, computeShells, re-run
async function preview(){let {r,sh}=job('preview');if(sh.length){await SM.computeShells(sh,()=>false);r=job('preview').r;}return r;}
const pv=await preview();out.previewTriangles=pv.triangles.length/3;out.previewVolume=+pv.volume.toFixed(3);
const ck=job('check').r;out.check=h(ck.vertices)+h(ck.triangles);out.checkVolume=+ck.volume.toFixed(6);
for(const t of [.15,.05,.01]){const ex=job('export',t,{ground:true}).r;out['export'+t]=ex.error||h(new Uint8Array(ex.buffer));}
// Reference: the same script on the frozen waydroid-fix-3.0 tree (e723ebc + its 4 patches), 2026-10-25 23:20 CT.
const REF={"previewTriangles":292206,"check":"c85d3606110b62de385aa18a25ccfa76","checkVolume":20208.518057,"export0.15":"c23aa9fd63a56e7e","export0.05":"c23aa9fd63a56e7e","export0.01":"c23aa9fd63a56e7e"};
for(const k of ['check','checkVolume','export0.15','export0.05','export0.01'])assert.equal(out[k],REF[k],k+': the committed (check) and exported hollow stay exact, byte-identical to waydroid-fix-3.0');
assert.ok(out.previewTriangles<REF.previewTriangles/10,'the preview meshes the hollows at preview smoothness: '+out.previewTriangles+' triangles');
assert.ok(Math.abs(out.previewVolume-out.checkVolume)/out.checkVolume<.001,'preview volume within 0.1% of the exact one');
console.log(`mem-preview: preview ${REF.previewTriangles} → ${out.previewTriangles} triangles; check and STL exports (0.15/0.05/0.01) byte-identical to waydroid-fix-3.0`);
