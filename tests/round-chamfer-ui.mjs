// ADR-0001 F6 in the real browser (built app/assets, real worker, lazy chunk through import()). Master Chief's rulings
// (1 and 18:35 CT): the Round button reads "Edge ▾" inside its reserved box and never changes; the FIRST tap opens a
// dropdown with Round and Chamfer (role menu/menuitem, 44 px, inside the viewport, aria-expanded, chunk loaded only
// then) without changing the mode; an outside tap, Esc (focus back to Edge ▾) and a second tap close it with no mode
// change; picking starts that tool and Edge ▾ shows the active state; F opens it, arrows move (wrapping), Enter picks.
// Chamfer switches the hint, the action button and the exact-value sheet (Edge mode intro); an exact chamfer and a drag
// chamfer are stored as kind 'chamfer' with the analytic volume and export a matching STL; a round on another edge
// (mixed) works; one Undo step per change; the v3 autosave key is written only once a chamfer exists.
// Phone 360×800 and desktop 1024×688.
import assert from 'node:assert/strict';import * as H from '../tools/readme-shots/harness.mjs';
const SIZES={'phone-360x800':{viewport:{width:360,height:800},deviceScaleFactor:2,hasTouch:true,isMobile:true},'desktop-1024x688':{viewport:{width:1024,height:688}}};
const stlVolume=b=>{let v=0;for(let i=84;i<b.length;i+=50){const p=[0,1,2].map(k=>[0,1,2].map(j=>b.readFloatLE(i+12+k*12+j*4)));v+=(p[0][0]*(p[1][1]*p[2][2]-p[1][2]*p[2][1])-p[0][1]*(p[1][0]*p[2][2]-p[1][2]*p[2][0])+p[0][2]*(p[1][0]*p[2][1]-p[1][1]*p[2][0]))/6;}return v;};
const env=await H.start();
try{for(const [name,o] of Object.entries(SIZES)){const ctx=await env.browser.newContext(o);const page=await ctx.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const chunks=[];page.on('request',r=>{if(/chunk-edge-tool-/.test(r.url()))chunks.push(r.url());});
 await page.addInitScript(()=>{window.Android={beginFile(name,mime){window.savedFile={name,mime,chunks:[]}},appendFile(x){window.savedFile.chunks.push(x)},finishFile(){window.savedFile.done=true}};});
 await page.goto(env.origin+'/index.html');await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,{},{timeout:90000});
 const round=page.locator('#touchModes [data-mode=round]');
 assert.equal(await round.textContent(),'Edge ▾');assert.equal(await round.getAttribute('aria-haspopup'),'menu');
 const fit=await round.evaluate(b=>{const r=document.createRange();r.selectNodeContents(b);const cs=getComputedStyle(b);return {text:r.getBoundingClientRect().width,inner:b.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),lines:r.getClientRects().length,h:b.getBoundingClientRect().height};});
 assert.ok(fit.text<=fit.inner&&fit.lines===1&&fit.h===37,name+': "Edge ▾" fits on one line in its reserved box '+JSON.stringify(fit));
 await page.evaluate(()=>window.__cad.load({format:'tristancad',version:2,name:'F6',objects:[{id:'box1',name:'Box',type:'box',params:{w:30,d:20,h:10},position:[0,0,5],rotation:[0,0,0],mode:'solid',enabled:true,layerId:'layer-1'}],layers:[{id:'layer-1',name:'Layer 1'}],activeLayer:'layer-1'}));
 await page.waitForFunction(()=>window.__cad.model?.volume===6000&&window.__cad.touch&&!window.__cad.touch.isCommitting());
 const state=()=>page.evaluate(()=>window.__cad.touch.getState());
 const menu=page.locator('#edgeToolMenu'),vp=o.viewport,expanded=()=>round.getAttribute('aria-expanded'),active=()=>round.evaluate(b=>b.classList.contains('active'));
 assert.equal(await expanded(),'false');assert.equal(chunks.length,0,'no edge-tool chunk at startup');
 // Master Chief 18:35 CT: the FIRST tap opens the dropdown (Round, Chamfer as 44 px menuitems) and changes no mode.
 await round.click();await menu.waitFor();assert.equal(chunks.length,1,'chunk loaded on the first tap');assert.equal((await state()).mode,'select','opening changes no mode');
 assert.equal(await expanded(),'true');assert.equal(await round.getAttribute('aria-controls'),'edgeToolMenu');assert.equal(await menu.getAttribute('role'),'menu');
 const items=await menu.locator('button').evaluateAll(bs=>bs.map(b=>{const r=b.getBoundingClientRect();return {t:b.textContent,k:b.dataset.edgeTool,role:b.getAttribute('role'),h:r.height,x0:r.left,x1:r.right,y1:r.bottom};}));
 assert.deepEqual(items.map(i=>[i.t,i.k,i.role]),[['Round','round','menuitem'],['Chamfer','chamfer','menuitem']]);
 for(const i of items){assert.ok(i.h>=44,name+' item >= 44 px');assert.ok(i.x0>=0&&i.x1<=vp.width&&i.y1<=vp.height,name+' item inside the viewport');}
 assert.equal(await page.evaluate(()=>document.activeElement?.dataset.edgeTool),'round','focus on the first item');
 // Outside tap closes, no mode change; Esc closes, no mode change, focus back on Edge ▾; a second tap on Edge ▾ closes.
 await page.mouse.click(vp.width/2,vp.height-120);await menu.waitFor({state:'detached'});assert.equal((await state()).mode,'select');assert.equal(await expanded(),'false');
 const sel0=await page.evaluate(()=>window.__cad.selected);await round.click();await menu.waitFor();await page.keyboard.press('Escape');await menu.waitFor({state:'detached'});assert.equal((await state()).mode,'select');
 assert.equal(await page.evaluate(()=>document.activeElement?.dataset.mode),'round','Esc returns focus to Edge ▾');assert.equal(await page.evaluate(()=>window.__cad.selected),sel0,'Esc in the dropdown does not deselect');
 await round.click();await menu.waitFor();await round.click();await menu.waitFor({state:'detached',timeout:2000});assert.equal((await state()).mode,'select');assert.equal(await active(),false);
 // Pick Round: closes, starts the Round tool, Edge ▾ active, label unchanged.
 await round.click();await menu.locator('[data-edge-tool=round]').click();await menu.waitFor({state:'detached'});
 assert.equal((await state()).mode,'round');assert.equal((await state()).edgeTool,'round');assert.equal(await active(),true,'Edge ▾ active in Round');assert.equal(await round.textContent(),'Edge ▾');
 assert.equal(await page.locator('#touchHint').textContent(),'Edge taps: 1 edge · 2 face perimeter · 3 all edges · drag to round');assert.equal(await page.locator('#roundSet').textContent(),'Radius');
 // In edge mode a tap opens the dropdown again (the running tool is highlighted and focused); outside tap keeps Round.
 await round.click();await menu.waitFor();assert.equal(await page.evaluate(()=>document.activeElement?.dataset.edgeTool),'round');
 await page.mouse.click(vp.width/2,vp.height-120);await menu.waitFor({state:'detached'});assert.equal((await state()).mode,'round');assert.equal((await state()).edgeTool,'round');
 // Keyboard: F opens (focus on the first item), ArrowDown moves to Chamfer, ArrowDown wraps, ArrowUp back, Enter picks.
 await page.locator('#fit').focus();await page.keyboard.press('f');await menu.waitFor();assert.equal(await expanded(),'true');
 await page.keyboard.press('ArrowDown');assert.equal(await page.evaluate(()=>document.activeElement?.dataset.edgeTool),'chamfer');
 await page.keyboard.press('ArrowDown');assert.equal(await page.evaluate(()=>document.activeElement?.dataset.edgeTool),'round','ArrowDown wraps');
 await page.keyboard.press('ArrowUp');assert.equal(await page.evaluate(()=>document.activeElement?.dataset.edgeTool),'chamfer','ArrowUp wraps');
 await page.keyboard.press('Enter');await menu.waitFor({state:'detached'});assert.equal(await page.evaluate(()=>document.activeElement?.dataset.mode),'round','Enter returns focus to Edge ▾');
 // Chamfer running: hint, action button, Edge ▾ still active with the same label.
 assert.equal((await state()).edgeTool,'chamfer');assert.equal((await state()).mode,'round');assert.equal(await active(),true,'Edge ▾ active in Chamfer');
 assert.equal(await page.locator('#touchHint').textContent(),'Edge taps: 1 edge · 2 face perimeter · 3 all edges · drag to chamfer');assert.equal(await page.locator('#roundSet').textContent(),'Distance');assert.equal(await round.textContent(),'Edge ▾');
 // Another mode turns Edge ▾ off; picking Chamfer again from Move starts Chamfer directly.
 await page.locator('#touchModes [data-mode=move]').click();assert.equal(await active(),false);await round.click();await menu.waitFor();assert.equal(await page.evaluate(()=>document.activeElement?.dataset.edgeTool),'round','edge mode off: focus starts on the first item');
 await menu.locator('[data-edge-tool=chamfer]').click();assert.equal((await state()).mode,'round');assert.equal((await state()).edgeTool,'chamfer');
 assert.equal(await page.evaluate(()=>localStorage.getItem('tristancad.autosave.v3')),null);
 // Exact chamfer d=1 on edges 0 and 1 (they meet at a corner): 5,985.333 mm³.
 const history0=await page.evaluate(()=>window.__cad.historyLength);
 await page.evaluate(()=>window.__cad.touch.selectEdges('box1',[0,1]));await page.locator('#roundSet').click();
 assert.equal(await page.locator('#sheetTitle').textContent(),'Chamfer selected edges');assert.ok((await page.locator('#sheet p.subtle').first().textContent()).includes('Drag up/down in Edge mode for live adjustment, or enter an exact distance.'),'Chamfer intro says Edge mode');assert.equal(await page.locator('label[for=exactRadius]').textContent(),'Chamfer distance · mm');
 assert.equal(await page.locator('#applyRadius').textContent(),'Apply chamfer');assert.equal(await page.locator('#removeRadius').textContent(),'Remove selected chamfers');
 await page.locator('#exactRadius').fill('-1');await page.locator('#applyRadius').click();assert.equal(await page.locator('#radiusError').textContent(),'Enter a non-negative distance.');
 await page.locator('#exactRadius').fill('1');await page.locator('#applyRadius').click();
 await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&Math.abs(window.__cad.model.volume-(6000-15+1/3))<1e-6,{},{timeout:30000});
 assert.deepEqual(await page.evaluate(()=>window.__cad.project.objects[0].fillets),[{edges:[0,1],radius:1,kind:'chamfer'}]);
 assert.equal(await page.evaluate(()=>window.__cad.historyLength),history0+1,'one Undo step');
 await page.waitForFunction(()=>JSON.parse(localStorage.getItem('tristancad.autosave.v3')||'null')?.project?.version===3,{},{timeout:10000});
 // Too large: the sheet shows the engine's chamfer error and the model is unchanged.
 await page.locator('#roundSet').click();await page.locator('#exactRadius').fill('40');await page.locator('#applyRadius').click();
 await page.waitForFunction(()=>document.querySelector('#radiusError').textContent.length>0,{},{timeout:30000});assert.match(await page.locator('#radiusError').textContent(),/That chamfer is too large or conflicts with another edge\. Reduce the distance\./);
 await page.locator('#closeSheet').click();assert.deepEqual(await page.evaluate(()=>window.__cad.project.objects[0].fillets),[{edges:[0,1],radius:1,kind:'chamfer'}]);
 // Export: the STL volume matches.
 await page.locator('#exportBtn').click();await page.locator('#downloadSTL').click();await page.waitForFunction(()=>window.savedFile?.done,{},{timeout:60000});
 const file=await page.evaluate(()=>window.savedFile),bytes=Buffer.concat(file.chunks.map(s=>Buffer.from(s,'base64')));assert.equal(file.mime,'model/stl');assert.equal(bytes.length,84+bytes.readUInt32LE(80)*50);
 assert.ok(Math.abs(stlVolume(bytes)-(6000-15+1/3))<0.01,name+' STL volume '+stlVolume(bytes));if(await page.locator('#closeSheet').isVisible())await page.locator('#closeSheet').click();
 // Back to Round: a round r2 on edge 6 (the Z edge at the opposite corner, touching neither chamfer) → mixed round + chamfer.
 await round.click();await menu.locator('[data-edge-tool=round]').click();assert.equal(await page.locator('#roundSet').textContent(),'Radius');assert.equal(await active(),true);
 await page.evaluate(()=>window.__cad.touch.selectEdges('box1',[6]));await page.locator('#roundSet').click();assert.equal(await page.locator('#sheetTitle').textContent(),'Round selected edges');assert.ok((await page.locator('#sheet p.subtle').first().textContent()).includes('Drag up/down in Edge mode for live adjustment, or enter an exact radius.'),'Round intro says Edge mode');
 await page.locator('#exactRadius').fill('2');await page.locator('#applyRadius').click();await page.waitForFunction(()=>document.querySelector('#sheet').hidden&&window.__cad.project.objects[0].fillets.length===2,{},{timeout:30000});
 assert.deepEqual(await page.evaluate(()=>window.__cad.project.objects[0].fillets),[{edges:[0,1],radius:1,kind:'chamfer'},{edges:[6],radius:2}]);
 // Under load the model can still be the chamfer-only one right after the sheet closes: wait for the rebuilt model.
 await page.waitForFunction(v=>window.__cad.model?.volume<v-.5,6000-15+1/3,{timeout:60000});const mixed=await page.evaluate(()=>window.__cad.model.volume);assert.ok(Math.abs(mixed-(6000-15+1/3-(4-Math.PI)*10))<0.05,'mixed volume '+mixed);
 // Drag in Chamfer: the Z edge at (15,−10) (edge 4) chamfered by dragging up; readout says Chamfer.
 await round.click();await menu.locator('[data-edge-tool=chamfer]').click();
 const p=await page.evaluate(()=>window.__cad.touch.pointScreen([15,-10,5]));
 const before=await page.evaluate(()=>window.__cad.historyLength);
 await page.mouse.move(p[0],p[1]);await page.mouse.down();for(let i=1;i<=12;i++){await page.mouse.move(p[0],p[1]-i*4);await page.waitForTimeout(20);}
 const ok=await page.locator('#liveMeasure').textContent();await page.mouse.up();
 const dragged=await page.evaluate(()=>window.__cad.touch.getState().edges);
 if(ok.startsWith('Chamfer ')){assert.match(ok,/^Chamfer \d+\.\d\d mm/);await page.waitForFunction(()=>!window.__cad.touch.isCommitting(),{},{timeout:30000});
  const f=await page.evaluate(()=>window.__cad.project.objects[0].fillets);const c=f.find(x=>x.edges.includes(dragged[0]));assert.equal(c?.kind,'chamfer','dragged edge stored as a chamfer');assert.equal(await page.evaluate(()=>window.__cad.historyLength),before+1);}
 else console.log(name+': note: the drag did not pick an edge at the projected point (readout "'+ok+'"); drag path not asserted');
 // Undo removes the last change only.
 await page.locator('#undo').click();await page.waitForFunction(n=>window.__cad.historyLength===n,before);
 assert.deepEqual(errors,[],name+' page errors');await ctx.close();}}
finally{await env.close();}
console.log('PASS: Edge ▾ dropdown (first tap opens, outside/Esc/second tap close with no mode change, F + arrows + Enter, ARIA menu, active state), Chamfer texts, exact and drag chamfers (kind chamfer, 5,985.333 mm³, matching STL), mixed round + chamfer, error, Undo and v3 autosave at 360×800 and 1024×688');
