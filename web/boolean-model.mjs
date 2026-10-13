import {makeObject,validateProject} from './kernel.mjs';
import {assertSameLayer,booleanProject} from './layers.mjs';

// Merge unites the selected shapes on one layer. Cutouts subtract per primitive on their own layer.
export function evaluateBoolean(K,objects,operation,tolerance=.03,cutouts=[],fillOverlaps=false){
 if(operation!=='add')throw Error('Only Merge is supported.');
 if(objects.length<1||objects.length<2&&!cutouts.length)throw Error('Select at least two shapes to merge.');
 assertSameLayer(objects,cutouts);validateProject(booleanProject([...objects,...cutouts]));
 const owned=[],own=s=>(owned.push(s),s);
 try{
  const solids=objects.map(o=>own(makeObject(K,o,tolerance)));let result;
  const cuts=cutouts.length?own(K.Manifold.union(cutouts.map(o=>own(makeObject(K,o,tolerance))))):null;
  if(cuts&&fillOverlaps){const base=own(solids[0].subtract(cuts));result=own(K.Manifold.union([base,...solids.slice(1)]));}
  else{result=own(K.Manifold.union(solids));if(cuts)result=own(result.subtract(cuts));}
  if(result.status()!=='NoError')throw Error('The operation could not produce a closed solid. Check the shapes and their overlap.');
  if(result.isEmpty()||!(result.volume()>0))throw Error('The selected shapes have no material remaining.');
  // Enclosed voids appear as negative-volume shells, not separate pieces of material.
  const pieces=result.decompose(),count=pieces.filter(s=>s.volume()>0).length;pieces.forEach(s=>s.delete());
  return {count,bounds:result.boundingBox(),volume:result.volume(),removedVolume:0,targetVolume:0};
 }finally{owned.forEach(s=>s.delete());}
}
