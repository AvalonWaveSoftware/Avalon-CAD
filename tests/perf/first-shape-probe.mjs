// Amendment A2 probe: ONE first-time topology (exact B-rep + face data + pick mesh) in a fresh process, i.e. a fresh worker.
//   node tests/perf/first-shape-probe.mjs cold|warm torus|glyph [char]   |   warmcost
// cold = kernel + glyph table loaded, nothing else built; warm = after the worker's idle warm-up (warmShape on a tiny
// torus and glyph 'B', exactly what worker.mjs runs once the queue is idle after the first interaction).
const R=process.cwd()+'/';const {initKernel}=await import(R+'web/kernel.mjs');const CS=await import(R+'web/cad-solid.mjs');
const {object}=await import(R+'web/templates.mjs');const {loadGlyphs}=await import(R+'web/glyph-geometry.mjs');
await initKernel({solidOptions:false});await CS.initSolid();
// warmcost: what the worker does after the warm request (engine already started): load the glyph table (glyphs.mjs),
// warm the torus, warm 'B'. Reports the total = first interaction (or idle start) to warm-up done, minus message hops.
if(process.argv[2]==='warmcost'){const t0=performance.now();await loadGlyphs();const g=performance.now()-t0,t=CS.warmShape({type:'torus',params:{diameter:3,tube:1}}),b=CS.warmShape({type:'glyph',params:{char:'B',size:2,depth:1,font:'roboto-bold@1'}});
 console.log(JSON.stringify({ms:+(performance.now()-t0).toFixed(2),glyphLoadMs:+g.toFixed(2),torusMs:+t.toFixed(2),glyphMs:+b.toFixed(2)}));process.exit(0);}
await loadGlyphs();
if(process.argv[2]==='warm'){CS.warmShape({type:'torus',params:{diameter:3,tube:1}});CS.warmShape({type:'glyph',params:{char:'B',size:2,depth:1,font:'roboto-bold@1'}});}
const o=process.argv[3]==='torus'?object('torus',{diameter:30,tube:8}):object('glyph',{char:process.argv[4]||'@',size:20,depth:5,font:'roboto-bold@1'});
const a=performance.now();const t=CS.objectTopology(o);const ms=performance.now()-a;
console.log(JSON.stringify({ms:+ms.toFixed(2),faces:t.faces.length,pickEdges:t.edges.length,highlightTris:t.triangles.length/3}));
