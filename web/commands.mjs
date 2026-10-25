// Command registry (ADR-0001 §2.3, W0). One entry per app command: {id, label, shortcut, tooltip, run, enabled}. The
// labels are today's UI text. tooltip (F1b, read by tooltips.mjs) is the label unless the entry names the accessible
// name the control already carries in index.html (no new text).
// shortcut (F1a): the key combos that run the command, or null. Only commands that work today have one (round-2
// ruling 2: the table grows with the features); later workstreams add their rows (R Rotate: F3, here; I Mirror, T Measure,
// Cmd/Ctrl+C/V, Cmd/Ctrl+G, Shift+G). Combo syntax: [Mod+][Shift+]Key, where Mod is Cmd or Ctrl on every platform
// (no platform-specific default) and Key is an upper-case letter, a digit, a symbol or a KeyboardEvent.key name.
// UI-safe (no engine imports).
const DEFS=[
 ['measure','Measure',null,['T']],
 ['new','New project',null,['Mod+N']],['open','Open project / prefab / STL…',null,['Mod+O']],['save','Save project on this computer',null,['Mod+S']],
 ['backup','Export editable project…',null,['Mod+Shift+S']],['export','Export',null,['Mod+E']],['export3mf','Export 3MF…'],
 ['undo','Undo',null,['Mod+Z']],['redo','Redo',null,['Mod+Shift+Z','Mod+Y']],['add','Add',null,['A','Mod+Shift+A']],['edit','Edit'],
 ['clear','Clear','Deselect everything',['Shift+Delete','Shift+Backspace']],['fit','Fit model',null,['0','Home','Mod+0']],['wire','Wireframe',null,['W']],['help','Help',null,['?']],
 ...[['3d','3D'],['top','TOP'],['front','FRONT'],['right','RIGHT']].map(([v,l])=>[`view:${v}`,l]),
 ...[['Select','V'],['Move','M'],['Rotate','R'],['Stretch','S'],['Round','F']].map(([l,k])=>[`mode:${l.toLowerCase()}`,l,null,[k]]),
 ['group','Group selected',null,['Mod+G']],['ungroup','Ungroup',null,['Mod+Shift+G']],
 ['delete','Delete',null,['Delete','Backspace']],['duplicate','Duplicate',null,['Mod+D']],['escape','Close panel',null,['Escape']]];
export const COMMAND_IDS=DEFS.map(d=>d[0]);
// The Electron menu accelerators (desktop/main.cjs), as registry combos. The native menu runs these itself, so the
// in-page dispatcher leaves them alone on desktop (no double run). tests/shortcuts.mjs checks main.cjs against this.
export const ELECTRON_MENU=mac=>({new:'Mod+N',open:'Mod+O',save:'Mod+S',backup:'Mod+Shift+S',export:'Mod+E',undo:'Mod+Z',redo:mac?'Mod+Shift+Z':'Mod+Y',add:'Mod+Shift+A',fit:'Mod+0'});
// createCommands(handlers): handlers maps an id to {run, enabled?}; ids without a handler are listed but never run.
export function createCommands(handlers={}){
 const list=DEFS.map(([id,label,tooltip,shortcut=null])=>{const h=handlers[id]||{};return Object.freeze({id,label,shortcut,tooltip:tooltip||label,run:h.run||(()=>false),enabled:h.enabled||(()=>!!h.run)});});
 const byId=new Map(list.map(c=>[c.id,c])),byKey=new Map(list.flatMap(c=>(c.shortcut||[]).map(k=>[k,c.id])));
 return {list,get:id=>byId.get(id),byKey:k=>byKey.get(k),run(id,...a){const c=byId.get(id);return c&&c.enabled()?c.run(...a):false;}};}
// combo(KeyboardEvent) → the registry combo, or null. Letters use the layout's letter, or the physical key when the
// layout's character is not a Latin letter (Cyrillic, Greek…). Shift counts for letters and named keys only, so "?"
// (Shift+/ on US keyboards) is "?". Alt/AltGr combos and IME composition are never shortcuts.
export function combo(e){let k=e.key;if(!k||k==='Unidentified'||k==='Dead'||e.isComposing||e.altKey||/^(Shift|Control|Meta|Alt|AltGraph|CapsLock|OS)$/.test(k))return null;
 const code=/^Key([A-Z])$|^Digit(\d)$/.exec(e.code||'');if(k.length===1&&!/[ -~]/.test(k)&&code)k=code[1]||code[2];
 const letter=/^[a-z]$/i.test(k),named=k.length>1;if(letter)k=k.toUpperCase();
 return (e.ctrlKey||e.metaKey?'Mod+':'')+(e.shiftKey&&(letter||named)?'Shift+':'')+k;}
// installShortcuts: one keydown dispatcher for web, Electron and Android hardware keyboards (ADR-0001 F1a).
// allow(id, combo) is the app's gate (typing in a field, an open sheet, a drag); skip is the set of combos a native
// menu already runs. Returns the listener so tests can detach it.
export function installShortcuts(commands,{target=document,allow=()=>true,skip=new Set()}={}){
 const onKey=e=>{if(e.defaultPrevented||e.repeat)return;const k=combo(e),id=k&&commands.byKey(k);if(!id||skip.has(k)||!allow(id,k))return;
  if(commands.get(id).enabled()){e.preventDefault();commands.run(id);}};
 target.addEventListener('keydown',onKey);return onKey;}
