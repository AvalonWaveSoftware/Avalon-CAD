import {weldExact} from './worker-stl.mjs';
// F2b: this module is a separate worker bundle; no decoder runs at startup.
// limits-3.0 rev6 (Waydroid QA D1): vertices (v exact, f binary32), and triangle corners (t) are flat number arrays per object, not
// one small array per vertex and per triangle, which took several times the memory of the numbers themselves.
const FILE=50*1024*1024, XML=256*1024*1024, LIMIT=1000000;
const messages=['','Malformed 3MF file.','No mesh in 3MF file.','STL exceeds 1 million triangles.','Import is limited to 50 MB.','Invalid imported mesh.','The model exceeds available geometry memory.'];
function fail(code=1){const e=Error(messages[code]);e.code=code;throw e;}
const utf8=new TextDecoder('utf-8',{fatal:true,ignoreBOM:true});
const trim=s=>s.replace(/^[\t-\r ]+|[\t-\r ]+$/g,'');
const ID=[1,0,0,0,1,0,0,0,1,0,0,0];
const point=(m,p)=>[0,1,2].map(j=>p[0]*m[j]+p[1]*m[3+j]+p[2]*m[6+j]+m[9+j]);
function compose(a,b){const c=Array(12).fill(0);for(let i=0;i<3;i++)for(let j=0;j<3;j++)for(let k=0;k<3;k++)c[i*3+j]+=b[i*3+k]*a[k*3+j];c.splice(9,3,...point(a,b.slice(9)));return c;}
function number(s){if(typeof s!=='string'||! /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(s))fail();const n=Number(s);if(!Number.isFinite(n))fail();return n;}
const fv=new Float32Array(1),uv=new Uint32Array(fv.buffer);
function float(bits){uv[0]=bits;return fv[0];}
// Only a binary64 exactly on a binary32 midpoint can double round. Compare
// the original decimal to that dyadic midpoint using bounded exact integers.
export function coordinate(s){const x=number(s),a=Math.abs(x),f=(fv[0]=Math.fround(a));const bits=uv[0];
 // The rounded value and the neighbor toward a bracket the only possible midpoint.
 const lo=bits-(a<f);
 if(a!==(float(lo)+(lo===0x7f7fffff?2**128:float(lo+1)))/2)return [x,s[0]==='-'?-f:f];
 let [mant,exp='0']=s.replace(/^[+-]/,'').toLowerCase().split('e'),dot=mant.indexOf('.');let digits=mant.replace('.','').replace(/^0+/,'');let d=Number(exp)-(dot<0?0:mant.length-dot-1);
 // 768 significant decimal digits suffice for every f64/f32 boundary. A
 // nonzero discarded tail is strictly above an exact equality (Rust parity).
 const tail=digits.slice(768);if(digits.length>768){d+=digits.length-768;digits=digits.slice(0,768);}
 let left=BigInt(digits),right=BigInt((lo&0x7fffff)+(lo<0x800000?0:0x800000))*2n+1n;
 let e=Math.max(1,lo>>>23)-151;
 if(d>=0)left*=10n**BigInt(d);else right*=10n**BigInt(-d);if(e>=0)right<<=BigInt(e);else left<<=BigInt(-e);
 const up=left>right||(left===right&&(/[1-9]/.test(tail)||(lo&1)!==0));const out=float(lo+(up?1:0));return [x,s[0]==='-'?-out:out];
}
function allocate(Type,n){try{return new Type(n);}catch{fail(6);}}
function integer(s){if(!/^\d+$/.test(s??''))fail();const n=Number(s);if(n>0xffffffff)fail();return n;}
function attrs(s){const a=new Map();s=trim(s);while(s){const eq=s.indexOf('=');if(eq<0)fail();const key=trim(s.slice(0,eq));s=trim(s.slice(eq+1));const q=s[0];if(q!=="'"&&q!=='"')fail();const end=s.indexOf(q,1);if(end<0||a.has(key))fail();a.set(key,s.slice(1,end));s=trim(s.slice(end+1));}return a;}
function transform(a){if(!a.has('transform'))return ID;const words=trim(a.get('transform')).split(/[\t-\r ]+/);if(words.length!==12)fail();return words.map(number);}
function parse(xml){const objects=new Map(),build=[],stack=[];let current=null,unit=1,ignored=false,model=false,pos=0;xml=xml.replace(/^\ufeff+/,'');
 while(true){const start=xml.indexOf('<',pos);if(start<0)break;if(trim(xml.slice(pos,start))&&!stack.includes('metadata'))fail();const comment=xml.startsWith('<!--',start),delim=comment?'-->':'>';const end=xml.indexOf(delim,start+1);if(end<0)fail();let tag=xml.slice(start+1,end);pos=end+delim.length;if(comment||tag.startsWith('?'))continue;if(tag.startsWith('!'))fail();if(tag.startsWith('/')){const name=trim(tag.slice(1));if(stack.pop()!==name)fail();if(name==='object')current=null;continue;}
 const single=tag.endsWith('/');tag=trim(tag.replace(/\/+$/,''));const split=tag.search(/[\t-\r ]/),name=split<0?tag:tag.slice(0,split),a=attrs(split<0?'':tag.slice(split));
 if(name.includes(':')||[...a.keys()].some(k=>k.includes(':')&&!k.startsWith('xmlns')&&!k.endsWith(':path')||['pid','p1','p2','p3'].includes(k)))ignored=true;
 switch(name){case 'model':if(model||stack.length)fail();model=true;unit=({micron:.001,millimeter:1,centimeter:10,inch:25.4,foot:304.8,meter:1000})[a.get('unit')??'millimeter'];if(typeof unit!=='number')fail();break;
 case 'object':{const id=integer(a.get('id'));if(current||objects.has(id))fail();current={v:[],f:[],t:[],c:[]};objects.set(id,current);break;}
 case 'vertex':if(!stack.includes('vertices')||!current)fail();if(current.v.length>=9000000)fail(3);{const xyz=['x','y','z'].map(k=>coordinate(a.get(k)));current.v.push(xyz[0][0],xyz[1][0],xyz[2][0]);current.f.push(xyz[0][1],xyz[1][1],xyz[2][1]);}break;
 case 'triangle':if(!stack.includes('triangles')||!current)fail();if(current.t.length>=LIMIT*3)fail(3);current.t.push(...['v1','v2','v3'].map(k=>integer(a.get(k))));break;
 case 'component':if(!current)fail();current.c.push([integer(a.get('objectid')),transform(a),[...a].find(([k])=>k.endsWith(':path'))?.[1].replace(/^\/+/, '')]);break;
 case 'item':if(!stack.includes('build'))fail();build.push([integer(a.get('objectid')),transform(a)]);break;
 case 'basematerials':case 'colorgroup':case 'color':case 'texture2d':case 'beam':case 'beams':case 'beamlattice':case 'slicestack':case 'slices':case 'slice':case 'compositematerials':case 'multiproperties':ignored=true;
 }
 if(!single){if(stack.length>=64)fail();stack.push(name);}else if(name==='object')current=null;
 }
 if(!model||stack.length||trim(xml.slice(pos)))fail();for(const o of objects.values()){if(o.c.length&&(o.v.length||o.t.length)||o.t.some(i=>i>=o.v.length/3))fail();}return {objects,build,unit,ignored};
}
async function models(b){if(b.length>FILE)fail(4);const view=new DataView(b.buffer,b.byteOffset,b.byteLength);const u16=p=>view.getUint16(p,true),u32=p=>view.getUint32(p,true);let e=-1;for(let p=b.length-22;p>=Math.max(0,b.length-65557);p--)if(u32(p)===0x06054b50&&p+22+u16(p+20)===b.length){e=p;break;}if(e<0)fail();if(u16(e+4)||u16(e+6)||u16(e+8)!==u16(e+10))fail();const end=u32(e+16)+u32(e+12);if(end!==e)fail();let p=u32(e+16),total=0;const out=new Map();
 for(let i=0;i<u16(e+10);i++){if(u32(p)!==0x02014b50)fail();const flags=u16(p+8),method=u16(p+10),packed=u32(p+20),size=u32(p+24),n=u16(p+28);if(packed>FILE||p+46+n>b.length)fail();const name=utf8.decode(b.subarray(p+46,p+46+n));if(name.endsWith('.model')){if(flags&1||size>XML-total)fail();total+=size;const q=u32(p+42);if(u32(q)!==0x04034b50||u16(q+8)!==method)fail();const ln=u16(q+26);if(q+30+ln>b.length||utf8.decode(b.subarray(q+30,q+30+ln))!==name)fail();const off=q+30+ln+u16(q+28);if(off+packed>u32(e+16))fail();const src=b.subarray(off,off+packed);let data;
 if(method===0&&packed===size)data=src;else if(method===8){data=allocate(Uint8Array,size);const reader=new Blob([src]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();let count=0;try{while(true){const {done,value}=await reader.read();if(done)break;if(value.length>size-count){await reader.cancel();fail();}data.set(value,count);count+=value.length;}if(count!==size)fail();}finally{reader.releaseLock();}}else fail();if(out.has(name))fail();out.set(name,parse(utf8.decode(data)));}
 p+=46+n+u16(p+30)+u16(p+32);if(p>end)fail();}if(p!==end)fail();if(!out.has('3D/3dmodel.model'))fail(2);return out;
}
export async function decode3MF(bytes){try{const scenes=await models(bytes),root=scenes.get('3D/3dmodel.model');let count=0,fuel=3000000,vertices,triangles,vi=0,ti=0;
 function walk(part,id,m,depth,write){if(depth>=64||!fuel--)fail();const scene=scenes.get(part),o=scene?.objects.get(id);if(!o)fail();if(!write){count+=o.t.length/3;if(count>LIMIT)fail(3);}else{const exact=root.unit===1&&m.every((x,i)=>x===ID[i]);for(const i of o.t){const p=exact?[o.f[3*i],o.f[3*i+1],o.f[3*i+2]]:point(m,[o.v[3*i],o.v[3*i+1],o.v[3*i+2]]).map(x=>Math.fround(x*root.unit));for(const x of p){if(!Number.isFinite(x))fail();vertices[vi++]=x;}triangles[ti]=ti;ti++;}}
 for(const [child,t,path]of o.c){const target=path??part,next=scenes.get(target);if(!next)fail();const local=t.slice();for(let i=0;i<9;i++)local[i]*=next.unit/scene.unit;walk(target,child,compose(m,local),depth+1,write);}}
 for(const [id,m]of root.build)walk('3D/3dmodel.model',id,m,0,false);if(!count)fail(2);vertices=allocate(Float32Array,count*9);triangles=allocate(Uint32Array,count*3);fuel=3000000;for(const [id,m]of root.build)walk('3D/3dmodel.model',id,m,0,true);return {vertices,triangles,ignored:[...scenes.values()].some(s=>s.ignored)};
 }catch(e){if(Number.isInteger(e.code)&&e.code>=1&&e.code<=6)throw e;fail();}}
export async function import3MF(data,rust){const mesh=await decode3MF(new Uint8Array(data.buffer)),w=weldExact(rust,mesh.vertices,mesh.triangles);if(w.vertices.length>3000000||w.triangles.length>3000000)fail(5);return {id:data.id,...w,ignored:mesh.ignored};}
