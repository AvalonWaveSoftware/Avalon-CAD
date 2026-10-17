// ADR-0001 F6 (lazy chunk, loaded on the first tap of Edge ▾ while Round mode is active): the 2-item edge-tool
// chooser (Round / Chamfer) and the Chamfer texts of the Round-mode bar, drag readout and exact-value sheet. The
// chooser is a popover under the Edge ▾ button with 44 px items; it is styled inline so style.css and index.html stay
// byte-identical (DOM/static gate) and it looks the same on every platform. UI-safe (no engine imports).
import {fmtLen,unitLabel} from './units.mjs';
export const CHAMFER={hint:'Edge taps: 1 edge · 2 face perimeter · 3 all edges · drag to chamfer',set:'Distance',live:d=>`Chamfer ${fmtLen(d,2)} ${unitLabel()}`,applied:'Chamfer applied.',
 title:'Chamfer selected edges',intro:n=>`${n} selected edge(s). Drag up/down in Round mode for live adjustment, or enter an exact distance.`,label:()=>'Chamfer distance · '+unitLabel(),
 apply:'Apply chamfer',remove:'Remove selected chamfers',invalid:'Enter a non-negative distance.'};
const ITEMS=[['round','Round'],['chamfer','Chamfer']];
let menu=null;
export const isOpen=()=>!!menu;
export function closeChooser(){if(!menu)return;menu.remove();menu=null;removeEventListener('pointerdown',outside,true);removeEventListener('keydown',key,true);}
let anchor=null;
// A tap on Edge ▾ itself is left to its click handler, which toggles the chooser.
function outside(e){if(menu?.contains(e.target)||anchor?.contains(e.target))return;closeChooser();}
function key(e){if(e.key==='Escape'){e.stopPropagation();e.preventDefault();closeChooser();anchor?.focus();}}
// chooser(button, current, pick): opens the popover (a second tap on the button closes it); pick(kind) runs on a choice.
export function chooser(button,current,pick){
 if(menu){closeChooser();return;}
 anchor=button;const r=button.getBoundingClientRect(),w=Math.max(r.width,120),left=Math.min(Math.max(8,r.left+r.width/2-w/2),innerWidth-w-8);
 menu=document.createElement('div');menu.id='edgeToolMenu';menu.setAttribute('role','menu');
 menu.style.cssText=`position:fixed;z-index:9;top:${Math.round(r.bottom+4)}px;left:${Math.round(left)}px;width:${Math.round(w)}px;display:flex;flex-direction:column;gap:4px;padding:4px;background:var(--panel);border:1px solid #3b5661;border-radius:12px;box-shadow:0 10px 40px #0008`;
 for(const [kind,label] of ITEMS){const b=document.createElement('button');b.textContent=label;b.dataset.edgeTool=kind;b.setAttribute('role','menuitemradio');b.setAttribute('aria-checked',String(kind===current));
  b.style.cssText='min-height:44px;font-size:12px;border:0;border-radius:8px;padding:6px 12px;text-align:left;background:'+(kind===current?'#2a4b45;color:var(--cyan)':'#1b2c36');
  b.onclick=e=>{e.stopPropagation();closeChooser();pick(kind);};menu.append(b);}
 document.body.append(menu);addEventListener('pointerdown',outside,true);addEventListener('keydown',key,true);menu.querySelector('[aria-checked=true]')?.focus({preventScroll:true});}
