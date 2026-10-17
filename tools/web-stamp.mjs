// QA fix (WS13 follow-up): records what `node build-web.mjs` built from, so packaging with --skip-web can refuse stale
// app/assets. The stamp lives in build/web-stamp.json (not in app/assets, so nothing extra ships).
//   node tools/web-stamp.mjs write   (build-web.mjs calls this after a successful build)
//   node tools/web-stamp.mjs check   (exit 1 with the reason when app/assets is not the build of the current sources)
// Inputs: web/, engine/python/, licenses/, build-web.mjs, package-lock.json, THIRD_PARTY_NOTICES.txt. Outputs: every
// file in app/assets. Content hashes, not mtimes (a git checkout resets mtimes).
import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),STAMP=path.join(ROOT,'build','web-stamp.json');
const walk=d=>!fs.existsSync(d)?[]:fs.statSync(d).isFile()?[d]:fs.readdirSync(d).sort().flatMap(n=>n==='__pycache__'?[]:walk(path.join(d,n)));
const digest=list=>{const h=createHash('sha256');for(const f of list){h.update(path.relative(ROOT,f)+'\0');h.update(fs.readFileSync(f));h.update('\0');}return h.digest('hex');};
export const inputs=()=>digest(['web','engine/python','licenses','build-web.mjs','package-lock.json','THIRD_PARTY_NOTICES.txt'].flatMap(p=>walk(path.join(ROOT,p))));
export const outputs=()=>digest(walk(path.join(ROOT,'app','assets')));
const mode=process.argv[2];
if(mode==='write'){fs.mkdirSync(path.dirname(STAMP),{recursive:true});fs.writeFileSync(STAMP,JSON.stringify({inputs:inputs(),outputs:outputs(),builtAt:new Date().toISOString()},null,1)+'\n');}
else if(mode==='check'){
 if(!fs.existsSync(STAMP)){console.error('app/assets has no build stamp (build/web-stamp.json): run npm run build:web.');process.exit(1);}
 const s=JSON.parse(fs.readFileSync(STAMP,'utf8')),why=[];
 if(s.inputs!==inputs())why.push('the sources (web/, engine/python/, licenses/, build-web.mjs, package-lock.json or notices) changed since the last build:web ('+s.builtAt+')');
 if(s.outputs!==outputs())why.push('app/assets was modified after the last build:web');
 if(why.length){console.error('STALE WEB ASSETS: '+why.join('; ')+'. Run npm run build:web (or drop --skip-web).');process.exit(1);}
 console.log('app/assets matches the current sources (built '+s.builtAt+')');}
else if(mode){console.error('usage: node tools/web-stamp.mjs write|check');process.exit(2);}
