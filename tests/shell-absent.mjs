// ADR-0001 F8 "0 cost when absent": for models without a hollow, saved JSON, STL exports and preview display buffers
// (positions, normals, index, flat/smoothing groups, parts) are byte-identical to the base commit. Usage:
// node tests/shell-absent.mjs [base-tree]. Default (batch-3.0b, QA issue: the old fixed base tree had no node_modules):
// the tree of `git merge-base HEAD release-3.0` (or $SHELL_ABSENT_BASE_REV), written once with `git archive` to
// /workspace/scratch/shell-absent/<sha> and given this tree's node_modules (refused when the dependency lists differ). Each tree runs in its own process. Part topology bodies are compared (without OCCT's address-derived
// faceId); topologyHash is not, as prefab child ids (fresh uids) make it differ between any two runs, base included. Skipped when the base tree is missing.
import assert from 'node:assert/strict';import fs from 'node:fs';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
const UID=/\b[a-z0-9]{6,10}-[a-z0-9]+-[a-z0-9]{5}\b/g,KEYS=['vertices','triangles','flatTriangles','smoothingGroups','displayPositions','displayNormals','displayIndex','buffer'];
if(process.argv[2]==='--emit'){
 const root=process.argv[3],imp=f=>import(root+'/web/'+f);
 const {initKernel}=await imp('kernel.mjs'),{initLocalEngine}=await imp('local-engine.mjs'),{object,defaults,advancedDefaults,glyphDefaults,blank,plate,tray}=await imp('templates.mjs');
 const {withRoundover}=await imp('operations.mjs'),{objectTopology}=await imp('cad-solid.mjs'),{loadGlyphs}=await imp('glyph-geometry.mjs'),{migrateProject,forWrite}=await imp('migrate.mjs');
 await loadGlyphs();const K=await initKernel();const rt=await initLocalEngine(K,{rust:{binary:fs.readFileSync(root+'/app/assets/mesh-core.wasm')}});
 const h=x=>crypto.createHash('sha256').update(x).digest('hex'),bytes=v=>ArrayBuffer.isView(v)?Buffer.from(v.buffer,v.byteOffset,v.byteLength):Object.prototype.toString.call(v)==='[object ArrayBuffer]'?Buffer.from(v):Buffer.from(JSON.stringify(v));
 let id=0;const run=d=>{const r=rt.process({id:++id,...d});if(r.error)return 'error:'+r.error;const o={};for(const k of KEYS)if(r[k])o[k]=h(bytes(r[k]));o.volume=r.volume;o.bounds=r.bounds;o.floor=JSON.stringify(r.floorAdjustments??null).replace(UID,'{uid}');o.parts=(r.parts||[]).map(p=>({v:p.vertices&&h(bytes(p.vertices)),t:p.triangles&&h(bytes(p.triangles)),topology:p.topology?h(JSON.stringify({...p.topology,groups:p.topology.groups?.map(({faceId,...g})=>g)},(k,v)=>ArrayBuffer.isView(v)?Array.from(v):v)):null}));return h(JSON.stringify(o));};
 const wrap=objs=>({...blank(),objects:objs});const cases=[['blank',blank()],['plate',plate()],['tray',tray()]];
 for(const f of fs.readdirSync(root+'/tests/fixtures').filter(f=>f.endsWith('.tcad'))){try{cases.push([f,migrateProject(JSON.parse(fs.readFileSync(root+'/tests/fixtures/'+f,'utf8')))]);}catch{}}
 let n=0;const mk=(t,p)=>({...object(t,structuredClone(p)),id:'o'+(n++)});
 for(const [t,p] of Object.entries({...defaults,...advancedDefaults,...glyphDefaults})){cases.push([t,wrap([mk(t,p)])]);
  if(t.startsWith('thread')||t==='sphere'||t==='torus')continue;const o=mk(t,p),edges=objectTopology(o)?.edges.map(e=>e.index)||[];if(edges.length)cases.push([t+' round',wrap([withRoundover(o,edges.slice(0,2),1)])]);}
 const out={};for(const [name,p] of cases){out[name+' json']=h(JSON.stringify(forWrite(p),null,2).replace(/\b[a-z0-9]{6,10}-[a-z0-9]+-[a-z0-9]{5}\b/g,'{uid}'));
  for(const type of ['preview','check','export'])out[name+' '+type]=run({type,project:p,tolerance:.15,ground:true});}
 fs.writeSync(1,JSON.stringify(out));process.exit(0);}
const here=new URL('..',import.meta.url).pathname.replace(/\/$/,''),base=process.argv[2]||defaultBase();
if(!fs.existsSync(base+'/web/kernel.mjs'))throw Error('shell-absent: no base tree at '+base);
function defaultBase(){const git=(...a)=>execFileSync('git',a,{cwd:here}).toString().trim();
 const rev=git('rev-parse',process.env.SHELL_ABSENT_BASE_REV||git('merge-base','HEAD','release-3.0')),dir='/workspace/scratch/shell-absent/'+rev;
 const deps=pkg=>JSON.stringify([pkg.dependencies,pkg.devDependencies]);
 if(deps(JSON.parse(git('show',rev+':package.json')))!==deps(JSON.parse(fs.readFileSync(here+'/package.json','utf8'))))throw Error('shell-absent: base '+rev+' has other dependencies; pass a prepared base tree');
 if(!fs.existsSync(dir+'/web/kernel.mjs')){fs.mkdirSync(dir,{recursive:true});execFileSync('sh',['-c',`git archive ${rev} | tar -x -C "${dir}"`],{cwd:here});}
 if(!fs.existsSync(dir+'/node_modules'))fs.symlinkSync(fs.realpathSync(here+'/node_modules'),dir+'/node_modules');
 return dir;}
const emit=root=>JSON.parse(execFileSync(process.execPath,[new URL(import.meta.url).pathname,'--emit',root],{maxBuffer:1<<26,cwd:root}).toString());
const a=emit(base),b=emit(here);assert.deepEqual(Object.keys(b),Object.keys(a));for(const k of Object.keys(a))assert.equal(b[k],a[k],'differs from base: '+k);
const errors=Object.keys(a).filter(k=>a[k].startsWith?.('error:'));
console.log(`shell-absent: ${Object.keys(a).length} outputs (saved JSON, preview display buffers, checks, STL exports) identical to ${base}; ${errors.length} identical errors`);
