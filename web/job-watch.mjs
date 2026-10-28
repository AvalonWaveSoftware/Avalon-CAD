// D6 (Waydroid QA 2026-10-26): a long check/export showed nothing for 10+ minutes. Main-thread watch, no worker code:
// a check/export (or the Add/Edit sheet's place) still running after JOB_SHOW_MS shows a bar with its elapsed time and Cancel; Cancel, or JOB_TIMEOUT_MS,
// stops it (onStop terminates and recreates the worker; the caller's request rejects, so nothing is applied).
// JOB_TIMEOUT_MS: the slowest exact jobs seen on the device take seconds (Mirror Copy at Smooth: 1-3 s on the box, a few
// times that on Waydroid); 2 minutes is a wide margin over any legitimate job and bounds a stall that QA saw run 10+ min.
// JOB_TEXT and the bar's look are placeholders pending Master Chief's approval (handoffs/avalon-cad/d6-approval/).
export const JOB_SHOW_MS=2000,JOB_TIMEOUT_MS=120000;
export const JOB_TEXT={check:'Checking the model…',export:'Preparing the export…',seconds:s=>s+' s',cancel:'Cancel',
 canceled:'Canceled. Nothing was changed.',timeout:'Stopped after 2 minutes: this model takes too long to process. Nothing was changed.'};
const BAR='position:fixed;left:20px;right:20px;bottom:105px;z-index:31;align-items:center;gap:12px;padding:8px 8px 8px 16px;background:#2d454e;border:1px solid #4f727b;border-radius:12px;font-size:13px;box-shadow:0 10px 40px #0008';
export function jobWatch(onStop){
 const jobs=new Map();let bar=null,tick=0;
 const stop=reason=>{const [id,j]=[...jobs][0]||[];if(!j)return;jobs.clear();render();onStop(reason,j.type,Math.round((performance.now()-j.t)/1000),id);};
 function render(){const now=performance.now(),j=[...jobs.values()][0];
  if(j&&now-j.t>=(globalThis.__avalonJobTimeoutMs||JOB_TIMEOUT_MS))return stop('timeout');
  const show=j&&now-j.t>=JOB_SHOW_MS;if(!show){if(bar)bar.style.display='none';return;}
  if(!bar){bar=document.createElement('div');bar.id='jobWatch';bar.setAttribute('role','status');bar.style.cssText=BAR;bar.innerHTML='<span style="flex:1"></span><button type="button" id="jobCancel"></button>';
   bar.lastChild.textContent=JOB_TEXT.cancel;bar.lastChild.onclick=()=>stop('canceled');document.body.append(bar);}
  bar.style.display='flex';bar.firstChild.textContent=(JOB_TEXT[j.type]||JOB_TEXT.check)+' '+JOB_TEXT.seconds(Math.floor((now-j.t)/1000));}
 return {start(id,type){jobs.set(id,{type,t:performance.now()});tick||=setInterval(()=>{render();if(!jobs.size){clearInterval(tick);tick=0;}},250);},
  done(id){if(jobs.delete(id))render();}};
}
