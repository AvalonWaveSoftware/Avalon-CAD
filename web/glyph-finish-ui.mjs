// ADR-0001 F7: the Edit-glyph finish fields (lazy chunk, loaded when a letter's Edit sheet opens). Labels are the
// drafts pending approval: Bevel, Round/Chamfer, Plate, Margin, Engrave. Values are millimeters like the other fields.
// Absent params show as their defaults (no bevel, chamfer, no plate, 2 mm margin, Emboss) and are written only when
// they differ from those, so an untouched glyph stays a 2.x (v2) object.
const esc=v=>String(v).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const num=(id,label,v)=>`<div class="field"><label for="${id}">${label}</label><input id="${id}" type="number" step="0.1" inputmode="decimal" value="${esc(v)}"></div>`;
export function finishFields(p){const round=p.bevelProfile==='round';
 return `<div class="twocol">${num('f_bevel','Bevel',p.bevel??0)}<div class="field"><label for="f_profile">Round/Chamfer</label><select id="f_profile"><option value="chamfer" ${round?'':'selected'}>Chamfer</option><option value="round" ${round?'selected':''}>Round</option></select></div>${num('f_plate','Plate',p.plate??0)}${num('f_margin','Margin',p.plateMargin??2)}</div><label class="toggle"><input id="f_engrave" type="checkbox" ${p.engrave===true?'checked':''}>Engrave</label>`;}
// Architect F7 ruling (2026-10-18 00:30 CT, ADR Q11) as changed by F7 Bevel default (Master Chief, 2026-10-18): a NEW
// glyph's Add sheet is pre-filled with Bevel 0 (off; Chamfer stays the profile), a 2 mm plate with a 2 mm margin, Emboss.
// Existing glyphs (Edit) show their own params unchanged; loading a project never calls newGlyphFinish.
export const NEW_GLYPH_FINISH=Object.freeze({bevel:0,plate:2,plateMargin:2});
export function newGlyphFinish(p){return p.bevel==null&&p.plate==null?{...p,...NEW_GLYPH_FINISH}:p;}
export function readFinish(params,$){if(!$('f_bevel'))return params;const n=id=>Number($(id).value),bevel=n('f_bevel'),plate=n('f_plate'),margin=n('f_margin'),profile=$('f_profile').value,engrave=$('f_engrave').checked;
 const put=(k,v,on)=>{if(on)params[k]=v;else delete params[k];};
 put('bevel',bevel,bevel!==0);put('bevelProfile',profile,bevel!==0&&profile!=='chamfer');put('plate',plate,plate!==0);put('plateMargin',margin,plate!==0);put('engrave',true,plate!==0&&engrave);return params;}
// Architect F7 ruling 4: the half-size notice. main.mjs passes the value and unit from units.mjs fmtLen(v,2)/unitLabel()
// (ruling 3, wired by F7 as the second of F7 / inch-units to merge); not imported here because units.mjs would then be
// split into a shared chunk (startup-split rule). The defaults are today's mm text.
export function bevelNoticeText(used,char,value=Number(used).toFixed(2),unit='mm'){return `Bevel reduced to ${value} ${unit} on '${char}'`;}
