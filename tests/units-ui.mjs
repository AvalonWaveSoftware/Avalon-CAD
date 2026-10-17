// ADR-0001 F1c, Architect UI round 1 rulings 11-15: the mm-or-in switch in the Edit sheet's Dimensions header and every
// inch label site, in the real app (phone 412x915 touch and desktop 1440x900). Storage stays mm: the project, the .tcad
// backup and the STL are byte-identical whichever unit is shown, an unedited Apply in inches changes nothing, and
// 2 in typed into a field stores exactly 50.8 mm. mm is the default on every platform and shows today's text.
import assert from 'node:assert/strict';
const H=await import('../tools/readme-shots/harness.mjs');const env=await H.start();const out=[];
const text=(page,sel)=>page.evaluate(s=>document.querySelector(s)?.textContent??null,sel);
const value=(page,id)=>page.evaluate(i=>document.getElementById(i).value,id);
const ready=page=>page.waitForFunction(()=>/^(Ready · |[\d,]+ preview triangles)/.test(document.querySelector('#busy').textContent),null,{timeout:60000});
// The status line reads "Ready · millimeters" (or inches) when the scene is empty; with a model it counts triangles.
const readyText=async page=>{await page.evaluate(()=>window.__cad.change(p=>{p.objects=[];}));await page.waitForFunction(()=>/^Ready · /.test(document.querySelector('#busy').textContent),null,{timeout:60000});return text(page,'#busy');};
const sheet=async(page,open)=>{await open();await page.waitForFunction(()=>!document.querySelector('#sheet').hidden);};
const close=async page=>{if(await page.evaluate(()=>!document.querySelector('#sheet').hidden)){await page.click('#closeSheet');await page.waitForFunction(()=>document.querySelector('#sheet').hidden);}};
const bytes=async(page,run)=>{await page.evaluate(()=>window.savedFile=null);await run();await page.waitForFunction(()=>window.savedFile?.done,null,{timeout:60000});
 return page.evaluate(()=>window.savedFile.chunks.join('|'));};
const backup=page=>bytes(page,()=>page.evaluate(()=>window.__cad.commands.run('backup')));
const stl=page=>bytes(page,async()=>{await sheet(page,()=>page.click('#exportBtn'));await page.click('#downloadSTL');});
const project=page=>page.evaluate(()=>JSON.stringify(window.__cad.project));
const drag=page=>page.evaluate(()=>[...document.querySelector('#dragStep').options].map(o=>[o.value,o.textContent]));
const gridEdge=page=>page.evaluate(()=>{const g=window.__cad.scene.children.find(c=>c.type==='GridHelper');const a=g.geometry.attributes.position.array;let m=0;for(const v of a)m=Math.max(m,Math.abs(v));return [Math.round(m*1000)/1000,a.length/12];});
try{for(const desktop of [false,true]){const page=await H.open(env,{desktop}),name=desktop?'desktop':'phone';
 // Default: mm everywhere, today's text, nothing stored.
 await ready(page);assert.equal(await text(page,'#busy'),'Ready · millimeters');assert.equal(await page.evaluate(()=>window.__cad.units.get()),'mm');assert.equal(await page.evaluate(()=>localStorage.getItem('tristancad.units')),null);
 assert.equal(await text(page,'.axis>span'),'mm');assert.deepEqual(await drag(page),[['0','Free'],['0.1','0.1 mm'],['1','1 mm']]);assert.deepEqual(await gridEdge(page),[110,23]);
 await page.evaluate(()=>window.__cad.load(window.__cad.templates.plate()));await ready(page);await page.waitForTimeout(300);
 assert.equal(await text(page,'#bounds'),'70.0 × 40.0 × 6.0 mm');
 // Reference: an unedited Apply in mm (Apply records the face-resolution setting), then the project, .tcad and STL.
 await sheet(page,()=>page.click('#editBtn'));await page.click('#applyObject');await page.waitForFunction(()=>document.querySelector('#sheet').hidden,null,{timeout:30000});await ready(page);
 const p0=await project(page),b0=await backup(page);await close(page);const s0=await stl(page);await close(page);
 // Edit sheet in mm: the header keeps its text and gains the switch, mm pressed; fields show the stored values.
 await sheet(page,()=>page.click('#editBtn'));assert.equal(await text(page,'#dimsTitle'),'Dimensions · millimeters');
 assert.deepEqual(await page.evaluate(()=>[...document.querySelectorAll('#unitSwitch [data-unit]')].map(b=>[b.textContent,b.getAttribute('aria-pressed')])),[['mm','true'],['in','false']]);
 assert.equal(await page.evaluate(()=>document.querySelector('#unitSwitch').getAttribute('aria-label')),'Units');
 assert.equal(await value(page,'p_w'),'70');assert.equal(await text(page,'#posTitle'),'Object center position · millimeters');
 // Switch to inches: the sheet re-shows its lengths, the rest of the app follows.
 await page.click('[data-unit="in"]');assert.equal(await text(page,'#dimsTitle'),'Dimensions · inches');assert.equal(await text(page,'#posTitle'),'Object center position · inches');
 assert.deepEqual(await Promise.all(['p_w','p_d','p_h','p_r'].map(i=>value(page,i))),['2.756','1.575','0.236','0.157']);assert.equal(await page.evaluate(()=>document.getElementById('p_w').step),'0.001');
 assert.equal(await page.evaluate(()=>localStorage.getItem('tristancad.units')),'in');assert.equal(await text(page,'#bounds'),'2.756 × 1.575 × 0.236 in');
 assert.equal(await text(page,'.axis>span'),'in');assert.deepEqual(await drag(page),[['0','Free'],['0.254','0.01 in'],['2.54','0.1 in']]);assert.deepEqual(await gridEdge(page),[114.3,19]);
 assert.equal(await page.evaluate(()=>document.querySelector('#dragStep').selectedIndex),1,'the chosen step keeps its place');
 // Unedited Apply in inches: nothing changes; saves and the STL are byte-identical to the mm ones.
 await page.click('#applyObject');await page.waitForFunction(()=>document.querySelector('#sheet').hidden,null,{timeout:30000});await ready(page);
 assert.equal(await project(page),p0,'unedited Apply in inches keeps every stored value');assert.equal(await backup(page),b0,'.tcad backup byte-identical');await close(page);assert.equal(await stl(page),s0,'STL byte-identical');await close(page);
 assert.ok(!(await page.evaluate(()=>JSON.stringify(window.__cad.project))).includes('tristancad.units'));
 // 2 in typed → exactly 50.8 mm; the other fields keep their stored mm.
 await sheet(page,()=>page.click('#editBtn'));await page.fill('#p_w','2');await page.click('#applyObject');await page.waitForFunction(()=>document.querySelector('#sheet').hidden,null,{timeout:30000});
 assert.deepEqual(await page.evaluate(()=>window.__cad.project.objects[0].params),{w:50.8,d:40,h:6,r:4});
 await page.evaluate(()=>document.getElementById('undo').click());await page.waitForFunction(p=>JSON.stringify(window.__cad.project)===p,p0);await ready(page);
 // Other inch sites: Pull selected face, Round selected edges, Merge, Sketch & extrude, the overall-size hint.
 await page.evaluate(()=>window.__cad.touch.selectFace(window.__cad.project.objects[0].id,0));await page.waitForSelector('#stretchSize');await sheet(page,()=>page.click('#stretchSize'));
 assert.match(await text(page,'label[for="exactSize"]'),/^New [XYZ] dimension · in$/);assert.match(await value(page,'exactSize'),/^\d+\.\d{3}$/);
 await page.click('#applySize');await page.waitForFunction(()=>document.querySelector('#sheet').hidden,null,{timeout:30000});await ready(page);assert.equal(await project(page),p0,'unedited Pull in inches changes nothing');
 await page.evaluate(()=>{const t=window.__cad.touch;t.setMode('round');t.selectEdges(window.__cad.project.objects[0].id,[0]);});await page.waitForSelector('#roundSet',{state:'attached'});await sheet(page,()=>page.click('#roundSet'));
 assert.equal(await text(page,'label[for="exactRadius"]'),'Radius · in');assert.match(await value(page,'exactRadius'),/^\d+\.\d{3}$/);await close(page);
 await page.evaluate(()=>window.__cad.touch.deselect());await sheet(page,()=>page.evaluate(()=>{window.__cad.change(p=>{p.objects[1].mode='solid';});const [a,b]=window.__cad.project.objects;window.__cad.touch.mergeMenu([a.id,b.id]);}));
 assert.equal(await text(page,'label[for="bridgeDiameter"]'),'Connecting bar diameter · in');assert.equal(await value(page,'bridgeDiameter'),'0.197');await close(page);
 await sheet(page,()=>page.click('#addBtn'));await page.click('#sketchBtn');await page.waitForSelector('#sketchSpan');
 assert.deepEqual(await Promise.all(['sketchSpan','sketchHeight','pointX','pointY'].map(i=>page.evaluate(i=>document.querySelector(`label[for="${i}"]`).textContent,i))),['Canvas width · in','Extrusion height · in','Point X · in','Point Y · in']);
 assert.match(await text(page,'#sheetContent .subtle'),/Coordinates snap to 0\.05 in\.$/);assert.equal(await value(page,'sketchSpan'),'4.724');
 await page.fill('#pointX','1');await page.fill('#pointY','0.5');await page.click('#pointAdd');assert.equal(await text(page,'#sketchPoints'),'1: (1.000, 0.500)');await close(page);
 assert.equal(await readyText(page),'Ready · inches');
 // Back to mm: everything is today's text again.
 await page.evaluate(()=>window.__cad.load(window.__cad.templates.plate()));await ready(page);await sheet(page,()=>page.click('#editBtn'));await page.click('[data-unit="mm"]');
 assert.equal(await value(page,'p_w'),'70');assert.equal(await text(page,'#dimsTitle'),'Dimensions · millimeters');await close(page);
 assert.equal(await text(page,'.axis>span'),'mm');assert.equal(await readyText(page),'Ready · millimeters');assert.deepEqual(await drag(page),[['0','Free'],['0.1','0.1 mm'],['1','1 mm']]);assert.deepEqual(await gridEdge(page),[110,23]);
 // The preference survives a reload (inches), and is the same for every platform.
 await page.evaluate(()=>window.__cad.units.set('in'));await page.reload();await page.waitForFunction(()=>window.__cad?.model?.engine?.local===true,{},{timeout:90000});await ready(page);
 assert.equal(await text(page,'.axis>span'),'in');assert.equal(await readyText(page),'Ready · inches');assert.deepEqual(await gridEdge(page),[114.3,19]);
 out.push(`${name}: switch, labels, steps, grid, sheets; .tcad and STL byte-identical across units; 2 in = 50.8 mm`);await page.context().close();}}
finally{await env.close();}
console.log('PASS: units-ui: '+out.join('; '));
