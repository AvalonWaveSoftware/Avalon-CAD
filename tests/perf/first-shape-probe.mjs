// Amendment A2 probe: ONE first-time topology (exact B-rep + face data + pick mesh) in a fresh process, i.e. a fresh worker.
//   node tests/perf/first-shape-probe.mjs cold|warm torus|glyph [char]
// cold = kernel + glyph table loaded, nothing else built; warm = after the worker's idle warm-up (warmShape on a tiny
// torus and glyph 'B', exactly what worker.mjs runs once the queue is idle after the first interaction).
const R=process.cwd()+'/';const {initKernel}=await import(R+'web/kernel.mjs');const CS=await import(R+'web/cad-solid.mjs');
const {object}=await import(R+'web/templates.mjs');const {loadGlyphs}=await import(R+'web/glyph-geometry.mjs');
await initKernel({solidOptions:false});await CS.initSolid();await loadGlyphs();
if(process.argv[2]==='warm'){CS.warmShape({type:'torus',params:{diameter:3,tube:1}});CS.warmShape({type:'glyph',params:{char:'B',size:2,depth:1,font:'roboto-bold@1'}});}
const o=process.argv[3]==='torus'?object('torus',{diameter:30,tube:8}):object('glyph',{char:process.argv[4]||'@',size:20,depth:5,font:'roboto-bold@1'});
const a=performance.now();const t=CS.objectTopology(o);const ms=performance.now()-a;
console.log(JSON.stringify({ms:+ms.toFixed(2),faces:t.faces.length,pickEdges:t.edges.length,highlightTris:t.triangles.length/3}));
