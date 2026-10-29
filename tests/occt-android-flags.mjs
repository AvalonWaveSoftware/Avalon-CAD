import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';
import {buildVariant,removeVariant} from './perf/variant-build.mjs';
import {androidClient} from './android-occt-client.mjs';import {blank,object} from '../web/templates.mjs';
for(const flag of ['true','false']){
 const dir=await buildVariant('android-occt-'+flag,s=>s.replace('OCCT_SIDECAR=!globalThis.Android;','OCCT_SIDECAR='+flag+';'));
 const client=androidClient({assets:pathToFileURL(dir+'/app/assets/')});
 try{const p=blank();p.objects.push(object('box',{w:20,d:20,h:10}));p.objects[0].fillets=[{edges:[0],radius:1}];const r=await client.run({type:'preview',project:p,tolerance:.15});assert.ok(r.triangles.length);assert.equal(client.started(),1,'Android uses top-level OCCT in either desktop flag state');console.log('PASS: Android OCCT with OCCT_SIDECAR='+flag);}
 finally{client.close();removeVariant(dir);}
}
