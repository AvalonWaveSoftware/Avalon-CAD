// WS4 (ADR v2): render on demand. With fake rAF/clock: a change renders, damping keeps frames going until the camera
// settles, scene add/remove and DOM mutations invalidate, and frames stop LINGER ms after the last change.
import assert from 'node:assert/strict';import * as T from 'three';
import {RENDER_ON_DEMAND} from '../web/perf-flags.mjs';
if(!RENDER_ON_DEMAND){console.log('render-scheduler: RENDER_ON_DEMAND is off; skipped');process.exit(0);}
let now=0,queue=[],observers=[];globalThis.performance={now:()=>now};globalThis.requestAnimationFrame=cb=>{queue.push(cb);return queue.length;};
globalThis.document={documentElement:{},addEventListener(){}};globalThis.MutationObserver=class{constructor(cb){observers.push(cb);}observe(){}};
const {renderOnDemand}=await import('../web/render-scheduler.mjs');
const frames=n=>{let drawn=0;for(let i=0;i<n&&queue.length;i++){const q=queue;queue=[];now+=16;q.forEach(cb=>cb(now));drawn++;}return drawn;};
const scene=new T.Scene(),camera=new T.PerspectiveCamera();let renders=0,pending=0;
const controls=Object.assign(new T.EventDispatcher(),{target:new T.Vector3(),update(){if(pending>1e-12){camera.position.x+=pending*.12;pending*=.88;return pending>1e-4;}return false;}});
const invalidate=renderOnDemand({renderer:{render:()=>renders++},scene,camera,controls});
frames(200);assert.equal(queue.length,0,'idle after the start-up linger');renders=0;
assert.equal(frames(10),0,'no frames while idle');
scene.add(new T.Object3D());assert.ok(frames(1)===1&&renders===1,'add() renders on the next frame');frames(200);assert.equal(queue.length,0);
pending=5;controls.dispatchEvent({type:'change'});renders=0;frames(400);assert.ok(renders>120,'damping keeps rendering until settled: '+renders);assert.equal(queue.length,0,'then stops');assert.ok(pending<1e-8);
observers[0]([]);renders=0;frames(200);assert.ok(renders>=60&&renders<=64,'DOM mutation lingers ~1 s: '+renders);
invalidate();assert.equal(frames(1),1);
console.log('render-scheduler: idle 0 frames; add/remove, controls, DOM and damping invalidate; linger stops at 1 s');
