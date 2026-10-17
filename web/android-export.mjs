// WS12 (BINARY_EXPORT): the Android hand-off sends a few large base64 chunks, encoded natively (FileReader), instead of
// one bridge call per 24 KB built in script. MainActivity is unchanged and receives the same bytes. Its size guard runs
// before each chunk (refusing once more than 50 MiB are staged), so a file the 24 KB stream would refuse keeps that
// stream and gets the same notice; every other file is byte-identical either way.
// The encoding is asynchronous, so hand-offs are queued: a second export never interleaves its beginFile with the
// chunks of the first (the 24 KB loop was synchronous and could not interleave either).
export const ANDROID_MAX=50*1024*1024,LEGACY_STEP=24576,ANDROID_STEP=3*1024*1024;
export const androidChunk=n=>(Math.ceil(n/LEGACY_STEP)-1)*LEGACY_STEP>ANDROID_MAX?LEGACY_STEP:ANDROID_STEP;
export const base64=bytes=>new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result.replace(/^[^,]*,/,''));r.onerror=()=>reject(r.error);r.readAsDataURL(new Blob([bytes]));});
let queue=Promise.resolve(),pending=0;
// Files of one chunk or less (project backups, prefabs) keep the synchronous 24 KB loop unless a hand-off is in flight.
export const androidAsync=n=>pending>0||(n>ANDROID_STEP&&androidChunk(n)!==LEGACY_STEP);
export function androidSend(bridge,bytes,name,mime){const step=androidChunk(bytes.length);
 const run=async()=>{const first=await base64(bytes.subarray(0,step));bridge.beginFile(name,mime);if(bytes.length)bridge.appendFile(first);
  for(let i=step;i<bytes.length;i+=step)bridge.appendFile(await base64(bytes.subarray(i,i+step)));bridge.finishFile();};
 pending++;const done=queue.then(run).finally(()=>pending--);queue=done.catch(()=>{});return done;}
