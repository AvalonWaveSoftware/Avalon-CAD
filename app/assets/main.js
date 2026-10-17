var Ni={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Fn={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},fu=0,dc=1,pu=2;var Br=1,mu=2,Gs=3,Ui=0,cn=1,Ot=2,Qn=0,Ws=1,fc=2,pc=3,mc=4,gu=5;var ns=100,_u=101,xu=102,yu=103,vu=104,bu=200,Mu=201,Su=202,Eu=203,gc=204,_c=205,Tu=206,wu=207,Au=208,Cu=209,Ru=210,Pu=211,Iu=212,Lu=213,Du=214,Fa=0,Oa=1,Ba=2,Ps=3,ka=4,za=5,Va=6,Ha=7,go=0,Nu=1,Uu=2,On=0,xc=1,yc=2,vc=3,bc=4,Mc=5,Sc=6,Ec=7;var Tc=300,Fi=301,is=302,_o=303,xo=304,kr=306,Ga=1e3,Zn=1001,Wa=1002,Wt=1003,Fu=1004;var zr=1005;var qt=1006,yo=1007;var Oi=1008;var fn=1009,wc=1010,Ac=1011,Xs=1012,vo=1013,Bn=1014,kn=1015,zn=1016,bo=1017,Mo=1018,Ys=1020,Cc=35902,Rc=35899,Pc=1021,Ic=1022,En=1023,Jn=1026,Bi=1027,Lc=1028,So=1029,ki=1030,Eo=1031;var To=1033,Vr=33776,Hr=33777,Gr=33778,Wr=33779,wo=35840,Ao=35841,Co=35842,Ro=35843,Po=36196,Io=37492,Lo=37496,Do=37488,No=37489,Xr=37490,Uo=37491,Fo=37808,Oo=37809,Bo=37810,ko=37811,zo=37812,Vo=37813,Ho=37814,Go=37815,Wo=37816,Xo=37817,Yo=37818,qo=37819,jo=37820,$o=37821,Zo=36492,Jo=36494,Ko=36495,Qo=36283,el=36284,Yr=36285,tl=36286;var xr=2300,Xa=2301,Na=2302,sc=2303,rc=2400,ac=2401,oc=2402;var Ou=3200;var nl=0,Bu=1,di="",on="srgb",yr="srgb-linear",vr="linear",lt="srgb";var Ua=7680;var ku=519,zu=512,Vu=513,Hu=514,il=515,Gu=516,Wu=517,sl=518,Xu=519,Yu=35044;var Dc="300 es",Dn=2e3,Is=2001;function zf(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Vf(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function br(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function qu(){let n=br("canvas");return n.style.display="block",n}var Bh={},Ls=null;function Nc(...n){let e="THREE."+n.shift();Ls?Ls("log",e,...n):console.log(e,...n)}function ju(n){let e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Oe(...n){n=ju(n);let e="THREE."+n.shift();if(Ls)Ls("warn",e,...n);else{let t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function ke(...n){n=ju(n);let e="THREE."+n.shift();if(Ls)Ls("error",e,...n);else{let t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function Ki(...n){let e=n.join(" ");e in Bh||(Bh[e]=!0,Oe(...n))}function $u(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}var Zu={[Fa]:Oa,[Ba]:Va,[ka]:Ha,[Ps]:za,[Oa]:Fa,[Va]:Ba,[Ha]:ka,[za]:Ps},Un=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let s=i[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Zt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],kh=1234567,Cs=Math.PI/180,Ds=180/Math.PI;function qs(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Zt[n&255]+Zt[n>>8&255]+Zt[n>>16&255]+Zt[n>>24&255]+"-"+Zt[e&255]+Zt[e>>8&255]+"-"+Zt[e>>16&15|64]+Zt[e>>24&255]+"-"+Zt[t&63|128]+Zt[t>>8&255]+"-"+Zt[t>>16&255]+Zt[t>>24&255]+Zt[i&255]+Zt[i>>8&255]+Zt[i>>16&255]+Zt[i>>24&255]).toLowerCase()}function Je(n,e,t){return Math.max(e,Math.min(t,n))}function Uc(n,e){return(n%e+e)%e}function Hf(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function Gf(n,e,t){return n!==e?(t-n)/(e-n):0}function _r(n,e,t){return(1-t)*n+t*e}function Wf(n,e,t,i){return _r(n,e,1-Math.exp(-t*i))}function Xf(n,e=1){return e-Math.abs(Uc(n,e*2)-e)}function Yf(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function qf(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function jf(n,e){return n+Math.floor(Math.random()*(e-n+1))}function $f(n,e){return n+Math.random()*(e-n)}function Zf(n){return n*(.5-Math.random())}function Jf(n){n!==void 0&&(kh=n);let e=kh+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Kf(n){return n*Cs}function Qf(n){return n*Ds}function ep(n){return n>0&&Number.isInteger(n)&&2**Math.round(Math.log2(n))===n}function tp(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function np(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function ip(n,e,t,i,s){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+i)/2),h=a((e+i)/2),d=r((e-i)/2),u=a((e-i)/2),m=r((i-e)/2),f=a((i-e)/2);switch(s){case"XYX":n.set(o*h,l*d,l*u,o*c);break;case"YZY":n.set(l*u,o*h,l*d,o*c);break;case"ZXZ":n.set(l*d,l*u,o*h,o*c);break;case"XZX":n.set(o*h,l*f,l*m,o*c);break;case"YXY":n.set(l*m,o*h,l*f,o*c);break;case"ZYZ":n.set(l*f,l*m,o*h,o*c);break;default:Oe("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function As(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:case Uint8ClampedArray:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function an(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Bt={DEG2RAD:Cs,RAD2DEG:Ds,generateUUID:qs,clamp:Je,euclideanModulo:Uc,mapLinear:Hf,inverseLerp:Gf,lerp:_r,damp:Wf,pingpong:Xf,smoothstep:Yf,smootherstep:qf,randInt:jf,randFloat:$f,randFloatSpread:Zf,seededRandom:Jf,degToRad:Kf,radToDeg:Qf,isPowerOfTwo:ep,ceilPowerOfTwo:tp,floorPowerOfTwo:np,setQuaternionFromProperEuler:ip,normalize:an,denormalize:As},Fe=class n{static{n.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Je(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*s+e.x,this.y=r*s+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},vt=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,a,o){let l=i[s+0],c=i[s+1],h=i[s+2],d=i[s+3],u=r[a+0],m=r[a+1],f=r[a+2],x=r[a+3];if(d!==x||l!==u||c!==m||h!==f){let g=l*u+c*m+h*f+d*x;g<0&&(u=-u,m=-m,f=-f,x=-x,g=-g);let p=1-o;if(g<.9995){let T=Math.acos(g),R=Math.sin(T);p=Math.sin(p*T)/R,o=Math.sin(o*T)/R,l=l*p+u*o,c=c*p+m*o,h=h*p+f*o,d=d*p+x*o}else{l=l*p+u*o,c=c*p+m*o,h=h*p+f*o,d=d*p+x*o;let T=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=T,c*=T,h*=T,d*=T}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=d}static multiplyQuaternionsFlat(e,t,i,s,r,a){let o=i[s],l=i[s+1],c=i[s+2],h=i[s+3],d=r[a],u=r[a+1],m=r[a+2],f=r[a+3];return e[t]=o*f+h*d+l*m-c*u,e[t+1]=l*f+h*u+c*d-o*m,e[t+2]=c*f+h*m+o*u-l*d,e[t+3]=h*f-o*d-l*u-c*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),h=o(s/2),d=o(r/2),u=l(i/2),m=l(s/2),f=l(r/2);switch(a){case"XYZ":this._x=u*h*d+c*m*f,this._y=c*m*d-u*h*f,this._z=c*h*f+u*m*d,this._w=c*h*d-u*m*f;break;case"YXZ":this._x=u*h*d+c*m*f,this._y=c*m*d-u*h*f,this._z=c*h*f-u*m*d,this._w=c*h*d+u*m*f;break;case"ZXY":this._x=u*h*d-c*m*f,this._y=c*m*d+u*h*f,this._z=c*h*f+u*m*d,this._w=c*h*d-u*m*f;break;case"ZYX":this._x=u*h*d-c*m*f,this._y=c*m*d+u*h*f,this._z=c*h*f-u*m*d,this._w=c*h*d+u*m*f;break;case"YZX":this._x=u*h*d+c*m*f,this._y=c*m*d+u*h*f,this._z=c*h*f-u*m*d,this._w=c*h*d-u*m*f;break;case"XZY":this._x=u*h*d-c*m*f,this._y=c*m*d-u*h*f,this._z=c*h*f+u*m*d,this._w=c*h*d+u*m*f;break;default:Oe("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],d=t[10],u=i+o+d;if(u>0){let m=.5/Math.sqrt(u+1);this._w=.25/m,this._x=(h-l)*m,this._y=(r-c)*m,this._z=(a-s)*m}else if(i>o&&i>d){let m=2*Math.sqrt(1+i-o-d);this._w=(h-l)/m,this._x=.25*m,this._y=(s+a)/m,this._z=(r+c)/m}else if(o>d){let m=2*Math.sqrt(1+o-i-d);this._w=(r-c)/m,this._x=(s+a)/m,this._y=.25*m,this._z=(l+h)/m}else{let m=2*Math.sqrt(1+d-i-o);this._w=(a-s)/m,this._x=(r+c)/m,this._y=(l+h)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Je(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=i*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-i*c,this._z=r*h+a*c+i*l-s*o,this._w=a*h-i*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},D=class n{static{n.prototype.isVector3=!0}constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(zh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(zh.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*i),h=2*(o*t-r*s),d=2*(r*i-a*t);return this.x=t+l*c+a*d-o*h,this.y=i+l*h+o*c-r*d,this.z=s+l*d+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this.z=Je(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this.z=Je(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-i*l,this.z=i*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Ul.copy(this).projectOnVector(e),this.sub(Ul)}reflect(e){return this.sub(Ul.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(Je(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Ul=new D,zh=new vt,He=class n{static{n.prototype.isMatrix3=!0}constructor(e,t,i,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c)}set(e,t,i,s,r,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=i,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],h=i[4],d=i[7],u=i[2],m=i[5],f=i[8],x=s[0],g=s[3],p=s[6],T=s[1],R=s[4],b=s[7],E=s[2],S=s[5],P=s[8];return r[0]=a*x+o*T+l*E,r[3]=a*g+o*R+l*S,r[6]=a*p+o*b+l*P,r[1]=c*x+h*T+d*E,r[4]=c*g+h*R+d*S,r[7]=c*p+h*b+d*P,r[2]=u*x+m*T+f*E,r[5]=u*g+m*R+f*S,r[8]=u*p+m*b+f*P,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-i*r*h+i*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=h*a-o*c,u=o*l-h*r,m=c*r-a*l,f=t*d+i*u+s*m;if(f===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/f;return e[0]=d*x,e[1]=(s*c-h*i)*x,e[2]=(o*i-s*a)*x,e[3]=u*x,e[4]=(h*t-s*l)*x,e[5]=(s*r-o*t)*x,e[6]=m*x,e[7]=(i*l-c*t)*x,e[8]=(a*t-i*r)*x,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return Ki("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Fl.makeScale(e,t)),this}rotate(e){return Ki("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Fl.makeRotation(-e)),this}translate(e,t){return Ki("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Fl.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Fl=new He,Vh=new He().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Hh=new He().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function sp(){let n={enabled:!0,workingColorSpace:yr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===lt&&(s.r=hi(s.r),s.g=hi(s.g),s.b=hi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===lt&&(s.r=Rs(s.r),s.g=Rs(s.g),s.b=Rs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===di?vr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ki("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ki("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[yr]:{primaries:e,whitePoint:i,transfer:vr,toXYZ:Vh,fromXYZ:Hh,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:on},outputColorSpaceConfig:{drawingBufferColorSpace:on}},[on]:{primaries:e,whitePoint:i,transfer:lt,toXYZ:Vh,fromXYZ:Hh,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:on}}}),n}var tt=sp();function hi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Rs(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var ps,Ya=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{ps===void 0&&(ps=br("canvas")),ps.width=e.width,ps.height=e.height;let s=ps.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=ps}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=br("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=hi(r[a]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(hi(t[i]/255)*255):t[i]=hi(t[i]);return{data:t,width:e.width,height:e.height}}else return Oe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},rp=0,Ns=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:rp++}),this.uuid=qs(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Ol(s[a].image)):r.push(Ol(s[a]))}else r=Ol(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function Ol(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Ya.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Oe("Texture: Unable to serialize Texture."),{})}var ap=0,Bl=new D,un=class n extends Un{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=Zn,s=Zn,r=qt,a=Oi,o=En,l=fn,c=n.DEFAULT_ANISOTROPY,h=di){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ap++}),this.uuid=qs(),this.name="",this.source=new Ns(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Fe(0,0),this.repeat=new Fe(1,1),this.center=new Fe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new He,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Bl).x}get height(){return this.source.getSize(Bl).y}get depth(){return this.source.getSize(Bl).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){Oe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Oe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Tc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ga:e.x=e.x-Math.floor(e.x);break;case Zn:e.x=e.x<0?0:1;break;case Wa:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ga:e.y=e.y-Math.floor(e.y);break;case Zn:e.y=e.y<0?0:1;break;case Wa:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};un.DEFAULT_IMAGE=null;un.DEFAULT_MAPPING=Tc;un.DEFAULT_ANISOTROPY=1;var bt=class n{static{n.prototype.isVector4=!0}constructor(e=0,t=0,i=0,s=1){this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*i+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,l=e.elements,c=l[0],h=l[4],d=l[8],u=l[1],m=l[5],f=l[9],x=l[2],g=l[6],p=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-x)<.01&&Math.abs(f-g)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+x)<.1&&Math.abs(f+g)<.1&&Math.abs(c+m+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let R=(c+1)/2,b=(m+1)/2,E=(p+1)/2,S=(h+u)/4,P=(d+x)/4,y=(f+g)/4;return R>b&&R>E?R<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(R),s=S/i,r=P/i):b>E?b<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(b),i=S/s,r=y/s):E<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),i=P/r,s=y/r),this.set(i,s,r,t),this}let T=Math.sqrt((g-f)*(g-f)+(d-x)*(d-x)+(u-h)*(u-h));return Math.abs(T)<.001&&(T=1),this.x=(g-f)/T,this.y=(d-x)/T,this.z=(u-h)/T,this.w=Math.acos((c+m+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Je(this.x,e.x,t.x),this.y=Je(this.y,e.y,t.y),this.z=Je(this.z,e.z,t.z),this.w=Je(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Je(this.x,e,t),this.y=Je(this.y,e,t),this.z=Je(this.z,e,t),this.w=Je(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Je(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},qa=class extends Un{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:qt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new bt(0,0,e,t),this.scissorTest=!1,this.viewport=new bt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:i.depth},r=new un(s),a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:qt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Ns(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},dn=class extends qa{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},Mr=class extends un{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Wt,this.minFilter=Wt,this.wrapR=Zn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var ja=class extends un{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=Wt,this.minFilter=Wt,this.wrapR=Zn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var pt=class n{static{n.prototype.isMatrix4=!0}constructor(e,t,i,s,r,a,o,l,c,h,d,u,m,f,x,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c,h,d,u,m,f,x,g)}set(e,t,i,s,r,a,o,l,c,h,d,u,m,f,x,g){let p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=d,p[14]=u,p[3]=m,p[7]=f,p[11]=x,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,s=1/ms.setFromMatrixColumn(e,0).length(),r=1/ms.setFromMatrixColumn(e,1).length(),a=1/ms.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(e.order==="XYZ"){let u=a*h,m=a*d,f=o*h,x=o*d;t[0]=l*h,t[4]=-l*d,t[8]=c,t[1]=m+f*c,t[5]=u-x*c,t[9]=-o*l,t[2]=x-u*c,t[6]=f+m*c,t[10]=a*l}else if(e.order==="YXZ"){let u=l*h,m=l*d,f=c*h,x=c*d;t[0]=u+x*o,t[4]=f*o-m,t[8]=a*c,t[1]=a*d,t[5]=a*h,t[9]=-o,t[2]=m*o-f,t[6]=x+u*o,t[10]=a*l}else if(e.order==="ZXY"){let u=l*h,m=l*d,f=c*h,x=c*d;t[0]=u-x*o,t[4]=-a*d,t[8]=f+m*o,t[1]=m+f*o,t[5]=a*h,t[9]=x-u*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let u=a*h,m=a*d,f=o*h,x=o*d;t[0]=l*h,t[4]=f*c-m,t[8]=u*c+x,t[1]=l*d,t[5]=x*c+u,t[9]=m*c-f,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let u=a*l,m=a*c,f=o*l,x=o*c;t[0]=l*h,t[4]=x-u*d,t[8]=f*d+m,t[1]=d,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=m*d+f,t[10]=u-x*d}else if(e.order==="XZY"){let u=a*l,m=a*c,f=o*l,x=o*c;t[0]=l*h,t[4]=-d,t[8]=c*h,t[1]=u*d+x,t[5]=a*h,t[9]=m*d-f,t[2]=f*d-m,t[6]=o*h,t[10]=x*d+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(op,e,lp)}lookAt(e,t,i){let s=this.elements;return gn.subVectors(e,t),gn.lengthSq()===0&&(gn.z=1),gn.normalize(),Si.crossVectors(i,gn),Si.lengthSq()===0&&(Math.abs(i.z)===1?gn.x+=1e-4:gn.z+=1e-4,gn.normalize(),Si.crossVectors(i,gn)),Si.normalize(),ha.crossVectors(gn,Si),s[0]=Si.x,s[4]=ha.x,s[8]=gn.x,s[1]=Si.y,s[5]=ha.y,s[9]=gn.y,s[2]=Si.z,s[6]=ha.z,s[10]=gn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],h=i[1],d=i[5],u=i[9],m=i[13],f=i[2],x=i[6],g=i[10],p=i[14],T=i[3],R=i[7],b=i[11],E=i[15],S=s[0],P=s[4],y=s[8],A=s[12],L=s[1],I=s[5],z=s[9],W=s[13],O=s[2],k=s[6],Q=s[10],$=s[14],re=s[3],j=s[7],ae=s[11],ee=s[15];return r[0]=a*S+o*L+l*O+c*re,r[4]=a*P+o*I+l*k+c*j,r[8]=a*y+o*z+l*Q+c*ae,r[12]=a*A+o*W+l*$+c*ee,r[1]=h*S+d*L+u*O+m*re,r[5]=h*P+d*I+u*k+m*j,r[9]=h*y+d*z+u*Q+m*ae,r[13]=h*A+d*W+u*$+m*ee,r[2]=f*S+x*L+g*O+p*re,r[6]=f*P+x*I+g*k+p*j,r[10]=f*y+x*z+g*Q+p*ae,r[14]=f*A+x*W+g*$+p*ee,r[3]=T*S+R*L+b*O+E*re,r[7]=T*P+R*I+b*k+E*j,r[11]=T*y+R*z+b*Q+E*ae,r[15]=T*A+R*W+b*$+E*ee,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],d=e[6],u=e[10],m=e[14],f=e[3],x=e[7],g=e[11],p=e[15],T=l*m-c*u,R=o*m-c*d,b=o*u-l*d,E=a*m-c*h,S=a*u-l*h,P=a*d-o*h;return t*(x*T-g*R+p*b)-i*(f*T-g*E+p*S)+s*(f*R-x*E+p*P)-r*(f*b-x*S+g*P)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],h=e[10];return t*(a*h-o*c)-i*(r*h-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],d=e[9],u=e[10],m=e[11],f=e[12],x=e[13],g=e[14],p=e[15],T=t*o-i*a,R=t*l-s*a,b=t*c-r*a,E=i*l-s*o,S=i*c-r*o,P=s*c-r*l,y=h*x-d*f,A=h*g-u*f,L=h*p-m*f,I=d*g-u*x,z=d*p-m*x,W=u*p-m*g,O=T*W-R*z+b*I+E*L-S*A+P*y;if(O===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let k=1/O;return e[0]=(o*W-l*z+c*I)*k,e[1]=(s*z-i*W-r*I)*k,e[2]=(x*P-g*S+p*E)*k,e[3]=(u*S-d*P-m*E)*k,e[4]=(l*L-a*W-c*A)*k,e[5]=(t*W-s*L+r*A)*k,e[6]=(g*b-f*P-p*R)*k,e[7]=(h*P-u*b+m*R)*k,e[8]=(a*z-o*L+c*y)*k,e[9]=(i*L-t*z-r*y)*k,e[10]=(f*S-x*b+p*T)*k,e[11]=(d*b-h*S-m*T)*k,e[12]=(o*A-a*I-l*y)*k,e[13]=(t*I-i*A+s*y)*k,e[14]=(x*R-f*E-g*T)*k,e[15]=(h*E-d*R+u*T)*k,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+i,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+i,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,a){return this.set(1,i,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,d=o+o,u=r*c,m=r*h,f=r*d,x=a*h,g=a*d,p=o*d,T=l*c,R=l*h,b=l*d,E=i.x,S=i.y,P=i.z;return s[0]=(1-(x+p))*E,s[1]=(m+b)*E,s[2]=(f-R)*E,s[3]=0,s[4]=(m-b)*S,s[5]=(1-(u+p))*S,s[6]=(g+T)*S,s[7]=0,s[8]=(f+R)*P,s[9]=(g-T)*P,s[10]=(1-(u+x))*P,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let a=ms.set(s[0],s[1],s[2]).length(),o=ms.set(s[4],s[5],s[6]).length(),l=ms.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Pn.copy(this);let c=1/a,h=1/o,d=1/l;return Pn.elements[0]*=c,Pn.elements[1]*=c,Pn.elements[2]*=c,Pn.elements[4]*=h,Pn.elements[5]*=h,Pn.elements[6]*=h,Pn.elements[8]*=d,Pn.elements[9]*=d,Pn.elements[10]*=d,t.setFromRotationMatrix(Pn),i.x=a,i.y=o,i.z=l,this}makePerspective(e,t,i,s,r,a,o=Dn,l=!1){let c=this.elements,h=2*r/(t-e),d=2*r/(i-s),u=(t+e)/(t-e),m=(i+s)/(i-s),f,x;if(l)f=r/(a-r),x=a*r/(a-r);else if(o===Dn)f=-(a+r)/(a-r),x=-2*a*r/(a-r);else if(o===Is)f=-a/(a-r),x=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=m,c[13]=0,c[2]=0,c[6]=0,c[10]=f,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,s,r,a,o=Dn,l=!1){let c=this.elements,h=2/(t-e),d=2/(i-s),u=-(t+e)/(t-e),m=-(i+s)/(i-s),f,x;if(l)f=1/(a-r),x=a/(a-r);else if(o===Dn)f=-2/(a-r),x=-(a+r)/(a-r);else if(o===Is)f=-1/(a-r),x=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=m,c[2]=0,c[6]=0,c[10]=f,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}},ms=new D,Pn=new pt,op=new D(0,0,0),lp=new D(1,1,1),Si=new D,ha=new D,gn=new D,Gh=new pt,Wh=new vt,Et=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],d=s[2],u=s[6],m=s[10];switch(t){case"XYZ":this._y=Math.asin(Je(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,m),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Je(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Je(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,m),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Je(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,m),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Je(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-Je(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,m),this._y=0);break;default:Oe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Gh.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Gh,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Wh.setFromEuler(this),this.setFromQuaternion(Wh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Et.DEFAULT_ORDER="XYZ";var Us=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},cp=0,Xh=new D,gs=new vt,si=new pt,ua=new D,dr=new D,hp=new D,up=new vt,Yh=new D(1,0,0),qh=new D(0,1,0),jh=new D(0,0,1),$h={type:"added"},dp={type:"removed"},_s={type:"childadded",child:null},kl={type:"childremoved",child:null},Ft=class n extends Un{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:cp++}),this.uuid=qs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new D,t=new Et,i=new vt,s=new D(1,1,1);function r(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new pt},normalMatrix:{value:new He}}),this.matrix=new pt,this.matrixWorld=new pt,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Us,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return gs.setFromAxisAngle(e,t),this.quaternion.multiply(gs),this}rotateOnWorldAxis(e,t){return gs.setFromAxisAngle(e,t),this.quaternion.premultiply(gs),this}rotateX(e){return this.rotateOnAxis(Yh,e)}rotateY(e){return this.rotateOnAxis(qh,e)}rotateZ(e){return this.rotateOnAxis(jh,e)}translateOnAxis(e,t){return Xh.copy(e).applyQuaternion(this.quaternion),this.position.add(Xh.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Yh,e)}translateY(e){return this.translateOnAxis(qh,e)}translateZ(e){return this.translateOnAxis(jh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(si.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?ua.copy(e):ua.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),dr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?si.lookAt(dr,ua,this.up):si.lookAt(ua,dr,this.up),this.quaternion.setFromRotationMatrix(si),s&&(si.extractRotation(s.matrixWorld),gs.setFromRotationMatrix(si),this.quaternion.premultiply(gs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(ke("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent($h),_s.child=e,this.dispatchEvent(_s),_s.child=null):ke("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(dp),kl.child=e,this.dispatchEvent(kl),kl.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),si.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),si.multiply(e.parent.matrixWorld)),e.applyMatrix4(si),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent($h),_s.child=e,this.dispatchEvent(_s),_s.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(dr,e,hp),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(dr,up,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*s,r[13]+=i-r[1]*t-r[5]*i-r[9]*s,r[14]+=s-r[2]*t-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];r(e.shapes,d)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),d=a(e.shapes),u=a(e.skeletons),m=a(e.animations),f=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),u.length>0&&(i.skeletons=u),m.length>0&&(i.animations=m),f.length>0&&(i.nodes=f)}return i.object=s,i;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ft.DEFAULT_UP=new D(0,1,0);Ft.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ft.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Nn=class extends Ft{constructor(){super(),this.isGroup=!0,this.type="Group"}},fp={type:"move"},Fs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Nn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Nn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Nn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let x of e.hand.values()){let g=t.getJointPose(x,i),p=this._getHandJoint(c,x);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),m=.02,f=.005;c.inputState.pinching&&u>m+f?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=m-f&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(fp)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new Nn;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},Ju={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ei={h:0,s:0,l:0},da={h:0,s:0,l:0};function zl(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var qe=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=on){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,tt.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=tt.workingColorSpace){return this.r=e,this.g=t,this.b=i,tt.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=tt.workingColorSpace){if(e=Uc(e,1),t=Je(t,0,1),i=Je(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,a=2*i-r;this.r=zl(a,r,e+1/3),this.g=zl(a,r,e),this.b=zl(a,r,e-1/3)}return tt.colorSpaceToWorking(this,s),this}setStyle(e,t=on){function i(r){r!==void 0&&parseFloat(r)<1&&Oe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Oe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Oe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=on){let i=Ju[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Oe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=hi(e.r),this.g=hi(e.g),this.b=hi(e.b),this}copyLinearToSRGB(e){return this.r=Rs(e.r),this.g=Rs(e.g),this.b=Rs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=on){return tt.workingToColorSpace(Jt.copy(this),e),Math.round(Je(Jt.r*255,0,255))*65536+Math.round(Je(Jt.g*255,0,255))*256+Math.round(Je(Jt.b*255,0,255))}getHexString(e=on){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=tt.workingColorSpace){tt.workingToColorSpace(Jt.copy(this),t);let i=Jt.r,s=Jt.g,r=Jt.b,a=Math.max(i,s,r),o=Math.min(i,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=h<=.5?d/(a+o):d/(2-a-o),a){case i:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-i)/d+2;break;case r:l=(i-s)/d+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=tt.workingColorSpace){return tt.workingToColorSpace(Jt.copy(this),t),e.r=Jt.r,e.g=Jt.g,e.b=Jt.b,e}getStyle(e=on){tt.workingToColorSpace(Jt.copy(this),e);let t=Jt.r,i=Jt.g,s=Jt.b;return e!==on?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Ei),this.setHSL(Ei.h+e,Ei.s+t,Ei.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Ei),e.getHSL(da);let i=_r(Ei.h,da.h,t),s=_r(Ei.s,da.s,t),r=_r(Ei.l,da.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Jt=new qe;qe.NAMES=Ju;var Sr=class extends Ft{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Et,this.environmentIntensity=1,this.environmentRotation=new Et,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},In=new D,ri=new D,Vl=new D,ai=new D,xs=new D,ys=new D,Zh=new D,Hl=new D,Gl=new D,Wl=new D,Xl=new bt,Yl=new bt,ql=new bt,ci=class n{constructor(e=new D,t=new D,i=new D){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),In.subVectors(e,t),s.cross(In);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){In.subVectors(s,t),ri.subVectors(i,t),Vl.subVectors(e,t);let a=In.dot(In),o=In.dot(ri),l=In.dot(Vl),c=ri.dot(ri),h=ri.dot(Vl),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;let u=1/d,m=(c*l-o*h)*u,f=(a*h-o*l)*u;return r.set(1-m-f,f,m)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,ai)===null?!1:ai.x>=0&&ai.y>=0&&ai.x+ai.y<=1}static getInterpolation(e,t,i,s,r,a,o,l){return this.getBarycoord(e,t,i,s,ai)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ai.x),l.addScaledVector(a,ai.y),l.addScaledVector(o,ai.z),l)}static getInterpolatedAttribute(e,t,i,s,r,a){return Xl.setScalar(0),Yl.setScalar(0),ql.setScalar(0),Xl.fromBufferAttribute(e,t),Yl.fromBufferAttribute(e,i),ql.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Xl,r.x),a.addScaledVector(Yl,r.y),a.addScaledVector(ql,r.z),a}static isFrontFacing(e,t,i,s){return In.subVectors(i,t),ri.subVectors(e,t),In.cross(ri).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return In.subVectors(this.c,this.b),ri.subVectors(this.a,this.b),In.cross(ri).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,a,o;xs.subVectors(s,i),ys.subVectors(r,i),Hl.subVectors(e,i);let l=xs.dot(Hl),c=ys.dot(Hl);if(l<=0&&c<=0)return t.copy(i);Gl.subVectors(e,s);let h=xs.dot(Gl),d=ys.dot(Gl);if(h>=0&&d<=h)return t.copy(s);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(i).addScaledVector(xs,a);Wl.subVectors(e,r);let m=xs.dot(Wl),f=ys.dot(Wl);if(f>=0&&m<=f)return t.copy(r);let x=m*c-l*f;if(x<=0&&c>=0&&f<=0)return o=c/(c-f),t.copy(i).addScaledVector(ys,o);let g=h*f-m*d;if(g<=0&&d-h>=0&&m-f>=0)return Zh.subVectors(r,s),o=(d-h)/(d-h+(m-f)),t.copy(s).addScaledVector(Zh,o);let p=1/(g+x+u);return a=x*p,o=u*p,t.copy(i).addScaledVector(xs,a).addScaledVector(ys,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Ci=class{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Ln.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Ln.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=Ln.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Ln):Ln.fromBufferAttribute(r,a),Ln.applyMatrix4(e.matrixWorld),this.expandByPoint(Ln);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),fa.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),fa.copy(i.boundingBox)),fa.applyMatrix4(e.matrixWorld),this.union(fa)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Ln),Ln.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(fr),pa.subVectors(this.max,fr),vs.subVectors(e.a,fr),bs.subVectors(e.b,fr),Ms.subVectors(e.c,fr),Ti.subVectors(bs,vs),wi.subVectors(Ms,bs),ji.subVectors(vs,Ms);let t=[0,-Ti.z,Ti.y,0,-wi.z,wi.y,0,-ji.z,ji.y,Ti.z,0,-Ti.x,wi.z,0,-wi.x,ji.z,0,-ji.x,-Ti.y,Ti.x,0,-wi.y,wi.x,0,-ji.y,ji.x,0];return!jl(t,vs,bs,Ms,pa)||(t=[1,0,0,0,1,0,0,0,1],!jl(t,vs,bs,Ms,pa))?!1:(ma.crossVectors(Ti,wi),t=[ma.x,ma.y,ma.z],jl(t,vs,bs,Ms,pa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Ln).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Ln).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(oi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),oi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),oi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),oi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),oi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),oi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),oi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),oi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(oi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},oi=[new D,new D,new D,new D,new D,new D,new D,new D],Ln=new D,fa=new Ci,vs=new D,bs=new D,Ms=new D,Ti=new D,wi=new D,ji=new D,fr=new D,pa=new D,ma=new D,$i=new D;function jl(n,e,t,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){$i.fromArray(n,r);let o=s.x*Math.abs($i.x)+s.y*Math.abs($i.y)+s.z*Math.abs($i.z),l=e.dot($i),c=t.dot($i),h=i.dot($i);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Ut=new D,ga=new Fe,pp=0,Lt=class extends Un{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:pp++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Yu,this.updateRanges=[],this.gpuType=kn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)ga.fromBufferAttribute(this,t),ga.applyMatrix3(e),this.setXY(t,ga.x,ga.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.applyMatrix3(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.applyMatrix4(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.applyNormalMatrix(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.transformDirection(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=As(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=an(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=As(t,this.array)),t}setX(e,t){return this.normalized&&(t=an(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=As(t,this.array)),t}setY(e,t){return this.normalized&&(t=an(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=As(t,this.array)),t}setZ(e,t){return this.normalized&&(t=an(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=As(t,this.array)),t}setW(e,t){return this.normalized&&(t=an(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=an(t,this.array),i=an(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=an(t,this.array),i=an(i,this.array),s=an(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=an(t,this.array),i=an(i,this.array),s=an(s,this.array),r=an(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var Er=class extends Lt{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var Tr=class extends Lt{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var St=class extends Lt{constructor(e,t,i){super(new Float32Array(e),t,i)}},mp=new Ci,pr=new D,$l=new D,Qi=class{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):mp.setFromPoints(e).getCenter(i);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;pr.subVectors(e,this.center);let t=pr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(pr,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):($l.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(pr.copy(e.center).add($l)),this.expandByPoint(pr.copy(e.center).sub($l))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},gp=0,Mn=new pt,Zl=new Ft,Ss=new D,_n=new Ci,mr=new Ci,Gt=new D,Tt=class n extends Un{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:gp++}),this.uuid=qs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(zf(e)?Tr:Er)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new He().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Mn.makeRotationFromQuaternion(e),this.applyMatrix4(Mn),this}rotateX(e){return Mn.makeRotationX(e),this.applyMatrix4(Mn),this}rotateY(e){return Mn.makeRotationY(e),this.applyMatrix4(Mn),this}rotateZ(e){return Mn.makeRotationZ(e),this.applyMatrix4(Mn),this}translate(e,t,i){return Mn.makeTranslation(e,t,i),this.applyMatrix4(Mn),this}scale(e,t,i){return Mn.makeScale(e,t,i),this.applyMatrix4(Mn),this}lookAt(e){return Zl.lookAt(e),Zl.updateMatrix(),this.applyMatrix4(Zl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ss).negate(),this.translate(Ss.x,Ss.y,Ss.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new St(i,3))}else{let i=Math.min(e.length,t.count);for(let s=0;s<i;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Oe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ci);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ke("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];_n.setFromBufferAttribute(r),this.morphTargetsRelative?(Gt.addVectors(this.boundingBox.min,_n.min),this.boundingBox.expandByPoint(Gt),Gt.addVectors(this.boundingBox.max,_n.max),this.boundingBox.expandByPoint(Gt)):(this.boundingBox.expandByPoint(_n.min),this.boundingBox.expandByPoint(_n.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ke('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Qi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){ke("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){let i=this.boundingSphere.center;if(_n.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];mr.setFromBufferAttribute(o),this.morphTargetsRelative?(Gt.addVectors(_n.min,mr.min),_n.expandByPoint(Gt),Gt.addVectors(_n.max,mr.max),_n.expandByPoint(Gt)):(_n.expandByPoint(mr.min),_n.expandByPoint(mr.max))}_n.getCenter(i);let s=0;for(let r=0,a=e.count;r<a;r++)Gt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Gt));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Gt.fromBufferAttribute(o,c),l&&(Ss.fromBufferAttribute(e,c),Gt.add(Ss)),s=Math.max(s,i.distanceToSquared(Gt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&ke('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){ke("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new Lt(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let y=0;y<i.count;y++)o[y]=new D,l[y]=new D;let c=new D,h=new D,d=new D,u=new Fe,m=new Fe,f=new Fe,x=new D,g=new D;function p(y,A,L){c.fromBufferAttribute(i,y),h.fromBufferAttribute(i,A),d.fromBufferAttribute(i,L),u.fromBufferAttribute(r,y),m.fromBufferAttribute(r,A),f.fromBufferAttribute(r,L),h.sub(c),d.sub(c),m.sub(u),f.sub(u);let I=1/(m.x*f.y-f.x*m.y);isFinite(I)&&(x.copy(h).multiplyScalar(f.y).addScaledVector(d,-m.y).multiplyScalar(I),g.copy(d).multiplyScalar(m.x).addScaledVector(h,-f.x).multiplyScalar(I),o[y].add(x),o[A].add(x),o[L].add(x),l[y].add(g),l[A].add(g),l[L].add(g))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let y=0,A=T.length;y<A;++y){let L=T[y],I=L.start,z=L.count;for(let W=I,O=I+z;W<O;W+=3)p(e.getX(W+0),e.getX(W+1),e.getX(W+2))}let R=new D,b=new D,E=new D,S=new D;function P(y){E.fromBufferAttribute(s,y),S.copy(E);let A=o[y];R.copy(A),R.sub(E.multiplyScalar(E.dot(A))).normalize(),b.crossVectors(S,A);let I=b.dot(l[y])<0?-1:1;a.setXYZW(y,R.x,R.y,R.z,I)}for(let y=0,A=T.length;y<A;++y){let L=T[y],I=L.start,z=L.count;for(let W=I,O=I+z;W<O;W+=3)P(e.getX(W+0)),P(e.getX(W+1)),P(e.getX(W+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new Lt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let u=0,m=i.count;u<m;u++)i.setXYZ(u,0,0,0);let s=new D,r=new D,a=new D,o=new D,l=new D,c=new D,h=new D,d=new D;if(e)for(let u=0,m=e.count;u<m;u+=3){let f=e.getX(u+0),x=e.getX(u+1),g=e.getX(u+2);s.fromBufferAttribute(t,f),r.fromBufferAttribute(t,x),a.fromBufferAttribute(t,g),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),o.fromBufferAttribute(i,f),l.fromBufferAttribute(i,x),c.fromBufferAttribute(i,g),o.add(h),l.add(h),c.add(h),i.setXYZ(f,o.x,o.y,o.z),i.setXYZ(x,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let u=0,m=t.count;u<m;u+=3)s.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Gt.fromBufferAttribute(e,t),Gt.normalize(),e.setXYZ(t,Gt.x,Gt.y,Gt.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,d=o.normalized,u=new c.constructor(l.length*h),m=0,f=0;for(let x=0,g=l.length;x<g;x++){o.isInterleavedBufferAttribute?m=l[x]*o.data.stride+o.offset:m=l[x]*h;for(let p=0;p<h;p++)u[f++]=c[m++]}return new Lt(u,h,d)}if(this.index===null)return Oe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,i);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,d=c.length;h<d;h++){let u=c[h],m=e(u,i);l.push(m)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let m=c[d];h.push(m.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],d=r[c];for(let u=0,m=d.length;u<m;u++)h.push(d[u].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Jl=new D,_p=new D,xp=new He,ln=class{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=Jl.subVectors(i,t).cross(_p.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let s=e.delta(Jl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||xp.getNormalMatrix(e),s=this.coplanarPoint(Jl).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},yp=0,ui=class extends Un{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:yp++}),this.uuid=qs(),this.name="",this.type="Material",this.blending=Ws,this.side=Ui,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=gc,this.blendDst=_c,this.blendEquation=ns,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new qe(0,0,0),this.blendAlpha=0,this.depthFunc=Ps,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ku,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ua,this.stencilZFail=Ua,this.stencilZPass=Ua,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){Oe(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Oe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new qe().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(i=>new ln().fromJSON(i))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Fe().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Fe().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var li=new D,Kl=new D,_a=new D,xa=new D,Ri=class{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,li)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=li.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(li.copy(this.origin).addScaledVector(this.direction,t),li.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Kl.copy(e).add(t).multiplyScalar(.5),_a.copy(t).sub(e).normalize(),xa.copy(this.origin).sub(Kl);let r=e.distanceTo(t)*.5,a=-this.direction.dot(_a),o=xa.dot(this.direction),l=-xa.dot(_a),c=xa.lengthSq(),h=Math.abs(1-a*a),d,u,m,f;if(h>0)if(d=a*l-o,u=a*o-l,f=r*h,d>=0)if(u>=-f)if(u<=f){let x=1/h;d*=x,u*=x,m=d*(d+a*u+2*o)+u*(a*d+u+2*l)+c}else u=r,d=Math.max(0,-(a*u+o)),m=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(a*u+o)),m=-d*d+u*(u+2*l)+c;else u<=-f?(d=Math.max(0,-(-a*r+o)),u=d>0?-r:Math.min(Math.max(-r,-l),r),m=-d*d+u*(u+2*l)+c):u<=f?(d=0,u=Math.min(Math.max(-r,-l),r),m=u*(u+2*l)+c):(d=Math.max(0,-(a*r+o)),u=d>0?r:Math.min(Math.max(-r,-l),r),m=-d*d+u*(u+2*l)+c);else u=a>0?-r:r,d=Math.max(0,-(a*u+o)),m=-d*d+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Kl).addScaledVector(_a,u),m}intersectSphere(e,t){if(e.radius<0)return null;li.subVectors(e.center,this.origin);let i=li.dot(this.direction),s=li.dot(li)-i*i,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(i=(e.min.x-u.x)*c,s=(e.max.x-u.x)*c):(i=(e.max.x-u.x)*c,s=(e.min.x-u.x)*c),h>=0?(r=(e.min.y-u.y)*h,a=(e.max.y-u.y)*h):(r=(e.max.y-u.y)*h,a=(e.min.y-u.y)*h),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(e.min.z-u.z)*d,l=(e.max.z-u.z)*d):(o=(e.max.z-u.z)*d,l=(e.min.z-u.z)*d),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,li)!==null}intersectTriangle(e,t,i,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,d=e.x-a.x,u=e.y-a.y,m=e.z-a.z,f=t.x-a.x,x=t.y-a.y,g=t.z-a.z,p=i.x-a.x,T=i.y-a.y,R=i.z-a.z,b=Math.abs(l),E=Math.abs(c),S=Math.abs(h),P,y,A,L,I,z,W,O,k,Q,$,re;if(b>=E&&b>=S?(A=l,z=d,k=f,re=p,l>=0?(P=c,y=h,L=u,I=m,W=x,O=g,Q=T,$=R):(P=h,y=c,L=m,I=u,W=g,O=x,Q=R,$=T)):E>=S?(A=c,z=u,k=x,re=T,c>=0?(P=h,y=l,L=m,I=d,W=g,O=f,Q=R,$=p):(P=l,y=h,L=d,I=m,W=f,O=g,Q=p,$=R)):(A=h,z=m,k=g,re=R,h>=0?(P=l,y=c,L=d,I=u,W=f,O=x,Q=p,$=T):(P=c,y=l,L=u,I=d,W=x,O=f,Q=T,$=p)),A===0)return null;let j=P/A,ae=y/A,ee=1/A,Le=L-j*z,Ie=I-ae*z,st=W-j*k,Ue=O-ae*k,nt=Q-j*re,J=$-ae*re,oe=nt*Ue-J*st,Se=Le*J-Ie*nt,Be=st*Ie-Ue*Le;if(s){if(oe<0||Se<0||Be<0)return null}else if((oe<0||Se<0||Be<0)&&(oe>0||Se>0||Be>0))return null;let be=oe+Se+Be;if(be===0)return null;let Ge=ee*(oe*z+Se*k+Be*re);return(be>0?Ge<0:Ge>0)?null:this.at(Ge/be,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Qt=class extends ui{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new qe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Et,this.combine=go,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Jh=new pt,Zi=new Ri,ya=new Qi,Kh=new D,va=new D,ba=new D,Ma=new D,Ql=new D,Sa=new D,Qh=new D,Ea=new D,Mt=class extends Ft{constructor(e=new Tt,t=new Qt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Sa.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],d=r[l];h!==0&&(Ql.fromBufferAttribute(d,e),a?Sa.addScaledVector(Ql,h):Sa.addScaledVector(Ql.sub(t),h))}t.add(Sa)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),ya.copy(i.boundingSphere),ya.applyMatrix4(r),Zi.copy(e.ray).recast(e.near),!(ya.containsPoint(Zi.origin)===!1&&(Zi.intersectSphere(ya,Kh)===null||Zi.origin.distanceToSquared(Kh)>(e.far-e.near)**2))&&(Jh.copy(r).invert(),Zi.copy(e.ray).applyMatrix4(Jh),!(i.boundingBox!==null&&Zi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Zi)))}_computeIntersections(e,t,i){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,m=r.drawRange;if(o!==null)if(Array.isArray(a))for(let f=0,x=u.length;f<x;f++){let g=u[f],p=a[g.materialIndex],T=Math.max(g.start,m.start),R=Math.min(o.count,Math.min(g.start+g.count,m.start+m.count));for(let b=T,E=R;b<E;b+=3){let S=o.getX(b),P=o.getX(b+1),y=o.getX(b+2);s=Ta(this,p,e,i,c,h,d,S,P,y),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let f=Math.max(0,m.start),x=Math.min(o.count,m.start+m.count);for(let g=f,p=x;g<p;g+=3){let T=o.getX(g),R=o.getX(g+1),b=o.getX(g+2);s=Ta(this,a,e,i,c,h,d,T,R,b),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let f=0,x=u.length;f<x;f++){let g=u[f],p=a[g.materialIndex],T=Math.max(g.start,m.start),R=Math.min(l.count,Math.min(g.start+g.count,m.start+m.count));for(let b=T,E=R;b<E;b+=3){let S=b,P=b+1,y=b+2;s=Ta(this,p,e,i,c,h,d,S,P,y),s&&(s.faceIndex=Math.floor(b/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let f=Math.max(0,m.start),x=Math.min(l.count,m.start+m.count);for(let g=f,p=x;g<p;g+=3){let T=g,R=g+1,b=g+2;s=Ta(this,a,e,i,c,h,d,T,R,b),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}}};function vp(n,e,t,i,s,r,a,o){let l;if(e.side===cn?l=i.intersectTriangle(a,r,s,!0,o):l=i.intersectTriangle(s,r,a,e.side===Ui,o),l===null)return null;Ea.copy(o),Ea.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(Ea);return c<t.near||c>t.far?null:{distance:c,point:Ea.clone(),object:n}}function Ta(n,e,t,i,s,r,a,o,l,c){n.getVertexPosition(o,va),n.getVertexPosition(l,ba),n.getVertexPosition(c,Ma);let h=vp(n,e,t,i,va,ba,Ma,Qh);if(h){let d=new D;ci.getBarycoord(Qh,va,ba,Ma,d),s&&(h.uv=ci.getInterpolatedAttribute(s,o,l,c,d,new Fe)),r&&(h.uv1=ci.getInterpolatedAttribute(r,o,l,c,d,new Fe)),a&&(h.normal=ci.getInterpolatedAttribute(a,o,l,c,d,new D),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new D,materialIndex:0};ci.getNormal(va,ba,Ma,u.normal),h.face=u,h.barycoord=d}return h}var $a=class extends un{constructor(e=null,t=1,i=1,s,r,a,o,l,c=Wt,h=Wt,d,u){super(null,a,o,l,c,h,s,r,d,u),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ji=new Qi,bp=new Fe(.5,.5),wa=new D,Os=class{constructor(e=new ln,t=new ln,i=new ln,s=new ln,r=new ln,a=new ln){this.planes=[e,t,i,s,r,a]}set(e,t,i,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=Dn,i=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],d=r[5],u=r[6],m=r[7],f=r[8],x=r[9],g=r[10],p=r[11],T=r[12],R=r[13],b=r[14],E=r[15];if(s[0].setComponents(c-a,m-h,p-f,E-T).normalize(),s[1].setComponents(c+a,m+h,p+f,E+T).normalize(),s[2].setComponents(c+o,m+d,p+x,E+R).normalize(),s[3].setComponents(c-o,m-d,p-x,E-R).normalize(),i)s[4].setComponents(l,u,g,b).normalize(),s[5].setComponents(c-l,m-u,p-g,E-b).normalize();else if(s[4].setComponents(c-l,m-u,p-g,E-b).normalize(),t===Dn)s[5].setComponents(c+l,m+u,p+g,E+b).normalize();else if(t===Is)s[5].setComponents(l,u,g,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ji.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ji.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ji)}intersectsSprite(e){Ji.center.set(0,0,0);let t=bp.distanceTo(e.center);return Ji.radius=.7071067811865476+t,Ji.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ji)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(wa.x=s.normal.x>0?e.max.x:e.min.x,wa.y=s.normal.y>0?e.max.y:e.min.y,wa.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(wa)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Sn=class extends ui{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new qe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Za=new D,Ja=new D,eu=new pt,gr=new Ri,Aa=new Qi,ec=new D,tu=new D,Bs=class extends Ft{constructor(e=new Tt,t=new Sn){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)Za.fromBufferAttribute(t,s-1),Ja.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=Za.distanceTo(Ja);e.setAttribute("lineDistance",new St(i,1))}else Oe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Aa.copy(i.boundingSphere),Aa.applyMatrix4(s),Aa.radius+=r,e.ray.intersectsSphere(Aa)===!1)return;eu.copy(s).invert(),gr.copy(e.ray).applyMatrix4(eu);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=i.index,u=i.attributes.position;if(h!==null){let m=Math.max(0,a.start),f=Math.min(h.count,a.start+a.count);for(let x=m,g=f-1;x<g;x+=c){let p=h.getX(x),T=h.getX(x+1),R=Ca(this,e,gr,l,p,T,x);R&&t.push(R)}if(this.isLineLoop){let x=h.getX(f-1),g=h.getX(m),p=Ca(this,e,gr,l,x,g,f-1);p&&t.push(p)}}else{let m=Math.max(0,a.start),f=Math.min(u.count,a.start+a.count);for(let x=m,g=f-1;x<g;x+=c){let p=Ca(this,e,gr,l,x,x+1,x);p&&t.push(p)}if(this.isLineLoop){let x=Ca(this,e,gr,l,f-1,m,f-1);x&&t.push(x)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Ca(n,e,t,i,s,r,a){let o=n.geometry.attributes.position;if(Za.fromBufferAttribute(o,s),Ja.fromBufferAttribute(o,r),t.distanceSqToSegment(Za,Ja,ec,tu)>i)return;ec.applyMatrix4(n.matrixWorld);let c=e.ray.origin.distanceTo(ec);if(!(c<e.near||c>e.far))return{distance:c,point:tu.clone().applyMatrix4(n.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:n}}var nu=new D,iu=new D,Kn=class extends Bs{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)nu.fromBufferAttribute(t,s),iu.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+nu.distanceTo(iu);e.setAttribute("lineDistance",new St(i,1))}else Oe("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var wr=class extends un{constructor(e=[],t=Fi,i,s,r,a,o,l,c,h){super(e,t,i,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var Pi=class extends un{constructor(e,t,i=Bn,s,r,a,o=Wt,l=Wt,c,h=Jn,d=1){if(h!==Jn&&h!==Bi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:d};super(u,s,r,a,o,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ns(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Ka=class extends Pi{constructor(e,t=Bn,i=Fi,s,r,a=Wt,o=Wt,l,c=Jn){let h={width:e,height:e,depth:1},d=[h,h,h,h,h,h];super(e,e,t,i,s,r,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Ar=class extends un{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},ks=class n extends Tt{constructor(e=1,t=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],d=[],u=0,m=0;f("z","y","x",-1,-1,i,t,e,a,r,0),f("z","y","x",1,-1,i,t,-e,a,r,1),f("x","z","y",1,1,e,i,t,s,a,2),f("x","z","y",1,-1,e,i,-t,s,a,3),f("x","y","z",1,-1,e,t,i,s,r,4),f("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new St(c,3)),this.setAttribute("normal",new St(h,3)),this.setAttribute("uv",new St(d,2));function f(x,g,p,T,R,b,E,S,P,y,A){let L=b/P,I=E/y,z=b/2,W=E/2,O=S/2,k=P+1,Q=y+1,$=0,re=0,j=new D;for(let ae=0;ae<Q;ae++){let ee=ae*I-W;for(let Le=0;Le<k;Le++){let Ie=Le*L-z;j[x]=Ie*T,j[g]=ee*R,j[p]=O,c.push(j.x,j.y,j.z),j[x]=0,j[g]=0,j[p]=S>0?1:-1,h.push(j.x,j.y,j.z),d.push(Le/P),d.push(1-ae/y),$+=1}}for(let ae=0;ae<y;ae++)for(let ee=0;ee<P;ee++){let Le=u+ee+k*ae,Ie=u+ee+k*(ae+1),st=u+(ee+1)+k*(ae+1),Ue=u+(ee+1)+k*ae;l.push(Le,Ie,Ue),l.push(Ie,st,Ue),re+=6}o.addGroup(m,re,A),m+=re,u+=$}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Ra=new D,Pa=new D,tc=new D,Ia=new ci,es=class extends Tt{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){let s=Math.pow(10,4),r=Math.cos(Cs*t),a=e.getIndex(),o=e.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],h=["a","b","c"],d=new Array(3),u={},m=[];for(let f=0;f<l;f+=3){a?(c[0]=a.getX(f),c[1]=a.getX(f+1),c[2]=a.getX(f+2)):(c[0]=f,c[1]=f+1,c[2]=f+2);let{a:x,b:g,c:p}=Ia;if(x.fromBufferAttribute(o,c[0]),g.fromBufferAttribute(o,c[1]),p.fromBufferAttribute(o,c[2]),Ia.getNormal(tc),d[0]=`${Math.round(x.x*s)},${Math.round(x.y*s)},${Math.round(x.z*s)}`,d[1]=`${Math.round(g.x*s)},${Math.round(g.y*s)},${Math.round(g.z*s)}`,d[2]=`${Math.round(p.x*s)},${Math.round(p.y*s)},${Math.round(p.z*s)}`,!(d[0]===d[1]||d[1]===d[2]||d[2]===d[0]))for(let T=0;T<3;T++){let R=(T+1)%3,b=d[T],E=d[R],S=Ia[h[T]],P=Ia[h[R]],y=`${b}_${E}`,A=`${E}_${b}`;A in u&&u[A]?(tc.dot(u[A].normal)<=r&&(m.push(S.x,S.y,S.z),m.push(P.x,P.y,P.z)),u[A]=null):y in u||(u[y]={index0:c[T],index1:c[R],normal:tc.clone()})}}for(let f in u)if(u[f]){let{index0:x,index1:g}=u[f];Ra.fromBufferAttribute(o,x),Pa.fromBufferAttribute(o,g),m.push(Ra.x,Ra.y,Ra.z),m.push(Pa.x,Pa.y,Pa.z)}this.setAttribute("position",new St(m,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};var ts=class n extends Tt{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(i),l=Math.floor(s),c=o+1,h=l+1,d=e/o,u=t/l,m=[],f=[],x=[],g=[];for(let p=0;p<h;p++){let T=p*u-a;for(let R=0;R<c;R++){let b=R*d-r;f.push(b,-T,0),x.push(0,0,1),g.push(R/o),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let T=0;T<o;T++){let R=T+c*p,b=T+c*(p+1),E=T+1+c*(p+1),S=T+1+c*p;m.push(R,b,S),m.push(b,E,S)}this.setIndex(m),this.setAttribute("position",new St(f,3)),this.setAttribute("normal",new St(x,3)),this.setAttribute("uv",new St(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}};var zs=class n extends Tt{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(a+o,Math.PI),c=0,h=[],d=new D,u=new D,m=[],f=[],x=[],g=[];for(let p=0;p<=i;p++){let T=[],R=p/i,b=a+R*o,E=e*Math.cos(b),S=Math.sqrt(e*e-E*E),P=0;p===0&&a===0?P=.5/t:p===i&&l===Math.PI&&(P=-.5/t);for(let y=0;y<=t;y++){let A=y/t,L=s+A*r;d.x=-S*Math.cos(L),d.y=E,d.z=S*Math.sin(L),f.push(d.x,d.y,d.z),u.copy(d).normalize(),x.push(u.x,u.y,u.z),g.push(A+P,1-R),T.push(c++)}h.push(T)}for(let p=0;p<i;p++)for(let T=0;T<t;T++){let R=h[p][T+1],b=h[p][T],E=h[p+1][T],S=h[p+1][T+1];(p!==0||a>0)&&m.push(R,b,S),(p!==i-1||l<Math.PI)&&m.push(b,E,S)}this.setIndex(m),this.setAttribute("position",new St(f,3)),this.setAttribute("normal",new St(x,3)),this.setAttribute("uv",new St(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Cr=class extends Tt{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],i=new Set,s=new D,r=new D;if(e.index!==null){let a=e.attributes.position,o=e.index,l=e.groups;l.length===0&&(l=[{start:0,count:o.count,materialIndex:0}]);for(let c=0,h=l.length;c<h;++c){let d=l[c],u=d.start,m=d.count;for(let f=u,x=u+m;f<x;f+=3)for(let g=0;g<3;g++){let p=o.getX(f+g),T=o.getX(f+(g+1)%3);s.fromBufferAttribute(a,p),r.fromBufferAttribute(a,T),su(s,r,i)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}}else{let a=e.attributes.position;for(let o=0,l=a.count/3;o<l;o++)for(let c=0;c<3;c++){let h=3*o+c,d=3*o+(c+1)%3;s.fromBufferAttribute(a,h),r.fromBufferAttribute(a,d),su(s,r,i)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}this.setAttribute("position",new St(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function su(n,e,t){let i=`${n.x},${n.y},${n.z}-${e.x},${e.y},${e.z}`,s=`${e.x},${e.y},${e.z}-${n.x},${n.y},${n.z}`;return t.has(i)===!0||t.has(s)===!0?!1:(t.add(i),t.add(s),!0)}function ss(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];if(ru(s))s.isRenderTargetTexture?(Oe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone();else if(Array.isArray(s))if(ru(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][i]=r}else e[t][i]=s.slice();else e[t][i]=s}}return e}function en(n){let e={};for(let t=0;t<n.length;t++){let i=ss(n[t]);for(let s in i)e[s]=i[s]}return e}function ru(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function Mp(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Fc(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:tt.workingColorSpace}var Ku={clone:ss,merge:en},Sp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Ep=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,xn=class extends ui{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Sp,this.fragmentShader=Ep,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ss(e.uniforms),this.uniformsGroups=Mp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let s=e.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=t[s.value]||null;break;case"c":this.uniforms[i].value=new qe().setHex(s.value);break;case"v2":this.uniforms[i].value=new Fe().fromArray(s.value);break;case"v3":this.uniforms[i].value=new D().fromArray(s.value);break;case"v4":this.uniforms[i].value=new bt().fromArray(s.value);break;case"m3":this.uniforms[i].value=new He().fromArray(s.value);break;case"m4":this.uniforms[i].value=new pt().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Qa=class extends xn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var Rr=class extends ui{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new qe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new qe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=nl,this.normalScale=new Fe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Et,this.combine=go,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},eo=class extends ui{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Ou,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},to=class extends ui{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Es(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function nc(n){return n!==void 0&&n.inTangents!==void 0&&n.outTangents!==void 0}var Ii=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=s,s=t[++i],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(i=2,r=o);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=t[--i-1],e>=r)break e}a=i,i=0;break t}break n}for(;i<a;){let o=i+a>>>1;e<t[o]?a=o:i=o+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=i[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},no=class extends Ii{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:rc,endingEnd:rc}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case ac:r=e,o=2*t-i;break;case oc:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case ac:a=e,l=2*i-t;break;case oc:a=1,l=i+s[1]-s[0];break;default:a=e-1,l=t}let c=(i-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,m=this._weightNext,f=(i-t)/(s-t),x=f*f,g=x*f,p=-u*g+2*u*x-u*f,T=(1+u)*g+(-1.5-2*u)*x+(-.5+u)*f+1,R=(-1-m)*g+(1.5+m)*x+.5*f,b=m*g-m*x;for(let E=0;E!==o;++E)r[E]=p*a[h+E]+T*a[c+E]+R*a[l+E]+b*a[d+E];return r}},io=class extends Ii{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(i-t)/(s-t),d=1-h;for(let u=0;u!==o;++u)r[u]=a[c+u]*d+a[l+u]*h;return r}},so=class extends Ii{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},ro=class extends Ii{interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this.inTangents,d=this.outTangents;if(!h||!d){let f=(i-t)/(s-t),x=1-f;for(let g=0;g!==o;++g)r[g]=a[c+g]*x+a[l+g]*f;return r}let u=o*2,m=e-1;for(let f=0;f!==o;++f){let x=a[c+f],g=a[l+f],p=m*u+f*2,T=d[p],R=d[p+1],b=e*u+f*2,E=h[b],S=h[b+1],P=wp(i,t,T,E,s);r[f]=Qu(P,x,R,S,g)}return r}};function Qu(n,e,t,i,s){let r=1-n;return r*r*r*e+3*r*r*n*t+3*r*n*n*i+n*n*n*s}function Tp(n,e,t,i,s){let r=1-n;return 3*r*r*(t-e)+6*r*n*(i-t)+3*n*n*(s-i)}function wp(n,e,t,i,s){let r=(n-e)/(s-e);for(let a=0;a<8;a++){let o=Qu(r,e,t,i,s)-n;if(Math.abs(o)<1e-10)break;let l=Tp(r,e,t,i,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var yn=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Es(t,this.TimeBufferType),this.values=Es(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Es(e.times,Array),values:Es(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s),nc(e.settings)&&(i.settings={inTangents:Es(e.settings.inTangents,Array),outTangents:Es(e.settings.outTangents,Array)})}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new so(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new io(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new no(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new ro(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case xr:t=this.InterpolantFactoryMethodDiscrete;break;case Xa:t=this.InterpolantFactoryMethodLinear;break;case Na:t=this.InterpolantFactoryMethodSmooth;break;case sc:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Oe("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return xr;case this.InterpolantFactoryMethodLinear:return Xa;case this.InterpolantFactoryMethodSmooth:return Na;case this.InterpolantFactoryMethodBezier:return sc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e;nc(this.settings)&&(au(this.settings.inTangents,e),au(this.settings.outTangents,e))}return this}trim(e,t){let i=this.times,s=i.length,r=0,a=s-1;for(;r!==s&&i[r]<e;)++r;for(;a!==-1&&i[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(ke("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(ke("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){ke("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){ke("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&Vf(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){ke("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Na,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(s)l=!0;else{let d=o*i,u=d-i,m=d+i;for(let f=0;f!==i;++f){let x=t[d+f];if(x!==t[u+f]||x!==t[m+f]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let d=o*i,u=a*i;for(let m=0;m!==i;++m)t[u+m]=t[d+m]}++a}}if(r>0){e[a]=e[r];for(let o=r*i,l=a*i,c=0;c!==i;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,nc(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function au(n,e){for(let t=0,i=n.length;t!==i;t+=2)n[t]*=e}yn.prototype.ValueTypeName="";yn.prototype.TimeBufferType=Float32Array;yn.prototype.ValueBufferType=Float32Array;yn.prototype.DefaultInterpolation=Xa;var Li=class extends yn{constructor(e,t,i){super(e,t,i)}};Li.prototype.ValueTypeName="bool";Li.prototype.ValueBufferType=Array;Li.prototype.DefaultInterpolation=xr;Li.prototype.InterpolantFactoryMethodLinear=void 0;Li.prototype.InterpolantFactoryMethodSmooth=void 0;var ao=class extends yn{constructor(e,t,i,s){super(e,t,i,s)}};ao.prototype.ValueTypeName="color";var oo=class extends yn{constructor(e,t,i,s){super(e,t,i,s)}};oo.prototype.ValueTypeName="number";var lo=class extends Ii{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(i-t)/(s-t),c=e*o;for(let h=c+o;c!==h;c+=4)vt.slerpFlat(r,0,a,c-o,a,c,l);return r}},Pr=class extends yn{constructor(e,t,i,s){super(e,t,i,s)}InterpolantFactoryMethodLinear(e){return new lo(this.times,this.values,this.getValueSize(),e)}};Pr.prototype.ValueTypeName="quaternion";Pr.prototype.InterpolantFactoryMethodSmooth=void 0;var Di=class extends yn{constructor(e,t,i){super(e,t,i)}};Di.prototype.ValueTypeName="string";Di.prototype.ValueBufferType=Array;Di.prototype.DefaultInterpolation=xr;Di.prototype.InterpolantFactoryMethodLinear=void 0;Di.prototype.InterpolantFactoryMethodSmooth=void 0;var co=class extends yn{constructor(e,t,i,s){super(e,t,i,s)}};co.prototype.ValueTypeName="vector";var ho=class{constructor(e,t,i){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let m=c[d],f=c[d+1];if(m.global&&(m.lastIndex=0),m.test(h))return f}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},ed=new ho,uo=class{constructor(e){this.manager=e!==void 0?e:ed,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};uo.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ir=class extends Ft{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new qe(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Lr=class extends Ir{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ft.DEFAULT_UP),this.updateMatrix(),this.groundColor=new qe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},ic=new pt,ou=new D,lu=new D,fo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Fe(512,512),this.mapType=fn,this.map=null,this.mapPass=null,this.matrix=new pt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Os,this._frameExtents=new Fe(1,1),this._viewportCount=1,this._viewports=[new bt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;ou.setFromMatrixPosition(e.matrixWorld),t.position.copy(ou),lu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(lu),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,i,s){ic.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),i.setFromProjectionMatrix(ic,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===Is||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(ic)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},La=new D,Da=new vt,$n=new D,Dr=class extends Ft{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new pt,this.projectionMatrix=new pt,this.projectionMatrixInverse=new pt,this.coordinateSystem=Dn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(La,Da,$n),$n.x===1&&$n.y===1&&$n.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(La,Da,$n.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(La,Da,$n),$n.x===1&&$n.y===1&&$n.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(La,Da,$n.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ai=new D,cu=new Fe,hu=new Fe,Kt=class extends Dr{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Ds*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Cs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ds*2*Math.atan(Math.tan(Cs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Ai.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ai.x,Ai.y).multiplyScalar(-e/Ai.z),Ai.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Ai.x,Ai.y).multiplyScalar(-e/Ai.z)}getViewSize(e,t){return this.getViewBounds(e,cu,hu),t.subVectors(hu,cu)}setViewOffset(e,t,i,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Cs*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*i/c,s*=a.width/l,i*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Vs=class extends Dr{constructor(e=-1,t=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,a=i+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},lc=class extends fo{constructor(){super(new Vs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Nr=class extends Ir{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ft.DEFAULT_UP),this.updateMatrix(),this.target=new Ft,this.shadow=new lc}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Ts=-90,ws=1,po=class extends Ft{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Kt(Ts,ws,e,t);s.layers=this.layers,this.add(s);let r=new Kt(Ts,ws,e,t);r.layers=this.layers,this.add(r);let a=new Kt(Ts,ws,e,t);a.layers=this.layers,this.add(a);let o=new Kt(Ts,ws,e,t);o.layers=this.layers,this.add(o);let l=new Kt(Ts,ws,e,t);l.layers=this.layers,this.add(l);let c=new Kt(Ts,ws,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===Dn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Is)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,d=e.getRenderTarget(),u=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),f=e.xr.enabled;e.xr.enabled=!1;let x=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let g=!1;e.isWebGLRenderer===!0?g=e.state.buffers.depth.getReversed():g=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(i,4,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),i.texture.generateMipmaps=x,e.setRenderTarget(i,5,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(d,u,m),e.xr.enabled=f,i.texture.needsPMREMUpdate=!0}},mo=class extends Kt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Oc="\\[\\]\\.:\\/",Ap=new RegExp("["+Oc+"]","g"),Bc="[^"+Oc+"]",Cp="[^"+Oc.replace("\\.","")+"]",Rp=/((?:WC+[\/:])*)/.source.replace("WC",Bc),Pp=/(WCOD+)?/.source.replace("WCOD",Cp),Ip=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Bc),Lp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Bc),Dp=new RegExp("^"+Rp+Pp+Ip+Lp+"$"),Np=["material","materials","bones","map"],cc=class{constructor(e,t,i){let s=i||yt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},yt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Ap,"")}static parseTrackName(e){let t=Dp.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);Np.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=i(o.children);if(l)return l}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Oe("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){ke("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){ke("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){ke("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){ke("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){ke("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){ke("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;ke("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){ke("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};yt.Composite=cc;yt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};yt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};yt.prototype.GetterByBindingType=[yt.prototype._getValue_direct,yt.prototype._getValue_array,yt.prototype._getValue_arrayElement,yt.prototype._getValue_toArray];yt.prototype.SetterByBindingTypeAndVersioning=[[yt.prototype._setValue_direct,yt.prototype._setValue_direct_setNeedsUpdate,yt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[yt.prototype._setValue_array,yt.prototype._setValue_array_setNeedsUpdate,yt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[yt.prototype._setValue_arrayElement,yt.prototype._setValue_arrayElement_setNeedsUpdate,yt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[yt.prototype._setValue_fromArray,yt.prototype._setValue_fromArray_setNeedsUpdate,yt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var gy=new Float32Array(1);var uu=new pt,Ur=class{constructor(e,t,i=0,s=1/0){this.ray=new Ri(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new Us,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):ke("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return uu.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(uu),this}intersectObject(e,t=!0,i=[]){return hc(e,this,i,t),i.sort(du),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)hc(e[s],this,i,t);return i.sort(du),i}};function du(n,e){return n.distance-e.distance}function hc(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){let r=n.children;for(let a=0,o=r.length;a<o;a++)hc(r[a],e,t,!0)}}var Hs=class{constructor(e=1,t=0,i=0){this.radius=e,this.phi=t,this.theta=i}set(e,t,i){return this.radius=e,this.phi=t,this.theta=i,this}copy(e){return this.radius=e.radius,this.phi=e.phi,this.theta=e.theta,this}makeSafe(){return this.phi=Je(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(e){return this.setFromCartesianCoords(e.x,e.y,e.z)}setFromCartesianCoords(e,t,i){return this.radius=Math.sqrt(e*e+t*t+i*i),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(e,i),this.phi=Math.acos(Je(t/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var uc=class n{static{n.prototype.isMatrix2=!0}constructor(e,t,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=s,this}};var Fr=class extends Kn{constructor(e=10,t=10,i=4473924,s=8947848){i=new qe(i),s=new qe(s);let r=t/2,a=e/t,o=e/2,l=[],c=[];for(let u=0,m=0,f=-o;u<=t;u++,f+=a){l.push(-o,0,f,o,0,f),l.push(f,0,-o,f,0,o);let x=u===r?i:s;x.toArray(c,m),m+=3,x.toArray(c,m),m+=3,x.toArray(c,m),m+=3,x.toArray(c,m),m+=3}let h=new Tt;h.setAttribute("position",new St(l,3)),h.setAttribute("color",new St(c,3));let d=new Sn({vertexColors:!0,toneMapped:!1});super(h,d),this.type="GridHelper"}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}};var Or=class extends Un{constructor(e,t=null){super(),this.object=e,this.domElement=t,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(e){this.domElement!==null&&this.disconnect(),this.domElement=e}disconnect(){}dispose(){}update(){}};function kc(n,e,t,i){let s=Up(i);switch(t){case Pc:return n*e;case Lc:return n*e/s.components*s.byteLength;case So:return n*e/s.components*s.byteLength;case ki:return n*e*2/s.components*s.byteLength;case Eo:return n*e*2/s.components*s.byteLength;case Ic:return n*e*3/s.components*s.byteLength;case En:return n*e*4/s.components*s.byteLength;case To:return n*e*4/s.components*s.byteLength;case Vr:case Hr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Gr:case Wr:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Ao:case Ro:return Math.max(n,16)*Math.max(e,8)/4;case wo:case Co:return Math.max(n,8)*Math.max(e,8)/2;case Po:case Io:case Do:case No:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Lo:case Xr:case Uo:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Fo:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Oo:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Bo:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case ko:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case zo:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case Vo:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case Ho:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case Go:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case Wo:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case Xo:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case Yo:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case qo:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case jo:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case $o:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case Zo:case Jo:case Ko:return Math.ceil(n/4)*Math.ceil(e/4)*16;case Qo:case el:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Yr:case tl:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Up(n){switch(n){case fn:case wc:return{byteLength:1,components:1};case Xs:case Ac:case zn:return{byteLength:2,components:1};case bo:case Mo:return{byteLength:2,components:4};case Bn:case vo:case kn:return{byteLength:4,components:1};case Cc:case Rc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Oe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Md(){let n=null,e=!1,t=null,i=null;function s(r,a){i=n.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function Op(n){let e=new WeakMap;function t(o,l){let c=o.array,h=o.usage,d=c.byteLength,u=n.createBuffer();n.bindBuffer(l,u),n.bufferData(l,c,h),o.onUploadCallback();let m;if(c instanceof Float32Array)m=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)m=n.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?m=n.HALF_FLOAT:m=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)m=n.SHORT;else if(c instanceof Uint32Array)m=n.UNSIGNED_INT;else if(c instanceof Int32Array)m=n.INT;else if(c instanceof Int8Array)m=n.BYTE;else if(c instanceof Uint8Array)m=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)m=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:m,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function i(o,l,c){let h=l.array,d=l.updateRanges;if(n.bindBuffer(c,o),d.length===0)n.bufferSubData(c,0,h);else{d.sort((m,f)=>m.start-f.start);let u=0;for(let m=1;m<d.length;m++){let f=d[u],x=d[m];x.start<=f.start+f.count+1?f.count=Math.max(f.count,x.start+x.count-f.start):(++u,d[u]=x)}d.length=u+1;for(let m=0,f=d.length;m<f;m++){let x=d[m];n.bufferSubData(c,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(n.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Bp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,kp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,zp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Vp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Hp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Gp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Wp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Xp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Yp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,qp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,jp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,$p=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Zp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Jp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Kp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Qp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,em=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,tm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,nm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,im=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,sm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,rm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,am=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,om=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,lm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,cm=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,hm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,um=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,dm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,fm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,pm="gl_FragColor = linearToOutputTexel( gl_FragColor );",mm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,gm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,_m=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,xm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,ym=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,vm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,bm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Mm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Sm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Em=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Tm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,wm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Am=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Cm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Rm=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Pm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Im=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Lm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Dm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Nm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Um=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Fm=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Om=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Bm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,km=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,zm=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Vm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Hm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Gm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Wm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Xm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ym=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,qm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,jm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,$m=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Zm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Jm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Km=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Qm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,eg=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,tg=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ng=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,ig=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,sg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,rg=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ag=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,og=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,lg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,cg=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,hg=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ug=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,dg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,fg=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,pg=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,mg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,gg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,_g=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,xg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,yg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,vg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,bg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Mg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Sg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Eg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Tg=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,wg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Ag=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Cg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Rg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Pg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Ig=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Lg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Dg=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Ng=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Ug=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Fg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Og=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Bg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,kg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,zg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Vg=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Hg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Gg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Wg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Xg=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Yg=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,qg=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,jg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,$g=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Zg=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Jg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Kg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Qg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,e0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,t0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,n0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,i0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,s0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,r0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,a0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,o0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,l0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,c0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,h0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,u0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,d0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,f0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,p0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,m0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,g0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,_0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,je={alphahash_fragment:Bp,alphahash_pars_fragment:kp,alphamap_fragment:zp,alphamap_pars_fragment:Vp,alphatest_fragment:Hp,alphatest_pars_fragment:Gp,aomap_fragment:Wp,aomap_pars_fragment:Xp,batching_pars_vertex:Yp,batching_vertex:qp,begin_vertex:jp,beginnormal_vertex:$p,bsdfs:Zp,iridescence_fragment:Jp,bumpmap_pars_fragment:Kp,clipping_planes_fragment:Qp,clipping_planes_pars_fragment:em,clipping_planes_pars_vertex:tm,clipping_planes_vertex:nm,color_fragment:im,color_pars_fragment:sm,color_pars_vertex:rm,color_vertex:am,common:om,cube_uv_reflection_fragment:lm,defaultnormal_vertex:cm,displacementmap_pars_vertex:hm,displacementmap_vertex:um,emissivemap_fragment:dm,emissivemap_pars_fragment:fm,colorspace_fragment:pm,colorspace_pars_fragment:mm,envmap_fragment:gm,envmap_common_pars_fragment:_m,envmap_pars_fragment:xm,envmap_pars_vertex:ym,envmap_physical_pars_fragment:Pm,envmap_vertex:vm,fog_vertex:bm,fog_pars_vertex:Mm,fog_fragment:Sm,fog_pars_fragment:Em,gradientmap_pars_fragment:Tm,lightmap_pars_fragment:wm,lights_lambert_fragment:Am,lights_lambert_pars_fragment:Cm,lights_pars_begin:Rm,lights_toon_fragment:Im,lights_toon_pars_fragment:Lm,lights_phong_fragment:Dm,lights_phong_pars_fragment:Nm,lights_physical_fragment:Um,lights_physical_pars_fragment:Fm,lights_fragment_begin:Om,lights_fragment_maps:Bm,lights_fragment_end:km,lightprobes_pars_fragment:zm,logdepthbuf_fragment:Vm,logdepthbuf_pars_fragment:Hm,logdepthbuf_pars_vertex:Gm,logdepthbuf_vertex:Wm,map_fragment:Xm,map_pars_fragment:Ym,map_particle_fragment:qm,map_particle_pars_fragment:jm,metalnessmap_fragment:$m,metalnessmap_pars_fragment:Zm,morphinstance_vertex:Jm,morphcolor_vertex:Km,morphnormal_vertex:Qm,morphtarget_pars_vertex:eg,morphtarget_vertex:tg,normal_fragment_begin:ng,normal_fragment_maps:ig,normal_pars_fragment:sg,normal_pars_vertex:rg,normal_vertex:ag,normalmap_pars_fragment:og,clearcoat_normal_fragment_begin:lg,clearcoat_normal_fragment_maps:cg,clearcoat_pars_fragment:hg,iridescence_pars_fragment:ug,opaque_fragment:dg,packing:fg,premultiplied_alpha_fragment:pg,project_vertex:mg,dithering_fragment:gg,dithering_pars_fragment:_g,roughnessmap_fragment:xg,roughnessmap_pars_fragment:yg,shadowmap_pars_fragment:vg,shadowmap_pars_vertex:bg,shadowmap_vertex:Mg,shadowmask_pars_fragment:Sg,skinbase_vertex:Eg,skinning_pars_vertex:Tg,skinning_vertex:wg,skinnormal_vertex:Ag,specularmap_fragment:Cg,specularmap_pars_fragment:Rg,tonemapping_fragment:Pg,tonemapping_pars_fragment:Ig,transmission_fragment:Lg,transmission_pars_fragment:Dg,uv_pars_fragment:Ng,uv_pars_vertex:Ug,uv_vertex:Fg,worldpos_vertex:Og,background_vert:Bg,background_frag:kg,backgroundCube_vert:zg,backgroundCube_frag:Vg,cube_vert:Hg,cube_frag:Gg,depth_vert:Wg,depth_frag:Xg,distance_vert:Yg,distance_frag:qg,equirect_vert:jg,equirect_frag:$g,linedashed_vert:Zg,linedashed_frag:Jg,meshbasic_vert:Kg,meshbasic_frag:Qg,meshlambert_vert:e0,meshlambert_frag:t0,meshmatcap_vert:n0,meshmatcap_frag:i0,meshnormal_vert:s0,meshnormal_frag:r0,meshphong_vert:a0,meshphong_frag:o0,meshphysical_vert:l0,meshphysical_frag:c0,meshtoon_vert:h0,meshtoon_frag:u0,points_vert:d0,points_frag:f0,shadow_vert:p0,shadow_frag:m0,sprite_vert:g0,sprite_frag:_0},_e={common:{diffuse:{value:new qe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new He},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new He}},envmap:{envMap:{value:null},envMapRotation:{value:new He},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new He}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new He}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new He},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new He},normalScale:{value:new Fe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new He},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new He}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new He}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new He}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new qe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new qe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0},uvTransform:{value:new He}},sprite:{diffuse:{value:new qe(16777215)},opacity:{value:1},center:{value:new Fe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new He},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0}}},ti={basic:{uniforms:en([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.fog]),vertexShader:je.meshbasic_vert,fragmentShader:je.meshbasic_frag},lambert:{uniforms:en([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,_e.lights,{emissive:{value:new qe(0)},envMapIntensity:{value:1}}]),vertexShader:je.meshlambert_vert,fragmentShader:je.meshlambert_frag},phong:{uniforms:en([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,_e.lights,{emissive:{value:new qe(0)},specular:{value:new qe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:je.meshphong_vert,fragmentShader:je.meshphong_frag},standard:{uniforms:en([_e.common,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.roughnessmap,_e.metalnessmap,_e.fog,_e.lights,{emissive:{value:new qe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag},toon:{uniforms:en([_e.common,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.gradientmap,_e.fog,_e.lights,{emissive:{value:new qe(0)}}]),vertexShader:je.meshtoon_vert,fragmentShader:je.meshtoon_frag},matcap:{uniforms:en([_e.common,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,{matcap:{value:null}}]),vertexShader:je.meshmatcap_vert,fragmentShader:je.meshmatcap_frag},points:{uniforms:en([_e.points,_e.fog]),vertexShader:je.points_vert,fragmentShader:je.points_frag},dashed:{uniforms:en([_e.common,_e.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:je.linedashed_vert,fragmentShader:je.linedashed_frag},depth:{uniforms:en([_e.common,_e.displacementmap]),vertexShader:je.depth_vert,fragmentShader:je.depth_frag},normal:{uniforms:en([_e.common,_e.bumpmap,_e.normalmap,_e.displacementmap,{opacity:{value:1}}]),vertexShader:je.meshnormal_vert,fragmentShader:je.meshnormal_frag},sprite:{uniforms:en([_e.sprite,_e.fog]),vertexShader:je.sprite_vert,fragmentShader:je.sprite_frag},background:{uniforms:{uvTransform:{value:new He},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:je.background_vert,fragmentShader:je.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new He}},vertexShader:je.backgroundCube_vert,fragmentShader:je.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:je.cube_vert,fragmentShader:je.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:je.equirect_vert,fragmentShader:je.equirect_frag},distance:{uniforms:en([_e.common,_e.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:je.distance_vert,fragmentShader:je.distance_frag},shadow:{uniforms:en([_e.lights,_e.fog,{color:{value:new qe(0)},opacity:{value:1}}]),vertexShader:je.shadow_vert,fragmentShader:je.shadow_frag}};ti.physical={uniforms:en([ti.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new He},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new He},clearcoatNormalScale:{value:new Fe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new He},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new He},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new He},sheen:{value:0},sheenColor:{value:new qe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new He},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new He},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new He},transmissionSamplerSize:{value:new Fe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new He},attenuationDistance:{value:0},attenuationColor:{value:new qe(0)},specularColor:{value:new qe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new He},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new He},anisotropyVector:{value:new Fe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new He}}]),vertexShader:je.meshphysical_vert,fragmentShader:je.meshphysical_frag};var rl={r:0,b:0,g:0},x0=new pt,Sd=new He;Sd.set(-1,0,0,0,1,0,0,0,1);function y0(n,e,t,i,s,r){let a=new qe(0),o=s===!0?0:1,l,c,h=null,d=0,u=null;function m(T){let R=T.isScene===!0?T.background:null;if(R&&R.isTexture){let b=T.backgroundBlurriness>0;R=e.get(R,b)}return R}function f(T){let R=!1,b=m(T);b===null?g(a,o):b&&b.isColor&&(g(b,1),R=!0);let E=n.xr.getEnvironmentBlendMode();E==="additive"?t.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(n.autoClear||R)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function x(T,R){let b=m(R);b&&(b.isCubeTexture||b.mapping===kr)?(c===void 0&&(c=new Mt(new ks(1,1,1),new xn({name:"BackgroundCubeMaterial",uniforms:ss(ti.backgroundCube.uniforms),vertexShader:ti.backgroundCube.vertexShader,fragmentShader:ti.backgroundCube.fragmentShader,side:cn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,S,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=b,c.material.uniforms.backgroundBlurriness.value=R.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=R.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(x0.makeRotationFromEuler(R.backgroundRotation)).transpose(),b.isCubeTexture&&b.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Sd),c.material.toneMapped=tt.getTransfer(b.colorSpace)!==lt,(h!==b||d!==b.version||u!==n.toneMapping)&&(c.material.needsUpdate=!0,h=b,d=b.version,u=n.toneMapping),c.layers.enableAll(),T.unshift(c,c.geometry,c.material,0,0,null)):b&&b.isTexture&&(l===void 0&&(l=new Mt(new ts(2,2),new xn({name:"BackgroundMaterial",uniforms:ss(ti.background.uniforms),vertexShader:ti.background.vertexShader,fragmentShader:ti.background.fragmentShader,side:Ui,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=b,l.material.uniforms.backgroundIntensity.value=R.backgroundIntensity,l.material.toneMapped=tt.getTransfer(b.colorSpace)!==lt,b.matrixAutoUpdate===!0&&b.updateMatrix(),l.material.uniforms.uvTransform.value.copy(b.matrix),(h!==b||d!==b.version||u!==n.toneMapping)&&(l.material.needsUpdate=!0,h=b,d=b.version,u=n.toneMapping),l.layers.enableAll(),T.unshift(l,l.geometry,l.material,0,0,null))}function g(T,R){T.getRGB(rl,Fc(n)),t.buffers.color.setClear(rl.r,rl.g,rl.b,R,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(T,R=1){a.set(T),o=R,g(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(T){o=T,g(a,o)},render:f,addToRenderList:x,dispose:p}}function v0(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=u(null),r=s,a=!1;function o(I,z,W,O,k){let Q=!1,$=d(I,O,W,z);r!==$&&(r=$,c(r.object)),Q=m(I,O,W,k),Q&&f(I,O,W,k),k!==null&&e.update(k,n.ELEMENT_ARRAY_BUFFER),(Q||a)&&(a=!1,b(I,z,W,O),k!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(k).buffer))}function l(){return n.createVertexArray()}function c(I){return n.bindVertexArray(I)}function h(I){return n.deleteVertexArray(I)}function d(I,z,W,O){let k=O.wireframe===!0,Q=i[z.id];Q===void 0&&(Q={},i[z.id]=Q);let $=I.isInstancedMesh===!0?I.id:0,re=Q[$];re===void 0&&(re={},Q[$]=re);let j=re[W.id];j===void 0&&(j={},re[W.id]=j);let ae=j[k];return ae===void 0&&(ae=u(l()),j[k]=ae),ae}function u(I){let z=[],W=[],O=[];for(let k=0;k<t;k++)z[k]=0,W[k]=0,O[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:z,enabledAttributes:W,attributeDivisors:O,object:I,attributes:{},index:null}}function m(I,z,W,O){let k=r.attributes,Q=z.attributes,$=0,re=W.getAttributes();for(let j in re)if(re[j].location>=0){let ee=k[j],Le=Q[j];if(Le===void 0&&(j==="instanceMatrix"&&I.instanceMatrix&&(Le=I.instanceMatrix),j==="instanceColor"&&I.instanceColor&&(Le=I.instanceColor)),ee===void 0||ee.attribute!==Le||Le&&ee.data!==Le.data)return!0;$++}return r.attributesNum!==$||r.index!==O}function f(I,z,W,O){let k={},Q=z.attributes,$=0,re=W.getAttributes();for(let j in re)if(re[j].location>=0){let ee=Q[j];ee===void 0&&(j==="instanceMatrix"&&I.instanceMatrix&&(ee=I.instanceMatrix),j==="instanceColor"&&I.instanceColor&&(ee=I.instanceColor));let Le={};Le.attribute=ee,ee&&ee.data&&(Le.data=ee.data),k[j]=Le,$++}r.attributes=k,r.attributesNum=$,r.index=O}function x(){let I=r.newAttributes;for(let z=0,W=I.length;z<W;z++)I[z]=0}function g(I){p(I,0)}function p(I,z){let W=r.newAttributes,O=r.enabledAttributes,k=r.attributeDivisors;W[I]=1,O[I]===0&&(n.enableVertexAttribArray(I),O[I]=1),k[I]!==z&&(n.vertexAttribDivisor(I,z),k[I]=z)}function T(){let I=r.newAttributes,z=r.enabledAttributes;for(let W=0,O=z.length;W<O;W++)z[W]!==I[W]&&(n.disableVertexAttribArray(W),z[W]=0)}function R(I,z,W,O,k,Q,$){$===!0?n.vertexAttribIPointer(I,z,W,k,Q):n.vertexAttribPointer(I,z,W,O,k,Q)}function b(I,z,W,O){x();let k=O.attributes,Q=W.getAttributes(),$=z.defaultAttributeValues;for(let re in Q){let j=Q[re];if(j.location>=0){let ae=k[re];if(ae===void 0&&(re==="instanceMatrix"&&I.instanceMatrix&&(ae=I.instanceMatrix),re==="instanceColor"&&I.instanceColor&&(ae=I.instanceColor)),ae!==void 0){let ee=ae.normalized,Le=ae.itemSize,Ie=e.get(ae);if(Ie===void 0)continue;let st=Ie.buffer,Ue=Ie.type,nt=Ie.bytesPerElement,J=Ue===n.INT||Ue===n.UNSIGNED_INT||ae.gpuType===vo;if(ae.isInterleavedBufferAttribute){let oe=ae.data,Se=oe.stride,Be=ae.offset;if(oe.isInstancedInterleavedBuffer){for(let be=0;be<j.locationSize;be++)p(j.location+be,oe.meshPerAttribute);I.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let be=0;be<j.locationSize;be++)g(j.location+be);n.bindBuffer(n.ARRAY_BUFFER,st);for(let be=0;be<j.locationSize;be++)R(j.location+be,Le/j.locationSize,Ue,ee,Se*nt,(Be+Le/j.locationSize*be)*nt,J)}else{if(ae.isInstancedBufferAttribute){for(let oe=0;oe<j.locationSize;oe++)p(j.location+oe,ae.meshPerAttribute);I.isInstancedMesh!==!0&&O._maxInstanceCount===void 0&&(O._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let oe=0;oe<j.locationSize;oe++)g(j.location+oe);n.bindBuffer(n.ARRAY_BUFFER,st);for(let oe=0;oe<j.locationSize;oe++)R(j.location+oe,Le/j.locationSize,Ue,ee,Le*nt,Le/j.locationSize*oe*nt,J)}}else if($!==void 0){let ee=$[re];if(ee!==void 0)switch(ee.length){case 2:n.vertexAttrib2fv(j.location,ee);break;case 3:n.vertexAttrib3fv(j.location,ee);break;case 4:n.vertexAttrib4fv(j.location,ee);break;default:n.vertexAttrib1fv(j.location,ee)}}}}T()}function E(){A();for(let I in i){let z=i[I];for(let W in z){let O=z[W];for(let k in O){let Q=O[k];for(let $ in Q)h(Q[$].object),delete Q[$];delete O[k]}}delete i[I]}}function S(I){if(i[I.id]===void 0)return;let z=i[I.id];for(let W in z){let O=z[W];for(let k in O){let Q=O[k];for(let $ in Q)h(Q[$].object),delete Q[$];delete O[k]}}delete i[I.id]}function P(I){for(let z in i){let W=i[z];for(let O in W){let k=W[O];if(k[I.id]===void 0)continue;let Q=k[I.id];for(let $ in Q)h(Q[$].object),delete Q[$];delete k[I.id]}}}function y(I){for(let z in i){let W=i[z],O=I.isInstancedMesh===!0?I.id:0,k=W[O];if(k!==void 0){for(let Q in k){let $=k[Q];for(let re in $)h($[re].object),delete $[re];delete k[Q]}delete W[O],Object.keys(W).length===0&&delete i[z]}}}function A(){L(),a=!0,r!==s&&(r=s,c(r.object))}function L(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:A,resetDefaultState:L,dispose:E,releaseStatesOfGeometry:S,releaseStatesOfObject:y,releaseStatesOfProgram:P,initAttributes:x,enableAttribute:g,disableUnusedAttributes:T}}function b0(n,e,t){let i;function s(l){i=l}function r(l,c){n.drawArrays(i,l,c),t.update(c,i,1)}function a(l,c,h){h!==0&&(n.drawArraysInstanced(i,l,c,h),t.update(c,i,h))}function o(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let u=0;for(let m=0;m<h;m++)u+=c[m];t.update(u,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function M0(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let P=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(P.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(P){return!(P!==En&&i.convert(P)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(P){let y=P===zn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(P!==fn&&P!==kn&&!y&&i.convert(P)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE))}function l(P){if(P==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";P="mediump"}return P==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(Oe("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Oe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let m=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),f=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),T=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),R=n.getParameter(n.MAX_VARYING_VECTORS),b=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),E=n.getParameter(n.MAX_SAMPLES),S=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:m,maxVertexTextures:f,maxTextureSize:x,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:T,maxVaryings:R,maxFragmentUniforms:b,maxSamples:E,samples:S}}function S0(n){let e=this,t=null,i=0,s=!1,r=!1,a=new ln,o=new He,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let m=d.length!==0||u||i!==0||s;return s=u,i=d.length,m},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){t=h(d,u,0)},this.setState=function(d,u,m){let f=d.clippingPlanes,x=d.clipIntersection,g=d.clipShadows,p=n.get(d);if(!s||f===null||f.length===0||r&&!g)r?h(null):c();else{let T=r?0:i,R=T*4,b=p.clippingState||null;l.value=b,b=h(f,u,R,m);for(let E=0;E!==R;++E)b[E]=t[E];p.clippingState=b,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=T}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(d,u,m,f){let x=d!==null?d.length:0,g=null;if(x!==0){if(g=l.value,f!==!0||g===null){let p=m+x*4,T=u.matrixWorldInverse;o.getNormalMatrix(T),(g===null||g.length<p)&&(g=new Float32Array(p));for(let R=0,b=m;R!==x;++R,b+=4)a.copy(d[R]).applyMatrix4(T,o),a.normal.toArray(g,b),g[b+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,g}}var $s=4,E0=6,T0=20,w0=256,qr=new Vs,td=new qe,zc=null,Vc=0,Hc=0,Gc=!1,A0=new D,rs=new D,ol=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){let{size:a=256,position:o=A0}=r;zc=this._renderer.getRenderTarget(),Vc=this._renderer.getActiveCubeFace(),Hc=this._renderer.getActiveMipmapLevel(),Gc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=sd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=id(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(zc,Vc,Hc),this._renderer.xr.enabled=Gc,e.scissorTest=!1,js(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Fi||e.mapping===is?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),zc=this._renderer.getRenderTarget(),Vc=this._renderer.getActiveCubeFace(),Hc=this._renderer.getActiveMipmapLevel(),Gc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:qt,minFilter:qt,generateMipmaps:!1,type:zn,format:En,colorSpace:yr,depthBuffer:!1},s=nd(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=nd(e,t,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=C0(r)),this._blurMaterial=P0(r,e,t),this._ggxMaterial=R0(r,e,t)}return s}_compileMaterial(e){let t=new Mt(new Tt,e);this._renderer.compile(t,qr)}_sceneToCubeUV(e,t,i,s,r){let l=new Kt(90,1,t,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,m=d.toneMapping;d.getClearColor(td),d.toneMapping=On,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Mt(new ks,new Qt({name:"PMREM.Background",side:cn,depthWrite:!1,depthTest:!1})));let x=this._backgroundBox,g=x.material,p=!1,T=e.background;T?T.isColor&&(g.color.copy(T),e.background=null,p=!0):(g.color.copy(td),p=!0);for(let R=0;R<6;R++){let b=R%3;b===0?(l.up.set(0,c[R],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[R],r.y,r.z)):b===1?(l.up.set(0,0,c[R]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[R],r.z)):(l.up.set(0,c[R],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[R]));let E=this._cubeSize;js(s,b*E,R>2?E:0,E,E),d.setRenderTarget(s),p&&d.render(x,l),d.render(e,l)}d.toneMapping=m,d.autoClear=u,e.background=T}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===Fi||e.mapping===is;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=sd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=id());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;js(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(a,qr)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;let l=a.uniforms,c=i/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=c*1.25,m=d*u,{_lodMax:f}=this,x=this._sizeLods[i],g=3*x*(i>f-$s?i-f+$s:0),p=4*(this._cubeSize-x);l.envMap.value=e.texture,l.roughness.value=m,l.mipInt.value=f-t,js(r,g,p,3*x,2*x),s.setRenderTarget(r),s.render(o,qr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=f-i,js(e,g,p,3*x,2*x),s.setRenderTarget(e),s.render(o,qr)}_blur(e,t,i,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,i,a),this._blurPass(r,e,i,i,a)}_blurPass(e,t,i,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[s],d=3*h*(s>this._lodMax-$s?s-this._lodMax+$s:0),u=4*(this._cubeSize-h);js(t,d,u,3*h,2*h),a.setRenderTarget(t),a.render(l,qr)}};function C0(n){let e=[],t=[],i=n,s=n-$s+1+E0;for(let r=0;r<s;r++){let a=Math.pow(2,i);e.push(a);let o=1/(a-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,u=6,m=3,f=new Float32Array(m*u*d),x=new Float32Array(m*u*d);for(let p=0;p<d;p++){let T=p%3*2/3-1,R=p>2?0:-1,b=[T,R,0,T+2/3,R,0,T+2/3,R+1,0,T,R,0,T+2/3,R+1,0,T,R+1,0];f.set(b,m*u*p);for(let E=0;E<u;E++){let S=h[E*2]*2-1,P=h[E*2+1]*2-1;p===0?rs.set(1,P,S):p===1?rs.set(-S,1,-P):p===2?rs.set(-S,P,1):p===3?rs.set(-1,P,-S):p===4?rs.set(-S,-1,P):rs.set(S,P,-1),rs.toArray(x,(p*u+E)*m)}}let g=new Tt;g.setAttribute("position",new Lt(f,m)),g.setAttribute("outputDirection",new Lt(x,m)),t.push(new Mt(g,null)),i>$s&&i--}return{lodMeshes:t,sizeLods:e}}function nd(n,e,t){let i=new dn(n,e,t);return i.texture.mapping=kr,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function js(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function R0(n,e,t){return new xn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:w0,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:hl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function P0(n,e,t){return new xn({name:"SphericalGaussianBlur",defines:{SAMPLES:T0,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:hl(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function id(){return new xn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:hl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function sd(){return new xn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:hl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Qn,depthTest:!1,depthWrite:!1})}function hl(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var ll=class extends dn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new wr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new ks(5,5,5),r=new xn({name:"CubemapFromEquirect",uniforms:ss(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:cn,blending:Qn});r.uniforms.tEquirect.value=t;let a=new Mt(s,r),o=t.minFilter;return t.minFilter===Oi&&(t.minFilter=qt),new po(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,s);e.setRenderTarget(r)}};function I0(n){let e=new WeakMap,t=new WeakMap,i=null;function s(u,m=!1){return u==null?null:m?a(u):r(u)}function r(u){if(u&&u.isTexture){let m=u.mapping;if(m===_o||m===xo)if(e.has(u)){let f=e.get(u).texture;return o(f,u.mapping)}else{let f=u.image;if(f&&f.height>0){let x=new ll(f.height);return x.fromEquirectangularTexture(n,u),e.set(u,x),u.addEventListener("dispose",c),o(x.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let m=u.mapping,f=m===_o||m===xo,x=m===Fi||m===is;if(f||x){let g=t.get(u),p=g!==void 0?g.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==p)return i===null&&(i=new ol(n)),g=f?i.fromEquirectangular(u,g):i.fromCubemap(u,g),g.texture.pmremVersion=u.pmremVersion,t.set(u,g),g.texture;if(g!==void 0)return g.texture;{let T=u.image;return f&&T&&T.height>0||x&&T&&l(T)?(i===null&&(i=new ol(n)),g=f?i.fromEquirectangular(u):i.fromCubemap(u),g.texture.pmremVersion=u.pmremVersion,t.set(u,g),u.addEventListener("dispose",h),g.texture):null}}}return u}function o(u,m){return m===_o?u.mapping=Fi:m===xo&&(u.mapping=is),u}function l(u){let m=0,f=6;for(let x=0;x<f;x++)u[x]!==void 0&&m++;return m===f}function c(u){let m=u.target;m.removeEventListener("dispose",c);let f=e.get(m);f!==void 0&&(e.delete(m),f.dispose())}function h(u){let m=u.target;m.removeEventListener("dispose",h);let f=t.get(m);f!==void 0&&(t.delete(m),f.dispose())}function d(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:d}}function L0(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&Ki("WebGLRenderer: "+i+" extension not supported."),s}}}function D0(n,e,t,i){let s={},r=new WeakMap;function a(d){let u=d.target;u.index!==null&&e.remove(u.index);for(let f in u.attributes)e.remove(u.attributes[f]);u.removeEventListener("dispose",a),delete s[u.id];let m=r.get(u);m&&(e.remove(m),r.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function o(d,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,t.memory.geometries++),u}function l(d){let u=d.attributes;for(let m in u)e.update(u[m],n.ARRAY_BUFFER)}function c(d){let u=[],m=d.index,f=d.attributes.position,x=0;if(f===void 0)return;if(m!==null){let T=m.array;x=m.version;for(let R=0,b=T.length;R<b;R+=3){let E=T[R+0],S=T[R+1],P=T[R+2];u.push(E,S,S,P,P,E)}}else{let T=f.array;x=f.version;for(let R=0,b=T.length/3-1;R<b;R+=3){let E=R+0,S=R+1,P=R+2;u.push(E,S,S,P,P,E)}}let g=new(f.count>=65535?Tr:Er)(u,1);g.version=x;let p=r.get(d);p&&e.remove(p),r.set(d,g)}function h(d){let u=r.get(d);if(u){let m=d.index;m!==null&&u.version<m.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function N0(n,e,t){let i;function s(d){i=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,u){n.drawElements(i,u,r,d*a),t.update(u,i,1)}function c(d,u,m){m!==0&&(n.drawElementsInstanced(i,u,r,d*a,m),t.update(u,i,m))}function h(d,u,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,r,d,0,m);let x=0;for(let g=0;g<m;g++)x+=u[g];t.update(x,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function U0(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(r/3);break;case n.LINES:t.lines+=o*(r/2);break;case n.LINE_STRIP:t.lines+=o*(r-1);break;case n.LINE_LOOP:t.lines+=o*r;break;case n.POINTS:t.points+=o*r;break;default:ke("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function F0(n,e,t){let i=new WeakMap,s=new bt;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0,u=i.get(o);if(u===void 0||u.count!==d){let A=function(){P.dispose(),i.delete(o),o.removeEventListener("dispose",A)};u!==void 0&&u.texture.dispose();let m=o.morphAttributes.position!==void 0,f=o.morphAttributes.normal!==void 0,x=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],T=o.morphAttributes.color||[],R=0;m===!0&&(R=1),f===!0&&(R=2),x===!0&&(R=3);let b=o.attributes.position.count*R,E=1;b>e.maxTextureSize&&(E=Math.ceil(b/e.maxTextureSize),b=e.maxTextureSize);let S=new Float32Array(b*E*4*d),P=new Mr(S,b,E,d);P.type=kn,P.needsUpdate=!0;let y=R*4;for(let L=0;L<d;L++){let I=g[L],z=p[L],W=T[L],O=b*E*4*L;for(let k=0;k<I.count;k++){let Q=k*y;m===!0&&(s.fromBufferAttribute(I,k),S[O+Q+0]=s.x,S[O+Q+1]=s.y,S[O+Q+2]=s.z,S[O+Q+3]=0),f===!0&&(s.fromBufferAttribute(z,k),S[O+Q+4]=s.x,S[O+Q+5]=s.y,S[O+Q+6]=s.z,S[O+Q+7]=0),x===!0&&(s.fromBufferAttribute(W,k),S[O+Q+8]=s.x,S[O+Q+9]=s.y,S[O+Q+10]=s.z,S[O+Q+11]=W.itemSize===4?s.w:1)}}u={count:d,texture:P,size:new Fe(b,E)},i.set(o,u),o.addEventListener("dispose",A)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let m=0;for(let x=0;x<c.length;x++)m+=c[x];let f=o.morphTargetsRelative?1:1-m;l.getUniforms().setValue(n,"morphTargetBaseInfluence",f),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",u.size)}return{update:r}}function O0(n,e,t,i,s){let r=new WeakMap;function a(c){let h=s.render.frame,d=c.geometry,u=e.get(c,d);if(r.get(u)!==h&&(e.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let m=c.skeleton;r.get(m)!==h&&(m.update(),r.set(m,h))}return u}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}var B0={[xc]:"LINEAR_TONE_MAPPING",[yc]:"REINHARD_TONE_MAPPING",[vc]:"CINEON_TONE_MAPPING",[bc]:"ACES_FILMIC_TONE_MAPPING",[Sc]:"AGX_TONE_MAPPING",[Ec]:"NEUTRAL_TONE_MAPPING",[Mc]:"CUSTOM_TONE_MAPPING"};function k0(n,e,t,i,s,r){let a=new dn(e,t,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Tt;c.setAttribute("position",new St([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new St([0,2,0,0,2,0],2));let h=new Qa({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),d=new Mt(c,h),u=new Vs(-1,1,1,-1,0,1),m=null,f=null,x=!1,g,p=null,T=[],R=!1;this.setSize=function(b,E){a.setSize(b,E),o!==null&&o.setSize(b,E),l!==null&&l.setSize(b,E);for(let S=0;S<T.length;S++){let P=T[S];P.setSize&&P.setSize(b,E)}},this.setEffects=function(b){T=b,R=T.length>0&&T[0].isRenderPass===!0;let E=a.width,S=a.height;T.length>0&&o===null&&(o=new dn(E,S,{type:zn,depthBuffer:!1,stencilBuffer:!1}),l=new dn(E,S,{type:zn,depthBuffer:!1,stencilBuffer:!1}));for(let P=0;P<T.length;P++){let y=T[P];y.setSize&&y.setSize(E,S)}},this.begin=function(b,E){if(x||b.toneMapping===On&&T.length===0)return!1;if(p=E,E!==null){let S=E.width,P=E.height;(a.width!==S||a.height!==P)&&this.setSize(S,P)}return R===!1&&b.setRenderTarget(a),g=b.toneMapping,b.toneMapping=On,!0},this.hasRenderPass=function(){return R},this.end=function(b,E){b.toneMapping=g,x=!0;let S=a,P=o;for(let y=0;y<T.length;y++){let A=T[y];A.enabled!==!1&&(A.render(b,P,S,E),A.needsSwap!==!1&&(S=P,P=P===o?l:o))}if(m!==b.outputColorSpace||f!==b.toneMapping){m=b.outputColorSpace,f=b.toneMapping,h.defines={},tt.getTransfer(m)===lt&&(h.defines.SRGB_TRANSFER="");let y=B0[f];y&&(h.defines[y]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=S.texture,b.setRenderTarget(p),b.render(d,u),p=null,x=!1},this.isCompositing=function(){return x},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var Ed=new un,Yc=new Pi(1,1),Td=new Mr,wd=new ja,Ad=new wr,rd=[],ad=[],od=new Float32Array(16),ld=new Float32Array(9),cd=new Float32Array(4);function Js(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=rd[s];if(r===void 0&&(r=new Float32Array(s),rd[s]=r),e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(r,o)}return r}function kt(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function zt(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function ul(n,e){let t=ad[e];t===void 0&&(t=new Int32Array(e),ad[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function z0(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function V0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;n.uniform2fv(this.addr,e),zt(t,e)}}function H0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(kt(t,e))return;n.uniform3fv(this.addr,e),zt(t,e)}}function G0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;n.uniform4fv(this.addr,e),zt(t,e)}}function W0(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(kt(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),zt(t,e)}else{if(kt(t,i))return;cd.set(i),n.uniformMatrix2fv(this.addr,!1,cd),zt(t,i)}}function X0(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(kt(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),zt(t,e)}else{if(kt(t,i))return;ld.set(i),n.uniformMatrix3fv(this.addr,!1,ld),zt(t,i)}}function Y0(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(kt(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),zt(t,e)}else{if(kt(t,i))return;od.set(i),n.uniformMatrix4fv(this.addr,!1,od),zt(t,i)}}function q0(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function j0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;n.uniform2iv(this.addr,e),zt(t,e)}}function $0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(kt(t,e))return;n.uniform3iv(this.addr,e),zt(t,e)}}function Z0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;n.uniform4iv(this.addr,e),zt(t,e)}}function J0(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function K0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(kt(t,e))return;n.uniform2uiv(this.addr,e),zt(t,e)}}function Q0(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(kt(t,e))return;n.uniform3uiv(this.addr,e),zt(t,e)}}function e_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(kt(t,e))return;n.uniform4uiv(this.addr,e),zt(t,e)}}function t_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(Yc.compareFunction=t.isReversedDepthBuffer()?sl:il,r=Yc):r=Ed,t.setTexture2D(e||r,s)}function n_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||wd,s)}function i_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||Ad,s)}function s_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||Td,s)}function r_(n){switch(n){case 5126:return z0;case 35664:return V0;case 35665:return H0;case 35666:return G0;case 35674:return W0;case 35675:return X0;case 35676:return Y0;case 5124:case 35670:return q0;case 35667:case 35671:return j0;case 35668:case 35672:return $0;case 35669:case 35673:return Z0;case 5125:return J0;case 36294:return K0;case 36295:return Q0;case 36296:return e_;case 35678:case 36198:case 36298:case 36306:case 35682:return t_;case 35679:case 36299:case 36307:return n_;case 35680:case 36300:case 36308:case 36293:return i_;case 36289:case 36303:case 36311:case 36292:return s_}}function a_(n,e){n.uniform1fv(this.addr,e)}function o_(n,e){let t=Js(e,this.size,2);n.uniform2fv(this.addr,t)}function l_(n,e){let t=Js(e,this.size,3);n.uniform3fv(this.addr,t)}function c_(n,e){let t=Js(e,this.size,4);n.uniform4fv(this.addr,t)}function h_(n,e){let t=Js(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function u_(n,e){let t=Js(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function d_(n,e){let t=Js(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function f_(n,e){n.uniform1iv(this.addr,e)}function p_(n,e){n.uniform2iv(this.addr,e)}function m_(n,e){n.uniform3iv(this.addr,e)}function g_(n,e){n.uniform4iv(this.addr,e)}function __(n,e){n.uniform1uiv(this.addr,e)}function x_(n,e){n.uniform2uiv(this.addr,e)}function y_(n,e){n.uniform3uiv(this.addr,e)}function v_(n,e){n.uniform4uiv(this.addr,e)}function b_(n,e,t){let i=this.cache,s=e.length,r=ul(t,s);kt(i,r)||(n.uniform1iv(this.addr,r),zt(i,r));let a;this.type===n.SAMPLER_2D_SHADOW?a=Yc:a=Ed;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function M_(n,e,t){let i=this.cache,s=e.length,r=ul(t,s);kt(i,r)||(n.uniform1iv(this.addr,r),zt(i,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||wd,r[a])}function S_(n,e,t){let i=this.cache,s=e.length,r=ul(t,s);kt(i,r)||(n.uniform1iv(this.addr,r),zt(i,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Ad,r[a])}function E_(n,e,t){let i=this.cache,s=e.length,r=ul(t,s);kt(i,r)||(n.uniform1iv(this.addr,r),zt(i,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||Td,r[a])}function T_(n){switch(n){case 5126:return a_;case 35664:return o_;case 35665:return l_;case 35666:return c_;case 35674:return h_;case 35675:return u_;case 35676:return d_;case 5124:case 35670:return f_;case 35667:case 35671:return p_;case 35668:case 35672:return m_;case 35669:case 35673:return g_;case 5125:return __;case 36294:return x_;case 36295:return y_;case 36296:return v_;case 35678:case 36198:case 36298:case 36306:case 35682:return b_;case 35679:case 36299:case 36307:return M_;case 35680:case 36300:case 36308:case 36293:return S_;case 36289:case 36303:case 36311:case 36292:return E_}}var qc=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=r_(t.type)}},jc=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=T_(t.type)}},$c=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],i)}}},Wc=/(\w+)(\])?(\[|\.)?/g;function hd(n,e){n.seq.push(e),n.map[e.id]=e}function w_(n,e,t){let i=n.name,s=i.length;for(Wc.lastIndex=0;;){let r=Wc.exec(i),a=Wc.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){hd(t,c===void 0?new qc(o,n,e):new jc(o,n,e));break}else{let d=t.map[o];d===void 0&&(d=new $c(o),hd(t,d)),t=d}}}var Zs=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);w_(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&i.push(a)}return i}};function ud(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var A_=37297,C_=0;function R_(n,e){let t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}var dd=new He;function P_(n){tt._getMatrix(dd,tt.workingColorSpace,n);let e=`mat3( ${dd.elements.map(t=>t.toFixed(4))} )`;switch(tt.getTransfer(n)){case vr:return[e,"LinearTransferOETF"];case lt:return[e,"sRGBTransferOETF"];default:return Oe("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function fd(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+R_(n.getShaderSource(e),o)}else return r}function I_(n,e){let t=P_(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var L_={[xc]:"Linear",[yc]:"Reinhard",[vc]:"Cineon",[bc]:"ACESFilmic",[Sc]:"AgX",[Ec]:"Neutral",[Mc]:"Custom"};function D_(n,e){let t=L_[e];return t===void 0?(Oe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var al=new D;function N_(){tt.getLuminanceCoefficients(al);let n=al.x.toFixed(4),e=al.y.toFixed(4),t=al.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function U_(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter($r).join(`
`)}function F_(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function O_(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),a=r.name,o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function $r(n){return n!==""}function pd(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function md(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var B_=/^[ \t]*#include +<([\w\d./]+)>/gm;function Zc(n){return n.replace(B_,z_)}var k_=new Map;function z_(n,e){let t=je[e];if(t===void 0){let i=k_.get(e);if(i!==void 0)t=je[i],Oe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Zc(t)}var V_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function gd(n){return n.replace(V_,H_)}function H_(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function _d(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var G_={[Br]:"SHADOWMAP_TYPE_PCF",[Gs]:"SHADOWMAP_TYPE_VSM"};function W_(n){return G_[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var X_={[Fi]:"ENVMAP_TYPE_CUBE",[is]:"ENVMAP_TYPE_CUBE",[kr]:"ENVMAP_TYPE_CUBE_UV"};function Y_(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":X_[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var q_={[is]:"ENVMAP_MODE_REFRACTION"};function j_(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":q_[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var $_={[go]:"ENVMAP_BLENDING_MULTIPLY",[Nu]:"ENVMAP_BLENDING_MIX",[Uu]:"ENVMAP_BLENDING_ADD"};function Z_(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":$_[n.combine]||"ENVMAP_BLENDING_NONE"}function J_(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function K_(n,e,t,i){let s=n.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=W_(t),c=Y_(t),h=j_(t),d=Z_(t),u=J_(t),m=U_(t),f=F_(r),x=s.createProgram(),g,p,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter($r).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f].filter($r).join(`
`),p.length>0&&(p+=`
`)):(g=[_d(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter($r).join(`
`),p=[_d(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,f,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==On?"#define TONE_MAPPING":"",t.toneMapping!==On?je.tonemapping_pars_fragment:"",t.toneMapping!==On?D_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",je.colorspace_pars_fragment,I_("linearToOutputTexel",t.outputColorSpace),N_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter($r).join(`
`)),a=Zc(a),a=pd(a,t),a=md(a,t),o=Zc(o),o=pd(o,t),o=md(o,t),a=gd(a),o=gd(o),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,g=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",t.glslVersion===Dc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Dc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let R=T+g+a,b=T+p+o,E=ud(s,s.VERTEX_SHADER,R),S=ud(s,s.FRAGMENT_SHADER,b);s.attachShader(x,E),s.attachShader(x,S),t.index0AttributeName!==void 0?s.bindAttribLocation(x,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function P(I){if(n.debug.checkShaderErrors){let z=s.getProgramInfoLog(x)||"",W=s.getShaderInfoLog(E)||"",O=s.getShaderInfoLog(S)||"",k=z.trim(),Q=W.trim(),$=O.trim(),re=!0,j=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(re=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,x,E,S);else{let ae=fd(s,E,"vertex"),ee=fd(s,S,"fragment");ke("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+k+`
`+ae+`
`+ee)}else k!==""?Oe("WebGLProgram: Program Info Log:",k):(Q===""||$==="")&&(j=!1);j&&(I.diagnostics={runnable:re,programLog:k,vertexShader:{log:Q,prefix:g},fragmentShader:{log:$,prefix:p}})}s.deleteShader(E),s.deleteShader(S),y=new Zs(s,x),A=O_(s,x)}let y;this.getUniforms=function(){return y===void 0&&P(this),y};let A;this.getAttributes=function(){return A===void 0&&P(this),A};let L=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return L===!1&&(L=s.getProgramParameter(x,A_)),L},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=C_++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=E,this.fragmentShader=S,this}var Q_=0,Jc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new Kc(e),t.set(e,i)),i}},Kc=class{constructor(e){this.id=Q_++,this.code=e,this.usedTimes=0}};function ex(n){return n===ki||n===Xr||n===Yr}function tx(n,e,t,i,s,r){let a=new Us,o=new Jc,l=new Set,c=[],h=new Map,d=i.logarithmicDepthBuffer,u=i.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function f(y){return l.add(y),y===0?"uv":`uv${y}`}function x(y,A,L,I,z,W){let O=I.fog,k=z.geometry,Q=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?I.environment:null,$=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap,re=e.get(y.envMap||Q,$),j=re&&re.mapping===kr?re.image.height:null,ae=m[y.type];y.precision!==null&&(u=i.getMaxPrecision(y.precision),u!==y.precision&&Oe("WebGLProgram.getParameters:",y.precision,"not supported, using",u,"instead."));let ee=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,Le=ee!==void 0?ee.length:0,Ie=0;k.morphAttributes.position!==void 0&&(Ie=1),k.morphAttributes.normal!==void 0&&(Ie=2),k.morphAttributes.color!==void 0&&(Ie=3);let st,Ue,nt,J;if(ae){let Y=ti[ae];st=Y.vertexShader,Ue=Y.fragmentShader}else{st=y.vertexShader,Ue=y.fragmentShader;let Y=o.getVertexShaderStage(y),X=o.getFragmentShaderStage(y);o.update(y,Y,X),nt=Y.id,J=X.id}let oe=n.getRenderTarget(),Se=n.state.buffers.depth.getReversed(),Be=z.isInstancedMesh===!0,be=z.isBatchedMesh===!0,Ge=!!y.map,wt=!!y.matcap,Xe=!!re,it=!!y.aoMap,ct=!!y.lightMap,$e=!!y.bumpMap&&y.wireframe===!1,mt=!!y.normalMap,Rt=!!y.displacementMap,At=!!y.emissiveMap,_t=!!y.metalnessMap,Ct=!!y.roughnessMap,F=y.anisotropy>0,rt=y.clearcoat>0,Ke=y.dispersion>0,C=y.retroreflectivity>0,_=y.iridescence>0,B=y.sheen>0,V=y.transmission>0,Z=F&&!!y.anisotropyMap,ce=rt&&!!y.clearcoatMap,he=rt&&!!y.clearcoatNormalMap,K=rt&&!!y.clearcoatRoughnessMap,se=_&&!!y.iridescenceMap,ue=_&&!!y.iridescenceThicknessMap,Ce=B&&!!y.sheenColorMap,me=B&&!!y.sheenRoughnessMap,de=!!y.specularMap,Re=!!y.specularColorMap,Ne=!!y.specularIntensityMap,Ve=V&&!!y.transmissionMap,N=V&&!!y.thicknessMap,fe=!!y.gradientMap,te=!!y.alphaMap,pe=y.alphaTest>0,xe=!!y.alphaHash,le=!!y.extensions,M=On;y.toneMapped&&(oe===null||oe.isXRRenderTarget===!0)&&(M=n.toneMapping);let w={shaderID:ae,shaderType:y.type,shaderName:y.name,vertexShader:st,fragmentShader:Ue,defines:y.defines,customVertexShaderID:nt,customFragmentShaderID:J,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:u,batching:be,batchingColor:be&&z._colorsTexture!==null,instancing:Be,instancingColor:Be&&z.instanceColor!==null,instancingMorph:Be&&z.morphTexture!==null,outputColorSpace:oe===null?n.outputColorSpace:oe.isXRRenderTarget===!0?oe.texture.colorSpace:tt.workingColorSpace,alphaToCoverage:!!y.alphaToCoverage,map:Ge,matcap:wt,envMap:Xe,envMapMode:Xe&&re.mapping,envMapCubeUVHeight:j,aoMap:it,lightMap:ct,bumpMap:$e,normalMap:mt,displacementMap:Rt,emissiveMap:At,normalMapObjectSpace:mt&&y.normalMapType===Bu,normalMapTangentSpace:mt&&y.normalMapType===nl,packedNormalMap:mt&&y.normalMapType===nl&&ex(y.normalMap.format),metalnessMap:_t,roughnessMap:Ct,anisotropy:F,anisotropyMap:Z,clearcoat:rt,clearcoatMap:ce,clearcoatNormalMap:he,clearcoatRoughnessMap:K,dispersion:Ke,retroreflection:C,iridescence:_,iridescenceMap:se,iridescenceThicknessMap:ue,sheen:B,sheenColorMap:Ce,sheenRoughnessMap:me,specularMap:de,specularColorMap:Re,specularIntensityMap:Ne,transmission:V,transmissionMap:Ve,thicknessMap:N,gradientMap:fe,opaque:y.transparent===!1&&y.blending===Ws&&y.alphaToCoverage===!1,alphaMap:te,alphaTest:pe,alphaHash:xe,combine:y.combine,mapUv:Ge&&f(y.map.channel),aoMapUv:it&&f(y.aoMap.channel),lightMapUv:ct&&f(y.lightMap.channel),bumpMapUv:$e&&f(y.bumpMap.channel),normalMapUv:mt&&f(y.normalMap.channel),displacementMapUv:Rt&&f(y.displacementMap.channel),emissiveMapUv:At&&f(y.emissiveMap.channel),metalnessMapUv:_t&&f(y.metalnessMap.channel),roughnessMapUv:Ct&&f(y.roughnessMap.channel),anisotropyMapUv:Z&&f(y.anisotropyMap.channel),clearcoatMapUv:ce&&f(y.clearcoatMap.channel),clearcoatNormalMapUv:he&&f(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:K&&f(y.clearcoatRoughnessMap.channel),iridescenceMapUv:se&&f(y.iridescenceMap.channel),iridescenceThicknessMapUv:ue&&f(y.iridescenceThicknessMap.channel),sheenColorMapUv:Ce&&f(y.sheenColorMap.channel),sheenRoughnessMapUv:me&&f(y.sheenRoughnessMap.channel),specularMapUv:de&&f(y.specularMap.channel),specularColorMapUv:Re&&f(y.specularColorMap.channel),specularIntensityMapUv:Ne&&f(y.specularIntensityMap.channel),transmissionMapUv:Ve&&f(y.transmissionMap.channel),thicknessMapUv:N&&f(y.thicknessMap.channel),alphaMapUv:te&&f(y.alphaMap.channel),vertexTangents:!!k.attributes.tangent&&(mt||F),vertexNormals:!!k.attributes.normal,vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,pointsUvs:z.isPoints===!0&&!!k.attributes.uv&&(Ge||te),fog:!!O,useFog:y.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:y.wireframe===!1&&(y.flatShading===!0||k.attributes.normal===void 0&&mt===!1&&(y.isMeshLambertMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isMeshPhysicalMaterial)),sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:Se,skinning:z.isSkinnedMesh===!0,hasPositionAttribute:k.attributes.position!==void 0,morphTargets:k.morphAttributes.position!==void 0,morphNormals:k.morphAttributes.normal!==void 0,morphColors:k.morphAttributes.color!==void 0,morphTargetsCount:Le,morphTextureStride:Ie,numSunLights:A.sun.length,numDirLights:A.directional.length,numPointLights:A.point.length,numSpotLights:A.spot.length,numSpotLightMaps:A.spotLightMap.length,numRectAreaLights:A.rectArea.length,numHemiLights:A.hemi.length,numSunLightShadows:A.sunShadowMap.length,numDirLightShadows:A.directionalShadowMap.length,numPointLightShadows:A.pointShadowMap.length,numSpotLightShadows:A.spotShadowMap.length,numSpotLightShadowsWithMaps:A.numSpotLightShadowsWithMaps,numLightProbes:A.numLightProbes,numLightProbeGrids:W.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:y.dithering,shadowMapEnabled:n.shadowMap.enabled&&L.length>0,shadowMapType:n.shadowMap.type,toneMapping:M,decodeVideoTexture:Ge&&y.map.isVideoTexture===!0&&tt.getTransfer(y.map.colorSpace)===lt,decodeVideoTextureEmissive:At&&y.emissiveMap.isVideoTexture===!0&&tt.getTransfer(y.emissiveMap.colorSpace)===lt,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Ot,flipSided:y.side===cn,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:le&&y.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(le&&y.extensions.multiDraw===!0||be)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return w.vertexUv1s=l.has(1),w.vertexUv2s=l.has(2),w.vertexUv3s=l.has(3),l.clear(),w}function g(y){let A=[];if(y.shaderID?A.push(y.shaderID):(A.push(y.customVertexShaderID),A.push(y.customFragmentShaderID)),y.defines!==void 0)for(let L in y.defines)A.push(L),A.push(y.defines[L]);return y.isRawShaderMaterial===!1&&(p(A,y),T(A,y),A.push(n.outputColorSpace)),A.push(y.customProgramCacheKey),A.join()}function p(y,A){y.push(A.precision),y.push(A.outputColorSpace),y.push(A.envMapMode),y.push(A.envMapCubeUVHeight),y.push(A.mapUv),y.push(A.alphaMapUv),y.push(A.lightMapUv),y.push(A.aoMapUv),y.push(A.bumpMapUv),y.push(A.normalMapUv),y.push(A.displacementMapUv),y.push(A.emissiveMapUv),y.push(A.metalnessMapUv),y.push(A.roughnessMapUv),y.push(A.anisotropyMapUv),y.push(A.clearcoatMapUv),y.push(A.clearcoatNormalMapUv),y.push(A.clearcoatRoughnessMapUv),y.push(A.iridescenceMapUv),y.push(A.iridescenceThicknessMapUv),y.push(A.sheenColorMapUv),y.push(A.sheenRoughnessMapUv),y.push(A.specularMapUv),y.push(A.specularColorMapUv),y.push(A.specularIntensityMapUv),y.push(A.transmissionMapUv),y.push(A.thicknessMapUv),y.push(A.combine),y.push(A.fogExp2),y.push(A.sizeAttenuation),y.push(A.morphTargetsCount),y.push(A.morphAttributeCount),y.push(A.numSunLights),y.push(A.numDirLights),y.push(A.numPointLights),y.push(A.numSpotLights),y.push(A.numSpotLightMaps),y.push(A.numHemiLights),y.push(A.numRectAreaLights),y.push(A.numSunLightShadows),y.push(A.numDirLightShadows),y.push(A.numPointLightShadows),y.push(A.numSpotLightShadows),y.push(A.numSpotLightShadowsWithMaps),y.push(A.numLightProbes),y.push(A.shadowMapType),y.push(A.toneMapping),y.push(A.numClippingPlanes),y.push(A.numClipIntersection),y.push(A.depthPacking)}function T(y,A){a.disableAll(),A.instancing&&a.enable(0),A.instancingColor&&a.enable(1),A.instancingMorph&&a.enable(2),A.matcap&&a.enable(3),A.envMap&&a.enable(4),A.normalMapObjectSpace&&a.enable(5),A.normalMapTangentSpace&&a.enable(6),A.clearcoat&&a.enable(7),A.iridescence&&a.enable(8),A.alphaTest&&a.enable(9),A.vertexColors&&a.enable(10),A.vertexAlphas&&a.enable(11),A.vertexUv1s&&a.enable(12),A.vertexUv2s&&a.enable(13),A.vertexUv3s&&a.enable(14),A.vertexTangents&&a.enable(15),A.anisotropy&&a.enable(16),A.alphaHash&&a.enable(17),A.batching&&a.enable(18),A.dispersion&&a.enable(19),A.retroreflection&&a.enable(24),A.batchingColor&&a.enable(20),A.gradientMap&&a.enable(21),A.packedNormalMap&&a.enable(22),A.vertexNormals&&a.enable(23),y.push(a.mask),a.disableAll(),A.fog&&a.enable(0),A.useFog&&a.enable(1),A.flatShading&&a.enable(2),A.logarithmicDepthBuffer&&a.enable(3),A.reversedDepthBuffer&&a.enable(4),A.skinning&&a.enable(5),A.morphTargets&&a.enable(6),A.morphNormals&&a.enable(7),A.morphColors&&a.enable(8),A.premultipliedAlpha&&a.enable(9),A.shadowMapEnabled&&a.enable(10),A.doubleSided&&a.enable(11),A.flipSided&&a.enable(12),A.useDepthPacking&&a.enable(13),A.dithering&&a.enable(14),A.transmission&&a.enable(15),A.sheen&&a.enable(16),A.opaque&&a.enable(17),A.pointsUvs&&a.enable(18),A.decodeVideoTexture&&a.enable(19),A.decodeVideoTextureEmissive&&a.enable(20),A.alphaToCoverage&&a.enable(21),A.numLightProbeGrids>0&&a.enable(22),A.hasPositionAttribute&&a.enable(23),y.push(a.mask)}function R(y){let A=m[y.type],L;if(A){let I=ti[A];L=Ku.clone(I.uniforms)}else L=y.uniforms;return L}function b(y,A){let L=h.get(A);return L!==void 0?++L.usedTimes:(L=new K_(n,A,y,s),c.push(L),h.set(A,L)),L}function E(y){if(--y.usedTimes===0){let A=c.indexOf(y);c[A]=c[c.length-1],c.pop(),h.delete(y.cacheKey),y.destroy()}}function S(y){o.remove(y)}function P(){o.dispose()}return{getParameters:x,getProgramCacheKey:g,getUniforms:R,acquireProgram:b,releaseProgram:E,releaseShaderCache:S,programs:c,dispose:P}}function nx(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,l){n.get(a)[o]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function ix(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function xd(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function yd(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function a(u){let m=0;return u.isInstancedMesh&&(m+=2),u.isSkinnedMesh&&(m+=1),m}function o(u,m,f,x,g,p){let T=n[e];return T===void 0?(T={id:u.id,object:u,geometry:m,material:f,materialVariant:a(u),groupOrder:x,renderOrder:u.renderOrder,z:g,group:p},n[e]=T):(T.id=u.id,T.object=u,T.geometry=m,T.material=f,T.materialVariant=a(u),T.groupOrder=x,T.renderOrder=u.renderOrder,T.z=g,T.group=p),e++,T}function l(u,m,f,x,g,p,T){T.reversedDepth===!0&&(g=-g);let R=o(u,m,f,x,g,p);f.transmission>0?i.push(R):f.transparent===!0?s.push(R):t.push(R)}function c(u,m,f,x,g,p){let T=o(u,m,f,x,g,p);f.transmission>0?i.unshift(T):f.transparent===!0?s.unshift(T):t.unshift(T)}function h(u,m){t.length>1&&t.sort(u||ix),i.length>1&&i.sort(m||xd),s.length>1&&s.sort(m||xd)}function d(){for(let u=e,m=n.length;u<m;u++){let f=n[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:l,unshift:c,finish:d,sort:h}}function sx(){let n=new WeakMap;function e(i,s){let r=n.get(i),a;return r===void 0?(a=new yd,n.set(i,[a])):s>=r.length?(a=new yd,r.push(a)):a=r[s],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function rx(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new D,color:new qe};break;case"SpotLight":t={position:new D,direction:new D,color:new qe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new qe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new qe,groundColor:new qe};break;case"RectAreaLight":t={color:new qe,position:new D,halfWidth:new D,halfHeight:new D};break}return n[e.id]=t,t}}}function ax(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Fe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Fe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Fe,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var ox=0;function lx(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function cx(n){let e=new rx,t=ax(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new D);let s=new D,r=new pt,a=new pt;function o(c){let h=0,d=0,u=0;for(let z=0;z<9;z++)i.probe[z].set(0,0,0);let m=0,f=0,x=0,g=0,p=0,T=0,R=0,b=0,E=0,S=0,P=0,y=0,A=0,L=0;c.sort(lx);for(let z=0,W=c.length;z<W;z++){let O=c[z],k=O.color,Q=O.intensity,$=O.distance,re=null;if(O.shadow&&O.shadow.map&&(O.shadow.map.texture.format===ki?re=O.shadow.map.texture:re=O.shadow.map.depthTexture||O.shadow.map.texture),O.isAmbientLight)h+=k.r*Q,d+=k.g*Q,u+=k.b*Q;else if(O.isLightProbe){for(let j=0;j<9;j++)i.probe[j].addScaledVector(O.sh.coefficients[j],Q);L++}else if(O.isSunLight){let j=e.get(O);if(j.color.copy(O.color).multiplyScalar(O.intensity),O.castShadow){let ae=O.shadow,ee=t.get(O);ee.shadowIntensity=ae.intensity,ee.shadowBias=ae.bias,ee.shadowNormalBias=ae.normalBias,ee.shadowRadius=ae.radius,ee.shadowMapSize.copy(ae.mapSize).multiply(ae.getFrameExtents()),i.sunShadow[f]=ee,i.sunShadowMap[f]=re;let Le=ae.getViewportCount();for(let Ie=0;Ie<Le;Ie++)i.sunShadowMatrix[x+Ie]=ae.getMatrix(Ie),i.sunShadowCascade[x+Ie]=ae._cascadeData[Ie];x+=Le,f++}i.sun[m]=j,m++}else if(O.isDirectionalLight){let j=e.get(O);if(j.color.copy(O.color).multiplyScalar(O.intensity),O.castShadow){let ae=O.shadow,ee=t.get(O);ee.shadowIntensity=ae.intensity,ee.shadowBias=ae.bias,ee.shadowNormalBias=ae.normalBias,ee.shadowRadius=ae.radius,ee.shadowMapSize=ae.mapSize,i.directionalShadow[g]=ee,i.directionalShadowMap[g]=re,i.directionalShadowMatrix[g]=O.shadow.matrix,E++}i.directional[g]=j,g++}else if(O.isSpotLight){let j=e.get(O);j.position.setFromMatrixPosition(O.matrixWorld),j.color.copy(k).multiplyScalar(Q),j.distance=$,j.coneCos=Math.cos(O.angle),j.penumbraCos=Math.cos(O.angle*(1-O.penumbra)),j.decay=O.decay,i.spot[T]=j;let ae=O.shadow;if(O.map&&(i.spotLightMap[y]=O.map,y++,ae.updateMatrices(O),O.castShadow&&A++),i.spotLightMatrix[T]=ae.matrix,O.castShadow){let ee=t.get(O);ee.shadowIntensity=ae.intensity,ee.shadowBias=ae.bias,ee.shadowNormalBias=ae.normalBias,ee.shadowRadius=ae.radius,ee.shadowMapSize=ae.mapSize,i.spotShadow[T]=ee,i.spotShadowMap[T]=re,P++}T++}else if(O.isRectAreaLight){let j=e.get(O);j.color.copy(k).multiplyScalar(Q),j.halfWidth.set(O.width*.5,0,0),j.halfHeight.set(0,O.height*.5,0),i.rectArea[R]=j,R++}else if(O.isPointLight){let j=e.get(O);if(j.color.copy(O.color).multiplyScalar(O.intensity),j.distance=O.distance,j.decay=O.decay,O.castShadow){let ae=O.shadow,ee=t.get(O);ee.shadowIntensity=ae.intensity,ee.shadowBias=ae.bias,ee.shadowNormalBias=ae.normalBias,ee.shadowRadius=ae.radius,ee.shadowMapSize=ae.mapSize,ee.shadowCameraNear=ae.camera.near,ee.shadowCameraFar=ae.camera.far,i.pointShadow[p]=ee,i.pointShadowMap[p]=re,i.pointShadowMatrix[p]=O.shadow.matrix,S++}i.point[p]=j,p++}else if(O.isHemisphereLight){let j=e.get(O);j.skyColor.copy(O.color).multiplyScalar(Q),j.groundColor.copy(O.groundColor).multiplyScalar(Q),i.hemi[b]=j,b++}}R>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=_e.LTC_FLOAT_1,i.rectAreaLTC2=_e.LTC_FLOAT_2):(i.rectAreaLTC1=_e.LTC_HALF_1,i.rectAreaLTC2=_e.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=u;let I=i.hash;(I.sunLength!==m||I.directionalLength!==g||I.pointLength!==p||I.spotLength!==T||I.rectAreaLength!==R||I.hemiLength!==b||I.numSunShadows!==f||I.numDirectionalShadows!==E||I.numPointShadows!==S||I.numSpotShadows!==P||I.numSpotMaps!==y||I.numLightProbes!==L)&&(i.sun.length=m,i.directional.length=g,i.spot.length=T,i.rectArea.length=R,i.point.length=p,i.hemi.length=b,i.sunShadow.length=f,i.sunShadowMap.length=f,i.sunShadowMatrix.length=x,i.sunShadowCascade.length=x,i.directionalShadow.length=E,i.directionalShadowMap.length=E,i.directionalShadowMatrix.length=E,i.pointShadow.length=S,i.pointShadowMap.length=S,i.pointShadowMatrix.length=S,i.spotShadow.length=P,i.spotShadowMap.length=P,i.spotLightMatrix.length=P+y-A,i.spotLightMap.length=y,i.numSpotLightShadowsWithMaps=A,i.numLightProbes=L,I.sunLength=m,I.directionalLength=g,I.pointLength=p,I.spotLength=T,I.rectAreaLength=R,I.hemiLength=b,I.numSunShadows=f,I.numDirectionalShadows=E,I.numPointShadows=S,I.numSpotShadows=P,I.numSpotMaps=y,I.numLightProbes=L,i.version=ox++)}function l(c,h){let d=0,u=0,m=0,f=0,x=0,g=0,p=h.matrixWorldInverse;for(let T=0,R=c.length;T<R;T++){let b=c[T];if(b.isSunLight){let E=i.sun[d];E.direction.setFromMatrixPosition(b.matrixWorld),E.direction.transformDirection(p),d++}else if(b.isDirectionalLight){let E=i.directional[u];E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),u++}else if(b.isSpotLight){let E=i.spot[f];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),E.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),f++}else if(b.isRectAreaLight){let E=i.rectArea[x];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),a.identity(),r.copy(b.matrixWorld),r.premultiply(p),a.extractRotation(r),E.halfWidth.set(b.width*.5,0,0),E.halfHeight.set(0,b.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),x++}else if(b.isPointLight){let E=i.point[m];E.position.setFromMatrixPosition(b.matrixWorld),E.position.applyMatrix4(p),m++}else if(b.isHemisphereLight){let E=i.hemi[g];E.direction.setFromMatrixPosition(b.matrixWorld),E.direction.transformDirection(p),g++}}}return{setup:o,setupView:l,state:i}}function vd(n){let e=new cx(n),t=[],i=[],s=[];function r(u){d.camera=u,t.length=0,i.length=0,s.length=0}function a(u){t.push(u)}function o(u){i.push(u)}function l(u){s.push(u)}function c(){e.setup(t)}function h(u){e.setupView(t,u)}let d={lightsArray:t,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function hx(n){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new vd(n),e.set(s,[o])):r>=a.length?(o=new vd(n),a.push(o)):o=a[r],o}function i(){e=new WeakMap}return{get:t,dispose:i}}var ux=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,dx=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,fx=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],px=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],bd=new pt,jr=new D,Xc=new D;function mx(n,e,t){let i=new Os,s=new Fe,r=new Fe,a=new bt,o=new eo,l=new to,c={},h=t.maxTextureSize,d={[Ui]:cn,[cn]:Ui,[Ot]:Ot},u=new xn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Fe},radius:{value:4}},vertexShader:ux,fragmentShader:dx}),m=u.clone();m.defines.HORIZONTAL_PASS=1;let f=new Tt;f.setAttribute("position",new Lt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Mt(f,u),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Br;let p=this.type;this.render=function(S,P,y){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||S.length===0)return;this.type===mu&&(Oe("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Br);let A=n.getRenderTarget(),L=n.getActiveCubeFace(),I=n.getActiveMipmapLevel(),z=n.state;z.setBlending(Qn),z.buffers.depth.getReversed()===!0?z.buffers.color.setClear(0,0,0,0):z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);let W=p!==this.type;W&&P.traverse(function(O){O.material&&(Array.isArray(O.material)?O.material.forEach(k=>k.needsUpdate=!0):O.material.needsUpdate=!0)});for(let O=0,k=S.length;O<k;O++){let Q=S[O],$=Q.shadow;if($===void 0){Oe("WebGLShadowMap:",Q,"has no shadow.");continue}if($.autoUpdate===!1&&$.needsUpdate===!1)continue;s.copy($.mapSize);let re=$.getFrameExtents();s.multiply(re),r.copy($.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/re.x),s.x=r.x*re.x,$.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/re.y),s.y=r.y*re.y,$.mapSize.y=r.y));let j=n.state.buffers.depth.getReversed();if($.camera._reversedDepth=j,$.map===null||W===!0){if($.map!==null&&($.map.depthTexture!==null&&($.map.depthTexture.dispose(),$.map.depthTexture=null),$.map.dispose()),this.type===Gs){if(Q.isPointLight){Oe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}$.map=new dn(s.x,s.y,{format:ki,type:zn,minFilter:qt,magFilter:qt,generateMipmaps:!1}),$.map.texture.name=Q.name+".shadowMap",$.map.depthTexture=new Pi(s.x,s.y,kn),$.map.depthTexture.name=Q.name+".shadowMapDepth",$.map.depthTexture.format=Jn,$.map.depthTexture.compareFunction=null,$.map.depthTexture.minFilter=Wt,$.map.depthTexture.magFilter=Wt}else Q.isPointLight?($.map=new ll(s.x),$.map.depthTexture=new Ka(s.x,Bn)):($.map=new dn(s.x,s.y),$.map.depthTexture=new Pi(s.x,s.y,Bn)),$.map.depthTexture.name=Q.name+".shadowMap",$.map.depthTexture.format=Jn,this.type===Br?($.map.depthTexture.compareFunction=j?sl:il,$.map.depthTexture.minFilter=qt,$.map.depthTexture.magFilter=qt):($.map.depthTexture.compareFunction=null,$.map.depthTexture.minFilter=Wt,$.map.depthTexture.magFilter=Wt);$.camera.updateProjectionMatrix()}$.map.isWebGLCubeRenderTarget!==!0&&($.map.width!==s.x||$.map.height!==s.y)&&$.map.setSize(s.x,s.y);let ae=$.map.isWebGLCubeRenderTarget?6:$.getViewportCount();Q.isPointLight!==!0&&$.updateMatrices(Q,y);for(let ee=0;ee<ae;ee++){let Le=$.getCamera(ee);if(Q.isPointLight){let Ie=$.camera,st=$.matrix,Ue=Q.distance||Ie.far;Ue!==Ie.far&&(Ie.far=Ue,Ie.updateProjectionMatrix()),jr.setFromMatrixPosition(Q.matrixWorld),Ie.position.copy(jr),Xc.copy(Ie.position),Xc.add(fx[ee]),Ie.up.copy(px[ee]),Ie.lookAt(Xc),Ie.updateMatrixWorld(),st.makeTranslation(-jr.x,-jr.y,-jr.z),bd.multiplyMatrices(Ie.projectionMatrix,Ie.matrixWorldInverse),$._frustum.setFromProjectionMatrix(bd,Ie.coordinateSystem,Ie.reversedDepth)}if($.map.isWebGLCubeRenderTarget)n.setRenderTarget($.map,ee),n.clear();else{ee===0&&(n.setRenderTarget($.map),n.clear());let Ie=$.getViewport(ee);a.set(r.x*Ie.x,r.y*Ie.y,r.x*Ie.z,r.y*Ie.w),z.viewport(a)}i=$.getFrustum(ee),b(P,y,Le,Q,this.type)}$.isPointLightShadow!==!0&&this.type===Gs&&T($,y),$.needsUpdate=!1}p=this.type,g.needsUpdate=!1,n.setRenderTarget(A,L,I)};function T(S,P){let y=e.update(x);u.defines.VSM_SAMPLES!==S.blurSamples&&(u.defines.VSM_SAMPLES=S.blurSamples,m.defines.VSM_SAMPLES=S.blurSamples,u.needsUpdate=!0,m.needsUpdate=!0),S.mapPass===null?S.mapPass=new dn(s.x,s.y,{format:ki,type:zn}):(S.mapPass.width!==S.map.width||S.mapPass.height!==S.map.height)&&S.mapPass.setSize(S.map.width,S.map.height),u.uniforms.shadow_pass.value=S.map.depthTexture,u.uniforms.resolution.value.set(S.map.width,S.map.height),u.uniforms.radius.value=S.radius,n.setRenderTarget(S.mapPass),n.clear(),n.renderBufferDirect(P,null,y,u,x,null),m.uniforms.shadow_pass.value=S.mapPass.texture,m.uniforms.resolution.value.set(S.map.width,S.map.height),m.uniforms.radius.value=S.radius,n.setRenderTarget(S.map),n.clear(),n.renderBufferDirect(P,null,y,m,x,null)}function R(S,P,y,A){let L=null,I=y.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(I!==void 0)L=I;else if(L=y.isPointLight===!0?l:o,n.localClippingEnabled&&P.clipShadows===!0&&Array.isArray(P.clippingPlanes)&&P.clippingPlanes.length!==0||P.displacementMap&&P.displacementScale!==0||P.alphaMap&&P.alphaTest>0||P.map&&P.alphaTest>0||P.alphaToCoverage===!0){let z=L.uuid,W=P.uuid,O=c[z];O===void 0&&(O={},c[z]=O);let k=O[W];k===void 0&&(k=L.clone(),O[W]=k,P.addEventListener("dispose",E)),L=k}if(L.visible=P.visible,L.wireframe=P.wireframe,A===Gs?L.side=P.shadowSide!==null?P.shadowSide:P.side:L.side=P.shadowSide!==null?P.shadowSide:d[P.side],L.alphaMap=P.alphaMap,L.alphaTest=P.alphaToCoverage===!0?.5:P.alphaTest,L.map=P.map,L.clipShadows=P.clipShadows,L.clippingPlanes=P.clippingPlanes,L.clipIntersection=P.clipIntersection,L.displacementMap=P.displacementMap,L.displacementScale=P.displacementScale,L.displacementBias=P.displacementBias,L.wireframeLinewidth=P.wireframeLinewidth,L.linewidth=P.linewidth,y.isPointLight===!0&&L.isMeshDistanceMaterial===!0){let z=n.properties.get(L);z.light=y}return L}function b(S,P,y,A,L){if(S.visible===!1)return;if(S.layers.test(P.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&L===Gs)&&(!S.frustumCulled||S.intersectsFrustum(i))){S.modelViewMatrix.multiplyMatrices(y.matrixWorldInverse,S.matrixWorld);let W=e.update(S),O=S.material;if(Array.isArray(O)){let k=W.groups;for(let Q=0,$=k.length;Q<$;Q++){let re=k[Q],j=O[re.materialIndex];if(j&&j.visible){let ae=R(S,j,A,L);S.onBeforeShadow(n,S,P,y,W,ae,re),n.renderBufferDirect(y,null,W,ae,S,re),S.onAfterShadow(n,S,P,y,W,ae,re)}}}else if(O.visible){let k=R(S,O,A,L);S.onBeforeShadow(n,S,P,y,W,k,null),n.renderBufferDirect(y,null,W,k,S,null),S.onAfterShadow(n,S,P,y,W,k,null)}}let z=S.children;for(let W=0,O=z.length;W<O;W++)b(z[W],P,y,A,L)}function E(S){S.target.removeEventListener("dispose",E);for(let y in c){let A=c[y],L=S.target.uuid;L in A&&(A[L].dispose(),delete A[L])}}}function gx(n,e){function t(){let N=!1,fe=new bt,te=null,pe=new bt(0,0,0,0);return{setMask:function(xe){te!==xe&&!N&&(n.colorMask(xe,xe,xe,xe),te=xe)},setLocked:function(xe){N=xe},setClear:function(xe,le,M,w,Y){Y===!0&&(xe*=w,le*=w,M*=w),fe.set(xe,le,M,w),pe.equals(fe)===!1&&(n.clearColor(xe,le,M,w),pe.copy(fe))},reset:function(){N=!1,te=null,pe.set(-1,0,0,0)}}}function i(){let N=!1,fe=!1,te=null,pe=null,xe=null;return{setReversed:function(le){if(fe!==le){let M=e.get("EXT_clip_control");le?M.clipControlEXT(M.LOWER_LEFT_EXT,M.ZERO_TO_ONE_EXT):M.clipControlEXT(M.LOWER_LEFT_EXT,M.NEGATIVE_ONE_TO_ONE_EXT),fe=le;let w=xe;xe=null,this.setClear(w)}},getReversed:function(){return fe},setTest:function(le){le?oe(n.DEPTH_TEST):Se(n.DEPTH_TEST)},setMask:function(le){te!==le&&!N&&(n.depthMask(le),te=le)},setFunc:function(le){if(fe&&(le=Zu[le]),pe!==le){switch(le){case Fa:n.depthFunc(n.NEVER);break;case Oa:n.depthFunc(n.ALWAYS);break;case Ba:n.depthFunc(n.LESS);break;case Ps:n.depthFunc(n.LEQUAL);break;case ka:n.depthFunc(n.EQUAL);break;case za:n.depthFunc(n.GEQUAL);break;case Va:n.depthFunc(n.GREATER);break;case Ha:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}pe=le}},setLocked:function(le){N=le},setClear:function(le){xe!==le&&(xe=le,fe&&(le=1-le),n.clearDepth(le))},reset:function(){N=!1,te=null,pe=null,xe=null,fe=!1}}}function s(){let N=!1,fe=null,te=null,pe=null,xe=null,le=null,M=null,w=null,Y=null;return{setTest:function(X){N||(X?oe(n.STENCIL_TEST):Se(n.STENCIL_TEST))},setMask:function(X){fe!==X&&!N&&(n.stencilMask(X),fe=X)},setFunc:function(X,ie,ge){(te!==X||pe!==ie||xe!==ge)&&(n.stencilFunc(X,ie,ge),te=X,pe=ie,xe=ge)},setOp:function(X,ie,ge){(le!==X||M!==ie||w!==ge)&&(n.stencilOp(X,ie,ge),le=X,M=ie,w=ge)},setLocked:function(X){N=X},setClear:function(X){Y!==X&&(n.clearStencil(X),Y=X)},reset:function(){N=!1,fe=null,te=null,pe=null,xe=null,le=null,M=null,w=null,Y=null}}}let r=new t,a=new i,o=new s,l=new WeakMap,c=new WeakMap,h={},d={},u={},m=new WeakMap,f=[],x=null,g=!1,p=null,T=null,R=null,b=null,E=null,S=null,P=null,y=new qe(0,0,0),A=0,L=!1,I=null,z=null,W=null,O=null,k=null,Q=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),$=!1,re=0,j=n.getParameter(n.VERSION);j.indexOf("WebGL")!==-1?(re=parseFloat(/^WebGL (\d)/.exec(j)[1]),$=re>=1):j.indexOf("OpenGL ES")!==-1&&(re=parseFloat(/^OpenGL ES (\d)/.exec(j)[1]),$=re>=2);let ae=null,ee={},Le=n.getParameter(n.SCISSOR_BOX),Ie=n.getParameter(n.VIEWPORT),st=new bt().fromArray(Le),Ue=new bt().fromArray(Ie);function nt(N,fe,te,pe){let xe=new Uint8Array(4),le=n.createTexture();n.bindTexture(N,le),n.texParameteri(N,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(N,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let M=0;M<te;M++)N===n.TEXTURE_3D||N===n.TEXTURE_2D_ARRAY?n.texImage3D(fe,0,n.RGBA,1,1,pe,0,n.RGBA,n.UNSIGNED_BYTE,xe):n.texImage2D(fe+M,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,xe);return le}let J={};J[n.TEXTURE_2D]=nt(n.TEXTURE_2D,n.TEXTURE_2D,1),J[n.TEXTURE_CUBE_MAP]=nt(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),J[n.TEXTURE_2D_ARRAY]=nt(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),J[n.TEXTURE_3D]=nt(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),oe(n.DEPTH_TEST),a.setFunc(Ps),$e(!1),mt(dc),oe(n.CULL_FACE),it(Qn);function oe(N){h[N]!==!0&&(n.enable(N),h[N]=!0)}function Se(N){h[N]!==!1&&(n.disable(N),h[N]=!1)}function Be(N,fe){return u[N]!==fe?(n.bindFramebuffer(N,fe),u[N]=fe,N===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=fe),N===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=fe),!0):!1}function be(N,fe){let te=f,pe=!1;if(N){te=m.get(fe),te===void 0&&(te=[],m.set(fe,te));let xe=N.textures;if(te.length!==xe.length||te[0]!==n.COLOR_ATTACHMENT0){for(let le=0,M=xe.length;le<M;le++)te[le]=n.COLOR_ATTACHMENT0+le;te.length=xe.length,pe=!0}}else te[0]!==n.BACK&&(te[0]=n.BACK,pe=!0);pe&&n.drawBuffers(te)}function Ge(N){return x!==N?(n.useProgram(N),x=N,!0):!1}let wt={[ns]:n.FUNC_ADD,[_u]:n.FUNC_SUBTRACT,[xu]:n.FUNC_REVERSE_SUBTRACT};wt[yu]=n.MIN,wt[vu]=n.MAX;let Xe={[bu]:n.ZERO,[Mu]:n.ONE,[Su]:n.SRC_COLOR,[gc]:n.SRC_ALPHA,[Ru]:n.SRC_ALPHA_SATURATE,[Au]:n.DST_COLOR,[Tu]:n.DST_ALPHA,[Eu]:n.ONE_MINUS_SRC_COLOR,[_c]:n.ONE_MINUS_SRC_ALPHA,[Cu]:n.ONE_MINUS_DST_COLOR,[wu]:n.ONE_MINUS_DST_ALPHA,[Pu]:n.CONSTANT_COLOR,[Iu]:n.ONE_MINUS_CONSTANT_COLOR,[Lu]:n.CONSTANT_ALPHA,[Du]:n.ONE_MINUS_CONSTANT_ALPHA};function it(N,fe,te,pe,xe,le,M,w,Y,X){if(N===Qn){g===!0&&(Se(n.BLEND),g=!1);return}if(g===!1&&(oe(n.BLEND),g=!0),N!==gu){if(N!==p||X!==L){if((T!==ns||E!==ns)&&(n.blendEquation(n.FUNC_ADD),T=ns,E=ns),X)switch(N){case Ws:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case fc:n.blendFunc(n.ONE,n.ONE);break;case pc:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case mc:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:ke("WebGLState: Invalid blending: ",N);break}else switch(N){case Ws:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case fc:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case pc:ke("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case mc:ke("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ke("WebGLState: Invalid blending: ",N);break}R=null,b=null,S=null,P=null,y.set(0,0,0),A=0,p=N,L=X}return}xe=xe||fe,le=le||te,M=M||pe,(fe!==T||xe!==E)&&(n.blendEquationSeparate(wt[fe],wt[xe]),T=fe,E=xe),(te!==R||pe!==b||le!==S||M!==P)&&(n.blendFuncSeparate(Xe[te],Xe[pe],Xe[le],Xe[M]),R=te,b=pe,S=le,P=M),(w.equals(y)===!1||Y!==A)&&(n.blendColor(w.r,w.g,w.b,Y),y.copy(w),A=Y),p=N,L=!1}function ct(N,fe){N.side===Ot?Se(n.CULL_FACE):oe(n.CULL_FACE);let te=N.side===cn;fe&&(te=!te),$e(te),N.blending===Ws&&N.transparent===!1?it(Qn):it(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),a.setFunc(N.depthFunc),a.setTest(N.depthTest),a.setMask(N.depthWrite),r.setMask(N.colorWrite);let pe=N.stencilWrite;o.setTest(pe),pe&&(o.setMask(N.stencilWriteMask),o.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),o.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),At(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?oe(n.SAMPLE_ALPHA_TO_COVERAGE):Se(n.SAMPLE_ALPHA_TO_COVERAGE)}function $e(N){I!==N&&(N?n.frontFace(n.CW):n.frontFace(n.CCW),I=N)}function mt(N){N!==fu?(oe(n.CULL_FACE),N!==z&&(N===dc?n.cullFace(n.BACK):N===pu?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Se(n.CULL_FACE),z=N}function Rt(N){N!==W&&($&&n.lineWidth(N),W=N)}function At(N,fe,te){N?(oe(n.POLYGON_OFFSET_FILL),(O!==fe||k!==te)&&(O=fe,k=te,a.getReversed()&&(fe=-fe),n.polygonOffset(fe,te))):Se(n.POLYGON_OFFSET_FILL)}function _t(N){N?oe(n.SCISSOR_TEST):Se(n.SCISSOR_TEST)}function Ct(N){N===void 0&&(N=n.TEXTURE0+Q-1),ae!==N&&(n.activeTexture(N),ae=N)}function F(N,fe,te){te===void 0&&(ae===null?te=n.TEXTURE0+Q-1:te=ae);let pe=ee[te];pe===void 0&&(pe={type:void 0,texture:void 0},ee[te]=pe),(pe.type!==N||pe.texture!==fe)&&(ae!==te&&(n.activeTexture(te),ae=te),n.bindTexture(N,fe||J[N]),pe.type=N,pe.texture=fe)}function rt(){let N=ee[ae];N!==void 0&&N.type!==void 0&&(n.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function Ke(){try{n.compressedTexImage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function C(){try{n.compressedTexImage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function _(){try{n.texSubImage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function B(){try{n.texSubImage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function V(){try{n.compressedTexSubImage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function Z(){try{n.compressedTexSubImage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function ce(){try{n.texStorage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function he(){try{n.texStorage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function K(){try{n.texImage2D(...arguments)}catch(N){ke("WebGLState:",N)}}function se(){try{n.texImage3D(...arguments)}catch(N){ke("WebGLState:",N)}}function ue(N){return d[N]!==void 0?d[N]:n.getParameter(N)}function Ce(N,fe){d[N]!==fe&&(n.pixelStorei(N,fe),d[N]=fe)}function me(N){st.equals(N)===!1&&(n.scissor(N.x,N.y,N.z,N.w),st.copy(N))}function de(N){Ue.equals(N)===!1&&(n.viewport(N.x,N.y,N.z,N.w),Ue.copy(N))}function Re(N,fe){let te=c.get(fe);te===void 0&&(te=new WeakMap,c.set(fe,te));let pe=te.get(N);pe===void 0&&(pe=n.getUniformBlockIndex(fe,N.name),te.set(N,pe))}function Ne(N,fe){let pe=c.get(fe).get(N);l.get(fe)!==pe&&(n.uniformBlockBinding(fe,pe,N.__bindingPointIndex),l.set(fe,pe))}function Ve(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),h={},d={},ae=null,ee={},u={},m=new WeakMap,f=[],x=null,g=!1,p=null,T=null,R=null,b=null,E=null,S=null,P=null,y=new qe(0,0,0),A=0,L=!1,I=null,z=null,W=null,O=null,k=null,st.set(0,0,n.canvas.width,n.canvas.height),Ue.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:oe,disable:Se,bindFramebuffer:Be,drawBuffers:be,useProgram:Ge,setBlending:it,setMaterial:ct,setFlipSided:$e,setCullFace:mt,setLineWidth:Rt,setPolygonOffset:At,setScissorTest:_t,activeTexture:Ct,bindTexture:F,unbindTexture:rt,compressedTexImage2D:Ke,compressedTexImage3D:C,texImage2D:K,texImage3D:se,pixelStorei:Ce,getParameter:ue,updateUBOMapping:Re,uniformBlockBinding:Ne,texStorage2D:ce,texStorage3D:he,texSubImage2D:_,texSubImage3D:B,compressedTexSubImage2D:V,compressedTexSubImage3D:Z,scissor:me,viewport:de,reset:Ve}}function _x(n,e,t,i,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Fe,h=new WeakMap,d=new Set,u,m=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(C,_){return f?new OffscreenCanvas(C,_):br("canvas")}function g(C,_,B){let V=1,Z=Ke(C);if((Z.width>B||Z.height>B)&&(V=B/Math.max(Z.width,Z.height)),V<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let ce=Math.floor(V*Z.width),he=Math.floor(V*Z.height);u===void 0&&(u=x(ce,he));let K=_?x(ce,he):u;return K.width=ce,K.height=he,K.getContext("2d").drawImage(C,0,0,ce,he),Oe("WebGLRenderer: Texture has been resized from ("+Z.width+"x"+Z.height+") to ("+ce+"x"+he+")."),K}else return"data"in C&&Oe("WebGLRenderer: Image in DataTexture is too big ("+Z.width+"x"+Z.height+")."),C;return C}function p(C){return C.generateMipmaps}function T(C){n.generateMipmap(C)}function R(C){return C.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?n.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function b(C,_,B,V,Z,ce=!1){if(C!==null){if(n[C]!==void 0)return n[C];Oe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let he;V&&(he=e.get("EXT_texture_norm16"),he||Oe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let K=_;if(_===n.RED&&(B===n.FLOAT&&(K=n.R32F),B===n.HALF_FLOAT&&(K=n.R16F),B===n.UNSIGNED_BYTE&&(K=n.R8),B===n.UNSIGNED_SHORT&&he&&(K=he.R16_EXT),B===n.SHORT&&he&&(K=he.R16_SNORM_EXT)),_===n.RED_INTEGER&&(B===n.UNSIGNED_BYTE&&(K=n.R8UI),B===n.UNSIGNED_SHORT&&(K=n.R16UI),B===n.UNSIGNED_INT&&(K=n.R32UI),B===n.BYTE&&(K=n.R8I),B===n.SHORT&&(K=n.R16I),B===n.INT&&(K=n.R32I)),_===n.RG&&(B===n.FLOAT&&(K=n.RG32F),B===n.HALF_FLOAT&&(K=n.RG16F),B===n.UNSIGNED_BYTE&&(K=n.RG8),B===n.UNSIGNED_SHORT&&he&&(K=he.RG16_EXT),B===n.SHORT&&he&&(K=he.RG16_SNORM_EXT)),_===n.RG_INTEGER&&(B===n.UNSIGNED_BYTE&&(K=n.RG8UI),B===n.UNSIGNED_SHORT&&(K=n.RG16UI),B===n.UNSIGNED_INT&&(K=n.RG32UI),B===n.BYTE&&(K=n.RG8I),B===n.SHORT&&(K=n.RG16I),B===n.INT&&(K=n.RG32I)),_===n.RGB_INTEGER&&(B===n.UNSIGNED_BYTE&&(K=n.RGB8UI),B===n.UNSIGNED_SHORT&&(K=n.RGB16UI),B===n.UNSIGNED_INT&&(K=n.RGB32UI),B===n.BYTE&&(K=n.RGB8I),B===n.SHORT&&(K=n.RGB16I),B===n.INT&&(K=n.RGB32I)),_===n.RGBA_INTEGER&&(B===n.UNSIGNED_BYTE&&(K=n.RGBA8UI),B===n.UNSIGNED_SHORT&&(K=n.RGBA16UI),B===n.UNSIGNED_INT&&(K=n.RGBA32UI),B===n.BYTE&&(K=n.RGBA8I),B===n.SHORT&&(K=n.RGBA16I),B===n.INT&&(K=n.RGBA32I)),_===n.RGB&&(B===n.UNSIGNED_SHORT&&he&&(K=he.RGB16_EXT),B===n.SHORT&&he&&(K=he.RGB16_SNORM_EXT),B===n.UNSIGNED_INT_5_9_9_9_REV&&(K=n.RGB9_E5),B===n.UNSIGNED_INT_10F_11F_11F_REV&&(K=n.R11F_G11F_B10F)),_===n.RGBA){let se=ce?vr:tt.getTransfer(Z);B===n.FLOAT&&(K=n.RGBA32F),B===n.HALF_FLOAT&&(K=n.RGBA16F),B===n.UNSIGNED_BYTE&&(K=se===lt?n.SRGB8_ALPHA8:n.RGBA8),B===n.UNSIGNED_SHORT&&he&&(K=he.RGBA16_EXT),B===n.SHORT&&he&&(K=he.RGBA16_SNORM_EXT),B===n.UNSIGNED_SHORT_4_4_4_4&&(K=n.RGBA4),B===n.UNSIGNED_SHORT_5_5_5_1&&(K=n.RGB5_A1)}return(K===n.R16F||K===n.R32F||K===n.RG16F||K===n.RG32F||K===n.RGBA16F||K===n.RGBA32F)&&e.get("EXT_color_buffer_float"),K}function E(C,_){let B;return C?_===null||_===Bn||_===Ys?B=n.DEPTH24_STENCIL8:_===kn?B=n.DEPTH32F_STENCIL8:_===Xs&&(B=n.DEPTH24_STENCIL8,Oe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Bn||_===Ys?B=n.DEPTH_COMPONENT24:_===kn?B=n.DEPTH_COMPONENT32F:_===Xs&&(B=n.DEPTH_COMPONENT16),B}function S(C,_){return p(C)===!0||C.isFramebufferTexture&&C.minFilter!==Wt&&C.minFilter!==qt?Math.log2(Math.max(_.width,_.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?_.mipmaps.length:1}function P(C){let _=C.target;_.removeEventListener("dispose",P),A(_),_.isVideoTexture&&h.delete(_),_.isHTMLTexture&&d.delete(_)}function y(C){let _=C.target;_.removeEventListener("dispose",y),I(_)}function A(C){let _=i.get(C);if(_.__webglInit===void 0)return;let B=C.source,V=m.get(B);if(V){let Z=V[_.__cacheKey];Z.usedTimes--,Z.usedTimes===0&&L(C),Object.keys(V).length===0&&m.delete(B)}i.remove(C)}function L(C){let _=i.get(C);n.deleteTexture(_.__webglTexture);let B=C.source,V=m.get(B);delete V[_.__cacheKey],a.memory.textures--}function I(C){let _=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let V=0;V<6;V++){if(Array.isArray(_.__webglFramebuffer[V]))for(let Z=0;Z<_.__webglFramebuffer[V].length;Z++)n.deleteFramebuffer(_.__webglFramebuffer[V][Z]);else n.deleteFramebuffer(_.__webglFramebuffer[V]);_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer[V])}else{if(Array.isArray(_.__webglFramebuffer))for(let V=0;V<_.__webglFramebuffer.length;V++)n.deleteFramebuffer(_.__webglFramebuffer[V]);else n.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&n.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let V=0;V<_.__webglColorRenderbuffer.length;V++)_.__webglColorRenderbuffer[V]&&n.deleteRenderbuffer(_.__webglColorRenderbuffer[V]);_.__webglDepthRenderbuffer&&n.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let B=C.textures;for(let V=0,Z=B.length;V<Z;V++){let ce=i.get(B[V]);ce.__webglTexture&&(n.deleteTexture(ce.__webglTexture),a.memory.textures--),i.remove(B[V])}i.remove(C)}let z=0;function W(){z=0}function O(){return z}function k(C){z=C}function Q(){let C=z;return C>=s.maxTextures&&Oe("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+s.maxTextures),z+=1,C}function $(C){let _=[];return _.push(C.wrapS),_.push(C.wrapT),_.push(C.wrapR||0),_.push(C.magFilter),_.push(C.minFilter),_.push(C.anisotropy),_.push(C.internalFormat),_.push(C.format),_.push(C.type),_.push(C.generateMipmaps),_.push(C.premultiplyAlpha),_.push(C.flipY),_.push(C.unpackAlignment),_.push(C.colorSpace),_.join()}function re(C,_){let B=i.get(C);if(C.isVideoTexture&&F(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&B.__version!==C.version){let V=C.image;if(V===null)Oe("WebGLRenderer: Texture marked for update but no image data found.");else if(V.complete===!1)Oe("WebGLRenderer: Texture marked for update but image is incomplete");else{Se(B,C,_);return}}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,B.__webglTexture,n.TEXTURE0+_)}function j(C,_){let B=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){Se(B,C,_);return}else C.isExternalTexture&&(B.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,B.__webglTexture,n.TEXTURE0+_)}function ae(C,_){let B=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&B.__version!==C.version){Se(B,C,_);return}t.bindTexture(n.TEXTURE_3D,B.__webglTexture,n.TEXTURE0+_)}function ee(C,_){let B=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&B.__version!==C.version){Be(B,C,_);return}t.bindTexture(n.TEXTURE_CUBE_MAP,B.__webglTexture,n.TEXTURE0+_)}let Le={[Ga]:n.REPEAT,[Zn]:n.CLAMP_TO_EDGE,[Wa]:n.MIRRORED_REPEAT},Ie={[Wt]:n.NEAREST,[Fu]:n.NEAREST_MIPMAP_NEAREST,[zr]:n.NEAREST_MIPMAP_LINEAR,[qt]:n.LINEAR,[yo]:n.LINEAR_MIPMAP_NEAREST,[Oi]:n.LINEAR_MIPMAP_LINEAR},st={[zu]:n.NEVER,[Xu]:n.ALWAYS,[Vu]:n.LESS,[il]:n.LEQUAL,[Hu]:n.EQUAL,[sl]:n.GEQUAL,[Gu]:n.GREATER,[Wu]:n.NOTEQUAL};function Ue(C,_){if(_.type===kn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===qt||_.magFilter===yo||_.magFilter===zr||_.magFilter===Oi||_.minFilter===qt||_.minFilter===yo||_.minFilter===zr||_.minFilter===Oi)&&Oe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(C,n.TEXTURE_WRAP_S,Le[_.wrapS]),n.texParameteri(C,n.TEXTURE_WRAP_T,Le[_.wrapT]),(C===n.TEXTURE_3D||C===n.TEXTURE_2D_ARRAY)&&n.texParameteri(C,n.TEXTURE_WRAP_R,Le[_.wrapR]),n.texParameteri(C,n.TEXTURE_MAG_FILTER,Ie[_.magFilter]),n.texParameteri(C,n.TEXTURE_MIN_FILTER,Ie[_.minFilter]),_.compareFunction&&(n.texParameteri(C,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(C,n.TEXTURE_COMPARE_FUNC,st[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===Wt||_.minFilter!==zr&&_.minFilter!==Oi||_.type===kn&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){let B=e.get("EXT_texture_filter_anisotropic");n.texParameterf(C,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function nt(C,_){let B=!1;C.__webglInit===void 0&&(C.__webglInit=!0,_.addEventListener("dispose",P));let V=_.source,Z=m.get(V);Z===void 0&&(Z={},m.set(V,Z));let ce=$(_);if(ce!==C.__cacheKey){Z[ce]===void 0&&(Z[ce]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,B=!0),Z[ce].usedTimes++;let he=Z[C.__cacheKey];he!==void 0&&(Z[C.__cacheKey].usedTimes--,he.usedTimes===0&&L(_)),C.__cacheKey=ce,C.__webglTexture=Z[ce].texture}return B}function J(C,_,B){return Math.floor(Math.floor(C/B)/_)}function oe(C,_,B,V){let ce=C.updateRanges;if(ce.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,_.width,_.height,B,V,_.data);else{ce.sort((Ce,me)=>Ce.start-me.start);let he=0;for(let Ce=1;Ce<ce.length;Ce++){let me=ce[he],de=ce[Ce],Re=me.start+me.count,Ne=J(de.start,_.width,4),Ve=J(me.start,_.width,4);de.start<=Re+1&&Ne===Ve&&J(de.start+de.count-1,_.width,4)===Ne?me.count=Math.max(me.count,de.start+de.count-me.start):(++he,ce[he]=de)}ce.length=he+1;let K=t.getParameter(n.UNPACK_ROW_LENGTH),se=t.getParameter(n.UNPACK_SKIP_PIXELS),ue=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,_.width);for(let Ce=0,me=ce.length;Ce<me;Ce++){let de=ce[Ce],Re=Math.floor(de.start/4),Ne=Math.ceil(de.count/4),Ve=Re%_.width,N=Math.floor(Re/_.width),fe=Ne,te=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,Ve),t.pixelStorei(n.UNPACK_SKIP_ROWS,N),t.texSubImage2D(n.TEXTURE_2D,0,Ve,N,fe,te,B,V,_.data)}C.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,K),t.pixelStorei(n.UNPACK_SKIP_PIXELS,se),t.pixelStorei(n.UNPACK_SKIP_ROWS,ue)}}function Se(C,_,B){let V=n.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(V=n.TEXTURE_2D_ARRAY),_.isData3DTexture&&(V=n.TEXTURE_3D);let Z=nt(C,_),ce=_.source;t.bindTexture(V,C.__webglTexture,n.TEXTURE0+B);let he=i.get(ce);if(ce.version!==he.__version||Z===!0){if(t.activeTexture(n.TEXTURE0+B),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let te=tt.getPrimaries(tt.workingColorSpace),pe=_.colorSpace===di?null:tt.getPrimaries(_.colorSpace),xe=_.colorSpace===di||te===pe?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe)}t.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment);let se=g(_.image,!1,s.maxTextureSize);se=rt(_,se);let ue=r.convert(_.format,_.colorSpace),Ce=r.convert(_.type),me=b(_.internalFormat,ue,Ce,_.normalized,_.colorSpace,_.isVideoTexture);Ue(V,_);let de,Re=_.mipmaps,Ne=_.isVideoTexture!==!0,Ve=he.__version===void 0||Z===!0,N=ce.dataReady,fe=S(_,se);if(_.isDepthTexture)me=E(_.format===Bi,_.type),Ve&&(Ne?t.texStorage2D(n.TEXTURE_2D,1,me,se.width,se.height):t.texImage2D(n.TEXTURE_2D,0,me,se.width,se.height,0,ue,Ce,null));else if(_.isDataTexture)if(Re.length>0){Ne&&Ve&&t.texStorage2D(n.TEXTURE_2D,fe,me,Re[0].width,Re[0].height);for(let te=0,pe=Re.length;te<pe;te++)de=Re[te],Ne?N&&t.texSubImage2D(n.TEXTURE_2D,te,0,0,de.width,de.height,ue,Ce,de.data):t.texImage2D(n.TEXTURE_2D,te,me,de.width,de.height,0,ue,Ce,de.data);_.generateMipmaps=!1}else Ne?(Ve&&t.texStorage2D(n.TEXTURE_2D,fe,me,se.width,se.height),N&&oe(_,se,ue,Ce)):t.texImage2D(n.TEXTURE_2D,0,me,se.width,se.height,0,ue,Ce,se.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){Ne&&Ve&&t.texStorage3D(n.TEXTURE_2D_ARRAY,fe,me,Re[0].width,Re[0].height,se.depth);for(let te=0,pe=Re.length;te<pe;te++)if(de=Re[te],_.format!==En)if(ue!==null)if(Ne){if(N)if(_.layerUpdates.size>0){let xe=kc(de.width,de.height,_.format,_.type);for(let le of _.layerUpdates){let M=de.data.subarray(le*xe/de.data.BYTES_PER_ELEMENT,(le+1)*xe/de.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,te,0,0,le,de.width,de.height,1,ue,M)}}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,te,0,0,0,de.width,de.height,se.depth,ue,de.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,te,me,de.width,de.height,se.depth,0,de.data,0,0);else Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ne?N&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,te,0,0,0,de.width,de.height,se.depth,ue,Ce,de.data):t.texImage3D(n.TEXTURE_2D_ARRAY,te,me,de.width,de.height,se.depth,0,ue,Ce,de.data);_.layerUpdates.size>0&&_.clearLayerUpdates()}else{Ne&&Ve&&t.texStorage2D(n.TEXTURE_2D,fe,me,Re[0].width,Re[0].height);for(let te=0,pe=Re.length;te<pe;te++)de=Re[te],_.format!==En?ue!==null?Ne?N&&t.compressedTexSubImage2D(n.TEXTURE_2D,te,0,0,de.width,de.height,ue,de.data):t.compressedTexImage2D(n.TEXTURE_2D,te,me,de.width,de.height,0,de.data):Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ne?N&&t.texSubImage2D(n.TEXTURE_2D,te,0,0,de.width,de.height,ue,Ce,de.data):t.texImage2D(n.TEXTURE_2D,te,me,de.width,de.height,0,ue,Ce,de.data)}else if(_.isDataArrayTexture)if(Ne){if(Ve&&t.texStorage3D(n.TEXTURE_2D_ARRAY,fe,me,se.width,se.height,se.depth),N)if(_.layerUpdates.size>0){let te=kc(se.width,se.height,_.format,_.type);for(let pe of _.layerUpdates){let xe=se.data.subarray(pe*te/se.data.BYTES_PER_ELEMENT,(pe+1)*te/se.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,pe,se.width,se.height,1,ue,Ce,xe)}_.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,se.width,se.height,se.depth,ue,Ce,se.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,me,se.width,se.height,se.depth,0,ue,Ce,se.data);else if(_.isData3DTexture)Ne?(Ve&&t.texStorage3D(n.TEXTURE_3D,fe,me,se.width,se.height,se.depth),N&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,se.width,se.height,se.depth,ue,Ce,se.data)):t.texImage3D(n.TEXTURE_3D,0,me,se.width,se.height,se.depth,0,ue,Ce,se.data);else if(_.isFramebufferTexture){if(Ve)if(Ne)t.texStorage2D(n.TEXTURE_2D,fe,me,se.width,se.height);else{let te=se.width,pe=se.height;for(let xe=0;xe<fe;xe++)t.texImage2D(n.TEXTURE_2D,xe,me,te,pe,0,ue,Ce,null),te>>=1,pe>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in n){let te=n.canvas;if(te.hasAttribute("layoutsubtree")||te.setAttribute("layoutsubtree","true"),se.parentNode!==te){te.appendChild(se),d.add(_),te.onpaint=pe=>{let xe=pe.changedElements;for(let le of d)xe.includes(le.image)&&(le.needsUpdate=!0)},te.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,se);else{let xe=n.RGBA,le=n.RGBA,M=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,xe,le,M,se)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Re.length>0){if(Ne&&Ve){let te=Ke(Re[0]);t.texStorage2D(n.TEXTURE_2D,fe,me,te.width,te.height)}for(let te=0,pe=Re.length;te<pe;te++)de=Re[te],Ne?N&&t.texSubImage2D(n.TEXTURE_2D,te,0,0,ue,Ce,de):t.texImage2D(n.TEXTURE_2D,te,me,ue,Ce,de);_.generateMipmaps=!1}else if(Ne){if(Ve){let te=Ke(se);t.texStorage2D(n.TEXTURE_2D,fe,me,te.width,te.height)}N&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ue,Ce,se)}else t.texImage2D(n.TEXTURE_2D,0,me,ue,Ce,se);p(_)&&T(V),he.__version=ce.version,_.onUpdate&&_.onUpdate(_)}C.__version=_.version}function Be(C,_,B){if(_.image.length!==6)return;let V=nt(C,_),Z=_.source;t.bindTexture(n.TEXTURE_CUBE_MAP,C.__webglTexture,n.TEXTURE0+B);let ce=i.get(Z);if(Z.version!==ce.__version||V===!0){t.activeTexture(n.TEXTURE0+B);let he=tt.getPrimaries(tt.workingColorSpace),K=_.colorSpace===di?null:tt.getPrimaries(_.colorSpace),se=_.colorSpace===di||he===K?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,se);let ue=_.isCompressedTexture||_.image[0].isCompressedTexture,Ce=_.image[0]&&_.image[0].isDataTexture,me=[];for(let le=0;le<6;le++)!ue&&!Ce?me[le]=g(_.image[le],!0,s.maxCubemapSize):me[le]=Ce?_.image[le].image:_.image[le],me[le]=rt(_,me[le]);let de=me[0],Re=r.convert(_.format,_.colorSpace),Ne=r.convert(_.type),Ve=b(_.internalFormat,Re,Ne,_.normalized,_.colorSpace),N=_.isVideoTexture!==!0,fe=ce.__version===void 0||V===!0,te=Z.dataReady,pe=S(_,de);Ue(n.TEXTURE_CUBE_MAP,_);let xe;if(ue){N&&fe&&t.texStorage2D(n.TEXTURE_CUBE_MAP,pe,Ve,de.width,de.height);for(let le=0;le<6;le++){xe=me[le].mipmaps;for(let M=0;M<xe.length;M++){let w=xe[M];_.format!==En?Re!==null?N?te&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,M,0,0,w.width,w.height,Re,w.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,M,Ve,w.width,w.height,0,w.data):Oe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):N?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,M,0,0,w.width,w.height,Re,Ne,w.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,M,Ve,w.width,w.height,0,Re,Ne,w.data)}}}else{if(xe=_.mipmaps,N&&fe){xe.length>0&&pe++;let le=Ke(me[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,pe,Ve,le.width,le.height)}for(let le=0;le<6;le++)if(Ce){N?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,0,0,me[le].width,me[le].height,Re,Ne,me[le].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,Ve,me[le].width,me[le].height,0,Re,Ne,me[le].data);for(let M=0;M<xe.length;M++){let Y=xe[M].image[le].image;N?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,M+1,0,0,Y.width,Y.height,Re,Ne,Y.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,M+1,Ve,Y.width,Y.height,0,Re,Ne,Y.data)}}else{N?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,0,0,Re,Ne,me[le]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,Ve,Re,Ne,me[le]);for(let M=0;M<xe.length;M++){let w=xe[M];N?te&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,M+1,0,0,Re,Ne,w.image[le]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,M+1,Ve,Re,Ne,w.image[le])}}}p(_)&&T(n.TEXTURE_CUBE_MAP),ce.__version=Z.version,_.onUpdate&&_.onUpdate(_)}C.__version=_.version}function be(C,_,B,V,Z,ce){let he=r.convert(B.format,B.colorSpace),K=r.convert(B.type),se=b(B.internalFormat,he,K,B.normalized,B.colorSpace),ue=i.get(_),Ce=i.get(B);if(Ce.__renderTarget=_,!ue.__hasExternalTextures){let me=Math.max(1,_.width>>ce),de=Math.max(1,_.height>>ce);Z===n.TEXTURE_3D||Z===n.TEXTURE_2D_ARRAY?t.texImage3D(Z,ce,se,me,de,_.depth,0,he,K,null):t.texImage2D(Z,ce,se,me,de,0,he,K,null)}t.bindFramebuffer(n.FRAMEBUFFER,C),Ct(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,V,Z,Ce.__webglTexture,0,_t(_)):(Z===n.TEXTURE_2D||Z>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&Z<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,V,Z,Ce.__webglTexture,ce),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Ge(C,_,B){if(n.bindRenderbuffer(n.RENDERBUFFER,C),_.depthBuffer){let V=_.depthTexture,Z=V&&V.isDepthTexture?V.type:null,ce=E(_.stencilBuffer,Z),he=_.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;Ct(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,_t(_),ce,_.width,_.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,_t(_),ce,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,ce,_.width,_.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,he,n.RENDERBUFFER,C)}else{let V=_.textures;for(let Z=0;Z<V.length;Z++){let ce=V[Z],he=r.convert(ce.format,ce.colorSpace),K=r.convert(ce.type),se=b(ce.internalFormat,he,K,ce.normalized,ce.colorSpace);Ct(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,_t(_),se,_.width,_.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,_t(_),se,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,se,_.width,_.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function wt(C,_,B){let V=_.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,C),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let Z=i.get(_.depthTexture);if(Z.__renderTarget=_,(!Z.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),V){if(Z.__webglInit===void 0&&(Z.__webglInit=!0,_.depthTexture.addEventListener("dispose",P)),Z.__webglTexture===void 0){Z.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,Z.__webglTexture),Ue(n.TEXTURE_CUBE_MAP,_.depthTexture);let ue=r.convert(_.depthTexture.format),Ce=r.convert(_.depthTexture.type),me;_.depthTexture.format===Jn?me=n.DEPTH_COMPONENT24:_.depthTexture.format===Bi&&(me=n.DEPTH24_STENCIL8);for(let de=0;de<6;de++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+de,0,me,_.width,_.height,0,ue,Ce,null)}}else re(_.depthTexture,0);let ce=Z.__webglTexture,he=_t(_),K=V?n.TEXTURE_CUBE_MAP_POSITIVE_X+B:n.TEXTURE_2D,se=_.depthTexture.format===Bi?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(_.depthTexture.format===Jn)Ct(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,se,K,ce,0,he):n.framebufferTexture2D(n.FRAMEBUFFER,se,K,ce,0);else if(_.depthTexture.format===Bi)Ct(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,se,K,ce,0,he):n.framebufferTexture2D(n.FRAMEBUFFER,se,K,ce,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Xe(C){let _=i.get(C),B=C.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==C.depthTexture){let V=C.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),V){let Z=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,V.removeEventListener("dispose",Z)};V.addEventListener("dispose",Z),_.__depthDisposeCallback=Z}_.__boundDepthTexture=V}if(C.depthTexture&&!_.__autoAllocateDepthBuffer)if(B)for(let V=0;V<6;V++)wt(_.__webglFramebuffer[V],C,V);else{let V=C.texture.mipmaps;V&&V.length>0?wt(_.__webglFramebuffer[0],C,0):wt(_.__webglFramebuffer,C,0)}else if(B){_.__webglDepthbuffer=[];for(let V=0;V<6;V++)if(t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[V]),_.__webglDepthbuffer[V]===void 0)_.__webglDepthbuffer[V]=n.createRenderbuffer(),Ge(_.__webglDepthbuffer[V],C,!1);else{let Z=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ce=_.__webglDepthbuffer[V];n.bindRenderbuffer(n.RENDERBUFFER,ce),n.framebufferRenderbuffer(n.FRAMEBUFFER,Z,n.RENDERBUFFER,ce)}}else{let V=C.texture.mipmaps;if(V&&V.length>0?t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=n.createRenderbuffer(),Ge(_.__webglDepthbuffer,C,!1);else{let Z=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ce=_.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ce),n.framebufferRenderbuffer(n.FRAMEBUFFER,Z,n.RENDERBUFFER,ce)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function it(C,_,B){let V=i.get(C);_!==void 0&&be(V.__webglFramebuffer,C,C.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),B!==void 0&&Xe(C)}function ct(C){let _=C.texture,B=i.get(C),V=i.get(_);C.addEventListener("dispose",y);let Z=C.textures,ce=C.isWebGLCubeRenderTarget===!0,he=Z.length>1;if(he||(V.__webglTexture===void 0&&(V.__webglTexture=n.createTexture()),V.__version=_.version,a.memory.textures++),ce){B.__webglFramebuffer=[];for(let K=0;K<6;K++)if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer[K]=[];for(let se=0;se<_.mipmaps.length;se++)B.__webglFramebuffer[K][se]=n.createFramebuffer()}else B.__webglFramebuffer[K]=n.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer=[];for(let K=0;K<_.mipmaps.length;K++)B.__webglFramebuffer[K]=n.createFramebuffer()}else B.__webglFramebuffer=n.createFramebuffer();if(he)for(let K=0,se=Z.length;K<se;K++){let ue=i.get(Z[K]);ue.__webglTexture===void 0&&(ue.__webglTexture=n.createTexture(),a.memory.textures++)}if(C.samples>0&&Ct(C)===!1){B.__webglMultisampledFramebuffer=n.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let K=0;K<Z.length;K++){let se=Z[K];B.__webglColorRenderbuffer[K]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,B.__webglColorRenderbuffer[K]);let ue=r.convert(se.format,se.colorSpace),Ce=r.convert(se.type),me=b(se.internalFormat,ue,Ce,se.normalized,se.colorSpace,C.isXRRenderTarget===!0),de=_t(C);n.renderbufferStorageMultisample(n.RENDERBUFFER,de,me,C.width,C.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+K,n.RENDERBUFFER,B.__webglColorRenderbuffer[K])}n.bindRenderbuffer(n.RENDERBUFFER,null),C.depthBuffer&&(B.__webglDepthRenderbuffer=n.createRenderbuffer(),Ge(B.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ce){t.bindTexture(n.TEXTURE_CUBE_MAP,V.__webglTexture),Ue(n.TEXTURE_CUBE_MAP,_);for(let K=0;K<6;K++)if(_.mipmaps&&_.mipmaps.length>0)for(let se=0;se<_.mipmaps.length;se++)be(B.__webglFramebuffer[K][se],C,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+K,se);else be(B.__webglFramebuffer[K],C,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0);p(_)&&T(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(he){for(let K=0,se=Z.length;K<se;K++){let ue=Z[K],Ce=i.get(ue),me=n.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(me=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(me,Ce.__webglTexture),Ue(me,ue),be(B.__webglFramebuffer,C,ue,n.COLOR_ATTACHMENT0+K,me,0),p(ue)&&T(me)}t.unbindTexture()}else{let K=n.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(K=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(K,V.__webglTexture),Ue(K,_),_.mipmaps&&_.mipmaps.length>0)for(let se=0;se<_.mipmaps.length;se++)be(B.__webglFramebuffer[se],C,_,n.COLOR_ATTACHMENT0,K,se);else be(B.__webglFramebuffer,C,_,n.COLOR_ATTACHMENT0,K,0);p(_)&&T(K),t.unbindTexture()}C.depthBuffer&&Xe(C)}function $e(C){let _=C.textures;for(let B=0,V=_.length;B<V;B++){let Z=_[B];if(p(Z)){let ce=R(C),he=i.get(Z).__webglTexture;t.bindTexture(ce,he),T(ce),t.unbindTexture()}}}let mt=[],Rt=[];function At(C){if(C.samples>0){if(Ct(C)===!1){let _=C.textures,B=C.width,V=C.height,Z=n.COLOR_BUFFER_BIT,ce=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,he=i.get(C),K=_.length>1;if(K)for(let ue=0;ue<_.length;ue++)t.bindFramebuffer(n.FRAMEBUFFER,he.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ue,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,he.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ue,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,he.__webglMultisampledFramebuffer);let se=C.texture.mipmaps;se&&se.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,he.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,he.__webglFramebuffer);for(let ue=0;ue<_.length;ue++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(Z|=n.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(Z|=n.STENCIL_BUFFER_BIT)),K){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,he.__webglColorRenderbuffer[ue]);let Ce=i.get(_[ue]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Ce,0)}n.blitFramebuffer(0,0,B,V,0,0,B,V,Z,n.NEAREST),l===!0&&(mt.length=0,Rt.length=0,mt.push(n.COLOR_ATTACHMENT0+ue),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(mt.push(ce),Rt.push(ce),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Rt)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,mt))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),K)for(let ue=0;ue<_.length;ue++){t.bindFramebuffer(n.FRAMEBUFFER,he.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ue,n.RENDERBUFFER,he.__webglColorRenderbuffer[ue]);let Ce=i.get(_[ue]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,he.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ue,n.TEXTURE_2D,Ce,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,he.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let _=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[_])}}}function _t(C){return Math.min(s.maxSamples,C.samples)}function Ct(C){let _=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function F(C){let _=a.render.frame;h.get(C)!==_&&(h.set(C,_),C.update())}function rt(C,_){let B=C.colorSpace,V=C.format,Z=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||B!==yr&&B!==di&&(tt.getTransfer(B)===lt?(V!==En||Z!==fn)&&Oe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ke("WebGLTextures: Unsupported texture color space:",B)),_}function Ke(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=Q,this.resetTextureUnits=W,this.getTextureUnits=O,this.setTextureUnits=k,this.setTexture2D=re,this.setTexture2DArray=j,this.setTexture3D=ae,this.setTextureCube=ee,this.rebindTextures=it,this.setupRenderTarget=ct,this.updateRenderTargetMipmap=$e,this.updateMultisampleRenderTarget=At,this.setupDepthRenderbuffer=Xe,this.setupFrameBufferTexture=be,this.useMultisampledRTT=Ct,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function xx(n,e){function t(i,s=di){let r,a=tt.getTransfer(s);if(i===fn)return n.UNSIGNED_BYTE;if(i===bo)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Mo)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Cc)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Rc)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===wc)return n.BYTE;if(i===Ac)return n.SHORT;if(i===Xs)return n.UNSIGNED_SHORT;if(i===vo)return n.INT;if(i===Bn)return n.UNSIGNED_INT;if(i===kn)return n.FLOAT;if(i===zn)return n.HALF_FLOAT;if(i===Pc)return n.ALPHA;if(i===Ic)return n.RGB;if(i===En)return n.RGBA;if(i===Jn)return n.DEPTH_COMPONENT;if(i===Bi)return n.DEPTH_STENCIL;if(i===Lc)return n.RED;if(i===So)return n.RED_INTEGER;if(i===ki)return n.RG;if(i===Eo)return n.RG_INTEGER;if(i===To)return n.RGBA_INTEGER;if(i===Vr||i===Hr||i===Gr||i===Wr)if(a===lt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Vr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Hr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Gr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Wr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Vr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Hr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Gr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Wr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===wo||i===Ao||i===Co||i===Ro)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===wo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Ao)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Co)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Ro)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Po||i===Io||i===Lo||i===Do||i===No||i===Xr||i===Uo)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Po||i===Io)return a===lt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Lo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Do)return r.COMPRESSED_R11_EAC;if(i===No)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Xr)return r.COMPRESSED_RG11_EAC;if(i===Uo)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Fo||i===Oo||i===Bo||i===ko||i===zo||i===Vo||i===Ho||i===Go||i===Wo||i===Xo||i===Yo||i===qo||i===jo||i===$o)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Fo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Oo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Bo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===ko)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===zo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Vo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ho)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Go)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Wo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Xo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Yo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===qo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===jo)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===$o)return a===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Zo||i===Jo||i===Ko)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===Zo)return a===lt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Jo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Ko)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Qo||i===el||i===Yr||i===tl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===Qo)return r.COMPRESSED_RED_RGTC1_EXT;if(i===el)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Yr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===tl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Ys?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var yx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,vx=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Qc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new Ar(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new xn({vertexShader:yx,fragmentShader:vx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Mt(new ts(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},eh=class extends Un{constructor(e,t){super();let i=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,d=null,u=null,m=null,f=null,x=typeof XRWebGLBinding<"u",g=new Qc,p={},T=t.getContextAttributes(),R=null,b=null,E=[],S=[],P=new Fe,y=null,A=null,L=new Kt;L.viewport=new bt;let I=new Kt;I.viewport=new bt;let z=[L,I],W=new mo,O=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let oe=E[J];return oe===void 0&&(oe=new Fs,E[J]=oe),oe.getTargetRaySpace()},this.getControllerGrip=function(J){let oe=E[J];return oe===void 0&&(oe=new Fs,E[J]=oe),oe.getGripSpace()},this.getHand=function(J){let oe=E[J];return oe===void 0&&(oe=new Fs,E[J]=oe),oe.getHandSpace()};function Q(J){let oe=S.indexOf(J.inputSource);if(oe===-1)return;let Se=E[oe];Se!==void 0&&(Se.update(J.inputSource,J.frame,c||a),Se.dispatchEvent({type:J.type,data:J.inputSource}))}function $(){s.removeEventListener("select",Q),s.removeEventListener("selectstart",Q),s.removeEventListener("selectend",Q),s.removeEventListener("squeeze",Q),s.removeEventListener("squeezestart",Q),s.removeEventListener("squeezeend",Q),s.removeEventListener("end",$),s.removeEventListener("inputsourceschange",re);for(let J=0;J<E.length;J++){let oe=S[J];oe!==null&&(S[J]=null,E[J].disconnect(oe))}O=null,k=null,g.reset();for(let J in p)delete p[J];if(e.setRenderTarget(R),m=null,u=null,d=null,s=null,b=null,nt.stop(),i.isPresenting=!1,e.setPixelRatio(y),e.setSize(P.width,P.height,!1),A!==null){let J=A.camera;J.fov=A.fov,J.zoom=A.zoom,J.updateProjectionMatrix(),A=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,i.isPresenting===!0&&Oe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){o=J,i.isPresenting===!0&&Oe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return u!==null?u:m},this.getBinding=function(){return d===null&&x&&(d=new XRWebGLBinding(s,t)),d},this.getFrame=function(){return f},this.getSession=function(){return s},this.setSession=async function(J){if(s=J,s!==null){if(R=e.getRenderTarget(),s.addEventListener("select",Q),s.addEventListener("selectstart",Q),s.addEventListener("selectend",Q),s.addEventListener("squeeze",Q),s.addEventListener("squeezestart",Q),s.addEventListener("squeezeend",Q),s.addEventListener("end",$),s.addEventListener("inputsourceschange",re),T.xrCompatible!==!0&&await t.makeXRCompatible(),y=e.getPixelRatio(),e.getSize(P),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let Se=null,Be=null,be=null;T.depth&&(be=T.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Se=T.stencil?Bi:Jn,Be=T.stencil?Ys:Bn);let Ge={colorFormat:t.RGBA8,depthFormat:be,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(Ge),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),b=new dn(u.textureWidth,u.textureHeight,{format:En,type:fn,depthTexture:new Pi(u.textureWidth,u.textureHeight,Be,void 0,void 0,void 0,void 0,void 0,void 0,Se),stencilBuffer:T.stencil,colorSpace:e.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let Se={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,t,Se),s.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),b=new dn(m.framebufferWidth,m.framebufferHeight,{format:En,type:fn,colorSpace:e.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1,storeMultisampledDepthBuffer:m.ignoreDepthValues===!1,storeMultisampledStencilBuffer:m.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),nt.setContext(s),nt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function re(J){for(let oe=0;oe<J.removed.length;oe++){let Se=J.removed[oe],Be=S.indexOf(Se);Be>=0&&(S[Be]=null,E[Be].disconnect(Se))}for(let oe=0;oe<J.added.length;oe++){let Se=J.added[oe],Be=S.indexOf(Se);if(Be===-1){for(let Ge=0;Ge<E.length;Ge++)if(Ge>=S.length){S.push(Se),Be=Ge;break}else if(S[Ge]===null){S[Ge]=Se,Be=Ge;break}if(Be===-1)break}let be=E[Be];be&&be.connect(Se)}}let j=new D,ae=new D;function ee(J,oe,Se){j.setFromMatrixPosition(oe.matrixWorld),ae.setFromMatrixPosition(Se.matrixWorld);let Be=j.distanceTo(ae),be=oe.projectionMatrix.elements,Ge=Se.projectionMatrix.elements,wt=be[14]/(be[10]-1),Xe=be[14]/(be[10]+1),it=(be[9]+1)/be[5],ct=(be[9]-1)/be[5],$e=(be[8]-1)/be[0],mt=(Ge[8]+1)/Ge[0],Rt=wt*$e,At=wt*mt,_t=Be/(-$e+mt),Ct=_t*-$e;if(oe.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(Ct),J.translateZ(_t),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),be[10]===-1)J.projectionMatrix.copy(oe.projectionMatrix),J.projectionMatrixInverse.copy(oe.projectionMatrixInverse);else{let F=wt+_t,rt=Xe+_t,Ke=Rt-Ct,C=At+(Be-Ct),_=it*Xe/rt*F,B=ct*Xe/rt*F;J.projectionMatrix.makePerspective(Ke,C,_,B,F,rt),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function Le(J,oe){oe===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(oe.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(s===null)return;let oe=J.near,Se=J.far;g.texture!==null&&(g.depthNear>0&&(oe=g.depthNear),g.depthFar>0&&(Se=g.depthFar)),W.near=I.near=L.near=oe,W.far=I.far=L.far=Se,(O!==W.near||k!==W.far)&&(s.updateRenderState({depthNear:W.near,depthFar:W.far}),O=W.near,k=W.far),W.layers.mask=J.layers.mask|6,L.layers.mask=W.layers.mask&-5,I.layers.mask=W.layers.mask&-3;let Be=J.parent,be=W.cameras;Le(W,Be);for(let Ge=0;Ge<be.length;Ge++)Le(be[Ge],Be);be.length===2?ee(W,L,I):W.projectionMatrix.copy(L.projectionMatrix),A===null&&J.isPerspectiveCamera&&(A={camera:J,fov:J.fov,zoom:J.zoom}),Ie(J,W,Be)};function Ie(J,oe,Se){Se===null?J.matrix.copy(oe.matrixWorld):(J.matrix.copy(Se.matrixWorld),J.matrix.invert(),J.matrix.multiply(oe.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(oe.projectionMatrix),J.projectionMatrixInverse.copy(oe.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Ds*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return W},this.getFoveation=function(){if(!(u===null&&m===null))return l},this.setFoveation=function(J){l=J,u!==null&&(u.fixedFoveation=J),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=J)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(W)},this.getCameraTexture=function(J){return p[J]};let st=null;function Ue(J,oe){if(h=oe.getViewerPose(c||a),f=oe,h!==null){let Se=h.views;m!==null&&(e.setRenderTargetFramebuffer(b,m.framebuffer),e.setRenderTarget(b));let Be=!1;Se.length!==W.cameras.length&&(W.cameras.length=0,Be=!0);for(let Xe=0;Xe<Se.length;Xe++){let it=Se[Xe],ct=null;if(m!==null)ct=m.getViewport(it);else{let mt=d.getViewSubImage(u,it);ct=mt.viewport,Xe===0&&(e.setRenderTargetTextures(b,mt.colorTexture,mt.depthStencilTexture),e.setRenderTarget(b))}let $e=z[Xe];$e===void 0&&($e=new Kt,$e.layers.enable(Xe),$e.viewport=new bt,z[Xe]=$e),$e.matrix.fromArray(it.transform.matrix),$e.matrix.decompose($e.position,$e.quaternion,$e.scale),$e.projectionMatrix.fromArray(it.projectionMatrix),$e.projectionMatrixInverse.copy($e.projectionMatrix).invert(),$e.viewport.set(ct.x,ct.y,ct.width,ct.height),Xe===0&&(W.matrix.copy($e.matrix),W.matrix.decompose(W.position,W.quaternion,W.scale)),Be===!0&&W.cameras.push($e)}let be=s.enabledFeatures;if(be&&be.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){d=i.getBinding();let Xe=d.getDepthInformation(Se[0]);Xe&&Xe.isValid&&Xe.texture&&g.init(Xe,s.renderState)}if(be&&be.includes("camera-access")&&x){e.state.unbindTexture(),d=i.getBinding();for(let Xe=0;Xe<Se.length;Xe++){let it=Se[Xe].camera;if(it){let ct=p[it];ct||(ct=new Ar,p[it]=ct);let $e=d.getCameraImage(it);ct.sourceTexture=$e}}}}for(let Se=0;Se<E.length;Se++){let Be=S[Se],be=E[Se];Be!==null&&be!==void 0&&be.update(Be,oe,c||a)}st&&st(J,oe),oe.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:oe}),f=null}let nt=new Md;nt.setAnimationLoop(Ue),this.setAnimationLoop=function(J){st=J},this.dispose=function(){}}},bx=new pt,Cd=new He;Cd.set(-1,0,0,0,1,0,0,0,1);function Mx(n,e){function t(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function i(g,p){p.color.getRGB(g.fogColor.value,Fc(n)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function s(g,p,T,R,b){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(g,p):p.isMeshLambertMaterial?(r(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(g,p),d(g,p)):p.isMeshPhongMaterial?(r(g,p),h(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(g,p),u(g,p),p.isMeshPhysicalMaterial&&m(g,p,b)):p.isMeshMatcapMaterial?(r(g,p),f(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),x(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(a(g,p),p.isLineDashedMaterial&&o(g,p)):p.isPointsMaterial?l(g,p,T,R):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,t(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===cn&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,t(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===cn&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,t(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,t(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);let T=e.get(p),R=T.envMap,b=T.envMapRotation;R&&(g.envMap.value=R,g.envMapRotation.value.setFromMatrix4(bx.makeRotationFromEuler(b)).transpose(),R.isCubeTexture&&R.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(Cd),g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,g.aoMapTransform))}function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform))}function o(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,T,R){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*T,g.scale.value=R*.5,p.map&&(g.map.value=p.map,t(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function h(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function d(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function u(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function m(g,p,T){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===cn&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.retroreflectivity>0&&(g.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=T.texture,g.transmissionSamplerSize.value.set(T.width,T.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,g.specularIntensityMapTransform))}function f(g,p){p.matcap&&(g.matcap.value=p.matcap)}function x(g,p){let T=e.get(p).light;g.referencePosition.value.setFromMatrixPosition(T.matrixWorld),g.nearDistance.value=T.shadow.camera.near,g.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Sx(n,e,t,i){let s={},r={},a=[],o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,E){let S=E.program;i.uniformBlockBinding(b,S)}function c(b,E){let S=s[b.id];S===void 0&&(g(b),S=h(b),s[b.id]=S,b.addEventListener("dispose",T));let P=E.program;i.updateUBOMapping(b,P);let y=e.render.frame;r[b.id]!==y&&(u(b),r[b.id]=y)}function h(b){let E=d();b.__bindingPointIndex=E;let S=n.createBuffer(),P=b.__size,y=b.usage;return n.bindBuffer(n.UNIFORM_BUFFER,S),n.bufferData(n.UNIFORM_BUFFER,P,y),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,E,S),S}function d(){for(let b=0;b<o;b++)if(a.indexOf(b)===-1)return a.push(b),b;return ke("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(b){let E=s[b.id],S=b.uniforms,P=b.__cache;n.bindBuffer(n.UNIFORM_BUFFER,E);for(let y=0,A=S.length;y<A;y++){let L=S[y];if(Array.isArray(L))for(let I=0,z=L.length;I<z;I++)m(L[I],y,I,P);else m(L,y,0,P)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function m(b,E,S,P){if(x(b,E,S,P)===!0){let y=b.__offset,A=b.value;if(Array.isArray(A)){let L=0;for(let I=0;I<A.length;I++){let z=A[I],W=p(z);f(z,b.__data,L),typeof z!="number"&&typeof z!="boolean"&&!z.isMatrix3&&!ArrayBuffer.isView(z)&&(L+=W.storage/Float32Array.BYTES_PER_ELEMENT)}}else f(A,b.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,y,b.__data)}}function f(b,E,S){typeof b=="number"||typeof b=="boolean"?E[0]=b:b.isMatrix3?(E[0]=b.elements[0],E[1]=b.elements[1],E[2]=b.elements[2],E[3]=0,E[4]=b.elements[3],E[5]=b.elements[4],E[6]=b.elements[5],E[7]=0,E[8]=b.elements[6],E[9]=b.elements[7],E[10]=b.elements[8],E[11]=0):ArrayBuffer.isView(b)?E.set(new b.constructor(b.buffer,b.byteOffset,E.length)):b.toArray(E,S)}function x(b,E,S,P){let y=b.value,A=E+"_"+S;if(P[A]===void 0)return typeof y=="number"||typeof y=="boolean"?P[A]=y:ArrayBuffer.isView(y)?P[A]=y.slice():P[A]=y.clone(),!0;{let L=P[A];if(typeof y=="number"||typeof y=="boolean"){if(L!==y)return P[A]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(L.equals(y)===!1)return L.copy(y),!0}}return!1}function g(b){let E=b.uniforms,S=0,P=16;for(let A=0,L=E.length;A<L;A++){let I=Array.isArray(E[A])?E[A]:[E[A]];for(let z=0,W=I.length;z<W;z++){let O=I[z],k=Array.isArray(O.value)?O.value:[O.value];for(let Q=0,$=k.length;Q<$;Q++){let re=k[Q],j=p(re),ae=S%P,ee=ae%j.boundary,Le=ae+ee;S+=ee,Le!==0&&P-Le<j.storage&&(S+=P-Le),O.__data=new Float32Array(j.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=S,S+=j.storage}}}let y=S%P;return y>0&&(S+=P-y),b.__size=S,b.__cache={},this}function p(b){let E={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(E.boundary=4,E.storage=4):b.isVector2?(E.boundary=8,E.storage=8):b.isVector3||b.isColor?(E.boundary=16,E.storage=12):b.isVector4?(E.boundary=16,E.storage=16):b.isMatrix3?(E.boundary=48,E.storage=48):b.isMatrix4?(E.boundary=64,E.storage=64):b.isTexture?Oe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(b)?(E.boundary=16,E.storage=b.byteLength):Oe("WebGLRenderer: Unsupported uniform value type.",b),E}function T(b){let E=b.target;E.removeEventListener("dispose",T);let S=a.indexOf(E.__bindingPointIndex);a.splice(S,1),n.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function R(){for(let b in s)n.deleteBuffer(s[b]);a=[],s={},r={}}return{bind:l,update:c,dispose:R}}var Ex=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ei=null;function Tx(){return ei===null&&(ei=new $a(Ex,16,16,ki,zn),ei.name="DFG_LUT",ei.minFilter=qt,ei.magFilter=qt,ei.wrapS=Zn,ei.wrapT=Zn,ei.generateMipmaps=!1,ei.needsUpdate=!0),ei}var cl=class{constructor(e={}){let{canvas:t=qu(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:m=fn}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=a;let x=m,g=new Set([To,Eo,So]),p=new Set([fn,Bn,Xs,Ys,bo,Mo]),T=new Uint32Array(4),R=new Int32Array(4),b=new D,E=null,S=null,P=[],y=[],A=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=On,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let L=this,I=!1,z=null,W=null,O=null,k=null;this._outputColorSpace=on;let Q=0,$=0,re=null,j=-1,ae=null,ee=new bt,Le=new bt,Ie=null,st=new qe(0),Ue=0,nt=t.width,J=t.height,oe=1,Se=null,Be=null,be=new bt(0,0,nt,J),Ge=new bt(0,0,nt,J),wt=!1,Xe=new Os,it=!1,ct=!1,$e=new pt,mt=new D,Rt=new bt,At={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},_t=!1;function Ct(){return re===null?oe:1}let F=i;function rt(v,U){return t.getContext(v,U)}let Ke,C,_,B,V,Z,ce,he,K,se,ue,Ce,me,de,Re,Ne,Ve,N,fe,te,pe,xe,le;try{let v={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",Y,!1),t.addEventListener("webglcontextrestored",X,!1),t.addEventListener("webglcontextcreationerror",ie,!1),F===null){let U="webgl2";if(F=rt(U,v),F===null)throw rt(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}M()}catch(v){throw t.removeEventListener("webglcontextlost",Y,!1),t.removeEventListener("webglcontextrestored",X,!1),t.removeEventListener("webglcontextcreationerror",ie,!1),ke("WebGLRenderer: "+v.message),v}function M(){Ke=new L0(F),Ke.init(),pe=new xx(F,Ke),C=new M0(F,Ke,e,pe),_=new gx(F,Ke),C.reversedDepthBuffer&&u&&_.buffers.depth.setReversed(!0),W=F.createFramebuffer(),O=F.createFramebuffer(),k=F.createFramebuffer(),B=new U0(F),V=new nx,Z=new _x(F,Ke,_,V,C,pe,B),ce=new I0(L),he=new Op(F),xe=new v0(F,he),K=new D0(F,he,B,xe),se=new O0(F,K,he,xe,B),N=new F0(F,C,Z),Re=new S0(V),ue=new tx(L,ce,Ke,C,xe,Re),Ce=new Mx(L,V),me=new sx,de=new hx(Ke),Ve=new y0(L,ce,_,se,f,l),Ne=new mx(L,se,C),le=new Sx(F,B,C,_),fe=new b0(F,Ke,B),te=new N0(F,Ke,B),B.programs=ue.programs,L.capabilities=C,L.extensions=Ke,L.properties=V,L.renderLists=me,L.shadowMap=Ne,L.state=_,L.info=B}x!==fn&&(A=new k0(x,t.width,t.height,o,s,r));let w=new eh(L,F);this.xr=w,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let v=Ke.get("WEBGL_lose_context");v&&v.loseContext()},this.forceContextRestore=function(){let v=Ke.get("WEBGL_lose_context");v&&v.restoreContext()},this.getPixelRatio=function(){return oe},this.setPixelRatio=function(v){v!==void 0&&(oe=v,this.setSize(nt,J,!1))},this.getSize=function(v){return v.set(nt,J)},this.setSize=function(v,U,q=!0){if(w.isPresenting){Oe("WebGLRenderer: Can't change size while VR device is presenting.");return}nt=v,J=U,t.width=Math.floor(v*oe),t.height=Math.floor(U*oe),q===!0&&(t.style.width=v+"px",t.style.height=U+"px"),A!==null&&A.setSize(t.width,t.height),this.setViewport(0,0,v,U)},this.getDrawingBufferSize=function(v){return v.set(nt*oe,J*oe).floor()},this.setDrawingBufferSize=function(v,U,q){nt=v,J=U,oe=q,t.width=Math.floor(v*q),t.height=Math.floor(U*q),this.setViewport(0,0,v,U)},this.setEffects=function(v){if(x===fn){ke("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(v){for(let U=0;U<v.length;U++)if(v[U].isOutputPass===!0){Oe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}A.setEffects(v||[])},this.getCurrentViewport=function(v){return v.copy(ee)},this.getViewport=function(v){return v.copy(be)},this.setViewport=function(v,U,q,H){v.isVector4?be.set(v.x,v.y,v.z,v.w):be.set(v,U,q,H),_.viewport(ee.copy(be).multiplyScalar(oe).round())},this.getScissor=function(v){return v.copy(Ge)},this.setScissor=function(v,U,q,H){v.isVector4?Ge.set(v.x,v.y,v.z,v.w):Ge.set(v,U,q,H),_.scissor(Le.copy(Ge).multiplyScalar(oe).round())},this.getScissorTest=function(){return wt},this.setScissorTest=function(v){_.setScissorTest(wt=v)},this.setOpaqueSort=function(v){Se=v},this.setTransparentSort=function(v){Be=v},this.getClearColor=function(v){return v.copy(Ve.getClearColor())},this.setClearColor=function(){Ve.setClearColor(...arguments)},this.getClearAlpha=function(){return Ve.getClearAlpha()},this.setClearAlpha=function(){Ve.setClearAlpha(...arguments)},this.clear=function(v=!0,U=!0,q=!0){let H=0;if(v){let G=!1;if(re!==null){let ve=re.texture.format;G=g.has(ve)}if(G){let ve=re.texture.type,Te=p.has(ve),ye=Ve.getClearColor(),we=Ve.getClearAlpha(),Pe=ye.r,Ye=ye.g,Qe=ye.b;Te?(T[0]=Pe,T[1]=Ye,T[2]=Qe,T[3]=we,F.clearBufferuiv(F.COLOR,0,T)):(R[0]=Pe,R[1]=Ye,R[2]=Qe,R[3]=we,F.clearBufferiv(F.COLOR,0,R))}else H|=F.COLOR_BUFFER_BIT}U&&(H|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),q&&(H|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),H!==0&&F.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(v){v.setRenderer(this),z=v},this.dispose=function(){t.removeEventListener("webglcontextlost",Y,!1),t.removeEventListener("webglcontextrestored",X,!1),t.removeEventListener("webglcontextcreationerror",ie,!1),Ve.dispose(),me.dispose(),de.dispose(),V.dispose(),ce.dispose(),se.dispose(),xe.dispose(),le.dispose(),ue.dispose(),w.dispose(),w.removeEventListener("sessionstart",Rn),w.removeEventListener("sessionend",qi),sn.stop()};function Y(v){v.preventDefault(),Nc("WebGLRenderer: Context Lost."),I=!0}function X(){Nc("WebGLRenderer: Context Restored."),I=!1;let v=B.autoReset,U=Ne.enabled,q=Ne.autoUpdate,H=Ne.needsUpdate,G=Ne.type;M(),B.autoReset=v,Ne.enabled=U,Ne.autoUpdate=q,Ne.needsUpdate=H,Ne.type=G}function ie(v){ke("WebGLRenderer: A WebGL context could not be created. Reason: ",v.statusMessage)}function ge(v){let U=v.target;U.removeEventListener("dispose",ge),ze(U)}function ze(v){De(v),V.remove(v)}function De(v){let U=V.get(v).programs;U!==void 0&&(U.forEach(function(q){ue.releaseProgram(q)}),v.isShaderMaterial&&ue.releaseShaderCache(v))}this.renderBufferDirect=function(v,U,q,H,G,ve){U===null&&(U=At);let Te=G.isMesh&&G.matrixWorld.determinantAffine()<0,ye=Of(v,U,q,H,G);_.setMaterial(H,Te);let we=q.index,Pe=1;if(H.wireframe===!0){if(we=K.getWireframeAttribute(q),we===void 0)return;Pe=2}let Ye=q.drawRange,Qe=q.attributes.position,Ae=Ye.start*Pe,ot=(Ye.start+Ye.count)*Pe;ve!==null&&(Ae=Math.max(Ae,ve.start*Pe),ot=Math.min(ot,(ve.start+ve.count)*Pe)),we!==null?(Ae=Math.max(Ae,0),ot=Math.min(ot,we.count)):Qe!=null&&(Ae=Math.max(Ae,0),ot=Math.min(ot,Qe.count));let Nt=ot-Ae;if(Nt<0||Nt===1/0)return;xe.setup(G,H,ye,q,we);let xt,ft=fe;if(we!==null&&(xt=he.get(we),ft=te,ft.setIndex(xt)),G.isMesh)H.wireframe===!0?(_.setLineWidth(H.wireframeLinewidth*Ct()),ft.setMode(F.LINES)):ft.setMode(F.TRIANGLES);else if(G.isLine){let $t=H.linewidth;$t===void 0&&($t=1),_.setLineWidth($t*Ct()),G.isLineSegments?ft.setMode(F.LINES):G.isLineLoop?ft.setMode(F.LINE_LOOP):ft.setMode(F.LINE_STRIP)}else G.isPoints?ft.setMode(F.POINTS):G.isSprite&&ft.setMode(F.TRIANGLES);if(G.isBatchedMesh)if(Ke.get("WEBGL_multi_draw"))ft.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{let $t=G._multiDrawStarts,Ee=G._multiDrawCounts,rn=G._multiDrawCount,at=we?he.get(we).bytesPerElement:1,bn=V.get(H).currentProgram.getUniforms();for(let jn=0;jn<rn;jn++)bn.setValue(F,"_gl_DrawID",jn),ft.render($t[jn]/at,Ee[jn])}else if(G.isInstancedMesh)ft.renderInstances(Ae,Nt,G.count);else if(q.isInstancedBufferGeometry){let $t=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,Ee=Math.min(q.instanceCount,$t);ft.renderInstances(Ae,Nt,Ee)}else ft.render(Ae,Nt)};function Pt(v,U,q,H){z!==null&&v.isNodeMaterial&&z.setObject(H,v),it===!0&&Re.setState(v,q,!1),v.transparent===!0&&v.side===Ot&&v.forceSinglePass===!1?(v.side=cn,v.needsUpdate=!0,ca(v,U,H),v.side=Ui,v.needsUpdate=!0,ca(v,U,H),v.side=Ot):ca(v,U,H)}this.compile=function(v,U,q=null){q===null&&(q=v),z!==null&&z.renderStart(v,U,q),S=de.get(q),S.init(U),y.push(S),q.traverseVisible(function(G){G.isLight&&G.layers.test(U.layers)&&(S.pushLight(G),G.castShadow&&S.pushShadow(G))}),v!==q&&v.traverseVisible(function(G){G.isLight&&G.layers.test(U.layers)&&(S.pushLight(G),G.castShadow&&S.pushShadow(G))}),S.setupLights(),z!==null&&z.updateLights(S.state.lightsArray),ct=this.localClippingEnabled,it=Re.init(this.clippingPlanes,ct),it===!0&&Re.setGlobalState(this.clippingPlanes,U),z!==null&&Ne.render(S.state.shadowsArray,q,U);let H=new Set;return v.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;let ve=G.material;if(ve)if(Array.isArray(ve))for(let Te=0;Te<ve.length;Te++){let ye=ve[Te];Pt(ye,q,U,G),H.add(ye)}else Pt(ve,q,U,G),H.add(ve)}),S=y.pop(),z!==null&&z.renderEnd(),H},this.compileAsync=function(v,U,q=null){let H=this.compile(v,U,q);return new Promise(G=>{function ve(){if(H.forEach(function(Te){let we=V.get(Te).currentProgram;(we===void 0||we.isReady())&&H.delete(Te)}),H.size===0){G(v);return}setTimeout(ve,10)}Ke.get("KHR_parallel_shader_compile")!==null?ve():setTimeout(ve,10)})};let ht=null;function nn(v){ht&&ht(v)}function Rn(){sn.stop()}function qi(){sn.start()}let sn=new Md;sn.setAnimationLoop(nn),typeof self<"u"&&sn.setContext(self),this.setAnimationLoop=function(v){ht=v,w.setAnimationLoop(v),v===null?sn.stop():sn.start()},w.addEventListener("sessionstart",Rn),w.addEventListener("sessionend",qi),this.render=function(v,U){if(U!==void 0&&U.isCamera!==!0){ke("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;z!==null&&z.renderStart(v,U);let q=w.enabled===!0&&w.isPresenting===!0,H=A!==null&&(re===null||q)&&A.begin(L,re);if(v.matrixWorldAutoUpdate===!0&&v.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),w.enabled===!0&&w.isPresenting===!0&&(A===null||A.isCompositing()===!1)&&(w.cameraAutoUpdate===!0&&w.updateCamera(U),U=w.getCamera()),v.isScene===!0&&v.onBeforeRender(L,v,U,re),S=de.get(v,y.length),S.init(U),S.state.textureUnits=Z.getTextureUnits(),y.push(S),$e.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),Xe.setFromProjectionMatrix($e,Dn,U.reversedDepth),ct=this.localClippingEnabled,it=Re.init(this.clippingPlanes,ct),E=me.get(v,P.length),E.init(),P.push(E),w.enabled===!0&&w.isPresenting===!0){let Te=L.xr.getDepthSensingMesh();Te!==null&&hr(Te,U,-1/0,L.sortObjects)}hr(v,U,0,L.sortObjects),E.finish(),z!==null&&z.updateLights(S.state.lightsArray),L.sortObjects===!0&&E.sort(Se,Be),_t=w.enabled===!1||w.isPresenting===!1||w.hasDepthSensing()===!1,_t&&Ve.addToRenderList(E,v),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),it===!0&&Re.beginShadows();let G=S.state.shadowsArray;if(Ne.render(G,v,U),it===!0&&Re.endShadows(),(H&&A.hasRenderPass())===!1){let Te=E.opaque,ye=E.transmissive;if(S.setupLights(),U.isArrayCamera){let we=U.cameras;if(ye.length>0)for(let Pe=0,Ye=we.length;Pe<Ye;Pe++){let Qe=we[Pe];Lh(Te,ye,v,Qe)}_t&&Ve.render(v);for(let Pe=0,Ye=we.length;Pe<Ye;Pe++){let Qe=we[Pe];ur(E,v,Qe,Qe.viewport)}}else ye.length>0&&Lh(Te,ye,v,U),_t&&Ve.render(v),ur(E,v,U)}re!==null&&$===0&&(Z.updateMultisampleRenderTarget(re),Z.updateRenderTargetMipmap(re)),H&&A.end(L),v.isScene===!0&&v.onAfterRender(L,v,U),xe.resetDefaultState(),j=-1,ae=null,y.pop(),y.length>0?(S=y[y.length-1],Z.setTextureUnits(S.state.textureUnits),it===!0&&Re.setGlobalState(L.clippingPlanes,S.state.camera)):S=null,P.pop(),P.length>0?E=P[P.length-1]:E=null,z!==null&&z.renderEnd()};function hr(v,U,q,H){if(v.visible===!1)return;if(v.layers.test(U.layers)){if(v.isGroup)q=v.renderOrder;else if(v.isLOD)v.autoUpdate===!0&&v.update(U);else if(v.isLightProbeGrid)S.pushLightProbeGrid(v);else if(v.isLight)S.pushLight(v),v.castShadow&&S.pushShadow(v);else if(v.isSprite){if(!v.frustumCulled||v.intersectsFrustum(Xe)){H&&Rt.setFromMatrixPosition(v.matrixWorld).applyMatrix4($e);let Te=se.update(v),ye=v.material;ye.visible&&E.push(v,Te,ye,q,Rt.z,null,U)}}else if((v.isMesh||v.isLine||v.isPoints)&&(!v.frustumCulled||v.intersectsFrustum(Xe))){let Te=se.update(v),ye=v.material;if(H&&(v.boundingSphere!==void 0?(v.boundingSphere===null&&v.computeBoundingSphere(),Rt.copy(v.boundingSphere.center)):(Te.boundingSphere===null&&Te.computeBoundingSphere(),Rt.copy(Te.boundingSphere.center)),Rt.applyMatrix4(v.matrixWorld).applyMatrix4($e)),Array.isArray(ye)){let we=Te.groups;for(let Pe=0,Ye=we.length;Pe<Ye;Pe++){let Qe=we[Pe],Ae=ye[Qe.materialIndex];Ae&&Ae.visible&&E.push(v,Te,Ae,q,Rt.z,Qe,U)}}else ye.visible&&E.push(v,Te,ye,q,Rt.z,null,U)}}let ve=v.children;for(let Te=0,ye=ve.length;Te<ye;Te++)hr(ve[Te],U,q,H)}function ur(v,U,q,H){let{opaque:G,transmissive:ve,transparent:Te}=v;S.setupLightsView(q),it===!0&&Re.setGlobalState(L.clippingPlanes,q),H&&_.viewport(ee.copy(H)),G.length>0&&la(G,U,q),ve.length>0&&la(ve,U,q),Te.length>0&&la(Te,U,q),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function Lh(v,U,q,H){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[H.id]===void 0){let Ae=Ke.has("EXT_color_buffer_half_float")||Ke.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[H.id]=new dn(1,1,{generateMipmaps:!0,type:Ae?zn:fn,minFilter:Oi,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:tt.workingColorSpace})}let ve=S.state.transmissionRenderTarget[H.id],Te=H.viewport||ee;ve.setSize(Te.z*L.transmissionResolutionScale,Te.w*L.transmissionResolutionScale);let ye=L.getRenderTarget(),we=L.getActiveCubeFace(),Pe=L.getActiveMipmapLevel();L.setRenderTarget(ve),L.getClearColor(st),Ue=L.getClearAlpha(),Ue<1&&L.setClearColor(16777215,.5),L.clear(),_t&&Ve.render(q);let Ye=L.toneMapping;L.toneMapping=On;let Qe=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),S.setupLightsView(H),it===!0&&Re.setGlobalState(L.clippingPlanes,H),la(v,q,H),Z.updateMultisampleRenderTarget(ve),Z.updateRenderTargetMipmap(ve),Ke.has("WEBGL_multisampled_render_to_texture")===!1){let Ae=!1;for(let ot=0,Nt=U.length;ot<Nt;ot++){let xt=U[ot],{object:ft,geometry:$t,material:Ee,group:rn}=xt;if(Ee.side===Ot&&ft.layers.test(H.layers)){let at=Ee.side;Ee.side=cn,Ee.needsUpdate=!0,Dh(ft,q,H,$t,Ee,rn),Ee.side=at,Ee.needsUpdate=!0,Ae=!0}}Ae===!0&&(Z.updateMultisampleRenderTarget(ve),Z.updateRenderTargetMipmap(ve))}L.setRenderTarget(ye,we,Pe),L.setClearColor(st,Ue),Qe!==void 0&&(H.viewport=Qe),L.toneMapping=Ye}function la(v,U,q){let H=U.isScene===!0?U.overrideMaterial:null;for(let G=0,ve=v.length;G<ve;G++){let Te=v[G],{object:ye,geometry:we,group:Pe}=Te,Ye=Te.material;Ye.allowOverride===!0&&H!==null&&(Ye=H),ye.layers.test(q.layers)&&Dh(ye,U,q,we,Ye,Pe)}}function Dh(v,U,q,H,G,ve){z!==null&&G.isNodeMaterial&&z.setObject(v,G),v.onBeforeRender(L,U,q,H,G,ve),v.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,v.matrixWorld),v.normalMatrix.getNormalMatrix(v.modelViewMatrix),G.onBeforeRender(L,U,q,H,v,ve),G.transparent===!0&&G.side===Ot&&G.forceSinglePass===!1?(G.side=cn,G.needsUpdate=!0,L.renderBufferDirect(q,U,H,G,v,ve),G.side=Ui,G.needsUpdate=!0,L.renderBufferDirect(q,U,H,G,v,ve),G.side=Ot):L.renderBufferDirect(q,U,H,G,v,ve),v.onAfterRender(L,U,q,H,G,ve)}function ca(v,U,q){U.isScene!==!0&&(U=At);let H=V.get(v),G=S.state.lights,ve=S.state.shadowsArray,Te=G.state.version,ye=ue.getParameters(v,G.state,ve,U,q,S.state.lightProbeGridArray),we=ue.getProgramCacheKey(ye),Pe=H.programs;H.environment=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?U.environment:null,H.fog=U.fog;let Ye=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap;H.envMap=ce.get(v.envMap||H.environment,Ye),H.envMapRotation=H.environment!==null&&v.envMap===null?U.environmentRotation:v.envMapRotation,Pe===void 0&&(v.addEventListener("dispose",ge),Pe=new Map,H.programs=Pe);let Qe=Pe.get(we);if(Qe!==void 0){if(H.currentProgram===Qe&&H.lightsStateVersion===Te)return Uh(v,ye),Qe}else ye.uniforms=ue.getUniforms(v),z!==null&&v.isNodeMaterial&&z.build(v,q,ye),v.onBeforeCompile(ye,L),Qe=ue.acquireProgram(ye,we),Pe.set(we,Qe),H.uniforms=ye.uniforms;let Ae=H.uniforms;return(!v.isShaderMaterial&&!v.isRawShaderMaterial||v.clipping===!0)&&(Ae.clippingPlanes=Re.uniform),Uh(v,ye),H.needsLights=kf(v),H.lightsStateVersion=Te,H.needsLights&&(Ae.ambientLightColor.value=G.state.ambient,Ae.lightProbe.value=G.state.probe,Ae.sunLights.value=G.state.sun,Ae.sunLightShadows.value=G.state.sunShadow,Ae.directionalLights.value=G.state.directional,Ae.directionalLightShadows.value=G.state.directionalShadow,Ae.spotLights.value=G.state.spot,Ae.spotLightShadows.value=G.state.spotShadow,Ae.rectAreaLights.value=G.state.rectArea,Ae.ltc_1.value=G.state.rectAreaLTC1,Ae.ltc_2.value=G.state.rectAreaLTC2,Ae.pointLights.value=G.state.point,Ae.pointLightShadows.value=G.state.pointShadow,Ae.hemisphereLights.value=G.state.hemi,Ae.sunShadowMatrix.value=G.state.sunShadowMatrix,Ae.sunShadowCascade.value=G.state.sunShadowCascade,Ae.directionalShadowMatrix.value=G.state.directionalShadowMatrix,Ae.spotLightMatrix.value=G.state.spotLightMatrix,Ae.spotLightMap.value=G.state.spotLightMap,Ae.pointShadowMatrix.value=G.state.pointShadowMatrix),H.lightProbeGrid=S.state.lightProbeGridArray.length>0,H.currentProgram=Qe,H.uniformsList=null,Qe}function Nh(v){if(v.uniformsList===null){let U=v.currentProgram.getUniforms();v.uniformsList=Zs.seqWithValue(U.seq,v.uniforms)}return v.uniformsList}function Uh(v,U){let q=V.get(v);q.outputColorSpace=U.outputColorSpace,q.batching=U.batching,q.batchingColor=U.batchingColor,q.instancing=U.instancing,q.instancingColor=U.instancingColor,q.instancingMorph=U.instancingMorph,q.skinning=U.skinning,q.morphTargets=U.morphTargets,q.morphNormals=U.morphNormals,q.morphColors=U.morphColors,q.morphTargetsCount=U.morphTargetsCount,q.numClippingPlanes=U.numClippingPlanes,q.numIntersection=U.numClipIntersection,q.vertexAlphas=U.vertexAlphas,q.vertexTangents=U.vertexTangents,q.toneMapping=U.toneMapping}function Ff(v,U){if(v.length===0)return null;if(v.length===1)return v[0].texture!==null?v[0]:null;b.setFromMatrixPosition(U.matrixWorld);for(let q=0,H=v.length;q<H;q++){let G=v[q];if(G.texture!==null&&G.boundingBox.containsPoint(b))return G}return null}function Of(v,U,q,H,G){U.isScene!==!0&&(U=At),Z.resetTextureUnits();let ve=U.fog,Te=H.isMeshStandardMaterial||H.isMeshLambertMaterial||H.isMeshPhongMaterial?U.environment:null,ye=re===null?L.outputColorSpace:re.isXRRenderTarget===!0?re.texture.colorSpace:tt.workingColorSpace,we=H.isMeshStandardMaterial||H.isMeshLambertMaterial&&!H.envMap||H.isMeshPhongMaterial&&!H.envMap,Pe=ce.get(H.envMap||Te,we),Ye=H.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,Qe=!!q.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Ae=!!q.morphAttributes.position,ot=!!q.morphAttributes.normal,Nt=!!q.morphAttributes.color,xt=On;H.toneMapped&&(re===null||re.isXRRenderTarget===!0)&&(xt=L.toneMapping);let ft=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,$t=ft!==void 0?ft.length:0,Ee=V.get(H),rn=S.state.lights;if(it===!0&&(ct===!0||v!==ae)){let gt=v===ae&&H.id===j;Re.setState(H,v,gt)}let at=!1;H.version===Ee.__version?(Ee.needsLights&&Ee.lightsStateVersion!==rn.state.version||Ee.outputColorSpace!==ye||G.isBatchedMesh&&Ee.batching===!1||!G.isBatchedMesh&&Ee.batching===!0||G.isBatchedMesh&&Ee.batchingColor===!0&&G._colorsTexture===null||G.isBatchedMesh&&Ee.batchingColor===!1&&G._colorsTexture!==null||G.isInstancedMesh&&Ee.instancing===!1||!G.isInstancedMesh&&Ee.instancing===!0||G.isSkinnedMesh&&Ee.skinning===!1||!G.isSkinnedMesh&&Ee.skinning===!0||G.isInstancedMesh&&Ee.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&Ee.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&Ee.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&Ee.instancingMorph===!1&&G.morphTexture!==null||Ee.envMap!==Pe||H.fog===!0&&Ee.fog!==ve||Ee.numClippingPlanes!==void 0&&(Ee.numClippingPlanes!==Re.numPlanes||Ee.numIntersection!==Re.numIntersection)||Ee.vertexAlphas!==Ye||Ee.vertexTangents!==Qe||Ee.morphTargets!==Ae||Ee.morphNormals!==ot||Ee.morphColors!==Nt||Ee.toneMapping!==xt||Ee.morphTargetsCount!==$t||!!Ee.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(at=!0):(at=!0,Ee.__version=H.version);let bn=Ee.currentProgram;at===!0&&(bn=ca(H,U,G),z&&H.isNodeMaterial&&z.onUpdateProgram(H,bn,Ee));let jn=!1,vi=!1,ds=!1,dt=bn.getUniforms(),It=Ee.uniforms;if(_.useProgram(bn.program)&&(jn=!0,vi=!0,ds=!0),H.id!==j&&(j=H.id,vi=!0),Ee.needsLights){let gt=Ff(S.state.lightProbeGridArray,G);Ee.lightProbeGrid!==gt&&(Ee.lightProbeGrid=gt,vi=!0)}if(jn||ae!==v){_.buffers.depth.getReversed()&&v.reversedDepth!==!0&&(v._reversedDepth=!0,v.updateProjectionMatrix()),dt.setValue(F,"projectionMatrix",v.projectionMatrix),dt.setValue(F,"viewMatrix",v.matrixWorldInverse);let Mi=dt.map.cameraPosition;Mi!==void 0&&Mi.setValue(F,mt.setFromMatrixPosition(v.matrixWorld)),C.logarithmicDepthBuffer&&dt.setValue(F,"logDepthBufFC",2/(Math.log(v.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&dt.setValue(F,"isOrthographic",v.isOrthographicCamera===!0),ae!==v&&(ae=v,vi=!0,ds=!0)}if(Ee.needsLights&&(rn.state.sunShadowMap.length>0&&dt.setValue(F,"sunShadowMap",rn.state.sunShadowMap,Z),rn.state.directionalShadowMap.length>0&&dt.setValue(F,"directionalShadowMap",rn.state.directionalShadowMap,Z),rn.state.spotShadowMap.length>0&&dt.setValue(F,"spotShadowMap",rn.state.spotShadowMap,Z),rn.state.pointShadowMap.length>0&&dt.setValue(F,"pointShadowMap",rn.state.pointShadowMap,Z)),G.isSkinnedMesh){dt.setOptional(F,G,"bindMatrix"),dt.setOptional(F,G,"bindMatrixInverse");let gt=G.skeleton;gt&&(gt.boneTexture===null&&gt.computeBoneTexture(),dt.setValue(F,"boneTexture",gt.boneTexture,Z))}G.isBatchedMesh&&(dt.setOptional(F,G,"batchingTexture"),dt.setValue(F,"batchingTexture",G._matricesTexture,Z),dt.setOptional(F,G,"batchingIdTexture"),dt.setValue(F,"batchingIdTexture",G._indirectTexture,Z),dt.setOptional(F,G,"batchingColorTexture"),G._colorsTexture!==null&&dt.setValue(F,"batchingColorTexture",G._colorsTexture,Z));let bi=q.morphAttributes;if((bi.position!==void 0||bi.normal!==void 0||bi.color!==void 0)&&N.update(G,q,bn),(vi||Ee.receiveShadow!==G.receiveShadow)&&(Ee.receiveShadow=G.receiveShadow,dt.setValue(F,"receiveShadow",G.receiveShadow)),(H.isMeshStandardMaterial||H.isMeshLambertMaterial||H.isMeshPhongMaterial)&&H.envMap===null&&U.environment!==null&&(It.envMapIntensity.value=U.environmentIntensity),It.dfgLUT!==void 0&&(It.dfgLUT.value=Tx()),vi){if(dt.setValue(F,"toneMappingExposure",L.toneMappingExposure),Ee.needsLights&&Bf(It,ds),ve&&H.fog===!0&&Ce.refreshFogUniforms(It,ve),Ce.refreshMaterialUniforms(It,H,oe,J,S.state.transmissionRenderTarget[v.id]),Ee.needsLights&&Ee.lightProbeGrid){let gt=Ee.lightProbeGrid;It.probesSH.value=gt.texture,It.probesMin.value.copy(gt.boundingBox.min),It.probesMax.value.copy(gt.boundingBox.max),It.probesResolution.value.copy(gt.resolution)}Zs.upload(F,Nh(Ee),It,Z)}if(H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(Zs.upload(F,Nh(Ee),It,Z),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&dt.setValue(F,"center",G.center),dt.setValue(F,"modelViewMatrix",G.modelViewMatrix),dt.setValue(F,"normalMatrix",G.normalMatrix),dt.setValue(F,"modelMatrix",G.matrixWorld),H.uniformsGroups!==void 0){let gt=H.uniformsGroups;for(let Mi=0,fs=gt.length;Mi<fs;Mi++){let Oh=gt[Mi];le.update(Oh,bn),le.bind(Oh,bn)}}return bn}function Bf(v,U){v.ambientLightColor.needsUpdate=U,v.lightProbe.needsUpdate=U,v.sunLights.needsUpdate=U,v.sunLightShadows.needsUpdate=U,v.directionalLights.needsUpdate=U,v.directionalLightShadows.needsUpdate=U,v.pointLights.needsUpdate=U,v.pointLightShadows.needsUpdate=U,v.spotLights.needsUpdate=U,v.spotLightShadows.needsUpdate=U,v.rectAreaLights.needsUpdate=U,v.hemisphereLights.needsUpdate=U}function kf(v){return v.isMeshLambertMaterial||v.isMeshToonMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isShadowMaterial||v.isShaderMaterial&&v.lights===!0}this.getActiveCubeFace=function(){return Q},this.getActiveMipmapLevel=function(){return $},this.getRenderTarget=function(){return re},this.setRenderTargetTextures=function(v,U,q){let H=V.get(v);H.__autoAllocateDepthBuffer=v.resolveDepthBuffer===!1,H.__autoAllocateDepthBuffer===!1&&(H.__useRenderToTexture=!1),V.get(v.texture).__webglTexture=U,V.get(v.depthTexture).__webglTexture=H.__autoAllocateDepthBuffer?void 0:q,H.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(v,U){let q=V.get(v);q.__webglFramebuffer=U,q.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(v,U=0,q=0){re=v,Q=U,$=q;let H=null,G=!1,ve=!1;if(v){let ye=V.get(v);if(ye.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(F.FRAMEBUFFER,ye.__webglFramebuffer),ee.copy(v.viewport),Le.copy(v.scissor),Ie=v.scissorTest,_.viewport(ee),_.scissor(Le),_.setScissorTest(Ie),j=-1;return}else if(ye.__webglFramebuffer===void 0)Z.setupRenderTarget(v);else if(ye.__hasExternalTextures)Z.rebindTextures(v,V.get(v.texture).__webglTexture,V.get(v.depthTexture).__webglTexture);else if(v.depthBuffer){let Ye=v.depthTexture;if(ye.__boundDepthTexture!==Ye){if(Ye!==null&&V.has(Ye)&&(v.width!==Ye.image.width||v.height!==Ye.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Z.setupDepthRenderbuffer(v)}}let we=v.texture;(we.isData3DTexture||we.isDataArrayTexture||we.isCompressedArrayTexture)&&(ve=!0);let Pe=V.get(v).__webglFramebuffer;v.isWebGLCubeRenderTarget?(Array.isArray(Pe[U])?H=Pe[U][q]:H=Pe[U],G=!0):v.samples>0&&Z.useMultisampledRTT(v)===!1?H=V.get(v).__webglMultisampledFramebuffer:Array.isArray(Pe)?H=Pe[q]:H=Pe,ee.copy(v.viewport),Le.copy(v.scissor),Ie=v.scissorTest}else ee.copy(be).multiplyScalar(oe).floor(),Le.copy(Ge).multiplyScalar(oe).floor(),Ie=wt;if(q!==0&&(H=W),_.bindFramebuffer(F.FRAMEBUFFER,H)&&_.drawBuffers(v,H),_.viewport(ee),_.scissor(Le),_.setScissorTest(Ie),G){let ye=V.get(v.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+U,ye.__webglTexture,q)}else if(ve){let ye=U;for(let we=0;we<v.textures.length;we++){let Pe=V.get(v.textures[we]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+we,Pe.__webglTexture,q,ye)}}else if(v!==null&&q!==0){let ye=V.get(v.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,ye.__webglTexture,q)}j=-1};function Fh(v){let U=V.get(v);return(U.__readFormat!==v.format||U.__readType!==v.type)&&(U.__readFormat=v.format,U.__readType=v.type,U.__formatReadable=C.textureFormatReadable(v.format),U.__typeReadable=C.textureTypeReadable(v.type)),U}this.readRenderTargetPixels=function(v,U,q,H,G,ve,Te,ye=0){if(!(v&&v.isWebGLRenderTarget)){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let we=V.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&Te!==void 0&&(we=we[Te]),we){_.bindFramebuffer(F.FRAMEBUFFER,we);try{let Pe=v.textures[ye],Ye=Pe.format,Qe=Pe.type;v.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+ye);let Ae=Fh(Pe);if(Ae.__formatReadable===!1){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ae.__typeReadable===!1){ke("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=v.width-H&&q>=0&&q<=v.height-G&&F.readPixels(U,q,H,G,pe.convert(Ye),pe.convert(Qe),ve)}finally{let Pe=re!==null?V.get(re).__webglFramebuffer:null;_.bindFramebuffer(F.FRAMEBUFFER,Pe)}}},this.readRenderTargetPixelsAsync=async function(v,U,q,H,G,ve,Te,ye=0){if(!(v&&v.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let we=V.get(v).__webglFramebuffer;if(v.isWebGLCubeRenderTarget&&Te!==void 0&&(we=we[Te]),we)if(U>=0&&U<=v.width-H&&q>=0&&q<=v.height-G){_.bindFramebuffer(F.FRAMEBUFFER,we);let Pe=v.textures[ye],Ye=Pe.format,Qe=Pe.type;v.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+ye);let Ae=Fh(Pe);if(Ae.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ae.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ot=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,ot),F.bufferData(F.PIXEL_PACK_BUFFER,ve.byteLength,F.STREAM_READ),F.readPixels(U,q,H,G,pe.convert(Ye),pe.convert(Qe),0),F.bindBuffer(F.PIXEL_PACK_BUFFER,null);let Nt=re!==null?V.get(re).__webglFramebuffer:null;_.bindFramebuffer(F.FRAMEBUFFER,Nt);let xt=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await $u(F,xt,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,ot),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,ve),F.bindBuffer(F.PIXEL_PACK_BUFFER,null),F.deleteBuffer(ot),F.deleteSync(xt),ve}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(v,U=null,q=0){let H=Math.pow(2,-q),G=Math.floor(v.image.width*H),ve=Math.floor(v.image.height*H),Te=U!==null?U.x:0,ye=U!==null?U.y:0;Z.setTexture2D(v,0),F.copyTexSubImage2D(F.TEXTURE_2D,q,0,0,Te,ye,G,ve),_.unbindTexture()},this.copyTextureToTexture=function(v,U,q=null,H=null,G=0,ve=0){let Te,ye,we,Pe,Ye,Qe,Ae,ot,Nt,xt=v.isCompressedTexture?v.mipmaps[ve]:v.image;if(q!==null)Te=q.max.x-q.min.x,ye=q.max.y-q.min.y,we=q.isBox3?q.max.z-q.min.z:1,Pe=q.min.x,Ye=q.min.y,Qe=q.isBox3?q.min.z:0;else{let It=Math.pow(2,-G);Te=Math.floor(xt.width*It),ye=Math.floor(xt.height*It),v.isDataArrayTexture?we=xt.depth:v.isData3DTexture?we=Math.floor(xt.depth*It):we=1,Pe=0,Ye=0,Qe=0}H!==null?(Ae=H.x,ot=H.y,Nt=H.z):(Ae=0,ot=0,Nt=0);let ft=pe.convert(U.format),$t=pe.convert(U.type),Ee;U.isData3DTexture?(Z.setTexture3D(U,0),Ee=F.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(Z.setTexture2DArray(U,0),Ee=F.TEXTURE_2D_ARRAY):(Z.setTexture2D(U,0),Ee=F.TEXTURE_2D),_.activeTexture(F.TEXTURE0),_.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,U.flipY),_.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),_.pixelStorei(F.UNPACK_ALIGNMENT,U.unpackAlignment);let rn=_.getParameter(F.UNPACK_ROW_LENGTH),at=_.getParameter(F.UNPACK_IMAGE_HEIGHT),bn=_.getParameter(F.UNPACK_SKIP_PIXELS),jn=_.getParameter(F.UNPACK_SKIP_ROWS),vi=_.getParameter(F.UNPACK_SKIP_IMAGES);_.pixelStorei(F.UNPACK_ROW_LENGTH,xt.width),_.pixelStorei(F.UNPACK_IMAGE_HEIGHT,xt.height),_.pixelStorei(F.UNPACK_SKIP_PIXELS,Pe),_.pixelStorei(F.UNPACK_SKIP_ROWS,Ye),_.pixelStorei(F.UNPACK_SKIP_IMAGES,Qe);let ds=v.isDataArrayTexture||v.isData3DTexture,dt=U.isDataArrayTexture||U.isData3DTexture;if(v.isDepthTexture){let It=V.get(v),bi=V.get(U),gt=V.get(It.__renderTarget),Mi=V.get(bi.__renderTarget);_.bindFramebuffer(F.READ_FRAMEBUFFER,gt.__webglFramebuffer),_.bindFramebuffer(F.DRAW_FRAMEBUFFER,Mi.__webglFramebuffer);for(let fs=0;fs<we;fs++)ds&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,V.get(v).__webglTexture,G,Qe+fs),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,V.get(U).__webglTexture,ve,Nt+fs)),F.blitFramebuffer(Pe,Ye,Te,ye,Ae,ot,Te,ye,F.DEPTH_BUFFER_BIT,F.NEAREST);_.bindFramebuffer(F.READ_FRAMEBUFFER,null),_.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(G!==0||v.isRenderTargetTexture||V.has(v)){let It=V.get(v),bi=V.get(U);_.bindFramebuffer(F.READ_FRAMEBUFFER,O),_.bindFramebuffer(F.DRAW_FRAMEBUFFER,k);for(let gt=0;gt<we;gt++)ds?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,It.__webglTexture,G,Qe+gt):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,It.__webglTexture,G),dt?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,bi.__webglTexture,ve,Nt+gt):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,bi.__webglTexture,ve),G!==0?F.blitFramebuffer(Pe,Ye,Te,ye,Ae,ot,Te,ye,F.COLOR_BUFFER_BIT,F.NEAREST):dt?F.copyTexSubImage3D(Ee,ve,Ae,ot,Nt+gt,Pe,Ye,Te,ye):F.copyTexSubImage2D(Ee,ve,Ae,ot,Pe,Ye,Te,ye);_.bindFramebuffer(F.READ_FRAMEBUFFER,null),_.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else dt?v.isDataTexture||v.isData3DTexture?F.texSubImage3D(Ee,ve,Ae,ot,Nt,Te,ye,we,ft,$t,xt.data):U.isCompressedArrayTexture?F.compressedTexSubImage3D(Ee,ve,Ae,ot,Nt,Te,ye,we,ft,xt.data):F.texSubImage3D(Ee,ve,Ae,ot,Nt,Te,ye,we,ft,$t,xt):v.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,ve,Ae,ot,Te,ye,ft,$t,xt.data):v.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,ve,Ae,ot,xt.width,xt.height,ft,xt.data):F.texSubImage2D(F.TEXTURE_2D,ve,Ae,ot,Te,ye,ft,$t,xt);_.pixelStorei(F.UNPACK_ROW_LENGTH,rn),_.pixelStorei(F.UNPACK_IMAGE_HEIGHT,at),_.pixelStorei(F.UNPACK_SKIP_PIXELS,bn),_.pixelStorei(F.UNPACK_SKIP_ROWS,jn),_.pixelStorei(F.UNPACK_SKIP_IMAGES,vi),ve===0&&U.generateMipmaps&&F.generateMipmap(Ee),_.unbindTexture()},this.initRenderTarget=function(v){V.get(v).__webglFramebuffer===void 0&&Z.setupRenderTarget(v)},this.initTexture=function(v){v.isCubeTexture?Z.setTextureCube(v,0):v.isData3DTexture?Z.setTexture3D(v,0):v.isDataArrayTexture||v.isCompressedArrayTexture?Z.setTexture2DArray(v,0):Z.setTexture2D(v,0),_.unbindTexture()},this.resetState=function(){Q=0,$=0,re=null,_.reset(),xe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Dn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=tt._getDrawingBufferColorSpace(e),t.unpackColorSpace=tt._getUnpackColorSpace()}};var Tn="layer-1",We=n=>n.layerId??Tn,Vn=(n,e=n.activeLayer??Tn)=>n.layers?.find(t=>t.id===e)?.name||"Layer 1";function wx(n){let e=n.layers??[{id:Tn,name:"Layer 1"}];if(!Array.isArray(e)||!e.length||e.length>100)throw Error("A project needs 1\u2013100 layers.");let t=new Set;for(let i of e){if(!i||typeof i.id!="string"||!i.id.length||i.id.length>100||t.has(i.id)||typeof i.name!="string"||!i.name.trim()||i.name.length>60)throw Error("Invalid project layer.");t.add(i.id)}if(!t.has(n.activeLayer??e[0].id))throw Error("The active layer is missing.");for(let i of n.objects)if(!t.has(We(i)))throw Error("An object refers to a missing layer.");return e}function Rd(n){let e=wx(n);n.layers=structuredClone(e),n.activeLayer??=e[0].id;for(let t of n.objects)t.layerId??=Tn;return n}function fl(n,e=[]){let t=We(n[0]||{});if([...n,...e].some(i=>We(i)!==t))throw Error("Merge needs shapes on the same layer. Move them to one layer in Edit first.");return t}function Ks(n){let e=new Set;function t(i){if(e.add(We(i)),i.type!=="prefab")for(let s of i.params?.children||[])t(s)}return n.forEach(t),{format:"tristancad",version:2,objects:n,layers:[...e].map(i=>({id:i,name:i}))}}var Ax=0,Xt=()=>Date.now().toString(36)+"-"+(++Ax).toString(36)+"-"+Math.random().toString(36).slice(2,7);function ni(n,e,t=[0,0,0],i){return{id:Xt(),name:i||n[0].toUpperCase()+n.slice(1),type:n,params:e,position:t,rotation:[0,0,0],mode:"solid",enabled:!0,layerId:Tn}}function Qs(){return{format:"tristancad",version:2,name:"My model",objects:[],layers:[{id:Tn,name:"Layer 1"}],activeLayer:Tn}}function pl(){let n=Qs();n.name="Mounting plate",n.objects=[ni("rounded",{w:70,d:40,h:6,r:4},[0,0,3],"Plate")];for(let e of[-25,25])for(let t of[-12,12]){let i=ni("cylinder",{diameter:5,h:12},[e,t,3],"5 mm mounting hole");i.mode="cut",n.objects.push(i)}return n}function th(){let n=Qs();return n.name="Open tray",n.objects=[ni("rounded",{w:100,d:65,h:28,r:5},[0,0,14],"Outer tray"),ni("rounded",{w:95,d:60,h:30,r:3},[0,0,19],"Hollow interior")],n.objects[1].mode="cut",n}var nh={wedge:{w:40,d:30,h:20},pyramid:{w:30,d:30,h:30},box:{w:30,d:30,h:15},rounded:{w:40,d:30,h:10,r:3},cylinder:{diameter:20,h:20},cone:{diameter:25,top:8,h:25},sphere:{diameter:25},tube:{diameter:25,inner:18,h:20},threadrod:{diameter:6.35,pitch:1.27,h:38.1,clearance:0,phase:0,units:"imperial",hand:"right"},threadtube:{diameter:6.35,pitch:1.27,h:25.4,outer:12.7,clearance:.1524,phase:0,units:"imperial",hand:"right"}},as={wedge:"Inclined plane",pyramid:"Pyramid",prefab:"Prefab",box:"Box",rounded:"Rounded box",cylinder:"Cylinder",cone:"Cone",sphere:"Sphere",tube:"Tube",threadrod:"All-thread screw",threadtube:"Threaded tube",polygon:"Sketch extrusion",mesh:"Imported STL",joined:"Combined solid"};function Pd(n){let e=i=>document.getElementById(i);function t(){let i=n.project();n.openSheet("Model layers",`<p class="subtle">Each layer builds its own material. Cutout shapes remove material only on their own layer. Merge joins selected shapes on one layer. All layer results are added together for the model and STL.</p><p class="inlinehelp">New shapes go on the active layer. Move an existing shape with <b>Edit \u2192 Layer</b>. Tap selection uses the active layer; other layers remain visible for reference.</p><div class="layerlist">${i.layers.map(s=>`<button class="layerrow ${s.id===i.activeLayer?"active":""}" data-layer="${n.escape(s.id)}" aria-pressed="${s.id===i.activeLayer}"><b>${n.escape(s.name)}</b><small>${i.objects.filter(r=>We(r)===s.id).length} objects${s.id===i.activeLayer?" \xB7 active":""}</small></button>`).join("")}</div><button id="newLayer" class="full primary">\uFF0B Create a new layer</button><div class="sectionlabel">Rename ${n.escape(Vn(i))}</div><div class="field"><label for="layerName">Layer name</label><input id="layerName" type="text" maxlength="60" value="${n.escape(Vn(i))}"></div><button id="renameLayer" class="full">Rename active layer</button><div id="layerError" class="modalerror"></div>`,"LAYERS"),document.querySelectorAll("[data-layer]").forEach(s=>s.onclick=()=>{n.clear(),n.change(()=>i.activeLayer=s.dataset.layer),t()}),e("newLayer").onclick=()=>{if(i.layers.length>=100){e("layerError").textContent="Maximum 100 layers.";return}let s={id:"layer-"+Xt(),name:"Layer "+(i.layers.length+1)};n.clear(),n.change(()=>{i.layers.push(s),i.activeLayer=s.id}),t()},e("renameLayer").onclick=()=>{let s=e("layerName").value.trim();if(!s){e("layerError").textContent="Enter a layer name.";return}n.change(()=>i.layers.find(r=>r.id===i.activeLayer).name=s.slice(0,60)),t()}}return{menu:t}}var er=(n,e)=>n.reduce((t,i,s)=>t+i*e[s],0),os=(n,e)=>n.map((t,i)=>t-e[i]),ih=(n,e)=>[n[1]*e[2]-n[2]*e[1],n[2]*e[0]-n[0]*e[2],n[0]*e[1]-n[1]*e[0]],Hn=n=>n.map(e=>e/Math.hypot(...n)),tr=new Map;function Cx(n){if(n===4)return[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(Hn);if(n===6)return[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];if(n===8){let t=[];for(let i of[-1,1])for(let s of[-1,1])for(let r of[-1,1])t.push(Hn([i,s,r]));return t}let e=(1+Math.sqrt(5))/2;if(n===12){let t=[];for(let i of[-1,1])for(let s of[-e,e])t.push(Hn([0,i,s]),Hn([i,s,0]),Hn([s,0,i]));return t}if(n===20){let t=[];for(let i of[-1,1])for(let s of[-1,1])for(let r of[-1,1])t.push(Hn([i,s,r]));for(let i of[-1/e,1/e])for(let s of[-e,e])t.push(Hn([0,i,s]),Hn([i,s,0]),Hn([s,0,i]));return t}return Array.from({length:n},(t,i)=>{let s=1-2*(i+.5)/n,r=Math.sqrt(1-s*s),a=i*Math.PI*(3-Math.sqrt(5));return[r*Math.cos(a),r*Math.sin(a),s]})}function Id(n){return n.filter((e,t)=>Math.hypot(...os(e,n[(t+n.length-1)%n.length]))>1e-8)}function Rx(n){let e=[[-8,-8,-8],[8,-8,-8],[8,8,-8],[-8,8,-8],[-8,-8,8],[8,-8,8],[8,8,8],[-8,8,8]],t=[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]].map(l=>({normal:Hn(ih(os(e[l[1]],e[l[0]]),os(e[l[2]],e[l[0]]))),points:l.map(c=>e[c]),seed:!0}));for(let l of Cx(n)){let c=[],h=[];for(let g of t){let p=[];for(let R=0;R<g.points.length;R++){let b=g.points[R],E=g.points[(R+1)%g.points.length],S=er(b,l)-1,P=er(E,l)-1;if(S<=1e-9&&p.push(b),S<-1e-9&&P>1e-9||S>1e-9&&P<-1e-9){let y=S/(S-P),A=b.map((L,I)=>L+y*(E[I]-L));p.push(A),h.push(A)}Math.abs(S)<=1e-9&&h.push(b)}let T=Id(p);T.length>=3&&c.push({...g,points:T})}let d=new Map(h.map(g=>[g.map(p=>Math.round(p*1e8)).join(","),g])),u=[...d.values()];if(u.length<3)throw Error("Could not build that face count.");let m=[0,1,2].map(g=>u.reduce((p,T)=>p+T[g],0)/u.length),f=Hn(ih(Math.abs(l[2])<.9?[0,0,1]:[0,1,0],l)),x=ih(l,f);u.sort((g,p)=>Math.atan2(er(os(g,m),x),er(os(g,m),f))-Math.atan2(er(os(p,m),x),er(os(p,m),f))),c.push({normal:l,points:Id(u)}),t=c}if(t.some(l=>l.seed)||t.length!==n)throw Error("Could not make a closed solid with that face count.");let i=t.flatMap(l=>l.points),s=[0,1,2].map(l=>Math.min(...i.map(c=>c[l]))),r=[0,1,2].map(l=>Math.max(...i.map(c=>c[l]))),a=s.map((l,c)=>(l+r[c])/2),o=1/Math.max(...r.map((l,c)=>l-s[c]));return t.map(l=>({normal:l.normal,points:l.points.map(c=>c.map((h,d)=>(h-a[d])*o))}))}function Ld(n,e=1){if(!Number.isInteger(n)||n<4||n>512)throw Error("Sphere face count must be a whole number from 4 to 512.");return tr.has(n)||(tr.set(n,Rx(n)),tr.size>16&&tr.delete(tr.keys().next().value)),tr.get(n).map(t=>({normal:[...t.normal],points:t.points.map(i=>i.map(s=>s*e))}))}var Zr=["sphere","cylinder","cone","tube","rounded","threadrod","threadtube"];function Dd(n){return n.resolution?.mode==="faces"?n.resolution.count:0}var Vt=n=>["threadrod","threadtube"].includes(n.type),zi=n=>Vt(n)||n.params?.children?.some(zi)||!1,sh={metric:[["M3 \xD7 0.5",3,.5],["M4 \xD7 0.7",4,.7],["M5 \xD7 0.8",5,.8],["M6 \xD7 1",6,1],["M8 \xD7 1.25",8,1.25],["M10 \xD7 1.5",10,1.5],["M12 \xD7 1.75",12,1.75],["M16 \xD7 2",16,2],["M20 \xD7 2.5",20,2.5]],imperial:[["#6-32",.138,32],["#8-32",.164,32],["#10-24",.19,24],["#10-32",.19,32],["1/4-20",.25,20],["1/4-28",.25,28],["5/16-18",.3125,18],["3/8-16",.375,16],["3/8-24",.375,24],["1/2-13",.5,13],["1/2-20",.5,20],["1/2-28",.5,28],["5/8-11",.625,11],["5/8-24",.625,24],["3/4-10",.75,10]]};function Nd(n){let e=n.params;if(!["metric","imperial"].includes(e.units)||!["right","left"].includes(e.hand))throw Error("Choose metric or imperial units and a thread direction.");if(!(e.diameter>=.5&&e.diameter<=500))throw Error("Thread diameter must be from 0.5 to 500 mm.");if(!(e.pitch>=.05&&e.pitch<=50))throw Error("Thread pitch must be from 0.05 to 50 mm (0.508\u2013508 TPI).");if(!(e.h>=.05&&e.h<=5e3))throw Error("Thread length must be from 0.05 to 5,000 mm.");if(!(e.clearance>=0&&e.clearance<=2)||!Number.isFinite(e.phase))throw Error("Thread fit clearance must be from 0 to 2 mm.");if(e.diameter/2-Math.sqrt(3)*e.pitch*17/48-e.clearance<=.025)throw Error("Pitch or clearance is too large for this thread diameter.");if(n.type==="threadtube"&&!(e.outer<=1e3&&e.outer>e.diameter+2*e.clearance+.1))throw Error("Outer diameter must leave a wall around the thread and its clearance.");if(e.h/e.pitch>500)throw Error("A threaded part supports up to 500 turns. Shorten it or increase the pitch.");if(n.scale?.some(t=>Math.abs(t-1)>1e-8))throw Error("Threaded parts keep their pitch. Change length with Stretch and diameter in Edit.");if(n.fillets?.some(t=>t.radius>0))throw Error("Threaded surfaces cannot use CAD edge roundovers.");if(n.resolution?.mode==="faces")throw Error("Threaded parts use smooth curve resolution; their pitch defines the thread count.")}function nr(n){let e=String(n).trim();if(/^[+-]?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i.test(e))return Number(e);let t=e.match(/^([+-]?)(?:(\d+)\s+)?(\d+)\s*\/\s*(\d+)$/);if(t&&Number(t[4])!==0)return(Number(t[2]||0)+Number(t[3])/Number(t[4]))*(t[1]==="-"?-1:1);throw Error("Enter a number or a fraction such as 1/4 or 1 1/2.")}var Ud={draft:.15,fine:.03,ultra:.01,maximum:.005};function Yt(n){if(!n||n.format!=="tristancad"||n.version!==2||!Array.isArray(n.objects)||n.objects.length>100)throw Error("This is not a supported AvalonCad project (maximum 100 objects).");let e=structuredClone(n);if(Rd(e),e.buildPlaneEnabled!==void 0&&typeof e.buildPlaneEnabled!="boolean")throw Error("Invalid build-plane setting.");e.name=String(e.name||"Untitled").slice(0,80);let t=["box","rounded","cylinder","cone","sphere","tube","threadrod","threadtube","polygon","mesh","joined","wedge","pyramid","prefab"],i=new Set;for(let s of e.objects){if(!t.includes(s.type)||typeof s.id!="string"||i.has(s.id))throw Error("Project contains an invalid object.");i.add(s.id),s.name=String(s.name||s.type).slice(0,60),s.mode=s.mode==="cut"?"cut":"solid",s.enabled=s.enabled!==!1;for(let a of["position","rotation"])if(!Array.isArray(s[a])||s[a].length!==3||s[a].some(o=>!Number.isFinite(o)||Math.abs(o)>1e4))throw Error("Invalid object coordinates.");if(s.params=s.params||{},s.positionReference!==void 0&&s.positionReference!=="base")throw Error("Invalid position reference.");if(s.positionReference==="base"&&s.placement===void 0||s.placement!==void 0&&s.positionReference!=="base"||s.placement!==void 0&&(!Array.isArray(s.placement)||s.placement.length!==3||s.placement.some(a=>!Number.isFinite(a)||Math.abs(a)>1e4)))throw Error("Invalid base position.");if(Vt(s)&&Nd(s),["joined","prefab"].includes(s.type)&&zi(s)&&s.scale?.some(a=>Math.abs(a-1)>1e-8))throw Error("Separate threaded components before changing their dimensions to preserve thread pitch.");if(s.params.fillOverlaps!==void 0&&(!["joined","prefab"].includes(s.type)||typeof s.params.fillOverlaps!="boolean"))throw Error("Invalid Add overlap setting.");if(s.excludedCutouts!==void 0&&(!Array.isArray(s.excludedCutouts)||s.excludedCutouts.length>100||s.excludedCutouts.some(a=>typeof a!="string"||a.length>100)||new Set(s.excludedCutouts).size!==s.excludedCutouts.length))throw Error("Invalid saved cutout exclusions.");if(s.resolution){let a=s.resolution;if(!Zr.includes(s.type)||!["auto","faces","tolerance"].includes(a.mode))throw Error("Invalid face-resolution mode.");if(a.mode==="faces"&&(!Number.isInteger(a.count)||a.count<(s.type==="sphere"?4:s.type==="rounded"?1:3)||a.count>(s.type==="rounded"?128:512)))throw Error(s.type==="sphere"?"Sphere face count must be a whole number from 4 to 512.":s.type==="rounded"?"Segments per corner must be a whole number from 1 to 128.":"Sides must be a whole number from 3 to 512.");if(a.mode==="tolerance"&&(!Number.isFinite(a.tolerance)||a.tolerance<.005||a.tolerance>2))throw Error("Face resolution must be from 0.005 to 2 mm.")}if(s.scale&&(!Array.isArray(s.scale)||s.scale.length!==3||s.scale.some(a=>!Number.isFinite(a)||a<.001||a>1e3)))throw Error("Invalid object scale.");if(s.fillets&&(!Array.isArray(s.fillets)||s.fillets.length>100||s.fillets.some(a=>!Number.isFinite(a.radius)||a.radius<0||a.radius>1e4||!Array.isArray(a.edges)||a.edges.length>500||a.edges.some(o=>!Number.isInteger(o)||o<0||o>1e4))))throw Error("Invalid roundover.");if(s.type==="joined"){if(!Array.isArray(s.params.children)||s.params.children.length<2)throw Error("A combined solid needs at least two components.");if(!s.params.children.some(a=>a.mode!=="cut"))throw Error("Combined objects need positive material.");Yt({format:"tristancad",version:2,objects:s.params.children,layers:e.layers,activeLayer:e.activeLayer})}if(s.type==="prefab"){if(!Array.isArray(s.params.children)||!s.params.children.length||s.params.children.length>100||!s.params.children.some(a=>a.enabled!==!1&&a.mode!=="cut"))throw Error("A prefab needs 1\u2013100 components with positive material.");if(!Array.isArray(s.params.layers))throw Error("The prefab is missing its internal layers.");Yt({format:"tristancad",version:2,objects:s.params.children,layers:s.params.layers})}for(let a of Object.values(s.params))if(typeof a=="number"&&(!Number.isFinite(a)||Math.abs(a)>1e4))throw Error("Invalid dimensions.");if(({wedge:["w","d","h"],pyramid:["w","d","h"],box:["w","d","h"],rounded:["w","d","h","r"],cylinder:["diameter","h"],cone:["diameter","h"],sphere:["diameter"],tube:["diameter","inner","h"],polygon:["h"]}[s.type]||[]).some(a=>!(s.params[a]>=.05)))throw Error("Dimensions must be at least 0.05 mm.");if(s.type==="cone"&&!(s.params.top>=0&&s.params.top<=1e4))throw Error("Invalid cone top diameter.");if(s.type==="rounded"&&s.params.r>Math.min(s.params.w,s.params.d)/2)throw Error("Corner radius is larger than half the width or depth.");if(s.type==="tube"&&s.params.inner>=s.params.diameter)throw Error("The inner diameter must be smaller than the outer diameter.");if(s.type==="polygon"){let a=s.params.points;if(!Array.isArray(a)||a.length<3||a.length>300||a.some(o=>!Array.isArray(o)||o.length!==2||o.some(l=>!Number.isFinite(l)||Math.abs(l)>1e4)))throw Error("Invalid sketch polygon.");rh(a)}if(s.type==="mesh"){let a=s.params.mesh;if(!a||!Array.isArray(a.vertices)||!Array.isArray(a.triangles)||a.vertices.length>3e6||a.triangles.length>3e6||a.vertices.length%3||a.triangles.length%3||a.vertices.some(o=>!Number.isFinite(o)||Math.abs(o)>1e4)||a.triangles.some(o=>!Number.isInteger(o)||o<0||o>=a.vertices.length/3))throw Error("Invalid imported mesh.")}}return e}function rh(n){let e=(r,a,o)=>(a[0]-r[0])*(o[1]-r[1])-(a[1]-r[1])*(o[0]-r[0]),t=(r,a,o)=>Math.abs(e(r,a,o))<1e-8&&o[0]>=Math.min(r[0],a[0])-1e-8&&o[0]<=Math.max(r[0],a[0])+1e-8&&o[1]>=Math.min(r[1],a[1])-1e-8&&o[1]<=Math.max(r[1],a[1])+1e-8,i=(r,a,o,l)=>e(r,a,o)*e(r,a,l)<0&&e(o,l,r)*e(o,l,a)<0||t(r,a,o)||t(r,a,l)||t(o,l,r)||t(o,l,a),s=0;for(let r=0;r<n.length;r++){let a=n[r],o=n[(r+1)%n.length];if(Math.hypot(a[0]-o[0],a[1]-o[1])<.001)throw Error("Remove repeated sketch points.");s+=a[0]*o[1]-a[1]*o[0];for(let l=r+1;l<n.length;l++)if(!(l===r+1||r===0&&l===n.length-1)&&i(a,o,n[l],n[(l+1)%n.length]))throw Error("Sketch lines cross. Draw a simple closed outline.")}if(Math.abs(s)<.01)throw Error("Sketch needs an enclosed area.")}function Fd(n){let e=new DataView(n),t=[],i=[];if(n.byteLength>=84&&84+e.getUint32(80,!0)*50===n.byteLength){let s=e.getUint32(80,!0);if(s>1e6)throw Error("STL exceeds 1 million triangles.");for(let r=0;r<s;r++)for(let a=0;a<3;a++){let o=84+r*50+12+a*12;t.push(e.getFloat32(o,!0),e.getFloat32(o+4,!0),e.getFloat32(o+8,!0)),i.push(i.length)}}else{let s=new TextDecoder().decode(n),r=/vertex\s+([-+\deE.]+)\s+([-+\deE.]+)\s+([-+\deE.]+)/g,a;for(;a=r.exec(s);)if(t.push(+a[1],+a[2],+a[3]),i.push(i.length),i.length>3e6)throw Error("STL exceeds 1 million triangles.")}if(!i.length||i.length%3||t.some(s=>!Number.isFinite(s)))throw Error("Invalid STL file.");return{vertices:t,triangles:i}}function ls(n,e=new Map){let t=new Map(e);for(let i of n)t.set(i.id,Xt());return n.map(i=>{let s=structuredClone(i);return s.id=t.get(i.id),s.excludedCutouts&&(s.excludedCutouts=s.excludedCutouts.filter(r=>t.has(r)).map(r=>t.get(r))),s.params.children&&(s.params.children=ls(s.params.children,t)),s})}function Od(n,e=!0){function t(i){if(i.enabled===!1||i.mode==="cut")return null;let s=structuredClone(i);if(delete s.excludedCutouts,s.params.children){let r=JSON.stringify(s.params.children),a=s.params.children.map(t).filter(Boolean);if(!a.length)return null;if(s.params.children=a,s.type==="joined"&&a.length===1){let o=a[0];s.type="prefab",s.params.layers=Ks([o]).layers}JSON.stringify(a)!==r&&delete s.fillets,delete s.params.fillOverlaps,s.params.operation==="subtract"&&(s.params.operation="add")}return s}return e?structuredClone(n.filter(i=>i.enabled!==!1)):n.map(t).filter(Boolean)}function Bd(n,e,t,i,{pruneLayers:s=!1}={}){if(!t||!n.some(c=>c.mode!=="cut"))throw Error("A prefab needs solid material.");if(s){let c=new Set(n.map(We)),h=i.filter(d=>c.has(d.id));h.length&&(i=h)}let r=t.min.map((c,h)=>(c+t.max[h])/2),a=Xt(),o=ls(n).map(c=>({...c,position:c.position.map((h,d)=>h-r[d])})),l={id:Xt(),name:e,type:"prefab",mode:"solid",enabled:!0,layerId:Tn,position:[0,0,0],rotation:[0,0,0],localBounds:{min:t.min.map((c,h)=>c-r[h]),max:t.max.map((c,h)=>c-r[h])},params:{children:o,layers:structuredClone(i)}};return Jr({format:"avaloncad-prefab",version:1,id:a,name:e,createdAt:Date.now(),object:l})}function Jr(n){if(!n||n.format!=="avaloncad-prefab"||n.version!==1||typeof n.id!="string"||!n.id.length||n.id.length>100||typeof n.name!="string"||!n.name.trim()||n.name.length>60||n.object?.type!=="prefab")throw Error("This is not a supported AvalonCad prefab.");let e=structuredClone(n);e.name=e.name.trim(),e.object.name=e.name,e.object.mode="solid",e.object.enabled=!0,e.object=Yt(Ks([e.object])).objects[0];let t=e.object.localBounds;if(!t||!["min","max"].every(i=>Array.isArray(t[i])&&t[i].length===3&&t[i].every(Number.isFinite))||t.max.some((i,s)=>i<=t.min[s]))throw Error("The prefab is missing valid size information.");return e}function kd(n,e){let t=structuredClone(Jr(n).object);return t.id=Xt(),t.layerId=e,t.params.children=ls(t.params.children),t.position=[0,0,(t.localBounds.max[2]-t.localBounds.min[2])/2],t}function zd(n,e,t,i,s){let r=new Set(e),a=structuredClone(n),o=a.objects.findIndex(h=>r.has(h.id));if(o<0)throw Error("The selected objects are no longer in the project.");let l=structuredClone(t.object);l.id=Xt(),l.layerId=s,l.params.children=ls(l.params.children),l.position=i.min.map((h,d)=>(h+i.max[d])/2),l.rotation=[0,0,0],delete l.positionReference,delete l.placement,a.objects=a.objects.filter(h=>!r.has(h.id));let c=a.objects.filter(h=>h.mode==="cut"&&We(h)===s).map(h=>h.id);if(c.length>100)throw Error("Too many cutouts on this layer to replace the selection (maximum 100).");c.length?l.excludedCutouts=c:delete l.excludedCutouts;for(let h of a.objects)h.excludedCutouts&&(h.excludedCutouts=h.excludedCutouts.filter(d=>!r.has(d)),h.excludedCutouts.length||delete h.excludedCutouts);return a.objects.splice(o,0,l),{project:a,instance:l}}var Px=2,ml=100,ah=n=>new Et(...n.map(Bt.degToRad),"ZYX"),Gd=n=>!n.scale||n.scale.every(e=>Math.abs(e-1)<=1e-8),Wd=n=>!!(n.fillets?.length||n.resolution||!Gd(n)),oh=n=>n?.type==="joined"&&n.params?.operation==="subtract",Ix=n=>n.type==="joined"&&n.params?.operation!=="add"&&!n.params?.fillOverlaps&&!Wd(n);function Vd(n,e){let t=new D(...n.position).applyEuler(ah(e.rotation)).add(new D(...e.position)),i=new vt().setFromEuler(ah(e.rotation)).multiply(new vt().setFromEuler(ah(n.rotation))),s=new Et().setFromQuaternion(i,"ZYX");return{...structuredClone(n),position:t.toArray(),rotation:[s.x,s.y,s.z].map(Bt.radToDeg)}}function Hd(n,e,t){return delete n.sourceMode,delete n.positionReference,delete n.placement,n.layerId=e,n.enabled=t,n}function Lx(n){if(Wd(n))return"it has roundovers, a face resolution or a stretch";if(n.params.fillOverlaps)return"it fills overlaps";if(n.mode==="cut")return"the result itself is a cutout";let e=[],t=[],i=null;function s(r,a,o){let l=[...o];for(let c of r.params.children)if(c.mode==="cut"){if(c.type==="joined"){i="it contains a joined cutout";return}let h=Vd(c,a);h.id=Xt(),h.mode="cut",t.push(h),l.push(h.id)}for(let c of r.params.children)if(c.mode!=="cut"){let h=Vd(c,a);if(Ix(c)&&Gd(c)?s(c,h,l):(h.id=Xt(),h.mode="solid",e.push({piece:h,cuts:new Set(l)})),i)return}}return s(n,n,[]),i||{solids:e,cuts:t}}function lh(n,e){let t=structuredClone(n);for(let s=0;s<t.length;s++){let r=t[s];if(r.type==="prefab"&&Array.isArray(r.params?.children)&&(r.params.children=lh(r.params.children,e)),!oh(r))continue;let a=Lx(r),o=r.name||"Subtract result";if(typeof a=="string"){e(`\u201C${o}\u201D was kept as a combined object because ${a}.`);continue}let l=We(r),c=r.enabled!==!1,h=a.cuts.map(x=>x.id),d=a.solids.map(({piece:x,cuts:g},p)=>(Hd(x,l,c),x.name=String(x.name||`${o} \xB7 part ${p+1}`).slice(0,60),x.excludedCutouts=[...new Set([...r.excludedCutouts||[],...h.filter(T=>!g.has(T))])],x.excludedCutouts.length||delete x.excludedCutouts,x)),u=a.cuts.map(x=>(Hd(x,l,c),x.name=String(x.name||`${o} \xB7 cutout`).slice(0,60),delete x.excludedCutouts,x)),m=[...t.slice(0,s),...d,...u,...t.slice(s+1)];for(let x of m)!d.includes(x)&&!u.includes(x)&&x.mode!=="cut"&&We(x)===l&&h.length&&(x.excludedCutouts=[...new Set([...x.excludedCutouts||[],...h])]);let f=new Set(m.map(x=>x.id));for(let x of m)x.excludedCutouts&&(x.excludedCutouts=x.excludedCutouts.filter(g=>f.has(g)),x.excludedCutouts.length||delete x.excludedCutouts);if(m.length>ml||m.some(x=>(x.excludedCutouts?.length||0)>ml)){e(`\u201C${o}\u201D was kept as a combined object because splitting it would exceed the ${ml}-object or ${ml}-cutout limit.`);continue}t=m,s+=d.length+u.length-1}let i=new Set(t.map(s=>s.id));for(let s of t)s.excludedCutouts&&(s.excludedCutouts=s.excludedCutouts.filter(r=>i.has(r)),s.excludedCutouts.length||delete s.excludedCutouts);for(let s of t)s.type==="joined"&&!oh(s)&&Xd(s)&&e(`\u201C${s.name||"Merged solid"}\u201D keeps an older Subtract result inside a Merge.`);return t}function Xd(n){return(n.params?.children||[]).some(e=>oh(e)||e.type==="joined"&&Xd(e))}function Yd(n,e=[]){if(!n||n.format!=="tristancad"||n.version!==1||!Array.isArray(n.objects))return n;let t=structuredClone(n),i=new Set,s=r=>{i.has(r)||(i.add(r),e.push(r),console.warn(r))};for(let r of t.objects)r.layerId??=Tn;return t.objects=lh(t.objects,s),t.version=Px,t}function ch(n,e=[]){if(n?.format!=="avaloncad-prefab"||n.object?.type!=="prefab"||!Array.isArray(n.object.params?.children))return n;let t=structuredClone(n),i=new Set;return t.object.params.children=lh(t.object.params.children,s=>{i.has(s)||(i.add(s),e.push(s))}),t}var qd="tristancad.prefabs",jd={replaceSelection:!0,bakeOutsideCutouts:!0},Dx=(n,e)=>!n||!e||[0,1,2].every(t=>n.min[t]<=e.max[t]&&n.max[t]>=e.min[t]);function $d(n){let e=c=>document.getElementById(c),t=[];try{let c=JSON.parse(localStorage.getItem(qd)||"[]");if(Array.isArray(c))for(let h of c.slice(0,100))try{t.push(Jr(ch(h)))}catch{console.warn("An invalid saved prefab was skipped.")}}catch{console.warn("Saved prefabs could not be loaded.")}function i(c){if(c.length>100)throw Error("Maximum 100 saved prefabs.");try{localStorage.setItem(qd,JSON.stringify(c))}catch{throw Error("Prefab storage is full. Export and remove an existing prefab, then try again.")}t=c}function s(c){if(n.project().objects.length>=100)return n.toast("Maximum 100 objects per project.",!0);let h=t.find(u=>u.id===c);if(!h)return;let d=kd(h,n.project().activeLayer);n.place(d),n.editDraft(d)}function r(){n.openSheet("Prefabs",`<p class="subtle">Reusable assemblies saved on this device. Each insertion is an independent copy. Prefabs preserve primitive parameters, roundovers and their own layer rules.</p><button id="createPrefab" class="full primary">Save an assembly as a prefab</button><button id="importPrefab" class="full">Import .avprefab</button><div class="sectionlabel">Your saved shapes \xB7 ${t.length}</div>${t.length?t.map(c=>`<div class="prefabrow"><button class="prefabmain" data-prefab-insert="${n.escape(c.id)}">${n.escape(c.name)}<small>${c.object.params.children.length} component${c.object.params.children.length===1?"":"s"} \xB7 tap to insert</small></button><button data-prefab-export="${n.escape(c.id)}" aria-label="Export ${n.escape(c.name)}">\u21E7</button><button data-prefab-delete="${n.escape(c.id)}" class="danger" aria-label="Remove ${n.escape(c.name)}">\u2715</button></div>`).join(""):'<p class="subtle">Save your selected object, active layer or entire model to build your collection.</p>'}<p class="inlinehelp">Export .avprefab to keep a portable backup. Inserted prefabs are embedded in .tcad projects and work without this collection.</p>`,"REUSABLE SHAPES"),e("createPrefab").onclick=o,e("importPrefab").onclick=n.importDialog,document.querySelectorAll("[data-prefab-insert]").forEach(c=>c.onclick=()=>s(c.dataset.prefabInsert)),document.querySelectorAll("[data-prefab-export]").forEach(c=>c.onclick=()=>{let h=t.find(d=>d.id===c.dataset.prefabExport);n.saveFile(JSON.stringify(h,null,2),(h.name.replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,64)||"prefab")+".avprefab","application/json")}),document.querySelectorAll("[data-prefab-delete]").forEach(c=>c.onclick=()=>{let h=c.dataset.prefabDelete,d=t.find(u=>u.id===h);n.openSheet("Remove saved prefab?",`<p class="subtle">Remove \u201C${n.escape(d.name)}\u201D from your collection? Existing instances in projects are kept.</p><div class="row"><button id="cancelPrefabRemove">Keep</button><button id="confirmPrefabRemove" class="danger">Remove</button></div><div id="prefabError" class="modalerror"></div>`),e("cancelPrefabRemove").onclick=r,e("confirmPrefabRemove").onclick=()=>{try{i(t.filter(u=>u.id!==h)),r()}catch(u){e("prefabError").textContent=u.message}}})}function a(c,h){let d=new Set(h.map(f=>f.id)),u=f=>n.parts?.().find(x=>x.userData.id===f)?.userData.bounds,m=h.filter(f=>f.enabled&&f.mode!=="cut");return c.objects.filter(f=>f.enabled&&f.mode==="cut"&&!d.has(f.id)&&m.some(x=>We(x)===We(f)&&!x.excludedCutouts?.includes(f.id)&&Dx(u(x.id),u(f.id))))}function o(c={}){let h=n.current(),d=n.selection().filter(S=>n.project().objects.some(P=>P.id===S)),u=d.length>1,m=c?.source==="selection"&&u||u?"selection":h?.enabled?"selected":"layer",f=n.project(),x=f.objects.filter(S=>d.includes(S.id)),g=x.filter(S=>!S.enabled),p=u?a(f,x):[],T=[...new Set(x.map(S=>S.name))],R=m==="selection"?T.length===1?T[0]:"Prefab "+(t.length+1):h?.name||"My prefab";n.openSheet("Save prefab",`<div class="field"><label for="prefabName">Prefab name</label><input id="prefabName" type="text" maxlength="60" value="${n.escape(R.slice(0,60))}"></div><div class="field"><label for="prefabSource">Assembly to save</label><select id="prefabSource">${h?.enabled?'<option value="selected">Selected object</option>':""}${u?`<option value="selection">${d.length} objects selected</option>`:""}<option value="layer">All enabled objects on ${n.escape(Vn(n.project()))}</option><option value="project">Entire model \xB7 all layers</option></select></div><label class="toggle"><input id="prefabCuts" type="checkbox" checked>Include subtractions and cutouts</label><p class="inlinehelp">Turn this off to save the positive component shapes without their cutouts. Native tube bores and threaded geometry stay part of their primitives. With this on, each layer keeps its own cuts and existing filled holes. Disconnected pieces are allowed.</p>${u?`<div id="prefabSelectionOptions"><label class="toggle"><input id="prefabReplace" type="checkbox" ${jd.replaceSelection?"checked":""}>Replace selection with an instance of this prefab</label>${g.length?`<p class="inlinehelp" id="prefabHiddenNote">${g.length} hidden object${g.length===1?"":"s"} not included.</p>`:""}${p.length?`<p class="inlinehelp" id="prefabOutsideNote">${p.length} other cutout${p.length===1?"":"s"} also cut${p.length===1?"s":""} these objects.</p><label class="toggle"><input id="prefabBake" type="checkbox" ${jd.bakeOutsideCutouts?"checked":""}>Bake them into the prefab</label><p class="modalerror" id="prefabBakeWarning"></p>`:""}</div>`:""}<p class="inlinehelp" id="prefabModelNote">Saving a prefab keeps your model unchanged. Apply changes in Edit before saving them as a prefab.</p><div id="prefabError" class="modalerror"></div><button id="savePrefab" class="full primary">Save prefab</button>`,"PREFAB ASSEMBLY"),e("prefabSource").value=m;let b=()=>e("prefabSource").value==="selection"&&!!e("prefabReplace")?.checked;function E(){let S=e("prefabSource").value==="selection";e("prefabSelectionOptions")&&(e("prefabSelectionOptions").hidden=!S),e("prefabModelNote").hidden=b(),e("prefabBakeWarning")&&(e("prefabBakeWarning").textContent=b()&&(!e("prefabBake").checked||!e("prefabCuts").checked)?`Geometry will change: ${p.length} outside cutout${p.length===1?"":"s"} no longer cut${p.length===1?"s":""} these parts.`:""),e("savePrefab").textContent=b()?"Create prefab":"Save prefab"}for(let S of["prefabSource","prefabReplace","prefabBake","prefabCuts"])e(S)&&(e(S).onchange=E);E(),e("savePrefab").onclick=async()=>{let S=e("prefabName").value.trim().slice(0,60),P=e("prefabSource").value,y=e("prefabCuts").checked,A=e("prefabError"),L=b(),I=P==="selection"&&y&&!!e("prefabBake")?.checked;if(!S){A.textContent="Enter a prefab name.";return}let z=n.project(),W=P==="project"?z.objects.filter(k=>k.enabled):P==="layer"?z.objects.filter(k=>k.enabled&&We(k)===z.activeLayer):P==="selection"?z.objects.filter(k=>k.enabled&&d.includes(k.id)):[h];P==="selected"&&h&&(h.mode==="cut"?W=[{...h,mode:"solid"}]:W=[h,...z.objects.filter(k=>k.enabled&&k.mode==="cut"&&k.id!==h.id&&We(k)===We(h))]);let O=W.filter(k=>y||k.mode!=="cut").map(k=>k.id);if(W=Od(W,y),I&&W.push(...structuredClone(p)),!W.some(k=>k.mode!=="cut")){A.textContent=P==="selection"?"A prefab needs solid material. Select at least one enabled solid.":"Choose an assembly with an enabled solid object.";return}n.lock(!0);try{let k=await n.request("check",{project:{...structuredClone(z),objects:W},tolerance:.03});if(!k.bounds||!(k.volume>0))throw Error("The assembly has no solid material remaining.");let Q=Bd(W,S,k.bounds,z.layers,{pruneLayers:P==="selection"});if(P!=="selection"){let re=await n.request("check",{project:Ks([Q.object]),tolerance:.03});if(!re.bounds||!(re.volume>0))throw Error("The prefab has no solid material.")}let $=null;if(L){let re=z.objects.find(j=>j.id===d.at(-1))||W[0];$=zd(z,O,Q,k.bounds,We(re)),Yt($.project)}i([...t,Q]),n.lock(!1),$?(n.commit($.project,$.instance.id),n.closeSheet(),n.toast("Prefab created. Undo restores the parts; the saved prefab stays in your collection.")):(r(),n.toast("Prefab saved on this device."))}catch(k){A.textContent=k.message}finally{n.lock(!1)}}}async function l(c){let h=Jr(ch(c));n.lock(!0);try{let d=await n.request("check",{project:Ks([h.object]),tolerance:.03});if(!d.bounds||!(d.volume>0))throw Error("The prefab has no solid material.");i([...t.filter(u=>u.id!==h.id),h]),n.lock(!1),r(),n.toast("Prefab imported into your collection.")}finally{n.lock(!1)}}return{menu:r,form:o,insert:s,importRecord:l,count:()=>t.length}}var Zd=new Map;function tn(n,e,t){if(!!0)return new e(t);let i=n+JSON.stringify(t),s=Zd.get(i);return s||(s=new e(t),s.dispose=()=>{},Zd.set(i,s)),s}var Nx=n=>Object.entries(n.attributes).map(([e,t])=>e+":"+t.array.constructor.name+":"+t.array.length+":"+t.itemSize).join("|")+"#"+(n.index?n.index.array.constructor.name+n.index.array.length:"");function Jd(){let n=new Map,e=[],t=i=>(i.release||(i.release=i.dispose.bind(i),i.dispose=()=>{}),i);return{begin(){for(let i of e)i.release();e=[...new Set(n.values())],n=new Map},get(i,s){if(!!0)return s();let r=n.get(i);if(r)return r;let a=s(),o=Nx(a),l=e.findIndex(c=>c.userData.layout===o);return l>=0?(r=e.splice(l,1)[0],dh(r,Object.fromEntries(Object.entries(a.attributes).map(([c,h])=>[c,h.array])),a.index?.array),a.dispose()):(r=t(a),r.userData.layout=o),n.set(i,r),r},size:()=>n.size+e.length}}var hh=Jd(),Kd=()=>hh.begin();function uh(n,e,t,i){return hh.get("s"+e+","+t+","+i,()=>new n(e,t,i))}function dh(n,e,t){if(!!0)return!1;for(let[i,s]of Object.entries(e)){let r=n.attributes[i];if(!r||r.array.length!==s.length||r.array.constructor!==s.constructor)return!1}if(Object.keys(n.attributes).length!==Object.keys(e).length||t!==void 0&&(!n.index||n.index.array.length!==t.length||n.index.array.constructor!==t.constructor))return!1;for(let[i,s]of Object.entries(e)){let r=n.attributes[i];r.array.set(s),r.needsUpdate=!0}return t!==void 0&&(n.index.array.set(t),n.index.needsUpdate=!0),n.boundingBox=null,n.boundingSphere=null,!0}var Ux=0,ir=(n,e)=>n.get("u"+ ++Ux,e),fh=hh,gl=Jd();function sr(n){return n.positionReference="base",n.placement=[0,0,0],n}function Hi(n,e){for(let t of e.floorAdjustments||[]){let i=n.objects.find(s=>s.id===t.id);if(i&&i.position.every((s,r)=>Math.abs(s-t.sourcePosition[r])<1e-8)){let s=t.position[2]-i.position[2];i.position=Array.from(t.position),i.placement&&(i.placement[2]+=s)}}return n}var wn=["X","Y","Z"];function Qd(n){return new Et(...n.rotation.map(Bt.degToRad),"ZYX")}function Wi(n){return new pt().compose(new D(...n.position),new vt().setFromEuler(Qd(n)),new D(...n.scale||[1,1,1]))}function rr(n,e,t=1){let i=new D;return i.setComponent(e,t),i.applyEuler(Qd(n))}function ph(n){let e=Dd(n);if(!e||!["cylinder","cone","tube","sphere"].includes(n.type))return null;let t=n.params,i=Math.max(t.diameter,t.top||0)/2,s=n.type==="sphere"?Ld(e,t.diameter).flatMap(o=>o.points):Array.from({length:e},(o,l)=>[i*Math.cos(l*2*Math.PI/e),i*Math.sin(l*2*Math.PI/e),0]),r=[0,1,2].map(o=>Math.min(...s.map(l=>l[o]))),a=[0,1,2].map(o=>Math.max(...s.map(l=>l[o])));return n.type!=="sphere"&&(r[2]=-t.h/2,a[2]=t.h/2),{min:r,max:a}}function Gi(n){let e=n.params,t=n.scale||[1,1,1],i;switch(n.type){case"threadrod":{let r=e.diameter-2*e.clearance;i=[r,r,e.h];break}case"threadtube":i=[e.outer,e.outer,e.h];break;case"wedge":case"pyramid":case"box":case"rounded":i=[e.w,e.d,e.h];break;case"cylinder":case"cone":case"tube":i=[Math.max(e.diameter,e.top||0),Math.max(e.diameter,e.top||0),e.h];break;case"sphere":i=[e.diameter,e.diameter,e.diameter];break;case"polygon":i=[Math.max(...e.points.map(r=>r[0]))-Math.min(...e.points.map(r=>r[0])),Math.max(...e.points.map(r=>r[1]))-Math.min(...e.points.map(r=>r[1])),e.h];break;default:{let r=n.localBounds;r?i=r.max.map((a,o)=>a-r.min[o]):i=[1,1,1]}}let s=ph(n);return s&&(i=s.max.map((r,a)=>r-s.min[a])),i.map((r,a)=>r*t[a])}function mh(n,e,t,i){let s=structuredClone(n),r=Gi(n),a=Math.max(.05,r[e]+i),o=a-r[e],l=s.params,c=s.scale||[1,1,1];if(["joined","prefab"].includes(n.type)&&zi(n))throw Error("Separate the components to change thread length without changing pitch.");if(Vt(n)){if(e!==2)throw Error("Threaded parts stretch in length only. Change thread diameter in Edit.");l.h=a,t<0&&(l.phase=((l.phase-o)%l.pitch+l.pitch)%l.pitch)}else if(["wedge","pyramid","box","rounded"].includes(n.type)){let u=["w","d","h"][e];l[u]=a/c[e],n.type==="rounded"&&(l.r=Math.min(l.r,l.w/2-1e-4,l.d/2-1e-4))}else if(["cylinder","cone","tube","sphere"].includes(n.type))if(e===2&&n.type!=="sphere")l.h=a/c[e];else{let u=a/r[e];l.diameter*=u,l.inner&&(l.inner*=u),l.top&&(l.top*=u)}else if(n.type==="polygon")if(e===2)l.h=a/c[e];else{let u=l.points.map(x=>x[e]),m=(Math.max(...u)+Math.min(...u))/2,f=a/r[e];for(let x of l.points)x[e]=m+(x[e]-m)*f}else s.scale=[...c],s.scale[e]*=a/r[e];let h=ph(n)?(_l(n)[e]-_l(s)[e])*c[e]:0,d=rr(n,e).multiplyScalar(t*o/2+h);return s.position=s.position.map((u,m)=>u+d.getComponent(m)),s}function xl(n,e){let t=new D(...e),i=[0,1,2].sort((s,r)=>Math.abs(t.getComponent(r))-Math.abs(t.getComponent(s)));return{axis:i[0],sign:t.getComponent(i[0])>=0?1:-1}}function _l(n){let e=ph(n);return e?e.min.map((t,i)=>(t+e.max[i])/2):n.type==="polygon"?[0,1].map(t=>(Math.max(...n.params.points.map(i=>i[t]))+Math.min(...n.params.points.map(i=>i[t])))/2).concat(0):n.localBounds?n.localBounds.min.map((t,i)=>(t+n.localBounds.max[i])/2):[0,0,0]}function fi(n){return new D(..._l(n)).applyMatrix4(Wi(n)).toArray()}function yl(n,e){let t=Wi(n),i=Gi(n),s=[{kind:"center",label:"Object center",point:fi(n)}];for(let r=0;r<3;r++)for(let a of[-1,1]){let o=_l(n);o[r]+=a*i[r]/2/(n.scale?.[r]||1);let l=new D(...o).applyMatrix4(t);s.push({kind:"axis",axis:r,sign:a,label:wn[r]+" face center",point:l.toArray()})}if(e)for(let r of e.faces.filter(a=>a.kind==="PLANE")){let a=new D(...r.center).applyMatrix4(t);s.push({kind:"face",face:r.index,label:"Face center",point:a.toArray()})}return s}function ef(n,e){let t=structuredClone(n),i=fi(n),s=fi(e);return t.position=t.position.map((r,a)=>r+s[a]-i[a]),t}function tf(n,e,t,i,s,r,a=.02){let o=structuredClone(n),l=Gi(n),c=Gi(i),h=rr(n,e,t).multiplyScalar(l[e]/2),d=rr(i,s,r).multiplyScalar(c[s]/2),u=fi(n),m=fi(i);o.position=o.position.map((x,g)=>x+m[g]+d.getComponent(g)-u[g]-h.getComponent(g));let f=rr(i,s,r).multiplyScalar(-a);return o.position=o.position.map((x,g)=>x+f.getComponent(g)),o}function vl(n,e,t){let i=structuredClone(n);i.fillets=i.fillets||[];let s=new Set(e);return i.fillets=i.fillets.map(r=>({...r,edges:r.edges.filter(a=>!s.has(a))})).filter(r=>r.edges.length),t>0&&i.fillets.push({edges:[...s],radius:t}),i}function Fx(n,e,t){let i=t?t.min.map((s,r)=>(s+t.max[r])/2):[0,1,2].map(s=>n.reduce((r,a)=>r+a.position[s],0)/n.length);return{id:e,layerId:We(n[0]),name:"Conjoined solid",type:"joined",mode:"solid",enabled:!0,position:i,rotation:[0,0,0],params:{children:n.map(s=>({...structuredClone(s),position:s.position.map((r,a)=>r-i[a])}))}}}function nf(n,e,t,i=[],s=!1){fl(n,i);let r=(l,c)=>({...structuredClone(l),sourceMode:l.mode,mode:c}),a=Fx([...n.map(l=>r(l,"solid")),...i.map(l=>r(l,"cut"))],e,t);a.params.operation="add",s&&(a.params.fillOverlaps=!0);let o=n.flatMap(l=>l.excludedCutouts||[]);return o.length&&(a.excludedCutouts=[...new Set(o)]),a.name="Merged solid",a}function sf(n,e,t){let i=[];for(let s=1;s<n.length;s++){let r=new D(...n[0].position),a=new D(...n[s].position),o=a.clone().sub(r),l=o.length();if(l<.05)continue;let c=new vt().setFromUnitVectors(new D(0,0,1),o.normalize()),h=new Et().setFromQuaternion(c,"ZYX"),d=t("cylinder",{diameter:e,h:l+e},r.add(a).multiplyScalar(.5).toArray(),"Connecting bridge");d.rotation=[h.x,h.y,h.z].map(Bt.radToDeg),d.layerId=We(n[0]),i.push(d)}return i}function Ox(n){if(n.length<2)return"Select at least two shapes to merge.";if(n.some(e=>!e.enabled))return"Merge needs visible shapes. Show hidden objects in the Objects panel first.";try{fl(n)}catch(e){return e.message}return n.some(e=>e.mode==="cut")?"Merge joins solid shapes; cutouts already subtract on their layer.":""}function rf(n,e){let t=a=>document.getElementById(a),i=(a,o)=>a&&o&&[0,1,2].every(l=>a.min[l]<=o.max[l]&&a.max[l]>=o.min[l]),s=a=>n.parts().find(o=>o.userData.id===a)?.userData.bounds;function r(a){let o=n.project(),l=a.map(f=>o.objects.find(x=>x.id===f)).filter(Boolean),c=Ox(l);if(c)return n.toast(c,!0),!1;let h=We(l[0]),d=()=>n.project().objects.filter(f=>We(f)===h),u=new Set(l.map(f=>f.id)),m=d().filter(f=>f.enabled&&f.mode==="cut"&&!u.has(f.id)&&l.some(x=>!s(x.id)||!s(f.id)||i(s(x.id),s(f.id))));return n.openSheet("Merge shapes",`<p class="subtle"><b>${n.escape(Vn(o,h))}</b> \xB7 Merge these ${l.length} selected shapes into one physically connected solid. Other layers are protected.</p><div class="metrics">${l.map((f,x)=>`${x+1}. ${n.escape(f.name)}`).join("<br>")}</div><p class="inlinehelp">Merged shapes fill overlapping holes and cutouts in the first shape. Holes outside the merged material remain.</p>${m.length?'<label class="toggle"><input type="checkbox" id="preserveCuts">Keep existing holes from overlapping Cutout shapes</label><p class="inlinehelp">Leave this off to fill cutout overlaps. Turn it on to preserve those holes.</p>':""}<label class="toggle"><input type="checkbox" id="addBridge">Add connecting bars if pieces are separated</label><div class="field"><label for="bridgeDiameter">Connecting bar diameter \xB7 mm</label><input id="bridgeDiameter" type="number" step="0.5" value="5" min="0.5"></div><div class="modalerror" id="mergeError"></div><button id="confirmMerge" class="full primary">Merge ${l.length} shapes</button>`,"MERGE"),t("confirmMerge").onclick=async()=>{let f=!!t("preserveCuts")?.checked,x=f?m:m.filter(E=>!l[0].excludedCutouts?.includes(E.id)),g=!f,p=t("addBridge").checked,T=Number(t("bridgeDiameter").value),R=t("confirmMerge"),b=t("mergeError");R.disabled=!0,R.textContent="Checking solid\u2026",b.textContent="",e.busy(!0);try{let E=structuredClone(l),S=await n.request("boolean",{operation:"add",objects:E,cutouts:structuredClone(x),fillOverlaps:g,tolerance:.03});if(S.count!==1){if(!p)throw Error("These pieces are separated. Overlap them, or enable connecting bars.");if(!(T>=.5&&T<=1e4))throw Error("Connecting bar diameter must be 0.5\u201310000 mm.");if(E.push(...sf(l,T,ni)),S=await n.request("boolean",{operation:"add",objects:E,cutouts:structuredClone(x),fillOverlaps:g,tolerance:.03}),S.count!==1)throw Error("The bars did not connect every piece. Increase their diameter or reposition the pieces.")}let P=nf(E,Xt(),S.bounds,x,g),y=new Set(x.filter(I=>!d().some(z=>z.enabled&&z.mode==="solid"&&!u.has(z.id)&&i(s(z.id),s(I.id)))).map(I=>I.id));m.length&&(P.excludedCutouts=[...new Set([...P.excludedCutouts||[],...m.map(I=>I.id)])]);let A=structuredClone(n.project()),L=A.objects.findIndex(I=>u.has(I.id));A.objects=A.objects.filter(I=>!u.has(I.id)&&!y.has(I.id)),A.objects.splice(Math.min(L,A.objects.length),0,P),Yt(A),e.busy(!1),n.change(()=>{n.project().objects=A.objects}),e.setIds([P.id]),n.closeSheet(),n.toast("Shapes merged into one connected solid on "+Vn(n.project(),h)+".")}catch(E){b.textContent=E.message,R.disabled=!1,R.textContent=`Merge ${l.length} shapes`}finally{e.busy(!1),n.autosave()}},!0}return{mergeMenu:r}}function af(n){let{canvas:e,scene:t,camera:i,controls:s}=n,r=M=>document.getElementById(M),a="select",o="XY",l=!0,c=.1,h=null,d="shape",u=[],m=new Set,f=null,x=!1,g=null,p=!1,T=null,R=null,b=new Ur,E=[],S=[],P=[],y=new Nn,A=0;t.add(y);let L=()=>n.current(),I=()=>n.project(),z=()=>n.parts(),W=M=>new D(...M),O=M=>{let w=e.getBoundingClientRect(),Y=M.clone().project(i);return new Fe((Y.x+1)*w.width/2+w.left,(1-Y.y)*w.height/2+w.top)};function k(M){let w=e.getBoundingClientRect();b.setFromCamera(new Fe((M.clientX-w.left)/w.width*2-1,-(M.clientY-w.top)/w.height*2+1),i)}function Q(M){for(;M.children.length;){let w=M.children[0];M.remove(w),w.geometry?.dispose(),Array.isArray(w.material)?w.material.forEach(Y=>Y.dispose()):w.material?.dispose()}}function $(M){return z().find(w=>w.userData.id===M)}function re(M){return $(M)?.userData.topology}function j(){r("touchModes").querySelectorAll("button").forEach(M=>M.classList.toggle("active",M.dataset.mode===a))}function ae(M,w=!1){f||x||(a=M,R=null,w||(h=null,d="shape"),a!=="round"&&(u=[]),a!=="select"&&me(),j(),ee(),Ue())}function ee(){let M=L();r("axisTools").hidden=a!=="move",r("snapStatus").textContent=l?"Snap on":"Snap off",r("snapStatus").classList.toggle("active",l),r("touchHint").textContent={select:"Tap a face \xB7 double-tap for the whole shape \xB7 tap an edge to round",move:"Drag the object or X/Y/Z handles \xB7 centers snap",stretch:"Tap a face to pull \xB7 double-tap for the whole shape",round:"Edge taps: 1 edge \xB7 2 face perimeter \xB7 3 all edges \xB7 drag to round"}[a],a==="select"&&(r("touchHint").textContent+=" \xB7 long-press or Ctrl/Shift-tap to multi-select"),r("touchAction").hidden=!M,r("touchAction").innerHTML=a==="select"&&m.size>1?`<span>${m.size} objects selected</span><button id="multiMerge">Merge</button>`:a==="round"?`<span>${u.length?(u.length===re(M?.id)?.edges.length?"All ":"")+u.length+" edge"+(u.length===1?"":"s"):"Choose an edge"}</span><button id="roundAll">Face perimeter</button><button id="roundShape">All edges</button><button id="roundSet">Radius</button>`:a==="stretch"?`<span>${h?wn[h.axis]+" face selected":"Choose a face"}</span><button id="stretchSize">Set size</button>`:a==="move"&&M?`<span>${wn.map((w,Y)=>w+" "+(M.placement||M.position)[Y].toFixed(1)).join(" \xB7 ")}</span><button id="alignNow">Align centers</button>`:`<span>${d==="face"?"Face selected":"Whole shape selected"}</span><button id="selectMove">Move</button><button id="selectStretch">Stretch</button><button id="selectRound">Round</button>`,a==="round"&&M&&!re(M.id)?r("touchHint").textContent="Mesh edges cannot use CAD roundovers; round the original parametric parts first":a==="round"&&M&&re(M.id)?.edges.length===0&&(r("touchHint").textContent="This shape has no sharp edges to round"),r("multiMerge")&&(r("multiMerge").onclick=()=>te.mergeMenu([...m])),r("roundAll")&&(r("roundAll").onclick=()=>wt()),r("roundShape")&&(r("roundShape").onclick=()=>{R=null,Xe()}),r("roundSet")&&(r("roundSet").onclick=he),r("stretchSize")&&(r("stretchSize").onclick=K),r("alignNow")&&(r("alignNow").onclick=se),r("selectMove")&&(r("selectMove").onclick=()=>ae("move")),r("selectStretch")&&(r("selectStretch").onclick=()=>ae("stretch",d==="face")),r("selectRound")&&(r("selectRound").onclick=()=>ae("round"))}function Le(M){let w=new Tt;return w.setAttribute("position",new Lt(M.vertices,3)),w.setIndex(new Lt(M.triangles,1)),w}function Ie(){h?.id!==n.selected()?(h=null,d="shape",u=[]):h.index>=0&&!re(h.id)?.groups.some(M=>M.face===h.index)&&(h=null,d="shape",u=[]);for(let M of E)M.geometry.dispose(),M.material.dispose();E=[];for(let M of z()){let w=I().objects.find(De=>De.id===M.userData.id);if(!w)continue;let Y=Wi(w).invert(),X=M.geometry.attributes.position.array,ie=[1/0,1/0,1/0],ge=[-1/0,-1/0,-1/0];for(let De=0;De<X.length;De+=3){let Pt=new D(X[De],X[De+1],X[De+2]).applyMatrix4(Y);for(let ht=0;ht<3;ht++)ie[ht]=Math.min(ie[ht],Pt.getComponent(ht)),ge[ht]=Math.max(ge[ht],Pt.getComponent(ht))}w.localBounds={min:ie,max:ge};let ze=M.userData.topology;if(ze){let De=new Mt(Le(ze),tn("basic",Qt,{side:Ot}));De.matrix.copy(Wi(w)),De.matrixAutoUpdate=!1,De.updateMatrixWorld(!0),De.userData={id:w.id,topology:ze},E.push(De)}}m=new Set([...m].filter(M=>I().objects.some(w=>w.id===M))),ee(),Ue()}function st(M){return i.position.distanceTo(s.target)*Math.tan(Bt.degToRad(i.fov/2))*2/(e.clientHeight||500)*M}function Ue(){if(f?.moved)return;Q(y),Kd(),S=[],P=[];let M=L();if(!M)return;if(m.size>1)for(let Y of m){let X=$(Y);if(!X)continue;let ie=X.userData.mode==="cut"?16758383:7856850,ge=new Mt(X.geometry.clone(),tn("basic",Qt,{color:ie,depthTest:!1,depthWrite:!1,transparent:!0,opacity:.28,side:Ot}));ge.userData.multiId=Y,ge.renderOrder=7,y.add(ge);let ze=new Kn(new es(X.geometry,15),tn("line",Sn,{color:ie,depthTest:!1,transparent:!0,opacity:.95}));ze.renderOrder=8,y.add(ze)}if(a==="move"||l&&a==="select")for(let Y of I().objects.filter(X=>X.enabled))for(let X of yl(Y,re(Y.id))){if(X.kind==="axis")continue;let ie=new Mt(uh(zs,st(X.kind==="center"?4.5:3),10,8),tn("basic",Qt,{color:Y.id===M.id?12124142:8759736,depthTest:!1,transparent:!0,opacity:Y.id===M.id?.9:.45}));ie.position.set(...X.point),ie.renderOrder=12,y.add(ie),S.push({...X,id:Y.id})}if(a==="move"){let Y=W(fi(M)),X=st(52);for(let ie=0;ie<3;ie++){let ge=new D;ge.setComponent(ie,1);let ze=Y.clone().addScaledVector(ge,X),De=[16747909,10741392,8634111][ie],Pt=new Bs(ir(fh,()=>new Tt().setFromPoints([Y,ze])),tn("line",Sn,{color:De,depthTest:!1}));Pt.renderOrder=15,y.add(Pt);let ht=new Mt(uh(zs,st(7),12,8),tn("basic",Qt,{color:De,depthTest:!1}));ht.position.copy(ze),ht.renderOrder=15,y.add(ht),P.push({axis:wn[ie],point:ze})}}let w=re(M.id);if(a==="round"&&w)for(let Y of w.edges){let X=new Tt;X.setAttribute("position",new St(Y.points,3));let ie=new Kn(X,tn("line",Sn,{color:u.includes(Y.index)?16759920:6524054,depthTest:!u.includes(Y.index),transparent:!0,opacity:u.includes(Y.index)?1:.4}));ie.matrix.copy(Wi(M)),ie.matrixAutoUpdate=!1,ie.renderOrder=10,y.add(ie)}if(d==="face"&&h){let Y=w?.groups.find(ie=>ie.face===h.index),X;if(Y?(X=Le(w),X.setDrawRange(Y.start,Y.count)):!w&&Number.isInteger(h.triangle)&&(X=$(M.id)?.geometry.clone(),X?.setDrawRange(h.triangle*3,3)),X){let ie=new Mt(X,tn("basic",Qt,{color:16764803,transparent:!0,opacity:.3,side:Ot,depthTest:!1,depthWrite:!1}));w&&(ie.matrix.copy(Wi(M)),ie.matrixAutoUpdate=!1),ie.userData.faceId=h.index,ie.renderOrder=9,y.add(ie)}}if(a==="select"&&d==="shape"){let Y=$(M.id);if(Y){let X=new Mt(ir(fh,()=>Y.geometry.clone()),tn("basic",Qt,{color:10154191,transparent:!0,opacity:.18,side:Ot,depthTest:!1,depthWrite:!1}));X.userData.wholeId=M.id,X.renderOrder=8,y.add(X)}}}function nt(M){k(M);let w=z().filter(X=>I().objects.some(ie=>ie.id===X.userData.id&&We(ie)===I().activeLayer)&&(X.userData.mode==="solid"||X.userData.id===n.selected()||m.has(X.userData.id)));w.forEach(X=>X.updateMatrixWorld(!0));let Y=new Set;return b.intersectObjects(w,!1).filter(X=>{let ie=X.object.userData.id;return Y.has(ie)?!1:(Y.add(ie),!0)})}function J(M){return nt(M)[0]||null}function oe(M,w){return k(M),b.intersectObjects(E.filter(Y=>Y.userData.id===w),!1)[0]||null}function Se(M,w){let Y=oe({clientX:M.sx,clientY:M.sy},w.id),X=re(w.id),ie=-1,ge;Y&&X?(ie=X.groups.find(Pt=>Y.faceIndex*3>=Pt.start&&Y.faceIndex*3<Pt.start+Pt.count)?.face??-1,ge=Y.face.normal.clone()):ge=M.face.normal.clone().applyQuaternion(new vt().setFromEuler(new Et(...w.rotation.map(Bt.degToRad),"ZYX")).invert());let ze=xl(w,ge.toArray());return{id:w.id,index:ie,triangle:M.faceIndex,...ze,normal:ge.toArray()}}function Be(M,w,Y){let X=re(w.id);if(!X)return null;let ie=X.edges;if(Y){let ht=Se({...Y,sx:M.clientX,sy:M.clientY},w),nn=X.faces[ht.index]?.edges;nn&&(ie=ie.filter(Rn=>nn.includes(Rn.index)))}let ge=new Fe(M.clientX,M.clientY),ze=Wi(w),De=null,Pt=16;for(let ht of ie)for(let nn=0;nn+5<ht.points.length;nn+=6){let Rn=O(new D(...ht.points.slice(nn,nn+3)).applyMatrix4(ze)),qi=O(new D(...ht.points.slice(nn+3,nn+6)).applyMatrix4(ze)),sn=qi.clone().sub(Rn),hr=Math.max(0,Math.min(1,ge.clone().sub(Rn).dot(sn)/(sn.lengthSq()||1))),ur=ge.distanceTo(Rn.addScaledVector(sn,hr));ur<Pt&&(Pt=ur,De=ht.index)}return De}function be(M,w){return Math.max(0,...(M.fillets||[]).filter(Y=>Y.edges.some(X=>w.includes(X))).map(Y=>Y.radius))}function Ge(M,w){let Y=re(M.id),X=i.position.clone().sub(W(fi(M))),ie=new Et(...M.rotation.map(Bt.degToRad),"ZYX"),ge=Y?.faces.filter(ze=>ze.edges.includes(w)).sort((ze,De)=>W(De.normal).applyEuler(ie).dot(X)-W(ze.normal).applyEuler(ie).dot(X))[0];return ge?{id:M.id,index:ge.index,...xl(M,ge.normal),normal:ge.normal}:null}function wt(){let M=re(n.selected());if(!M||!h||!M.faces[h.index])return n.toast("Tap an edge beside the face you want to round.");let w=new Set(M.edges.map(ie=>ie.index)),Y=M.faces[h.index],X=Y.loops?.find(ie=>ie.includes(u[0]))||Y.edges;d="edges",u=X.filter(ie=>w.has(ie)),ee(),Ue(),n.toast("All "+u.length+" edges around this face selected.")}function Xe(){let M=re(n.selected());if(!M)return n.toast("This shape has no CAD edges to round.");if(!M.edges.length)return n.toast("This shape has no sharp edges to round.");d="edges",u=M.edges.map(w=>w.index),h=h||Ge(L(),u[0]),a="round",j(),ee(),Ue(),n.toast("All "+u.length+" edges selected. Drag or set one radius for the whole shape.")}function it(M,w,Y,X){let ie=performance.now(),ze=R&&ie-R.time<420&&R.id===w&&R.kind===Y&&R.target===X&&Math.hypot(M.clientX-R.x,M.clientY-R.y)<28?R.count%(Y==="edge"?3:2)+1:1;return R={id:w,kind:Y,target:X,count:ze,time:ie,x:M.clientX,y:M.clientY},ze}function ct(M,w,Y,X){h=X,d="edges",a="round",u=[Y],j();let ie=it(M,w.id,"edge",Y);if(ie===3)return Xe();if(ie===2)return wt();ee(),Ue()}function $e(M){if(x)return;let w=J(M);if(["select","move","stretch"].includes(a)&&ue(M)){if(R=null,!w)return;let De=nt(M),Pt=de(),ht=De.find(nn=>!Pt.has(nn.object.userData.id))||De[0];Re(ht.object.userData.id);return}if(!w){if(a==="round"&&L()){let De=Be(M,L(),null);if(De!==null)return ct(M,L(),De,Ge(L(),De))}R=null,a==="select"&&xe();return}let Y=w.object.userData.id;n.select(Y);let X=L(),ie=Se({...w,sx:M.clientX,sy:M.clientY},X),ge=["round","select"].includes(a)?Be(M,X,w):null;if(ge!==null)return ct(M,X,ge,ie);let ze=it(M,Y,"face",ie.index>=0?ie.index:ie.triangle);if(u=[],ze===2){h=null,d="shape",a="select",j(),ee(),Ue(),n.toast("Whole shape selected. Choose Move, Stretch or Round.");return}h=ie,d="face",a==="round"&&(a="select",j()),ee(),Ue()}function mt(M){if(x)return null;let w=L();if(!w)return null;let Y=J(M),X=null;if(a==="move"&&(X=P.find(ge=>O(ge.point).distanceTo(new Fe(M.clientX,M.clientY))<18)),!X&&Y?.object.userData.id!==w.id&&!(a==="round"&&Be(M,w,null)!==null))return null;let ie={id:w.id,startX:M.clientX,startY:M.clientY,base:structuredClone(w),before:JSON.stringify(I()),moved:!1,mode:a,axis:X?.axis||o,preview:0,bottom:$(w.id)?.userData.bounds.min[2]??0};if(a==="stretch"){if(["joined","prefab"].includes(w.type)&&zi(w))return n.toast("Separate components to change thread length without changing pitch."),null;if(h=Se({...Y,sx:M.clientX,sy:M.clientY},w),Vt(w)&&h.axis!==2)return n.toast("Pull an end face to change thread length. Change diameter in Edit."),null;d="face",ie.axis=wn[h.axis],ie.sign=h.sign,ie.direction=rr(w,h.axis,h.sign)}if(a==="round"){let ge=Be(M,w,Y);if(ge===null)return null;Y&&(h=Se({...Y,sx:M.clientX,sy:M.clientY},w)),d="edges",u.includes(ge)||(u=[ge]),ie.radius=be(w,u),ie.edgeIndices=[...u]}return ie.origin=W(fi(w)),ie.units=st(1),ie.plane=new ln(new D(0,0,1),-ie.origin.z),k(M),ie.planeStart=b.ray.intersectPlane(ie.plane,new D),ie}function Rt(M,w,Y){let X=O(M.origin),ie=O(M.origin.clone().add(Y)),ge=ie.sub(X),ze=ge.length();return ze<.015?-(w.clientY-M.startY)*M.units:new Fe(w.clientX-M.startX,w.clientY-M.startY).dot(ge.normalize())/ze}function At(M,w=c){return w?Math.round(M/w)*w:M}function _t(M,w){if(!l)return M;let Y=w.axis==="XY"?[0,1]:[wn.indexOf(w.axis)],X=yl(M,re(M.id)),ie=I().objects.filter(De=>De.enabled&&De.id!==M.id).flatMap(De=>yl(De,re(De.id))),ge=null,ze=st(12);for(let De of X)for(let Pt of ie){if(De.kind==="center"&&Pt.kind!=="center")continue;let ht=Pt.point.map((qi,sn)=>qi-De.point[sn]),nn=ht.filter((qi,sn)=>!Y.includes(sn));if(Math.hypot(...nn)>st(3))continue;let Rn=Math.hypot(...ht);Rn<ze&&(ze=Rn,ge={delta:ht,a:De,b:Pt})}if(ge){for(let De of Y)M.position[De]+=ge.delta[De];r("liveMeasure").textContent="Snapped \xB7 "+ge.a.label+" to "+ge.b.label,w.snapped=!0}return M}function Ct(M){let w=f;if(!w||Math.hypot(M.clientX-w.startX,M.clientY-w.startY)<6&&!w.moved)return;R=null,w.moved||(Q(y),n.dragVisual?.()),w.moved=!0,w.snapped=!1;let X=structuredClone(w.base);if(w.mode==="move"){if(w.axis==="XY"){k(M);let ie=b.ray.intersectPlane(w.plane,new D);if(ie&&w.planeStart){let ge=ie.sub(w.planeStart);X.position[0]+=At(ge.x),X.position[1]+=At(ge.y)}else X.position[0]+=At((M.clientX-w.startX)*w.units),X.position[1]+=At(-(M.clientY-w.startY)*w.units)}else{let ie=wn.indexOf(w.axis),ge=new D;ge.setComponent(ie,1),X.position[ie]+=At(Rt(w,M,ge))}if(X=_t(X,w),I().buildPlaneEnabled){let ie=w.bottom+X.position[2]-w.base.position[2];ie<0&&(X.position[2]-=ie)}X.placement&&(X.placement=X.position.map((ie,ge)=>w.base.placement[ge]+ie-w.base.position[ge]))}else if(w.mode==="stretch"){let ie=At(Rt(w,M,w.direction));I().buildPlaneEnabled&&w.direction.z<-1e-6&&(w.base.type==="box"||w.axis==="Z"&&["rounded","cylinder","tube","threadrod","threadtube","polygon"].includes(w.base.type))&&(ie=Math.min(ie,Math.max(0,w.bottom)/-w.direction.z)),X=mh(w.base,wn.indexOf(w.axis),w.sign,ie)}else if(w.mode==="round"){let ie=Math.min(...Gi(w.base).filter(ze=>ze>.1))*.49,ge=Math.max(0,Math.min(ie,At(w.radius-(M.clientY-w.startY)*w.units,.05)));X=vl(w.base,w.edgeIndices,ge)}I().objects[I().objects.findIndex(ie=>ie.id===w.id)]=X,r("liveMeasure").hidden=!1,w.snapped||(r("liveMeasure").textContent=w.mode==="round"?`Roundover R ${be(X,w.edgeIndices).toFixed(2)} mm`:w.mode==="stretch"?Vt(X)?`Length ${(X.params.h/(X.params.units==="imperial"?25.4:1)).toFixed(3)} ${X.params.units==="imperial"?"in":"mm"} \xB7 ${(X.params.h/X.params.pitch).toFixed(2)} turns \xB7 ${X.params.units==="imperial"?(25.4/X.params.pitch).toFixed(2)+" TPI":X.params.pitch.toFixed(3)+" mm pitch"}`:`${w.axis}: ${Gi(X)[wn.indexOf(w.axis)].toFixed(2)} mm`:`X ${(X.placement||X.position)[0].toFixed(2)} \xB7 Y ${(X.placement||X.position)[1].toFixed(2)} \xB7 Z ${(X.placement||X.position)[2].toFixed(2)} mm`),performance.now()-w.preview>140&&(w.preview=performance.now(),n.refresh())}async function F(M=!1){let w=f;if(w){if(f=null,s.enabled=!0,!w.moved){ee(),Ue();return}if(M){Object.assign(I(),JSON.parse(w.before)),n.refresh(),r("liveMeasure").hidden=!0;return}x=!0,g=w.before,document.getElementById("app").classList.add("checking"),r("liveMeasure").textContent+=" \xB7 checking solid\u2026",r("touchModes").style.pointerEvents="none";try{Yt(I()),Hi(I(),await n.request("check",{project:structuredClone(I()),tolerance:.15})),n.record(w.before),n.refresh(),n.toast(w.mode==="round"?"Roundover applied.":w.snapped?"Centers snapped.":"Dimensions updated.")}catch(Y){Object.assign(I(),JSON.parse(w.before)),n.refresh(),n.toast(Y.message,!0)}finally{x=!1,g=null,n.autosave(),document.getElementById("app").classList.remove("checking"),r("touchModes").style.pointerEvents="",setTimeout(()=>r("liveMeasure").hidden=!0,1600),ee(),Ue()}}}let rt=null,Ke=new Set,C=!1,_=null,B=!1,V=null,Z=5;function ce(M){if(clearTimeout(_),B=!1,a!=="select"||ue(M))return;let w={clientX:M.clientX,clientY:M.clientY};_=setTimeout(()=>{if(!rt||C||f||x)return;let Y=nt(w);if(!Y.length)return;B=!0,R=null;let X=de(),ie=Y.find(ge=>!X.has(ge.object.userData.id))||Y[0];Re(ie.object.userData.id)},450)}e.addEventListener("pointerdown",M=>{if(p)return;let w=globalThis.AvalonDesktop&&M.pointerType==="mouse";if(w&&M.button!==0){R=null,rt=null;return}if(Ke.add(M.pointerId),Ke.size>1){R=null,C=!0,f&&(F(!0),T&&globalThis.PointerEvent&&(p=!0,e.dispatchEvent(new PointerEvent("pointerdown",{...T,bubbles:!0})),p=!1));return}if(T={pointerId:M.pointerId,pointerType:M.pointerType||"touch",clientX:M.clientX,clientY:M.clientY,buttons:1,isPrimary:!0},rt={x:M.clientX,y:M.clientY,t:performance.now()},ce(M),w&&ue(M)){V={event:{...T,button:0,ctrlKey:M.ctrlKey,metaKey:M.metaKey,shiftKey:M.shiftKey},panned:!1},M.stopImmediatePropagation();return}if(V=null,["move","stretch","round"].includes(a)){let Y=mt(M);Y&&(f=Y,s.enabled=!1,e.setPointerCapture?.(M.pointerId),M.stopImmediatePropagation(),M.preventDefault(),ee(),Ue())}},!0),e.addEventListener("pointermove",M=>{rt&&Math.hypot(M.clientX-rt.x,M.clientY-rt.y)>=9&&clearTimeout(_),V&&!V.panned&&rt&&Math.hypot(M.clientX-rt.x,M.clientY-rt.y)>=Z&&(V.panned=!0,R=null,globalThis.PointerEvent&&(p=!0,e.dispatchEvent(new PointerEvent("pointerdown",{...V.event,bubbles:!0})),p=!1)),f&&(M.stopImmediatePropagation(),M.preventDefault(),Ct(M))},!0),e.addEventListener("pointerup",M=>{if(Ke.delete(M.pointerId),clearTimeout(_),B){B=!1,R=null,Ke.size||(rt=null,C=!1);return}let w=rt&&!C&&!V?.panned&&performance.now()-rt.t<600&&Math.hypot(M.clientX-rt.x,M.clientY-rt.y)<9;if(V=null,f){let Y=f.moved;F(),M.stopImmediatePropagation(),!Y&&w?$e(M):R=null}else w?$e(M):R=null;Ke.size||(rt=null,C=!1)},!0),e.addEventListener("pointercancel",M=>{clearTimeout(_),V=null,B=!1,R=null,Ke.delete(M.pointerId),F(!0),Ke.size||(C=!1,rt=null)},!0);function he(){if(!L()||!u.length)return n.toast("Tap an edge first.");n.openSheet("Round selected edges",`<p class="subtle">${u.length} selected edge(s). Drag up/down in Round mode for live adjustment, or enter an exact radius.</p><div class="field"><label for="exactRadius">Radius \xB7 mm</label><input id="exactRadius" type="number" step="0.1" min="0" value="${be(L(),u).toFixed(2)}"></div><div class="modalerror" id="radiusError"></div><button id="applyRadius" class="full primary">Apply roundover</button><button id="removeRadius" class="full">Remove selected roundovers</button>`),r("applyRadius").onclick=async()=>{let M=Number(r("exactRadius").value);if(!Number.isFinite(M)||M<0)return r("radiusError").textContent="Enter a non-negative radius.";let w=vl(L(),u,M),Y=structuredClone(I());Y.objects[Y.objects.findIndex(X=>X.id===w.id)]=w,r("applyRadius").disabled=!0;try{Hi(Y,await n.request("check",{project:Y,tolerance:.15})),Object.assign(w,Y.objects.find(X=>X.id===w.id)),n.change(()=>{I().objects[I().objects.findIndex(X=>X.id===w.id)]=w}),n.closeSheet(),n.toast("Roundover applied.")}catch(X){r("radiusError").textContent=X.message,r("applyRadius").disabled=!1}},r("removeRadius").onclick=()=>{let M=vl(L(),u,0);n.change(()=>I().objects[I().objects.findIndex(w=>w.id===M.id)]=M),n.closeSheet()}}function K(){if(!L()||!h)return n.toast("Tap a face in Stretch mode first.");let M=L();if(["joined","prefab"].includes(M.type)&&zi(M))return n.toast("Separate components to change thread length without changing pitch.");if(Vt(M)&&h.axis!==2)return n.toast("Pull an end face to change thread length. Change diameter in Edit.");let w=Gi(M)[h.axis],Y=Vt(M)&&M.params.units==="imperial"?25.4:1,X=Y===25.4?"in":"mm";n.openSheet("Pull selected face",`<p class="subtle">The opposite side stays fixed. Adjust the ${wn[h.axis]} dimension by moving this face.</p><div class="field"><label for="exactSize">New ${wn[h.axis]} dimension \xB7 ${X}</label><input id="exactSize" type="number" step="0.1" value="${(w/Y).toFixed(6)}"></div><button id="applySize" class="full primary">Apply dimension</button>`),r("applySize").onclick=async()=>{let ie=Number(r("exactSize").value)*Y;if(!(ie>=.05&&ie<=1e4))return n.toast("Dimension must be 0.05\u201310000 mm.",!0);let ge=mh(M,h.axis,h.sign,ie-w),ze=structuredClone(I());ze.objects[ze.objects.findIndex(De=>De.id===M.id)]=ge;try{Hi(ze,await n.request("check",{project:ze,tolerance:.15})),Object.assign(ge,ze.objects.find(De=>De.id===ge.id))}catch(De){return n.toast(De.message,!0)}n.change(()=>I().objects[I().objects.findIndex(De=>De.id===M.id)]=ge),n.closeSheet()}}function se(){let M=L(),w=I().objects.filter(Y=>Y.id!==M.id&&Y.enabled);if(!w.length)return n.toast("Add another shape to align with.");n.openSheet("Snap shapes together",`<p class="subtle">Match exact centers, or place this shape against another shape's face. Face attachment includes a 0.02 mm overlap so touching pieces can be added into one solid.</p><div class="field"><label for="snapTarget">Target shape</label><select id="snapTarget">${w.map(Y=>`<option value="${Y.id}">${n.escape(Y.name)}</option>`).join("")}</select></div><div class="field" style="margin-top:12px"><label for="snapPlacement">Placement</label><select id="snapPlacement"><option value="center">Center to center</option><option value="z+" selected>On target's top face \xB7 Z+</option><option value="z-">On target's bottom face \xB7 Z\u2212</option><option value="x+">Against target's X+ face</option><option value="x-">Against target's X\u2212 face</option><option value="y+">Against target's Y+ face</option><option value="y-">Against target's Y\u2212 face</option></select></div><label class="toggle"><input type="checkbox" id="matchRotation" checked>Match the target shape's orientation</label><button id="doSnap" class="full primary">Snap into place</button>`),r("doSnap").onclick=()=>{let Y=w.find(ze=>ze.id===r("snapTarget").value),X=r("snapPlacement").value,ie=structuredClone(M);r("matchRotation").checked&&(ie.rotation=[...Y.rotation]);let ge;if(X==="center")ge=ef(ie,Y);else{let ze="xyz".indexOf(X[0]),De=X[1]==="+"?1:-1;ge=tf(ie,ze,-De,Y,ze,De)}n.change(()=>I().objects[I().objects.findIndex(ze=>ze.id===M.id)]=ge),n.closeSheet(),n.toast("Shapes aligned.")}}function ue(M){return!!(M?.ctrlKey||M?.metaKey||M?.shiftKey)}function Ce(M){Ve=!0;try{n.select(M)}finally{Ve=!1}}function me(){m.clear()}function de(){return new Set(m.size?m:n.selected()?[n.selected()]:[])}function Re(M){if(!(x||f||!I().objects.find(Y=>Y.id===M))){if(!m.size&&n.selected()&&m.add(n.selected()),m.has(M)?m.delete(M):m.add(M),h=null,d="shape",u=[],R=null,a!=="select"&&(a="select",j()),Ce(m.size?[...m].at(-1):null),m.size===1){let Y=[...m][0];m.clear(),Ce(Y)}ee(),Ue()}}function Ne(M){if(x)return;let w=[...new Set(M)].filter(Y=>I().objects.some(X=>X.id===Y));m=new Set(w.length>1?w:[]),h=null,d="shape",u=[],R=null,a="select",Ce(w.at(-1)??null),j(),ee(),Ue()}let Ve=!1,N=[];function fe(M){x=M,document.getElementById("app").classList.toggle("checking",M),r("sheet").classList.toggle("checking",M),M?(N=[...r("sheet").querySelectorAll("button,input,select")].filter(w=>w.id!=="confirmMerge").map(w=>[w,w.disabled]),N.forEach(([w])=>w.disabled=!0)):(N.forEach(([w,Y])=>{w.isConnected&&(w.disabled=Y)}),N=[])}let te=rf(n,{setIds:Ne,busy:fe});r("touchModes").querySelectorAll("button").forEach(M=>M.onclick=()=>ae(M.dataset.mode)),r("axisTools").querySelectorAll("[data-axis]").forEach(M=>M.onclick=()=>{o=M.dataset.axis,document.querySelectorAll("[data-axis]").forEach(w=>w.classList.toggle("active",w.dataset.axis===o))}),r("snapStatus").onclick=()=>{l=!l,ee(),Ue()},r("dragStep").onchange=()=>c=Number(r("dragStep").value);function pe(M){return sr(M)}function xe(){f||x||(m.clear(),h=null,d="shape",u=[],R=null,a="select",r("liveMeasure").hidden=!0,n.select(null),j(),ee(),Ue())}function le(){Ve||m.clear(),h?.id!==n.selected()&&(h=null,d="shape",u=[]),R?.id!==n.selected()&&(R=null),ee(),Ue()}return s.addEventListener("change",()=>{if(f)return;let M=performance.now();M-A>80&&(A=M,Ue())}),ee(),{snapshotForSave:()=>f?.before||g||JSON.stringify(I()),onModel:Ie,selectionChanged:le,placeNew:pe,isDragging:()=>!!f,isCommitting:()=>x,setMode:ae,deselect:xe,selectFace:(M,w)=>{n.select(M);let Y=re(M)?.faces[w];Y&&(h={id:M,index:w,...xl(L(),Y.normal)},d="face",a="stretch",R=null,j(),ee(),Ue())},selectEdges:(M,w)=>{n.select(M),u=w,h=Ge(L(),w[0]),d="edges",a="round",R=null,j(),ee(),Ue()},pointScreen:M=>O(W(M)).toArray(),getState:()=>({mode:a,axis:o,selection:d,face:h,edges:u,multi:[...m],highlighted:y.children.filter(M=>M.userData.multiId).map(M=>M.userData.multiId),highlightedFaces:y.children.filter(M=>M.userData.faceId!==void 0).map(M=>M.userData.faceId),wholeHighlighted:y.children.some(M=>M.userData.wholeId===n.selected()),snap:l}),setMulti:Ne,toggleMulti:Re,multi:()=>[...m],mergeMenu:M=>te.mergeMenu(M??[...m]),radiusMenu:he,snapMenu:se}}var Bx=450;function of(n){let e=f=>document.getElementById(f),t=e("objectsPanel"),i=e("objectsToggle"),s=e("objectsList"),r=e("objectsActions"),a=!1,o=null,l=!1;function c(f=!a){a=!!f,t.hidden=!a,i.setAttribute("aria-expanded",String(a)),i.classList.toggle("active",a),a&&d()}function h(f){let x=f.mode==="cut",g=n.escape;return`<div class="objectsrow${f.enabled?"":" hiddenobj"}" role="treeitem" aria-selected="false" data-row="${g(f.id)}"><button class="rowmain" data-select="${g(f.id)}">${g(f.name)}<small>${g(as[f.type]||f.type)}${f.enabled?"":" \xB7 hidden"}</small></button><span class="badge ${x?"subtract":"add"}">${x?"\u2212 Subtract":"\uFF0B Add"}</span><button class="rowicon" data-eye="${g(f.id)}" aria-label="${f.enabled?"Hide":"Show"} ${g(f.name)}" aria-pressed="${f.enabled}">${f.enabled?"\u25C9":"\u25CB"}</button><button class="rowicon" data-props="${g(f.id)}" aria-label="Properties of ${g(f.name)}">\u2699</button></div>`}function d(){if(!a)return;let f=n.project(),x=n.escape;s.innerHTML=f.objects.length?f.layers.map(g=>{let p=f.objects.filter(T=>We(T)===g.id);return`<div class="layerhead${g.id===f.activeLayer?" active":""}" role="presentation"><b>${x(g.name)}</b><small>${p.length}${g.id===f.activeLayer?" \xB7 active":""}</small></div>${p.map(h).join("")}`}).join(""):'<p class="subtle">No objects yet. Add a shape to start.</p>',u()}function u(){let f=n.selection(),x=new Set(f),g=n.selected();for(let p of s.querySelectorAll("[data-row]")){let T=x.has(p.dataset.row);p.classList.toggle("selected",T),p.classList.toggle("primary",T&&p.dataset.row===g),p.setAttribute("aria-selected",String(T))}r.hidden=f.length<2,e("objectsSelCount").textContent=f.length+" objects selected",a&&g&&[...s.querySelectorAll("[data-row]")].find(T=>T.dataset.row===g)?.scrollIntoView?.({block:"nearest"})}let m=f=>f?.closest?.("[data-select],[data-eye],[data-props]");s.addEventListener("click",f=>{let x=m(f.target);if(x){if(x.dataset.select!==void 0){if(l){l=!1;return}let g=x.dataset.select;f.ctrlKey||f.metaKey||f.shiftKey?n.toggleMulti(g):(n.deselect(),n.select(g));return}if(x.dataset.eye!==void 0){let g=x.dataset.eye;n.change(()=>{let p=n.project().objects.find(T=>T.id===g);p&&(p.enabled=!p.enabled)});return}x.dataset.props!==void 0&&(n.deselect(),n.select(x.dataset.props),n.editMenu())}}),s.addEventListener("pointerdown",f=>{let x=f.target.closest?.("[data-select]");clearTimeout(o),l=!1,!(!x||f.ctrlKey||f.metaKey||f.shiftKey)&&(o=setTimeout(()=>{l=!0,n.toggleMulti(x.dataset.select)},Bx))});for(let f of["pointerup","pointercancel","pointerleave"])s.addEventListener(f,()=>clearTimeout(o));s.addEventListener("contextmenu",f=>{f.target.closest?.("[data-select]")&&f.preventDefault()});for(let f of[t,i])for(let x of["pointerdown","pointermove","pointerup","pointercancel","wheel","touchstart","touchmove","touchend","click","dblclick"])f.addEventListener(x,g=>g.stopPropagation());return i.addEventListener("click",()=>c()),e("objectsAdd").addEventListener("click",()=>n.addMenu()),e("objectsMerge").addEventListener("click",()=>n.mergeMenu(n.selection())),e("objectsPrefab").addEventListener("click",()=>n.createPrefab()),{toggle:c,render:d,selectionChanged:u,isOpen:()=>a}}function lf(n){return Zr.includes(n.type)&&(n.resolution={mode:"tolerance",tolerance:.005}),n}function gh(n){if(!n)return"Face counts appear after the shape is built.";let e=n.geometry?n.geometry.index.count/3:n.triangles.length/3,t=n.userData?.topology||n.topology;if(!t)return`${e.toLocaleString()} triangle faces`;let i=t.faceCount-t.flatFaces;return`${t.faceCount.toLocaleString()} ${i?"surface":"flat"} faces \xB7 ${e.toLocaleString()} mesh triangles`}function cf(n,e){let t=`<div class="metrics" id="faceCountMetrics">${gh(e)}<small>Counts for this shape before global cutouts. STL uses triangles to represent polygon and curved faces.</small></div>`;if(!Zr.includes(n.type))return`<div class="sectionlabel">Number of faces</div>${t}`;let i=n.resolution?.mode||"auto",s=n.resolution?.count||(n.type==="rounded"?8:32),r=n.resolution?.tolerance||.03,a=n.type==="sphere",o=n.type==="rounded";return`<div class="sectionlabel">Face resolution</div><div class="field"><label for="faceResolution">Surface mode</label><select id="faceResolution"><option value="auto" ${i==="auto"?"selected":""}>Smooth \xB7 use STL export quality</option><option value="tolerance" ${i==="tolerance"?"selected":""}>Smooth \xB7 custom face resolution</option>${Vt(n)?"":`<option value="faces" ${i==="faces"?"selected":""}>Faceted \xB7 set ${a?"number of faces":o?"corner segments":"number of sides"}</option>`}</select></div><div id="resolutionFaces" ${i==="faces"?"":"hidden"}><div class="field"><label for="resolutionCount">${a?"Number of flat faces":o?"Segments per rounded corner":"Number of sides around the shape"}</label><input id="resolutionCount" type="number" step="1" inputmode="numeric" min="${a?4:o?1:3}" max="${o?128:512}" value="${s}"></div><div class="resolutionpresets">${(a?[4,6,8,12,20,32,64,128]:o?[1,2,4,8,16]:[3,4,6,8,12,24,64]).map(l=>`<button type="button" data-face-preset="${l}">${l}</button>`).join("")}</div><p class="inlinehelp" id="resolutionHint"></p></div><div id="resolutionSmooth" ${i==="tolerance"?"":"hidden"}><div class="field"><label for="resolutionTolerance">Face resolution \xB7 maximum curve deviation (mm)</label><input id="resolutionTolerance" type="number" inputmode="decimal" step="0.005" min="0.005" max="2" value="${r}"></div><p class="inlinehelp">Smaller values make curves smoother and increase triangle count. This setting applies to preview and STL export for this shape.</p></div>${t}`}function hf(n,e){if(!e("faceResolution"))return;let t=()=>{let i=e("faceResolution").value;e("resolutionFaces").hidden=i!=="faces",e("resolutionSmooth").hidden=i!=="tolerance";let s=Number(e("resolutionCount").value);e("resolutionHint").textContent=n.type==="sphere"?`${s} flat polygon faces. Six gives a cube; larger counts approximate a sphere. Diameter is the largest overall width. The chosen facets stay in STL at every export quality.`:n.type==="rounded"?"Choose 1\u2013128 flat segments per corner. The chosen corners stay faceted in STL.":"Choose 3\u2013512 sides around the shape. End faces are additional. These sides stay in STL at every export quality."};e("faceResolution").onchange=t,e("resolutionCount").oninput=t,document.querySelectorAll("[data-face-preset]").forEach(i=>i.onclick=()=>{e("faceResolution").value="faces",e("resolutionCount").value=i.dataset.facePreset,t()}),t()}function uf(n,e){if(!e("faceResolution"))return n.resolution;let t=e("faceResolution").value;return t==="faces"?{mode:t,count:Number(e("resolutionCount").value)}:t==="tolerance"?{mode:t,tolerance:Number(e("resolutionTolerance").value)}:{mode:"auto"}}function df(n,e){let t=i=>i.resolution?.mode==="faces"?i.resolution.count:0;return t(n)===t(e)}function kx(n,e,t=!1,i){let s=n instanceof Float32Array?n:new Float32Array(n),r=e;if(s.length%3||r.length%3||s.some(f=>!Number.isFinite(f))||r.some(f=>!Number.isInteger(f)||f<0||f>=s.length/3)||i?.length&&i.length!==r.length/3||ArrayBuffer.isView(t)&&t.length&&t.length!==r.length/3)throw Error("Invalid display mesh.");let a=new Float32Array(r.length*3),o=new Float32Array(a.length),l=new Float64Array(r.length),c=new Map,h=[],d=new Uint32Array(s.buffer,s.byteOffset,s.length),u=f=>{let x=Math.hypot(...f)||1;return f.map(g=>g/x)};for(let f=0;f<r.length/3;f++){let x=r[f*3]*3,g=r[f*3+1]*3,p=r[f*3+2]*3,T=[0,1,2].map(b=>s[p+b]-s[g+b]),R=[0,1,2].map(b=>s[x+b]-s[g+b]);l.set(u([T[1]*R[2]-T[2]*R[1],T[2]*R[0]-T[0]*R[2],T[0]*R[1]-T[1]*R[0]]),f*3);for(let b=0;b<3;b++){let E=r[f*3+b]*3,S=[0,1,2].map(y=>s[E+y]===0?0:d[E+y]).concat(i?.[f]||0).join(","),P=c.get(S);P||(P=[],c.set(S,P)),P.push(f),h.push(P)}}let m=Math.cos(Math.PI/6);for(let f=0;f<r.length/3;f++)for(let x=0;x<3;x++){let g=f*9+x*3,p=r[f*3+x]*3,T=Array.from(l.subarray(f*3,f*3+3));a.set(s.subarray(p,p+3),g);let R=T;if(t!==!0&&!t?.[f]){let b=[0,0,0];for(let E of h[f*3+x]){let S=E*3;if(T.reduce((P,y,A)=>P+y*l[S+A],0)>m)for(let P=0;P<3;P++)b[P]+=l[S+P]}R=u(b)}o.set(R,g)}return{positions:a,normals:o}}function ff(n,e,t=!1,i,s){let r=i||kx(n,e,t,s);if(r.positions.length!==e.length*3||r.normals.length!==r.positions.length)throw Error("Invalid prepared display mesh.");let a=new Tt;return a.setAttribute("position",new Lt(r.positions,3)),a.setAttribute("normal",new Lt(r.normals,3)),a}function pf({meta:n,nums:e,typed:t}){let i=s=>{if(Array.isArray(s))return s.map(i);if(s&&typeof s=="object"){if("$a"in s)return Array.from(e.subarray(s.$a[0],s.$a[0]+s.$a[1]));if("$t"in s)return t[s.$t];if("$u"in s)return;if("$x"in s)return s.$x==="-0"?-0:Number(s.$x);for(let r in s)s[r]=i(s[r]);return s}return s};return i(JSON.parse(new TextDecoder().decode(n)))}function mf({keep:n=256}={}){let e=new Map,t=new Set;return{map:e,outgoing(i){return i.type!=="preview"?i:(t.add(i.id),{...i,topologyAck:[...e.keys()]})},incoming(i){for(let a of i.topologies||[])e.set(a.hash,pf(a));delete i.topologies;let s=t.delete(i.id),r=new Set;for(let a of i.parts||[])if(a.topologyHash){let o=e.get(a.topologyHash);o&&(e.delete(a.topologyHash),e.set(a.topologyHash,o)),a.topology=o||null,r.add(a.topologyHash)}if(s&&!t.size)for(let a of e.keys()){if(e.size<=Math.max(n,r.size))break;r.has(a)||e.delete(a)}return i},reset(){t.clear()}}}var zx=1e-9,Vx=1e3;function gf({renderer:n,scene:e,camera:t,controls:i}){let s=0,r=0,a=new Float64Array(10),o=new Float64Array(10),l=u=>{let m=t.position,f=t.quaternion,x=i.target;u.set([m.x,m.y,m.z,f.x,f.y,f.z,f.w,x.x,x.y,x.z])};function c(){s=0,l(a);let u=i.update();n.render(e,t),l(o);let m=0;for(let f=0;f<10;f++)m=Math.max(m,Math.abs(o[f]-a[f]));(u||m>zx||performance.now()<r)&&h()}function h(){s||(s=requestAnimationFrame(c))}function d(){r=performance.now()+Vx,h()}for(let u of["add","remove","clear"]){let m=Ft.prototype[u];Ft.prototype[u]=function(...f){return d(),m.apply(this,f)}}return i.addEventListener("change",d),i.addEventListener("start",d),i.addEventListener("end",d),document.addEventListener("visibilitychange",d),new MutationObserver(d).observe(document.documentElement,{subtree:!0,childList:!0,attributes:!0,characterData:!0}),d(),d}var Kr=n=>Number(n.toPrecision(10)).toString();function _f(n){if(!Vt(n))return"";let e=n.params;return`<div class="sectionlabel">Thread parameters \xB7 60\xB0 single-start</div><div class="twocol"><div class="field"><label for="threadUnits">Thread units</label><select id="threadUnits"><option value="metric" ${e.units==="metric"?"selected":""}>Metric \xB7 mm / pitch</option><option value="imperial" ${e.units==="imperial"?"selected":""}>Imperial \xB7 inch / TPI</option></select></div><div class="field"><label for="threadHand">Thread direction</label><select id="threadHand"><option value="right" ${e.hand==="right"?"selected":""}>Right-hand</option><option value="left" ${e.hand==="left"?"selected":""}>Left-hand</option></select></div></div><div class="field"><label for="threadPreset">Common size or custom</label><select id="threadPreset"></select></div><div class="twocol">${["Diameter","Pitch","Length",...n.type==="threadtube"?["Outer"]:[],"Clearance"].map(t=>`<div class="field"><label id="labelThread${t}" for="thread${t}">${t}</label><input id="thread${t}" type="text" inputmode="decimal"></div>`).join("")}</div><p class="inlinehelp" id="threadSummary"></p><p class="inlinehelp">${n.type==="threadtube"?"Clearance enlarges the threaded bore by this radial amount.":"Clearance reduces the screw radius by this amount. Zero keeps the nominal diameter."} Length stretching adds or removes turns without changing pitch. Imperial sizes accept fractions such as 1/4. Position remains in millimeters.</p>`}function xf(n,e){if(!Vt(n))return{read:()=>n.params};let t=n.params.units,i={...n.params},s=()=>t==="imperial"?25.4:1;function r(){let l=s(),c={...i,units:t,hand:e("threadHand").value,diameter:nr(e("threadDiameter").value)*l,h:nr(e("threadLength").value)*l,clearance:nr(e("threadClearance").value)*l},h=nr(e("threadPitch").value);return c.pitch=t==="imperial"?25.4/h:h,n.type==="threadtube"&&(c.outer=nr(e("threadOuter").value)*l),c}function a(){try{let l=r();e("threadSummary").textContent=l.pitch>0&&l.h>0?`${Kr(l.h/l.pitch)} turns \xB7 ${Kr(l.pitch)} mm pitch \xB7 ${Kr(25.4/l.pitch)} TPI`:"Enter a positive pitch and length."}catch{e("threadSummary").textContent="Enter thread dimensions to see the turn count."}}function o(){let l=t==="imperial",c=s(),h=l?"in":"mm";for(let[d,u,m]of[["Diameter","diameter","Nominal thread diameter"],["Length","h","Length Z"],["Clearance","clearance","Radial fit clearance"],...n.type==="threadtube"?[["Outer","outer","Outer tube diameter"]]:[]])e("labelThread"+d).textContent=m+" \xB7 "+h,e("thread"+d).value=Kr(i[u]/c);e("labelThreadPitch").textContent=l?"Threads per inch \xB7 TPI":"Thread pitch \xB7 mm",e("threadPitch").value=Kr(l?25.4/i.pitch:i.pitch),e("threadPreset").innerHTML='<option value="custom">Custom parameters</option>'+sh[t].map(([d],u)=>`<option value="${u}">${d}</option>`).join(""),a()}e("threadUnits").onchange=()=>{try{i=r(),t=e("threadUnits").value,o()}catch(l){e("threadUnits").value=t,e("editError").textContent=l.message}},e("threadPreset").onchange=()=>{if(e("threadPreset").value==="custom")return;try{i=r()}catch{}let[,l,c]=sh[t][Number(e("threadPreset").value)],h=e("threadPreset").value;i.diameter=l*s(),i.pitch=t==="imperial"?25.4/c:c,n.type==="threadtube"&&(i.outer=Math.max(i.outer,i.diameter+2*i.clearance+4)),o(),e("threadPreset").value=h};for(let l of["Diameter","Pitch","Length","Clearance",...n.type==="threadtube"?["Outer"]:[]])e("thread"+l).oninput=()=>{e("threadPreset").value="custom",a()};return o(),{read:r}}var yf={type:"change"},xh={type:"start"},bf={type:"end"},bl=new Ri,vf=new ln,Hx=Math.cos(70*Bt.DEG2RAD),Ht=new D,pn=2*Math.PI,ut={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},_h=1e-6,Ml=class extends Or{constructor(e,t=null){super(e,t),this.state=ut.NONE,this.target=new D,this.cursor=new D,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ni.ROTATE,MIDDLE:Ni.DOLLY,RIGHT:Ni.PAN},this.touches={ONE:Fn.ROTATE,TWO:Fn.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new D,this._lastQuaternion=new vt,this._lastTargetPosition=new D,this._quat=new vt().setFromUnitVectors(e.up,new D(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Hs,this._sphericalDelta=new Hs,this._scale=1,this._panOffset=new D,this._rotateStart=new Fe,this._rotateEnd=new Fe,this._rotateDelta=new Fe,this._panStart=new Fe,this._panEnd=new Fe,this._panDelta=new Fe,this._dollyStart=new Fe,this._dollyEnd=new Fe,this._dollyDelta=new Fe,this._dollyDirection=new D,this._mouse=new Fe,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Wx.bind(this),this._onPointerDown=Gx.bind(this),this._onPointerUp=Xx.bind(this),this._onContextMenu=Kx.bind(this),this._onMouseWheel=jx.bind(this),this._onKeyDown=$x.bind(this),this._onTouchStart=Zx.bind(this),this._onTouchMove=Jx.bind(this),this._onMouseDown=Yx.bind(this),this._onMouseMove=qx.bind(this),this._interceptControlDown=Qx.bind(this),this._interceptControlUp=ey.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(e){this._cursorStyle=e,e==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(e){super.connect(e),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=ut.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let e=this.domElement.getRootNode();e.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),e.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(e){e.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=e}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(yf),this.update(),this.state=ut.NONE}pan(e,t){this._pan(e,t),this.update()}dollyIn(e){this._dollyIn(e),this.update()}dollyOut(e){this._dollyOut(e),this.update()}rotateLeft(e){this._rotateLeft(e),this.update()}rotateUp(e){this._rotateUp(e),this.update()}update(e=null){let t=this.object.position;Ht.copy(t).sub(this.target),Ht.applyQuaternion(this._quat),this._spherical.setFromVector3(Ht),this.autoRotate&&this.state===ut.NONE&&this._rotateLeft(this._getAutoRotationAngle(e)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let i=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(i)&&isFinite(s)&&(i<-Math.PI?i+=pn:i>Math.PI&&(i-=pn),s<-Math.PI?s+=pn:s>Math.PI&&(s-=pn),i<=s?this._spherical.theta=Math.max(i,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(i+s)/2?Math.max(i,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(Ht.setFromSpherical(this._spherical),Ht.applyQuaternion(this._quatInverse),t.copy(this.target).add(Ht),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=Ht.length();a=this._clampDistance(o*this._scale);let l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let o=new D(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new D(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=Ht.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(bl.origin.copy(this.object.position),bl.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(bl.direction))<Hx?this.object.lookAt(this.target):(vf.setFromNormalAndCoplanarPoint(this.object.up,this.target),bl.intersectPlane(vf,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>_h||8*(1-this._lastQuaternion.dot(this.object.quaternion))>_h||this._lastTargetPosition.distanceToSquared(this.target)>_h?(this.dispatchEvent(yf),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(e){return e!==null?pn/60*this.autoRotateSpeed*e:pn/60/60*this.autoRotateSpeed}_getZoomScale(e){let t=Math.abs(e*.01);return Math.pow(.95,this.zoomSpeed*t)}_rotateLeft(e){this._sphericalDelta.theta-=e}_rotateUp(e){this._sphericalDelta.phi-=e}_panLeft(e,t){Ht.setFromMatrixColumn(t,0),Ht.multiplyScalar(-e),this._panOffset.add(Ht)}_panUp(e,t){this.screenSpacePanning===!0?Ht.setFromMatrixColumn(t,1):(Ht.setFromMatrixColumn(t,0),Ht.crossVectors(this.object.up,Ht)),Ht.multiplyScalar(e),this._panOffset.add(Ht)}_pan(e,t){let i=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Ht.copy(s).sub(this.target);let r=Ht.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*e*r/i.clientHeight,this.object.matrix),this._panUp(2*t*r/i.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(e*(this.object.right-this.object.left)/this.object.zoom/i.clientWidth,this.object.matrix),this._panUp(t*(this.object.top-this.object.bottom)/this.object.zoom/i.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(e){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=e:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(e,t){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let i=this.domElement.getBoundingClientRect(),s=e-i.left,r=t-i.top,a=i.width,o=i.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(e){return Math.max(this.minDistance,Math.min(this.maxDistance,e))}_handleMouseDownRotate(e){this._rotateStart.set(e.clientX,e.clientY)}_handleMouseDownDolly(e){this._updateZoomParameters(e.clientX,e.clientX),this._dollyStart.set(e.clientX,e.clientY)}_handleMouseDownPan(e){this._panStart.set(e.clientX,e.clientY)}_handleMouseMoveRotate(e){this._rotateEnd.set(e.clientX,e.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(pn*this._rotateDelta.x/t.clientHeight),this._rotateUp(pn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(e){this._dollyEnd.set(e.clientX,e.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(e){this._panEnd.set(e.clientX,e.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(e){this._updateZoomParameters(e.clientX,e.clientY),e.deltaY<0?this._dollyIn(this._getZoomScale(e.deltaY)):e.deltaY>0&&this._dollyOut(this._getZoomScale(e.deltaY)),this.update()}_handleKeyDown(e){let t=!1;switch(e.code){case this.keys.UP:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(pn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),t=!0;break;case this.keys.BOTTOM:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateUp(-pn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),t=!0;break;case this.keys.LEFT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(pn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),t=!0;break;case this.keys.RIGHT:e.ctrlKey||e.metaKey||e.shiftKey?this.enableRotate&&this._rotateLeft(-pn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),t=!0;break}t&&(e.preventDefault(),this.update())}_handleTouchStartRotate(e){if(this._pointers.length===1)this._rotateStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._rotateStart.set(i,s)}}_handleTouchStartPan(e){if(this._pointers.length===1)this._panStart.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panStart.set(i,s)}}_handleTouchStartDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enablePan&&this._handleTouchStartPan(e)}_handleTouchStartDollyRotate(e){this.enableZoom&&this._handleTouchStartDolly(e),this.enableRotate&&this._handleTouchStartRotate(e)}_handleTouchMoveRotate(e){if(this._pointers.length==1)this._rotateEnd.set(e.pageX,e.pageY);else{let i=this._getSecondPointerPosition(e),s=.5*(e.pageX+i.x),r=.5*(e.pageY+i.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let t=this.domElement;this._rotateLeft(pn*this._rotateDelta.x/t.clientHeight),this._rotateUp(pn*this._rotateDelta.y/t.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(e){if(this._pointers.length===1)this._panEnd.set(e.pageX,e.pageY);else{let t=this._getSecondPointerPosition(e),i=.5*(e.pageX+t.x),s=.5*(e.pageY+t.y);this._panEnd.set(i,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(e){let t=this._getSecondPointerPosition(e),i=e.pageX-t.x,s=e.pageY-t.y,r=Math.sqrt(i*i+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(e.pageX+t.x)*.5,o=(e.pageY+t.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enablePan&&this._handleTouchMovePan(e)}_handleTouchMoveDollyRotate(e){this.enableZoom&&this._handleTouchMoveDolly(e),this.enableRotate&&this._handleTouchMoveRotate(e)}_addPointer(e){this._pointers.push(e.pointerId)}_removePointer(e){delete this._pointerPositions[e.pointerId];for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId){this._pointers.splice(t,1);return}}_isTrackingPointer(e){for(let t=0;t<this._pointers.length;t++)if(this._pointers[t]==e.pointerId)return!0;return!1}_trackPointer(e){let t=this._pointerPositions[e.pointerId];t===void 0&&(t=new Fe,this._pointerPositions[e.pointerId]=t),t.set(e.pageX,e.pageY)}_getSecondPointerPosition(e){let t=e.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[t]}_customWheelEvent(e){let t=e.deltaMode,i={clientX:e.clientX,clientY:e.clientY,deltaY:e.deltaY};switch(t){case 1:i.deltaY*=16;break;case 2:i.deltaY*=100;break}return e.ctrlKey&&!this._controlActive&&(i.deltaY*=10),i}};function Gx(n){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(n.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(n)&&(this._addPointer(n),n.pointerType==="touch"?this._onTouchStart(n):this._onMouseDown(n),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function Wx(n){this.enabled!==!1&&(n.pointerType==="touch"?this._onTouchMove(n):this._onMouseMove(n))}function Xx(n){switch(this._removePointer(n),this._pointers.length){case 0:this.domElement.releasePointerCapture(n.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(bf),this.state=ut.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let e=this._pointers[0],t=this._pointerPositions[e];this._onTouchStart({pointerId:e,pageX:t.x,pageY:t.y});break}}function Yx(n){let e;switch(n.button){case 0:e=this.mouseButtons.LEFT;break;case 1:e=this.mouseButtons.MIDDLE;break;case 2:e=this.mouseButtons.RIGHT;break;default:e=-1}switch(e){case Ni.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(n),this.state=ut.DOLLY;break;case Ni.ROTATE:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=ut.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=ut.ROTATE}break;case Ni.PAN:if(n.ctrlKey||n.metaKey||n.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(n),this.state=ut.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(n),this.state=ut.PAN}break;default:this.state=ut.NONE}this.state!==ut.NONE&&this.dispatchEvent(xh)}function qx(n){switch(this.state){case ut.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(n);break;case ut.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(n);break;case ut.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(n);break}}function jx(n){this.enabled===!1||this.enableZoom===!1||this.state!==ut.NONE||(n.preventDefault(),this.dispatchEvent(xh),this._handleMouseWheel(this._customWheelEvent(n)),this.dispatchEvent(bf))}function $x(n){this.enabled!==!1&&this._handleKeyDown(n)}function Zx(n){switch(this._trackPointer(n),this._pointers.length){case 1:switch(this.touches.ONE){case Fn.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(n),this.state=ut.TOUCH_ROTATE;break;case Fn.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(n),this.state=ut.TOUCH_PAN;break;default:this.state=ut.NONE}break;case 2:switch(this.touches.TWO){case Fn.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(n),this.state=ut.TOUCH_DOLLY_PAN;break;case Fn.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(n),this.state=ut.TOUCH_DOLLY_ROTATE;break;default:this.state=ut.NONE}break;default:this.state=ut.NONE}this.state!==ut.NONE&&this.dispatchEvent(xh)}function Jx(n){switch(this._trackPointer(n),this.state){case ut.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(n),this.update();break;case ut.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(n),this.update();break;case ut.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(n),this.update();break;case ut.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(n),this.update();break;default:this.state=ut.NONE}}function Kx(n){this.enabled!==!1&&n.preventDefault()}function Qx(n){n.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function ey(n){n.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var ne=n=>document.getElementById(n),Wn=n=>String(n).replace(/[&<>"']/g,e=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[e]),ra=()=>{},et=null,ar=null,or=null,El=!0,aa=!1,Sl=[];try{El=localStorage.getItem("tristancad.smoothNewShapes")!=="false"}catch{}var Me={...Qs(),buildPlaneEnabled:!0},Dt=null,Yi=[],ta=[],Sh=!1,mi=null,yh=0,ry=0,Qr=!1,_i=[],ea=new Nn,pi={},bh,Mf,Rl="tristancad.autosave.v1-backup",Tl=[];function Pl(n){let e=[],t=Yt(Yd(n,e));if(e.length){let i=e.length===1?e[0]:e.length+" older Subtract results were kept as combined objects. They render as before.";typeof bh>"u"||!ne("toast")?Tl.push(i):Ze(i)}return t}var cs=!1,Mh=!1,Sf=0,ay=6e4;{let n=null,e=null;try{n=localStorage.getItem("tristancad.autosave"),e=n?JSON.parse(n):null}catch(s){console.warn(s)}let t=n&&e?.version===1,i=!1;if(t)try{localStorage.setItem(Rl,n),i=!0}catch(s){console.warn(s),cs=!0,Tl.push("Storage is full, so your older autosave could not be backed up. Autosave is paused to keep it; use Project \u2192 Export project or free space.")}if(e)try{Me=Pl(e),Mh=!!t}catch(s){if(console.warn(s),t){cs=cs||!i;let r=String(s.message).replace(/[.\s]+$/,"");Tl.push(i?"Your older autosave could not be opened ("+r+"). A copy is kept under tristancad.autosave.v1-backup.":"Your older autosave could not be opened ("+r+"). It was left untouched.")}}try{pi=JSON.parse(localStorage.getItem("tristancad.projects")||"{}")}catch(s){console.warn(s)}}var Il=new Worker(new URL("worker.js?v=2.6.1",import.meta.url),{type:"module"}),na=new Map,ia=mf();function ii(n,e){return new Promise((t,i)=>{let s=++ry;na.set(s,{resolve:t,reject:i}),Il.postMessage(ia?ia.outgoing({id:s,type:n,...e}):{id:s,type:n,...e})})}Il.onmessage=({data:n})=>{ia&&ia.incoming(n);let e=na.get(n.id);e&&(na.delete(n.id),n.error?e.reject(Error(n.error)):e.resolve(n))};requestAnimationFrame(()=>setTimeout(()=>Il.postMessage({type:"warm"}),0));Il.onerror=n=>{ia?.reset();for(let e of na.values())e.reject(Error("The modeling engine could not start. Close and reopen the app."));na.clear(),Ze("The modeling engine could not start: "+n.message,!0)};function Ze(n,e=!1){clearTimeout(bh),ne("toast").textContent=n,ne("toast").classList.toggle("error",e),ne("toast").hidden=!1,bh=setTimeout(()=>ne("toast").hidden=!0,e?7e3:3500)}function vh(n){ne("busy").textContent=n}function Ef(n){let e=ne("unsavedMarker");e&&(e.hidden=!n)}function oy(){Ef(!0);let n=Date.now();n-Sf<ay||(Sf=n,Ze("Changes are not being autosaved: storage is full and your older autosave has no backup yet. Use Project \u2192 Export project.",!0))}function lr(){et?.isDragging()||et?.isCommitting()||(clearTimeout(Mf),Mf=setTimeout(()=>{if(!(et?.isDragging()||et?.isCommitting())){if(cs)try{localStorage.setItem(Rl,localStorage.getItem("tristancad.autosave")),cs=!1}catch{oy();return}try{localStorage.setItem("tristancad.autosave",JSON.stringify(Me)),Sh=!1,Ef(!1)}catch{Ze("Autosave is full. Use Project \u2192 Export project to back up this model.",!0)}}},350))}var wl=[],Eh=[];function Th(n,e=null){Yi.push(n),wl.push(e),Yi.length>40&&(Yi.shift(),wl.shift()),ta=[],Eh=[]}function Tf(n){let e=(n||[]).filter(t=>Me.objects.some(i=>i.id===t));if(et&&(e.length>1||et.multi().length))return et.setMulti(e);e.length&&(Dt=e[0]),yi()||(Dt=null)}function ly(){Th(JSON.stringify(Me),hn()),Sh=!0}function wh(n){let e=hn();et?.deselect(),Th(JSON.stringify(Me),e),Sh=!0,n(),Yn()}function Cn(n){ly(),n(),Yn()}function yi(){return Me.objects.find(n=>n.id===Dt)}function hn(){let n=et?.multi()||[];return n.length?n:Dt&&yi()?[Dt]:[]}function wf(){ne("mergeBtn").hidden=hn().length<2}function Ah(n,{additive:e=!1}={}){if(e&&n&&et)return et.toggleMulti(n);Dt=n;let t=yi();t&&Me.activeLayer!==We(t)&&(Me.activeLayer=We(t),lr()),cr(),Pf(),et?.selectionChanged(),or?.selectionChanged(),wf()}function cr(){let n=Me.buildPlaneEnabled===!0;ne("buildPlane").checked=n,ne("buildPlaneStatus").textContent=n?"On \xB7 stops at Z=0":"Off \xB7 negative Z allowed",Ll.visible=n,ra();let e=yi();ne("projectName").textContent=Me.name,ne("objectCount").textContent=Me.objects.length,ne("layersBtn").textContent=Vn(Me)+" \u25BE",ne("layersBtn").setAttribute("aria-label","Layers \xB7 "+Vn(Me));let t=_i.find(s=>s.userData.id===Dt),i=hn().length;ne("selectionLabel").textContent=i>1?i+" objects selected":e?e.name+(e.mode==="cut"?" \xB7 cutout":"")+(t?" \xB7 "+gh(t):""):"No object selected",ne("quickEdit").disabled=!e,ne("editBtn").disabled=!e,ne("undo").disabled=!Yi.length,ne("redo").disabled=!ta.length,ne("empty").hidden=Me.objects.some(s=>s.enabled&&s.mode==="solid"),wf(),or?.render()}async function Yn(n=!1){cr(),lr();let e=++yh;vh("Building solid\u2026");try{let t=await ii("preview",{project:structuredClone(Me),tolerance:.15});if(e!==yh||t.canceled)return;hy(t),vh(t.triangles.length?`${(t.triangles.length/3).toLocaleString()} preview triangles`:"Ready \xB7 millimeters"),n&&Ch()}catch(t){if(e!==yh)return;vh("Model needs attention"),Ze(t.message,!0)}}function qn(n,e,t="AvalonCad"){ne("sheetTitle").textContent=n,ne("sheetEyebrow").textContent=t,ne("sheetContent").innerHTML=e,ne("sheet").hidden=!1,ne("shade").hidden=!1,ne("sheetContent").scrollTop=0}function xi(n){aa=n,ne("app").classList.toggle("checking",n),n?(Sl=[...ne("sheet").querySelectorAll("button,input,select")].map(e=>[e,e.disabled]),Sl.forEach(([e])=>e.disabled=!0)):(Sl.forEach(([e,t])=>{e.isConnected&&(e.disabled=t)}),Sl=[])}function jt(){et?.isCommitting()||aa||(ne("sheet").hidden=!0,ne("shade").hidden=!0)}ne("closeSheet").onclick=jt;ne("shade").onclick=jt;var sa=ne("scene"),mn=new Sr,Xn=new Kt(38,1,.1,3e4);Xn.up.set(0,0,1);Xn.position.set(120,-150,130);var Xi;try{Xi=new cl({canvas:sa,antialias:!0,alpha:!0}),Xi.setPixelRatio(Math.min(devicePixelRatio,2)),Xi.outputColorSpace=on,Xi.setClearColor(0,0)}catch(n){throw Ze("3D graphics could not start. Update Android System WebView and reopen the app.",!0),n}var vn=new Ml(Xn,sa);vn.enableDamping=!0;vn.dampingFactor=.12;vn.minDistance=2;vn.maxDistance=2e4;vn.screenSpacePanning=!0;vn.target.set(0,0,10);vn.touches.ONE=Fn.ROTATE;vn.touches.TWO=Fn.DOLLY_PAN;mn.add(new Lr(16777215,7829367,.8));var Af=new Nr(16777215,.7);Af.position.set(100,-100,200);mn.add(Af);var oa=new Fr(220,22,5468280,3162702);oa.rotation.x=Math.PI/2;oa.position.z=-.07;oa.material.transparent=!0;oa.material.opacity=.6;mn.add(oa);mn.add(ea);var Ll=new Mt(new ts(220,220),new Qt({color:1781816,side:Ot}));Ll.position.z=-.1;Ll.userData.buildPlane=!0;mn.add(Ll);ne("buildPlane").onchange=async()=>{let n=ne("buildPlane").checked;if(et?.isDragging()||et?.isCommitting()||aa){cr();return}ne("buildPlane").disabled=!0;try{if(n){xi(!0);let e=await ii("groundProject",{project:structuredClone(Me)});Cn(()=>Me=e.project),Ze(e.lift>0?"Build plane on. The assembly was raised together onto Z=0.":"Build plane on. Objects stop at Z=0.")}else Cn(()=>Me.buildPlaneEnabled=!1),Ze("Build plane off. Negative Z is allowed.")}catch(e){Ze(e.message,!0),cr()}finally{xi(!1),ne("buildPlane").disabled=!1}};var Gn=null,An=null;function cy(n,e){let t=new Tt;return t.setAttribute("position",new Lt(n,3)),t.setIndex(new Lt(e,1)),!0,t}function Cf(n){for(;n.children.length;){let e=n.children[0];n.remove(e),e.geometry?.dispose(),Array.isArray(e.material)?e.material.forEach(t=>t.dispose()):e.material?.dispose()}}function hy(n){Hi(Me,n);for(let a of n.parts){let o=Me.objects.find(l=>l.id===a.id);o?.positionReference==="base"&&(o.placement=[(a.bounds.min[0]+a.bounds.max[0])/2,(a.bounds.min[1]+a.bounds.max[1])/2,a.bounds.min[2]])}lr(),mi=n;let e=n.displayPositions?{position:n.displayPositions,normal:n.displayNormals}:null,t=!!(Gn&&e&&e.position.length===n.triangles.length*3&&dh(Gn.geometry,e));Gn&&!t&&(mn.remove(Gn),Gn.geometry.dispose(),Gn.material.dispose()),An&&(mn.remove(An),An.geometry.dispose(),An.material.dispose(),An=null),t||(Gn=new Mt(ff(n.vertices,n.triangles,n.flatTriangles,n.displayPositions?{positions:n.displayPositions,normals:n.displayNormals}:void 0,n.smoothingGroups),tn("lambert",Rr,{color:7850432,flatShading:!1})),mn.add(Gn));let i=_i,s=new Map(_i.filter(a=>a.userData.contentHash).map(a=>[a.userData.id+"\0"+a.userData.contentHash,a])),r=new Set;_i=n.parts.map(a=>{let o=a.contentHash&&s.get(a.id+"\0"+a.contentHash);if(o&&!r.has(o))return r.add(o),o.userData={id:a.id,mode:a.mode,topology:a.topology,bounds:a.bounds,contentHash:a.contentHash},o;let l=new Mt(cy(a.vertices,a.triangles),tn("basic",Qt,{side:Ot}));return l.userData={id:a.id,mode:a.mode,topology:a.topology,bounds:a.bounds,contentHash:a.contentHash},l});for(let a of s.values())r.has(a)||(a.geometry.dispose(),a.material.dispose());for(let a of i)a.userData.contentHash||(a.geometry.dispose(),a.material.dispose());if(Qr&&Rf(),Pf(),et?.onModel(),cr(),ra(),n.bounds){let{min:a,max:o}=n.bounds,l=o.map((c,h)=>c-a[h]);ne("bounds").textContent=l.map(c=>c.toFixed(1)).join(" \xD7 ")+" mm"}else ne("bounds").textContent=""}function Rf(){An&&(mn.remove(An),An.geometry.dispose(),An.material.dispose(),An=null),Qr&&Gn&&(An=new Kn(new Cr(Gn.geometry),tn("line",Sn,{color:2509127,transparent:!0,opacity:.45})),mn.add(An))}function Pf(){Cf(ea),gl.begin();let n=yi(),e=_i.find(i=>i.userData.id===Dt);if(!n||!e||!n.enabled||et?.isDragging()||et?.isCommitting())return;let t=new Kn(ir(gl,()=>new es(e.geometry,28)),tn("line",Sn,{color:n.mode==="cut"?16758383:14417894,depthTest:!1,transparent:!0,opacity:.8}));if(t.renderOrder=5,ea.add(t),n.mode==="cut"){let i=new Mt(ir(gl,()=>e.geometry.clone()),tn("basic",Qt,{color:16758383,transparent:!0,opacity:.18,depthWrite:!1,side:Ot}));ea.add(i)}}function Ch(n="iso"){let e=new D(0,0,8),t=60;if(mi?.bounds){let{min:a,max:o}=mi.bounds;e.set(...a.map((l,c)=>(l+o[c])/2)),t=Math.max(...o.map((l,c)=>l-a[c]),5)}vn.target.copy(e);let i=Bt.degToRad(38)*Math.min(Xn.aspect,1),s=t/(2*Math.tan(i/2))*1.5,r={iso:[1,-1.3,1.05],top:[0,0,1],front:[0,-1,0],right:[1,0,0]}[n];Xn.position.copy(e).add(new D(...r).normalize().multiplyScalar(s)),Xn.up.set(...n==="top"?[0,1,0]:[0,0,1]),vn.update(),ra(),document.querySelectorAll("[data-view]").forEach(a=>a.classList.toggle("active",a.dataset.view===n))}new ResizeObserver(()=>{let n=sa.clientWidth,e=sa.clientHeight;Xi.setSize(n,e,!1),Xn.aspect=n/Math.max(e,1),Xn.updateProjectionMatrix(),ra()}).observe(ne("viewport"));ra=gf({renderer:Xi,scene:mn,camera:Xn,controls:vn});ne("fit").onclick=()=>Ch();document.querySelectorAll("[data-view]").forEach(n=>n.onclick=()=>Ch(n.dataset.view));ne("wire").onclick=()=>{Qr=!Qr,ne("wire").classList.toggle("active",Qr),Rf()};ne("undo").onclick=()=>{Yi.length&&(ta.push(JSON.stringify(Me)),Eh.push(hn()),Me=Yt(JSON.parse(Yi.pop())),Tf(wl.pop()),Yn())};ne("redo").onclick=()=>{ta.length&&(Yi.push(JSON.stringify(Me)),wl.push(hn()),Me=Yt(JSON.parse(ta.pop())),Tf(Eh.pop()),Yn())};var uy={wedge:'<path d="M5 31 27 7v24Z M27 7l9 6v24L27 31 M5 31l9 6h22"/>',pyramid:'<path d="M20 5 4 31l16 8 16-8Z M20 5v34 M4 31l16-7 16 7"/>',threadrod:'<path d="M13 5h14v32H13Z M13 10l14-4 M13 16l14-4 M13 22l14-4 M13 28l14-4 M13 34l14-4"/>',threadtube:'<ellipse cx="20" cy="10" rx="14" ry="7"/><ellipse cx="20" cy="10" rx="8" ry="4"/><path d="M6 10v23c0 9 28 9 28 0V10 M13 10v16 M27 10v16 M13 15l14-4 M13 21l14-4 M13 27l14-4"/>',box:'<path d="M6 13 20 6l14 7v18l-14 7L6 31Z M6 13l14 7 14-7 M20 20v18"/>',rounded:'<path d="M10 13 20 8q2-1 4 0l8 4q3 2 3 5v12q0 3-3 5l-9 4q-3 1-6-1l-8-4q-3-2-3-5V18q0-3 4-5Z M8 15l12 6 13-6 M20 21v16"/>',cylinder:'<ellipse cx="20" cy="11" rx="13" ry="6"/><path d="M7 11v22c0 8 26 8 26 0V11"/>',cone:'<ellipse cx="20" cy="8" rx="5" ry="3"/><path d="M15 8 6 32c0 8 28 8 28 0L25 8"/>',sphere:'<circle cx="20" cy="21" r="16"/><ellipse cx="20" cy="21" rx="7" ry="16"/><ellipse cx="20" cy="21" rx="16" ry="6"/>',tube:'<ellipse cx="20" cy="10" rx="14" ry="7"/><ellipse cx="20" cy="10" rx="8" ry="3.5"/><path d="M6 10v23c0 9 28 9 28 0V10"/>'};function Rh(){qn("Primitive Objects",'<p class="subtle">Solid shapes add material on the active layer. Change a shape to a cutout to cut only that layer. New shapes go on the layer shown at the top.</p><label class="toggle"><input type="checkbox" id="smoothShape" '+(El?"checked":"")+'>Smooth shape \xB7 high resolution</label><p class="inlinehelp">Keeps spheres round and curved surfaces smooth using 0.005 mm curve resolution. Applies only to the new shape. Existing objects keep their settings. Flat faces and sharp edges keep their shape. STL represents curves with triangles.</p><div class="shapegrid">'+Object.keys(nh).map(n=>`<button data-shape="${n}"><svg viewBox="0 0 40 42">${uy[n]}</svg>${as[n]}</button>`).join("")+'</div><div class="sectionlabel">Reusable shapes</div><button id="prefabsBtn" class="full">Prefabs \xB7 '+ar.count()+' saved</button><button id="sketchBtn" class="full">\u2301 Draw a custom sketch</button><button id="importSTLBtn" class="full">Import an STL, project or prefab</button>'),ne("smoothShape").onchange=()=>{El=ne("smoothShape").checked;try{localStorage.setItem("tristancad.smoothNewShapes",String(El))}catch{}},document.querySelectorAll("[data-shape]").forEach(n=>n.onclick=()=>{if(Me.objects.length>=100)return Ze("Maximum 100 objects per project.",!0);let e=n.dataset.shape,t=structuredClone(nh[e]),i=ni(e,t,[0,0,(t.h||t.diameter)/2],as[e]);i.layerId=Me.activeLayer,ne("smoothShape").checked&&lf(i),et?.placeNew(i),us(i)}),ne("prefabsBtn").onclick=ar.menu,ne("sketchBtn").onclick=If,ne("importSTLBtn").onclick=Nl}ne("addBtn").onclick=Rh;ne("firstShape").onclick=Rh;var dy={w:"Width X",d:"Depth Y",h:"Height Z",r:"Corner radius",diameter:"Diameter",inner:"Inner diameter",top:"Top diameter"};function gi(n,e,t,i="number"){return`<div class="field"><label for="${n}">${e}</label><input id="${n}" type="${i}" ${i==="number"?'step="0.1" inputmode="decimal"':""} value="${Wn(t)}"></div>`}function us(n=null){(!n?.params||!n?.id)&&(n=null);let e=!!n,t=n||yi();if(!t)return Ze("Select an object first.");qn((e?"Add ":"Edit ")+as[t.type],`${e?'<p class="inlinehelp">This object is added only when you tap Apply. Close or Cancel discards this draft.</p>':""}<div class="row">${gi("objectName","Object name",t.name,"text")}</div><div class="field"><label for="objectLayer">Layer</label><select id="objectLayer">${Me.layers.map(s=>`<option value="${Wn(s.id)}" ${s.id===We(t)?"selected":""}>${Wn(s.name)}</option>`).join("")}</select></div><div class="row"><div class="field"><label for="mode">Material</label><select id="mode"><option value="solid" ${t.mode==="solid"?"selected":""}>Solid \xB7 add material</option><option value="cut" ${t.mode==="cut"?"selected":""}>Cutout \xB7 remove material</option></select></div></div><p class="inlinehelp">Solids on each layer are added together. Cutouts remove material only on their own layer. Moving this shape changes the layer it adds to or cuts.</p>${Vt(t)?_f(t):`<div class="sectionlabel">Dimensions \xB7 millimeters</div><div class="twocol">${Object.keys(t.params).filter(s=>typeof t.params[s]=="number").map(s=>gi("p_"+s,dy[s]||s,t.params[s])).join("")}</div>`}${cf(t,_i.find(s=>s.userData.id===t.id))}${t.type==="mesh"?'<p class="inlinehelp">Imported STL geometry keeps its original dimensions. Position, rotate and use it as a solid or cutout.</p>':""}<div class="sectionlabel">${t.positionReference==="base"?"Bottom-center placement":"Object center position"} \xB7 millimeters</div><div class="row">${(t.positionReference==="base"?t.placement:t.position).map((s,r)=>gi("pos"+r,["X","Y","Z"][r],s)).join("")}</div><p class="inlinehelp">${t.positionReference==="base"?"X=0, Y=0, Z=0 centers the bottom of the object on the build plane. Build plane On keeps its bottom at or above Z=0.":"This existing object uses center coordinates. For a 10 mm tall shape to sit on the plane, set center Z to 5."}</p><div class="sectionlabel">Rotation \xB7 degrees</div><div class="row">${t.rotation.map((s,r)=>gi("rot"+r,["X","Y","Z"][r],s)).join("")}</div><div id="editError" class="modalerror"></div><button id="applyObject" class="full primary">${e?"Apply & add object":"Apply changes"}</button>${e?'<button id="cancelObject" class="full">Cancel</button>':(hn().length>=2?'<button id="editMerge" class="full">Merge '+hn().length+" selected shapes</button>":"")+'<button id="saveAsPrefab" class="full">Save as prefab</button><div class="row" style="margin-top:10px"><button id="duplicateObject">Duplicate</button><button id="deleteObject" class="danger">Delete</button></div>'}${!e&&["joined","prefab"].includes(t.type)?'<button id="explodeObject" class="full">Separate components</button>':""}${!e&&t.type==="polygon"?'<button class="full" id="editSketch">Edit sketch points</button>':""}`,e&&t.type!=="prefab"?"PRIMITIVE OBJECTS":"EXACT DIMENSIONS"),hf(t,ne);let i=xf(t,ne);if(ne("applyObject").onclick=async()=>{let s=ne("editError");try{let r=structuredClone(t);r.name=ne("objectName").value.trim()||as[t.type],r.mode=ne("mode").value,r.layerId=ne("objectLayer").value,r.resolution=uf(t,ne);let a=!df(t,r)&&r.fillets?.length;if(a&&delete r.fillets,Vt(t))r.params=i.read();else for(let c of Object.keys(t.params))typeof t.params[c]=="number"&&(r.params[c]=Number(ne("p_"+c).value));let o=[0,1,2].map(c=>Number(ne("pos"+c).value));r.position=o,r.rotation=[0,1,2].map(c=>Number(ne("rot"+c).value));let l=structuredClone(Me);if(e){if(l.objects.length>=100)throw Error("Maximum 100 objects.");l.objects.push(r)}else l.objects[l.objects.findIndex(c=>c.id===t.id)]=r;l.activeLayer=r.layerId,Yt(l),xi(!0),r.positionReference==="base"&&(r=(await ii("place",{object:r,position:o,floor:l.buildPlaneEnabled===!0})).object,l.objects[l.objects.findIndex(c=>c.id===r.id)]=r),(l.buildPlaneEnabled||e||Vt(r)||r.type==="prefab"||r.resolution?.mode==="faces"||r.fillets?.some(c=>c.radius>0))&&Hi(l,await ii("check",{project:l,tolerance:.15})),xi(!1),wh(()=>{Me=l,Dt=r.id}),jt(),Ze(e?"Object added.":a?"Shape updated. Roundovers were cleared because the face layout changed.":"Dimensions and face resolution updated.")}catch(r){s.textContent=r.message}finally{xi(!1)}},e){ne("cancelObject").onclick=jt;return}ne("saveAsPrefab").onclick=()=>ar.form(hn().length>=2?{source:"selection"}:{}),ne("editMerge")&&(ne("editMerge").onclick=()=>et.mergeMenu(hn())),ne("duplicateObject").onclick=()=>{if(Me.objects.length>=100)return Ze("Maximum 100 objects.",!0);let s=structuredClone(t);s.id=Xt(),s.name=t.name+" copy",sr(s),s.params.children&&(s.params.children=ls(s.params.children)),us(s)},ne("deleteObject").onclick=()=>{Cn(()=>{Me.objects=Me.objects.filter(s=>s.id!==t.id),Dt=null}),jt()},ne("explodeObject")&&(ne("explodeObject").onclick=()=>fy(t)),ne("editSketch")&&(ne("editSketch").onclick=()=>If(t))}function fy(n){if(n.scale?.some(r=>Math.abs(r-1)>1e-8))return Ze("Undo the assembly stretch before separating its components.",!0);if(Me.objects.length-1+n.params.children.length>100)return Ze("Separating would exceed 100 objects.",!0);let e=structuredClone(Me),t=new Map;if(n.type==="prefab"){let r=[...new Set(n.params.children.map(We))];if(e.layers.length+r.length>100)return Ze("Separating would exceed 100 layers.",!0);for(let a of r){let o="layer-"+Xt(),l=(n.name+" \xB7 "+(n.params.layers.find(c=>c.id===a)?.name||"Components")).slice(0,60);e.layers.push({id:o,name:l}),t.set(a,o)}}let i=(r,a)=>{if(r.layerId=a,r.type==="joined")for(let o of r.params.children)i(o,a)},s=ls(n.params.children).map(r=>{let a=new D(...r.position).applyEuler(new Et(...n.rotation.map(Bt.degToRad),"ZYX")).add(new D(...n.position)),o=new vt().setFromEuler(new Et(...n.rotation.map(Bt.degToRad),"ZYX")).multiply(new vt().setFromEuler(new Et(...r.rotation.map(Bt.degToRad),"ZYX"))),l=new Et().setFromQuaternion(o,"ZYX"),c={...r,mode:r.sourceMode||r.mode,position:a.toArray(),rotation:[l.x,l.y,l.z].map(Bt.radToDeg)};return i(c,n.type==="prefab"?t.get(We(r)):We(n)),delete c.sourceMode,delete c.positionReference,delete c.placement,c});e.objects=e.objects.filter(r=>r.id!==n.id),e.objects.push(...s),n.type==="prefab"&&(e.activeLayer=We(s[0]));try{Yt(e),wh(()=>{Me=e,Dt=s[0]?.id}),jt()}catch(r){Ze(r.message,!0)}}ne("editBtn").onclick=us;ne("quickEdit").onclick=us;ne("deselectBtn").onclick=()=>et?.deselect();ne("mergeBtn").onclick=()=>et?.mergeMenu(hn());function If(n=null){(n?.type!=="polygon"||!n.params)&&(n=null);let e=n?structuredClone(n.params.points):[];qn("Sketch & extrude",`<p class="subtle">Tap points in order around an outline on the XY plane. The last point closes back to the first. Coordinates snap to 1 mm.</p><div class="row">${gi("sketchSpan","Canvas width \xB7 mm",120)}${gi("sketchHeight","Extrusion height \xB7 mm",n?.params.h||10)}</div><canvas id="sketch" class="sketchcanvas"></canvas><div id="sketchPoints" class="points"></div><div class="row" style="margin-top:10px"><button id="pointUndo">Undo point</button><button id="pointClear">Clear</button></div><div class="row">${gi("pointX","Point X \xB7 mm",0)}${gi("pointY","Point Y \xB7 mm",0)}<button id="pointAdd" style="align-self:end">Add point</button></div><div id="sketchError" class="modalerror"></div><button id="extrude" class="full primary">${n?"Update sketch":"Extrude outline"}</button>`,"CUSTOM OUTLINE");let t=ne("sketch"),i=t.getContext("2d");function s(){let a=t.clientWidth,o=t.clientHeight,l=Math.max(10,Math.min(2e3,Number(ne("sketchSpan").value)||120)),c=a/l;t.width=Math.round(a*devicePixelRatio),t.height=Math.round(o*devicePixelRatio),i.scale(devicePixelRatio,devicePixelRatio),i.clearRect(0,0,a,o);let h=l>200?20:10;i.strokeStyle="#263b46",i.lineWidth=1;for(let d=-l;d<=l;d+=h)i.beginPath(),i.moveTo(a/2+d*c,0),i.lineTo(a/2+d*c,o),i.stroke(),i.beginPath(),i.moveTo(0,o/2+d*c),i.lineTo(a,o/2+d*c),i.stroke();if(i.strokeStyle="#58777e",i.beginPath(),i.moveTo(a/2,0),i.lineTo(a/2,o),i.moveTo(0,o/2),i.lineTo(a,o/2),i.stroke(),i.fillStyle="#8fa5b3",i.font="10px sans-serif",i.fillText("X \u2192",a-30,o/2-5),i.fillText("Y \u2191",a/2+5,14),i.fillText("0",a/2+5,o/2+14),e.length){i.beginPath(),e.forEach((d,u)=>{let m=a/2+d[0]*c,f=o/2-d[1]*c;u?i.lineTo(m,f):i.moveTo(m,f)}),e.length>2&&i.closePath(),i.fillStyle="#77e2d224",i.fill(),i.strokeStyle="#77e2d2",i.lineWidth=2,i.stroke();for(let[d,u]of e.entries()){let m=a/2+u[0]*c,f=o/2-u[1]*c;i.beginPath(),i.arc(m,f,4,0,Math.PI*2),i.fillStyle="#77e2d2",i.fill(),i.fillText(String(d+1),m+7,f-6)}}ne("sketchPoints").textContent=e.map((d,u)=>`${u+1}: (${d[0]}, ${d[1]})`).join(" \xB7 ")}function r(a){if(e.length>=300)return Ze("Maximum 300 sketch points.",!0);if(!a.every(o=>Number.isFinite(o)&&Math.abs(o)<=1e4))return Ze("Invalid point.",!0);e.push(a),s()}t.addEventListener("pointerup",a=>{let o=t.getBoundingClientRect(),l=t.clientWidth/(Number(ne("sketchSpan").value)||120);r([Math.round((a.clientX-o.left-t.clientWidth/2)/l),Math.round((t.clientHeight/2-(a.clientY-o.top))/l)])}),ne("sketchSpan").onchange=s,ne("pointUndo").onclick=()=>{e.pop(),s()},ne("pointClear").onclick=()=>{e=[],s()},ne("pointAdd").onclick=()=>r([Number(ne("pointX").value),Number(ne("pointY").value)]),ne("extrude").onclick=async()=>{let a=ne("sketchError");try{rh(e);let o=Number(ne("sketchHeight").value);if(!(o>=.05&&o<=1e4))throw Error("Extrusion height must be 0.05\u201310000 mm.");if(!n&&Me.objects.length>=100)throw Error("Maximum 100 objects.");let l=structuredClone(Me),c=n?structuredClone(n):sr(ni("polygon",{points:e,h:o},[0,0,0],"Custom sketch"));c.params.points=e,c.params.h=o,c.layerId=n?.layerId||l.activeLayer,xi(!0),c.positionReference==="base"&&(c=(await ii("place",{object:c,position:c.placement,floor:l.buildPlaneEnabled===!0})).object),n?l.objects[l.objects.findIndex(h=>h.id===n.id)]=c:l.objects.push(c),Yt(l),Hi(l,await ii("check",{project:l,tolerance:.15})),xi(!1),Cn(()=>{Me=l,Dt=c.id}),jt()}catch(o){a.textContent=o.message}finally{xi(!1)}},requestAnimationFrame(s)}function hs(){qn("Your projects",`<div class="row">${gi("modelName","Project name",Me.name,"text")}<button id="renameProject" style="align-self:end">Rename</button></div><div class="row"><button class="primary" id="saveProject">Save project</button><button id="backupProject">Export project</button></div><p class="inlinehelp">Work autosaves on this device. Export a .tcad file to keep a portable, editable backup.</p><button class="full" id="openFile">Open .tcad / .avprefab / import STL</button><div class="sectionlabel">Start a project</div><div class="cards"><button data-template="blank">Blank project<small>Your own shapes and dimensions.</small></button><button data-template="plate">Mounting plate<small>70 \xD7 40 \xD7 6 mm \xB7 four 5 mm holes \xB7 rounded corners.</small></button><button data-template="tray">Open tray<small>100 \xD7 65 \xD7 28 mm \xB7 2.5 mm walls \xB7 4 mm bottom.</small></button></div><div class="sectionlabel">Saved on this device</div><div id="savedList">${Object.keys(pi).length?Object.entries(pi).sort((n,e)=>e[1].date-n[1].date).map(([n,e])=>`<div class="savedrow"><button data-load="${Wn(n)}">${Wn(e.project.name)}<small>${new Date(e.date).toLocaleString()} \xB7 ${e.project.objects.length} objects</small></button><button data-remove="${Wn(n)}" class="danger" aria-label="Remove saved project">\u2715</button></div>`).join(""):'<p class="subtle">Saved projects will appear here.</p>'}</div>`),ne("renameProject").onclick=()=>{Cn(()=>{Me.name=ne("modelName").value.trim().slice(0,80)||"My model"}),hs()},ne("saveProject").onclick=Lf,ne("backupProject").onclick=()=>Dl(JSON.stringify(Me,null,2),Ph()+".tcad","application/json"),ne("openFile").onclick=Nl,document.querySelectorAll("[data-template]").forEach(n=>n.onclick=()=>Al(()=>{Cn(()=>{Me={blank:Qs,plate:pl,tray:th}[n.dataset.template](),n.dataset.template==="blank"&&(Me.buildPlaneEnabled=!0),Dt=Me.objects.find(e=>We(e)===Me.activeLayer)?.id||null}),Yn(!0),jt()})),document.querySelectorAll("[data-load]").forEach(n=>n.onclick=()=>Al(()=>{Cn(()=>{Me=Pl(pi[n.dataset.load].project),Dt=Me.objects.find(e=>We(e)===Me.activeLayer)?.id||null}),Yn(!0),jt()})),document.querySelectorAll("[data-remove]").forEach(n=>n.onclick=()=>{let e=n.dataset.remove;qn("Remove saved copy?",`<p class="subtle">Remove \u201C${Wn(pi[e].project.name)}\u201D from the saved-project list? Your current model is kept open.</p><div class="row"><button id="cancelRemove">Cancel</button><button id="confirmRemove" class="danger">Remove saved copy</button></div>`),ne("cancelRemove").onclick=hs,ne("confirmRemove").onclick=()=>{delete pi[e];try{localStorage.setItem("tristancad.projects",JSON.stringify(pi)),hs()}catch{Ze("Could not update saved projects.",!0)}}})}function Lf(){let n=Me.savedId||Xt();Me.savedId=n,pi[n]={date:Date.now(),project:structuredClone(Me)};try{localStorage.setItem("tristancad.projects",JSON.stringify(pi)),Mh&&(localStorage.removeItem(Rl),Mh=!1),lr(),Ze("Project saved on this device."),hs()}catch{Ze("Project storage is full. Export a .tcad backup.",!0)}}function Al(n){if(!Me.objects.length)return n();qn("Start another project?",'<p class="subtle">Your current model is in Undo history. Save an editable backup before replacing it if you want to keep it long term.</p><div class="row"><button id="keepCurrent">Keep current</button><button id="replaceCurrent" class="primary">Continue</button></div>'),ne("keepCurrent").onclick=hs,ne("replaceCurrent").onclick=n}ne("projectMenu").onclick=hs;function Ph(){return(Me.name||"model").replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,64)||"model"}async function Dl(n,e,t){try{let i=typeof n=="string"?new TextEncoder().encode(n):new Uint8Array(n);if(window.AvalonDesktop){let s=await AvalonDesktop.saveFile(i,e);Ze(s.canceled?"Save canceled. Your model is still open.":s.name+" saved.")}else if(window.Android){Android.beginFile(e,t);for(let s=0;s<i.length;s+=24576){let r="";for(let a of i.subarray(s,s+24576))r+=String.fromCharCode(a);Android.appendFile(btoa(r))}Android.finishFile(),Ze("Choose where to save the file.")}else{let s=URL.createObjectURL(new Blob([i],{type:t})),r=document.createElement("a");r.href=s,r.download=e,r.click(),setTimeout(()=>URL.revokeObjectURL(s),2e3),Ze(e+" exported.")}}catch(i){Ze("Could not export the file: "+i.message,!0)}}function Df(){qn("Export a printable STL",`<p class="subtle">The STL adds the completed layers together. Each layer's cutouts affect only that layer. Dimensions use millimeters. The build plane is never included in this file.</p><div class="field"><label for="quality">Curve quality \xB7 target chord deviation</label><select id="quality"><option value="draft">Draft \xB7 0.15 mm \xB7 smallest file</option><option value="fine">Fine \xB7 0.03 mm</option><option value="ultra" selected>Ultra \xB7 0.01 mm \xB7 recommended</option><option value="maximum">Maximum \xB7 0.005 mm \xB7 larger file</option></select></div><p class="inlinehelp">More triangles make automatic curves smoother. Custom face counts stay faceted, and custom deviation settings override this quality for their shape. Roundovers still use the selected curve quality. Automatic curves are capped at 1,024 segments.</p><label class="toggle"><input type="checkbox" id="ground" checked>Place the lowest point on Z = 0 for printing</label><div class="metrics" id="exportMetrics">${mi?.bounds?"Size: <strong>"+mi.bounds.max.map((n,e)=>(n-mi.bounds.min[e]).toFixed(2)).join(" \xD7 ")+" mm</strong><br>Solid volume: <strong>"+(mi.volume/1e3).toFixed(2)+" cm\xB3</strong>":"Add an enabled solid shape to export."}</div><button class="primary full" id="downloadSTL" ${mi?.triangles.length?"":"disabled"}>Build & save .STL</button><div id="exportError" class="modalerror"></div>`,"HIGH-RESOLUTION MESH"),ne("downloadSTL").onclick=async()=>{let n=ne("downloadSTL");n.disabled=!0,n.textContent="Building high-resolution solid\u2026",ne("exportError").textContent="";try{let e=await ii("export",{project:structuredClone(Me),tolerance:Ud[ne("quality").value],ground:ne("ground").checked});ne("exportMetrics").innerHTML=`<strong>${e.triangles.toLocaleString()} triangles</strong><br>${(e.buffer.byteLength/1024/1024).toFixed(2)} MB \xB7 binary STL \xB7 millimeters<br>Solid volume: ${(e.volume/1e3).toFixed(2)} cm\xB3`,Dl(e.buffer,Ph()+".stl","model/stl")}catch(e){ne("exportError")?ne("exportError").textContent=e.message:Ze(e.message,!0)}finally{n.isConnected&&(n.disabled=!1,n.textContent="Build & save .STL")}}}ne("exportBtn").onclick=Df;async function Nl(){try{if(window.AvalonDesktop){let n=await AvalonDesktop.openFile();n.canceled||await Nf(n)}else window.Android?Android.openFile():ne("importFile").click()}catch(n){Ze("Could not open the file: "+n.message,!0)}}async function Nf(n){let e=n.bytes;if(!ArrayBuffer.isView(e))throw Error("Invalid imported file data.");await Ih(e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength),n.name)}ne("importFile").onchange=async n=>{let e=n.target.files[0];if(e)try{if(e.size>50*1024*1024)throw Error("Import is limited to 50 MB.");Ih(await e.arrayBuffer(),e.name)}catch(t){Ze(t.message,!0)}n.target.value=""};async function Ih(n,e){try{if(e.toLowerCase().endsWith(".stl")){if(Me.objects.length>=100)throw Error("Maximum 100 objects.");let t=Fd(n),i=ni("mesh",{mesh:t},[0,0,0],e.replace(/\.stl$/i,""));i.layerId=Me.activeLayer;let s=structuredClone(Me);s.objects.push(i),Yt(s),sr(i),us(i),Ze("Choose placement, then Apply to add the imported STL.")}else{let t=JSON.parse(new TextDecoder().decode(n));if(t.format==="avaloncad-prefab"||e.toLowerCase().endsWith(".avprefab")){await ar.importRecord(t);return}let i=Pl(t);Al(()=>{Cn(()=>{Me=i,Dt=i.objects.find(s=>We(s)===i.activeLayer)?.id||null}),Yn(!0),jt(),Ze("Editable project opened.")})}}catch(t){Ze("Import failed: "+t.message,!0)}}var Cl=[],Uf="";window.nativeImportStart=n=>{Uf=n,Cl=[]};window.nativeImportChunk=n=>{Cl.push(n)};window.nativeImportEnd=()=>{try{let n=atob(Cl.join("")),e=new Uint8Array(n.length);for(let t=0;t<n.length;t++)e[t]=n.charCodeAt(t);Ih(e.buffer,Uf)}catch{Ze("Could not read the selected file.",!0)}finally{Cl=[]}};window.nativeNotice=(n,e)=>Ze(n,e);function py(){qn("Make your first part",`<p class="subtle">AvalonCad 2.6.1 \xB7 an offline solid-modeling app built for your ${window.AvalonDesktop?AvalonDesktop.platform==="mac"?"Mac":"computer":"phone"}.</p><div class="helpitem"><b>1. Add and size a shape</b><p>Tap Add, check Smooth shape for high-resolution curves, choose a Primitive Object, then enter exact dimensions and tap Apply. Closing before Apply discards the new object. Inclined planes and pyramids are included. This app uses X for width, Y for depth and Z for height. New objects start at X=0, Y=0, Z=0 using their bottom center. Move them after adding. Build plane On prevents shapes from crossing below Z=0; Off allows negative Z. The plane is never exported.</p></div><div class="helpitem"><b>2. Make holes and cutouts</b><p>Add a cylinder or box. In Edit, switch Material to Cutout and position it through your solid. Cutouts remove overlapping material only on their layer. Use the Layers button to create or switch layers. Edit \u2192 Layer moves a shape between layers.</p></div><div class="helpitem"><b>3. Navigate with touch</b><p>In Select mode, drag to rotate. In Move, Stretch and Round modes, dragging the selected object edits it. Drag empty space to orbit, pinch to zoom, and use two fingers to pan. Tap a face to highlight it; double-tap the same face to select the whole shape. Tap an edge to enter Round mode, or open the Objects panel (\u2630, top left of the view) to select a shape. Long-press or Ctrl/Shift-tap adds shapes to a multi-selection. Use 3D / TOP / FRONT / RIGHT and the fit button to reset your view.</p></div><div class="helpitem"><b>4. Draw your own outline</b><p>Add \u2192 Draw a custom sketch. Tap XY points in order, or enter exact coordinates. Set an extrusion height to turn the outline into a solid. Lines must not cross.</p></div><div class="helpitem"><b>5. Export for printing</b><p>Export STL \u2192 Ultra or Maximum \u2192 Build & save. Open that STL in your slicer using millimeters. Separate, disconnected solids are exported together as separate shells.</p></div><div class="helpitem"><b>Threads and a clear view</b><p>Add \u2192 All-thread screw or Threaded tube. New threads default to Imperial. Edit lets you choose imperial diameter and threads per inch, or metric diameter and pitch, plus length, direction and radial fit clearance. Pull an end face in Stretch to add or remove turns while keeping pitch. Joined threaded parts must be separated before length changes. Clear removes all selections and editing markers.</p></div><div class="helpitem"><b>Reusable prefabs</b><p>Add \u2192 Prefabs \u2192 Save an assembly as a prefab, or Edit \u2192 Save as prefab. Save a selected object, active layer or entire model; choose whether to include subtractions. Saved shapes insert as independent drafts and are added only on Apply. Export/import .avprefab backups. Prefabs keep their own layers. Separate components restores those layers in fresh groups.</p></div><div class="helpitem"><b>Keep editable backups</b><p>The project menu saves projects on your device and exports .tcad backups. Work autosaves, but uninstalling or clearing app data removes local projects. STL files store mesh geometry; .tcad files keep editable shapes.</p></div><div class="helpitem"><b>Face resolution</b><p>In Edit, use Face resolution to choose automatic smooth, custom curve deviation or a fixed number of flat faces. For a sphere, enter 6 to make a six-face cube-like approximation; choose 4\u2013512 faces. Cylinders, cones and tubes support 3\u2013512 sides, and rounded boxes support 1\u2013128 segments per corner. Counts show polygon/surface faces separately from STL triangles. Fixed facets stay in STL even at Maximum quality. Changing the face layout clears existing roundovers on that shape; Undo restores them.</p></div><div class="helpitem"><b>Touch editing</b><p>Primitives, rounded box corners, sketch extrusion, global solid union and cutouts, exact positioning and rotation, STL import, undo/redo and STL export. Move mode gives X/Y/Z/XY dragging and center snapping. Stretch mode pulls a selected face and shows live dimensions. Round mode applies real edge fillets. Tap an edge once for that edge, twice for its face perimeter, or three times for every sharp edge on the shape. Drag or set one radius to round all selected edges uniformly. The All edges button gives the same selection. Select two or more solids on one layer, then tap Merge to fuse them into one physically connected object. Cutout shapes remove material only on their own layer. Merge fills overlapping Cutout areas by default. Keep existing holes preserves those cutouts and makes their edges roundable. Imported STL meshes support moving and stretching, but their triangle edges cannot use the parametric roundover tool. Reusable prefab assemblies are available from Add \u2192 Prefabs. Sketch constraints and STEP files are not available.</p></div><div class="helpitem"><b>Offline and private</b><p>No account, advertisements or analytics. Models stay on your device unless you export or share them yourself.</p></div><button class="full primary" id="loadExample">Try a mounting plate example</button>`),ne("loadExample").onclick=()=>Al(()=>{Cn(()=>{Me=pl(),Dt=Me.objects[0].id}),Yn(!0),jt()})}ne("helpBtn").onclick=py;window.handleBack=()=>et?.isCommitting()||aa?!0:ne("sheet").hidden?or?.isOpen()?(or.toggle(!1),!0):!1:(jt(),!0);et=af({canvas:sa,scene:mn,camera:Xn,controls:vn,project:()=>Me,current:yi,selected:()=>Dt,parts:()=>_i,select:Ah,refresh:Yn,request:ii,change:Cn,autosave:lr,dragVisual:()=>Cf(ea),record:n=>{Th(n,hn()),lr(),cr()},toast:Ze,openSheet:qn,closeSheet:jt,escape:Wn});ar=$d({project:()=>Me,current:yi,selection:hn,parts:()=>_i,commit:(n,e)=>wh(()=>{Me=n,Dt=e}),editDraft:us,place:n=>et.placeNew(n),request:ii,openSheet:qn,closeSheet:jt,escape:Wn,toast:Ze,saveFile:Dl,importDialog:Nl,lock:xi});or=of({project:()=>Me,selected:()=>Dt,selection:hn,select:Ah,toggleMulti:n=>et.toggleMulti(n),deselect:()=>et.deselect(),change:Cn,escape:Wn,editMenu:()=>us(),addMenu:Rh,mergeMenu:n=>et.mergeMenu(n),createPrefab:()=>ar.form({source:"selection"})});{let n=Tl.splice(0);n.length&&Ze(n.join(" "),n.length>1)}var my=Pd({project:()=>Me,change:Cn,current:yi,select:Ah,openSheet:qn,closeSheet:jt,escape:Wn,clear:()=>et.deselect()});ne("layersBtn").onclick=()=>{!et.isDragging()&&!et.isCommitting()&&my.menu()};window.__cad={touch:et,get project(){return Me},get selected(){return Dt},get historyLength(){return Yi.length},get model(){return mi},get display(){return Gn},get picks(){return _i},get scene(){return mn},request:ii,objectsPanel:or,selection:hn,load:n=>{Me=Pl(n),Dt=Me.objects.find(e=>We(e)===Me.activeLayer)?.id,Yn(!0)},templates:{blank:Qs,plate:pl,tray:th},exportMenu:Df};Yn(!0);if(window.AvalonDesktop){let n=document.createElement("div");n.id="desktopHelp",n.textContent="Drag to orbit \xB7 Shift/right-drag to pan \xB7 Scroll/pinch to zoom",ne("viewport").appendChild(n);let e=s=>{if(aa||et.isDragging()||et.isCommitting())return;let r=document.activeElement,a=r?.matches("input,textarea,[contenteditable=true]");if(["undo","redo"].includes(s)&&a){document.execCommand(s);return}if(s==="open")return Nl();if(s==="save"){Lf(),jt();return}if(s==="backup")return Dl(JSON.stringify(Me,null,2),Ph()+".tcad","application/json");if(s==="new"){hs(),document.querySelector('[data-template="blank"]').click();return}if(s.startsWith("view:"))return document.querySelector('[data-view="'+s.slice(5)+'"]')?.click();let o={add:"addBtn",edit:"editBtn",clear:"deselectBtn",fit:"fit",export:"exportBtn",undo:"undo",redo:"redo",help:"helpBtn"}[s];o&&ne(o).click()};AvalonDesktop.onAction(e),AvalonDesktop.onFile(s=>Nf(s).catch(r=>Ze(r.message,!0))),AvalonDesktop.onNotice(s=>Ze(s,!0)),document.addEventListener("keydown",s=>{if(s.key==="Escape"){ne("sheet").hidden?et.deselect():jt(),s.preventDefault();return}if(document.activeElement?.matches("input,textarea,select,[contenteditable=true]")||s.metaKey||s.ctrlKey||s.altKey)return;let r={a:"add",f:"fit",v:"clear"}[s.key.toLowerCase()];r&&(s.preventDefault(),e(r))});let t=()=>{let s={select:"Click a face \xB7 double-click for the whole shape \xB7 click an edge to round \xB7 Ctrl/Shift-click to multi-select",move:"Drag the object or X/Y/Z handles \xB7 centers snap",stretch:"Click a face to pull \xB7 double-click for the whole shape",round:"Edge clicks: 1 edge \xB7 2 face perimeter \xB7 3 all edges \xB7 drag to round"}[et.getState().mode];ne("touchHint").textContent!==s&&(ne("touchHint").textContent=s)};new MutationObserver(t).observe(ne("touchHint"),{childList:!0}),window.addEventListener("beforeunload",()=>{if(cs)try{localStorage.setItem(Rl,localStorage.getItem("tristancad.autosave")),cs=!1}catch{return}try{localStorage.setItem("tristancad.autosave",et.snapshotForSave())}catch{}}),new MutationObserver(t).observe(ne("touchModes"),{attributes:!0,subtree:!0}),t()}
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
