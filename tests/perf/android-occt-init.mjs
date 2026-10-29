// Isolated initSolid cost with the shipped optimized OCCT binary. Worker bootstrap/IPC is measured separately by
// occt-watchdog.mjs's restart + first fillet timing; no production instrumentation or protocol fields are added.
import {Worker,isMainThread,parentPort} from 'node:worker_threads';import fs from 'node:fs';import os from 'node:os';
if(!isMainThread){
 const {initSolid}=await import('../../web/cad-solid.mjs'),wasmBinary=fs.readFileSync('app/assets/cad-kernel.wasm');
 const start=performance.now();await initSolid({wasmBinary});parentPort.postMessage(performance.now()-start);
}else{
 const ms=[];for(let i=0;i<5;i++){const worker=new Worker(new URL(import.meta.url));ms.push(await new Promise((resolve,reject)=>{worker.once('message',resolve);worker.once('error',reject);}));await worker.terminate();}
 console.log(JSON.stringify({initSolidMs:ms,medianMs:[...ms].sort((a,b)=>a-b)[2],loadavg:os.loadavg()}));
}
