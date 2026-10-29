// ADR-0001 F3 (Rotate handles) in the real browser (built app/assets, real worker). The Rotate button takes the cell W0
// reserved (same box); R or a tap enters Rotate mode with three world-axis rings around the selection centre. A drag on
// a ring turns the object about that world axis through the centre: with Snap on the turn is a multiple of 15°, Shift
// (desktop) or Snap off (the action-bar toggle) turns freely; the live readout is in #liveMeasure; one gesture is one
// Undo step. Phone: a one-finger ring drag rotates; a second finger cancels the drag (no two-finger twist in 3.0).
// Readouts follow the display unit (no mm text in inch mode). Phone 412×915 touch, phone 360×800 touch, desktop 1440×900.
import assert from 'node:assert/strict';import * as H from '../tools/readme-shots/harness.mjs';
import {worldCenter} from '../web/operations.mjs';
const SIZES={'phone-412x915':{viewport:{width:412,height:915},deviceScaleFactor:2,hasTouch:true,isMobile:true},'phone-360x800':{viewport:{width:360,height:800},deviceScaleFactor:2,hasTouch:true,isMobile:true},'desktop-1440x900':{viewport:{width:1440,height:900}}};
const P=objects=>({format:'tristancad',version:2,name:'F3',objects,layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1'});
const BOX={id:'box1',name:'Box',type:'box',params:{w:30,d:20,h:10},position:[0,0,5],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'};
// A sketch whose outline is off its origin, so its centre is not its position (the pivot must be the centre).
const SKETCH={id:'sk',name:'Sketch',type:'polygon',params:{points:[[20,5],[40,5],[40,25],[25,30]],h:8},position:[0,0,4],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'};
const env=await H.start();let checks=0;
try{for(const [name,o] of Object.entries(SIZES)){const touch=!!o.hasTouch,ctx=await env.browser.newContext(o);const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 // Synthetic pointers (the second finger) are not "active" to Chromium, so pointer capture would throw NotFoundError on
 // them; swallow only that, as the jsdom interaction tests stub capture.
 await page.addInitScript(()=>{for(const k of ['setPointerCapture','releasePointerCapture']){const f=Element.prototype[k];Element.prototype[k]=function(id){try{return f.call(this,id);}catch(e){if(e.name!=='NotFoundError')throw e;}};}});
 await page.addInitScript(()=>{window.Android={beginFile(name,mime){window.savedFile={name,mime,chunks:[]}},appendFile(x){window.savedFile.chunks.push(x)},finishFile(){window.savedFile.done=true}};});
 await page.goto(env.origin+'/index.html');await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,{},{timeout:90000});
 // The Rotate button: visible, focusable, a real mode button with its registry tooltip; the reserved placeholder is gone.
 const btn=await page.evaluate(()=>{const b=document.querySelector('#touchModes [data-mode=rotate]'),c=getComputedStyle(b),r=b.getBoundingClientRect();return {id:b.id,text:b.textContent,vis:c.visibility,tab:b.tabIndex,hidden:b.getAttribute('aria-hidden'),cls:b.className,title:b.title,placeholder:!!document.querySelector('#rotateMode.pending'),order:[...document.querySelectorAll('#touchModes button')].map(x=>x.dataset.mode||x.id),h:r.height,w:r.width};});
 assert.deepEqual([btn.id,btn.text,btn.vis,btn.tab,btn.hidden,btn.cls,btn.title,btn.placeholder],['rotateMode','Rotate','visible',0,null,'','Rotate (R)',false],name+' Rotate button '+JSON.stringify(btn));
 assert.deepEqual(btn.order,['select','move','rotate','stretch','round','mirror'],name+' mode-bar order');checks+=2;
 const load=async objects=>{await page.evaluate(p=>window.__cad.load(p),P(objects));await page.waitForFunction(()=>window.__cad.model?.parts?.length>=1&&!window.__cad.touch.isCommitting());await page.locator('#fit').click();await page.waitForTimeout(700);};
 const state=()=>page.evaluate(()=>window.__cad.touch.getState()),obj=id=>page.evaluate(id=>structuredClone(window.__cad.project.objects.find(o=>o.id===id)),id);
 // drag(axis, from°, to°): a pointer drag along the ring (screen points from the ring's own parametrisation); returns the
 // live readout seen just before release. The press starts 40° round the ring, away from the points where the rings cross. extra: {shift, second (put a second finger down mid-drag)}.
 const drag=(axis,a,b,extra={})=>page.evaluate(async([axis,a,b,extra,touch])=>{const t=window.__cad.touch,c=document.querySelector('#scene'),N=24;
  const ev=(type,at,id=1)=>c.dispatchEvent(new PointerEvent(type,{clientX:at[0],clientY:at[1],pointerId:id,pointerType:touch?'touch':'mouse',button:0,buttons:type==='pointerup'?0:1,isPrimary:id===1,shiftKey:!!extra.shift,bubbles:true}));
  const p=k=>t.ringScreen(axis,40+a+(b-a)*k/N);ev('pointerdown',p(0));for(let k=1;k<=N;k++){ev('pointermove',p(k));if(extra.second&&k===N/2){ev('pointerdown',[p(k)[0]+60,p(k)[1]+60],2);}}
  const live=document.querySelector('#liveMeasure').textContent,shown=!document.querySelector('#liveMeasure').hidden;ev('pointerup',p(N));if(extra.second)ev('pointerup',[p(N)[0]+60,p(N)[1]+60],2);return {live,shown};},[axis,a,b,extra,touch]);
 const settled=()=>page.waitForFunction(()=>!window.__cad.touch.isCommitting()&&!window.__cad.touch.isDragging(),{},{timeout:120000});
 await load([BOX]);
 // R enters Rotate mode (registry shortcut, every platform); the hint, the action bar and the Snap toggle.
 await page.keyboard.press('r');assert.equal((await state()).mode,'rotate',name+': R enters Rotate');
 assert.equal(await page.evaluate(()=>document.querySelector('#touchModes [data-mode=rotate]').classList.contains('active')),true);
 assert.equal(await page.locator('#touchHint').textContent(),'Drag a ring to rotate · Snap on turns in 15° steps · hold Shift to turn freely');
 assert.equal(await page.locator('#touchAction span').textContent(),'Rotation X 0° · Y 0° · Z 0°');assert.equal(await page.locator('#rotateSnap').textContent(),'Snap on');
 assert.equal(await page.evaluate(()=>document.querySelector('#axisTools').hidden),true,name+': no Move axis row in Rotate');checks+=5;
 // Three rings drawn (line loops on the paint layer), none while nothing is selected.
 const loops=()=>page.evaluate(()=>{let n=0;window.__cad.scene.traverse(x=>{if(x.isLineLoop&&x.visible)n++;});return n;});assert.equal(await loops(),3,name+': three rings');checks++;
 // A snapped drag on the Z ring by ~50° stores exactly 45° (a multiple of 15), position unchanged (the box centre is its
 // origin); one history entry; Undo restores the exact object.
 const before=await obj('box1'),h0=await page.evaluate(()=>window.__cad.historyLength);
 let r=await drag(2,0,50);await settled();let now=await obj('box1');
 assert.ok(r.shown&&r.live==='Rotate Z 45°',name+': live readout '+JSON.stringify(r));assert.deepEqual(now.rotation,[0,0,45],name+': snapped Z turn');
 now.position.forEach((v,i)=>assert.ok(Math.abs(v-before.position[i])<1e-9,name+': centre pivot keeps a centred box in place'));
 assert.equal(await page.evaluate(()=>window.__cad.historyLength),h0+1,name+': one Undo step per gesture');
 await page.locator('#undo').click();await page.waitForFunction(()=>window.__cad.project.objects[0].rotation[2]===0);const undone=await obj('box1');
 assert.deepEqual([undone.rotation,undone.position],[before.rotation,before.position],name+': Undo restores');assert.equal(await page.evaluate(()=>window.__cad.historyLength),h0);checks+=5;
 // Every snapped result is a multiple of 15° (X and Y rings, both directions).
 for(const [axis,a,b] of [[0,0,-70],[1,10,100],[2,0,200]]){await drag(axis,a,b);await settled();const x=await obj('box1');assert.ok(x.rotation.every(v=>Number.isInteger(v/15)),name+`: snapped multiple of 15° (axis ${axis}) ${x.rotation}`);await page.locator('#undo').click();await page.waitForFunction(()=>window.__cad.project.objects[0].rotation.every(v=>v===0));checks++;}
 // Free rotation: Shift on desktop; Snap off (the action-bar toggle, every platform).
 if(!touch){r=await drag(2,0,37,{shift:true});await settled();now=await obj('box1');assert.ok(Math.abs(now.rotation[2]-37)<2&&!Number.isInteger(now.rotation[2]/15),name+': Shift turns freely '+now.rotation);assert.match(r.live,/^Rotate Z 3\d(\.\d)?°$/);
  await page.locator('#undo').click();await page.waitForFunction(()=>window.__cad.project.objects[0].rotation[2]===0);checks++;}
 await page.locator('#rotateSnap').click();assert.equal(await page.locator('#rotateSnap').textContent(),'Snap off');assert.equal(await page.locator('#snapStatus').textContent(),'Snap off','one Snap setting shared with Move');
 r=await drag(2,0,37);await settled();now=await obj('box1');assert.ok(Math.abs(now.rotation[2]-37)<2&&!Number.isInteger(now.rotation[2]/15),name+': Snap off turns freely '+now.rotation);
 assert.equal(await page.locator('#touchAction span').textContent(),`Rotation X 0° · Y 0° · Z ${+now.rotation[2].toFixed(1)}°`);
 await page.locator('#undo').click();await page.waitForFunction(()=>window.__cad.project.objects[0].rotation[2]===0);await page.locator('#rotateSnap').click();assert.equal(await page.locator('#rotateSnap').textContent(),'Snap on');checks+=3;
 // Pivot: the sketch's centre (not its origin) stays put while its position turns about it.
 await load([SKETCH]);await page.evaluate(()=>window.__cad.touch.setMode('rotate'));const s0=await obj('sk');
 await drag(0,0,90);await settled();const s1=await obj('sk');assert.deepEqual(s1.rotation,[90,0,0],name+': X ring');
 const c0=worldCenter(s0),c1=worldCenter(s1);c1.forEach((v,i)=>assert.ok(Math.abs(v-c0[i])<1e-9,name+`: centre kept ${c1} vs ${c0}`));assert.ok(Math.hypot(...s1.position.map((v,i)=>v-s0.position[i]))>1,name+': position turned about the centre');checks+=2;
 // Phone: a second finger mid-drag cancels the rotation (no twist); nothing is recorded.
 if(touch){const h=await page.evaluate(()=>window.__cad.historyLength),pre=await obj('sk');await drag(2,0,60,{second:true});await settled();await page.waitForTimeout(300);
  assert.deepEqual((await obj('sk')).rotation,pre.rotation,name+': two fingers cancel the ring drag');assert.equal(await page.evaluate(()=>window.__cad.historyLength),h,name+': nothing recorded');checks+=2;}
 // A press away from the rings does not rotate (it orbits the camera instead).
 {const pre=await obj('sk');await page.evaluate(([touch])=>{const c=document.querySelector('#scene'),r=c.getBoundingClientRect(),x=r.x+20,y=r.y+20;const ev=(t,dx)=>c.dispatchEvent(new PointerEvent(t,{clientX:x+dx,clientY:y,pointerId:1,pointerType:touch?'touch':'mouse',button:0,buttons:t==='pointerup'?0:1,isPrimary:true,bubbles:true}));ev('pointerdown',0);for(let i=1;i<=6;i++)ev('pointermove',i*8);ev('pointerup',48);},[touch]);
  await page.waitForTimeout(200);assert.equal((await state()).mode,'rotate');assert.equal(await page.evaluate(()=>window.__cad.touch.isDragging()),false);assert.deepEqual((await obj('sk')).rotation,pre.rotation);checks++;}
 // Inch mode: the Rotate texts carry no millimetre text (angles only); Move's bar still follows the unit.
 await page.evaluate(()=>window.__cad.units.set('in'));await page.evaluate(()=>window.__cad.touch.setMode('rotate'));r=await drag(1,0,30);await settled();
 const texts=await page.evaluate(()=>[document.querySelector('#touchHint').textContent,document.querySelector('#touchAction').textContent]);
 for(const t of [...texts,r.live])assert.ok(!/\bmm\b|millimet/.test(t),name+': no mm text in inch mode: '+t);assert.equal(r.live,'Rotate Y 30°');
 await page.evaluate(()=>window.__cad.touch.setMode('move'));assert.match(await page.locator('#touchAction span').textContent(),/^X -?\d+\.\d{3} · Y -?\d+\.\d{3} · Z -?\d+\.\d{3}$/);await page.evaluate(()=>window.__cad.units.set('mm'));checks+=2;
 assert.deepEqual(errors,[],name+': page errors');await ctx.close();}}
finally{await env.close();}
console.log(`PASS: rotate-handles UI (${checks} checks): Rotate button in its reserved cell, R / tap enters Rotate, 3 rings, 15° snap, Shift and Snap off free, centre pivot, one Undo step, two fingers cancel (phone), no mm text in inches`);
