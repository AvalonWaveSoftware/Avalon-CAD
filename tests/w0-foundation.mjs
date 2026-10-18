// ADR-0001 W0: command registry and unit-helper stubs (UI-safe, no engine imports, no shortcuts before F1a).
import assert from 'node:assert/strict';import fs from 'node:fs';
import {createCommands,COMMAND_IDS} from '../web/commands.mjs';import {fmtLen,parseLen,unitLabel,stepOptions,UNITS} from '../web/units.mjs';
// Every command the Electron action() bridge handles today has a registry id.
const main=fs.readFileSync('web/main.mjs','utf8'),bridge=main.match(/const id=\{([^}]*)\}\[command\]/)[1].match(/(\w+):/g).map(s=>s.slice(0,-1));
for(const id of [...bridge,'open','save','backup','new','view:3d','view:top','view:front','view:right'])assert.ok(COMMAND_IDS.includes(id),'registry has '+id);
assert.equal(new Set(COMMAND_IDS).size,COMMAND_IDS.length,'unique ids');
let ran=0;const c=createCommands({fit:{run:()=>++ran}});
for(const cmd of c.list){assert.deepEqual(Object.keys(cmd),['id','label','shortcut','tooltip','run','enabled']);assert.equal(cmd.shortcut,null,'no shortcut before F1a (ruling 6)');assert.ok(cmd.label.length);}
assert.equal(c.run('fit'),1);assert.equal(c.run('undo'),false,'no handler, never runs');assert.equal(c.get('mode:round').label,'Round');
assert.deepEqual(UNITS,['mm']);assert.equal(unitLabel(),'mm');assert.equal(fmtLen(12.345),'12.3');assert.equal(fmtLen(5,2),'5.00');assert.equal(parseLen(' 4.5 '),4.5);assert.ok(Number.isNaN(parseLen('x')));assert.deepEqual(stepOptions(),{input:0.1,drag:0.1});
for(const f of ['web/commands.mjs','web/units.mjs'])assert.ok(!/^import/m.test(fs.readFileSync(f,'utf8')),f+' imports nothing');
console.log('PASS: W0 registry ('+COMMAND_IDS.length+' commands, no shortcuts) and mm-only unit helpers');
