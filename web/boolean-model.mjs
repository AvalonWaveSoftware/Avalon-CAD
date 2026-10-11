import {makeObject,validateProject} from './kernel.mjs';
import {assertSameLayer,booleanProject} from './layers.mjs';
import {prepareSubtractTargets} from './operations.mjs';

// Subtraction removes the first object from every following target on its layer.
export function evaluateBoolean(K,objects,operation,tolerance=.03,cutouts=[],fillOverlaps=false){
 if(!['add','subtract'].includes(operation))throw Error('Choose Add or Subtract.');
 if(operation==='subtract'&&objects.length<2)throw Error('Select at least two shapes: first the cutter, then the parts to keep.');
 if(operation==='add'&&(objects.length<1||objects.length<2&&!cutouts.length))throw Error('Select at least two shapes to add together.');
 assertSameLayer(objects,cutouts);validateProject(booleanProject([...objects,...cutouts]));
 const owned=[],own=s=>(owned.push(s),s);
 try{
  const prepared=operation==='subtract'?[objects[0],...prepareSubtractTargets(objects.slice(1),cutouts)]:objects;
  const solids=prepared.map(o=>own(makeObject(K,o,tolerance)));let result,removedVolume=0,targetVolume=0;
  if(operation==='subtract'){
   const cutter=solids[0],target=own(K.Manifold.union(solids.slice(1)));targetVolume=target.volume();
   const overlap=own(target.intersect(cutter));removedVolume=overlap.volume();
   if(overlap.isEmpty()||!(removedVolume>0))throw Error('These shapes do not overlap. Move the cutter through the part to keep.');
   result=own(target.subtract(cutter));
  }else{
   const cuts=cutouts.length?own(K.Manifold.union(cutouts.map(o=>own(makeObject(K,o,tolerance))))):null;
   if(cuts&&fillOverlaps){const base=own(solids[0].subtract(cuts));result=own(K.Manifold.union([base,...solids.slice(1)]));}
   else{result=own(K.Manifold.union(solids));if(cuts)result=own(result.subtract(cuts));}
  }
  if(result.status()!=='NoError')throw Error('The operation could not produce a closed solid. Check the shapes and their overlap.');
  if(result.isEmpty()||!(result.volume()>0))throw Error(operation==='subtract'?'The cutter removes the entire part. Reduce the cutter or change its position.':'The selected shapes have no material remaining.');
  // Enclosed voids appear as negative-volume shells, not separate pieces of material.
  const pieces=result.decompose(),count=pieces.filter(s=>s.volume()>0).length;pieces.forEach(s=>s.delete());
  return {count,bounds:result.boundingBox(),volume:result.volume(),removedVolume,targetVolume};
 }finally{owned.forEach(s=>s.delete());}
}
