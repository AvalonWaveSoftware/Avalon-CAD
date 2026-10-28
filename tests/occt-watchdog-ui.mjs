import assert from 'node:assert/strict';
import {harness} from './ui-harness.mjs';
import {OCCT_STOPPED} from '../web/android-occt.mjs';
const H=await harness(),U=await H.boot(),{w,wait,$}=U;
try{
 w.__cad.change(p=>p.name='Undo candidate');await wait(()=>w.__cad.model?.engine&&$('busy').textContent.indexOf('Building')<0);
 $('undo').click();await wait(()=>w.__cad.project.name!=='Undo candidate'&&$('busy').textContent.indexOf('Building')<0);
 await new Promise(r=>setTimeout(r,500));
 const redoDisabled=$('redo').disabled;assert.equal(redoDisabled,false);
 const project=JSON.stringify(w.__cad.project),history=w.__cad.historyLength,model=w.__cad.model,storage=JSON.stringify({...w.localStorage});
 const process=H.runtime.process;H.runtime.process=data=>data.type==='preview'?{id:data.id,error:OCCT_STOPPED}:process(data);
 w.__cad.change(p=>p.name='Must roll back');
 await wait(()=>$('toast').textContent===OCCT_STOPPED,'clean failure notice');
 await new Promise(r=>setTimeout(r,500));
 assert.equal(JSON.stringify(w.__cad.project),project);assert.equal(w.__cad.historyLength,history);assert.equal($('redo').disabled,redoDisabled);assert.equal(w.__cad.model,model);assert.equal(JSON.stringify({...w.localStorage}),storage);
 H.runtime.process=process;
 w.__cad.change(p=>p.name='Recovered');await wait(()=>w.__cad.project.name==='Recovered'&&w.__cad.model!==model);
 console.log('PASS: actual Android main UI restores project, undo, model and autosave after watchdog error; next edit succeeds');
}finally{U.close();H.K.destroy?.();}
