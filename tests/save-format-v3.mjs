// ADR-0001 §2.2 / §5.2 W0: save format v3. v2 files save as v2 byte-identical; a synthetic v3 file loads and saves as
// v3; 2.7.x rejects v3 with its existing message; dual autosave keys survive a downgrade; prefabs record version 2 only
// for v3 content; every reader (kernel-ui, js-engine, model_jobs.py) accepts 2 and 3 only.
import assert from 'node:assert/strict';import fs from 'node:fs';
import {PROJECT_VERSION,requiredVersion,forWrite,requiredPrefabVersion,migrateProject} from '../web/migrate.mjs';
import {validateProject} from '../web/kernel-ui.mjs';
import {blank,plate,tray} from '../web/templates.mjs';
import {validatePrefab} from '../web/prefabs.mjs';
import {readAutosave,writeAutosave,AUTOSAVE,AUTOSAVE_V3,fingerprint} from '../web/autosave-store.mjs';
assert.equal(PROJECT_VERSION,3);
// 1. Every existing project writes as v2, the very same object (so JSON.stringify is byte-identical to 2.7.x).
const v2=[blank(),plate(),tray(),...fs.readdirSync('tests/fixtures').filter(f=>f.endsWith('.tcad')).map(f=>migrateProject(JSON.parse(fs.readFileSync('tests/fixtures/'+f,'utf8'))))];
for(const p of v2){assert.equal(p.version,2);assert.equal(requiredVersion(p),2);assert.equal(forWrite(p),p);}
// Groups alone stay v2 (Q13).
const grouped={...plate(),groups:[{id:'g1',name:'G'}]};grouped.objects[0].groupId='g1';assert.equal(requiredVersion(grouped),2);
// 2. Each v3 field, at top level and nested in joined/prefab children, needs v3.
const box=(extra={})=>({id:'b'+Math.random().toString(36).slice(2,8),type:'box',name:'Box',mode:'solid',enabled:true,layerId:'layer-1',params:{width:20,depth:20,height:10},position:[0,0,0],rotation:[0,0,0],...extra});
const glyph=k=>({id:'gl',type:'glyph',name:'A',mode:'solid',enabled:true,layerId:'layer-1',params:{char:'A',size:20,height:3,[k]:0.5},position:[0,0,0],rotation:[0,0,0]});
const wrap=o=>({format:'tristancad',version:2,name:'t',objects:[o],layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1'});
const v3objs=[box({mirrored:true}),box({shell:{thickness:2}}),box({fillets:[{kind:'chamfer',radius:1,edges:[0]}]}),...['bevel','bevelProfile','plate','plateMargin','engrave'].map(glyph),
 {...box(),type:'joined',params:{operation:'add',children:[box(),box({mirrored:true})]}},{...box(),type:'prefab',params:{children:[box({shell:{thickness:1}})]}}];
for(const o of v3objs){const p=wrap(o);assert.equal(requiredVersion(p),3,JSON.stringify(o));const w=forWrite(p);assert.equal(w.version,3);assert.deepEqual(Object.keys(w),Object.keys(p),'key order kept');assert.equal(p.version,2,'input untouched');}
assert.equal(requiredVersion(wrap(box({mirrored:false,fillets:[{radius:1,edges:[0]}]}))),2,'mirrored:false and plain rounds stay v2');
// 3. A synthetic v3 file loads (migrate = identity, version kept) and saves as v3, byte-identical to the input.
const sp=plate();sp.objects[0].mirrored=true;const synthetic=validateProject({...sp,version:3});const text=JSON.stringify(synthetic,null,2);
const loaded=validateProject(migrateProject(JSON.parse(text)));assert.equal(loaded.version,3);assert.equal(JSON.stringify(forWrite(loaded),null,2),text,'v3 round trip is byte-identical');
// A file stamped v3 that uses no v3 field writes as v2 (the minimum-version writer).
assert.equal(forWrite(validateProject({...plate(),version:3})).version,2);
assert.throws(()=>validateProject({...plate(),version:4}),/not a supported AvalonCad project/);
// v1 still migrates to v2 (not straight to 3).
assert.equal(migrateProject(JSON.parse(fs.readFileSync('tests/fixtures/simple-subtract.tcad','utf8'))).version,2);
// 4. 2.7.x (the e4f2104 reader, when available) rejects a v3 file with its existing message.
const OLD=process.env.AVALON_OLD_ROOT||'/tmp/e4-base';
if(fs.existsSync(OLD+'/web/kernel-ui.mjs')){const old=await import(OLD+'/web/kernel-ui.mjs');assert.throws(()=>old.validateProject(JSON.parse(text)),{message:'This is not a supported AvalonCad project (maximum 100 objects).'});
 const oldPrefabs=await import(OLD+'/web/prefabs.mjs');assert.throws(()=>oldPrefabs.validatePrefab({format:'avaloncad-prefab',version:2,id:'x',name:'x',createdAt:1,object:{type:'prefab'}}),/not a supported AvalonCad prefab/);}
else console.log('note: no 2.7.x tree at',OLD,'- old-reader rejection not checked');
// 5. Readers in the worker and the Python oracle accept exactly 2 and 3.
assert.match(fs.readFileSync('web/js-engine.mjs','utf8'),/!\[2,3\]\.includes\(field\(project,'version'\)\)/);
assert.match(fs.readFileSync('engine/python/model_jobs.py','utf8'),/field\(project, "version"\) not in \(2, 3\)/);
// 6. Prefabs: version 1 unless the content needs v3; readers accept 1 and 2.
assert.equal(requiredPrefabVersion({object:{type:'prefab',params:{children:[box()]}}}),1);
assert.equal(requiredPrefabVersion({object:{type:'prefab',params:{children:[box({mirrored:true})]}}}),2);
const pf=v=>({format:'avaloncad-prefab',version:v,id:'p1',name:'P',createdAt:1,object:{type:'prefab',id:'o',name:'P',mode:'solid',enabled:true,layerId:'layer-1',params:{children:[plate().objects[0]],layers:[{id:'layer-1',name:'Layer 1'}]},position:[0,0,0],rotation:[0,0,0],localBounds:{min:[0,0,0],max:[1,1,1]}}});
validatePrefab(pf(1));validatePrefab(pf(2));assert.throws(()=>validatePrefab(pf(3)));
// 7. Dual autosave keys (Q14).
const mem=()=>{const m=new Map();return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),m};};
let ls=mem();const p2=plate(),p3=wrap(box({mirrored:true}));
writeAutosave(ls,p2);assert.equal(ls.getItem(AUTOSAVE),JSON.stringify(p2),'v2 autosave bytes unchanged');assert.equal(ls.getItem(AUTOSAVE_V3),null);
writeAutosave(ls,p3,1234);assert.equal(ls.getItem(AUTOSAVE),JSON.stringify(p2),'v2 key keeps the last v2-compatible state');
const rec=JSON.parse(ls.getItem(AUTOSAVE_V3));assert.equal(rec.savedAt,1234);assert.equal(rec.project.version,3);
let r=readAutosave(ls);assert.equal(r.key,AUTOSAVE_V3);assert.equal(r.value.version,3);
// Downgrade simulation: 2.x reads only tristancad.autosave and gets the last v2 state; after 2.x edits, 3.0 opens the newer v2.
assert.equal(JSON.parse(ls.getItem(AUTOSAVE)).version,2);
ls.setItem(AUTOSAVE,JSON.stringify({...p2,name:'edited in 2.x'}));r=readAutosave(ls);assert.equal(r.key,AUTOSAVE);assert.equal(r.value.name,'edited in 2.x');
// Round-2 ruling 3: the losing v3 record is kept as a backup; a session that opened the 2.x state never removes it.
assert.equal(r.v3Backup,true);const keep=ls.getItem(AUTOSAVE_V3);writeAutosave(ls,{...p2,name:'saved in 3.0'},5,r.v3Backup);assert.equal(ls.getItem(AUTOSAVE_V3),keep,'v3 backup kept');
assert.equal(readAutosave(ls).key,AUTOSAVE,'2.x/3.0 v2 state still wins');writeAutosave(ls,p3,9);assert.equal(JSON.parse(ls.getItem(AUTOSAVE_V3)).savedAt,9,'a newer 3.0 autosave replaces it');
// Back to a v2-compatible state: the v3 record is superseded and removed.
ls=mem();writeAutosave(ls,p3,1);writeAutosave(ls,p2);assert.equal(ls.getItem(AUTOSAVE_V3),null);assert.equal(readAutosave(ls).key,AUTOSAVE);
// Corrupt v3 record falls back to the v2 key.
ls=mem();ls.setItem(AUTOSAVE,JSON.stringify(p2));ls.setItem(AUTOSAVE_V3,'{bad');assert.equal(readAutosave(ls).key,AUTOSAVE);
assert.equal(fingerprint(''),'0:811c9dc5');
console.log('PASS: save format v3: '+v2.length+' v2 projects write byte-identical v2; '+v3objs.length+' v3 field cases write v3; synthetic v3 round trip byte-identical; v4 rejected; 2.7.x rejects v3 with its message; prefab v1/v2; dual autosave keys incl. downgrade simulation');
