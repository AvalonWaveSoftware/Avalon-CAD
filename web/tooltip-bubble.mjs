// ADR-0001 F1b: the long-press tooltip bubble (lazy chunk, loaded on the first long-press). One bubble at a time, placed
// above the button (below it when there is no room), kept inside the window, removed after `ms`. It never takes
// pointer events, so it cannot block the next tap. Colours are the #toast colours from style.css (style.css is frozen).
let el=null,timer=null;
export function showBubble(button,text,ms){
 hideBubble();const r=button.getBoundingClientRect();
 el=document.createElement('div');el.id='tipBubble';el.setAttribute('role','tooltip');el.textContent=text;
 el.style.cssText='position:fixed;z-index:31;left:0;top:0;max-width:calc(100vw - 16px);padding:7px 11px;background:#2d454e;color:#eaf2f5;border:1px solid #4f727b;border-radius:10px;font-size:12px;line-height:1.4;box-shadow:0 6px 24px #0008;pointer-events:none;white-space:normal;text-align:center';
 document.body.appendChild(el);const w=el.offsetWidth,h=el.offsetHeight,gap=8,vw=innerWidth,vh=innerHeight;
 let top=r.top-h-gap;if(top<4)top=Math.min(r.bottom+gap,vh-h-4);
 const left=Math.max(8,Math.min(vw-w-8,r.left+r.width/2-w/2));
 el.style.left=Math.round(left)+'px';el.style.top=Math.round(top)+'px';
 timer=setTimeout(hideBubble,ms);return el;}
export function hideBubble(){clearTimeout(timer);timer=null;el?.remove();el=null;}
