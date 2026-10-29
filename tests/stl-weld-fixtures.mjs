import fs from 'node:fs';
// Exact periodic seam and shared poles: 524,288 triangles, 262,146 vertices.
export function sphereSTL(){
 const lon=512,lat=513,points=[[0,0,50]];
 for(let y=1;y<lat;y++)for(let x=0;x<lon;x++){const a=Math.PI*y/lat,b=2*Math.PI*x/lon;points.push([Math.fround(50*Math.sin(a)*Math.cos(b)),Math.fround(50*Math.sin(a)*Math.sin(b)),Math.fround(50*Math.cos(a))]);}
 const bottom=points.length;points.push([0,0,-50]);
 const b=new ArrayBuffer(84+524288*50),v=new DataView(b);v.setUint32(80,524288,true);let t=0;
 const triangle=(a,c,d)=>{let at=84+t++*50+12;for(const i of [a,c,d])for(const p of points[i]){v.setFloat32(at,p,true);at+=4;}};
 const ring=(y,x)=>1+(y-1)*lon+(x%lon);
 for(let x=0;x<lon;x++){triangle(0,ring(1,x),ring(1,x+1));for(let y=1;y<lat-1;y++){triangle(ring(y,x),ring(y+1,x),ring(y,x+1));triangle(ring(y,x+1),ring(y+1,x),ring(y+1,x+1));}triangle(ring(lat-1,x),bottom,ring(lat-1,x+1));}
 if(t!==524288)throw Error('sphere count');return b;
}
export function tetraSTL(){const source=fs.readFileSync(new URL('./pixels.mjs',import.meta.url),'utf8');const fixture=source.match(/function stl\(\)\{[\s\S]*?return b;\}/);return Uint8Array.from(Function(`${fixture[0]};return stl();`)()).buffer;}
