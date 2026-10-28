import assert from 'node:assert/strict';
import fs from 'node:fs';
import {harness} from './ui-harness.mjs';
import {AUTOSAVE,AUTOSAVE_V3,fingerprint} from '../web/autosave-store.mjs';
const H=await harness(),pause=()=>new Promise(r=>setTimeout(r,600));
const p={format:'tristancad',version:2,name:'Last autosave',layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1',objects:[{id:'box',name:'Box',type:'box',params:{w:5,d:5,h:5},position:[0,0,2.5],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'}]};
const raw=JSON.stringify(p),newer={...p,name:'Latest v3',version:3},v3=JSON.stringify({savedAt:42,project:newer,v2:fingerprint(raw)});
let checks=0;
for(const storage of [{[AUTOSAVE]:raw},{[AUTOSAVE]:raw,[AUTOSAVE_V3]:v3}]){
 const normal=await H.boot(storage);const expected=JSON.stringify(normal.w.__cad.project);assert.equal(normal.$('toast').textContent,'');normal.close();
 let calls=0;const U=await H.boot(storage,{android:{recovered(){calls++;return true},recoveryBlank(){return false}}});
 assert.equal(JSON.stringify(U.w.__cad.project),expected);assert.equal(calls,1);
 assert.equal(U.$('toast').textContent,'Avalon CAD hit a problem and restarted. Your last autosave was reopened.');
 U.$('toast').textContent='';await pause();assert.equal(U.$('toast').textContent,'');assert.equal(calls,1);U.close();checks++;
}
for(const desktop of [false,true]){
 const storage={[AUTOSAVE]:raw,[AUTOSAVE_V3]:v3},U=await H.boot(storage,{desktop,android:{recovered:()=>true,recoveryBlank:()=>true}});
 assert.equal(U.w.__cad.project.objects.length,0);assert.notEqual(U.w.__cad.project.name,newer.name);
 assert.equal(U.$('toast').textContent,'Avalon CAD restarted again, so it opened a blank project. Your autosave is still saved.');
 await pause();U.w.dispatchEvent(new U.w.Event('beforeunload'));
 for(const [k,v] of Object.entries(storage))assert.equal(U.w.localStorage.getItem(k),v,'startup timer/close must preserve both keys');
 U.w.__cad.change(project=>{project.name='User edit'});await pause();assert.equal(JSON.parse(U.w.localStorage.getItem(AUTOSAVE)).name,'User edit');
 U.close();checks++;
}
for(const android of [null,{recovered:()=>false,recoveryBlank:()=>true}]){const U=await H.boot({[AUTOSAVE]:raw},{android});assert.equal(U.w.__cad.project.name,p.name);assert.equal(U.$('toast').textContent,'');U.close();checks++;}
const java=fs.readFileSync('app/src/com/avalonwavesoftware/cad/MainActivity.java','utf8'),build=fs.readFileSync('build-apk.sh','utf8');
const recovery=java.match(/onRenderProcessGone\([^]*?createWebView\(\);return true;/)?.[0];assert.ok(recovery);
for(const token of ['elapsedRealtime()','now-lastRendererCrash<=60000','lastRendererCrash=now','closeStage()','outputName=null','outputMime=null','awaitingSave=false','exportError=false','root.removeView(view)','view.destroy()'])assert.ok(recovery.includes(token),token);
assert.equal((java.match(/new WebView\(this\)/g)||[]).length,1);
assert.match(java,/private void createWebView\(\)[^]*?setWebViewClient[^]*?addJavascriptInterface[^]*?loadUrl/);
assert.match(java,/closeStage\(\)[^]*?stagingFile\.delete\(\)/);
assert.match(java,/recovered\(\)[^]*?recoveryPending=false;return value/);
assert.match(java,/SDK_INT>=29[^\n]*getWebViewRenderProcess\(\).terminate\(\)/);
assert.match(build,/AVALON_TEST_BUILD:-0/);assert.match(build,/if sys.argv\[1\] != '1'/);
// Execute the exact release source transform, without an Android compiler or APK build.
const {execFileSync}=await import('node:child_process');
fs.mkdirSync('build/java',{recursive:true});
const script=build.split("<<'PYHOOK'\n")[1].split('\nPYHOOK')[0];
for(const [flag,hasHook] of [['0',false],['1',true]]){execFileSync('python3',['-c',script,flag]);const source=fs.readFileSync('build/java/MainActivity.java','utf8');assert.equal(source.includes('debugCrashRenderer'),hasHook);assert.equal(source.includes('debugImportDelayMs'),hasHook);assert.equal(source.includes('.terminate()'),hasHook);}
console.log(`PASS: ${checks} page recovery cases + Java lifecycle/guard and release/test source stripping checks`);
