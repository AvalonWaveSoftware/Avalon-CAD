// WS1 (ADR v2): disposal scope for replicad/OpenCascade wrappers. Every object handed to own()/own.all() inside
// withScope(fn) is deleted exactly once when fn returns or throws, in reverse creation order.
import {noteOcctError} from './occt-trap.mjs';
export function withScope(fn){
 const owned=[],seen=new Set();
 const own=o=>{if(o&&typeof o.delete==='function'&&!seen.has(o)){seen.add(o);owned.push(o);}return o;};
 own.all=list=>{for(const o of list)own(o);return list;};
 try{return fn(own);}
 finally{for(let i=owned.length-1;i>=0;i--){try{owned[i].delete();}catch(e){noteOcctError(e);}}}
}
let oc=null;
export function setHeapSource(instance){oc=instance;}
// Bytes currently reserved by the OpenCascade wasm heap (it only grows), or 0 before initSolid().
export function heapBytes(){return oc?.wasmMemory?.buffer?.byteLength||oc?.HEAPU8?.buffer?.byteLength||0;}
