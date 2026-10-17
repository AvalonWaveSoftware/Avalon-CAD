// The shipped third-party notices and licenses list Pyodide/CPython exactly when they are shipped (JS_ENGINE=false).
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JS_ENGINE} from '../web/perf-flags.mjs';
const shipped=fs.readFileSync('app/assets/THIRD_PARTY_NOTICES.txt','utf8'),repo=fs.readFileSync('THIRD_PARTY_NOTICES.txt','utf8');
const python=fs.existsSync('app/assets/python');assert.equal(python,!JS_ENGINE,'app/assets/python shipped iff JS_ENGINE is off');
for(const name of ['Pyodide','CPython 3.13.2'])assert.equal(shipped.includes(name),!JS_ENGINE,name+' in shipped notices');
for(const f of ['Pyodide-MPL-2.0.txt','Python-3.13.2-License.txt'])assert.equal(fs.existsSync('app/assets/licenses/'+f),!JS_ENGINE,f);
for(const name of ['manifold','Rust 1.90.0','Emscripten'])assert.ok(shipped.includes(name),name);
assert.ok(repo.includes('Pyodide 0.29.3'),'repo notices keep Pyodide for the JS_ENGINE=false build');
if(!JS_ENGINE)assert.equal(shipped,repo);
console.log('Notices: Pyodide/CPython',JS_ENGINE?'omitted (JS_ENGINE on)':'listed (JS_ENGINE off)');
