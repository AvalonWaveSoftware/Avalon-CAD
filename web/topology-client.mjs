// WS2 (ADR v2): the UI side of the topology service. It keeps hash → topology, acknowledges the hashes it holds on
// every preview request, unpacks new bodies, and puts each part's topology back on part.topology before the result
// is resolved, so every consumer (applyModel userData, touch-tools topology(id), resolution-ui) reads it
// synchronously in exactly the shape it had before. Entries are pruned only while no preview is in flight, so a hash
// that was acknowledged is still present when its reply arrives.
import {unpackTopology} from './topology-pack.mjs';
export function topologyClient({keep=256}={}){
 const map=new Map(),inflight=new Set();
 return {
  map,
  outgoing(message){if(message.type!=='preview')return message;inflight.add(message.id);return {...message,topologyAck:[...map.keys()]};},
  incoming(data){
   for(const body of data.topologies||[])map.set(body.hash,unpackTopology(body));delete data.topologies;
   const preview=inflight.delete(data.id),used=new Set();
   for(const p of data.parts||[])if(p.topologyHash){const t=map.get(p.topologyHash);if(t){map.delete(p.topologyHash);map.set(p.topologyHash,t);}p.topology=t||null;used.add(p.topologyHash);}
   if(preview&&!inflight.size)for(const hash of map.keys()){if(map.size<=Math.max(keep,used.size))break;if(!used.has(hash))map.delete(hash);}
   return data;},
  reset(){inflight.clear();},
 };
}
