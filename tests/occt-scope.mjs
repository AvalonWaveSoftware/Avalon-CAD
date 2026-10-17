// WS1 (ADR v2): OCCT disposal scope. The scoped topology extractor must produce byte-identical topology to the
// legacy one, and withScope must delete every owned object exactly once, also on the throw path.
import assert from 'node:assert/strict';import fs from 'node:fs';
import {initKernel} from '../web/kernel.mjs';import {topologyVariant,heapBytes,setGlyphFastPath} from '../web/cad-solid.mjs';
import {withScope} from '../web/occt-scope.mjs';import {object,defaults} from '../web/templates.mjs';import {withRoundover} from '../web/operations.mjs';
import {migrateProject} from '../web/migrate.mjs';
// withScope semantics
{const log=[];const mk=n=>({delete(){log.push(n);}});
 assert.equal(withScope(own=>{const a=own(mk('a'));own(a);own.all([mk('b'),mk('c')]);own(null);return 7;}),7);assert.deepEqual(log,['c','b','a']);
 log.length=0;assert.throws(()=>withScope(own=>{own(mk('x'));own({delete(){throw Error('boom');}});own(mk('y'));throw Error('fail');}),/fail/);assert.deepEqual(log,['y','x']);}
// Amendment A2's table paths (torus pick mesh, glyph face data) are compared with full OCCT in glyph-topology-parity.mjs;
// here both sides take the OCCT path so only disposal scoping differs.
await initKernel();setGlyphFastPath(false);assert.ok(heapBytes()>0,'heapBytes() reports the OCCT heap');
// faceId is an OCCT hashCode (allocation-dependent; it differs between two legacy runs too), so it is not compared.
const enc=v=>JSON.stringify(v,(k,x)=>k==="faceId"?undefined:ArrayBuffer.isView(x)?{t:x.constructor.name,b:Buffer.from(x.buffer,x.byteOffset,x.byteLength).toString('base64')}:x);
const outcome=(o,scoped)=>{try{return enc(topologyVariant(o,scoped));}catch(e){return 'throws:'+e.message;}};
const cases=[];
for(const [t,p] of Object.entries(defaults))cases.push([t,object(t,structuredClone(p))]);
cases.push(['filleted box',withRoundover(object('box',{...defaults.box}),[0,1,2,3],2)]);
cases.push(['12-edge filleted box',withRoundover(object('box',{w:120,d:80,h:30}),[0,1,2,3,4,5,6,7,8,9,10,11],6)]);
cases.push(['faceted cylinder',{...object('cylinder',{...defaults.cylinder}),resolution:{mode:'faces',count:12}}]);
const walk=(list,file)=>{for(const o of list||[]){cases.push([file+':'+(o.name||o.type),o]);walk(o.params?.children,file);}};
for(const f of fs.readdirSync('tests/fixtures').filter(f=>f.endsWith('.tcad'))){try{walk(migrateProject(JSON.parse(fs.readFileSync('tests/fixtures/'+f,'utf8')),[]).objects,f);}catch{}}
assert.ok(cases.some(([n,o])=>o.type==='joined')&&cases.some(([n,o])=>o.type==='prefab'),'joined and prefab are covered');
let compared=0;for(const [name,o] of cases){if(o.type==='mesh'||String(o.type).startsWith('thread'))continue;assert.equal(outcome(o,true),outcome(o,false),'topology differs: '+name);compared++;}
console.log(`occt-scope: withScope ok; ${compared} objects have byte-identical scoped/legacy topology`);
