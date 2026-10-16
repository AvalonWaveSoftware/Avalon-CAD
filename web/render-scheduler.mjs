// WS4 (ADR v2): render on demand. invalidate() asks for one frame. Each frame runs controls.update() then
// renderer.render() exactly as the old loop did, and asks for another frame while the camera is still moving:
// OrbitControls reports motion above its EPS through update()'s return value, and damping then keeps moving the
// camera by ever smaller amounts, so frames continue until one update moves the camera and target by less than
// SETTLED world units (far below a pixel). Any Object3D add/remove/clear also invalidates, so overlay, marker and
// model changes cannot miss a frame; property-only changes (visibility, in-place buffers) call invalidate().
import {Object3D} from 'three';
const SETTLED=1e-9,LINGER=1000;
// Chromium re-rasterizes composited DOM layers (e.g. the sheet's rise animation and its 80 px shadow over the
// canvas) at their final scale only while the page keeps producing frames. The old loop always did, so after any
// change (invalidate or DOM mutation) frames continue for LINGER ms, then stop; this keeps those layers raster-identical.
export function renderOnDemand({renderer,scene,camera,controls}){
 let frame=0,until=0;const last=new Float64Array(10),now=new Float64Array(10);
 const read=out=>{const p=camera.position,q=camera.quaternion,t=controls.target;out.set([p.x,p.y,p.z,q.x,q.y,q.z,q.w,t.x,t.y,t.z]);};
 function tick(){frame=0;read(last);const moving=controls.update();renderer.render(scene,camera);read(now);let delta=0;for(let i=0;i<10;i++)delta=Math.max(delta,Math.abs(now[i]-last[i]));if(moving||delta>SETTLED||performance.now()<until)request();}
 function request(){if(!frame)frame=requestAnimationFrame(tick);}
 function invalidate(){until=performance.now()+LINGER;request();}
 for(const name of ['add','remove','clear']){const original=Object3D.prototype[name];Object3D.prototype[name]=function(...a){invalidate();return original.apply(this,a);};}
 controls.addEventListener('change',invalidate);controls.addEventListener('start',invalidate);controls.addEventListener('end',invalidate);
 document.addEventListener('visibilitychange',invalidate);new MutationObserver(invalidate).observe(document.documentElement,{subtree:true,childList:true,attributes:true,characterData:true});invalidate();
 return invalidate;
}
