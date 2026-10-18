// ADR-0001 F1a (§4 F1a, §5.2 F1a, Q1 as approved, round-2 ruling 2): keyboard shortcuts.
// Unit: combo() normalisation, the registry table (only commands that work today), the Electron menu table vs
// desktop/main.cjs, the dispatcher gate, and the help rows against Sean's approved text.
// Browser, phone (412x915 touch + hardware keyboard, Android stub) and desktop web (1440x900): every shortcut runs its
// command; nothing fires while typing in a field; with a sheet open only Esc and Cmd/Ctrl commands run.
import assert from 'node:assert/strict';import fs from 'node:fs';
import {createCommands,combo,installShortcuts,ELECTRON_MENU,COMMAND_IDS} from '../web/commands.mjs';import {shortcutRows} from '../web/help-sheet.mjs';import {tooltipText} from '../web/tooltips.mjs';
// --- combo()
const k=(key,o={})=>combo({key,code:'',...o});
assert.equal(k('v'),'V');assert.equal(k('V',{shiftKey:true}),'Shift+V');assert.equal(k('?',{shiftKey:true}),'?');assert.equal(k('0'),'0');assert.equal(k('Home'),'Home');
assert.equal(k('z',{ctrlKey:true}),'Mod+Z');assert.equal(k('z',{metaKey:true}),'Mod+Z','Cmd and Ctrl are the same Mod on every platform');assert.equal(k('Z',{metaKey:true,shiftKey:true}),'Mod+Shift+Z');
assert.equal(k('Delete',{shiftKey:true}),'Shift+Delete');assert.equal(k('Escape'),'Escape');assert.equal(k('я',{code:'KeyZ',ctrlKey:true}),'Mod+Z','non-Latin layout uses the physical key');assert.equal(k('q',{code:'KeyA'}),'Q','Latin layouts keep their own letter (AZERTY)');
for(const [key,o] of [['a',{altKey:true}],['Shift',{shiftKey:true}],['Control',{ctrlKey:true}],['Meta',{metaKey:true}],['a',{isComposing:true}],['Unidentified',{}],['Dead',{}],['',{}]])assert.equal(k(key,o),null,JSON.stringify([key,o]));
// --- registry table: exactly the Q1 rows whose commands exist at F1a (no R/I/T, copy/paste, group yet).
const c=createCommands(),table=Object.fromEntries(c.list.filter(x=>x.shortcut).map(x=>[x.id,x.shortcut]));
// Ruling 1: tooltip/aria text = existing label (shortcut), in the help table's key spelling.
assert.deepEqual(Object.fromEntries(c.list.filter(x=>x.shortcut).map(x=>[x.id,tooltipText(x)])),{new:'New project (Cmd/Ctrl+N)',open:'Open project / prefab / STL… (Cmd/Ctrl+O)',save:'Save project on this computer (Cmd/Ctrl+S)',backup:'Export editable project… (Cmd/Ctrl+Shift+S)',export:'Export (Cmd/Ctrl+E)',
 undo:'Undo (Cmd/Ctrl+Z)',redo:'Redo (Cmd/Ctrl+Shift+Z)',add:'Add (A)',clear:'Deselect everything (Shift+Delete)',fit:'Fit model (0)',wire:'Wireframe (W)',help:'Help (?)','mode:select':'Select (V)','mode:move':'Move (M)',
 'mode:stretch':'Stretch (S)','mode:round':'Round (F)',delete:'Delete (Delete)',duplicate:'Duplicate (Cmd/Ctrl+D)',escape:'Close panel (Esc)'});
assert.deepEqual(table,{new:['Mod+N'],open:['Mod+O'],save:['Mod+S'],backup:['Mod+Shift+S'],export:['Mod+E'],undo:['Mod+Z'],redo:['Mod+Shift+Z','Mod+Y'],add:['A','Mod+Shift+A'],
 clear:['Shift+Delete','Shift+Backspace'],fit:['0','Home','Mod+0'],wire:['W'],help:['?'],'mode:select':['V'],'mode:move':['M'],'mode:stretch':['S'],'mode:round':['F'],delete:['Delete','Backspace'],duplicate:['Mod+D'],escape:['Escape']});
const all=c.list.flatMap(x=>x.shortcut||[]);assert.equal(new Set(all).size,all.length,'no combo bound twice');for(const s of all)assert.equal(c.byKey(s)&&c.get(c.byKey(s)).shortcut.includes(s),true);
for(const id of ['mode:rotate','mode:mirror','measure','copy','paste','group','ungroup'])assert.ok(!COMMAND_IDS.includes(id),id+' arrives with its feature');
// --- Electron menu accelerators (desktop/main.cjs) == ELECTRON_MENU, and each is a registry shortcut of the same command.
const cjs=fs.readFileSync('desktop/main.cjs','utf8'),menu={false:{},true:{}};
for(const m of cjs.matchAll(/accelerator: (?:isMac \? '([^']+)' : '([^']+)'|'([^']+)'), click: invoke\('([^']+)'\)/g)){const norm=a=>a.replace(/^CmdOrCtrl\+|^Ctrl\+/,'Mod+');
 menu.true[m[4]]=norm(m[1]??m[3]);menu.false[m[4]]=norm(m[2]??m[3]);}
for(const mac of [false,true]){assert.deepEqual(menu[mac],ELECTRON_MENU(mac),'main.cjs accelerators match the registry (mac='+mac+')');for(const [id,a] of Object.entries(ELECTRON_MENU(mac)))assert.ok(c.get(id).shortcut.includes(a),id+' '+a);}
// --- dispatcher gate on a fake target.
{const fired=[];const cc=createCommands({fit:{run:()=>fired.push('fit')},undo:{run:()=>fired.push('undo')},delete:{run:()=>fired.push('delete'),enabled:()=>false}});
 const t={l:null,addEventListener(_,f){this.l=f;}},ev=(key,o={})=>{const e={key,code:'',defaultPrevented:false,repeat:false,...o,preventDefault(){this.defaultPrevented=true;}};t.l(e);return e.defaultPrevented;};
 let allow=true;installShortcuts(cc,{target:t,allow:()=>allow,skip:new Set(['Mod+Z'])});
 assert.equal(ev('0'),true);assert.equal(ev('z',{ctrlKey:true}),false,'skipped combo (native menu) is left alone');assert.equal(ev('Delete'),false,'disabled command does not prevent default');
 assert.equal(ev('0',{repeat:true}),false,'key repeat ignored');assert.equal(ev('0',{defaultPrevented:true}),true);allow=false;assert.equal(ev('Home'),false,'gate');assert.equal(ev('x'),false,'unbound key untouched');
 assert.deepEqual(fired,['fit']);}
// --- help rows: each is a phrase of Sean's approved table, in its order, and the paragraph is the approved subset.
const APPROVED='V Select · M Move · R Rotate · S Stretch · F Round ▾ (press F again for Chamfer) · I Mirror · T Measure · A Add · Delete or Backspace deletes · Shift+Delete clears the selection · Cmd/Ctrl+D duplicate · Cmd/Ctrl+C and Cmd/Ctrl+V copy and paste · Cmd/Ctrl+G group · Shift+G ungroup · Cmd/Ctrl+Z undo · Cmd/Ctrl+Shift+Z or Ctrl+Y redo · Cmd/Ctrl+S save · Cmd/Ctrl+Shift+S export the project · Cmd/Ctrl+O open · Cmd/Ctrl+N new project · Cmd/Ctrl+E export · 0 or Home fit the view · W wireframe · Esc closes a sheet or clears the selection · ? opens Help. Shortcuts also work with a hardware keyboard on Android. They never fire while you type in a field.';
const rows=shortcutRows(id=>!!c.get(id)?.shortcut);let at=-1;for(const r of rows){const i=APPROVED.indexOf(r,at+1);assert.ok(i>at,'approved, in order: '+r);at=i;}
assert.equal(rows.length,19);assert.deepEqual(shortcutRows(()=>false),[]);
const PARAGRAPH=rows.join(' · ')+'. Shortcuts also work with a hardware keyboard on Android. They never fire while you type in a field.';
// --- browser
const H=await import('../tools/readme-shots/harness.mjs');const env=await H.start();const out=[];
try{for(const desktop of [false,true]){const page=await H.open(env,{desktop}),name=desktop?'desktop':'phone';let n=0;
 await page.waitForTimeout(500);
 await page.evaluate(()=>{window.clicks={};for(const id of ['fit','undo','redo','wire','exportBtn','addBtn','helpBtn','deselectBtn'])document.getElementById(id).addEventListener('click',()=>window.clicks[id]=(window.clicks[id]||0)+1,true);window.Android.openFile=()=>{window.opened=(window.opened||0)+1;};});
 const clicks=()=>page.evaluate(()=>({...window.clicks})),mode=()=>page.evaluate(()=>window.__cad.touch.getState().mode),sheet=()=>page.evaluate(()=>document.querySelector('#sheet').hidden?null:document.querySelector('#sheetTitle').textContent);
 const count=()=>page.evaluate(()=>window.__cad.project.objects.length),key=async k=>{n++;await page.keyboard.press(k);await page.waitForTimeout(60);};
 const pick=async()=>{await page.evaluate(()=>window.__cad.touch.selectFace(window.__cad.project.objects[0].id,0));await key('v');assert.ok(await page.evaluate(()=>!!window.__cad.selected));};
 const closed=async()=>{await key('Escape');assert.equal(await sheet(),null,'Esc closes the sheet');};
 // ? opens Help with the Keyboard shortcuts item (approved text, F1a rows), after item 3.
 await key('Shift+Slash');await page.waitForFunction(()=>document.querySelector('#sheetTitle').textContent==='Make your first part'&&!!document.querySelector('#loadExample'));
 const items=await page.evaluate(()=>[...document.querySelectorAll('#sheet .helpitem')].map(e=>[e.querySelector('b').textContent,e.querySelector('p').textContent]));
 assert.equal(items[3][0],'Keyboard shortcuts');assert.match(items[2][0],/^3\. /);assert.match(items[4][0],/^4\. /);assert.equal(items[3][1],PARAGRAPH);
 await page.click('#loadExample');await page.waitForFunction(()=>window.__cad.project.objects.length>0&&window.__cad.selected&&document.querySelector('#sheet').hidden);await page.waitForTimeout(300);
 // Modes. Since F6 (release-3.0 7faa154, Master Chief 18:35 CT) F opens the Edge ▾ dropdown on every platform (F6's own
 // touch-tools listener, which runs first and marks the event handled, so the registry entry mode:round does not also
 // fire: the dropdown opens exactly once instead of opening and closing). Enter picks the focused Round item.
 await page.evaluate(()=>{window.roundClicks=0;document.querySelector('[data-mode="round"]').addEventListener('click',()=>window.roundClicks++,true);});
 const menu=()=>page.evaluate(()=>({n:document.querySelectorAll('#edgeToolMenu').length,expanded:document.querySelector('[data-mode="round"]').getAttribute('aria-expanded')}));
 for(const [k2,m] of [['m','move'],['s','stretch']])assert.equal((await key(k2),await mode()),m,k2+' → '+m);
 await key('f');await page.waitForSelector('#edgeToolMenu');assert.deepEqual(await menu(),{n:1,expanded:'true'},'F opens the Edge ▾ dropdown once');assert.equal(await mode(),'stretch','F alone changes no mode');
 assert.equal((await key('Enter'),await mode()),'round','F then Enter → Round');assert.deepEqual(await menu(),{n:0,expanded:'false'});
 for(const [k2,m] of [['v','select'],['M','move'],['V','select']])assert.equal((await key(k2),await mode()),m,k2+' → '+m);
 assert.equal((await key('Shift+V'),await mode()),'select','Shift+V is not a shortcut');
 assert.equal(await page.evaluate(()=>window.roundClicks),0,'F is handled once, by F6 (no extra Round-button click from the registry)');assert.deepEqual(c.get('mode:round').shortcut,['F']);
 // W wireframe, 0/Home fit (and Cmd/Ctrl+0 kept from the Electron menu).
 await key('w');await key('w');await key('0');await key('Home');await key('Control+0');
 let cl=await clicks();assert.equal(cl.wire,2);assert.equal(cl.fit,3);
 // A Add (and the Electron menu's Cmd/Ctrl+Shift+A), Esc closes.
 await key('a');assert.equal(await sheet(),'Primitive Objects');
 // With a sheet open, single keys do nothing (here: M, Delete, W).
 const before=await count();await key('m');await key('Delete');await key('w');assert.equal(await mode(),'select');assert.equal(await count(),before);assert.equal((await clicks()).wire,2);
 await closed();await key('Control+Shift+A');assert.equal(await sheet(),'Primitive Objects');await closed();
 // Cmd/Ctrl+E export, Cmd/Ctrl+D duplicate (opens the Add draft like Edit → Duplicate), Cmd/Ctrl+N new (asks first).
 await key('Control+e');assert.match(await sheet()||'',/Export/);await closed();
 await key('Meta+d');assert.match(await sheet()||'',/^Add /,'Cmd+D duplicate draft');assert.match(await page.evaluate(()=>document.querySelector('#objectName')?.value||''),/ copy$/);await closed();assert.equal(await count(),before,'closing the draft adds nothing');
 await key('Control+n');assert.equal(await sheet(),'Start another project?');await closed();assert.equal(await count(),before);
 // Delete / Backspace delete, Undo/Redo with every combo, Shift+Delete / Shift+Backspace clear.
 await key('Delete');await page.waitForFunction(c=>window.__cad.project.objects.length===c-1,before);
 await key('Control+z');await page.waitForFunction(c=>window.__cad.project.objects.length===c,before);
 await key('Control+Shift+Z');await page.waitForFunction(c=>window.__cad.project.objects.length===c-1,before);await key('Meta+z');await page.waitForFunction(c=>window.__cad.project.objects.length===c,before);
 await key('Control+y');await page.waitForFunction(c=>window.__cad.project.objects.length===c-1,before);await key('Control+z');await page.waitForFunction(c=>window.__cad.project.objects.length===c,before);
 await pick();await key('Backspace');await page.waitForFunction(c=>window.__cad.project.objects.length===c-1,before);await key('Control+z');await page.waitForFunction(c=>window.__cad.project.objects.length===c,before);
 await pick();assert.ok(await page.evaluate(()=>!!window.__cad.selected));
 await key('Shift+Delete');assert.equal(await page.evaluate(()=>window.__cad.selected),null,'Shift+Delete clears the selection');assert.equal(await count(),before);
 await pick();await key('Shift+Backspace');assert.equal(await page.evaluate(()=>window.__cad.selected),null);
 await key('Delete');assert.equal(await count(),before,'Delete with nothing selected does nothing');
 // Ruling 3: Delete with a multi-selection deletes every selected object in one undo step.
 {await pick();await page.evaluate(()=>{const [,b,c]=window.__cad.project.objects;window.__cad.touch.toggleMulti(b.id);window.__cad.touch.toggleMulti(c.id);});
  assert.equal((await page.evaluate(()=>window.__cad.touch.getState().multi)).length,3);const h0=await page.evaluate(()=>window.__cad.historyLength);
  await key('Delete');await page.waitForFunction(c=>window.__cad.project.objects.length===c-3,before);assert.equal(await page.evaluate(()=>window.__cad.historyLength),h0+1,'one undo step');
  assert.deepEqual(await page.evaluate(()=>[window.__cad.selected,window.__cad.touch.getState().multi.length]),[null,0],'selection cleared');
  await key('Control+z');await page.waitForFunction(c=>window.__cad.project.objects.length===c,before);}
 // Cmd/Ctrl+S save, Cmd/Ctrl+Shift+S export the project (.tcad), Cmd/Ctrl+O open.
 await key('Control+s');assert.ok(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('tristancad.projects')||'{}')).length===1),'saved');
 await key('Control+Shift+S');await page.waitForFunction(()=>window.savedFile?.done&&window.savedFile.name.endsWith('.tcad'));
 await key('Control+o');assert.equal(await page.evaluate(()=>window.opened),1,'open');
 // Typing in a field: nothing fires, the text arrives; Esc still closes the sheet.
 await pick();await page.click('#editBtn');await page.waitForSelector('#objectName');await page.focus('#objectName');
 const hist=await page.evaluate(()=>window.__cad.historyLength);await page.keyboard.press('End');await page.keyboard.type('mvswa0');for(const k2 of ['Delete','Backspace','Home','Shift+Delete','Control+d','Shift+Slash'])await page.keyboard.press(k2);
 assert.equal(await mode(),'select');assert.equal(await count(),before);assert.match(await sheet()||'',/^Edit /,'still in Edit');
 assert.equal(await page.evaluate(()=>window.__cad.historyLength),hist,'typing changed no model state');cl=await clicks();assert.equal(cl.wire,2);assert.equal(cl.fit,3);
 await key('Escape');assert.equal(await sheet(),null,'Esc in a field closes the sheet');
 // Shortcuts never move focus or open anything when the page is busy dragging (gate covered by unit test).
 out.push(`${name}: ${n} key presses`);await page.context().close();}
 // Ruling 7: plain web (no AvalonDesktop, no Android bridge) hides the Ctrl+N row; the phone stub and Electron keep it.
 {const page=await H.open(env,{desktop:true});await page.waitForTimeout(500);await page.evaluate(()=>{delete window.Android;});await page.keyboard.press('Shift+Slash');
  await page.waitForFunction(()=>!!document.querySelector('#loadExample'));const p=await page.evaluate(()=>[...document.querySelectorAll('#sheet .helpitem')][3].querySelector('p').textContent);
  assert.ok(PARAGRAPH.includes(' · Cmd/Ctrl+N new project'));assert.equal(p,PARAGRAPH.replace(' · Cmd/Ctrl+N new project',''),'web help table without Ctrl+N');
  out.push('web: help table hides the Ctrl+N row');await page.context().close();}}
finally{await env.close();}
console.log('PASS: shortcuts: combo/registry/menu/gate/help-row unit checks; '+out.join('; '));
