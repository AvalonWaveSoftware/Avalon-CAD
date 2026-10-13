import * as T from 'three';
import {DEFAULT_LAYER,layerOf} from './layers.mjs';
import {uid} from './templates.mjs';

// Project format v1 (AvalonCad 2.4.0) → v2. v2 never contains Subtract results
// (joined objects with params.operation==='subtract'); each one is split into
// top-level solids plus top-level Subtract cutouts that reproduce the same geometry
// through per-solid excludedCutouts. Pure JSON work; no geometry is evaluated.
export const PROJECT_VERSION=2;
const LIMIT=100;
const euler=r=>new T.Euler(...r.map(T.MathUtils.degToRad),'ZYX');
const unscaled=o=>!o.scale||o.scale.every(v=>Math.abs(v-1)<=1e-8);
const styled=o=>!!(o.fillets?.length||o.resolution||!unscaled(o));
const isSubtract=o=>o?.type==='joined'&&o.params?.operation==='subtract';
// A nested group can be flattened when its rendering is exactly union(solids) − union(cuts).
const flattenable=o=>o.type==='joined'&&o.params?.operation!=='add'&&!o.params?.fillOverlaps&&!styled(o);

// Same world transform as Ungroup (main.mjs separateObject).
function toWorld(child,parent){
 const v=new T.Vector3(...child.position).applyEuler(euler(parent.rotation)).add(new T.Vector3(...parent.position));
 const q=new T.Quaternion().setFromEuler(euler(parent.rotation)).multiply(new T.Quaternion().setFromEuler(euler(child.rotation))),e=new T.Euler().setFromQuaternion(q,'ZYX');
 return {...structuredClone(child),position:v.toArray(),rotation:[e.x,e.y,e.z].map(T.MathUtils.radToDeg)};
}
function clean(piece,layerId,enabled){delete piece.sourceMode;delete piece.positionReference;delete piece.placement;piece.layerId=layerId;piece.enabled=enabled;return piece;}

// Returns {solids:[{piece,cuts:Set(newCutIds)}],cuts:[piece]} or a string reason for the fallback.
function flatten(o){
 if(styled(o))return 'it has roundovers, a face resolution or a stretch';
 if(o.params.fillOverlaps)return 'it fills overlaps';
 if(o.mode==='cut')return 'the result itself is a cutout';
 const solids=[],cuts=[];let reason=null;
 function walk(node,frame,applying){
  const here=[...applying];
  for(const c of node.params.children)if(c.mode==='cut'){if(c.type==='joined'){reason='it contains a joined cutout';return;}const piece=toWorld(c,frame);piece.id=uid();piece.mode='cut';cuts.push(piece);here.push(piece.id);}
  for(const c of node.params.children)if(c.mode!=='cut'){const world=toWorld(c,frame);
   if(flattenable(c)&&unscaled(c))walk(c,world,here);
   else{world.id=uid();world.mode='solid';solids.push({piece:world,cuts:new Set(here)});}
   if(reason)return;}
 }
 walk(o,o,[]);
 return reason||{solids,cuts};
}

function migrateList(objects,warn){
 let list=structuredClone(objects);
 for(let index=0;index<list.length;index++){
  const o=list[index];
  if(o.type==='prefab'&&Array.isArray(o.params?.children))o.params.children=migrateList(o.params.children,warn);
  if(!isSubtract(o))continue;
  const split=flatten(o),name=o.name||'Subtract result';
  if(typeof split==='string'){warn(`“${name}” was kept as a combined object because ${split}.`);continue;}
  const layerId=layerOf(o),enabled=o.enabled!==false,newCutIds=split.cuts.map(c=>c.id);
  const solids=split.solids.map(({piece,cuts},i)=>{clean(piece,layerId,enabled);piece.name=String(piece.name||`${name} · part ${i+1}`).slice(0,60);
   // Cutouts that cut this piece are exactly its ancestors' cut children; every other new cutout is excluded.
   // Existing layer cutouts keep the same effect they had on the old result.
   piece.excludedCutouts=[...new Set([...(o.excludedCutouts||[]),...newCutIds.filter(id=>!cuts.has(id))])];if(!piece.excludedCutouts.length)delete piece.excludedCutouts;return piece;});
  const cuts=split.cuts.map(piece=>{clean(piece,layerId,enabled);piece.name=String(piece.name||`${name} · cutout`).slice(0,60);delete piece.excludedCutouts;return piece;});
  const next=[...list.slice(0,index),...solids,...cuts,...list.slice(index+1)];
  // The extracted cutouts must not start cutting unrelated solids on this layer.
  for(const other of next)if(!solids.includes(other)&&!cuts.includes(other)&&other.mode!=='cut'&&layerOf(other)===layerId&&newCutIds.length)other.excludedCutouts=[...new Set([...(other.excludedCutouts||[]),...newCutIds])];
  const ids=new Set(next.map(x=>x.id));for(const x of next)if(x.excludedCutouts){x.excludedCutouts=x.excludedCutouts.filter(id=>ids.has(id));if(!x.excludedCutouts.length)delete x.excludedCutouts;}
  if(next.length>LIMIT||next.some(x=>(x.excludedCutouts?.length||0)>LIMIT)){warn(`“${name}” was kept as a combined object because splitting it would exceed the ${LIMIT}-object or ${LIMIT}-cutout limit.`);continue;}
  list=next;index+=solids.length+cuts.length-1;
 }
 // Prune exclusions that name ids no longer at this level.
 const ids=new Set(list.map(x=>x.id));for(const x of list)if(x.excludedCutouts){x.excludedCutouts=x.excludedCutouts.filter(id=>ids.has(id));if(!x.excludedCutouts.length)delete x.excludedCutouts;}
 for(const x of list)if(x.type==='joined'&&!isSubtract(x)&&containsSubtract(x))warn(`“${x.name||'Merged solid'}” keeps an older Subtract result inside a Merge.`);
 return list;
}
function containsSubtract(o){return (o.params?.children||[]).some(c=>isSubtract(c)||c.type==='joined'&&containsSubtract(c));}

// migrateProject(raw, warnings?) → a v2 project (deep copy) for v1 input; anything else passes through unchanged.
export function migrateProject(p,warnings=[]){
 if(!p||p.format!=='tristancad'||p.version!==1||!Array.isArray(p.objects))return p;
 const out=structuredClone(p),seen=new Set(),warn=m=>{if(!seen.has(m)){seen.add(m);warnings.push(m);console.warn(m);}};
 for(const o of out.objects)o.layerId??=DEFAULT_LAYER;
 out.objects=migrateList(out.objects,warn);out.version=PROJECT_VERSION;
 return out;
}
// Prefab records keep avaloncad-prefab version 1; only their embedded content is migrated.
export function migratePrefabRecord(record,warnings=[]){
 if(record?.format!=='avaloncad-prefab'||record.object?.type!=='prefab'||!Array.isArray(record.object.params?.children))return record;
 const copy=structuredClone(record),seen=new Set();copy.object.params.children=migrateList(copy.object.params.children,m=>{if(!seen.has(m)){seen.add(m);warnings.push(m);}});return copy;
}
