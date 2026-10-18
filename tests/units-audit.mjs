// ADR-0001 F1c readout audit (UI round 2): in inch mode every length the app prints goes through the inch formatter.
// The app runs in inches (phone and desktop) through each surface that prints a position, size or distance: status,
// model size, axis tag, Move/Stretch/Round action bars, live measure while dragging Move/Stretch/Round, Edit (params,
// position, size hint), Pull face, Radius, Merge, Sketch, and the validation messages. At each stop the visible text is
// scanned: "mm"/"millimeters" may appear only in the mm-only areas (export sheet, thread panels, face-resolution
// tolerance, help/template prose listed in ALLOWED), and every number followed by "in" must have the formatter's
// 3 decimals (fmtLen), so a raw mm number with an inch suffix fails too.
import assert from 'node:assert/strict';
const H=await import('../tools/readme-shots/harness.mjs');const env=await H.start();const out=[];
// mm-only text that stays by ruling 14 / round 2 (tolerances, help and template prose).
const ALLOWED=[/5 mm mounting hole/g,/For a 10 mm tall shape to sit on the plane, set center Z to 5\./g,/0\.005 mm curve resolution/g,/0\.02 mm overlap/g];
const EXEMPT='#unitSwitch,#exportMetrics,#quality,.threadpanel,[id^="thread"],[id^="resolution"],.resolutionpresets';
const scan=(page,where)=>page.evaluate(([where,EXEMPT,allowed])=>{const bad=[];const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
 const sheetTitle=document.querySelector('#sheet:not([hidden]) #sheetTitle')?.textContent||'';if(/^Export|^Make your first part/.test(sheetTitle))return [];
 while(n=w.nextNode()){const el=n.parentElement;if(!el||!n.nodeValue.trim())continue;if(el.closest('[hidden],script,style')||!el.getClientRects().length)continue;if(el.closest(EXEMPT))continue;
  let t=n.nodeValue;for(const a of allowed)t=t.replace(new RegExp(a,'g'),'');
  if(/\bmm\b|millimet/i.test(t))bad.push(where+': mm text "'+n.nodeValue.trim()+'"');
  for(const m of t.matchAll(/(-?\d+(?:\.\d+)?)(?:\s*[×,·)]\s*-?\d+(?:\.\d+)?)*\s*in\b/g))for(const v of m[0].match(/-?\d+(?:\.\d+)?/g))if(!/^-?\d+\.\d{3}$/.test(v)&&!/^0\.0?\d+$|^393\.7$/.test(v))bad.push(where+': unformatted "'+m[0]+'"');}
 // input values in length fields must be formatter output too (3 decimals) unless the user typed them
 for(const i of document.querySelectorAll('#sheet:not([hidden]) input[type=number]')){const lab=document.querySelector(`label[for="${i.id}"]`)?.textContent||'';if(/· mm|millimet/.test(lab)&&!i.closest(EXEMPT))bad.push(where+': mm field label "'+lab+'"');}
 return bad;},[where,EXEMPT,ALLOWED.map(r=>r.source)]);
const open=async(page,fn)=>{await fn();await page.waitForFunction(()=>!document.querySelector('#sheet').hidden);await page.waitForTimeout(300);};
const close=async page=>{if(await page.evaluate(()=>!document.querySelector('#sheet').hidden)){await page.click('#closeSheet');await page.waitForFunction(()=>document.querySelector('#sheet').hidden);}};
const settle=page=>page.waitForFunction(()=>/^(Ready · |[\d,]+ preview triangles)/.test(document.querySelector('#busy').textContent),null,{timeout:60000}).then(()=>page.waitForTimeout(300));
const fire=(page,type,at,dx=0,dy=0)=>page.evaluate(([type,at,dx,dy])=>{const ev=new MouseEvent(type,{clientX:at[0]+dx,clientY:at[1]+dy,bubbles:true,cancelable:true});Object.defineProperty(ev,'pointerId',{value:1});Object.defineProperty(ev,'pointerType',{value:'touch'});document.querySelector('#scene').dispatchEvent(ev);},[type,at,dx,dy]);
const toastText=page=>page.waitForFunction(()=>!document.querySelector('#toast').hidden&&document.querySelector('#toast').textContent).then(()=>page.evaluate(()=>document.querySelector('#toast').textContent));
try{for(const desktop of [false,true]){const page=await H.open(env,{desktop}),name=desktop?'desktop':'phone',bad=[];const check=async w=>bad.push(...await scan(page,name+' '+w));
 await page.evaluate(()=>window.__cad.units.set('in'));await page.waitForTimeout(300);await check('startup');
 await page.evaluate(()=>window.__cad.load(window.__cad.templates.plate()));await settle(page);await check('model loaded');
 const id=await page.evaluate(()=>window.__cad.project.objects[0].id);
 // Move: action bar readout (the bug: "X 0.0 · Y 0.0 · Z 3.0") and the live measure while dragging.
 await page.evaluate(()=>window.__cad.touch.setMode('move'));await page.waitForTimeout(150);
 const bar=await page.evaluate(()=>document.querySelector('#touchAction span')?.textContent);assert.equal(bar,'X 0.000 · Y 0.000 · Z 0.118','Move bar readout in inches');await check('move bar');
 let at=await page.evaluate(()=>window.__cad.touch.pointScreen([10,5,6]));await page.click('[data-axis="X"]');await fire(page,'pointerdown',at);for(const dx of [10,25,40])await fire(page,'pointermove',at,dx);
 assert.match(await page.evaluate(()=>document.querySelector('#liveMeasure').textContent),/^X \d+\.\d{3} · Y \d+\.\d{3} · Z \d+\.\d{3} in$/);await check('move drag');await fire(page,'pointerup',at,40);await settle(page);
 assert.match(await page.evaluate(()=>document.querySelector('#touchAction span')?.textContent),/^X -?\d+\.\d{3} · Y -?\d+\.\d{3} · Z 0\.118$/,'bar follows the drag');await check('move bar after drag');
 await page.evaluate(()=>document.getElementById('undo').click());await settle(page);
 // Stretch: face selected, bar, drag live measure.
 await page.evaluate(id=>window.__cad.touch.selectFace(id,0),id);await page.waitForSelector('#stretchSize');await check('stretch bar');
 at=await page.evaluate(()=>window.__cad.touch.pointScreen([0,20,3]));await fire(page,'pointerdown',at);for(const dy of [5,12,20])await fire(page,'pointermove',at,0,dy);
 const sm=await page.evaluate(()=>document.querySelector('#liveMeasure').hidden?null:document.querySelector('#liveMeasure').textContent);if(sm)assert.match(sm,/^[XYZ]: \d+\.\d{3} in$/);await check('stretch drag');await fire(page,'pointerup',at,0,20);await settle(page);
 if(await page.evaluate(p=>JSON.stringify(window.__cad.project)!==p,JSON.stringify(await page.evaluate(()=>window.__cad.project))))await page.evaluate(()=>document.getElementById('undo').click());await settle(page);
 // Round: edge bar + Radius sheet.
 await page.evaluate(id=>{const t=window.__cad.touch;t.setMode('round');t.selectEdges(id,[0]);},id);await page.waitForTimeout(150);await check('round bar');
 await open(page,()=>page.click('#roundSet'));await check('radius sheet');await close(page);
 // Edit sheet, size sheet and validation messages in inches.
 await page.evaluate(()=>window.__cad.touch.setMode('select'));await open(page,()=>page.click('#editBtn'));await check('edit sheet');
 await page.fill('#p_w','0.001');await page.click('#applyObject');await page.waitForFunction(()=>document.querySelector('#editError').textContent);
 assert.equal(await page.evaluate(()=>document.querySelector('#editError').textContent),'Dimensions must be at least 0.002 in.');await check('edit validation');await close(page);
 await page.evaluate(id=>window.__cad.touch.selectFace(id,0),id);await page.waitForSelector('#stretchSize');await open(page,()=>page.click('#stretchSize'));await check('pull sheet');
 await page.fill('#exactSize','0.001');await page.click('#applySize');assert.equal(await toastText(page),'Dimension must be 0.002–393.7 in.');await check('pull validation');await close(page);
 // Merge: separated pieces with a too-thin bar.
 await page.evaluate(()=>{const t=window.__cad.touch;t.deselect();window.__cad.change(p=>{p.objects[1].mode='solid';p.objects[2].mode='solid';});const o=window.__cad.project.objects;t.mergeMenu([o[1].id,o[2].id]);});await page.waitForFunction(()=>!document.querySelector('#sheet').hidden);await check('merge sheet');
 await page.check('#addBridge');await page.fill('#bridgeDiameter','0.01');await page.click('#confirmMerge');await page.waitForFunction(()=>document.querySelector('#mergeError').textContent,null,{timeout:60000});
 assert.equal(await page.evaluate(()=>document.querySelector('#mergeError').textContent),'Connecting bar diameter must be 0.02–393.7 in.');await check('merge validation');await close(page);
 // Sketch sheet and its validation message.
 await open(page,()=>page.click('#addBtn'));await page.click('#sketchBtn');await page.waitForSelector('#sketchSpan');
 for(const [x,y] of [[0,0],[1,0],[0,1]]){await page.fill('#pointX',String(x));await page.fill('#pointY',String(y));await page.click('#pointAdd');}await check('sketch sheet');
 await page.fill('#sketchHeight','0.001');await page.click('#extrude');await page.waitForFunction(()=>document.querySelector('#sketchError').textContent);
 assert.equal(await page.evaluate(()=>document.querySelector('#sketchError').textContent),'Extrusion height must be 0.002–393.7 in.');await check('sketch validation');await close(page);
 // Size hint (advanced shape draft).
 await open(page,()=>page.click('#addBtn'));await page.click('#advancedBtn');await page.click('[data-shape="tetrahedron"]');await page.waitForSelector('#shapeSize');await check('size hint');await close(page);
 assert.deepEqual(bad,[],bad.join('\n'));
 // The same messages stay mm in mm.
 await page.evaluate(()=>window.__cad.units.set('mm'));await page.evaluate(()=>window.__cad.load(window.__cad.templates.plate()));await settle(page);await page.evaluate(()=>window.__cad.touch.setMode('move'));await page.waitForTimeout(150);
 assert.equal(await page.evaluate(()=>document.querySelector('#touchAction span')?.textContent),'X 0.0 · Y 0.0 · Z 3.0','mm bar is today\'s text');
 await page.evaluate(()=>window.__cad.touch.setMode('select'));await open(page,()=>page.click('#editBtn'));await page.fill('#p_w','0.001');await page.click('#applyObject');await page.waitForFunction(()=>document.querySelector('#editError').textContent);
 assert.equal(await page.evaluate(()=>document.querySelector('#editError').textContent),'Dimensions must be at least 0.05 mm.');await close(page);
 out.push(name+': 20 surfaces clean in inches');await page.context().close();}}
finally{await env.close();}
console.log('PASS: units-audit: '+out.join('; '));
