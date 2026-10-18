// ADR-0001 F2a option A: parallel 3MF encode with exact, worker-count-independent bytes. Part of the lazy 3MF chunk
// (main.mjs loads it only when 3MF is chosen). The pool is created on the first 3MF export and kept for the session:
// min(cores - 1, 4) workers, at most 2 on Android. Pool workers are started by the page exactly like worker.js
// (module worker, same asset path and ?v= token), load mesh-core.wasm once, and receive their records as
// transferables. The geometry worker builds and validates the mesh (format '3mf-mesh'); the pool encodes the 8 fixed
// parts and joins them. If the pool cannot start or fails at any point, the geometry worker encodes the same parts
// itself ('encode3mf', identical bytes): export never fails because of the pool. One debug line per export goes to
// the console (and globalThis.__avalon3MF); there is no visible UI.
import {PARTS_3MF,partRange3MF} from './three-mf-parts.mjs';

export function poolSize(cores=globalThis.navigator?.hardwareConcurrency||2,android=!!globalThis.Android){return Math.max(1,Math.min(cores-1,android?2:4));}

const defaultWorker=url=>new Worker(url,{type:'module',name:'3mf-pool'});

/** Starts `size` pool workers. `wasm` is the mesh-core.wasm URL (or `binary`, an ArrayBuffer, for tests). */
export function createPool({size=poolSize(),script,wasm,binary,makeWorker=defaultWorker,timeout=8000}={}){
 const workers=[],pending=new Map();let nextId=0,dead=false,error='';
 const kill=reason=>{if(dead)return;dead=true;error=error||reason;for(const w of workers){try{w.terminate();}catch{}}for(const p of pending.values())p.reject(Error(error));pending.clear();};
 const ready=new Promise(resolve=>{
  let left=size;const timer=setTimeout(()=>{kill('pool start timed out');resolve(false);},timeout);
  const done=ok=>{if(!ok){clearTimeout(timer);resolve(false);return;}if(--left===0){clearTimeout(timer);resolve(!dead);}};
  try{for(let i=0;i<size;i++){const w=makeWorker(script);workers.push(w);
   w.onmessage=({data})=>{if(data.op==='ready')return done(true);if(data.op==='failed'){kill('worker failed to start: '+data.error);return done(false);}
    const p=pending.get(data.id);if(!p)return;pending.delete(data.id);data.op==='error'?p.reject(Error(data.error)):p.resolve(data);};
   w.onerror=e=>{e?.preventDefault?.();kill('worker error: '+(e?.message||'load failed'));done(false);};
   w.onmessageerror=()=>{kill('worker message error');done(false);};
   w.postMessage(binary?{op:'init',binary:binary.slice(0)}:{op:'init',wasm});}}
  catch(e){kill('workers unavailable: '+(e?.message||e));clearTimeout(timer);resolve(false);}
 });
 const call=(w,msg,transfer=[])=>new Promise((resolve,reject)=>{if(dead)return reject(Error(error));const id=++nextId;pending.set(id,{resolve,reject});w.postMessage({...msg,id},transfer);});
 return {size,ready,get dead(){return dead;},get error(){return error;},
  /** The 3MF package of a validated mesh ({vertices, triangles, minZ}) from PARTS_3MF parts, by a work queue. */
  async encode({vertices,triangles,minZ}){
   const points=vertices.length/3,tris=triangles.length/3,parts=new Array(PARTS_3MF);let next=0;
   const loop=async w=>{while(next<PARTS_3MF){const k=next++,[a,b]=partRange3MF(points,tris,k);
    const v=k<4?vertices.slice(a*3,b*3):new Float32Array(0),t=k<4?new Uint32Array(0):triangles.slice(a*3,b*3);
    const r=await call(w,{op:'part',k,minZ,vertices:v,triangles:t},[v.buffer,t.buffer]);parts[k]={bytes:r.bytes,crc:r.crc,size:r.size};}};
   await Promise.all(workers.map(loop));
   return (await call(workers[0],{op:'package',parts},parts.map(p=>p.bytes))).buffer;
  },
  memory(){return Promise.all(workers.map(w=>call(w,{op:'memory'}).then(r=>r.memory)));},
  dispose(){kill('pool closed');}};
}

let current=null,broken='';
/** Tears the session pool down (project close). The next 3MF export starts a new one. */
export function dispose3MFPool(){current?.dispose();current=null;broken='';}
export function current3MFPool(){return current;}

/**
 * Runs a 3MF export. `request(type, data, transfer)` talks to the geometry worker; `payload` is the export job
 * (project, tolerance, ground); `assetURL(name)` resolves an app asset with its ?v= token, as main.mjs does for
 * worker.js. `options`: forceFallback, size, makeWorker, binary, timeout, log.
 */
export async function export3MF({request,payload,assetURL,options={}}){
 const t0=performance.now(),log=options.log===undefined?console.info:options.log;let pool=null,cold=false,reason=options.forceFallback?'forced':broken;
 if(!reason){if(!current){current=createPool({size:options.size,script:assetURL('export-pool.js'),wasm:assetURL('mesh-core.wasm'),binary:options.binary,makeWorker:options.makeWorker,timeout:options.timeout});cold=true;}pool=current;}
 const data=await request('export',{...payload,format:'3mf-mesh'});
 const mesh=data.mesh3mf;delete data.mesh3mf;
 let buffer=null;
 if(pool){try{if(!await pool.ready)throw Error(pool.error||'pool did not start');
  // Watchdog: a pool that stops answering falls back too.
  buffer=await Promise.race([pool.encode(mesh),new Promise((_,reject)=>setTimeout(()=>reject(Error('pool timed out')),options.encodeTimeout||60000))]);}
  catch(e){reason=String(e?.message||e);broken=reason;pool.dispose();if(current===pool)current=null;}}
 if(!buffer)buffer=(await request('encode3mf',{vertices:mesh.vertices,triangles:mesh.triangles,ground:payload.ground},[mesh.vertices.buffer,mesh.triangles.buffer])).buffer;
 const encoder={path:buffer&&pool&&!reason?'pool':'fallback',workers:pool&&!reason?pool.size:0,cold,ms:Math.round(performance.now()-t0),...(reason?{reason}:{})};
 globalThis.__avalon3MF=encoder;log?.('[Avalon 3MF] '+JSON.stringify(encoder));
 return {...data,buffer,format:'3mf',encoder};
}
