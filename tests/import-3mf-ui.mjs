// import-3mf r5 (QA): real UI on the phone (412x915, Android stub) and desktop pages, through #importFile.
// 1. A malformed 3MF shows exactly the approved 3MF error, with no 'Local geometry processing could not start:' prefix.
// 2. Content sniffing needs a real zip (end-of-central-directory record + [Content_Types].xml or 3D/*.model entry):
//    a binary STL whose 80-byte header starts with "PK" imports as an STL, and a real 3MF named .stl still imports as 3MF.
import assert from 'node:assert/strict';import * as H from '../tools/readme-shots/harness.mjs';import {zip,model} from './import-3mf-reference.mjs';
const v=[0,0,0,10,0,0,10,10,0,0,10,0,0,0,10,10,0,10,10,10,10,0,10,10],t=[0,2,1,0,3,2,4,5,6,4,6,7,0,1,5,0,5,4,1,2,6,1,6,5,2,3,7,2,7,6,3,0,4,3,4,7];
const stl=Buffer.alloc(84+50*12);stl.write('PK'+'\u0003\u0004 binary STL header that starts like a zip',0,'latin1');stl.writeUInt32LE(12,80);
for(let i=0;i<12;i++)for(let k=0;k<3;k++)for(let j=0;j<3;j++)stl.writeFloatLE(v[t[i*3+k]*3+j],84+i*50+12+k*12+j*4);
const cases=[
 {name:'bad.3mf',bytes:zip(model(v,t).replace('x="0"','x="bad"')),toast:'Import failed: Malformed 3MF file.',error:true},
 {name:'notzip.3mf',bytes:Buffer.from('PK not really a zip'),toast:'Import failed: Malformed 3MF file.',error:true},
 {name:'empty.3mf',bytes:zip('<model/>'),toast:'Import failed: No mesh in 3MF file.',error:true},
 {name:'pk-header.stl',bytes:stl,toast:'Choose placement, then Apply to add the imported STL.',error:false},
 {name:'real-3mf.stl',bytes:zip(model(v,t)),toast:'Choose placement, then Apply to add the imported 3MF.',error:false},
];
const env=await H.start();const out=[];
try{for(const desktop of [false,true]){const page=await H.open(env,{desktop});
 for(const c of cases){
  await page.evaluate(()=>{const t=document.querySelector('#toast');t.hidden=true;t.textContent='';});
  await page.setInputFiles('#importFile',{name:c.name,mimeType:'application/octet-stream',buffer:Buffer.from(c.bytes)});
  const got=await page.waitForFunction(()=>{const t=document.querySelector('#toast');return !t.hidden&&t.textContent?{text:t.textContent,error:t.classList.contains('error')}:null;},null,{timeout:60000}).then(h=>h.jsonValue());
  assert.equal(got.text,c.toast,(desktop?'desktop ':'phone ')+c.name);assert.equal(got.error,c.error,c.name);
  assert.ok(!/could not start/.test(got.text),c.name);
  out.push(`${desktop?'desktop':'phone'} ${c.name}: ${got.text}`);
 }
 await page.context().close();}}
finally{await env.close();}
console.log('PASS: import-3mf-ui exact messages and zip sniff: '+out.join('; '));
