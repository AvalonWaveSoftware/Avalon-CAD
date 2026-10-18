// ADR-0001 F1b (§4 F1b, §5.2): tooltips. Phone (412x915 touch, Android stub) and desktop (1440x900) in the browser.
// 1) Every button (except the hidden, reserved W0 slots) has a non-empty title and aria-label, at startup and in every
//    sheet, panel and action bar, and the text comes from the markup, the registry or the button's own text.
// 2) Touch long-press (450 ms) on a mode-bar, toolbar or dock button shows the same text as a bubble for 1.5 s, loads
//    the bubble chunk only then, and does not fire the button; a moved press, a short tap and a mouse are unaffected.
import assert from 'node:assert/strict';import * as H from '../tools/readme-shots/harness.mjs';
import {BUBBLE_MS,commandId,keyText,tooltipText,visibleLabel} from '../web/tooltips.mjs';import {LONG_PRESS_MS} from '../web/objects-panel.mjs';import {createCommands,COMMAND_IDS} from '../web/commands.mjs';
assert.equal(LONG_PRESS_MS,450);assert.equal(BUBBLE_MS,1500);
// Registry tooltips: the label, except Clear, which uses the accessible name index.html already gives it (no new text).
{const c=createCommands();for(const cmd of c.list)assert.equal(cmd.tooltip,cmd.id==='clear'?'Deselect everything':cmd.label,cmd.id);
 const el=(id,dataset={})=>({id,dataset});
 const map=[[el('closeSheet'),'escape'],[el('duplicateObject'),'duplicate'],[el('deleteObject'),null],[el('undo'),'undo'],[el('redo'),'redo'],[el('wire'),'wire'],[el('fit'),'fit'],[el('helpBtn'),'help'],[el('addBtn'),'add'],[el('editBtn'),'edit'],[el('exportBtn'),'export'],[el('deselectBtn'),'clear'],
  [el('',{mode:'move'}),'mode:move'],[el('',{view:'iso'}),'view:3d'],[el('',{view:'top'}),'view:top'],[el('quickEdit'),null],[el('undoX'),null]];
 for(const [e,id] of map){assert.equal(commandId(e),id,JSON.stringify(e));if(id)assert.ok(COMMAND_IDS.includes(id),id+' is a registry id');}}
// Ruling 1: label plus its first shortcut, in the help table's spelling; no shortcut, no parentheses.
assert.equal(tooltipText({tooltip:'Move',shortcut:['M']}),'Move (M)');assert.equal(tooltipText({tooltip:'Undo',shortcut:['Mod+Z']}),'Undo (Cmd/Ctrl+Z)');
assert.equal(tooltipText({tooltip:'Close panel',shortcut:['Escape']}),'Close panel (Esc)');assert.equal(tooltipText({tooltip:'Edit',shortcut:null}),'Edit');
assert.equal(tooltipText({tooltip:'Round',shortcut:['F']},'Edge'),'Edge (F)');assert.equal(keyText('Mod+Shift+S'),'Cmd/Ctrl+Shift+S');assert.equal(keyText('Shift+Delete'),'Shift+Delete');
// Expected text: the visible label (registry label for icon-only buttons) plus the first shortcut, when there is one.
const KEY=Object.fromEntries(createCommands().list.filter(c=>c.shortcut).map(c=>[c.id,keyText(c.shortcut[0])]));
// tip() → [title, aria-label]. The title is the tooltip; the aria-label is whatever the markup or app gave (UI round 2,
// ruling 3: F1b never changes an existing accessible name), so want(id, label, aria) pins both.
const say=(id,l)=>KEY[id]?`${l} (${KEY[id]})`:l,want=(id,l,aria=null)=>[say(id,l),aria];
const env=await H.start();const out=[];
const audit=page=>page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>!b.closest('.pending,[aria-hidden="true"]')).filter(b=>!b.getAttribute('title')?.trim()||!(b.getAttribute('aria-label')||b.textContent).trim()).map(b=>b.outerHTML.slice(0,120)));
const count=page=>page.evaluate(()=>[...document.querySelectorAll('button')].filter(b=>!b.closest('.pending,[aria-hidden="true"]')).length);
const tip=(page,sel)=>page.evaluate(s=>{const b=document.querySelector(s);return [b.getAttribute('title'),b.getAttribute('aria-label')];},sel);
const chunks=page=>page.evaluate(()=>performance.getEntriesByType('resource').map(r=>r.name).filter(n=>/\/chunk-[^/]*\.js/.test(n)).map(n=>n.split('/').pop().replace(/-[A-Z0-9]+\.js$/,'')));
const sheetOpen=page=>page.evaluate(()=>!document.querySelector('#sheet').hidden);
async function closeSheet(page){if(await sheetOpen(page)){await page.click('#closeSheet');await page.waitForFunction(()=>document.querySelector('#sheet').hidden);}}
try{for(const desktop of [false,true]){const page=await H.open(env,{desktop}),name=desktop?'desktop':'phone';let audited=0;
 const check=async what=>{await page.waitForTimeout(50);const bad=await audit(page);assert.deepEqual(bad,[],`${name} ${what}: buttons without a tooltip or an accessible name`);audited+=await count(page);};
 await page.waitForTimeout(500);await check('startup');
 // Registry buttons: visible label (registry label if icon-only) + shortcut as the title; aria-labels unchanged.
 assert.deepEqual(await tip(page,'#undo'),want('undo','Undo','Undo'));assert.deepEqual(await tip(page,'#fit'),want('fit','Fit model','Fit model'));
 assert.deepEqual(await tip(page,'[data-mode="move"]'),want('mode:move','Move'));assert.deepEqual(await tip(page,'#addBtn'),want('add','Add'));assert.deepEqual(await tip(page,'#exportBtn'),want('export','Export'));
 assert.deepEqual(await tip(page,'#deselectBtn'),want('clear','Clear','Deselect everything'),'Clear keeps its accessible name');assert.deepEqual(await tip(page,'#layersBtn'),['Layers · Layer 1','Layers · Layer 1'],'the app-set aria-label is kept and used as the tooltip');
 assert.deepEqual(await tip(page,'#helpBtn'),want('help','Help','Help'));assert.deepEqual(await tip(page,'[data-view="iso"]'),want('view:3d','3D'));assert.deepEqual(await tip(page,'#quickEdit'),['Edit dimensions →',null]);
 for(const s of ['#rotateMode','#mirrorMode','#measureBtn'])assert.deepEqual(await tip(page,s),[null,null],s+' stays untouched');
 // Follow-up ruling: the tooltip follows the rendered label minus a trailing ▾ ("Edge ▾" → "Edge (F)" once the geometry
 // lane renames Round); data-tip-label overrides one button; icon glyphs drop out; today Round reads "Round (F)".
 {const R='[data-mode="round"]',set=v=>page.evaluate(([r,v])=>{document.querySelector(r).firstChild.nodeValue=v;},[R,v]).then(()=>page.waitForTimeout(80));
  assert.deepEqual(await tip(page,R),want('mode:round','Round'));await set('Edge ▾');assert.deepEqual(await tip(page,R),want('mode:round','Edge'),'a button labelled "X ▾" gets "X (key)"');
  await page.evaluate(r=>{const b=document.querySelector(r);b.dataset.tipLabel='Fillet';b.firstChild.nodeValue='Edge';},R);await page.waitForTimeout(80);assert.deepEqual(await tip(page,R),want('mode:round','Fillet'),'data-tip-label overrides');
  await page.evaluate(r=>{delete document.querySelector(r).dataset.tipLabel;},R);await set('Round');assert.deepEqual(await tip(page,R),want('mode:round','Round'));}
 // Every sheet and panel.
 for(const [btn,what] of [['#addBtn','add'],['#projectMenu','projects'],['#layersBtn','layers'],['#exportBtn','export'],['#helpBtn','help']]){await page.click(btn);await page.waitForFunction(()=>!document.querySelector('#sheet').hidden&&document.querySelector('#sheetContent button'));await check(what+' sheet');await closeSheet(page);}
 await page.click('#helpBtn');await page.waitForSelector('#loadExample');await page.click('#loadExample');await page.waitForFunction(()=>window.__cad.project.objects.length>0&&window.__cad.selected);await page.waitForTimeout(500);await check('example loaded');
 await page.click('#editBtn');await page.waitForFunction(()=>!document.querySelector('#sheet').hidden&&document.querySelector('#sheetContent button'));await check('edit sheet');
 assert.deepEqual(await tip(page,'#closeSheet'),want('escape','Close panel'));assert.deepEqual(await tip(page,'#duplicateObject'),want('duplicate','Duplicate'));assert.deepEqual(await tip(page,'#deleteObject'),['Delete','Delete'],'Delete has no sheet shortcut (sheets take only Esc and Cmd/Ctrl)');await closeSheet(page);
 await page.click('#objectsToggle');await page.waitForFunction(()=>!document.querySelector('#objectsPanel').hidden&&document.querySelector('#objectsList button'));await check('objects panel');await page.click('#objectsToggle');
 // A button whose own text changes keeps a matching tooltip (Snap on → Snap off).
 await page.click('[data-mode="move"]');await check('move action bar');assert.deepEqual(await tip(page,'#snapStatus'),['Snap on',null]);
 await page.click('#snapStatus');await page.waitForTimeout(50);assert.deepEqual(await tip(page,'#snapStatus'),['Snap off',null],'tooltip follows the button text');await page.click('#snapStatus');
 await page.click('[data-mode="select"]');
 const mode=()=>page.evaluate(()=>window.__cad.touch.getState().mode),bubble=()=>page.evaluate(()=>document.querySelector('#tipBubble')?.textContent??null);
 if(!desktop){
  assert.ok(!(await chunks(page)).includes('chunk-tooltip-bubble'),'bubble chunk not loaded before a long-press');
  const cdp=await page.context().newCDPSession(page);
  const center=s=>page.evaluate(sel=>{const r=document.querySelector(sel).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};},s);
  const touch=(type,p)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:type==='touchEnd'?[]:[{x:p.x,y:p.y,id:1}]});
  async function longPress(sel,{hold=LONG_PRESS_MS+250,move=0}={}){await page.waitForFunction(()=>!document.querySelector('#tipBubble'),null,{timeout:BUBBLE_MS+1000});const p=await center(sel);await touch('touchStart',p);if(move){await page.waitForTimeout(100);await touch('touchMove',{x:p.x+move,y:p.y});}await page.waitForTimeout(hold);const shown=await bubble();await touch('touchEnd',p);await page.waitForTimeout(150);return shown;}
  // Mode bar: bubble with the tooltip text, mode unchanged, bubble gone after 1.5 s.
  assert.equal(await mode(),'select');const t0=Date.now();
  assert.equal(await longPress('[data-mode="move"]'),say('mode:move','Move'),'long-press bubble on Move');assert.equal(await mode(),'select','long-press did not switch the mode');
  assert.ok((await chunks(page)).includes('chunk-tooltip-bubble'),'bubble chunk loaded on the long-press');
  const box=await page.evaluate(()=>{const r=document.querySelector('#tipBubble')?.getBoundingClientRect();return r&&{l:r.left,r:r.right,t:r.top,b:r.bottom,pe:getComputedStyle(document.querySelector('#tipBubble')).pointerEvents};});
  assert.ok(box&&box.l>=0&&box.r<=412&&box.t>=0&&box.b<=915&&box.pe==='none','bubble inside the window and click-through '+JSON.stringify(box));
  await page.waitForFunction(()=>!document.querySelector('#tipBubble'),null,{timeout:BUBBLE_MS+1000});const gone=Date.now()-t0;assert.ok(gone>=BUBBLE_MS,'bubble stays 1.5 s ('+gone+' ms)');
  // Dock: Export long-press shows the bubble and opens no sheet; Toolbar: Fit and Undo.
  assert.equal(await longPress('#exportBtn'),say('export','Export'));assert.equal(await sheetOpen(page),false,'long-press on Export opened nothing');
  assert.equal(await longPress('#addBtn'),say('add','Add'));assert.equal(await sheetOpen(page),false,'long-press on Add opened nothing');
  const hist=await page.evaluate(()=>window.__cad.historyLength);assert.equal(await longPress('#wire'),say('wire','Wireframe'));assert.equal(await page.evaluate(()=>document.querySelector('#wire').classList.contains('active')),false,'wireframe not toggled');
  assert.equal(await page.evaluate(()=>window.__cad.historyLength),hist);
  // Ruling 2: the header and the selection bar too. Help opens no sheet; Clear keeps the selection.
  assert.equal(await longPress('#helpBtn'),say('help','Help'));assert.equal(await sheetOpen(page),false,'long-press on Help opened nothing');
  assert.equal(await longPress('#projectMenu'),'Project menu');assert.equal(await sheetOpen(page),false,'long-press on the project menu opened nothing');
  await page.evaluate(()=>window.__cad.touch.selectFace(window.__cad.project.objects[0].id,0));await page.waitForTimeout(100);
  assert.equal(await longPress('#deselectBtn'),say('clear','Clear'));assert.ok(await page.evaluate(()=>!!window.__cad.selected),'long-press on Clear kept the selection');
  assert.equal(await longPress('#quickEdit'),'Edit dimensions →');assert.equal(await sheetOpen(page),false,'long-press on Edit dimensions opened nothing');
  await page.evaluate(()=>window.__cad.touch.deselect());await page.click('[data-mode="select"]');
  // A press that moves 20 px is not a long-press; a short tap right after a long-press still works.
  assert.equal(await longPress('[data-mode="stretch"]',{move:20}),null,'moved press shows no bubble');
  await longPress('[data-mode="move"]');const p=await center('[data-mode="move"]');await touch('touchStart',p);await page.waitForTimeout(60);await touch('touchEnd',p);await page.waitForFunction(()=>window.__cad.touch.getState().mode==='move',null,{timeout:3000});
  assert.equal(await mode(),'move','short tap after a long-press fires normally');
  await page.click('[data-mode="select"]');
  // Sheet buttons and the canvas get no bubble (canvas long-press keeps its own menu).
  assert.equal(await longPress('#scene'),null,'no bubble on the canvas');
  if(await sheetOpen(page))await closeSheet(page);
  out.push(`${name}: ${audited} button checks, long-press bubble on header, toolbar, mode bar, selection bar and dock buttons without firing`);
 }else{
  // Mouse: a long mouse press is an ordinary click (desktop gets the native title on hover), and no bubble appears.
  const r=await page.evaluate(()=>{const r=document.querySelector('[data-mode="move"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
  await page.mouse.move(r.x,r.y);await page.mouse.down();await page.waitForTimeout(LONG_PRESS_MS+250);assert.equal(await bubble(),null,'no bubble for a mouse');await page.mouse.up();
  await page.waitForFunction(()=>window.__cad.touch.getState().mode==='move',null,{timeout:3000});
  out.push(`${name}: ${audited} button checks, mouse press unaffected`);}
 await page.context().close();}}
finally{await env.close();}
console.log('PASS: tooltips: '+out.join('; '));
