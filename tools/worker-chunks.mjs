// 3.0 worker lazy chunks: web modules the worker only needs for one job type. worker.mjs (via local-engine.mjs) loads
// them with import(); the worker bundles keep that import() as a load of the separate asset next to worker.js, built
// once here and counted once in the worker budget (tests/worker-budget.mjs). Packaging ships every asset named here.
import path from 'node:path';
export const WORKER_CHUNKS={'worker-stl.mjs':'chunk-wstl.js'};
export const workerChunkPlugin={name:'worker-chunks',setup(b){b.onResolve({filter:/^\.\/worker-[\w-]+\.mjs$/},a=>{const out=WORKER_CHUNKS[a.path.slice(2)];return out&&a.kind==='dynamic-import'?{path:'./'+out,external:true}:undefined;});}};
export const workerChunkBuilds=root=>Object.entries(WORKER_CHUNKS).map(([src,out])=>({out,options:{absWorkingDir:root,entryPoints:[path.join(root,'web',src)],bundle:true,format:'esm',platform:'browser',target:'chrome100',minify:true,external:['node:*','module','fs','path','crypto']}}));
