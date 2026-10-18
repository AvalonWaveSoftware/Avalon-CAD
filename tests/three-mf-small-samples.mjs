// ADR-0001 F2a, Architect ruling 3: the small 3MF samples whose size is held to <= 1.02x the c60c94c encoder's output:
// the 2 small QA samples (multi-object, letter tile) and the regression projects of tests/export-3mf.mjs (fixtures,
// templates, below-Z=0, threads, torus+prism), grounded. `meshes(engine)` returns the exact records the format '3mf'
// export encodes (captured from the engine's write3MF call).
import fs from 'node:fs';
import {migrateProject} from '../web/migrate.mjs';import {object,defaults,glyphDefaults,blank,plate,tray} from '../web/templates.mjs';
import {prepareGlyphs} from '../web/glyph-geometry.mjs';
const P=(name,objs)=>({...blank(),name,objects:objs});
export function projects(){
 const fixtures=fs.readdirSync('tests/fixtures').filter(f=>f.endsWith('.tcad')&&f!=='over-limit.tcad').sort().map(f=>[f,migrateProject(JSON.parse(fs.readFileSync('tests/fixtures/'+f,'utf8')),[])]);
 return [
  ['qa:multi-object',P('Multi-object',[object('box',structuredClone(defaults.box),[-40,0,7.5]),object('cylinder',structuredClone(defaults.cylinder),[0,0,10]),object('sphere',structuredClone(defaults.sphere),[40,0,12.5])])],
  ['qa:letter-tile',P('Letter tile',[object('rounded',{w:30,d:30,h:4,r:3},[0,0,2],'Tile'),object('glyph',{...structuredClone(glyphDefaults.glyph),depth:3},[0,0,5],'A')])],
  ...fixtures,['plate',plate()],['tray',tray()],
  ['box+sphere (below Z=0)',P('b',[object('box',structuredClone(defaults.box),[0,0,-3]),object('sphere',structuredClone(defaults.sphere),[30,0,0])])],
  ['thread rod + tube',P('t',[object('threadrod',structuredClone(defaults.threadrod),[0,0,0]),object('threadtube',structuredClone(defaults.threadtube),[40,0,0])])],
  ['torus+prism',P('p',[object('torus',structuredClone(defaults.torus),[0,0,0]),object('triprism',structuredClone(defaults.triprism),[0,40,0])])],
 ].filter(([,p])=>p.objects.some(o=>o.enabled!==false));
}
export async function meshes(engine){
 const out=[],write3MF=engine.rust.write3MF;let seen=null,id=0;
 engine.rust.write3MF=(v,t,g)=>{seen={vertices:v.slice(),triangles:t.slice()};return write3MF(v,t,g);};
 try{for(const [name,project] of projects()){await prepareGlyphs({type:'export',project});seen=null;
  const r=engine.process({type:'export',id:++id,project:structuredClone(project),tolerance:.03,ground:true,format:'3mf'});if(r.error||!seen)continue;out.push({name,...seen});}}
 finally{engine.rust.write3MF=write3MF;}
 return out;
}
