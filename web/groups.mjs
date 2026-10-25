// Organisational metadata only: never reorders or combines geometry.
export function validateGroups(p){
 const gs=p.groups;if(gs===undefined){if(p.objects.some(o=>o.groupId!==undefined))throw Error('Invalid object groups.');return;}
 if(!Array.isArray(gs)||gs.length>100)throw Error('Invalid object groups.');
 const map=new Map();for(const g of gs){if(!g||typeof g.id!=='string'||!g.id||g.id.length>100||map.has(g.id)||p.objects.some(o=>o.id===g.id)||typeof g.name!=='string'||!g.name.trim()||g.name.length>80)throw Error('Invalid object groups.');map.set(g.id,g);}
 for(const g of gs){const seen=new Set();let at=g;while(at){if(seen.has(at.id)||seen.size===4)throw Error('Invalid object groups.');seen.add(at.id);if(at.parentId!==undefined&&!map.has(at.parentId))throw Error('Invalid object groups.');at=map.get(at.parentId);}}
 for(const o of p.objects)if(o.groupId!==undefined&&!map.has(o.groupId))throw Error('Invalid object groups.');
}
export function rootGroup(p,id){const map=new Map((p.groups||[]).map(g=>[g.id,g]));let g=map.get(id);while(g?.parentId)g=map.get(g.parentId);return g?.id;}
export function groupMembers(p,id){const ids=new Set([id]);for(let n=0;n<4;n++)for(const g of p.groups||[])if(ids.has(g.parentId))ids.add(g.id);return p.objects.filter(o=>ids.has(o.groupId)).map(o=>o.id);}
export function expandGroups(p,ids){const out=new Set();for(const id of ids){const o=p.objects.find(o=>o.id===id),g=rootGroup(p,o?.groupId);for(const member of g?groupMembers(p,g):o?[id]:[])out.add(member);}return [...out];}
// makeGroup/ungroup live in groups-ui.mjs (groupEdits), loaded on demand with the group buttons (main.js size guard).
export function pruneGroups(p){if(!p.groups)return;const used=new Set(p.objects.map(o=>o.groupId));for(let n=0;n<4;n++)for(const g of p.groups)if(used.has(g.id))used.add(g.parentId);p.groups=p.groups.filter(g=>used.has(g.id));if(!p.groups.length)delete p.groups;}
// F3/F4 integration point: callback returns each member's new placement/object.
// Call inside one change()/record transaction; member geometry remains untouched.
export function applyGroupPlacement(p,ids,change){const set=new Set(expandGroups(p,ids));p.objects=p.objects.map(o=>set.has(o.id)?change(structuredClone(o)):o);}
export function translateMembers(p,bases,delta){const map=new Map(bases.map(o=>[o.id,o]));p.objects=p.objects.map(o=>{if(!map.has(o.id))return o;const b=map.get(o.id);o={...o,position:b.position.map((v,i)=>v+delta[i])};if(b.placement)o.placement=b.placement.map((v,i)=>v+delta[i]);return o;});}
export function selectionBounds(parts,ids){const set=new Set(ids),bs=parts.filter(p=>set.has(p.id)).map(p=>p.bounds).filter(Boolean);return bs.length?{min:[0,1,2].map(i=>Math.min(...bs.map(b=>b.min[i]))),max:[0,1,2].map(i=>Math.max(...bs.map(b=>b.max[i])))}:null;}
export function copySelection(p,ids){const set=new Set(ids),objects=structuredClone(p.objects.filter(o=>set.has(o.id))),used=new Set(objects.map(o=>o.groupId));for(let n=0;n<4;n++)for(const g of p.groups||[])if(used.has(g.id))used.add(g.parentId);return {objects,groups:structuredClone((p.groups||[]).filter(g=>used.has(g.id)))};}
export function pasteSelection(p,clip,uid){if(p.objects.length+clip.objects.length>100)throw Error('Maximum 100 objects.');const c=structuredClone(clip),map=new Map([...c.objects,...c.groups].map(o=>[o.id,uid()]));for(const g of c.groups){g.id=map.get(g.id);if(g.parentId)g.parentId=map.get(g.parentId);}for(const o of c.objects){o.id=map.get(o.id);if(o.groupId)o.groupId=map.get(o.groupId);if(o.excludedCutouts)o.excludedCutouts=o.excludedCutouts.map(id=>map.get(id)||id);}const next={...p,objects:[...p.objects,...c.objects],groups:[...(p.groups||[]),...c.groups]};validateGroups(next);p.objects=next.objects;if(next.groups.length)p.groups=next.groups;return c.objects.map(o=>o.id);}
