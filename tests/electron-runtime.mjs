import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{_electron:electron}=require(process.env.AVALON_PLAYWRIGHT||'playwright');
const testRoot=await fs.mkdtemp(path.resolve('build/desktop-test-')),root=path.join(testRoot,'files');await fs.mkdir(root,{recursive:true});
console.log('Starting Electron integration...');
const app=await electron.launch({executablePath:process.env.AVALON_ELECTRON_LINUX,args:['--no-sandbox','--ozone-platform=x11','--no-zygote','--disable-dev-shm-usage',path.resolve('tests/desktop-harness.cjs')],env:{...process.env,AVALON_TEST_FILES:root,XDG_CONFIG_HOME:path.join(testRoot,'profile')},timeout:60000});
console.log('Desktop window starting...');
try {
 const page=await app.firstWindow(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.waitForFunction(()=>window.__cad?.model?.engine?.local,{},{timeout:60000});
 assert.equal(page.url(),'app://avalon-cad/index.html');assert.equal(await page.evaluate(()=>window.AvalonDesktop.platform),process.platform==='darwin'?'mac':process.platform);assert.equal(await page.evaluate(()=>self.crossOriginIsolated),true);
 assert.deepEqual(await page.evaluate(()=>window.__cad.model.engine),{python:'3.13.2',rust:4,local:true});
 assert.equal(await page.evaluate(()=>typeof window.require),'undefined');assert.equal(await page.evaluate(()=>typeof window.process),'undefined');
 assert.equal(await page.locator('body').getAttribute('class'),'desktop');
 await page.locator('#addBtn').click();await page.locator('[data-shape="box"]').click();for(const axis of [0,1,2])assert.equal(await page.locator('#pos'+axis).inputValue(),'0');await page.locator('#p_w').fill('40');await page.locator('#p_d').fill('30');await page.locator('#p_h').fill('10');await page.locator('#applyObject').click();await page.waitForFunction(()=>window.__cad.model.volume===12000);
 assert.equal(await page.locator('#buildPlane').isChecked(),true);await page.waitForFunction(()=>document.querySelector('#sheet').hidden);
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.send('avalon:action','backup'));
 for(let i=0;i<100;i++){if(await fs.stat(path.join(root,'My_model.tcad')).catch(()=>false))break;await new Promise(r=>setTimeout(r,50));}
 const backup=JSON.parse(await fs.readFile(path.join(root,'My_model.tcad'),'utf8'));assert.equal(backup.objects.length,1);assert.equal(backup.buildPlaneEnabled,true);assert.equal(backup.objects[0].positionReference,'base');
 await page.locator('#exportBtn').click();await page.locator('#ground').uncheck();await page.locator('#downloadSTL').click();
 for(let i=0;i<100;i++){if(await fs.stat(path.join(root,'My_model.stl')).catch(()=>false))break;await new Promise(r=>setTimeout(r,50));}
 const stl=await fs.readFile(path.join(root,'My_model.stl'));assert.equal(stl.readUInt32LE(80),12);assert.equal(stl.length,684);for(let i=84;i<stl.length;i+=50)for(let j=0;j<3;j++)assert.ok(stl.readFloatLE(i+20+j*12)>=0);await page.locator('#closeSheet').click();
 await page.screenshot({path:'build/desktop-window.png'});
 await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.send('avalon:action','save'));await page.waitForFunction(()=>Object.keys(JSON.parse(localStorage.getItem('tristancad.projects')||'{}')).length===1);
 // Command+Z from a text field must leave model history alone.
 await page.locator('#editBtn').click();await page.locator('#objectName').fill('Edited title');const unchanged=await page.evaluate(()=>JSON.stringify(window.__cad.project));await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.send('avalon:action','undo'));assert.equal(await page.evaluate(()=>JSON.stringify(window.__cad.project)),unchanged);await page.keyboard.press('Escape');
 await page.locator('#addBtn').click();await page.locator('[data-shape="threadrod"]').click();assert.equal(await page.locator('#threadUnits').inputValue(),'imperial');assert.equal(await page.locator('#threadPitch').inputValue(),'20');await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>window.__cad.project.objects.length),1);
 // Shift-drag over a selected shape pans instead of editing it.
 await page.evaluate(()=>window.__cad.touch.setMode('move'));await page.locator('[data-axis="X"]').click();const xy=await page.evaluate(()=>window.__cad.touch.pointScreen([0,0,5]));const beforeMove=await page.evaluate(()=>JSON.stringify(window.__cad.project.objects[0]));await page.keyboard.down('Shift');await page.mouse.move(xy[0],xy[1]);await page.mouse.down();await page.mouse.move(xy[0]+40,xy[1]+20,{steps:5});await page.mouse.up();await page.keyboard.up('Shift');assert.equal(await page.evaluate(()=>JSON.stringify(window.__cad.project.objects[0])),beforeMove);assert.equal(await page.evaluate(()=>window.__cad.touch.isDragging()),false);
 await page.locator('#deselectBtn').click();
 const denied=await page.evaluate(async()=>{try{await fetch('https://example.com');return false;}catch{return true;}});assert.equal(denied,true);
 // .tcad transport from the phone goes through the real context bridge and IPC.
 const phone={...backup,name:'Imported phone model'};await fs.writeFile(path.join(root,'phone.tcad'),JSON.stringify(phone));await app.evaluate(({BrowserWindow})=>BrowserWindow.getAllWindows()[0].webContents.send('avalon:action','open'));await page.locator('#replaceCurrent').click();await page.waitForFunction(()=>window.__cad.project.name==='Imported phone model'&&window.__cad.model.volume===12000);
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('tristancad.autosave')||'{}').name==='Imported phone model');await page.reload();await page.waitForFunction(()=>window.__cad?.project?.name==='Imported phone model'&&window.__cad.model?.volume===12000,{},{timeout:60000});
 assert.deepEqual(errors,[]);console.log('PASS: actual desktop Electron window, isolated/sandboxed preload, custom local protocol, bundled Python/Rust, mouse/keyboard controls, origin/floor/Imperial defaults, real IPC save/open and model-only STL, project persistence and rejected Internet fetch. Native dialog choices automated on Linux; physical Mac execution remains untested.');
} finally {await app.close();}
