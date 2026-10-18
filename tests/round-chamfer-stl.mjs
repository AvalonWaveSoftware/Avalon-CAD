// ADR-0001 F6 gate (§5.1 item 2, §5.2 "a file with only rounds is unchanged"): STL exports and saved JSON of existing
// models (templates, fixtures, every primitive with and without rounds, all-edge rounds, glyph rounds) are byte-identical
// to the base commit. Usage: node tests/round-chamfer-stl.mjs [base-tree]   (base tree default /tmp/f6/base: a
// `git archive 8fa7115` with node_modules and app/assets/mesh-core.wasm). Each tree runs in its own process.
import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
if(process.argv[2]==='--emit'){
 const root=process.argv[3],imp=f=>import(root+'/web/'+f);
 const {initKernel}=await imp('kernel.mjs'),{initLocalEngine}=await imp('local-engine.mjs'),{object,defaults,advancedDefaults,glyphDefaults,blank,plate,tray}=await imp('templates.mjs');
 const {withRoundover}=await imp('operations.mjs'),{objectTopology}=await imp('cad-solid.mjs'),{loadGlyphs}=await imp('glyph-geometry.mjs'),{migrateProject,forWrite}=await imp('migrate.mjs');
 await loadGlyphs();const K=await initKernel();const rt=await initLocalEngine(K,{rust:{binary:fs.readFileSync(root+'/app/assets/mesh-core.wasm')}});
 let id=0;const run=d=>{const r=rt.process({id:++id,...d});if(r.error)return 'error:'+r.error;return crypto.createHash('sha256').update(Buffer.from(r.buffer)).digest('hex');};
 const wrap=objs=>({...blank(),objects:objs});const cases=[['blank',blank()],['plate',plate()],['tray',tray()]];
 for(const f of fs.readdirSync(root+'/tests/fixtures').filter(f=>f.endsWith('.tcad'))){try{cases.push([f,migrateProject(JSON.parse(fs.readFileSync(root+'/tests/fixtures/'+f,'utf8')))]);}catch{}}
 let n=0;const mk=(t,p)=>({...object(t,structuredClone(p)),id:'o'+(n++)});
 for(const [t,p] of Object.entries({...defaults,...advancedDefaults,...glyphDefaults})){cases.push([t,wrap([mk(t,p)])]);
  if(t.startsWith('thread')||t==='sphere'||t==='torus')continue;const o=mk(t,p),edges=objectTopology(o)?.edges.map(e=>e.index)||[];if(!edges.length)continue;
  cases.push([t+' round 1 edge',wrap([withRoundover(o,edges.slice(0,1),1)])]);cases.push([t+' round 4 edges',wrap([withRoundover(withRoundover(o,edges.slice(0,2),1),edges.slice(2,4),.6)])]);
  if(edges.length<=24)cases.push([t+' round all',wrap([withRoundover(o,edges,.5)])]);}
 const out={};for(const [name,p] of cases){out[name+' json']=crypto.createHash('sha256').update(JSON.stringify(forWrite(p),null,2).replace(/\b[a-z0-9]{6,10}-[a-z0-9]+-[a-z0-9]{5}\b/g,'{uid}')).digest('hex');for(const tolerance of [.15,.03])out[name+' stl '+tolerance]=run({type:'export',project:p,tolerance,ground:true});}
 fs.writeSync(1,JSON.stringify(out));process.exit(0);}
const here=new URL('..',import.meta.url).pathname.replace(/\/$/,''),base=process.argv[2]||'/tmp/f6/base';
if(!fs.existsSync(base+'/web/kernel.mjs')){console.log('round-chamfer-stl: no base tree at',base,'- skipped');process.exit(0);}
const emit=root=>JSON.parse(execFileSync(process.execPath,[new URL(import.meta.url).pathname,'--emit',root],{maxBuffer:1<<26,cwd:root}).toString());
const a=emit(base),b=emit(here);assert.deepEqual(Object.keys(b),Object.keys(a));let same=0;
for(const k of Object.keys(a)){assert.equal(b[k],a[k],'differs from base: '+k);same++;}
const stl=Object.keys(a).filter(k=>k.includes(' stl ')),errors=stl.filter(k=>a[k].startsWith('error:'));
assert.ok(stl.length-errors.length>=80,'enough real exports');
console.log(`round-chamfer-stl: ${same} outputs identical to ${base}: ${stl.length-errors.length} STL exports byte-identical, ${errors.length} identical errors (${[...new Set(errors.map(k=>k.replace(/ stl .*/,'')))].join(', ')}), ${Object.keys(a).length-stl.length} saved JSON`);
