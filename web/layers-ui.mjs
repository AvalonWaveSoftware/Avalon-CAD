import {layerOf,layerName} from './layers.mjs';
import {uid} from './templates.mjs';
export function installLayerTools(S){
 const $=id=>document.getElementById(id);
 function menu(){
  const p=S.project();
  S.openSheet('Model layers',`<p class="subtle">Each layer builds its own material. Cutout shapes remove material only on their own layer. Merge joins selected shapes on one layer. All layer results are added together for the model and STL.</p><p class="inlinehelp">New shapes go on the active layer. Move an existing shape with <b>Edit → Layer</b>. Tap selection uses the active layer; other layers remain visible for reference.</p><div class="layerlist">${p.layers.map(l=>`<button class="layerrow ${l.id===p.activeLayer?'active':''}" data-layer="${S.escape(l.id)}" aria-pressed="${l.id===p.activeLayer}"><b>${S.escape(l.name)}</b><small>${p.objects.filter(o=>layerOf(o)===l.id).length} objects${l.id===p.activeLayer?' · active':''}</small></button>`).join('')}</div><button id="newLayer" class="full primary">＋ Create a new layer</button><div class="sectionlabel">Rename ${S.escape(layerName(p))}</div><div class="field"><label for="layerName">Layer name</label><input id="layerName" type="text" maxlength="60" value="${S.escape(layerName(p))}"></div><button id="renameLayer" class="full">Rename active layer</button><div id="layerError" class="modalerror"></div>`,'LAYERS');
  document.querySelectorAll('[data-layer]').forEach(b=>b.onclick=()=>{S.clear();S.change(()=>p.activeLayer=b.dataset.layer);menu();});
  $('newLayer').onclick=()=>{if(p.layers.length>=100){$('layerError').textContent='Maximum 100 layers.';return;}const layer={id:'layer-'+uid(),name:'Layer '+(p.layers.length+1)};S.clear();S.change(()=>{p.layers.push(layer);p.activeLayer=layer.id;});menu();};
  $('renameLayer').onclick=()=>{const name=$('layerName').value.trim();if(!name){$('layerError').textContent='Enter a layer name.';return;}S.change(()=>p.layers.find(l=>l.id===p.activeLayer).name=name.slice(0,60));menu();};
 }
 return {menu};
}
