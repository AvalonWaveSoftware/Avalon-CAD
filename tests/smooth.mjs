import assert from 'node:assert/strict';
import {initKernel,buildModel,validateProject,writeSTL,readSTL} from '../web/kernel.mjs';
import {applySmoothPreset} from '../web/resolution-ui.mjs';
import {displayGeometry,hasFixedFacets} from '../web/display-geometry.mjs';
import {blank,object,defaults} from '../web/templates.mjs';
import {mergeResult,withRoundover} from '../web/operations.mjs';
import {evaluateBoolean} from './boolean-model.mjs';
const K=await initKernel();let checks=0;
for(const type of ['sphere','cylinder','cone','tube','rounded']){
 const o=applySmoothPreset(object(type,structuredClone(defaults[type]))),p=validateProject({...blank(),objects:[o]});
 assert.deepEqual(o.resolution,{mode:'tolerance',tolerance:.005});
 const preview=buildModel(K,p,.15),maximum=buildModel(K,p,.005);
 assert.ok(preview.triangles.length>100);assert.equal(preview.triangles.length,maximum.triangles.length);assert.equal(preview.volume,maximum.volume);
 const bytes=writeSTL(maximum.vertices,maximum.triangles);assert.equal(readSTL(bytes).triangles.length,maximum.triangles.length);checks++;
}
const box=applySmoothPreset(object('box',{w:10,d:10,h:10}));assert.equal(box.resolution,undefined);const cube=buildModel(K,{...blank(),objects:[box]},.15),boxDisplay=displayGeometry(cube.vertices,cube.triangles);const normals=boxDisplay.getAttribute('normal');for(let i=0;i<normals.count;i++)assert.ok(Math.max(Math.abs(normals.getX(i)),Math.abs(normals.getY(i)),Math.abs(normals.getZ(i)))>.99999);boxDisplay.dispose();checks++;
const sphere=applySmoothPreset(object('sphere',{diameter:20})),mesh=buildModel(K,{...blank(),objects:[sphere]},.15),smooth=displayGeometry(mesh.vertices,mesh.triangles),pos=smooth.getAttribute('position'),normal=smooth.getAttribute('normal');for(let i=0;i<pos.count;i++){const dot=pos.getX(i)*normal.getX(i)+pos.getY(i)*normal.getY(i)+pos.getZ(i)*normal.getZ(i);assert.ok(dot/Math.hypot(pos.getX(i),pos.getY(i),pos.getZ(i))>.98);}smooth.dispose();checks++;
const faceted={...sphere,resolution:{mode:'faces',count:6}};assert.equal(hasFixedFacets(faceted),true);assert.equal(hasFixedFacets({params:{children:[faceted]}}),true);assert.equal(hasFixedFacets(sphere),false);const flat=displayGeometry(cube.vertices,cube.triangles,true);assert.equal(flat.index,null);flat.dispose();checks++;
// Adding a faceted copy must preserve every existing shape's resolution and display normals.
for(const type of ['sphere','cylinder','cone','tube','rounded']){
 const first=applySmoothPreset(object(type,structuredClone(defaults[type]))),second=object(type,structuredClone(defaults[type]),[80,0,0]);second.resolution={mode:'faces',count:type==='rounded'?2:32};
 const snapshot=JSON.stringify(first),alone=buildModel(K,{...blank(),objects:[first]},.15,true),both=buildModel(K,{...blank(),objects:[first,second]},.15,true);
 assert.equal(JSON.stringify(first),snapshot);assert.deepEqual(both.parts[0].vertices,alone.parts[0].vertices);assert.deepEqual(both.parts[0].triangles,alone.parts[0].triangles);assert.equal(both.parts[0].flatTriangles.reduce((n,v)=>n+v,0),0);assert.ok(both.parts[1].flatTriangles.every(v=>v===1));
 const view=displayGeometry(both.vertices,both.triangles,both.flatTriangles),normals=view.getAttribute('normal');let flatCount=0;
 for(let i=0;i<both.flatTriangles.length;i++)if(both.flatTriangles[i]){flatCount++;for(let j=1;j<3;j++)for(const key of ['getX','getY','getZ'])assert.equal(normals[key](i*3),normals[key](i*3+j));}
 assert.equal(flatCount,both.parts[1].triangles.length/3);view.dispose();checks++;
}
const mixedSmooth=applySmoothPreset(object('sphere',{diameter:20})),mixedFacet=object('sphere',{diameter:20},[8,0,0]);mixedFacet.resolution={mode:'faces',count:32};
const mixedInfo=evaluateBoolean(K,[mixedSmooth,mixedFacet],'add'),mixed=mergeResult([mixedSmooth,mixedFacet],'mixed',mixedInfo.bounds),combined=buildModel(K,{...blank(),objects:[mixed]},.15,true);assert.ok(combined.flatTriangles.some(v=>v===0)&&combined.flatTriangles.some(v=>v===1));assert.equal(mixed.params.children[0].resolution.tolerance,.005);assert.equal(mixed.params.children[1].resolution.count,32);checks++;
const facetCutter=object('cylinder',{diameter:5,h:30});facetCutter.resolution={mode:'faces',count:12};facetCutter.mode='cut';const cutPreview=buildModel(K,{...blank(),objects:[mixedSmooth,facetCutter]},.15,true);assert.ok(cutPreview.flatTriangles.some(v=>v===0)&&cutPreview.flatTriangles.some(v=>v===1));checks++;
const roundedFacet=withRoundover(object('cylinder',{diameter:20,h:20}),[0],.5);roundedFacet.resolution={mode:'faces',count:12};const roundedPreview=buildModel(K,{...blank(),objects:[roundedFacet]},.15,true);assert.ok(roundedPreview.flatTriangles.some(v=>v===1)&&roundedPreview.flatTriangles.some(v=>v===0));assert.ok(Math.abs(roundedPreview.volume-buildModel(K,{...blank(),objects:[roundedFacet]},.15).volume)<1e-5);checks++;
console.log('PASS:',checks,'smooth-shape cases: preset curves, high-quality preview/export parity, STL, sharp box normals, smooth sphere normals and fixed-facet display.');
