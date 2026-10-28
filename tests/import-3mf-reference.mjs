import './import-3mf-platform.mjs';
// TEST ONLY. Node's zlib is deliberately never imported by shipped code.
import {inflateRawSync,deflateRawSync} from 'node:zlib';
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
export function zip(xml,{stored=false,name='3D/3dmodel.model',padding=0}={}){
 const source=Buffer.from(xml),data=stored?source:deflateRawSync(source),n=Buffer.from(name),h=Buffer.alloc(30),c=Buffer.alloc(46),e=Buffer.alloc(22);
 h.writeUInt32LE(0x04034b50);h.writeUInt32LE(crc32(source),14);h.writeUInt16LE(stored?0:8,8);h.writeUInt32LE(data.length,18);h.writeUInt32LE(source.length,22);h.writeUInt16LE(n.length,26);
 c.writeUInt32LE(0x02014b50);c.writeUInt32LE(crc32(source),16);c.writeUInt16LE(stored?0:8,10);c.writeUInt32LE(data.length,20);c.writeUInt32LE(source.length,24);c.writeUInt16LE(n.length,28);
 const prefix=Buffer.concat([h,n,data,Buffer.alloc(padding)]);e.writeUInt32LE(0x06054b50);e.writeUInt16LE(1,8);e.writeUInt16LE(1,10);e.writeUInt32LE(c.length+n.length,12);e.writeUInt32LE(prefix.length,16);return Buffer.concat([prefix,c,n,e]);
}
export function zipParts(parts){
 const locals=[],central=[];let offset=0;
 for(const [name,xml] of parts){const b=zip(xml,{name}),e=b.length-22,p=b.readUInt32LE(e+16),c=Buffer.from(b.subarray(p,e));c.writeUInt32LE(offset,42);locals.push(b.subarray(0,p));central.push(c);offset+=p;}
 const directory=Buffer.concat(central),e=Buffer.alloc(22);e.writeUInt32LE(0x06054b50);e.writeUInt16LE(parts.length,8);e.writeUInt16LE(parts.length,10);e.writeUInt32LE(directory.length,12);e.writeUInt32LE(offset,16);return Buffer.concat([...locals,directory,e]);
}
export const identity=[1,0,0,0,1,0,0,0,1,0,0,0];
function point(m,p){return [0,1,2].map(j=>p[0]*m[j]+p[1]*m[3+j]+p[2]*m[6+j]+m[9+j]);}
function compose(a,b){const c=Array(12).fill(0);for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++)c[i*3+j]+=b[i*3+k]*a[k*3+j];c.splice(9,3,...point(a,b.slice(9)));return c;}
const fail=()=>{throw Error('Malformed 3MF file.');};
export function reference(bytes){
 const b=Buffer.from(bytes);if(b.length>50*1024*1024)throw Error('Import is limited to 50 MB.');let e=-1;for(let p=b.length-22;p>=Math.max(0,b.length-65557);p--)if(b.readUInt32LE(p)===0x06054b50&&p+22+b.readUInt16LE(p+20)===b.length){e=p;break;}if(e<0)fail();
 let p=b.readUInt32LE(e+16),parts=[];try{for(let i=0;i<b.readUInt16LE(e+10);i++){if(b.readUInt32LE(p)!==0x02014b50)fail();const name=b.subarray(p+46,p+46+b.readUInt16LE(p+28)).toString(),size=b.readUInt32LE(p+24),packed=b.readUInt32LE(p+20),q=b.readUInt32LE(p+42),off=q+30+b.readUInt16LE(q+26)+b.readUInt16LE(q+28);if(name.endsWith('.model')){if(size>256*1024*1024||off+packed>b.length)fail();const data=b.subarray(off,off+packed),xml=b.readUInt16LE(p+10)===0?data:inflateRawSync(data,{maxOutputLength:256*1024*1024});if(xml.length!==size)fail();parts.push([name,xml.toString()]);}p+=46+b.readUInt16LE(p+28)+b.readUInt16LE(p+30)+b.readUInt16LE(p+32);}}catch{fail()}
 if(!parts.some(([n])=>n==='3D/3dmodel.model'))throw Error('No mesh in 3MF file.');const vertices=[],triangles=[];let ignored=false;
 const attr=s=>Object.fromEntries([...s.matchAll(/([\w:]+)\s*=\s*["']([^"']*)["']/g)].map(x=>[x[1],x[2]]));
 const num=s=>{if(s===undefined||s.trim()===''||!Number.isFinite(Number(s)))fail();return Number(s);};const idx=s=>{if(!/^\d+$/.test(s??''))fail();return Number(s);};
 const mat=a=>{if(!a.transform)return identity;const m=a.transform.trim().split(/\s+/).map(num);if(m.length!==12)fail();return m;};
 const scenes=new Map();for(const [part,xml]of parts){const model=/<model\b([^>]*)>/.exec(xml);if(!model)fail();const unit=({micron:.001,millimeter:1,centimeter:10,inch:25.4,foot:304.8,meter:1000})[attr(model[1]).unit||'millimeter'];if(!unit)fail();ignored||=/(?:basematerials|colorgroup|beam|slice|\bpid=|\bp[123]=)/.test(xml);
 const objects=new Map();for(const m of xml.matchAll(/<object\b([^>]*)>([\s\S]*?)<\/object>/g)){const a=attr(m[1]),v=[...m[2].matchAll(/<vertex\b([^>]*)\/>/g)].map(x=>{const a=attr(x[1]);return ['x','y','z'].map(k=>num(a[k]));}),t=[...m[2].matchAll(/<triangle\b([^>]*)\/>/g)].map(x=>{const a=attr(x[1]);return ['v1','v2','v3'].map(k=>idx(a[k]));}),c=[...m[2].matchAll(/<component\b([^>]*)\/>/g)].map(x=>attr(x[1]));if(t.length>1e6)throw Error('STL exceeds 1 million triangles.');if(t.flat().some(i=>i>=v.length))fail();objects.set(idx(a.id),{v,t,c});}
 const build=/<build\b[^>]*>([\s\S]*?)<\/build>/.exec(xml);scenes.set(part,{objects,unit,build:build?.[1]||''});}
 const root=scenes.get('3D/3dmodel.model');
 const walk=(part,id,m,depth=0)=>{if(depth>=64)fail();const scene=scenes.get(part),o=scene?.objects.get(id);if(!o)fail();if(triangles.length+o.t.length*3>3e6)throw Error('STL exceeds 1 million triangles.');for(const t of o.t)for(const i of t){vertices.push(...point(m,o.v[i]).map(x=>Math.fround(x*root.unit)));triangles.push(triangles.length);}for(const c of o.c)walk((Object.entries(c).find(([k])=>k.endsWith(':path'))?.[1]||part).replace(/^\//,''),idx(c.objectid),compose(m,mat(c)),depth+1);};
 for(const m of root.build.matchAll(/<item\b([^>]*)\/>/g)){const a=attr(m[1]);walk('3D/3dmodel.model',idx(a.objectid),mat(a));}

 if(!triangles.length)throw Error('No mesh in 3MF file.');return {vertices:new Float32Array(vertices),triangles:new Uint32Array(triangles),ignored};
}
export function model(vertices,triangles,{unit='millimeter',extra='',objects='',build='<item objectid="1"/>'}={}){return `<?xml version="1.0"?><model unit="${unit}" xmlns="http://schemas.microsoft.com/3dmanufacturing/core/2015/02"><resources>${extra}<object id="1" type="model"><mesh><vertices>${Array.from({length:vertices.length/3},(_,i)=>`<vertex x="${vertices[i*3]}" y="${vertices[i*3+1]}" z="${vertices[i*3+2]}"/>`).join('')}</vertices><triangles>${Array.from({length:triangles.length/3},(_,i)=>`<triangle v1="${triangles[i*3]}" v2="${triangles[i*3+1]}" v3="${triangles[i*3+2]}"/>`).join('')}</triangles></mesh></object>${objects}</resources><build>${build}</build></model>`;}
