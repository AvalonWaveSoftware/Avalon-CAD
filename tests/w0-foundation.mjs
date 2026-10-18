// ADR-0001 W0: command registry and unit-helper stubs (UI-safe, no engine imports, no shortcuts before F1a).
import assert from 'node:assert/strict';import fs from 'node:fs';
import {createCommands,COMMAND_IDS} from '../web/commands.mjs';import {fmtLen,parseLen,unitLabel,stepOptions,UNITS} from '../web/units.mjs';
// Every command the Electron menu sends through the action() bridge has a registry id (F1a: the bridge runs the
// registry; the menu's view:iso is the registry's view:3d).
const cjs=fs.readFileSync('desktop/main.cjs','utf8'),bridge=[...cjs.matchAll(/invoke\('([^']+)'\)/g)].map(m=>m[1]).concat(['view:iso','view:top','view:front','view:right']).map(id=>id==='view:iso'?'view:3d':id);
assert.ok(bridge.length>=12);for(const id of bridge)assert.ok(COMMAND_IDS.includes(id),'registry has '+id);
assert.equal(new Set(COMMAND_IDS).size,COMMAND_IDS.length,'unique ids');
let ran=0;const c=createCommands({fit:{run:()=>++ran}});
for(const cmd of c.list){assert.deepEqual(Object.keys(cmd),['id','label','shortcut','tooltip','run','enabled']);assert.ok(cmd.shortcut===null||cmd.shortcut.length&&cmd.shortcut.every(k=>typeof k==='string'),'F1a: null or combos (tests/shortcuts.mjs pins the table)');assert.ok(cmd.label.length);}
assert.equal(c.run('fit'),1);assert.equal(c.run('undo'),false,'no handler, never runs');assert.equal(c.get('mode:round').label,'Round');
assert.deepEqual(UNITS,['mm','in'],'F1c adds in (display only; tests/units.mjs)');assert.equal(unitLabel(),'mm');assert.equal(fmtLen(12.345),'12.3');assert.equal(fmtLen(5,2),'5.00');assert.equal(parseLen(' 4.5 '),4.5);assert.ok(Number.isNaN(parseLen('x')));assert.deepEqual(stepOptions(),{input:0.1,drag:[0,0.1,1]});
for(const f of ['web/commands.mjs','web/units.mjs'])assert.ok(!/^import/m.test(fs.readFileSync(f,'utf8')),f+' imports nothing');
console.log('PASS: W0 registry ('+COMMAND_IDS.length+' commands) and unit helpers');
