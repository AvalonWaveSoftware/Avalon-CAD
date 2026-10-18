// desktop/build-rpm.sh's ASSETS check must list every asset desktop/stage.mjs requires (worker-sidecar.js was missing in 3.0).
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { REQUIRED_ASSETS } from '../desktop/stage.mjs';
const sh = fs.readFileSync(new URL('../desktop/build-rpm.sh', import.meta.url), 'utf8');
const m = sh.match(/^ASSETS="([^"]+)"/m);
assert.ok(m, 'ASSETS line not found in desktop/build-rpm.sh');
const listed = new Set(m[1].split(/\s+/));
const missing = REQUIRED_ASSETS.filter(f => !listed.has(f));
assert.deepEqual(missing, [], `build-rpm.sh ASSETS is missing: ${missing.join(', ')}`);
assert.ok(listed.has('worker-sidecar.js'));
console.log(`rpm-assets: ok (${REQUIRED_ASSETS.length} required assets listed)`);
