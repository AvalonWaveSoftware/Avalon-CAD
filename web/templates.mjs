import {DEFAULT_LAYER} from './layers.mjs';
let next=0;
export const uid=()=>Date.now().toString(36)+'-'+(++next).toString(36)+'-'+Math.random().toString(36).slice(2,7);
export function object(type,params,position=[0,0,0],name) {return {id:uid(),name:name||type[0].toUpperCase()+type.slice(1),type,params,position,rotation:[0,0,0],mode:'solid',enabled:true,layerId:DEFAULT_LAYER};}
export function blank(){return {format:'tristancad',version:2,name:'My model',objects:[],layers:[{id:DEFAULT_LAYER,name:'Layer 1'}],activeLayer:DEFAULT_LAYER};}
export function plate(){const p=blank();p.name='Mounting plate';p.objects=[object('rounded',{w:70,d:40,h:6,r:4},[0,0,3],'Plate')];for(const x of [-25,25])for(const y of [-12,12]){const o=object('cylinder',{diameter:5,h:12},[x,y,3],'5 mm mounting hole');o.mode='cut';p.objects.push(o);}return p;}
export function tray(){const p=blank();p.name='Open tray';p.objects=[object('rounded',{w:100,d:65,h:28,r:5},[0,0,14],'Outer tray'),object('rounded',{w:95,d:60,h:30,r:3},[0,0,19],'Hollow interior')];p.objects[1].mode='cut';return p;}
export const defaults={wedge:{w:40,d:30,h:20},pyramid:{w:30,d:30,h:30},box:{w:30,d:30,h:15},rounded:{w:40,d:30,h:10,r:3},cylinder:{diameter:20,h:20},cone:{diameter:25,top:8,h:25},sphere:{diameter:25},tube:{diameter:25,inner:18,h:20},threadrod:{diameter:6.35,pitch:1.27,h:38.1,clearance:0,phase:0,units:'imperial',hand:'right'},threadtube:{diameter:6.35,pitch:1.27,h:25.4,outer:12.7,clearance:.1524,phase:0,units:'imperial',hand:'right'},torus:{diameter:30,tube:8},triprism:{w:30,d:40,h:26}};
// ADR new-primitives-polyhedra-text: the Advanced shapes sub-sheet (sizes are edge lengths; the d10 is ring diameter
// and apex-to-apex height) and the Letters, numbers & symbols tool. Kept apart from defaults, which is the 12-tile grid.
export const advancedDefaults={tetrahedron:{size:30},octahedron:{size:25},decahedron:{diameter:20,h:36},dodecahedron:{size:11},icosahedron:{size:16}};
export const glyphDefaults={glyph:{char:'A',size:20,depth:5,font:'roboto-bold@1'}};
export const names={wedge:'Inclined plane',pyramid:'Pyramid',prefab:'Prefab',box:'Box',rounded:'Rounded box',cylinder:'Cylinder',cone:'Cone',sphere:'Sphere',tube:'Tube',threadrod:'All-thread screw',threadtube:'Threaded tube',polygon:'Sketch extrusion',mesh:'Imported STL',joined:'Combined solid',torus:'Torus',triprism:'Triangular prism',tetrahedron:'Tetrahedron',octahedron:'Octahedron',decahedron:'Decahedron (d10)',dodecahedron:'Dodecahedron',icosahedron:'Icosahedron',glyph:'Text'};
