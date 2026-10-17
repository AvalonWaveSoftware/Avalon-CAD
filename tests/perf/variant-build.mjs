// Builds a flag variant of the app in a scratch tree (gitignored tests/perf/.variant-<name>/): web/ with perf-flags.mjs
// edited, build-web.mjs run there, and the desktop app staged, so off/on builds can be measured side by side.
import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
export const ROOT=fileURLToPath(new URL('../../',import.meta.url));
export async function buildVariant(name,edit){const dir=path.join(ROOT,'tests/perf/.variant-'+name);fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(path.join(dir,'app/assets'),{recursive:true});
 for(const d of ['web','desktop'])fs.cpSync(path.join(ROOT,d),path.join(dir,d),{recursive:true});
 for(const f of ['build-web.mjs','package.json','THIRD_PARTY_NOTICES.txt'])fs.copyFileSync(path.join(ROOT,f),path.join(dir,f));
 for(const d of ['node_modules','licenses','engine'])fs.symlinkSync(path.join(ROOT,d),path.join(dir,d));
 fs.mkdirSync(path.join(dir,'tools'));fs.copyFileSync(path.join(ROOT,'tools/main-js-size.json'),path.join(dir,'tools/main-js-size.json'));
 fs.mkdirSync(path.join(dir,'tests'));fs.copyFileSync(path.join(ROOT,'tests/desktop-harness.cjs'),path.join(dir,'tests/desktop-harness.cjs'));
 fs.copyFileSync(path.join(ROOT,'app/assets/mesh-core.wasm'),path.join(dir,'app/assets/mesh-core.wasm'));
 const flags=path.join(dir,'web/perf-flags.mjs');fs.writeFileSync(flags,edit(fs.readFileSync(flags,'utf8')));
 execFileSync(process.execPath,['build-web.mjs'],{cwd:dir,stdio:'ignore'});
 const {stageDesktop}=await import(path.join(ROOT,'desktop/stage.mjs'));stageDesktop(dir);return dir;}
export const removeVariant=dir=>fs.rmSync(dir,{recursive:true,force:true});
