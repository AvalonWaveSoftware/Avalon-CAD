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
export function loadUnit(storage=globalThis.localStorage){let v=null;try{v=storage?.getItem(UNIT_KEY);}catch{}unit=UNITS.includes(v)?v:'mm';return unit;}
export function setUnit(u,storage=globalThis.localStorage){if(!UNITS.includes(u))throw RangeError(String(u));unit=u;try{storage?.setItem(UNIT_KEY,u);}catch{}return unit;}
export const getUnit=()=>unit;
export function unitLabel(){return unit;}
// fmtLen(mm, digits) → the number as the UI prints it, no unit: mm with `digits` decimals (today's output), inches
// always with 3 decimals.
export function fmtLen(mm,digits=1){return unit==='in'?(Number(mm)/MM_PER_IN).toFixed(3):Number(mm).toFixed(digits);}
// parseLen(text) → mm, or NaN when the text is not a finite number.
export function parseLen(text){const v=Number(String(text).trim());return Number.isFinite(v)?(unit==='in'?v*MM_PER_IN:v):NaN;}
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
 'Extrusion height must be 0.05–10000 mm.':'Extrusion height must be 0.002–393.7 in.','Connecting bar diameter must be 0.5–10000 mm.':'Connecting bar diameter must be 0.02–393.7 in.'};
export const unitMessage=m=>unit==='in'&&INCH_MESSAGES[m]||m;
// stepOptions() → steps in mm (ruling 13): the edit-field step, the Move/Stretch drag steps (Free / 0.1 / 1 mm, or
// Free / 0.01 / 0.1 in), the sketch snap (1 mm or 0.05 in) and the grid cell (10 mm or 0.5 in).
export function stepOptions(){return unit==='in'?{input:0.001,drag:[0,0.254,2.54],snap:1.27,grid:12.7}:{input:0.1,drag:[0,0.1,1],snap:1,grid:10};}
// snapSketch(mm) → a sketch coordinate on the snap: whole mm (today's Math.round), or 0.05 in kept to 4 decimals of mm.
export const snapSketch=mm=>unit==='in'?Number((Math.round(mm/1.27)*1.27).toFixed(4)):Math.round(mm);
