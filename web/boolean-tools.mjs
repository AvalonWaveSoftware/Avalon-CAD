import {selectedPieces,booleanResult,connectingBridges} from './operations.mjs';
import {object,uid,names} from './templates.mjs';
import {validateProject} from './kernel.mjs';
import {layerOf,layerName,assertSameLayer} from './layers.mjs';

export function installBooleanTools(S,B){
 const $=id=>document.getElementById(id),chosen=()=>selectedPieces(S.project(),B.ids()),overlap=(a,b)=>a&&b&&[0,1,2].every(i=>a.min[i]<=b.max[i]&&a.max[i]>=b.min[i]);
 const bounds=id=>S.parts().find(p=>p.userData.id===id)?.userData.bounds;
 const layerObjects=()=>S.project().objects.filter(o=>layerOf(o)===S.project().activeLayer);
 function selectionMenu(){
  const ids=B.ids();
  S.openSheet('Choose shapes in order',`<p class="subtle"><b>${S.escape(layerName(S.project()))}</b> · For <b>Subtract</b>, choose the cutter <b>first</b>, then every part to keep. A cutter selected alone cuts all solids on this layer. For <b>Add</b>, choose the pieces to join. Other layers are protected.</p><div class="booleanlegend"><span>1 · cutter</span><span>2+ · parts to keep</span></div><div class="booleanlist">${layerObjects().map(o=>{const index=ids.indexOf(o.id);return `<button class="booleanrow ${index>=0?'selected':''}" data-boolean-object="${S.escape(o.id)}" aria-pressed="${index>=0}" ${o.enabled?'':'disabled'}><span class="booleanordinal ${index>=1?'target':''}">${index<0?'○':index+1}</span><span>${S.escape(o.name)}<small>${names[o.type]} · ${o.enabled?(o.mode==='cut'?'cutout':'solid'):'disabled — Select → Objects to enable'}${index===0?' · cutter for Subtract':index>=1?' · part to keep':''}</small></span></button>`;}).join('')}</div><div class="row"><button id="clearBoolean">Clear selection</button><button id="swapBoolean" ${ids.length===2?'':'disabled'}>Swap 1 ↔ 2</button></div><button id="selectLayerTargets" class="full" ${ids.length?'':'disabled'}>Keep first as cutter · select all layer solids</button><button id="selectLayerSolids" class="full">Select all layer solids for Add</button><button id="doneBoolean" class="full primary">Done · ${ids.length} selected</button>`,'ADD / SUBTRACT');
  document.querySelectorAll('[data-boolean-object]').forEach(b=>b.onclick=()=>{const scroll=$('sheetContent').scrollTop;B.toggle(b.dataset.booleanObject);selectionMenu();$('sheetContent').scrollTop=scroll;});
  $('clearBoolean').onclick=()=>{B.setIds([]);selectionMenu();};
  $('swapBoolean').onclick=()=>{B.setIds([ids[1],ids[0]]);selectionMenu();};$('doneBoolean').onclick=S.closeSheet;
  $('selectLayerTargets').onclick=()=>{B.setIds([ids[0],...layerObjects().filter(o=>o.enabled&&o.mode==='solid'&&o.id!==ids[0]).map(o=>o.id)]);selectionMenu();};
  $('selectLayerSolids').onclick=()=>{B.setIds(layerObjects().filter(o=>o.enabled&&o.mode==='solid').map(o=>o.id));selectionMenu();};
 }
 function menu(operation){
  let selected=chosen();
  if(selected.some(o=>layerOf(o)!==S.project().activeLayer)){S.toast('Choose shapes on the active layer.');selectionMenu();return;}
  if(operation==='subtract'&&selected.length===1){const targets=layerObjects().filter(o=>o.enabled&&o.mode==='solid'&&o.id!==selected[0].id);B.setIds([selected[0].id,...targets.map(o=>o.id)]);selected=chosen();}
  if(operation==='subtract'&&selected.length<2){S.toast('Choose a cutter and at least one solid on this layer.');selectionMenu();return;}
  if(!selected.length){selectionMenu();return;}
  assertSameLayer(selected);
  const selectedIds=new Set(selected.map(o=>o.id)),targetShapes=operation==='subtract'?selected.slice(1):selected,cuts=layerObjects().filter(o=>o.enabled&&o.mode==='cut'&&!selectedIds.has(o.id)&&targetShapes.some(s=>!bounds(s.id)||!bounds(o.id)||overlap(bounds(s.id),bounds(o.id))));
  if(operation==='add'&&selected.length<2&&!cuts.length){S.toast('Select at least two overlapping shapes for Add.');selectionMenu();return;}
  const subtract=operation==='subtract',title=subtract?'Subtract overlapping material':'Add shapes together',buttonId=subtract?'confirmSubtract':'confirmAdd';
  S.openSheet(title,subtract?`<p class="subtle"><b>${S.escape(layerName(S.project()))}</b> · Other layers are protected.</p><div class="booleanroles"><p><span class="cutterrole">1 · CUTTER</span><b>${S.escape(selected[0].name)}</b></p><div>↓ removes overlapping material from ↓</div><p><span class="targetrole">${selected.length-1} PART${selected.length>2?'S':''} TO KEEP</span><b>${selected.slice(1).map(o=>S.escape(o.name)).join('<br>')}</b></p></div><p class="subtle">Subtract the first shape from every selected part on this layer. Existing cutouts are kept. Undo restores the originals.</p>${selected.length===2?'<button id="swapRoles" class="full">Swap cutter and part to keep</button>':''}<label class="toggle"><input type="checkbox" id="keepCutter">Keep the cutter as a disabled reference shape</label><div class="modalerror" id="booleanError"></div><button id="${buttonId}" class="full primary">Subtract from ${selected.length-1} part${selected.length>2?'s':''}</button>`:`<p class="subtle"><b>${S.escape(layerName(S.project()))}</b> · Add these ${selected.length} selected pieces into one physically connected solid. Other layers are protected.</p><div class="metrics">${selected.map((o,i)=>`${i+1}. ${S.escape(o.name)}`).join('<br>')}</div><p class="inlinehelp">Choose the existing part first, then the shapes to add. Selected shapes add material regardless of their previous Solid/Cutout setting.</p><p class="inlinehelp">Added shapes fill overlapping holes and cutouts in the first part. Holes outside the added material remain.</p>${cuts.length?`<label class="toggle"><input type="checkbox" id="preserveCuts" ${selected.length===1?'checked':''}>Keep existing holes from overlapping Cutout shapes</label><p class="inlinehelp">Leave this off to fill cutout overlaps. Turn it on to preserve those holes. With one selected shape, keep holes on to bake its cutouts.</p>`:''}<label class="toggle"><input type="checkbox" id="addBridge">Add connecting bars if pieces are separated</label><div class="field"><label for="bridgeDiameter">Connecting bar diameter · mm</label><input id="bridgeDiameter" type="number" step="0.5" value="5" min="0.5"></div><div class="modalerror" id="booleanError"></div><button id="${buttonId}" class="full primary">Add selected shapes</button>`,'ADD / SUBTRACT');
  if($('swapRoles'))$('swapRoles').onclick=()=>{B.setIds([...B.ids()].reverse());menu('subtract');};
  $(buttonId).onclick=async()=>{
   const keepCutter=subtract&&$('keepCutter').checked,appliedCuts=subtract?cuts:selected.length>1&&!$('preserveCuts')?.checked?cuts.filter(c=>!selected[0].excludedCutouts?.includes(c.id)):cuts,fillOverlaps=!subtract&&selected.length>1&&!$('preserveCuts')?.checked,bridge=!subtract&&$('addBridge').checked,diameter=!subtract?Number($('bridgeDiameter').value):0,button=$(buttonId),error=$('booleanError');
   if(!subtract&&selected.length===1&&!$('preserveCuts')?.checked){error.textContent='Select a second shape to add material, or turn on Keep existing holes.';return;}
   button.disabled=true;button.textContent='Checking solid…';error.textContent='';B.busy(true);
   try{
    let pieces=structuredClone(selected),info=await S.request('boolean',{operation,objects:pieces,cutouts:structuredClone(appliedCuts),fillOverlaps,tolerance:.03});
    if(!subtract&&info.count!==1){
     if(!bridge)throw Error('These pieces are separated. Overlap them, or enable connecting bars.');
     if(!(diameter>=.5&&diameter<=10000))throw Error('Connecting bar diameter must be 0.5–10000 mm.');
     pieces.push(...connectingBridges(selected,diameter,object));info=await S.request('boolean',{operation,objects:pieces,cutouts:structuredClone(appliedCuts),fillOverlaps,tolerance:.03});
     if(info.count!==1)throw Error('The bars did not connect every piece. Increase their diameter or reposition the pieces.');
    }
    const result=booleanResult(pieces,operation,uid(),info.bounds,appliedCuts,fillOverlaps),removedCuts=new Set(!subtract?appliedCuts.filter(c=>!layerObjects().some(o=>o.enabled&&o.mode==='solid'&&!selectedIds.has(o.id)&&overlap(bounds(o.id),bounds(c.id)))).map(c=>c.id):[]);
    if(!subtract&&cuts.length)result.excludedCutouts=[...new Set([...(result.excludedCutouts||[]),...cuts.map(c=>c.id)])];
    const next=structuredClone(S.project());next.objects=next.objects.filter(o=>!selectedIds.has(o.id)&&!removedCuts.has(o.id));next.objects.push(result);
    if(keepCutter)next.objects.push({...structuredClone(selected[0]),enabled:false});
    validateProject(next);B.busy(false);S.change(()=>{S.project().objects=next.objects;});B.setIds([]);S.select(result.id);S.closeSheet();B.setMode('move');
    S.toast(subtract?`Material subtracted from ${selected.length-1} part${selected.length>2?'s':''} on ${layerName(S.project())}.${info.count>1?' Result contains '+info.count+' separate pieces.':''}`:'Shapes added into one connected solid on '+layerName(S.project())+'.');
   }catch(e){error.textContent=e.message;button.disabled=false;button.textContent=subtract?'Subtract from selected parts':'Add selected shapes';}
   finally{B.busy(false);S.autosave();}
  };
 }
 return {selectionMenu,addMenu:()=>menu('add'),subtractMenu:()=>menu('subtract')};
}
