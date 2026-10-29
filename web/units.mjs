// Length units (ADR-0001 §2.3 W0, §4 F1c). mm is the stored unit everywhere (files, autosave, exports, the engine);
// inches are a display-only app preference in localStorage UNIT_KEY, never in the project file, so they have no format
// impact. Default mm on every platform. UI-safe, no imports.
// Precision rule: display inches to 3 decimals (decimals only, ruling 15); parse inches to mm × 25.4 exactly; an edit
// field whose text is still exactly what was displayed keeps its stored mm (readLen), so repeated Apply never drifts.
// The UI (Architect UI round 1, rulings 11-14): the mm-or-in switch in the Edit sheet's Dimensions header; labels,
// fields, live measure, status line, bounds, axis tag, drag steps, sketch snap and the grid follow it. Export presets,
// STL metadata and tolerances stay mm. In mm every text and value is exactly today's.
export const UNITS=['mm','in'],UNIT_KEY='tristancad.units',MM_PER_IN=25.4;
let unit='mm';
// loadUnit(storage) reads the preference (anything unknown, or storage that throws, is mm); setUnit stores it.
export function loadUnit(storage=globalThis.localStorage){let v;try{v=storage?.getItem(UNIT_KEY);}catch{}return unit=UNITS.includes(v)?v:'mm';}
export function setUnit(u,storage=globalThis.localStorage){if(!UNITS.includes(u))throw RangeError(String(u));try{storage?.setItem(UNIT_KEY,u);}catch{}return unit=u;}
export const getUnit=()=>unit,unitLabel=getUnit;
// fmtLen(mm, digits) → the number as the UI prints it, no unit: mm with `digits` decimals (today's output), inches
// always with 3 decimals.
export function fmtLen(mm,digits=1){return unit==='in'?(mm/MM_PER_IN).toFixed(3):Number(mm).toFixed(digits);}
// parseLen(text) → mm, or NaN when the text is not a finite number.
export function parseLen(text){const v=+String(text).trim();return Number.isFinite(v)?(unit==='in'?v*MM_PER_IN:v):NaN;}
// readLen(text, shown, storedMm) → mm for Apply: the stored value when the field still holds exactly the text it was
// displayed with, otherwise the parsed text.
export function readLen(text,shown,storedMm){return String(text).trim()===String(shown).trim()?storedMm:parseLen(text);}
// byUnit(mmText, inText) → the mm text (today's, unchanged) or its inch twin.
export const byUnit=(mm,inch)=>unit==='in'?inch:mm;
// fieldLen(mm) → an edit field's text: mm exactly as stored (today's output), inches to 3 decimals.
export const fieldLen=mm=>unit==='in'?fmtLen(mm):String(mm);
// unitMessage(text) → a validation message in the shown unit (Master Chief approval, UI round 2 ruling 1): the mm
// limits of a length field read in inches while inches are on. Tolerance and export messages are not listed, so they stay mm.
const INCH_MESSAGES={'Dimension must be 0.05–10000 mm.':'Dimension must be 0.002–393.7 in.','Dimensions must be at least 0.05 mm.':'Dimensions must be at least 0.002 in.',
 'Extrusion height must be 0.05–10000 mm.':'Extrusion height must be 0.002–393.7 in.','Connecting bar diameter must be 0.5–10000 mm.':'Connecting bar diameter must be 0.02–393.7 in.',
 // ADR-0001 F7 ruling 1 (wired by F7, the second of F7 / inch-units to merge): the Engrave plate limit, 1 mm = 0.039 in.
 'Engrave needs a plate thicker than 1 mm.':'Engrave needs a plate thicker than 0.039 in.'};
// F8 shell in inches (current unit; wording approved by Master Chief 2026-10-25 11:29 CT). Self-contained: reverting this block and
// the unitMessage call in shell-ui.mjs restores the mm-only shell messages.
INCH_MESSAGES['Wall thickness must be at least 0.4 mm and less than half the smallest dimension.']='Wall thickness must be at least 0.016 in and less than half the smallest dimension.';
const HOLLOW_MM=/^Can't hollow this shape at (\d+(?:\.\d+)?) mm\. Try a smaller wall or remove rounds\.$/;
const shellInch=m=>HOLLOW_MM.test(m)?m.replace(HOLLOW_MM,(_,t)=>`Can't hollow this shape at ${(t/MM_PER_IN).toFixed(3)} in. Try a smaller wall or remove rounds.`):null;
export const unitMessage=m=>unit==='in'&&(INCH_MESSAGES[m]||shellInch(m))||m;
// stepOptions() → steps in mm (ruling 13): the edit-field step and the Move/Stretch drag steps (Free / 0.1 / 1 mm, or
// Free / 0.01 / 0.1 in). The sketch snap (1 mm or 0.05 in) is snapSketch below; the grid cell (10 mm or 0.5 in) is main.mjs gridHelper.
export function stepOptions(){return unit==='in'?{input:0.001,drag:[0,0.254,2.54]}:{input:0.1,drag:[0,0.1,1]};}
// snapSketch(mm) → a sketch coordinate on the snap: whole mm (today's Math.round), or 0.05 in kept to 4 decimals of mm.
export const snapSketch=mm=>unit==='in'?+(Math.round(mm/1.27)*1.27).toFixed(4):Math.round(mm);
