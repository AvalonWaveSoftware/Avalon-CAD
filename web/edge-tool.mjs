// ADR-0001 F6 (lazy chunk, loaded on the first tap of Edge ▾ or the F key): the Edge ▾ dropdown and the Chamfer texts
// of the edge-mode bar, drag readout and exact-value sheet. Master Chief's ruling (2026-10-17 18:35 CT): the first tap
// on Edge ▾ opens a dropdown with two buttons, Round and Chamfer (44 px targets); picking one closes it and starts that
// tool; an outside tap or Esc closes it with no mode change; F opens it, arrow keys move, Enter picks. ARIA menu
// pattern: the button has aria-haspopup="menu", aria-expanded and aria-controls; the menu has role="menu" with
// role="menuitem" buttons and roving focus. Styled inline so style.css and index.html stay byte-identical (DOM/static
// gate) and it looks the same on every platform. UI-safe (no engine imports).
// F1c merge: the unit helpers are handed in by touch-tools (useUnits) instead of imported here. main.js also uses
// units.mjs, so a shared import makes esbuild split it into a chunk that main.js imports statically (startup-split,
// apk-package). Same texts, same units.
let U=null;export function useUnits(units){U=units;}
export const CHAMFER={hint:'Edge taps: 1 edge · 2 face perimeter · 3 all edges · drag to chamfer',set:'Distance',live:d=>`Chamfer ${U.fmtLen(d,2)} ${U.unitLabel()}`,applied:'Chamfer applied.',
 title:'Chamfer selected edges',intro:n=>`${n} selected edge(s). Drag up/down in Edge mode for live adjustment, or enter an exact distance.`,label:()=>'Chamfer distance · '+U.unitLabel(),
 apply:'Apply chamfer',remove:'Remove selected chamfers',invalid:'Enter a non-negative distance.'};
const ITEMS=[['round','Round'],['chamfer','Chamfer']];
let menu=null,anchor=null;
export const isOpen=()=>!!menu;
// close(): removes the dropdown; focusAnchor returns keyboard focus to Edge ▾ (Esc, keyboard pick).
export function closeChooser(focusAnchor=false){if(!menu)return;menu.remove();menu=null;anchor?.setAttribute('aria-expanded','false');removeEventListener('pointerdown',outside,true);removeEventListener('keydown',key,true);if(focusAnchor)anchor?.focus({preventScroll:true});}
// A tap on Edge ▾ itself is left to its click handler, which toggles the dropdown.
function outside(e){if(menu?.contains(e.target)||anchor?.contains(e.target))return;closeChooser();}
function items(){return [...menu.querySelectorAll('[role=menuitem]')];}
// Keys are compared in lower case (key names are not UI text for the strings gate).
function key(e){const list=items(),i=list.indexOf(document.activeElement),k=(e.key||'').toLowerCase();let next=null;
 if(k==='escape'||k==='tab'){if(k==='escape'){e.preventDefault();e.stopPropagation();}closeChooser(k==='escape');return;}
 if(k==='arrowdown')next=list[(i+1)%list.length];else if(k==='arrowup')next=list[(i-1+list.length)%list.length];else if(k==='home')next=list[0];else if(k==='end')next=list.at(-1);
 else if((k==='enter'||k===' ')&&i>=0){e.preventDefault();e.stopPropagation();list[i].click();return;}
 else{if(k.length===1)e.stopPropagation();return;}// letters (F, A, V…) do nothing while the dropdown is open
 e.preventDefault();e.stopPropagation();next.focus({preventScroll:true});}
// chooser(button, active, pick): opens the dropdown (a second tap on Edge ▾ closes it). active is the running tool
// ('round'|'chamfer') or null when edge mode is off; it is shown in the active colours and gets the focus.
// pick(kind) runs after the dropdown has closed.
export function chooser(button,active,pick){
 if(menu){closeChooser();return;}
 anchor=button;const r=button.getBoundingClientRect(),w=Math.max(r.width,120),left=Math.min(Math.max(8,r.left+r.width/2-w/2),innerWidth-w-8);
 menu=document.createElement('div');menu.id='edgeToolMenu';menu.setAttribute('role','menu');
 menu.style.cssText=`position:fixed;z-index:9;top:${Math.round(r.bottom+4)}px;left:${Math.round(left)}px;width:${Math.round(w)}px;display:flex;flex-direction:column;gap:4px;padding:4px;background:var(--panel);border:1px solid #3b5661;border-radius:12px;box-shadow:0 10px 40px #0008`;
 for(const [kind,label] of ITEMS){const b=document.createElement('button');b.textContent=label;b.dataset.edgeTool=kind;b.setAttribute('role','menuitem');b.tabIndex=-1;
  b.style.cssText='min-height:44px;font-size:12px;border:0;border-radius:8px;padding:6px 12px;text-align:left;background:'+(kind===active?'#2a4b45;color:var(--cyan)':'#1b2c36');
  b.onclick=e=>{e.stopPropagation();const kb=e.detail===0;closeChooser(kb);pick(kind);};menu.append(b);}
 button.setAttribute('aria-controls','edgeToolMenu');button.setAttribute('aria-expanded','true');
 document.body.append(menu);addEventListener('pointerdown',outside,true);addEventListener('keydown',key,true);
 (menu.querySelector(`[data-edge-tool=${active||'round'}]`)||items()[0]).focus({preventScroll:true});}
