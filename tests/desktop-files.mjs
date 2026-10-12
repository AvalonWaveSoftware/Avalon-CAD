import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {MAX_BYTES,exportPayload,readModel,writeModel}=require('../desktop/files.cjs');
const root=await fs.mkdtemp(path.join(os.tmpdir(),'avalon-file-test-'));
try {
 const original=new Uint8Array([99,1,2,3,99]),payload=exportPayload({name:'model.stl',bytes:original.subarray(1,4)});
 assert.deepEqual([...payload.bytes],[1,2,3]);
 for(const name of ['../model.stl','a/b.stl','a\\b.stl','model.exe','model\0.stl'])assert.throws(()=>exportPayload({name,bytes:original}));
 assert.throws(()=>exportPayload({name:'model.stl',bytes:'not bytes'}));
 assert.throws(()=>exportPayload({name:'model.stl',bytes:new Uint8Array(MAX_BYTES+1)}),/50 MB/);
 const file=path.join(root,'model.stl');await writeModel(file,payload.bytes);const opened=await readModel(file);assert.equal(opened.name,'model.stl');assert.deepEqual([...opened.bytes],[1,2,3]);
 await writeModel(file,Buffer.from('new complete file'));assert.equal((await fs.readFile(file)).toString(),'new complete file');assert.deepEqual(await fs.readdir(root),['model.stl']);
 const project=path.join(root,'phone.tcad');const data=Buffer.from(JSON.stringify({format:'tristancad',version:1,name:'Phone project',objects:[]}));await writeModel(project,data);assert.deepEqual(Buffer.from((await readModel(project)).bytes),data);
 const large=path.join(root,'oversized.stl');await fs.writeFile(large,'');await fs.truncate(large,MAX_BYTES+1);await assert.rejects(readModel(large),/50 MB/);
 await assert.rejects(readModel(path.join(root,'text.txt')),/STL/);
 console.log('PASS: native file payload validation, typed-array offsets, bounded imports, exact STL/project byte transport, atomic replacement and clean temporary files.');
}finally{await fs.rm(root,{recursive:true,force:true});}
