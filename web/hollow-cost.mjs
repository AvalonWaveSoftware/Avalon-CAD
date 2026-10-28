// D6 (Master Chief 2026-10-27: "Refuse it up front from the estimated size"). Main thread only, no job is sent: the
// estimated triangle count of the part (the kernel's own segment rule, kernel.mjs makeLocalSolid) gives an estimate of
// the box time of its exact OCCT hollow; above HOLLOW_REFUSE_MS the Edit sheet refuses the hollow at once with the
// hollow error. Fit on box timings (scratch/d6/hsweep.jsonl, node, exact hollow check, wall 2 mm):
//   curved faces OCCT meshes (sphere, cone, cylinder): ms ≈ 1.32 · tris^0.688 · tol^-0.479
//   torus (sampled faces):                             ms ≈ 27 · tris^0.268 · tol^-0.198
// The fit under-estimates by at most 1.36x (it over-estimates cylinders up to 7x), so the limit is 2x the 3 s target: every hollow measured under 3 s on
// the box is still allowed; the Ø400 sphere at 0.005 (100,352 triangles) estimates ~45 s and is refused. Other types
// (planar, tube, extrusions) measured well under 1 s and are not estimated.
import {segments} from './kernel-ui.mjs';
export const HOLLOW_REFUSE_MS=6000;
const tol=o=>o.resolution?.mode==='tolerance'?o.resolution.tolerance:.15;
export function hollowEstimate(o){const p=o.params||{},t=tol(o);if(o.resolution?.mode==='faces')return null;
 if(o.type==='sphere'){const n=segments(p.diameter/2,t),tris=n*n/2;return {tris,ms:1.32*tris**.688*t**-.479};}
 if(o.type==='cylinder'||o.type==='cone'){const n=segments(Math.max(p.diameter,p.top||0)/2,t),tris=4*n;return {tris,ms:1.32*tris**.688*t**-.479};}
 if(o.type==='torus'){const tris=2*segments(p.tube/2,t)*segments(p.diameter/2,t);return {tris,ms:27*tris**.268*t**-.198};}
 return null;}
export const hollowTooSlow=o=>!!o.shell&&(hollowEstimate(o)?.ms??0)>HOLLOW_REFUSE_MS;
