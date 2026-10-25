// ADR-0001 §8 + Architect ruling F6-4: the 3.0 worker budget is +15 KB gzip (15,360 B) for worker.js and
// worker-sidecar.js COMBINED, measured from their pre-3.0 sizes (tools/worker-budget.json, base e4f2104 = 2.7.2, the
// commit W0 was cut from). Both bundles are built here in memory exactly as the shipping build does: worker.js with
// OCCT_SIDECAR=false (Android), worker-sidecar.js with OCCT_SIDECAR=true and its nested-sidecar URL pointing at itself
// (the occt-sidecar-desktop-web build; this base does not ship it yet, so it is measured, not packaged). gzip is
// node zlib level 9 on both sides.
//   node tests/worker-budget.mjs                check the current tree against the reference
//   node tests/worker-budget.mjs --measure DIR  print the two sizes of another tree (used to write the reference)
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {gzipSync} from 'node:zlib';import {build} from 'esbuild';
export async function workerSizes(root){
 const fixed=on=>({name:'fixed-sidecar',setup(b){b.onLoad({filter:/[\\/]web[\\/](perf-flags|worker)\.mjs$/},a=>{let src=fs.readFileSync(a.path,'utf8');
  if(a.path.endsWith('perf-flags.mjs')){const line=['export const OCCT_SIDECAR=false;','export const OCCT_SIDECAR=!globalThis.Android;'].find(l=>src.includes(l));if(!line)throw Error('perf-flags.mjs: OCCT_SIDECAR line not found');src=src.replace(line,'export const OCCT_SIDECAR='+on+';');}
  else if(on){const ref="new URL('worker.js'";if(src.includes(ref))src=src.replace(ref,"new URL('worker-sidecar.js'");}
  return {contents:src,loader:'js'};});}});
 const out={};for(const [on,name] of [[false,'worker.js'],[true,'worker-sidecar.js']]){
  const r=await build({absWorkingDir:root,entryPoints:[path.join(root,'web/worker.mjs')],write:false,outfile:path.join(root,'out',name),bundle:true,format:'esm',platform:'browser',target:'chrome100',minify:true,plugins:[fixed(on)],external:['node:*','module','fs','path','crypto'],logLevel:'silent'});
  const bytes=r.outputFiles[0].contents;out[name]={raw:bytes.length,gz:gzipSync(bytes,{level:9}).length};}
 return out;}
if(process.argv[1]&&path.resolve(process.argv[1])===decodeURIComponent(new URL(import.meta.url).pathname)){
 if(process.argv[2]==='--measure'){console.log(JSON.stringify(await workerSizes(path.resolve(process.argv[3]))));process.exit(0);}
 const here=path.resolve(decodeURIComponent(new URL('..',import.meta.url).pathname)),ref=JSON.parse(fs.readFileSync(path.join(here,'tools/worker-budget.json'),'utf8')),now=await workerSizes(here);
 // The OCCT_SIDECAR=false bundle is the shipped worker.js: same bytes as the build output when it exists.
 const shipped=path.join(here,'app/assets/worker.js');if(fs.existsSync(shipped)&&fs.statSync(shipped).mtimeMs>Math.max(...fs.readdirSync(path.join(here,'web')).map(f=>fs.statSync(path.join(here,'web',f)).mtimeMs)))assert.equal(fs.statSync(shipped).size,now['worker.js'].raw,'measured worker.js = app/assets/worker.js');
 const d=Object.fromEntries(['worker.js','worker-sidecar.js'].map(n=>[n,now[n].gz-ref[n].gz])),total=d['worker.js']+d['worker-sidecar.js'];
 assert.ok(total<=ref.budget,`3.0 worker budget exceeded: ${total} B gz > ${ref.budget} B (worker.js ${d['worker.js']} + worker-sidecar.js ${d['worker-sidecar.js']})`);
 console.log(`worker budget (3.0, combined, vs ${ref.base}): worker.js ${now['worker.js'].gz} B gz (${d['worker.js']>=0?'+':''}${d['worker.js']}), worker-sidecar.js ${now['worker-sidecar.js'].gz} B gz (${d['worker-sidecar.js']>=0?'+':''}${d['worker-sidecar.js']}), total ${total>=0?'+':''}${total} of +${ref.budget} B`);}
