// ADR new-primitives-polyhedra-text §5.7–5.9 in the real UI (jsdom, as tests/build-plane.mjs): the Add sheet's two new
// tiles and More shapes section, the Advanced shapes and Letters, numbers & symbols sheets (Amendment A1: one tile per
// character, no Character field), the Edit draft (labels, size hint, smooth-only torus), Apply/edit/stretch/rotate/move/delete as one Undo step each,
// Cancel leaving history and autosave alone, the Objects panel, layers, backup/load and STL export.
import {shipTopologies} from '../web/topology-pack.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {build} from 'esbuild';
import {initKernel} from '../web/kernel.mjs';
import {initLocalEngine} from '../web/local-engine.mjs';
import {prepareGlyphs,glyphOutlines,glyphsReady} from '../web/glyph-geometry.mjs';
import {GLYPH_CHARS} from '../web/glyph-metrics.mjs';
import {defaults,advancedDefaults,names} from '../web/templates.mjs';
const K=await initKernel();
const runtime=await initLocalEngine(K,{rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
await build({entryPoints:['web/main.mjs'],outfile:'build/test-ui-new-shapes.js',bundle:true,format:'iife',platform:'browser',target:'chrome100',external:['manifold-3d','node:*'],define:{'import.meta.url':'"https://appassets.androidplatform.net/assets/main.js"'},plugins:[{name:'test-renderer',setup(b){b.onResolve({filter:/^three$/},args=>args.importer.endsWith('three-test.mjs')?null:{path:process.cwd()+'/tests/three-test.mjs'});}}]});
const dom=new JSDOM(fs.readFileSync('web/index.html','utf8'),{url:'https://appassets.androidplatform.net/assets/index.html',pretendToBeVisual:true,runScripts:'outside-only'}),w=dom.window;
w.HTMLCanvasElement.prototype.setPointerCapture=function(){};w.HTMLCanvasElement.prototype.releasePointerCapture=function(){};w.HTMLCanvasElement.prototype.hasPointerCapture=function(){return false};const uiErrors=[];w.addEventListener('error',e=>uiErrors.push(e.error?.message||e.message));
w.HTMLCanvasElement.prototype.getBoundingClientRect=function(){return {left:0,top:0,right:412,bottom:600,width:412,height:600}};w.structuredClone=structuredClone;w.TextEncoder=TextEncoder;w.TextDecoder=TextDecoder;w.ResizeObserver=class{constructor(fn){this.fn=fn}observe(){this.fn()}};Object.defineProperty(w.HTMLCanvasElement.prototype,'clientWidth',{get:()=>412});Object.defineProperty(w.HTMLCanvasElement.prototype,'clientHeight',{get:()=>600});
// The worker as web/worker.mjs runs it: glyph outlines load with the first job that needs them; the picker asks once.
let outlineRequests=0;
w.Worker=class {postMessage(input){const data=structuredClone(input);setTimeout(async()=>{try{if(data.type==='glyphOutlines'){outlineRequests++;this.onmessage({data:{id:data.id,outlines:await glyphOutlines()}});return;}if(data.type==='warm')return;await prepareGlyphs(data);const result=runtime.process(data);result.engine=runtime.info;shipTopologies(result);this.onmessage({data:result});}catch(e){this.onmessage({data:{id:data.id,error:e.message}})}},0)}};
w.Android={beginFile(name,mime){w.testSaved={name,mime,chunks:[]}},appendFile(x){w.testSaved.chunks.push(x)},finishFile(){w.testSaved.done=true}};
w.eval(fs.readFileSync('build/test-ui-new-shapes.js','utf8'));
const $=id=>w.document.getElementById(id),click=id=>$(id).click(),sleep=()=>new Promise(r=>setTimeout(r,20)),q=s=>w.document.querySelector(s),qa=s=>[...w.document.querySelectorAll(s)];
const wait=async(fn,what='')=>{for(let i=0;i<400;i++){if(fn())return;await sleep();}throw Error('Wait timed out '+what+': '+JSON.stringify({error:$('editError')?.textContent,toast:$('toast').textContent,n:w.__cad.project.objects.length}))};
let checks=0;const ok=()=>checks++;
await wait(()=>w.__cad.model!==null);assert.equal(glyphsReady(),false,'no glyph load at startup');
const objs=()=>w.__cad.project.objects,hist=()=>w.__cad.historyLength,apply=async()=>{click('applyObject');await wait(()=>$('sheet').hidden,'apply');};
const built=async n=>wait(()=>w.__cad.model?.parts?.length===n&&w.__cad.model.parts.every(p=>objs().some(o=>o.id===p.id)),'build '+n);

// Add sheet: tiles 1–10 unchanged, Torus and Triangular prism as 11–12, then More shapes, then Reusable shapes.
click('addBtn');const tiles=qa('#sheetContent .shapegrid [data-shape]').map(b=>b.dataset.shape);assert.deepEqual(tiles,Object.keys(defaults));assert.deepEqual(tiles.slice(10),['torus','triprism']);
assert.deepEqual(qa('#sheetContent .shapegrid button').slice(10).map(b=>b.textContent),['Torus','Triangular prism']);
const labels=qa('#sheetContent .sectionlabel').map(e=>e.textContent);assert.deepEqual(labels,['More shapes','Reusable shapes']);
assert.equal($('advancedBtn').textContent,'Advanced shapes · 5 polyhedra');assert.equal($('lettersBtn').textContent,'Letters, numbers & symbols');assert.ok($('advancedBtn').classList.contains('full')&&$('lettersBtn').classList.contains('full'));
assert.ok($('smoothShape'));assert.ok(qa('#sheetContent > *').indexOf($('advancedBtn'))<qa('#sheetContent > *').indexOf($('prefabsBtn')));ok();

// Torus: Smooth on by default (the existing toggle) gives the 0.005 mm preset; no Faceted option; one Undo step.
const h0=hist();q('[data-shape="torus"]').click();assert.equal($('sheetTitle').textContent,'Add Torus');assert.equal(objs().length,0);
assert.equal(q('label[for="p_diameter"]').textContent,'Outer diameter');assert.equal(q('label[for="p_tube"]').textContent,'Tube diameter');
assert.deepEqual([...$('faceResolution').options].map(o=>o.value),['auto','tolerance']);assert.equal($('faceResolution').value,'tolerance');
await apply();await built(1);const torus=objs()[0];assert.equal(torus.type,'torus');assert.equal(torus.name,'Torus');assert.deepEqual(torus.resolution,{mode:'tolerance',tolerance:.005});
assert.ok(Math.abs(w.__cad.model.bounds.min[2])<1e-6&&Math.abs(w.__cad.model.bounds.max[2]-8)<1e-6,'on the plate');assert.equal(hist(),h0+1);
click('undo');await wait(()=>objs().length===0);click('redo');await wait(()=>objs().length===1);await built(1);ok();

// Triangular prism: stretch its top edge through Stretch → exact size; one Undo step.
click('addBtn');q('[data-shape="triprism"]').click();assert.deepEqual(['p_w','p_d','p_h'].map(id=>q(`label[for="${id}"]`).textContent),['Width X','Depth Y','Height Z']);$('pos0').value='50';await apply();await built(2);
const prism=objs()[1];assert.equal(prism.name,'Triangular prism');
const tool=w.__cad.touch;if(tool.getState().snap)click('snapStatus');tool.setMode('stretch');await wait(()=>w.__cad.model.parts[1].topology,'prism topology');
const side=w.__cad.model.parts.find(p=>p.id===prism.id).topology.faces.findIndex(f=>Math.abs(f.normal[1]+1)<1e-9);assert.ok(side>=0,'prism end face');
let h=hist();tool.selectFace(prism.id,side);click('stretchSize');assert.equal(Number($('exactSize').value),40);$('exactSize').value='55';click('applySize');await wait(()=>$('sheet').hidden&&objs()[1].params.d===55,'stretch');assert.equal(hist(),h+1);
click('undo');await wait(()=>objs()[1].params.d===40);click('redo');await wait(()=>objs()[1].params.d===55);tool.setMode('select');ok();

// Advanced shapes: 5 tiles in order, no Smooth toggle, overall size hint, edge length label; d10 keeps h editable.
click('addBtn');click('advancedBtn');assert.equal($('sheetTitle').textContent,'Advanced shapes');assert.deepEqual(qa('#sheetContent [data-shape]').map(b=>b.dataset.shape),Object.keys(advancedDefaults));
assert.deepEqual(qa('#sheetContent [data-shape]').map(b=>b.textContent),['Tetrahedron','Octahedron','Decahedron (d10)','Dodecahedron','Icosahedron']);assert.equal($('smoothShape'),null);
q('[data-shape="dodecahedron"]').click();assert.equal($('sheetTitle').textContent,'Add Dodecahedron');assert.equal(q('label[for="p_size"]').textContent,'Edge length');assert.equal($('faceResolution'),null);
assert.equal($('shapeSize').textContent,'Overall size 28.80 × 30.28 × 24.50 mm (X × Y × Z).');$('p_size').value='22';$('p_size').dispatchEvent(new w.Event('input'));assert.match($('shapeSize').textContent,/^Overall size 57\.60 × /);$('p_size').value='11';
$('pos1').value='50';await apply();await built(3);assert.ok(Math.abs(w.__cad.model.parts[2].bounds.min[2])<1e-6);
await wait(()=>w.__cad.model.parts[2]?.topology,'dodecahedron topology');assert.equal(w.__cad.model.parts[2].topology.faces.length,12);click('editBtn');await wait(()=>/^12 flat faces/.test($('faceCountMetrics').textContent),'face count');click('closeSheet');
click('addBtn');click('advancedBtn');q('[data-shape="decahedron"]').click();assert.equal(q('label[for="p_diameter"]').textContent,'Ring diameter');assert.equal(q('label[for="p_h"]').textContent,'Height Z');
assert.equal($('shapeSize').textContent,'Overall size 30.58 × 20.00 × 16.16 mm (X × Y × Z).');
// Cancel leaves history and autosave alone.
h=hist();const autosaved=w.localStorage.getItem('tristancad.autosave');click('cancelObject');assert.ok($('sheet').hidden);await sleep();await sleep();assert.equal(hist(),h);assert.equal(objs().length,3);assert.equal(w.localStorage.getItem('tristancad.autosave'),autosaved);ok();

// Letters, numbers & symbols: 94 tiles drawn from the real outlines (asked once), rows of 6 at ≥44 px; tap 'g'.
click('addBtn');click('lettersBtn');await wait(()=>$('sheetTitle').textContent==='Letters, numbers & symbols','letters sheet');
const glyphs=qa('#sheetContent [data-glyph]');assert.equal(glyphs.length,94);assert.deepEqual(glyphs.map(b=>b.getAttribute('aria-label')).join(''),GLYPH_CHARS);
assert.ok(glyphs.every(b=>b.querySelector('svg path')?.getAttribute('d').startsWith('M')),'outline tiles');assert.equal(outlineRequests,1);
assert.deepEqual(qa('#sheetContent .sectionlabel').map(e=>e.textContent),['Numbers','Capital letters','Small letters','Symbols']);
assert.ok(qa('#sheetContent .shapegrid').every(g=>g.getAttribute('style')==='grid-template-columns:repeat(6,1fr)'));assert.ok(glyphs.every(b=>/height:52px/.test(b.getAttribute('style'))));
// Amendment A1: a character is a tile like Box. Tapping 'g' opens the normal Add draft (no Character field, no
// typing); the name shows the character.
glyphs[GLYPH_CHARS.indexOf('g')].click();assert.equal($('sheetTitle').textContent,'Add Letter g');assert.equal($('p_char'),null);assert.equal(q('#sheetContent input[type="text"]:not(#objectName)'),null);
assert.equal(q('label[for="p_size"]').textContent,'Letter height');assert.equal(q('label[for="p_depth"]').textContent,'Depth Z');
assert.equal($('objectName').value,'Letter g');assert.equal($('faceResolution'),null);$('pos0').value='-50';
h=hist();await apply();await built(4);const g=objs()[3];assert.deepEqual(g.params,{char:'g',size:20,depth:5,font:'roboto-bold@1'});assert.equal(g.name,'Letter g');assert.equal(hist(),h+1);assert.equal(glyphsReady(),true);
assert.ok(Math.abs(w.__cad.model.parts[3].bounds.min[2])<1e-6);
click('addBtn');click('lettersBtn');await wait(()=>qa('#sheetContent [data-glyph]').length===94);assert.equal(outlineRequests,1,'outlines cached');click('closeSheet');ok();
// Edit the letter: Letter height, Depth and placement only; the character cannot be changed. Rotate and a parameter
// change are one Undo step each.
w.__cad.touch.deselect();await sleep();tool.selectFace(g.id,0);click('editBtn');assert.equal($('sheetTitle').textContent,'Edit Letter g');assert.equal($('p_char'),null);
assert.deepEqual(qa('#sheetContent .twocol input').map(e=>e.id),['p_size','p_depth']);click('closeSheet');
h=hist();click('editBtn');$('rot2').value='45';await apply();await wait(()=>objs()[3].rotation[2]===45);assert.equal(hist(),h+1);
h=hist();click('editBtn');$('p_depth').value='3';await apply();await wait(()=>objs()[3].params.depth===3);assert.equal(hist(),h+1);ok();

// Amendment A3: 'A', '@' and '7' from tiles only (Apply is a tap), then move with the Move tool (drag) and resize with
// the Stretch tool (drag the top face), each one Undo step; no keyboard input anywhere.
const onTop=id=>{const q=w.__cad.model.parts.find(p=>p.id===id),V=q.vertices,T=q.triangles;let zm=-1e9;for(let i=2;i<V.length;i+=3)zm=Math.max(zm,V[i]);for(let t=0;t<T.length;t+=3){const a=T[t]*3,b=T[t+1]*3,c=T[t+2]*3;if([a,b,c].every(k=>Math.abs(V[k+2]-zm)<1e-6))return [(V[a]+V[b]+V[c])/3,(V[a+1]+V[b+1]+V[c+1])/3,zm];}};
const drag=(from,to)=>{const c=$('scene'),a=tool.pointScreen(from),b=tool.pointScreen(to),ev=(type,at)=>{const e=new w.MouseEvent(type,{clientX:at[0],clientY:at[1],bubbles:true,cancelable:true});Object.defineProperty(e,'pointerId',{value:1});Object.defineProperty(e,'pointerType',{value:'touch'});c.dispatchEvent(e);};ev('pointerdown',a);for(let i=1;i<=10;i++)ev('pointermove',[a[0]+(b[0]-a[0])*i/10,a[1]+(b[1]-a[1])*i/10]);ev('pointerup',b);};
// QA note 4: the 94 tiles sit in the scrolling #sheetContent while the title and Close live outside it (always reachable);
// .shapegrid sections with the shared responsive rules on every platform (layout checked in a browser by letters-sheet-layout.mjs).
click('addBtn');click('lettersBtn');await wait(()=>qa('#sheetContent [data-glyph]').length===94);assert.ok(qa('#sheetContent .shapegrid').length>=1);
assert.ok(qa('#sheetContent [data-glyph]').every(b=>b.closest('#sheetContent')&&b.closest('.shapegrid')));assert.equal($('sheetContent').contains($('closeSheet')),false);assert.equal($('sheetContent').contains($('sheetTitle')),false);click('closeSheet');
for(const [k,[ch,name]] of [['A','Letter A'],['@','Symbol @'],['7','Number 7']].entries()){const n=objs().length;
 click('addBtn');click('lettersBtn');await wait(()=>qa('#sheetContent [data-glyph]').length===94);qa('#sheetContent [data-glyph]')[GLYPH_CHARS.indexOf(ch)].click();assert.equal($('objectName').value,name);$("pos1").value=String(-90-30*k);
 h=hist();await apply();await built(n+1);const o=objs()[n];assert.equal(o.name,name);assert.equal(o.params.char,ch);assert.equal(hist(),h+1);
 // move: select, Move tool, drag along X
 await wait(()=>w.__cad.model.parts.find(p=>p.id===o.id)?.topology,'topology '+ch);w.__cad.touch.deselect();tool.selectFace(o.id,0);tool.setMode('move');q('[data-axis="X"]').click();const x0=o.position[0];h=hist();const s0=onTop(o.id);drag(s0,[s0[0]+10,s0[1],s0[2]]);
 await wait(()=>!tool.isCommitting()&&objs()[n].position[0]!==x0,'move '+ch);assert.equal(hist(),h+1);
 click('undo');await wait(()=>objs()[n].position[0]===x0,'undo move '+ch);
 // resize: Stretch tool, drag the top cap up (depth grows)
 await wait(()=>w.__cad.model.parts.find(p=>p.id===o.id)?.topology,'topology '+ch);const top=w.__cad.model.parts.find(p=>p.id===o.id).topology.faces.findIndex(f=>f.kind==='PLANE'&&f.normal[2]>.99);
 tool.setMode('stretch');tool.selectFace(o.id,top);const d0=objs()[n].params.depth,s1=onTop(o.id);h=hist();drag(s1,[s1[0],s1[1],s1[2]+4]);
 await wait(()=>!tool.isCommitting()&&objs()[n].params.depth!==d0,'stretch '+ch);assert.ok(objs()[n].params.depth>d0);assert.equal(hist(),h+1);
 click('undo');await wait(()=>objs()[n].params.depth===d0,'undo stretch '+ch);tool.setMode('select');w.__cad.touch.deselect();}
await built(7);ok();

// Objects panel and layers: the new names list under the layer, a new layer takes the next shape.
click('objectsToggle');const panel=$('objectsPanel').textContent;for(const n of ['Torus','Triangular prism','Dodecahedron','Letter g','Symbol @'])assert.ok(panel.includes(n),n+' in Objects panel');click('objectsToggle');
const layerId='layer-2';w.__cad.change(p=>{p.layers.push({id:layerId,name:'Letters'});p.activeLayer=layerId;});await sleep();
click('addBtn');click('lettersBtn');await wait(()=>qa('#sheetContent [data-glyph]').length===94);qa('#sheetContent [data-glyph]')[GLYPH_CHARS.indexOf('k')].click();assert.equal($('objectLayer').value,layerId);$('pos1').value='-50';await apply();await built(8);assert.equal(objs()[7].layerId,layerId);ok();

// Backup → load → same model; STL export of the whole scene.
const volume=w.__cad.model.volume;click('projectMenu');click('backupProject');await wait(()=>w.testSaved?.done);const backed=JSON.parse(Buffer.concat(w.testSaved.chunks.map(x=>Buffer.from(x,'base64'))));click('closeSheet');
assert.deepEqual(backed.objects.map(o=>o.type),['torus','triprism','dodecahedron','glyph','glyph','glyph','glyph','glyph']);
w.__cad.load(w.__cad.templates.blank());await wait(()=>w.__cad.model.volume===0);w.__cad.load(backed);await built(8);assert.ok(Math.abs(w.__cad.model.volume-volume)<1e-6,'reloaded volume');
click('exportBtn');w.testSaved=null;click('downloadSTL');await wait(()=>w.testSaved?.done,'stl');const stl=Buffer.concat(w.testSaved.chunks.map(x=>Buffer.from(x,'base64')));assert.equal(stl.length,84+stl.readUInt32LE(80)*50);assert.ok(stl.readUInt32LE(80)>1000);ok();
// Delete is one Undo step.
w.__cad.touch.deselect();tool.selectFace(objs()[0].id,0);h=hist();click('editBtn');click('deleteObject');await wait(()=>objs().length===7);assert.equal(hist(),h+1);click('undo');await wait(()=>objs().length===8);ok();
// Android Back closes each new sheet.
for(const open of [()=>click('addBtn'),()=>{click('addBtn');click('advancedBtn');},async()=>{click('addBtn');click('lettersBtn');await wait(()=>qa('#sheetContent [data-glyph]').length===94);}]){await open();assert.equal($('sheet').hidden,false);assert.equal(w.handleBack(),true);assert.ok($('sheet').hidden);}ok();
assert.deepEqual(uiErrors,[]);
console.log('PASS:',checks,'new-shapes UI cases: Add sheet tiles 11–12 + More shapes, Advanced shapes (5, no cube, no Smooth), Letters picker (94 outline tiles, 6 columns, outlines asked once), Edit labels/size hint, no Character field (A1), A/@/7 from tiles with drag move + drag stretch (A3), smooth-only torus, Apply/stretch/rotate/param/move/delete = one Undo step each, Cancel leaves history/autosave, Objects panel, layers, backup/load, STL, Back.');
process.exit(0);
