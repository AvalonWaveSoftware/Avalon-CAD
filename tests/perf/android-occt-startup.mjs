import assert from 'node:assert/strict';import os from 'node:os';
import {androidClient} from '../android-occt-client.mjs';import {blank} from '../../web/templates.mjs';
const rows=[[],[]],median=a=>[...a].sort((a,b)=>a-b)[a.length>>1];
for(let round=0;round<5;round++)for(const i of (round%2?[1,0]:[0,1])){
 const t=performance.now(),client=androidClient(i===0?{desktop:true,legacy:true}:{});
 try{await client.run({type:'preview',project:blank(),tolerance:.15});rows[i].push(performance.now()-t);assert.equal(client.started(),0,'OCCT never starts for a blank preview');}finally{client.close();}
}
const delta=median(rows[1])-median(rows[0]);console.log(JSON.stringify({inProcessBlankMs:rows[0],androidPortBlankMs:rows[1],medianAddedMs:delta,loadavg:os.loadavg()}));assert.ok(delta<=150,'Android cold startup adds <=150 ms');
