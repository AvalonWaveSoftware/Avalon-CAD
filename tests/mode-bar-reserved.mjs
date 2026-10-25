// ADR-0001 §2.3 + W0 round-2 ruling 1 (option D): the final mode bar (Select · Move · Rotate · Stretch · Edge ▾ · Mirror)
// and the toolbar ruler slot are laid out in W0. Rotate, Mirror and the ruler are present but hidden (visibility:hidden,
// not focusable, no click handler) with their space reserved; Edge ▾ (F6, Master Chief ruling 1; was Round ▾) is the Round button's own box. Each later feature
// (F3 Rotate, F4 Mirror, F1e ruler, F6 Edge ▾) may change only its own box: these boxes are the contract.
import assert from 'node:assert/strict';import * as H from '../tools/readme-shots/harness.mjs';
const EXPECTED={"phone-412x915":{"select":[9,168,62.33,37],"move":[75.33,168,62.33,37],"rotateMode":[141.66,168,62.33,37],"stretch":[207.98,168,62.34,37],"round":[274.33,168,62.33,37],"mirrorMode":[340.66,168,62.33,37],"measureBtn":[284,69,40,50],"wire":[324,69,40,50]},"phone-360x800":{"select":[9,168,53.66,37],"move":[66.66,168,53.67,37],"rotateMode":[124.33,168,53.67,37],"stretch":[182,168,53.66,37],"round":[239.66,168,53.67,37],"mirrorMode":[297.33,168,53.67,37],"measureBtn":[232,69,40,50],"wire":[272,69,40,50]},"desktop-1440x900":{"select":[9,168,233.66,37],"move":[246.66,168,233.67,37],"rotateMode":[484.33,168,233.67,37],"stretch":[722,168,233.66,37],"round":[959.66,168,233.67,37],"mirrorMode":[1197.33,168,233.67,37],"measureBtn":[1312,69,40,50],"wire":[1352,69,40,50]},"desktop-1024x688":{"select":[9,168,164.33,37],"move":[177.33,168,164.33,37],"rotateMode":[345.66,168,164.33,37],"stretch":[513.98,168,164.34,37],"round":[682.33,168,164.33,37],"mirrorMode":[850.66,168,164.33,37],"measureBtn":[896,69,40,50],"wire":[936,69,40,50]}};
const SIZES={'phone-412x915':{viewport:{width:412,height:915},deviceScaleFactor:2,hasTouch:true,isMobile:true},'phone-360x800':{viewport:{width:360,height:800},deviceScaleFactor:2,hasTouch:true,isMobile:true},'desktop-1440x900':{viewport:{width:1440,height:900}},'desktop-1024x688':{viewport:{width:1024,height:688}}};
const env=await H.start();
try{for(const [name,o] of Object.entries(SIZES)){const ctx=await env.browser.newContext(o);const page=await ctx.newPage();await page.goto(env.origin+'/index.html');await page.waitForFunction(()=>window.__cad?.model);
 const got=await page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#touchModes button'),document.querySelector('#measureBtn'),document.querySelector('#wire')].map(b=>{const r=b.getBoundingClientRect();return [b.id||b.dataset.mode,[r.x,r.y,r.width,r.height]];})));
 assert.deepEqual(Object.keys(got),Object.keys(EXPECTED[name]),name+': order Select · Move · Rotate · Stretch · Round · Mirror, then ruler, wireframe');
 for(const [k,box] of Object.entries(EXPECTED[name]))box.forEach((v,i)=>assert.ok(Math.abs(got[k][i]-v)<=0.5,name+' '+k+' box '+got[k]+' vs reserved '+box));
 const w=EXPECTED[name].select[2];if(name.startsWith('phone'))assert.ok(w>=44,name+': mode buttons >= 44 px wide');
 // F6 (Master Chief ruling 1): "Edge ▾" fits inside Round's reserved box at every size, 360 px included: one line (no
 // wrap), no wider than the content box, no overflow, the box itself unchanged (37 px high, asserted above).
 const fit=await page.evaluate(()=>{const b=document.querySelector('[data-mode=round]'),r=document.createRange(),cs=getComputedStyle(b);r.selectNodeContents(b);return {label:b.textContent,text:r.getBoundingClientRect().width,inner:b.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),lines:r.getClientRects().length,textH:r.getBoundingClientRect().height,lineH:parseFloat(cs.lineHeight)||parseFloat(cs.fontSize)*1.4,overflow:b.scrollWidth>b.clientWidth||b.scrollHeight>b.clientHeight,h:b.getBoundingClientRect().height};});
 assert.equal(fit.label,'Edge ▾',name+': Edge ▾ label');assert.ok(fit.lines===1&&fit.textH<=fit.lineH+0.5&&fit.text<=fit.inner&&!fit.overflow&&Math.abs(fit.h-37)<=0.5,name+': Edge ▾ fits its reserved box on one line '+JSON.stringify(fit));
 if(name==='phone-360x800')assert.ok(fit.inner-fit.text>=0,'360 px: Edge ▾ has no wrap and no clipping');
 const st=await page.evaluate(()=>[].map(s=>{const e=document.querySelector(s),c=getComputedStyle(e);return [c.visibility,e.tabIndex,e.getAttribute('aria-hidden'),!!e.dataset.mode,typeof e.onclick==='function'];}));
// F3 (rotate-handles): the live Rotate button (the reserved #rotateMode itself, made live with data-mode rotate) takes the
// same cell, with exactly the reserved box; Mirror (F4) is live too, so no reserved slot is left here.
 for(const s of st)assert.deepEqual(s,['hidden',-1,'true',false,false],name+': reserved button hidden, unfocusable, inert');
 // batch-3.0 on 6ccc903: Mirror (F4) and Rotate (F3) are both live, so no reserved slot is left to tap.
 // F3: Rotate is live in its cell: visible, focusable, one line inside the box at every size (360 px included), and a tap
 // enters Rotate mode.
 const rot=await page.evaluate(()=>{const b=document.querySelector('#rotateMode'),c=getComputedStyle(b),g=document.createRange();g.selectNodeContents(b);return {label:b.textContent,vis:c.visibility,tab:b.tabIndex,aria:b.getAttribute('aria-hidden'),mode:b.dataset.mode,text:g.getBoundingClientRect().width,inner:b.clientWidth-parseFloat(c.paddingLeft)-parseFloat(c.paddingRight),lines:g.getClientRects().length,overflow:b.scrollWidth>b.clientWidth};});
 assert.ok(rot.label==='Rotate'&&rot.vis==='visible'&&rot.tab===0&&rot.aria===null&&rot.mode==='rotate'&&rot.lines===1&&rot.text<=rot.inner&&!rot.overflow,name+': Rotate live and fits its box '+JSON.stringify(rot));
 const q=EXPECTED[name].rotateMode;await page.mouse.click(q[0]+q[2]/2,q[1]+q[3]/2);assert.equal(await page.evaluate(()=>window.__cad.touch.getState().mode),'rotate',name+': Rotate tap');
 await page.evaluate(()=>window.__cad.touch.setMode('select'));
 assert.equal(await page.evaluate(()=>document.querySelector('#exportBtn').textContent),'⇩Export');
 // F6 (Master Chief 18:35 CT): the Edge ▾ dropdown is an overlay: opening it moves no mode-bar box and keeps the label.
 const boxes=()=>page.evaluate(()=>[...document.querySelectorAll('#touchModes button'),document.querySelector('#measureBtn'),document.querySelector('#wire')].map(b=>{const r=b.getBoundingClientRect();return [r.x,r.y,r.width,r.height].join();}));
 const closed=await boxes();await page.locator('[data-mode=round]').click();await page.locator('#edgeToolMenu').waitFor();
 assert.deepEqual(await boxes(),closed,name+': mode-bar boxes unchanged with the dropdown open');assert.equal(await page.evaluate(()=>document.querySelector('[data-mode=round]').textContent),'Edge ▾');
 assert.equal(await page.evaluate(()=>window.__cad.touch.getState().mode),'select',name+': opening the dropdown changes no mode');await page.keyboard.press('Escape');await page.locator('#edgeToolMenu').waitFor({state:'detached'});
 await ctx.close();}}
finally{await env.close();}
console.log('PASS: mode bar reserved layout at 4 sizes: 6 cells, Rotate and Mirror live in their reserved boxes, Edge ▾ fits Round\'s box (one line at 360 px), dropdown open moves no box, dock reads Export');
