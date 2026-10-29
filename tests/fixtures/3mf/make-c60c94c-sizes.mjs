// Records tests/fixtures/3mf/c60c94c-sizes.json: the 3MF size and sha256 the c60c94c encoder (its mesh-core.wasm and
// rust-mesh.mjs, taken from git) gives for each small sample mesh of tests/three-mf-small-samples.mjs, as exported by
// the current geometry engine. Re-run only when the sample meshes themselves change:
//   node tests/fixtures/3mf/make-c60c94c-sizes.mjs
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';
import {initKernel} from '../../../web/kernel.mjs';import {initLocalEngine} from '../../../web/local-engine.mjs';import {meshes} from '../../three-mf-small-samples.mjs';
const C='c60c94c',dir=fs.mkdtempSync(path.join(os.tmpdir(),'c60c94c-'));
const git=f=>execFileSync('git',['show',`${C}:${f}`]);
fs.writeFileSync(path.join(dir,'rust-mesh.mjs'),git('web/rust-mesh.mjs'));
const old=await (await import(path.join(dir,'rust-mesh.mjs'))).initRustMesh({binary:git('app/assets/mesh-core.wasm')});
const K=await initKernel(),engine=await initLocalEngine(K,{rust:{binary:fs.readFileSync('app/assets/mesh-core.wasm')}});
const rows=[];for(const m of await meshes(engine)){const b=Buffer.from(old.write3MF(m.vertices,m.triangles,true));rows.push({name:m.name,triangles:m.triangles.length/3,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')});}
fs.writeFileSync('tests/fixtures/3mf/c60c94c-sizes.json',JSON.stringify({encoder:C,note:'3MF output of the c60c94c encoder for the small samples (grounded); Architect ruling 3 holds the current output to <= 1.02x these sizes.',samples:rows},null,1)+'\n');
console.log(rows.length,'samples recorded');fs.rmSync(dir,{recursive:true});process.exit(0);
