// ADR-0001 F2a option A: 3MF vs STL encode on the 524k-triangle sphere, medians of 5 after a warm-up, wall and process
// CPU (all threads), with the box load average. Node worker_threads stand in for the page's workers.
//   node tests/perf/export-3mf-pool-bench.mjs [runs=5]
import fs from 'node:fs';import os from 'node:os';import {pathToFileURL} from 'node:url';
import {initKernel} from '../../web/kernel.mjs';import {initRustMesh} from '../../web/rust-mesh.mjs';
import {createPool} from '../../web/export-3mf-pool.mjs';import {nodeWorker} from '../node-web-worker.mjs';
const RUNS=+process.argv[2]||5,binary=fs.readFileSync('app/assets/mesh-core.wasm'),script=pathToFileURL('app/assets/export-pool.js').href;
const K=await initKernel();const s=K.Manifold.sphere(25,1024);const m=s.getMesh();s.delete();
const v=Float32Array.from(m.vertProperties),t=Uint32Array.from(m.triVerts);const rust=await initRustMesh({binary});
const out=fs.mkdtempSync(os.tmpdir()+'/e3-bench-');
const save=(name,buf)=>{const fd=fs.openSync(out+'/'+name,'w');fs.writeSync(fd,new Uint8Array(buf));fs.fsyncSync(fd);fs.closeSync(fd);};
const med=a=>[...a].sort((x,y)=>x-y)[a.length>>1];
async function time(label,fn,{warm=true,setup}={}){if(warm){const c=setup?await setup():undefined;await fn(c);}const wall=[],cpu=[];let r;
 for(let i=0;i<RUNS;i++){const c=setup?await setup():undefined;const c0=process.cpuUsage(),w0=performance.now();r=await fn(c);wall.push(performance.now()-w0);const d=process.cpuUsage(c0);cpu.push((d.user+d.system)/1000);}
 const row={label,wallMs:+med(wall).toFixed(0),cpuMs:+med(cpu).toFixed(0),load:os.loadavg()[0].toFixed(1),bytes:r?.byteLength};console.log(JSON.stringify(row));return row;}
console.log(JSON.stringify({cpus:os.cpus().length,load:os.loadavg().map(x=>x.toFixed(1)),triangles:t.length/3}));
const rows=[];
rows.push(await time('STL encode',()=>rust.writeSTL(v,t,true)));
rows.push(await time('3MF encode, 1 thread (fallback path)',()=>rust.write3MF(v,t,true)));
const minZ=()=>rust.prepare3MF(v,t,true);
for(const n of [4,2]){
 const pool=createPool({size:n,script,binary,makeWorker:nodeWorker});await pool.ready;
 rows.push(await time(`3MF encode, warm pool of ${n}`,()=>pool.encode({vertices:v,triangles:t,minZ:minZ()})));
 rows.push(await time(`3MF export incl. save, warm pool of ${n}`,async()=>{const b=await pool.encode({vertices:v.slice(),triangles:t.slice(),minZ:minZ()});save('a.3mf',b);return b;}));
 pool.dispose();
 rows.push(await time(`3MF encode, cold pool of ${n} (incl. pool start)`,async()=>{const p=createPool({size:n,script,binary,makeWorker:nodeWorker});await p.ready;const b=await p.encode({vertices:v,triangles:t,minZ:minZ()});p.dispose();return b;}));
}
rows.push(await time('STL export incl. save',()=>{const b=rust.writeSTL(v,t,true);save('a.stl',b);return b;}));
rows.push(await time('3MF export incl. save, 1 thread (fallback path)',()=>{const b=rust.write3MF(v.slice(),t.slice(),true);save('b.3mf',b);return b;}));
const stl=rows[0];for(const r of rows)if(r.label.startsWith('3MF encode'))console.log(`${r.label}: ${(r.wallMs/stl.wallMs).toFixed(2)}x STL wall, ${(r.cpuMs/stl.cpuMs).toFixed(2)}x STL CPU (gate: <= 1.3x)`);
fs.rmSync(out,{recursive:true});process.exit(0);
