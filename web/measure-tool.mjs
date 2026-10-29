export const MEASURE_TEXT={title:'Measure',point:'Point to point',face:'Face distance and angle',edge:'Edge length / circle diameter',object:'Object minimum distance',hint:'Tap a measurement target. Tap two targets for a distance.',close:'Close measure',choose:'Choose a measurement target.',diameter:'Diameter',length:'Length',distance:'Distance',angle:'Angle'};
// All state lives in this tool; closing drops pending replies and disposes every overlay resource.
export function installMeasure({T,fmtLen,unitLabel,touch,scene,request,invalidate,canvas}){
 const $=id=>document.getElementById(id),text=MEASURE_TEXT,overlay=new T.Group();let active=false,mode='point',picks=[],serial=0,lastResult=null;
 const panel=document.createElement('div');panel.id='measurePanel';panel.className='touch-action';panel.style.cssText='position:absolute;top:64px;left:12px;z-index:20;max-width:calc(100% - 24px);background:#18343c;padding:8px;border-radius:12px';panel.hidden=true;
 panel.innerHTML=`<select id="measureMode" aria-label="${text.title}" style="min-height:44px">${['point','face','edge','object'].map(m=>`<option value="${m}">${text[m]}</option>`).join('')}</select><button id="closeMeasure" style="min-height:44px">${text.close}</button><p id="measureResult" role="status"></p>`;canvas.parentElement.append(panel);scene.add(overlay);
 function clear(){serial++;picks=[];lastResult=null;while(overlay.children.length){const c=overlay.children[0];overlay.remove(c);c.geometry.dispose();c.material.dispose();}invalidate();}
 function renderResult(){if(!lastResult)return;const result=lastResult;$('measureResult').textContent=[`${mode==='edge'?text.length:text.distance}: ${fmtLen(result.distance,6)} ${unitLabel()}`,result.diameter===undefined?null:`${text.diameter}: ${fmtLen(result.diameter,6)} ${unitLabel()}`,result.angle>1e-7?`${text.angle}: ${result.angle.toFixed(6)}°`:null].filter(Boolean).join(' · ');}
 function marker(p,color=0xffcf83){const m=new T.Mesh(new T.SphereGeometry(.6,10,8),new T.MeshBasicMaterial({color,depthTest:false}));m.position.set(...p);m.renderOrder=30;overlay.add(m);}
 function centers(){for(const p of touch.measureCenters())marker(p,0x85a9b8);invalidate();}
 function close(){if(!active)return false;active=false;clear();panel.hidden=true;touch.measureHandler(null);$('measureBtn').classList.remove('active');return true;}
 async function pick(e){const p=touch.measurePick(e,mode);if(!p||(mode==='face'||mode==='edge')&&!(Number.isInteger(p.index)&&p.index>=0)){$('measureResult').textContent=text.choose;return;}
  if(picks.length===(mode==='edge'?1:2)){clear();centers();}picks.push(p);marker(p.point);invalidate();if(mode!=='edge'&&picks.length<2)return;
  const token=++serial;try{let result;if(mode==='point'){result={distance:Math.hypot(...picks[0].point.map((v,i)=>v-picks[1].point[i]))};const line=new T.Line(new T.BufferGeometry().setFromPoints(picks.map(p=>new T.Vector3(...p.point))),new T.LineBasicMaterial({color:0xffcf83,depthTest:false}));overlay.add(line);invalidate();}
   else result=await request('measure',{mode,a:picks[0],b:picks[1]});if(!active||token!==serial)return;
   lastResult=result;renderResult();
  }catch(e){if(active&&token===serial)$('measureResult').textContent=e.message;}}
 $('measureMode').onchange=()=>{mode=$('measureMode').value;clear();centers();$('measureResult').textContent=text.hint;};$('closeMeasure').onclick=close;
 return {close,unitsChanged:renderResult,toggle(){if(active)return close();touch.setMode('select');active=true;panel.hidden=false;clear();centers();touch.measureHandler(pick,close);$('measureBtn').classList.add('active');$('measureResult').textContent=text.hint;},get active(){return active;}};
}
