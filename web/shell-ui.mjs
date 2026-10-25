// ADR-0001 F8: the Hollow section of the edit sheet (lazy chunk). main.mjs passes its length fields (lens: unit-aware
// field/read) and the shell-rules functions it already bundles (main.js loads them through kernel-ui.mjs; importing
// them here would split them into a shared startup chunk), so this chunk imports nothing. No new CSS (existing classes).
// Thickness and open faces kept while the sheet is closed for face picking (same object only).
let pending=null;
export function mountHollow(box,o,lens,pick,{SHELL_DEFAULT,hollowRefusal,shellDefault}){
 // ADR-0003 (a): main passes the per-shape default; a shape with no possible wall gets the wall message, Hollow disabled.
 const why=hollowRefusal(o,o.shell?.thickness??SHELL_DEFAULT)||(!o.shell&&shellDefault(o)===null?'Wall thickness must be at least 0.4 mm and less than half the smallest dimension.':null);
 if(why&&(why.startsWith('Hollow is not offered')||!o.shell&&why.startsWith('Wall thickness must'))){box.innerHTML=`<div class="sectionlabel">Hollow</div><p class="inlinehelp">${why}</p>`;return null;}
 const st=pending?.id===o.id?pending:{on:!!o.shell,thickness:o.shell?.thickness??SHELL_DEFAULT,open:o.shell?.open||[]};pending=null;let open=[...st.open];
 box.innerHTML=`<div class="sectionlabel">Hollow</div><label class="toggle"><input type="checkbox" id="hollowOn"${st.on?' checked':''}>Hollow this shape</label><div class="row">${lens.field('hollowT','Wall thickness',st.thickness)}</div><button id="hollowPick" class="full">Open faces: pick</button>`;
 const $=id=>box.querySelector('#'+id),paint=()=>{const on=$('hollowOn').checked;$('hollowT').disabled=$('hollowPick').disabled=!on;const text=!on?'':open.length?`${open.length} open face${open.length===1?'':'s'}`:'Closed hollow · no open faces';let help=$('hollowHelp');
  // p#hollowHelp exists only while it has text (Architect ruling 2026-10-25 11:03 CT: no empty element in the sheet).
  if(!text)help?.remove();else{if(!help){help=document.createElement('p');help.className='inlinehelp';help.id='hollowHelp';$('hollowPick').after(help);}help.textContent=text;}};
 $('hollowOn').onchange=paint;paint();
 $('hollowPick').onclick=()=>{pending={id:o.id,on:true,thickness:lens.read('hollowT'),open};pick(o.id,open,faces=>{if(pending)pending.open=faces;});};
 return {read(draft){if(!$('hollowOn')?.checked){delete draft.shell;return false;}const before=draft.shell;draft.shell={thickness:lens.read('hollowT'),...(open.length?{open:[...open]}:{})};return JSON.stringify(before)!==JSON.stringify(draft.shell);},
  clearOpen(draft){if(!draft.shell?.open)return false;delete draft.shell.open;open=[];return true;}};
}
