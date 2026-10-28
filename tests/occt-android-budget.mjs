import assert from 'node:assert/strict';
import fs from 'node:fs';import {gzipSync} from 'node:zlib';
import {workerSizes} from './worker-budget.mjs';
const sizes=await workerSizes(process.cwd()),ref=JSON.parse(fs.readFileSync('tools/worker-budget.json','utf8'));
let growth=0;for(const [name,s] of Object.entries(sizes)){if(name==='chunks')continue;growth+=s.gz-ref[name].gz;console.log(name,s.raw,'B',s.gz,'B gzip; base',ref[name].gz);assert.equal(fs.statSync('app/assets/'+name).size,s.raw);}
const android=gzipSync(fs.readFileSync('app/assets/worker-android.js'),{level:9}).length;
assert.ok(growth+android<=ref.budget,`shared growth ${growth} + Android adapter ${android} = ${growth+android} B gz > ${ref.budget}`);assert.ok(fs.statSync('app/assets/main.js').size<=757760);
console.log('PASS: shared growth',growth+android,'of',ref.budget+'; Android adapter',android,'B gzip');
