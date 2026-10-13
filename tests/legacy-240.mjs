// Loads the unmodified AvalonCad 2.4.0 sources (git commit 6fbebb7) so tests can build real
// v1 Subtract results and render them with the 2.4.0 kernel for byte-level comparison.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
export const LEGACY_COMMIT='6fbebb7';
export async function legacy(){
 const dir=path.resolve('build/legacy-240');
 if(!fs.existsSync(path.join(dir,'web/kernel.mjs'))){fs.mkdirSync(dir,{recursive:true});const tar=execFileSync('git',['archive',LEGACY_COMMIT,'web']);execFileSync('tar',['-x','-C',dir],{input:tar});}
 const url=f=>new URL('file://'+path.join(dir,'web',f)).href;
 const [kernel,operations,model,templates,prefabs]=await Promise.all(['kernel.mjs','operations.mjs','boolean-model.mjs','templates.mjs','prefabs.mjs'].map(f=>import(url(f))));
 return {kernel,operations,model,templates,prefabs};
}
