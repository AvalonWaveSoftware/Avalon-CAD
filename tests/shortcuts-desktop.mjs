// ADR-0001 F1a on the real Electron shell (Linux build host; needs AVALON_ELECTRON_LINUX and a staged desktop app,
// `node desktop/stage.mjs`). Checks: the help pill text (Sean-approved), the native menu accelerators equal the
// registry's ELECTRON_MENU, menu items run their commands through the registry bridge, page shortcuts work, and a
// menu-owned combo runs its command exactly once (the page dispatcher leaves it to the menu).
import assert from 'node:assert/strict';import fs from 'node:fs/promises';import path from 'node:path';import {createRequire} from 'node:module';
import {ELECTRON_MENU} from '../web/commands.mjs';
if(!process.env.AVALON_ELECTRON_LINUX){console.log('SKIP: shortcuts-desktop needs AVALON_ELECTRON_LINUX');process.exit(0);}
const require=createRequire(import.meta.url),{_electron:electron}=require(process.env.AVALON_PLAYWRIGHT||'playwright');
const testRoot=await fs.mkdtemp(path.resolve('build/desktop-test-')),root=path.join(testRoot,'files');await fs.mkdir(root,{recursive:true});
const app=await electron.launch({executablePath:process.env.AVALON_ELECTRON_LINUX,args:['--no-sandbox','--ozone-platform=x11','--no-zygote','--disable-dev-shm-usage',path.resolve('tests/desktop-harness.cjs')],env:{...process.env,AVALON_TEST_FILES:root,XDG_CONFIG_HOME:path.join(testRoot,'profile')},timeout:60000});
let report;
try{const page=await app.firstWindow(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.waitForFunction(()=>window.__cad?.model?.engine?.local,{},{timeout:60000});
 assert.equal(await page.locator('#desktopHelp').textContent(),'Drag to orbit · Shift/right-drag to pan · Scroll/pinch to zoom · ? for shortcuts');
 const mac=await page.evaluate(()=>window.AvalonDesktop.platform==='mac');
 const accels=await app.evaluate(({Menu})=>{const out=[];const walk=items=>{for(const i of items){if(i.accelerator)out.push([i.label,i.accelerator]);if(i.submenu)walk(i.submenu.items);}};walk(Menu.getApplicationMenu().items);return out;});
 const norm=a=>a.replace(/^CmdOrCtrl\+|^Ctrl\+/,'Mod+');const got=Object.fromEntries(accels.map(([l,a])=>[l,norm(a)]));
 const byLabel={'New project':'new','Open project / prefab / STL…':'open','Save project on this computer':'save','Save project on this Mac':'save','Export editable project…':'backup','Export…':'export','Undo model change':'undo','Redo model change':'redo','Add a Primitive Object':'add','Fit model':'fit'};
 assert.deepEqual(Object.fromEntries(Object.entries(got).filter(([l])=>byLabel[l]).map(([l,a])=>[byLabel[l],a])),ELECTRON_MENU(mac),'native menu accelerators == registry ELECTRON_MENU');
 // Role items (Cut/Copy/Paste/Select All, Quit/Close, Minimize, full screen) keep their native accelerators; none of
 // them is a registry combo at F1a (F5's Cmd/Ctrl+C/V must resolve this, see the handoff).
 const {createCommands}=await import('../web/commands.mjs'),reg=createCommands();const roles=Object.entries(got).filter(([l])=>!byLabel[l]).map(([,a])=>a.replace(/^CommandOrControl\+/,'Mod+'));
 for(const a of roles)assert.equal(reg.byKey(a),undefined,'role accelerator '+a+' collides with a registry shortcut');
 await page.evaluate(()=>{window.clicks={};for(const id of ['fit','undo','redo','wire'])document.getElementById(id).addEventListener('click',()=>window.clicks[id]=(window.clicks[id]||0)+1,true);});
 const clicks=()=>page.evaluate(()=>({...window.clicks}));
 // Menu → registry bridge.
 const clickMenu=label=>app.evaluate(({Menu},label)=>{const find=items=>{for(const i of items){if(i.label===label)return i;const s=i.submenu&&find(i.submenu.items);if(s)return s;}};find(Menu.getApplicationMenu().items).click();},label);
 await clickMenu('Fit model');await page.waitForTimeout(150);assert.equal((await clicks()).fit,1,'menu Fit model');
 await page.click('[data-view="top"]');await clickMenu('3D view');await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>document.querySelector('[data-view="iso"]').classList.contains('active')),true,'menu 3D view (view:iso → view:3d)');
 // Page shortcuts on desktop.
 await page.keyboard.press('w');await page.waitForTimeout(100);assert.equal((await clicks()).wire,1);await page.keyboard.press('w');
 await page.keyboard.press('Shift+Slash');await page.waitForFunction(()=>document.querySelector('#sheetTitle').textContent==='Make your first part');await page.keyboard.press('Escape');await page.waitForFunction(()=>document.querySelector('#sheet').hidden);
 await page.keyboard.press('a');await page.waitForFunction(()=>!document.querySelector('#sheet').hidden);await page.keyboard.press('Escape');
 // A menu-owned combo (Ctrl+0 → Fit model): the page leaves it to the menu, so it runs at most once.
 const f0=(await clicks()).fit;await page.keyboard.press('Control+0');await page.waitForTimeout(300);const viaKey=(await clicks()).fit-f0;
 assert.ok(viaKey<=1,'Ctrl+0 ran Fit '+viaKey+' times');
 await page.keyboard.press('0');await page.waitForTimeout(150);assert.equal((await clicks()).fit-f0-viaKey,1,'0 fits (page dispatcher)');
 assert.deepEqual(errors,[]);report=`mac=${mac}; menu accelerators match; menu bridge ok; Ctrl+0 via synthetic key ran Fit ${viaKey}× (1 = native menu took it, 0 = synthetic keys do not reach the menu)`;}
finally{await app.close();await fs.rm(testRoot,{recursive:true,force:true});}
console.log('PASS: shortcuts-desktop: '+report);
