// Waydroid QA 2026-10-25 D1 (ADR-0001 F7 P3): a wasm trap inside OCCT (RuntimeError: memory access out of bounds,
// unreachable, null function or function signature mismatch…) leaves its heap inconsistent. Every OCCT catch passes the
// error through here: a trap is recorded (the worker resets OCCT before the next job) and rethrown unchanged, never
// turned into the hollow or roundover message or dropped by a dispose. Before this, hollowBrep and the dispose helpers
// swallowed traps, so OCCT was never reset and every later OCCT job failed with 'null function' until a restart.
let trapped=false,last=null;
export const isTrap=e=>e instanceof WebAssembly.RuntimeError;
export function noteOcctError(e){if(isTrap(e)){trapped=true;last=e;}return e;}
export const passTrap=e=>{if(isTrap(noteOcctError(e)))throw e;};
export const occtNeedsReset=()=>trapped;
export function clearTrap(){const e=last;trapped=false;last=null;return e;}
export const lastTrap=()=>last;
