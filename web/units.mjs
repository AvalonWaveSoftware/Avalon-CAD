// Length units (ADR-0001 §2.3 W0, §4 F1c). mm is the stored unit everywhere (files, autosave, exports, the engine);
// inches are a display-only app preference in localStorage UNIT_KEY, never in the project file, so they have no format
// impact. Default mm on every platform. UI-safe, no imports.
// F1c core (this commit): the preference and the precision rule. Display in inches to 3 decimals; parse inches to
// mm × 25.4 exactly; an edit field whose text is still exactly what was displayed keeps its stored mm (readLen), so
// repeated Apply never drifts. Nothing in the app calls loadUnit() yet, so the unit stays mm and every output is the
// W0 stub's. Wiring the UI (labels, steps, grid, the Settings toggle) waits for the F1c questions in the handoff.
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
// stepOptions() → the drag/input steps in mm (0.1 mm edit step, 0.1 mm drag step). Inch steps are an open F1c
// question, so this stays mm in both units for now.
export function stepOptions(){return {input:0.1,drag:0.1};}
