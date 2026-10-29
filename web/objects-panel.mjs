import {groupMembers} from './groups.mjs';
import {layerOf} from './layers.mjs';
import {names} from './templates.mjs';

// Left-side "Objects" panel. UI state only: nothing here is saved in the project,
// and nothing except the eye toggle mutates the project (selection never rebuilds).
// S: project, selected, selection, select, toggleMulti, deselect, change, escape, editMenu, addMenu, mergeMenu, createPrefab
export const LONG_PRESS_MS=450;
export function installObjectsPanel(S){
 const $=id=>document.getElementById(id),panel=$('objectsPanel'),btn=$('objectsToggle'),list=$('objectsList'),actions=$('objectsActions');
 const collapsed=new Set();
 let open=false,pressTimer=null,suppressClick=false;
 function toggle(value=!open){open=!!value;panel.hidden=!open;btn.setAttribute('aria-expanded',String(open));btn.classList.toggle('active',open);if(open)render();}
 function row(o){const cut=o.mode==='cut',e=S.escape;
  return `<div class="objectsrow${o.enabled?'':' hiddenobj'}" role="treeitem" aria-selected="false" data-row="${e(o.id)}"><button class="rowmain" data-select="${e(o.id)}">${e(o.name)}<small>${e(names[o.type]||o.type)}${o.enabled?'':' · hidden'}</small></button><span class="badge ${cut?'subtract':'add'}">${cut?'− Subtract':'＋ Add'}</span><button class="rowicon" data-eye="${e(o.id)}" aria-label="${o.enabled?'Hide':'Show'} ${e(o.name)}" aria-pressed="${o.enabled}">${o.enabled?'◉':'○'}</button><button class="rowicon" data-props="${e(o.id)}" aria-label="Properties of ${e(o.name)}">⚙</button></div>`;}
 function render(){if(!open)return;const p=S.project(),e=S.escape;
  function tree(parent,items,depth=1){return (p.groups||[]).filter(g=>g.parentId===parent&&groupMembers(p,g.id).some(id=>items.some(o=>o.id===id))).map(g=>{const members=items.filter(o=>o.groupId===g.id);return `<div role="treeitem" aria-level="${depth}" aria-expanded="${!collapsed.has(g.id)}"><button data-collapse="${e(g.id)}" aria-label="${e(g.name)}">${collapsed.has(g.id)?'▸':'▾'}</button><button data-group="${e(g.id)}">${e(g.name)}</button><button data-rename="${e(g.id)}">Rename group</button>${collapsed.has(g.id)?'':`<div role="group" style="padding-left:12px;">${members.map(row).join('')}${tree(g.id,items,depth+1)}</div>`}</div>`;}).join('');}
  list.innerHTML=p.objects.length?p.layers.map(l=>{const items=p.objects.filter(o=>layerOf(o)===l.id);return `<div class="layerhead${l.id===p.activeLayer?' active':''}" role="presentation"><b>${e(l.name)}</b><small>${items.length}${l.id===p.activeLayer?' · active':''}</small></div>${items.filter(o=>!o.groupId).map(row).join('')}${tree(undefined,items)}`;}).join(''):'<p class="subtle">No objects yet. Add a shape to start.</p>';
  selectionChanged();}
 function selectionChanged(){const ids=S.selection(),set=new Set(ids),primary=S.selected();
  for(const r of list.querySelectorAll('[data-row]')){const on=set.has(r.dataset.row);r.classList.toggle('selected',on);r.classList.toggle('primary',on&&r.dataset.row===primary);r.setAttribute('aria-selected',String(on));}
  actions.hidden=ids.length<2;$('objectsSelCount').textContent=ids.length+' objects selected';
  if(open&&primary){const r=[...list.querySelectorAll('[data-row]')].find(x=>x.dataset.row===primary);r?.scrollIntoView?.({block:'nearest'});}
 }
 const id=el=>el?.closest?.('[data-select],[data-eye],[data-props]');
 list.addEventListener('dblclick',ev=>{const el=ev.target.closest?.('[data-select]');if(el){S.deselect();S.select(el.dataset.select,{member:true});}});
 list.addEventListener('click',ev=>{const group=ev.target.closest?.('[data-collapse],[data-group],[data-rename]');if(group){const key=group.dataset.collapse||group.dataset.group||group.dataset.rename;if(group.dataset.collapse){collapsed.has(key)?collapsed.delete(key):collapsed.add(key);render();}else if(group.dataset.group){S.deselect();S.select(groupMembers(S.project(),key)[0]);}else S.renameGroup?.(key);return;}const el=id(ev.target);if(!el)return;
  if(el.dataset.select!==undefined){if(suppressClick){suppressClick=false;return;}const target=el.dataset.select;if(ev.ctrlKey||ev.metaKey||ev.shiftKey)S.toggleMulti(target);else{S.deselect();S.select(target);}return;}
  if(el.dataset.eye!==undefined){const target=el.dataset.eye;S.change(()=>{const o=S.project().objects.find(x=>x.id===target);if(o)o.enabled=!o.enabled;});return;}
  if(el.dataset.props!==undefined){S.deselect();S.select(el.dataset.props);S.editMenu();}
 });
 list.addEventListener('pointerdown',ev=>{const el=ev.target.closest?.('[data-select]');clearTimeout(pressTimer);suppressClick=false;if(!el||ev.ctrlKey||ev.metaKey||ev.shiftKey)return;pressTimer=setTimeout(()=>{suppressClick=true;S.toggleMulti(el.dataset.select);},LONG_PRESS_MS);});
 for(const type of ['pointerup','pointercancel','pointerleave'])list.addEventListener(type,()=>clearTimeout(pressTimer));
 list.addEventListener('contextmenu',ev=>{if(ev.target.closest?.('[data-select]'))ev.preventDefault();});
 // Taps in the panel must never pick or orbit the viewport.
 for(const el of [panel,btn])for(const type of ['pointerdown','pointermove','pointerup','pointercancel','wheel','touchstart','touchmove','touchend','click','dblclick'])el.addEventListener(type,ev=>ev.stopPropagation());
 btn.addEventListener('click',()=>toggle());
 $('objectsAdd').addEventListener('click',()=>S.addMenu());
 $('objectsMerge').addEventListener('click',()=>S.mergeMenu(S.selection()));
 $('objectsPrefab').addEventListener('click',()=>S.createPrefab());
 return {toggle,render,selectionChanged,isOpen:()=>open};
}
