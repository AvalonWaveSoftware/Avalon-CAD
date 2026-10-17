'use strict';
// Avalon CAD desktop wrapper (Electron) for Linux (RPM/Arch) and macOS.
// Serves the bundled web app from a private, privileged app://avalon-cad origin: no TCP
// port is opened, all requests stay local, and network access is blocked.
const {app, BrowserWindow, Menu, dialog, ipcMain, protocol, session, shell} = require('electron');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const path = require('node:path');
const {Readable} = require('stream');
const {exportPayload, readModel, writeModel} = require('./files.cjs');
// Scheme, host and app name must stay stable: localStorage projects are keyed by origin
// and stored under userData ("Avalon CAD"), so changing either orphans saved projects.
const SCHEME = 'app', HOST = 'avalon-cad';
const ORIGIN = `${SCHEME}://${HOST}`;
const ENTRY = ORIGIN + '/index.html';
const isMac = process.platform === 'darwin';
function webRoot() {
  if (process.env.AVALON_WEB_DIR) return path.resolve(process.env.AVALON_WEB_DIR);
  const candidates = [];
  if (app.isPackaged) candidates.push(path.join(process.resourcesPath, 'web'));
  candidates.push(path.join(__dirname, 'build', 'web'), path.join(__dirname, 'web'));
  return candidates.find(dir => { try { return fsSync.statSync(path.join(dir, 'index.html')).isFile(); } catch { return false; } }) || candidates[0];
}
const assets = webRoot();
const startup = (() => { try { return JSON.parse(fsSync.readFileSync(path.join(assets, 'perf-flags.json'), 'utf8')); } catch { return {}; } })();
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.py': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.wasm': 'application/wasm', '.zip': 'application/zip',
  '.svg': 'image/svg+xml', '.png': 'image/png'
};
const smokeArg = process.argv.find(a => a.startsWith('--smoke-test'));
const smokeShot = smokeArg && smokeArg.includes('=') ? smokeArg.split('=').slice(1).join('=') : null;
let window = null, loaded = false, dialogBusy = false, importing = false;
const pendingFiles = [];

app.setName('Avalon CAD');
// Pin userData to the original 'Avalon CAD' directory regardless of how the app was packaged.
app.setPath('userData', path.join(app.getPath('appData'), 'Avalon CAD'));
if (process.platform === 'linux') app.commandLine.appendSwitch('class', 'avalon-cad');
app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('disable-component-update');
// The viewport needs WebGL 2. Chromium blocklists some Linux drivers (e.g. llvmpipe in
// VMs), so ignore the blocklist. AVALON_SOFTWARE_GL=1 forces SwiftShader rendering.
app.commandLine.appendSwitch('ignore-gpu-blocklist');
if (process.env.AVALON_SOFTWARE_GL === '1') {
  app.commandLine.appendSwitch('use-gl', 'angle');
  app.commandLine.appendSwitch('use-angle', 'swiftshader');
  app.commandLine.appendSwitch('enable-unsafe-swiftshader');
}
protocol.registerSchemesAsPrivileged([{scheme: SCHEME, privileges: {standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true, codeCache: true}}]);

const filters = [{name: 'Avalon CAD models and STL', extensions: ['tcad', 'avprefab', 'stl', 'json']}];
function sendAction(action) { if (loaded && window && !window.isDestroyed()) window.webContents.send('avalon:action', action); }
function trusted(event) { return window && event.sender === window.webContents && event.senderFrame === window.webContents.mainFrame && event.senderFrame.url.startsWith(ORIGIN + '/'); }

async function drainImports() {
  if (!loaded || importing || !window || window.isDestroyed()) return;
  importing = true;
  try {
    while (pendingFiles.length) {
      const file = pendingFiles.shift();
      try { window.webContents.send('avalon:file', await readModel(file)); }
      catch (error) { window.webContents.send('avalon:notice', String(error.message)); }
    }
  } finally { importing = false; }
}

function menus() {
  const invoke = action => () => sendAction(action);
  const fileMenu = {label: 'File', submenu: [
    {label: 'New project', accelerator: 'CmdOrCtrl+N', click: invoke('new')},
    {label: 'Open project / prefab / STL…', accelerator: 'CmdOrCtrl+O', click: invoke('open')},
    {label: isMac ? 'Save project on this Mac' : 'Save project on this computer', accelerator: 'CmdOrCtrl+S', click: invoke('save')},
    {label: 'Export editable project…', accelerator: 'CmdOrCtrl+Shift+S', click: invoke('backup')},
    {label: 'Export STL…', accelerator: 'CmdOrCtrl+E', click: invoke('export')},
    {type: 'separator'}, isMac ? {role: 'close'} : {role: 'quit'}
  ]};
  const template = [
    ...(isMac ? [{label: 'Avalon CAD', submenu: [{role: 'about'}, {type: 'separator'}, {role: 'hide'}, {role: 'hideOthers'}, {role: 'unhide'}, {type: 'separator'}, {role: 'quit'}]}] : []),
    fileMenu,
    {label: 'Edit', submenu: [
      {label: 'Undo model change', accelerator: 'CmdOrCtrl+Z', click: invoke('undo')},
      {label: 'Redo model change', accelerator: isMac ? 'CmdOrCtrl+Shift+Z' : 'Ctrl+Y', click: invoke('redo')},
      {type: 'separator'}, {role: 'cut'}, {role: 'copy'}, {role: 'paste'}, {role: 'selectAll'},
      {type: 'separator'}, {label: 'Add a Primitive Object', accelerator: 'CmdOrCtrl+Shift+A', click: invoke('add')},
      {label: 'Edit selected object', click: invoke('edit')}, {label: 'Deselect everything', click: invoke('clear')}
    ]},
    {label: 'View', submenu: [
      {label: 'Fit model', accelerator: 'CmdOrCtrl+0', click: invoke('fit')},
      ...[['3D view', 'iso'], ['Top', 'top'], ['Front', 'front'], ['Right', 'right']].map(([label, view]) => ({label, click: invoke('view:' + view)})),
      {type: 'separator'}, {role: 'togglefullscreen'}
    ]},
    {label: 'Window', submenu: isMac ? [{role: 'minimize'}, {role: 'zoom'}, {role: 'front'}] : [{role: 'minimize'}, {role: 'close'}]},
    {label: 'Help', submenu: [{label: 'Avalon CAD help', click: invoke('help')}]}
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function createWindow() {
  loaded = false;
  window = new BrowserWindow({width: 1280, height: 860, minWidth: 880, minHeight: 660, title: 'Avalon CAD', backgroundColor: '#10191f',
    show: !smokeArg ? false : !!process.env.DISPLAY, autoHideMenuBar: !isMac,
    icon: app.isPackaged || isMac ? undefined : path.join(__dirname, 'build', 'icons', '512x512.png'),
    webPreferences: {preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false, webSecurity: true, spellcheck: false, webviewTag: false,
      // WS8: write the V8 code cache on the first run (default: only from the second), so the second launch uses it.
      ...(startup.PARALLEL_INIT === true ? {v8CacheOptions: 'bypassHeatCheck'} : {}),
      devTools: !app.isPackaged || !!process.env.AVALON_DEVTOOLS}});
  window.webContents.setWindowOpenHandler(({url} = {}) => {
    if (typeof url === 'string' && /^https:\/\//.test(url)) shell.openExternal(url);
    return {action: 'deny'};
  });
  window.webContents.on('will-navigate', (event, url) => { if (url !== ENTRY) event.preventDefault(); });
  window.on('page-title-updated', event => { event.preventDefault(); if (window) window.setTitle('Avalon CAD'); });
  window.on('closed', () => { window = null; loaded = false; });
  if (!smokeArg) window.once('ready-to-show', () => { if (window) window.show(); });
  window.webContents.on('did-finish-load', () => { loaded = true; drainImports(); });
  if (smokeArg) runSmoke(window);
  await window.loadURL(ENTRY);
}

function runSmoke(win) {
  const errors = [], external = [];
  const wc = win.webContents;
  wc.on('console-message', event => {
    const {level, message, sourceId, lineNumber} = event;
    const line = `[console:${level}] ${message} (${sourceId}:${lineNumber})`;
    console.log(line);
    if (level === 'error' || level === 3) errors.push(line);
  });
  wc.on('render-process-gone', (_e, d) => { errors.push('render-process-gone ' + JSON.stringify(d)); });
  session.defaultSession.webRequest.onBeforeRequest((d, cb) => {
    if (!d.url.startsWith(ORIGIN + '/') && !/^(blob|data|devtools|chrome-extension):/.test(d.url)) external.push(d.url);
    cb({});
  });
  const fail = msg => { console.log('SMOKE FAIL: ' + msg); app.exit(1); };
  const timer = setTimeout(() => fail('timeout waiting for engines'), 180000);
  wc.once('did-finish-load', async () => {
    try {
      const t0 = Date.now();
      const engine = await wc.executeJavaScript(`new Promise(res=>{const t=setInterval(()=>{const e=window.__cad?.model?.engine;if(e&&e.local){clearInterval(t);res(e);}},250);})`);
      const initMs = Date.now() - t0;
      const info = await wc.executeJavaScript(`({isolated: self.crossOriginIsolated, webgl2: !!document.createElement('canvas').getContext('webgl2'), sab: typeof SharedArrayBuffer, desktop: !!window.AvalonDesktop, platform: window.AvalonDesktop?.platform, ua: navigator.userAgent})`);
      await wc.executeJavaScript(`(async()=>{const $=id=>document.getElementById(id);$('addBtn').click();document.querySelector('[data-shape="box"]').click();
        const set=(id,v)=>{const el=$(id);if(el){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}};
        set('p_w','40');set('p_d','30');set('p_h','10');$('applyObject').click();})()`);
      const objects = await wc.executeJavaScript(`new Promise(res=>{let n=0;const t=setInterval(()=>{const c=window.__cad;const k=c?.project?.objects?.length||0;const tri=c?.model?.triangles?.length||c?.model?.parts?.length||0;if((k>0&&tri>0)||++n>240){clearInterval(t);res({objects:k,meshReady:tri>0,busy:document.getElementById('busy')?.textContent});}},250);})`);
      await new Promise(r => setTimeout(r, 1500));
      const result = {engine, initMs, ...info, ...objects, consoleErrors: errors, externalRequests: external};
      console.log('SMOKE RESULT ' + JSON.stringify(result));
      if (smokeShot) { const img = await wc.capturePage(); fsSync.writeFileSync(smokeShot, img.toPNG()); console.log('SMOKE SCREENSHOT ' + smokeShot); }
      clearTimeout(timer);
      const ok = engine.python && engine.rust && engine.local && info.isolated && objects.objects > 0 && errors.length === 0 && external.length === 0;
      console.log(ok ? 'SMOKE PASS' : 'SMOKE FAIL');
      app.exit(ok ? 0 : 1);
    } catch (e) { fail(e.stack || String(e)); }
  });
}

app.on('open-file', (event, file) => { event.preventDefault(); pendingFiles.push(file); drainImports(); });
if (!smokeArg && !app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (window) { if (window.isMinimized()) window.restore(); window.focus(); } });
  app.whenReady().then(async () => {
    protocol.handle(SCHEME, async request => {
      try {
        const url = new URL(request.url);
        if (url.host !== HOST || !['GET', 'HEAD'].includes(request.method)) return new Response('Forbidden', {status: 403});
        const filename = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
        const root = await fs.realpath(assets);
        const target = await fs.realpath(path.resolve(root, filename));
        if (!target.startsWith(root + path.sep)) return new Response('Forbidden', {status: 403});
        // WS8 (PARALLEL_INIT): stream the file and let ?v=<version> assets be cached for good, so codeCache takes effect.
        const streamed = startup.PARALLEL_INIT === true, versioned = streamed && url.searchParams.get('v') === startup.version;
        let body = null, extra = {};
        if (request.method !== 'HEAD') {
          if (streamed) { const stat = await fs.stat(target); body = Readable.toWeb(fsSync.createReadStream(target)); extra = {'content-length': String(stat.size), 'last-modified': stat.mtime.toUTCString(), 'date': new Date().toUTCString()}; }
          else body = await fs.readFile(target);
        }
        return new Response(body, {status: 200, headers: {
          'Content-Type': MIME[path.extname(target).toLowerCase()] || 'application/octet-stream',
          'Cache-Control': versioned ? 'public, max-age=31536000, immutable' : 'no-store', ...extra,
          // Cross-origin isolation (crossOriginIsolated / SharedArrayBuffer); every resource is same-origin.
          'Cross-Origin-Opener-Policy': 'same-origin', 'Cross-Origin-Embedder-Policy': 'require-corp',
          'Cross-Origin-Resource-Policy': 'same-origin', 'X-Content-Type-Options': 'nosniff'}});
      } catch { return new Response('Not found', {status: 404}); }
    });
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    if (!smokeArg) session.defaultSession.webRequest.onBeforeRequest({urls: ['<all_urls>']}, (details, callback) => {
      const local = details.url.startsWith(ORIGIN + '/') || details.url.startsWith('blob:' + ORIGIN + '/') || details.url.startsWith('data:');
      callback({cancel: !local});
    });
    ipcMain.handle('avalon:save', async (event, value) => {
      if (!trusted(event)) throw Error('File request is not from Avalon CAD.');
      if (dialogBusy) return {canceled: true};
      const payload = exportPayload(value); dialogBusy = true;
      try {
        const selected = await dialog.showSaveDialog(window, {title: 'Save ' + payload.name, defaultPath: path.join(app.getPath('documents'), payload.name), filters: [{name: payload.extension === '.stl' ? 'STL model' : 'Avalon CAD editable file', extensions: [payload.extension.slice(1)]}], properties: ['createDirectory', 'showOverwriteConfirmation']});
        if (selected.canceled || !selected.filePath) return {canceled: true};
        await writeModel(selected.filePath, payload.bytes);
        return {canceled: false, name: path.basename(selected.filePath)};
      } finally { dialogBusy = false; }
    });
    ipcMain.handle('avalon:open', async event => {
      if (!trusted(event)) throw Error('File request is not from Avalon CAD.');
      if (dialogBusy) return {canceled: true};
      dialogBusy = true;
      try {
        const selected = await dialog.showOpenDialog(window, {title: 'Open Avalon CAD project, prefab or STL', filters, properties: ['openFile']});
        if (selected.canceled || !selected.filePaths.length) return {canceled: true};
        return {canceled: false, ...await readModel(selected.filePaths[0])};
      } finally { dialogBusy = false; }
    });
    menus(); await createWindow();
    app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
  }).catch(error => { dialog.showErrorBox('Avalon CAD could not start', String(error.message)); app.quit(); });
}
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
