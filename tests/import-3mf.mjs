import {weldExact} from '../web/worker-stl.mjs';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {performance} from 'node:perf_hooks';
import os from 'node:os';
import {zip,zipParts,model,reference} from './import-3mf-reference.mjs';
import {weldExactReference} from './stl-weld-reference.mjs';
import {initRustMesh} from '../web/rust-mesh.mjs';
import {decode3MF} from '../web/import-3mf.mjs';
const only=process.argv.includes('--reference');
const binary=readFileSync(new URL('../app/assets/mesh-core.wasm',import.meta.url));
const core=(await WebAssembly.instantiate(binary,{})).instance.exports;
if(!only)assert.equal(core.decode_3mf,undefined,'F2b decoder must stay out of wasm');
const rust=only?{weldExact(v,t){const w=weldExactReference(v,t);return {vertices:Float32Array.from(w.vertices),triangles:Uint32Array.from(w.triangles)};}}:await initRustMesh({binary});
if(rust)rust.decode3MF=async bytes=>{const m=await decode3MF(bytes);return {...weldExact(rust,m.vertices,m.triangles),ignored:m.ignored};};
{const xml=model([0,0,0,1,0,0,0,1,0],[0,1,2]).replace('x="1"','x="1.00000005960464477539062500000000001"');assert.equal((await rust.decode3MF(zip(xml))).vertices[3],1+2**-23);}
const v=[0,0,0,1,0,0,1,1,0,0,1,0,0,0,1,1,0,1,1,1,1,0,1,1],t=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7];
const fixtures=[model(v,t),model(v,t,{unit:'inch'}),model(v,t,{extra:'<basematerials id="9"><base name="red" displaycolor="#FF0000FF"/></basematerials>'}),model(v,t,{objects:'<object id="2"><components><component objectid="1" transform="2 0 0 0 2 0 0 0 2 1 2 3"/></components></object><object id="3"><components><component objectid="2" transform="1 0 0 0 1 0 0 0 1 10 0 0"/></components></object>',build:'<item objectid="3"/>'})];
let checks=0;for(const xml of fixtures)for(const stored of [false,true]){const bytes=zip(xml,{stored}),expected=reference(bytes);{const result=await rust.decode3MF(bytes),w=weldExactReference(expected.vertices,expected.triangles);assert.deepEqual(result.vertices,Float32Array.from(w.vertices));assert.deepEqual(result.triangles,Uint32Array.from(w.triangles));assert.equal(result.ignored,expected.ignored);}checks++;}
const multipart=zipParts([['3D/3dmodel.model','<model unit="millimeter"><resources><object id="9"><components><component objectid="1" p:path="/3D/sub.model" transform="1 0 0 0 1 0 0 0 1 7 8 9"/></components></object></resources><build><item objectid="9"/></build></model>'],['3D/sub.model',fixtures[0]]]);
const multi=reference(multipart);assert.deepEqual(Array.from(multi.vertices.slice(0,3)),[7,8,9]);assert.deepEqual((await rust.decode3MF(multipart)).vertices,Float32Array.from(weldExactReference(multi.vertices,multi.triangles).vertices));
for(const [unit,scale] of Object.entries({micron:.001,millimeter:1,centimeter:10,inch:25.4,foot:304.8,meter:1000})){const bytes=zip(model(v,t,{unit}));assert.equal(reference(bytes).vertices[3],Math.fround(scale));assert.equal((await rust.decode3MF(bytes)).vertices[3],Math.fround(scale));}
assert.equal(reference(zip(fixtures[1])).vertices[3],Math.fround(25.4));assert.equal(reference(zip(fixtures[2])).ignored,true);assert.equal(reference(zip(fixtures[3])).vertices[0],11);
// ADR F2a package from an actual model export mesh. Swap zip(model(...)) for
// rust.write3MF(exported.vertices,exported.triangles) once F2a merges.
const {initKernel,buildModel}=await import('../web/kernel.mjs');
const {plate}=await import('../web/templates.mjs');
const K=await initKernel(),exported=buildModel(K,plate(),.15);
if(!only){const {initLocalEngine}=await import('../web/local-engine.mjs');const engine=await initLocalEngine(K,{rust:{binary}});const bytes=zip(fixtures[0]);const imported=await engine.process({id:42,type:'import3MF',buffer:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)});assert.deepEqual(imported.vertices,(await rust.decode3MF(bytes)).vertices);assert.equal(imported.id,42);engine.destroy();}
const round=reference(zip(model(exported.vertices,exported.triangles)));
const vertexSet=a=>new Set(Array.from({length:a.length/3},(_,i)=>Array.from(a.slice(i*3,i*3+3),Math.fround).join(',')));
assert.deepEqual(vertexSet(round.vertices),vertexSet(exported.vertices));
if(!only){const actual=rust.write3MF(exported.vertices,exported.triangles,false);assert.deepEqual(vertexSet((await rust.decode3MF(new Uint8Array(actual))).vertices),vertexSet(exported.vertices));}
for(const bytes of [Buffer.from('PK'),zip(fixtures[0],{name:'missing.model'}),zip(fixtures[0].replace('x="0"','x="bad"')),zip(fixtures[0].replace('v1="0"','v1="999"')),zip('<model/>'),zip(model(v,t,{objects:'<object id="2"><components><component objectid="2"/></components></object>',build:'<item objectid="2"/>'}))]){assert.throws(()=>reference(bytes));await assert.rejects(()=>rust.decode3MF(bytes));}
const broken=zip(fixtures[0]);broken.writeUInt32LE(1,broken.length-22-('3D/3dmodel.model'.length+46)+20);assert.throws(()=>reference(broken));await assert.rejects(()=>rust.decode3MF(broken));
const huge=model([0,0,0],[0,0,0]).replace('<triangle v1="0" v2="0" v3="0"/>','<triangle v1="0" v2="0" v3="0"/>'.repeat(1000001));const over=zip(huge);assert.throws(()=>reference(over),/1 million/);await assert.rejects(()=>rust.decode3MF(over),/1 million/);
const tri='<triangle v1="0" v2="1" v3="2"/>';
let perfXML=model(v,t).replace(/<triangles>[\s\S]*?<\/triangles>/,'<triangles>'+tri.repeat(500000)+'</triangles>');
const overhead=zip('',{stored:true}).length;
perfXML=perfXML.replace('</model>',' '.repeat(50*1024*1024-overhead-Buffer.byteLength(perfXML))+'</model>');
const large=zip(perfXML,{stored:true});assert.equal(large.length,50*1024*1024);
const samples=[];for(let i=0;i<3;i++){const start=performance.now();await rust.decode3MF(large);samples.push(performance.now()-start);}console.log(`${only?'Lazy JS + test-only weld oracle':'Lazy JS + Rust weld'}: 50 MiB stored model, 500000 triangles timings ms ${samples.map(n=>n.toFixed(2))}; load ${os.loadavg()}`);
console.log(`3MF ${only?'reference':'integration'}: ${checks} fixtures passed`);
if(!only){assert.equal(core.decode_3mf,undefined);assert.ok(binary.length<=120000);assert.ok(samples.sort((a,b)=>a-b)[1]<=1500);}
