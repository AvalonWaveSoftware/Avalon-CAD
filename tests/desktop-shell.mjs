import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import {EventEmitter} from 'node:events';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),stage=path.resolve('build/desktop-stage'),temporary=await fs.mkdtemp('/tmp/avalon-shell-test-');
const ipc=new Map(),protocols=new Map(),permissions={};let menu,window,opened=[],saveCanceled=false;
class Contents extends EventEmitter{constructor(){super();this.mainFrame={url:'avaloncad://app/index.html'};}setWindowOpenHandler(fn){this.popup=fn;}send(...args){opened.push(args);}}
class Window extends EventEmitter{constructor(options){super();this.options=options;this.webContents=new Contents();window=this;}async loadURL(url){assert.equal(url,this.webContents.mainFrame.url);this.webContents.emit('did-finish-load');}isDestroyed(){return false;}show(){}static getAllWindows(){return [window];}}
const app=new EventEmitter();app.setName=()=>{};app.setPath=()=>{};app.getPath=()=>temporary;app.commandLine={appendSwitch(){}};app.requestSingleInstanceLock=()=>true;app.whenReady=()=>Promise.resolve();app.quit=()=>{};
const fake={app,BrowserWindow:Window,Menu:{buildFromTemplate:x=>x,setApplicationMenu:x=>menu=x},protocol:{registerSchemesAsPrivileged:x=>permissions.schemes=x,handle:(name,fn)=>protocols.set(name,fn)},ipcMain:{handle:(name,fn)=>ipc.set(name,fn)},dialog:{showSaveDialog:async()=>({canceled:saveCanceled,filePath:path.join(temporary,'part.stl')}),showOpenDialog:async()=>({canceled:false,filePaths:[path.join(temporary,'phone.tcad')]}),showErrorBox(_title,message){throw Error(message);}},session:{defaultSession:{setPermissionRequestHandler:fn=>permissions.request=fn,setPermissionCheckHandler:fn=>permissions.check=fn,webRequest:{onBeforeRequest:(_filter,fn)=>permissions.network=fn}}}};
const sandbox={require:name=>name==='electron'?fake:name.startsWith('./')?require(path.join(stage,name)):require(name),__dirname:stage,Response,URL,console,process:{platform:'darwin'}};
vm.runInNewContext(await fs.readFile(path.join(stage,'main.cjs'),'utf8'),sandbox);
for(let i=0;i<50&&!window;i++)await new Promise(r=>setTimeout(r,10));assert.ok(window);await new Promise(r=>setTimeout(r,10));
assert.equal(window.options.webPreferences.contextIsolation,true);assert.equal(window.options.webPreferences.sandbox,true);assert.equal(window.options.webPreferences.nodeIntegration,false);assert.equal(permissions.schemes[0].privileges.standard,true);assert.equal(permissions.check(),false);assert.equal(window.webContents.popup().action,'deny');
const local=await protocols.get('avaloncad')({url:'avaloncad://app/python/model_jobs.py',method:'GET'});assert.equal(local.status,200);assert.ok((await local.text()).includes('def process_job'));
const escaped=await protocols.get('avaloncad')({url:'avaloncad://app/%2e%2e%2fmain.cjs',method:'GET'});assert.equal(escaped.status,403);
for(const [url,cancel] of [['avaloncad://app/main.js',false],['https://example.com/',true],['file:///etc/passwd',true]])permissions.network({url},value=>assert.equal(value.cancel,cancel));
const event={sender:window.webContents,senderFrame:window.webContents.mainFrame},save=ipc.get('avalon:save');await assert.rejects(save({...event,senderFrame:{url:event.senderFrame.url}},{name:'part.stl',bytes:new Uint8Array(1)}),/not from AvalonCad/);
const payload={name:'part.stl',bytes:new Uint8Array([1,2,3,4])};assert.equal((await save(event,payload)).canceled,false);assert.deepEqual([...await fs.readFile(path.join(temporary,'part.stl'))],[1,2,3,4]);saveCanceled=true;assert.equal((await save(event,{...payload,bytes:new Uint8Array([9])})).canceled,true);assert.deepEqual([...await fs.readFile(path.join(temporary,'part.stl'))],[1,2,3,4]);
await fs.writeFile(path.join(temporary,'phone.tcad'),'phone model');const file=await ipc.get('avalon:open')(event);assert.equal(file.name,'phone.tcad');assert.equal(Buffer.from(file.bytes).toString(),'phone model');
const fileMenu=menu.find(x=>x.label==='File');assert.equal(fileMenu.submenu[1].accelerator,'CmdOrCtrl+O');assert.equal(fileMenu.submenu[4].accelerator,'CmdOrCtrl+E');
console.log('PASS: actual desktop main-process handlers: local asset protocol and path confinement, restricted frame IPC, native save/open byte transport, cancel protection, Mac menu shortcuts, isolated renderer configuration and blocked external requests. Electron objects mocked; native Mac execution not claimed.');
