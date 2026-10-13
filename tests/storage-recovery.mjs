import assert from 'node:assert/strict';
import fs from 'node:fs';
import {harness} from './ui-harness.mjs';
// Regression: v1 autosave loading must survive a full localStorage and never lose the user's data.
const H=await harness(),BACKUP='tristancad.autosave.v1-backup';let checks=0;
const legacy=fs.readFileSync('tests/fixtures/simple-subtract.tcad','utf8');
const savedProject={format:'tristancad',version:2,name:'Kept project',layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1',objects:[{id:'k',name:'k',type:'box',params:{w:5,d:5,h:5},position:[0,0,0],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'}]};
const projects=JSON.stringify({kept:{date:1,project:savedProject}});
const pause=ms=>new Promise(r=>setTimeout(r,ms));
// 1: storage full → the backup write fails, but the project and saved list still load; autosave and projects survive edits.
{const U=await H.boot({'tristancad.autosave':legacy,'tristancad.projects':projects},{fill:true}),{w,$,click,wait}=U;
 assert.throws(()=>w.localStorage.setItem('probe','x'.repeat(64)));
 await wait(()=>w.__cad.model.parts.length>0,'full-storage load');assert.equal(w.__cad.project.version,2);assert.ok(w.__cad.project.objects.length>=2);
 assert.equal(w.localStorage.getItem(BACKUP),null);assert.match($('toast').textContent,/could not be backed up/);
 click('projectMenu');assert.ok($('sheet').textContent.includes('Kept project'),'saved projects list was read');click('closeSheet');
 w.__cad.load(savedProject);await pause(500);
 assert.equal(w.localStorage.getItem('tristancad.autosave'),legacy);assert.equal(w.localStorage.getItem('tristancad.projects'),projects);
 assert.equal(U.errors.length,0);U.close();checks++;}
// 2: an existing backup is overwritten whenever the loaded autosave is v1.
{const U=await H.boot({'tristancad.autosave':legacy,[BACKUP]:'stale'});await U.wait(()=>U.w.__cad.model.parts.length>0);assert.equal(U.w.localStorage.getItem(BACKUP),legacy);U.close();checks++;}
// 3: an invalid v1 autosave shows a message naming the backup key, keeps the backup.
{const bad=JSON.stringify({format:'tristancad',version:1,name:'Broken',objects:'nope'}),U=await H.boot({'tristancad.autosave':bad});
 await U.wait(()=>U.$('toast').textContent.includes(BACKUP),'invalid message');assert.equal(U.w.localStorage.getItem(BACKUP),bad);U.close();checks++;}
// 4: invalid v1 autosave with full storage: no backup possible, so the original autosave is left untouched.
{const bad=JSON.stringify({format:'tristancad',version:1,name:'Broken',objects:'nope'}),U=await H.boot({'tristancad.autosave':bad},{fill:true});
 await U.wait(()=>/untouched|backed up/.test(U.$('toast').textContent),'full invalid');U.w.__cad.load(savedProject);await pause(500);assert.equal(U.w.localStorage.getItem('tristancad.autosave'),bad);U.close();checks++;}
console.log('PASS:',checks,'storage recovery cases: full localStorage still loads the v1 autosave and saved projects without overwriting either, backup always refreshed for v1, invalid v1 autosave names the backup key or is left untouched.');
