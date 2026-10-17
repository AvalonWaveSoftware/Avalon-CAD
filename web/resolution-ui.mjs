import {curvedTypes} from './facets.mjs';
import {isThread} from './threads.mjs';
export function applySmoothPreset(o){if(curvedTypes.includes(o.type))o.resolution={mode:'tolerance',tolerance:.005};return o;}
export function faceSummary(part){
 if(!part)return 'Face counts appear after the shape is built.';
 const triangles=part.geometry?part.geometry.index.count/3:part.triangles.length/3,t=part.userData?.topology||part.topology;
 if(!t)return `${triangles.toLocaleString()} triangle faces`;
 const curved=t.faceCount-t.flatFaces;
 return `${t.faceCount.toLocaleString()} ${curved?'surface':'flat'} faces · ${triangles.toLocaleString()} mesh triangles`;
}
export function resolutionPanel(o,part){
 const summary=`<div class="metrics" id="faceCountMetrics">${faceSummary(part)}<small>Counts for this shape before global cutouts. STL uses triangles to represent polygon and curved faces.</small></div>`;
 if(!curvedTypes.includes(o.type))return `<div class="sectionlabel">Number of faces</div>${summary}`;
 const mode=o.resolution?.mode||'auto',count=o.resolution?.count||(o.type==='rounded'?8:32),tol=o.resolution?.tolerance||.03,sphere=o.type==='sphere',rounded=o.type==='rounded';
 return `<div class="sectionlabel">Face resolution</div><div class="field"><label for="faceResolution">Surface mode</label><select id="faceResolution"><option value="auto" ${mode==='auto'?'selected':''}>Smooth · use STL export quality</option><option value="tolerance" ${mode==='tolerance'?'selected':''}>Smooth · custom face resolution</option>${isThread(o)||o.type==='torus'?'':`<option value="faces" ${mode==='faces'?'selected':''}>Faceted · set ${sphere?'number of faces':rounded?'corner segments':'number of sides'}</option>`}</select></div><div id="resolutionFaces" ${mode==='faces'?'':'hidden'}><div class="field"><label for="resolutionCount">${sphere?'Number of flat faces':rounded?'Segments per rounded corner':'Number of sides around the shape'}</label><input id="resolutionCount" type="number" step="1" inputmode="numeric" min="${sphere?4:rounded?1:3}" max="${rounded?128:512}" value="${count}"></div><div class="resolutionpresets">${(sphere?[4,6,8,12,20,32,64,128]:rounded?[1,2,4,8,16]:[3,4,6,8,12,24,64]).map(n=>`<button type="button" data-face-preset="${n}">${n}</button>`).join('')}</div><p class="inlinehelp" id="resolutionHint"></p></div><div id="resolutionSmooth" ${mode==='tolerance'?'':'hidden'}><div class="field"><label for="resolutionTolerance">Face resolution · maximum curve deviation (mm)</label><input id="resolutionTolerance" type="number" inputmode="decimal" step="0.005" min="0.005" max="2" value="${tol}"></div><p class="inlinehelp">Smaller values make curves smoother and increase triangle count. This setting applies to preview and STL export for this shape.</p></div>${summary}`;
}
export function bindResolution(o,$){
 if(!$('faceResolution'))return;
 const update=()=>{const mode=$('faceResolution').value;$('resolutionFaces').hidden=mode!=='faces';$('resolutionSmooth').hidden=mode!=='tolerance';const count=Number($('resolutionCount').value);$('resolutionHint').textContent=o.type==='sphere'?`${count} flat polygon faces. Six gives a cube; larger counts approximate a sphere. Diameter is the largest overall width. The chosen facets stay in STL at every export quality.`:o.type==='rounded'?'Choose 1–128 flat segments per corner. The chosen corners stay faceted in STL.':'Choose 3–512 sides around the shape. End faces are additional. These sides stay in STL at every export quality.';};
 $('faceResolution').onchange=update;$('resolutionCount').oninput=update;
 document.querySelectorAll('[data-face-preset]').forEach(b=>b.onclick=()=>{$('faceResolution').value='faces';$('resolutionCount').value=b.dataset.facePreset;update();});update();
}
export function readResolution(o,$){
 if(!$('faceResolution'))return o.resolution;
 const mode=$('faceResolution').value;
 return mode==='faces'?{mode,count:Number($('resolutionCount').value)}:mode==='tolerance'?{mode,tolerance:Number($('resolutionTolerance').value)}:{mode:'auto'};
}
// A glyph with another character has another face layout (its roundovers no longer apply).
export function sameTopology(a,b){const r=o=>o.resolution?.mode==='faces'?o.resolution.count:0;return r(a)===r(b)&&a.params?.char===b.params?.char;}
