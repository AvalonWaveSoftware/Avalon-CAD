// ADR-0001 F1c core (§4 F1c precision rule, §5.2 F1c): display-only inch unit helpers. mm default on every platform;
// inches shown to 3 decimals; 1.000 in → 25.4 mm exactly; 100 × Apply with no edits keeps stored values bit-identical.
import assert from 'node:assert/strict';import fs from 'node:fs';
import * as U from '../web/units.mjs';
const store=(init={})=>{const m=new Map(Object.entries(init));return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>m.set(k,String(v)),m};};
// Default and unknown values are mm (no platform-specific default); a throwing storage is mm too.
assert.equal(U.getUnit(),'mm');assert.equal(U.loadUnit(store()),'mm');for(const v of ['','inch','IN','cm','null'])assert.equal(U.loadUnit(store({[U.UNIT_KEY]:v})),'mm',v);
assert.equal(U.loadUnit({getItem(){throw Error('denied');}}),'mm');assert.equal(U.loadUnit(undefined),'mm');
// mm output is exactly the W0 stub's for every value and digit count.
const W0={fmtLen:(mm,d=1)=>Number(mm).toFixed(d),parseLen:t=>{const v=Number(String(t).trim());return Number.isFinite(v)?v:NaN;}};
const values=[0,0.05,0.1,1,2.5,12.345,25.4,50.8,99.999,-3.25,1000,1e-9,1/3];
for(const v of values)for(const d of [0,1,2,3])assert.equal(U.fmtLen(v,d),W0.fmtLen(v,d));for(const t of ['4.5',' 4.5 ','x','','1e3','-2'])assert.ok(Object.is(U.parseLen(t),W0.parseLen(t)),t);
assert.equal(U.unitLabel(),'mm');assert.deepEqual(U.stepOptions(),{input:0.1,drag:0.1});
// Inches.
const s=store();assert.equal(U.setUnit('in',s),'in');assert.equal(s.m.get('tristancad.units'),'in');assert.equal(U.unitLabel(),'in');
assert.equal(U.fmtLen(25.4),'1.000');assert.equal(U.fmtLen(50.8,1),'2.000','inches always 3 decimals');assert.equal(U.fmtLen(1),'0.039');
assert.equal(U.parseLen('1.000'),25.4,'1.000 in → 25.4 mm exactly');assert.equal(U.parseLen('2'),50.8);assert.equal(U.parseLen(' 0.5 '),12.7);assert.ok(Number.isNaN(U.parseLen('1/2')),'fractions are an open question');
for(let i=1;i<=1000;i++)assert.equal(U.parseLen(String(i)),i*25.4);
// Apply rule: an unedited field keeps its stored mm, bit for bit, through 100 Apply rounds; an edited field parses.
const stored=[12.345678,0.1,7.77,100/3,25.4,0.0004];let cur=[...stored];
for(let round=0;round<100;round++){const shown=cur.map(v=>U.fmtLen(v));cur=cur.map((v,i)=>U.readLen(shown[i],shown[i],v));}
for(let i=0;i<stored.length;i++)assert.ok(Object.is(cur[i],stored[i]),'no drift '+stored[i]);
// Without the rule the same loop drifts: that is why readLen exists.
{let v=12.345678;for(let r=0;r<2;r++)v=U.parseLen(U.fmtLen(v));assert.notEqual(v,12.345678);}
assert.equal(U.readLen('2.000','1.000',25.4),50.8);assert.equal(U.readLen(' 1.000','1.000 ',25.4),25.4);
assert.throws(()=>U.setUnit('cm',s),RangeError);assert.equal(U.getUnit(),'in');
U.setUnit('mm',s);assert.equal(U.fmtLen(12.345),'12.3');assert.equal(U.loadUnit(s),'mm');
// Not wired yet: nothing in the app reads the preference, so every platform still shows mm.
for(const f of fs.readdirSync('web').filter(f=>f.endsWith('.mjs')&&f!=='units.mjs'))assert.ok(!/loadUnit|setUnit/.test(fs.readFileSync('web/'+f,'utf8')),f+' does not switch units yet');
assert.ok(!/^import/m.test(fs.readFileSync('web/units.mjs','utf8')));
console.log('PASS: units: mm default (unknown/throwing storage too), mm output identical to W0, inches 3 decimals, 1.000 in = 25.4 mm exactly, 100× Apply without edits bit-identical');
