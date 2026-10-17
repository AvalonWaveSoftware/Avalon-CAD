// Minimal PNG decoder (8-bit RGB/RGBA, non-interlaced: what Chromium screenshots emit) used by the WS0 pixel gate.
import zlib from 'node:zlib';
export function decodePNG(buf){
 if(buf.readUInt32BE(0)!==0x89504e47)throw Error('not a PNG');
 let o=8,w,h,depth,color,inter;const idat=[];
 while(o<buf.length){const len=buf.readUInt32BE(o),type=buf.toString('latin1',o+4,o+8),d=buf.subarray(o+8,o+8+len);
  if(type==='IHDR'){w=d.readUInt32BE(0);h=d.readUInt32BE(4);depth=d[8];color=d[9];inter=d[12];}
  else if(type==='IDAT')idat.push(d);else if(type==='IEND')break;o+=12+len;}
 if(depth!==8||inter!==0||![2,6].includes(color))throw Error(`unsupported PNG depth=${depth} color=${color} interlace=${inter}`);
 const bpp=color===6?4:3,stride=w*bpp,raw=zlib.inflateSync(Buffer.concat(idat)),out=Buffer.alloc(w*h*4);let prev=Buffer.alloc(stride),p=0;
 for(let y=0;y<h;y++){const f=raw[p++],line=Buffer.from(raw.subarray(p,p+stride));p+=stride;
  for(let x=0;x<stride;x++){const a=x>=bpp?line[x-bpp]:0,b=prev[x],c=x>=bpp?prev[x-bpp]:0;let v=line[x];
   if(f===1)v+=a;else if(f===2)v+=b;else if(f===3)v+=(a+b)>>1;else if(f===4){const pa=Math.abs(b-c),pb=Math.abs(a-c),pc=Math.abs(a+b-2*c);v+=pa<=pb&&pa<=pc?a:pb<=pc?b:c;}
   line[x]=v&255;}
  for(let x=0;x<w;x++){const i=(y*w+x)*4,s=x*bpp;out[i]=line[s];out[i+1]=line[s+1];out[i+2]=line[s+2];out[i+3]=bpp===4?line[s+3]:255;}prev=line;}
 return {width:w,height:h,data:out};
}
// Number of pixels whose RGBA differs. Different sizes count every pixel as differing.
export function diffPixels(a,b){const A=decodePNG(a),B=decodePNG(b);if(A.width!==B.width||A.height!==B.height)return {differing:Math.max(A.width*A.height,B.width*B.height),sizeMismatch:true};
 let n=0;for(let i=0;i<A.data.length;i+=4)if(A.data.readUInt32BE(i)!==B.data.readUInt32BE(i))n++;return {differing:n,total:A.width*A.height};}
