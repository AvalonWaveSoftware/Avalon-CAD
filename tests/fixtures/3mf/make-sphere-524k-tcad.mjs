// Builds the Waydroid/desktop timing sample /workspace/avalon-cad-artifacts/export-3mf/samples/sphere-524k.tcad:
// node tests/fixtures/3mf/make-sphere-524k-tcad.mjs <out.tcad>
// 524,288-triangle sphere as an Avalon project with ONE indexed mesh object (shared vertices) — an STL import of this
// sphere can't work: readSTL keeps 3 unshared vertices per triangle (4.7M floats) and the mesh check caps vertices at 3M.
import fs from 'node:fs';const R=new URL('../../../',import.meta.url).pathname;// repo root
const {initKernel}=await import(R+'web/kernel.mjs');const {initLocalEngine}=await import(R+'web/local-engine.mjs');
const {blank,object}=await import(R+'web/templates.mjs');const {migrateProject}=await import(R+'web/migrate.mjs');
const K=await initKernel(),m=K.Manifold.sphere(25,1024).getMesh();
const vertices=Array.from(m.vertProperties,v=>Number(Math.fround(v).toPrecision(9))),triangles=Array.from(m.triVerts);
const p={...blank(),name:'Sphere 524k'};p.objects=[object('mesh',{mesh:{vertices,triangles}},[0,0,0],'sphere-524k')];
const text=JSON.stringify(p);fs.writeFileSync(process.argv[2],text);console.log('bytes',text.length,'verts',vertices.length/3,'tris',triangles.length/3);
const e=await initLocalEngine(K,{rust:{binary:fs.readFileSync(R+'app/assets/mesh-core.wasm')}});
const r=e.process({type:'export',id:1,project:migrateProject(JSON.parse(text)),tolerance:.03,ground:true});console.log('export',r.error||{triangles:r.triangles,bytes:r.buffer?.byteLength});
