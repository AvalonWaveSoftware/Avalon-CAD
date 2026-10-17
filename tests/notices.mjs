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
// ADR new-primitives-polyhedra-text: the Roboto Bold outline data ships with its OFL 1.1 licence and notice.
for(const text of [repo,shipped])for(const s of ['Roboto Bold outline data (SIL Open Font License 1.1','Copyright 2011 The Roboto Project Authors','licenses/Roboto-OFL-1.1.txt'])assert.ok(text.includes(s),s);
assert.ok(fs.readFileSync('app/assets/licenses/Roboto-OFL-1.1.txt').equals(fs.readFileSync('licenses/Roboto-OFL-1.1.txt')),'Roboto OFL shipped verbatim');
assert.match(fs.readFileSync('licenses/Roboto-OFL-1.1.txt','utf8'),/SIL OPEN FONT LICENSE Version 1\.1/);
for(const f of ['web/glyphs.mjs','web/glyph-metrics.mjs'])assert.match(fs.readFileSync(f,'utf8'),/SIL Open Font License, Version 1\.1[\s\S]*licenses\/Roboto-OFL-1\.1\.txt/,f);
console.log('Notices: Pyodide/CPython',JS_ENGINE?'omitted (JS_ENGINE on)':'listed (JS_ENGINE off)','· Roboto OFL 1.1 listed and shipped');
