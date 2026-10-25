import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {EventEmitter} from 'node:events';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),stage=path.resolve('build/desktop-stage'),temporary=await fs.mkdtemp('/tmp/avalon-shell-test-');
const ipc=new Map(),protocols=new Map(),permissions={};let menu,window,opened=[],external=[],saveCanceled=false;
class Contents extends EventEmitter{constructor(){super();this.mainFrame={url:'app://avalon-cad/index.html'};}setWindowOpenHandler(fn){this.popup=fn;}send(...args){opened.push(args);}}
class Window extends EventEmitter{constructor(options){super();this.options=options;this.webContents=new Contents();window=this;}async loadURL(url){assert.equal(url,this.webContents.mainFrame.url);this.webContents.emit('did-finish-load');}isDestroyed(){return false;}show(){}static getAllWindows(){return [window];}}
const app=new EventEmitter();const pinned={};app.setName=n=>pinned.name=n;app.setPath=(k,v)=>pinned[k]=v;app.getPath=()=>temporary;app.commandLine={appendSwitch(){}};app.requestSingleInstanceLock=()=>true;app.whenReady=()=>Promise.resolve();app.quit=()=>{};
const fake={app,shell:{openExternal:url=>external.push(url)},BrowserWindow:Window,Menu:{buildFromTemplate:x=>x,setApplicationMenu:x=>menu=x},protocol:{registerSchemesAsPrivileged:x=>permissions.schemes=x,handle:(name,fn)=>protocols.set(name,fn)},ipcMain:{handle:(name,fn)=>ipc.set(name,fn)},dialog:{showSaveDialog:async()=>({canceled:saveCanceled,filePath:path.join(temporary,'part.stl')}),showOpenDialog:async()=>({canceled:false,filePaths:[path.join(temporary,'phone.tcad')]}),showErrorBox(_title,message){throw Error(message);}},session:{defaultSession:{setPermissionRequestHandler:fn=>permissions.request=fn,setPermissionCheckHandler:fn=>permissions.check=fn,webRequest:{onBeforeRequest:(_filter,fn)=>permissions.network=fn}}}};
const sandbox={require:name=>name==='electron'?fake:name.startsWith('./')?require(path.join(stage,name)):require(name),__dirname:stage,Response,URL,console,process:{platform:'darwin',env:{},argv:['electron','.']}};
vm.runInNewContext(await fs.readFile(path.join(stage,'main.cjs'),'utf8'),sandbox);
for(let i=0;i<50&&!window;i++)await new Promise(r=>setTimeout(r,10));assert.ok(window);await new Promise(r=>setTimeout(r,10));
assert.equal(window.options.webPreferences.contextIsolation,true);assert.equal(window.options.webPreferences.sandbox,true);assert.equal(window.options.webPreferences.nodeIntegration,false);assert.equal(permissions.schemes[0].privileges.standard,true);assert.equal(permissions.check(),false);assert.equal(window.webContents.popup({url:'https://example.com/docs'}).action,'deny');assert.equal(window.webContents.popup({url:'http://example.com/'}).action,'deny');assert.deepEqual(external,['https://example.com/docs']);assert.equal(window.options.webPreferences.devTools,true);
// WS7: with JS_ENGINE no Python is shipped; the notices file is the plain-text asset that exercises the same headers.
const {JS_ENGINE}=await import('../web/perf-flags.mjs');const local=await protocols.get('app')({url:JS_ENGINE?'app://avalon-cad/THIRD_PARTY_NOTICES.txt':'app://avalon-cad/python/model_jobs.py',method:'GET'});assert.equal(local.status,200);assert.ok((await local.text()).includes(JS_ENGINE?'manifold':'def process_job'));for(const [k,v] of [['cross-origin-opener-policy','same-origin'],['cross-origin-embedder-policy','require-corp'],['cross-origin-resource-policy','same-origin'],['x-content-type-options','nosniff'],['content-type','text/plain; charset=utf-8']])assert.equal(local.headers.get(k),v);assert.equal((await protocols.get('app')({url:'app://avalon-cad/index.html',method:'GET'})).headers.get('content-type'),'text/html; charset=utf-8');assert.equal((await protocols.get('app')({url:'app://other/index.html',method:'GET'})).status,403);
// WS8: with PARALLEL_INIT ?v=<version> assets are streamed and immutable (code cache); everything else stays no-store.
{const {PARALLEL_INIT}=await import('../web/perf-flags.mjs'),get=url=>protocols.get('app')({url,method:'GET'});
 const versioned=await get('app://avalon-cad/manifold.wasm?v=2.7.2'),plain=await get('app://avalon-cad/index.html'),stale=await get('app://avalon-cad/manifold.wasm?v=0.0.1');
 assert.equal(versioned.headers.get('cache-control'),PARALLEL_INIT?'public, max-age=31536000, immutable':'no-store');
 for(const r of [plain,stale])assert.equal(r.headers.get('cache-control'),'no-store');
 const wasm=new Uint8Array(await versioned.arrayBuffer());assert.deepEqual([...wasm.slice(0,4)],[0,97,115,109]);
 const disk=await fs.readFile('build/desktop-stage/web/manifold.wasm').catch(()=>fs.readFile('app/assets/manifold.wasm'));assert.equal(wasm.length,disk.length);
 assert.equal(versioned.headers.get('cross-origin-embedder-policy'),'require-corp');}
const escaped=await protocols.get('app')({url:'app://avalon-cad/%2e%2e%2fmain.cjs',method:'GET'});assert.equal(escaped.status,403);
for(const [url,cancel] of [['app://avalon-cad/main.js',false],['https://example.com/',true],['file:///etc/passwd',true]])permissions.network({url},value=>assert.equal(value.cancel,cancel));
const event={sender:window.webContents,senderFrame:window.webContents.mainFrame},save=ipc.get('avalon:save');await assert.rejects(save({...event,senderFrame:{url:event.senderFrame.url}},{name:'part.stl',bytes:new Uint8Array(1)}),/not from Avalon CAD/);
const payload={name:'part.stl',bytes:new Uint8Array([1,2,3,4])};assert.equal((await save(event,payload)).canceled,false);assert.deepEqual([...await fs.readFile(path.join(temporary,'part.stl'))],[1,2,3,4]);saveCanceled=true;assert.equal((await save(event,{...payload,bytes:new Uint8Array([9])})).canceled,true);assert.deepEqual([...await fs.readFile(path.join(temporary,'part.stl'))],[1,2,3,4]);
await fs.writeFile(path.join(temporary,'phone.tcad'),'phone model');const file=await ipc.get('avalon:open')(event);assert.equal(file.name,'phone.tcad');assert.equal(Buffer.from(file.bytes).toString(),'phone model');
// ADR-0001 android-app-id: the app ID moved to com.avalonwavesoftware.cad everywhere; userData stays pinned to 'Avalon CAD' by name.
assert.equal(pinned.name,'Avalon CAD');assert.equal(pinned.userData,path.join(temporary,'Avalon CAD'));
{const pkg=JSON.parse(await fs.readFile('desktop/package.json','utf8'));assert.equal(pkg.build.appId,'com.avalonwavesoftware.cad');assert.equal(pkg.build.rpm.packageName,'avalon-cad');
 assert.match(await fs.readFile('desktop/build-mac.mjs','utf8'),/appBundleId: 'com\.avalonwavesoftware\.cad'/);}
const fileMenu=menu.find(x=>x.label==='File');assert.equal(fileMenu.submenu[1].accelerator,'CmdOrCtrl+O');assert.equal(fileMenu.submenu[4].accelerator,'CmdOrCtrl+E');
console.log('PASS: actual desktop main-process handlers: local asset protocol and path confinement, restricted frame IPC, native save/open byte transport, cancel protection, Mac menu shortcuts, COOP/COEP/CORP/nosniff headers, https-only external links, original app://avalon-cad origin, isolated renderer configuration and blocked external requests. Electron objects mocked; native Mac execution not claimed.');
