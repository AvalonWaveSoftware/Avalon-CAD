// ADR-0001 F7 Bevel default (Master Chief, 2026-10-18): a NEW glyph's Add sheet pre-fills Bevel 0 (off), Chamfer, Plate 2,
// Margin 2, Engrave off. Saved glyphs keep their stored finish: newGlyphFinish only fills a glyph that has neither bevel nor
// plate, and loading a project never calls it, so a saved bevel:0.5 glyph loads as 0.5 and its STL is byte-identical to
// the STL before the change (pinned below, taken at bfec831 with the 0.5 default).
//   node tests/glyph-bevel-default.mjs
import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';
import {NEW_GLYPH_FINISH,newGlyphFinish,finishFields,readFinish} from '../web/glyph-finish-ui.mjs';
import {migrateProject} from '../web/migrate.mjs';import {validateProject} from '../web/kernel-ui.mjs';
const {initKernel}=await import('../web/kernel.mjs');const {initLocalEngine}=await import('../web/local-engine.mjs');
const {object,blank}=await import('../web/templates.mjs');const {loadGlyphs}=await import('../web/glyph-geometry.mjs');
const STL_SHA256='ab4448e23bfe8235f4354ad0352cd1a60b261afc9ed4fb71d3361104605073cf';
let checks=0;
// New glyph: bevel 0, plate 2, margin 2; Apply of the untouched pre-fill writes no bevel (2.x glyph + plate).
const fresh={char:'g',size:20,depth:5,font:'roboto-bold@1'};
assert.deepEqual({...NEW_GLYPH_FINISH},{bevel:0,plate:2,plateMargin:2});assert.equal(newGlyphFinish(fresh).bevel,0);checks+=2;
{const html=finishFields(newGlyphFinish(fresh)),val=id=>html.match(new RegExp(`id="${id}"[^>]*value="([^"]*)"`))[1];
 assert.deepEqual(['f_bevel','f_plate','f_margin'].map(val),['0','2','2']);assert.match(html,/<option value="chamfer" selected>/);assert.doesNotMatch(html,/id="f_engrave"[^>]*checked/);
 const el={f_bevel:{value:val('f_bevel')},f_plate:{value:val('f_plate')},f_margin:{value:val('f_margin')},f_profile:{value:'chamfer'},f_engrave:{checked:false}};
 assert.deepEqual(readFinish({...fresh},id=>el[id]),{...fresh,plate:2,plateMargin:2},'untouched pre-fill saves no bevel');checks+=4;}
// Saved glyphs keep their finish: newGlyphFinish leaves any glyph with a bevel or a plate alone.
for(const p of [{...fresh,bevel:.5},{...fresh,bevel:.5,bevelProfile:'round',plate:2,plateMargin:2},{...fresh,plate:3,plateMargin:1},{...fresh,bevel:0.3,plate:2,plateMargin:2,engrave:true}]){assert.deepEqual(newGlyphFinish(p),p);checks++;}
// A saved v3 project with a bevel:0.5 glyph loads as 0.5 (migrate + validate never fill finish params).
const saved=blank();saved.version=3;saved.buildPlaneEnabled=true;const o=object('glyph',{...fresh,bevel:.5,plate:2,plateMargin:2},[0,0,0],'Letter g');o.id='g1';saved.objects=[o];
const loaded=migrateProject(JSON.parse(JSON.stringify(saved)));validateProject(loaded);
assert.deepEqual(loaded.objects[0].params,{...fresh,bevel:.5,plate:2,plateMargin:2});checks++;
// Its STL is byte-identical to the STL before the default changed.
const K=await initKernel();await loadGlyphs();const E=await initLocalEngine(K,{rust:{binary:fs.readFileSync(new URL('../app/assets/mesh-core.wasm',import.meta.url))}});
const ex=E.process({id:1,type:'export',project:loaded,tolerance:.15,ground:true});assert.ok(!ex.error,ex.error);
const sha=crypto.createHash('sha256').update(Buffer.from(ex.buffer.buffer?ex.buffer.buffer:ex.buffer,ex.buffer.byteOffset||0,ex.buffer.byteLength)).digest('hex');
if(process.argv.includes('--print'))console.log(sha);else{assert.equal(sha,STL_SHA256,'saved bevel:0.5 glyph STL unchanged');checks++;}
console.log(`PASS glyph-bevel-default: ${checks} checks: new glyph Bevel 0 (Plate 2, Margin 2, Chamfer, Engrave off; untouched Apply saves no bevel), saved finishes untouched, saved bevel:0.5 loads as 0.5, its STL byte-identical (${sha.slice(0,16)})`);
