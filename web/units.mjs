// Length units (ADR-0001 §2.3, W0). mm-only stubs with the final signatures, so later workstreams write unit-aware strings
// from the start; F1c adds inches as a display-only preference (mm stays the stored unit). UI-safe.
export const UNITS=['mm'];
export function unitLabel(){return 'mm';}
// fmtLen(mm, digits) → the number as today's UI prints it (fixed digits, no unit); stored values are always mm.
export function fmtLen(mm,digits=1){return Number(mm).toFixed(digits);}
// parseLen(text) → mm, or NaN when the text is not a finite number.
export function parseLen(text){const v=Number(String(text).trim());return Number.isFinite(v)?v:NaN;}
// stepOptions() → the drag/input steps in mm: the 0.1 mm edit step and the snap steps used by the move/stretch tools.
export function stepOptions(){return {input:0.1,drag:0.1};}
