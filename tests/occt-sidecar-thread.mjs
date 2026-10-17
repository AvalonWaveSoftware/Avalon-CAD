// WS14 test helper: the OCCT sidecar as a Node worker thread (its own module graph and OCCT heap), answering exactly
// as the browser sidecar in web/worker.mjs does.
import {parentPort} from 'node:worker_threads';
import {initSolid,solidMeshFresh,objectTopology} from '../web/cad-solid.mjs';
import {packError} from '../web/occt-remote.mjs';
import {prepareGlyphs} from '../web/glyph-geometry.mjs';
const ready=initSolid();
parentPort.on('message',async({id,request:r})=>{try{await ready;}catch(e){parentPort.postMessage({id,answer:{error:packError(e),init:true}});return;}
 let answer;const t0=performance.now();
 try{await prepareGlyphs(r.o);if(r.kind==='mesh'){const m=solidMeshFresh(r.o,r.tolerance,r.display);parentPort.postMessage({id,answer:{m},ms:performance.now()-t0},[m.vertices.buffer,m.triangles.buffer]);return;}answer={t:objectTopology(r.o)};}
 catch(e){answer={error:packError(e)};}parentPort.postMessage({id,answer,ms:performance.now()-t0});});
