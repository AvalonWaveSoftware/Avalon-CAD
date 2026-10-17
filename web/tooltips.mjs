// ADR-0001 F1b: tooltips. Every button gets a non-empty title and aria-label at startup and whenever the app adds or
// relabels one (sheets, panels, action bars), with no index.html edit per button. A button that runs a registry command
// (commands.mjs) gets its visible label plus the command's shortcut, "Move (M)" (Architect UI round 1, ruling 1, and
// the follow-up ruling: the rendered label minus a trailing ▾, so a button relabelled Edge plus a dropdown arrow reads Edge (F)).
// An icon-only button (no letter or digit in its text) uses the registry label; data-tip-label overrides per button. Any other button keeps, in order: a title the markup already has, an
// aria-label the markup or app already set, then its own visible text. So every tooltip is text the app already shows.
// On touch screens a LONG_PRESS_MS long-press on a header, toolbar, mode-bar, selection-bar or dock button (ruling 2)
// shows the same text as a bubble for BUBBLE_MS and does not fire the button; the bubble is the lazy tooltip-bubble
// chunk. UI-safe.
import {LONG_PRESS_MS} from './objects-panel.mjs';
export const BUBBLE_MS=1500;
const AREAS=':is(header,.toolbar,#touchModes,.selection,.dock)';
// Fixed controls → registry ids (the mapping the Electron action() bridge uses); undo, redo, wire and fit share their id.
const IDS={helpBtn:'help',addBtn:'add',editBtn:'edit',exportBtn:'export',deselectBtn:'clear',closeSheet:'escape',duplicateObject:'duplicate'};
export const commandId=({id,dataset:d={}})=>IDS[id]||(/^(undo|redo|wire|fit)$/.test(id)?id:d.mode?`mode:${d.mode}`:d.view?`view:${d.view==='iso'?'3d':d.view}`:null);
// keyText('Mod+Shift+Z') → 'Cmd/Ctrl+Shift+Z', the approved help-table spelling (same on every platform); Escape → Esc.
export const keyText=k=>k.replace(/^Mod\+/,'Cmd/Ctrl+').replace(/^Escape$/,'Esc');
// tooltipText(cmd, label) → "label (first shortcut)", or the plain label when the command has no shortcut.
export const tooltipText=(cmd,label=cmd.tooltip)=>cmd.shortcut?.length?`${label} (${keyText(cmd.shortcut[0])})`:label;
// Reserved W0 slots (class pending, aria-hidden) stay untouched until their feature unhides them.
const inert=el=>!!el.closest('.pending,[aria-hidden="true"]');
const textOf=el=>{const t=[],walk=n=>{for(const c of n.childNodes)c.nodeType===3?t.push(c.nodeValue):c.nodeType===1&&walk(c);};walk(el);return t.join(' ').replace(/\s+/g,' ').trim();};
// visibleLabel(el) → the label the button shows: its text pieces that hold a letter or digit (so icon glyphs such as
// ＋ or ↶ drop out), without a trailing ▾; '' for an icon-only button.
export const visibleLabel=el=>{const t=[],walk=n=>{for(const c of n.childNodes)c.nodeType===3?t.push(c.nodeValue):c.nodeType===1&&walk(c);};walk(el);
 return t.filter(x=>/[\p{L}\p{N}]/u.test(x)).join(' ').replace(/\s+/g,' ').replace(/\s*▾$/,'').trim();};
export function installTooltips({commands,root=document}={}){
 // What this module last wrote, per button and attribute; any other value came from the markup or the app.
 // A registry command owns both attributes; on other buttons the values set by the markup or the app win.
 const ours=new WeakMap(),cmdOf=el=>commands?.get(commandId(el)),authored=(el,a)=>!cmdOf(el)&&el.hasAttribute(a)&&el.getAttribute(a)!==ours.get(el)?.[a];
 const tipFor=el=>{const cmd=cmdOf(el);return cmd?tooltipText(cmd,el.dataset.tipLabel||visibleLabel(el)||cmd.tooltip):authored(el,'title')?el.getAttribute('title'):authored(el,'aria-label')?el.getAttribute('aria-label'):textOf(el);};
 const label=el=>{if(inert(el))return;const tip=tipFor(el);if(!tip)return;
  const mine=ours.get(el)||{};for(const a of ['title','aria-label'])if(!authored(el,a)){if(el.getAttribute(a)!==tip)el.setAttribute(a,tip);mine[a]=tip;}ours.set(el,mine);};
 const apply=(node=root)=>{if(node.matches?.('button'))label(node);node.querySelectorAll?.('button').forEach(label);};
 apply();
 const observer=new MutationObserver(list=>{for(const m of list){m.addedNodes.forEach(apply);const b=(m.target.nodeType===1?m.target:m.target.parentElement)?.closest('button');if(b)label(b);}});
 observer.observe(root.body||root,{childList:true,subtree:true,characterData:true});
 // Long-press bubble, touch and pen only (a mouse gets the native title on hover).
 let press=null,fired=null,bubble=null;
 const cancel=()=>{clearTimeout(press?.timer);press=null;},on=(type,fn)=>root.addEventListener(type,fn,true);
 on('pointerdown',e=>{cancel();fired=null;const b=e.target.closest?.('button');if(!/touch|pen/.test(e.pointerType)||!b||inert(b)||!b.closest(AREAS))return;
  press={b,x:e.clientX,y:e.clientY,timer:setTimeout(()=>{press=null;fired=b;const tip=tipFor(b);if(tip)(bubble||=import('./tooltip-bubble.mjs')).then(m=>m.showBubble(b,tip,BUBBLE_MS),()=>bubble=null);},LONG_PRESS_MS)};});
 on('pointermove',e=>{if(press&&Math.hypot(e.clientX-press.x,e.clientY-press.y)>=9)cancel();});
 on('pointercancel',cancel);
 // The release after a long-press must not fire the button. Some WebViews send no click after a long touch, so the
 // guard also ends on the next pointerdown or 800 ms after the release.
 on('pointerup',()=>{cancel();const f=fired;if(f)setTimeout(()=>{if(fired===f)fired=null;},800);});
 on('click',e=>{if(fired?.contains(e.target)){e.preventDefault();e.stopImmediatePropagation();fired=null;}});
 on('contextmenu',e=>{const b=e.target.closest?.('button');if(b&&(press?.b===b||fired===b))e.preventDefault();});
 return {apply,tipFor};}
