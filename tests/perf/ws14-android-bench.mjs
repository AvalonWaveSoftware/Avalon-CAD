// WS14 Android-path rows: same built WS14 geometry/OCCT code, nested transport vs main-owned MessageChannel.
import assert from 'node:assert/strict';import os from 'node:os';
import {androidClient} from '../android-occt-client.mjs';import {blank,object} from '../../web/templates.mjs';
const clients=[androidClient({desktop:true}),androidClient()],rows=[[],[]],cold=[];const median=a=>[...a].sort((a,b)=>a-b)[a.length>>1];
try{
 for(let round=-1;round<7;round++)for(const i of (round%2?[1,0]:[0,1])){
  const p=blank();p.objects.push(object('cylinder',{diameter:80,h:30},[0,0,15]));p.objects[0].fillets=[{edges:[0,2],radius:3+round*.05}];p.objects[0].resolution={mode:'tolerance',tolerance:.005};
  const t=performance.now(),result=await clients[i].run({type:'preview',project:p,tolerance:.15});assert.ok(result.triangles.length);const ms=performance.now()-t;if(round<0)cold[i]=ms;else rows[i].push(ms);
 }
 const desktop=median(rows[0]),android=median(rows[1]),overhead=(android/desktop-1)*100;
 console.log(JSON.stringify({rows:{WS14:rows[0],AndroidPort:rows[1]},medianMs:{WS14:desktop,AndroidPort:android},coldFirstFilletMs:cold,overheadPercent:overhead,loadavg:os.loadavg(),gate:overhead<=5?'PASS':'FAIL'}));
 if(process.argv.includes('--check'))assert.ok(overhead<=5,'Android IPC overhead <=5%');
}finally{clients.forEach(c=>c.close());}
