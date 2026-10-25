// ADR-0001 F2a test helper: an independent 3MF reader (zip via node:zlib, model XML via regular expressions) and the
// core-spec mesh checks, shared by tests/export-3mf.mjs and tests/export-3mf-ui.mjs.
import assert from 'node:assert/strict';import zlib from 'node:zlib';
export function unzip(buf){
 const b=Buffer.from(buf),u16=i=>b.readUInt16LE(i),u32=i=>b.readUInt32LE(i);
 const end=b.length-22;assert.equal(u32(end),0x06054b50,'EOCD at the very end (no archive comment)');
 assert.equal(u16(end+4),0);assert.equal(u16(end+6),0);assert.equal(u16(end+20),0,'no archive comment');
 const count=u16(end+10);assert.equal(u16(end+8),count);const size=u32(end+12),start=u32(end+16);assert.equal(start+size,end,'central directory right before EOCD');
 const entries=[];let at=start,expectLocal=0;
 for(let i=0;i<count;i++){
  assert.equal(u32(at),0x02014b50);
  const e={made:u16(at+4),need:u16(at+6),flags:u16(at+8),method:u16(at+10),time:u16(at+12),date:u16(at+14),crc:u32(at+16),csize:u32(at+20),size:u32(at+24),nlen:u16(at+28),xlen:u16(at+30),clen:u16(at+32),disk:u16(at+34),iattr:u16(at+36),eattr:u32(at+38),offset:u32(at+42)};
  e.name=b.subarray(at+46,at+46+e.nlen).toString('latin1');
  assert.deepEqual([e.need,e.flags,e.method,e.xlen,e.clen,e.disk,e.time,e.date],[20,0,8,0,0,0,0,0x21],e.name+': version 2.0, no flags (no data descriptor/encryption), DEFLATE, no extra/comment, 1980-01-01');
  assert.ok(e.csize<0xffffffff&&e.size<0xffffffff&&e.offset<0xffffffff,'no ZIP64 markers');
  const o=e.offset;assert.equal(o,expectLocal,'local entries contiguous from offset 0');assert.equal(u32(o),0x04034b50);
  assert.ok(b.subarray(o+4,o+26).equals(b.subarray(at+6,at+28)),e.name+': local header equals central header');assert.equal(u16(o+26),e.nlen);assert.equal(u16(o+28),0);
  assert.equal(b.subarray(o+30,o+30+e.nlen).toString('latin1'),e.name);
  const data=zlib.inflateRawSync(b.subarray(o+30+e.nlen,o+30+e.nlen+e.csize));assert.equal(data.length,e.size);assert.equal(zlib.crc32(data)>>>0,e.crc,e.name+' CRC-32');
  e.data=data;entries.push(e);expectLocal=o+30+e.nlen+e.csize;at+=46+e.nlen;
 }
 assert.equal(expectLocal,start,'no gap before the central directory');
 return entries;
}
export const ST_NUMBER=/^[-+]?(([0-9]+(\.[0-9]+)?)|(\.[0-9]+))([eE][-+]?[0-9]+)?$/;
export const CONTENT_TYPES='<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="model" ContentType="application/vnd.ms-package.3dmanufacturing-3dmodel+xml"/></Types>\n';
export const RELS='<?xml version="1.0" encoding="UTF-8"?>\n<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Target="/3D/3dmodel.model" Id="rel0" Type="http://schemas.microsoft.com/3dmanufacturing/2013/01/3dmodel"/></Relationships>\n';
export function read3MF(buf){
 const entries=unzip(buf);
 assert.deepEqual(entries.map(e=>e.name),['[Content_Types].xml','_rels/.rels','3D/3dmodel.model'],'exactly the three core parts, in this order');
 assert.equal(entries[0].data.toString('utf8'),CONTENT_TYPES);assert.equal(entries[1].data.toString('utf8'),RELS);
 const xml=entries[2].data.toString('utf8');
 assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<model unit="millimeter" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02">'),'model root, millimetres, core namespace');
 assert.equal((xml.match(/<object /g)||[]).length,1);assert.ok(xml.includes('<object id="1" type="model">'));
 assert.equal((xml.match(/<item /g)||[]).length,1);assert.ok(/<build>\n<item objectid="1"\/>\n<\/build>/.test(xml));
 assert.ok(!/<color|<basematerials|<metadata|<components/.test(xml),'no colours, materials, metadata or components');
 const vs=[],ts=[];
 for(const m of xml.matchAll(/<vertex x="([^"]*)" y="([^"]*)" z="([^"]*)"\/>/g)){for(let k=1;k<4;k++){assert.match(m[k],ST_NUMBER);vs.push(Number(m[k]));}}
 for(const m of xml.matchAll(/<triangle v1="(\d+)" v2="(\d+)" v3="(\d+)"\/>/g))ts.push(+m[1],+m[2],+m[3]);
 assert.equal((xml.match(/<vertex /g)||[]).length*3,vs.length);assert.equal((xml.match(/<triangle /g)||[]).length*3,ts.length);
 return {xml,vertices:Float32Array.from(vs),triangles:Uint32Array.from(ts)};
}
export function meshRules(v,t,what){
 const n=v.length/3;assert.ok(n<2**31);const edges=new Map();
 for(let i=0;i<t.length;i+=3){const a=t[i],b=t[i+1],c=t[i+2];assert.ok(a<n&&b<n&&c<n,what+': index in range');assert.ok(a!==b&&b!==c&&a!==c,what+': v1, v2, v3 distinct');
  for(const [p,q] of [[a,b],[b,c],[c,a]]){const k=p*n+q;assert.ok(!edges.has(k),what+': each directed edge once (consistent orientation)');edges.set(k,1);}}
 for(const k of edges.keys()){const p=Math.floor(k/n),q=k%n;assert.ok(edges.has(q*n+p),what+': manifold edge (shared by exactly one other triangle, opposite direction)');}
 // Outward normals: positive signed volume.
 let vol=0;for(let i=0;i<t.length;i+=3){const [a,b,c]=[t[i],t[i+1],t[i+2]].map(j=>[v[j*3],v[j*3+1],v[j*3+2]]);vol+=(a[0]*(b[1]*c[2]-b[2]*c[1])-a[1]*(b[0]*c[2]-b[2]*c[0])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;}
 assert.ok(vol>0,what+': positive volume (outward normals)');return vol;
}
export function sameAsSTL(stl,m,what){
 const s=Buffer.from(stl),count=s.readUInt32LE(80);assert.equal(m.triangles.length/3,count,what+': triangle count equals the STL');
 for(let i=0;i<count;i++)for(let c=0;c<3;c++){const vi=m.triangles[i*3+c];for(let k=0;k<3;k++)if(s.readFloatLE(84+i*50+12+c*12+k*4)!==Math.fround(m.vertices[vi*3+k]))assert.fail(`${what}: triangle ${i} corner ${c} axis ${k} differs from the STL`);}
}

