// Amendment A2/A3: the table-driven topology (torus analytic pick mesh, glyph face data from outline tables) must match
// the full OCCT path for every glyph and the torus at min/default/max: face kinds, edges, loops, normals, centres
// (PLANE exact, curved <=1e-6*size), pick edges, highlight groups, and bounding box.
import assert from 'node:assert/strict';
import {initKernel} from '../web/kernel.mjs';import * as CS from '../web/cad-solid.mjs';import {object} from '../web/templates.mjs';
import {loadGlyphs} from '../web/glyph-geometry.mjs';import {GLYPH_CHARS} from '../web/glyph-metrics.mjs';
await initKernel();await loadGlyphs();
const topo=(o,fast)=>{CS.setGlyphFastPath(fast);CS.disposeSolidCache();return CS.objectTopology(o);};
const bb=v=>{const m=[1e9,1e9,1e9,-1e9,-1e9,-1e9];for(let i=0;i<v.length;i++){m[i%3]=Math.min(m[i%3],v[i]);m[3+i%3]=Math.max(m[3+i%3],v[i]);}return m;};
const bad=[];let maxC=0,n=0;
for(const c of GLYPH_CHARS)for(const [size,depth] of [[3,1],[20,5],[200,40]]){const o=object('glyph',{char:c,size,depth,font:'roboto-bold@1'}),a=topo(o,true),b=topo(o,false);const err=[];n++;
 if(a.faces.length!==b.faces.length)err.push('faces');else a.faces.forEach((f,i)=>{const g=b.faces[i];if(f.kind!==g.kind||JSON.stringify([f.edges,f.loops,f.normal])!==JSON.stringify([g.edges,g.loops,g.normal]))err.push('face'+i);const d=Math.max(...f.center.map((v,k)=>Math.abs(v-g.center[k])));maxC=Math.max(maxC,d/size);if(f.kind==='PLANE'?d!==0:d>1e-6*size)err.push('center'+i);});
 if(JSON.stringify(a.edges.map(e=>e.index))!==JSON.stringify(b.edges.map(e=>e.index)))err.push('pick');
 if(JSON.stringify(a.groups.map(g=>g.face))!==JSON.stringify(b.groups.map(g=>g.face))||a.groups.some(g=>!g.count))err.push('groups');
 const A=bb(a.vertices),B=bb(b.vertices);if(A.some((v,k)=>Math.abs(v-B[k])>1e-3*size))err.push('bbox');
 if(err.length)bad.push(c+' '+size+': '+err.slice(0,4).join(' '));}
for(const [D,t] of [[2,.5],[30,8],[300,100],[30,14]]){const o=object('torus',{diameter:D,tube:t}),a=topo(o,true),b=topo(o,false);n++;
 if(JSON.stringify([a.faces,a.edges])!==JSON.stringify([b.faces,b.edges])||a.groups.length!==1||a.groups[0].face!==0)bad.push('torus '+D+'/'+t);
 const A=bb(a.vertices),B=bb(b.vertices);if(A.some((v,k)=>Math.abs(v-B[k])>1e-3*D))bad.push('torus bbox '+D+'/'+t);}
CS.setGlyphFastPath(true);assert.deepEqual(bad,[]);
console.log('PASS:',n,'topology parity cases (94 glyphs × 3 sizes + 4 tori), table path vs full OCCT; max relative centre difference',maxC.toExponential(1));
