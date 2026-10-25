// ADR-0001 F7: the Edit-glyph finish fields (lazy chunk, loaded when a letter's Edit sheet opens). Labels are the
// drafts pending approval: Plate, Margin, Engrave. Values are millimeters like the other fields. Letter bevel was
// removed from 3.0 (Master Chief, 2026-10-25).
// Absent params show as their defaults (no plate, 2 mm margin, Emboss) and are written only when they differ from
// those, so an untouched glyph stays a 2.x (v2) object.
const esc=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=(id,label,v)=>`<div class="field"><label for="${id}">${label}</label><input id="${id}" type="number" step="0.1" inputmode="decimal" value="${esc(v)}"></div>`;
export function finishFields(p){
 return `<div class="twocol">${num('f_plate','Plate',p.plate??0)}${num('f_margin','Margin',p.plateMargin??2)}</div><label class="toggle"><input id="f_engrave" type="checkbox" ${p.engrave===true?'checked':''}>Engrave</label>`;}
// Architect F7 ruling (2026-10-18 00:30 CT, ADR Q11): a NEW glyph's Add sheet is pre-filled with a 2 mm plate with a
// 2 mm margin, Emboss. Existing glyphs (Edit) show their own params unchanged; loading a project never calls newGlyphFinish.
export const NEW_GLYPH_FINISH=Object.freeze({plate:2,plateMargin:2});
export function newGlyphFinish(p){return p.plate==null?{...p,...NEW_GLYPH_FINISH}:p;}
export function readFinish(params,$){if(!$('f_plate'))return params;const n=id=>Number($(id).value),plate=n('f_plate'),margin=n('f_margin'),engrave=$('f_engrave').checked;
 const put=(k,v,on)=>{if(on)params[k]=v;else delete params[k];};
 put('plate',plate,plate!==0);put('plateMargin',margin,plate!==0);put('engrave',true,plate!==0&&engrave);return params;}
