// Waydroid QA 2026-10-25 (b) and (c), UI side (pending Master Chief; approved-areas.json entries):
//  (b) a hollow part's face count is the base shape's (hollow picks use base faces), so the label says 'before hollow';
//  (c) the Mirror Copy toggle shows its state: aria-pressed plus existing style values inline (on: the active-mode
//      background #2a4b45, off: the muted text colour), no new strings, style.css unchanged.
//   node tests/waydroid-fix-ui.mjs
import assert from 'node:assert/strict';import fs from 'node:fs';
import {faceSummary} from '../web/resolution-ui.mjs';
const part={triangles:new Uint32Array(8048*3),topology:{faceCount:4,flatFaces:2}};
assert.equal(faceSummary(part,{type:'tube'}),'4 surface faces · 8,048 mesh triangles');
assert.equal(faceSummary(part,{type:'tube',shell:{thickness:1.5,open:[1]}}),'4 surface faces before hollow · 8,048 mesh triangles');
assert.equal(faceSummary(part),'4 surface faces · 8,048 mesh triangles','callers without the object keep the old text');
// style.css stays byte-identical (dom-baseline static files): the state uses the existing values inline.
const css=fs.readFileSync(new URL('../web/style.css',import.meta.url),'utf8'),touch=fs.readFileSync(new URL('../web/touch-tools.mjs',import.meta.url),'utf8');
assert.ok(css.includes('.touchmodes .active{background:#2a4b45')&&css.includes('--muted:'),'both values are existing styles');
assert.ok(touch.includes(`<button id="mirrorCopy" aria-pressed="\${mirrorCopy}" class="\${mirrorCopy?'active':''}" style="\${mirrorCopy?'background:#2a4b45':'color:var(--muted)'}">Copy</button>`),'Copy: aria-pressed and the on/off style');
console.log('waydroid-fix-ui: hollow face label and Mirror Copy on/off state ok');
