export const isThread=o=>['threadrod','threadtube'].includes(o.type);
export const containsThreads=o=>isThread(o)||o.params?.children?.some(containsThreads)||false;
export const threadPresets={metric:[['M3 × 0.5',3,.5],['M4 × 0.7',4,.7],['M5 × 0.8',5,.8],['M6 × 1',6,1],['M8 × 1.25',8,1.25],['M10 × 1.5',10,1.5],['M12 × 1.75',12,1.75],['M16 × 2',16,2],['M20 × 2.5',20,2.5]],imperial:[['#6-32',.138,32],['#8-32',.164,32],['#10-24',.190,24],['#10-32',.190,32],['1/4-20',.25,20],['1/4-28',.25,28],['5/16-18',.3125,18],['3/8-16',.375,16],['3/8-24',.375,24],['1/2-13',.5,13],['1/2-20',.5,20],['1/2-28',.5,28],['5/8-11',.625,11],['5/8-24',.625,24],['3/4-10',.75,10]]};
export function validateThread(o){const p=o.params;
 if(!['metric','imperial'].includes(p.units)||!['right','left'].includes(p.hand))throw Error('Choose metric or imperial units and a thread direction.');
 if(!(p.diameter>=.5&&p.diameter<=500))throw Error('Thread diameter must be from 0.5 to 500 mm.');
 if(!(p.pitch>=.05&&p.pitch<=50))throw Error('Thread pitch must be from 0.05 to 50 mm (0.508–508 TPI).');
 if(!(p.h>=.05&&p.h<=5000))throw Error('Thread length must be from 0.05 to 5,000 mm.');
 if(!(p.clearance>=0&&p.clearance<=2)||!Number.isFinite(p.phase))throw Error('Thread fit clearance must be from 0 to 2 mm.');
 if(p.diameter/2-Math.sqrt(3)*p.pitch*17/48-p.clearance<=.025)throw Error('Pitch or clearance is too large for this thread diameter.');
 if(o.type==='threadtube'&&!(p.outer<=1000&&p.outer>p.diameter+2*p.clearance+.1))throw Error('Outer diameter must leave a wall around the thread and its clearance.');
 if(p.h/p.pitch>500)throw Error('A threaded part supports up to 500 turns. Shorten it or increase the pitch.');
 if(o.scale?.some(v=>Math.abs(v-1)>1e-8))throw Error('Threaded parts keep their pitch. Change length with Stretch and diameter in Edit.');
 if(o.fillets?.some(f=>f.radius>0))throw Error('Threaded surfaces cannot use CAD edge roundovers.');
 if(o.resolution?.mode==='faces')throw Error('Threaded parts use smooth curve resolution; their pitch defines the thread count.');
}
export function parseThreadNumber(value){const s=String(value).trim();
 if(/^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i.test(s))return Number(s);
 const m=s.match(/^([+-]?)(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);if(m&&Number(m[4])!==0)return (Number(m[2]||0)+Number(m[3])/Number(m[4]))*(m[1]==='-'?-1:1);
 throw Error('Enter a number or a fraction such as 1/4 or 1 1/2.');
}
export function threadTopology(mesh,o){
 const ends=mesh.groups,groups=[],faces=[],tube=o.type==='threadtube';
 const add=(start,end,kind,normal,center)=>{if(end===start)return;const index=faces.length;groups.push({start,count:end-start,face:index});faces.push({index,kind,normal,center,edges:[],loops:[]});};
 if(tube)add(0,ends[2],'CYLINDER',[1,0,0],[o.params.outer/2,0,0]);
 add(tube?ends[2]:0,ends[3],'THREAD',[1,0,0],[o.params.diameter/2,0,0]);
 add(ends[3],ends[4],'PLANE',[0,0,-1],[0,0,-o.params.h/2]);add(ends[4],ends[5],'PLANE',[0,0,1],[0,0,o.params.h/2]);
 return {vertices:mesh.vertices,triangles:mesh.triangles,groups,faces,edges:[],faceCount:faces.length,flatFaces:2};
}
