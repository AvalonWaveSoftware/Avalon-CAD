import assert from 'node:assert/strict';
import {coordinate,decode3MF,import3MF} from '../web/import-3mf.mjs';
import {zip,zipParts,model} from './import-3mf-reference.mjs';
const buf=new ArrayBuffer(4),f=new Float32Array(buf),u=new Uint32Array(buf);
function bits(n){f[0]=n;return u[0];}
// Exact decimal representations of random adjacent binary32 midpoints and
// values one decimal unit on each side; independent integer expected bits.
// Exercise both sides of every normal/subnormal exponent transition as well.
const boundaries=[0,1,0x7fffff,0x800000,0x7f7ffffe,0x7f7fffff];
for(let e=1;e<255;e++)boundaries.push((e<<23)-1,e<<23,(e<<23)+1);
let seed=17,checks=0;
for(let i=0;i<1000+boundaries.length;i++){
 seed=(Math.imul(seed,1664525)+1013904223)>>>0;const lo=boundaries[i]??seed%0x7f800000;
 const m=BigInt((lo&0x7fffff)+(lo<0x800000?0:0x800000))*2n+1n,e=(lo<0x800000?-149:(lo>>>23)-150)-1;
 let n=m,places=0;if(e<0){places=-e;n*=5n**BigInt(places);}else n<<=BigInt(e);
 places+=4;n*=10000n;
 for(const delta of [-1n,0n,1n]){const text=(n+delta).toString()+'e-'+places,expected=lo+(delta>0n||delta===0n&&(lo&1)?1:0);assert.equal(bits(coordinate(text)[1]),expected,text);assert.equal(bits(coordinate('-'+text)[1]),(expected|0x80000000)>>>0);checks+=2;}
}
for(const s of ['1.000000059604644775390625','1.00000005960464477539062500000000001','7.006492321624085354618647916449580656401e-46','7.006492321624085354618647916449580656402e-46','-0'])assert.ok(Number.isFinite(coordinate(s)[0]));
// A nonzero tail beyond the exact-comparison digit cap must still round up.
for(const sign of ['', '-']){
 const midpoint='1.000000059604644775390625',signBit=sign?0x80000000:0;
 assert.equal(bits(coordinate(sign+midpoint+'0'.repeat(800))[1]),(0x3f800000|signBit)>>>0);
 assert.equal(bits(coordinate(sign+midpoint+'0'.repeat(800)+'1')[1]),(0x3f800001|signBit)>>>0);
 for(const value of ['0','1e-9999','1','3.4028236e38'])assert.ok(Object.is(coordinate(sign+value)[1],Math.fround(Number(sign+value))));
}
for(const s of ['NaN','Infinity','1x','',' 1','0x10','.','1e'])assert.throws(()=>coordinate(s),/Malformed/);
const base=model([0,0,0,1,0,0,0,1,0],[0,1,2]);
async function bad(xml,code=1){await assert.rejects(()=>decode3MF(zip(xml)),e=>e.code===code);}
for(const xml of ['<!DOCTYPE model><model/>','<model><object id="1"/><object id="1"/></model>','<model><x></model>','<model '+ 'x="1" x="2"/>',base.replace('v1="0"','v1="4294967296"'),base.replace('x="1"','x="bad"'),'<model>'+'<x>'.repeat(64)+'</x>'.repeat(64)+'</model>',base.replace('<model unit="millimeter"','<model unit="bad"')])await bad(xml);
await bad('<model/>',2);await assert.rejects(()=>decode3MF(new Uint8Array(50*1024*1024+1)),e=>e.code===4);
for(const stored of [true,false]){const b=zip(base,{stored}),out=await decode3MF(b);assert.equal(out.vertices.length,9);assert.equal(out.triangles.length,3);const broken=Buffer.from(b);broken.writeUInt32LE(0xffffffff,b.length-22-(46+'3D/3dmodel.model'.length)+42);await assert.rejects(()=>decode3MF(broken),e=>e.code===1);}
for(const b of [new Uint8Array(),new Uint8Array([80,75]),zip('<model/>',{name:'missing.model'})])await assert.rejects(()=>decode3MF(b),e=>e.code===(b.length>2?2:1));
// Child part's inch unit scales coordinates, while translation uses parent mm.
const root='<model><object id="9"><components><component objectid="1" p:path="/child.model" transform="1 0 0 0 1 0 0 0 1 7 8 9"/></components></object><build><item objectid="9"/></build></model>';
const child=model([1,0,0],[0,0,0],{unit:'inch'});const out=await decode3MF(zipParts([['3D/3dmodel.model',root],['child.model',child]]));assert.equal(out.vertices[0],Math.fround(32.4));
let welds=0;const data=zip(base);const result=await import3MF({id:3,buffer:data.buffer.slice(data.byteOffset,data.byteOffset+data.length)},{weldExact(v,t){welds++;return {vertices:v,triangles:t};}});assert.equal(welds,1);assert.equal(result.id,3);
await assert.rejects(()=>import3MF({buffer:data.buffer.slice(data.byteOffset,data.byteOffset+data.length)},{weldExact(){return {vertices:new Float32Array(3000003),triangles:new Uint32Array(3)};}}),e=>e.code===5);
console.log(`PASS lazy decoder: ${checks} exact signed midpoint comparisons; ZIP stored/deflate/caps/errors; XML validation; multipart units; one weld; post-weld cap.`);

// Platform inflater must reject truncation, excess output and trailing bytes.
for(const kind of ['short','long','trailing']){const b=zip(base,{padding:1}),e=b.length-22,p=b.readUInt32LE(e+16);if(kind==='short')b.writeUInt32LE(b.readUInt32LE(p+20)-1,p+20);if(kind==='long')b.writeUInt32LE(b.readUInt32LE(p+24)-1,p+24);if(kind==='trailing')b.writeUInt32LE(b.readUInt32LE(p+20)+1,p+20);await assert.rejects(()=>decode3MF(b),e=>e.code===1);}
console.log('PASS strict platform inflate: truncation, output cap, trailing byte rejection.');
