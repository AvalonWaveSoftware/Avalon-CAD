import {mergeResult,connectingBridges} from './operations.mjs';
import {object,uid} from './templates.mjs';
import {validateProject} from './kernel-ui.mjs';
import {getUnit,fieldLen,readLen,byUnit,unitMessage} from './units.mjs';
import {layerOf,layerName,assertSameLayer} from './layers.mjs';

// Why a selection cannot be merged, or '' when it can.
export function mergeProblem(objects){
 if(objects.length<2)return 'Select at least two shapes to merge.';
 if(objects.some(o=>!o.enabled))return 'Merge needs visible shapes. Show hidden objects in the Objects panel first.';
 try{assertSameLayer(objects);}catch(e){return e.message;}
 if(objects.some(o=>o.mode==='cut'))return 'Merge joins solid shapes; cutouts already subtract on their layer.';
 return '';
}

export function installMergeTools(S,B){
 const $=id=>document.getElementById(id),overlap=(a,b)=>a&&b&&[0,1,2].every(i=>a.min[i]<=b.max[i]&&a.max[i]>=b.min[i]);
 const bounds=id=>S.parts().find(p=>p.userData.id===id)?.userData.bounds;
 function mergeMenu(ids){
  const p=S.project(),selected=ids.map(id=>p.objects.find(o=>o.id===id)).filter(Boolean),problem=mergeProblem(selected);
  if(problem){S.toast(problem,true);return false;}
  const layer=layerOf(selected[0]),layerObjects=()=>S.project().objects.filter(o=>layerOf(o)===layer);
  const selectedIds=new Set(selected.map(o=>o.id)),cuts=layerObjects().filter(o=>o.enabled&&o.mode==='cut'&&!selectedIds.has(o.id)&&selected.some(s=>!bounds(s.id)||!bounds(o.id)||overlap(bounds(s.id),bounds(o.id))));
  S.openSheet('Merge shapes',`<p class="subtle"><b>${S.escape(layerName(p,layer))}</b> · Merge these ${selected.length} selected shapes into one physically connected solid. Other layers are protected.</p><div class="metrics">${selected.map((o,i)=>`${i+1}. ${S.escape(o.name)}`).join('<br>')}</div><p class="inlinehelp">Merged shapes fill overlapping holes and cutouts in the first shape. Holes outside the merged material remain.</p>${cuts.length?`<label class="toggle"><input type="checkbox" id="preserveCuts">Keep existing holes from overlapping Cutout shapes</label><p class="inlinehelp">Leave this off to fill cutout overlaps. Turn it on to preserve those holes.</p>`:''}<label class="toggle"><input type="checkbox" id="addBridge">Add connecting bars if pieces are separated</label><div class="field"><label for="bridgeDiameter">${byUnit('Connecting bar diameter · mm','Connecting bar diameter · in')}</label><input id="bridgeDiameter" type="number" step="${byUnit('0.5','0.01')}" value="${fieldLen(5)}" min="${byUnit('0.5','0.02')}"></div><div class="modalerror" id="mergeError"></div><button id="confirmMerge" class="full primary">Merge ${selected.length} shapes</button>`,'MERGE');
  $('confirmMerge').onclick=async()=>{
   const keepHoles=!!$('preserveCuts')?.checked,appliedCuts=!keepHoles?cuts.filter(c=>!selected[0].excludedCutouts?.includes(c.id)):cuts,fillOverlaps=!keepHoles,bridge=$('addBridge').checked,diameter=getUnit()==='in'?readLen($('bridgeDiameter').value,fieldLen(5),5):Number($('bridgeDiameter').value),button=$('confirmMerge'),error=$('mergeError');
   button.disabled=true;button.textContent='Checking solid…';error.textContent='';B.busy(true);
   try{
    let pieces=structuredClone(selected),info=await S.request('boolean',{operation:'add',objects:pieces,cutouts:structuredClone(appliedCuts),fillOverlaps,tolerance:.03});
    if(info.count!==1){
     if(!bridge)throw Error('These pieces are separated. Overlap them, or enable connecting bars.');
     if(!(diameter>=.5&&diameter<=10000))throw Error('Connecting bar diameter must be 0.5–10000 mm.');
     pieces.push(...connectingBridges(selected,diameter,object));info=await S.request('boolean',{operation:'add',objects:pieces,cutouts:structuredClone(appliedCuts),fillOverlaps,tolerance:.03});
     if(info.count!==1)throw Error('The bars did not connect every piece. Increase their diameter or reposition the pieces.');
    }
    const result=mergeResult(pieces,uid(),info.bounds,appliedCuts,fillOverlaps),removedCuts=new Set(appliedCuts.filter(c=>!layerObjects().some(o=>o.enabled&&o.mode==='solid'&&!selectedIds.has(o.id)&&overlap(bounds(o.id),bounds(c.id)))).map(c=>c.id));
    if(cuts.length)result.excludedCutouts=[...new Set([...(result.excludedCutouts||[]),...cuts.map(c=>c.id)])];
    const next=structuredClone(S.project()),at=next.objects.findIndex(o=>selectedIds.has(o.id));next.objects=next.objects.filter(o=>!selectedIds.has(o.id)&&!removedCuts.has(o.id));next.objects.splice(Math.min(at,next.objects.length),0,result);
    validateProject(next);B.busy(false);S.change(()=>{S.project().objects=next.objects;});B.setIds([result.id]);S.closeSheet();
    S.toast('Shapes merged into one connected solid on '+layerName(S.project(),layer)+'.');
   }catch(e){error.textContent=unitMessage(e.message);button.disabled=false;button.textContent=`Merge ${selected.length} shapes`;}
   finally{B.busy(false);S.autosave();}
  };
  return true;
 }
 return {mergeMenu};
}
