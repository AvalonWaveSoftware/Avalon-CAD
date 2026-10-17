// Command registry (ADR-0001 §2.3, W0). One entry per app command: {id, label, shortcut, tooltip, run, enabled}. W0 only
// defines the ids and labels (the labels are today's UI text); shortcut is null everywhere until F1a makes them work
// (Architect ruling 6), and tooltip falls back to the label until F1b. Nothing in the app reads this yet: F1a wires the
// shortcut dispatcher, the Electron action() bridge and the help sheet to it. UI-safe (no engine imports).
const DEFS=[
 ['new','New project'],['open','Open project / prefab / STL…'],['save','Save project on this computer'],['backup','Export editable project…'],['export','Export'],
 ['undo','Undo'],['redo','Redo'],['add','Add'],['edit','Edit'],['clear','Clear'],['fit','Fit model'],['wire','Wireframe'],['help','Help'],
 ...[['3d','3D'],['top','TOP'],['front','FRONT'],['right','RIGHT']].map(([v,l])=>[`view:${v}`,l]),
 ...['Select','Move','Stretch','Round'].map(l=>[`mode:${l.toLowerCase()}`,l])];
export const COMMAND_IDS=DEFS.map(d=>d[0]);
// createCommands(handlers): handlers maps an id to {run, enabled?}; ids without a handler are listed but never run.
export function createCommands(handlers={}){
 const list=DEFS.map(([id,label])=>{const h=handlers[id]||{};return Object.freeze({id,label,shortcut:null,tooltip:label,run:h.run||(()=>false),enabled:h.enabled||(()=>!!h.run)});});
 const byId=new Map(list.map(c=>[c.id,c]));
 return {list,get:id=>byId.get(id),run(id,...a){const c=byId.get(id);return c&&c.enabled()?c.run(...a):false;}};}
