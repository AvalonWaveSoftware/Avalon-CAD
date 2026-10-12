const {app, BrowserWindow, Menu, dialog, ipcMain, protocol, session} = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const {exportPayload, readModel, writeModel} = require('./files.cjs');
const ORIGIN = 'avaloncad://app';
const ENTRY = ORIGIN + '/index.html';
const assets = path.join(__dirname, 'web');
let window = null, loaded = false, dialogBusy = false, importing = false;
const pendingFiles = [];

app.setName('AvalonCad');
app.setPath('userData', path.join(app.getPath('appData'), 'AvalonCad'));
app.commandLine.appendSwitch('disable-background-networking');
app.commandLine.appendSwitch('disable-component-update');
protocol.registerSchemesAsPrivileged([{scheme: 'avaloncad', privileges: {standard: true, secure: true, supportFetchAPI: true, corsEnabled: true}}]);

const filters = [{name: 'AvalonCad models and STL', extensions: ['tcad', 'avprefab', 'stl', 'json']}];
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
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {label: 'AvalonCad', submenu: [{role: 'about'}, {type: 'separator'}, {role: 'hide'}, {role: 'hideOthers'}, {role: 'unhide'}, {type: 'separator'}, {role: 'quit'}]},
    {label: 'File', submenu: [
      {label: 'New project', accelerator: 'CmdOrCtrl+N', click: invoke('new')},
      {label: 'Open project / prefab / STL…', accelerator: 'CmdOrCtrl+O', click: invoke('open')},
      {label: 'Save project on this Mac', accelerator: 'CmdOrCtrl+S', click: invoke('save')},
      {label: 'Export editable project…', accelerator: 'CmdOrCtrl+Shift+S', click: invoke('backup')},
      {label: 'Export STL…', accelerator: 'CmdOrCtrl+E', click: invoke('export')},
      {type: 'separator'}, {role: 'close'}
    ]},
    {label: 'Edit', submenu: [
      {label: 'Undo model change', accelerator: 'CmdOrCtrl+Z', click: invoke('undo')},
      {label: 'Redo model change', accelerator: 'CmdOrCtrl+Shift+Z', click: invoke('redo')},
      {type: 'separator'}, {role: 'cut'}, {role: 'copy'}, {role: 'paste'}, {role: 'selectAll'},
      {type: 'separator'}, {label: 'Add a Primitive Object', accelerator: 'CmdOrCtrl+Shift+A', click: invoke('add')},
      {label: 'Edit selected object', click: invoke('edit')}, {label: 'Deselect everything', click: invoke('clear')}
    ]},
    {label: 'View', submenu: [
      {label: 'Fit model', accelerator: 'CmdOrCtrl+0', click: invoke('fit')},
      ...[['3D view', 'iso'], ['Top', 'top'], ['Front', 'front'], ['Right', 'right']].map(([label, view]) => ({label, click: invoke('view:' + view)})),
      {type: 'separator'}, {role: 'togglefullscreen'}
    ]},
    {label: 'Window', submenu: [{role: 'minimize'}, {role: 'zoom'}, {role: 'front'}]},
    {label: 'Help', submenu: [{label: 'AvalonCad help', click: invoke('help')}]}
  ]));
}

async function createWindow() {
  loaded = false;
  window = new BrowserWindow({width: 1280, height: 860, minWidth: 880, minHeight: 660, title: 'AvalonCad', backgroundColor: '#10191f', show: false,
    webPreferences: {preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false, webSecurity: true, spellcheck: false, webviewTag: false}});
  window.webContents.setWindowOpenHandler(() => ({action: 'deny'}));
  window.webContents.on('will-navigate', (event, url) => { if (url !== ENTRY) event.preventDefault(); });
  window.on('closed', () => { window = null; loaded = false; });
  window.once('ready-to-show', () => { if (window) window.show(); });
  window.webContents.on('did-finish-load', () => { loaded = true; drainImports(); });
  await window.loadURL(ENTRY);
}

app.on('open-file', (event, file) => { event.preventDefault(); pendingFiles.push(file); drainImports(); });
if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on('second-instance', () => { if (window) { if (window.isMinimized()) window.restore(); window.focus(); } });
  app.whenReady().then(async () => {
    const mime = {'.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.py': 'text/plain', '.wasm': 'application/wasm'};
    protocol.handle('avaloncad', async request => {
      try {
        const url = new URL(request.url);
        if (url.host !== 'app' || !['GET', 'HEAD'].includes(request.method)) return new Response('Forbidden', {status: 403});
        const filename = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
        const target = await fs.realpath(path.resolve(assets, filename));
        if (!target.startsWith(assets + path.sep)) return new Response('Forbidden', {status: 403});
        const body = request.method === 'HEAD' ? null : await fs.readFile(target);
        return new Response(body, {headers: {'Content-Type': mime[path.extname(target)] || 'application/octet-stream', 'Cache-Control': 'no-store'}});
      } catch { return new Response('Not found', {status: 404}); }
    });
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    session.defaultSession.webRequest.onBeforeRequest({urls: ['<all_urls>']}, (details, callback) => {
      const local = details.url.startsWith(ORIGIN + '/') || details.url.startsWith('blob:' + ORIGIN + '/') || details.url.startsWith('data:');
      callback({cancel: !local});
    });
    ipcMain.handle('avalon:save', async (event, value) => {
      if (!trusted(event)) throw Error('File request is not from AvalonCad.');
      if (dialogBusy) return {canceled: true};
      const payload = exportPayload(value); dialogBusy = true;
      try {
        const selected = await dialog.showSaveDialog(window, {title: 'Save ' + payload.name, defaultPath: path.join(app.getPath('documents'), payload.name), filters: [{name: payload.extension === '.stl' ? 'STL model' : 'AvalonCad editable file', extensions: [payload.extension.slice(1)]}], properties: ['createDirectory', 'showOverwriteConfirmation']});
        if (selected.canceled || !selected.filePath) return {canceled: true};
        await writeModel(selected.filePath, payload.bytes);
        return {canceled: false, name: path.basename(selected.filePath)};
      } finally { dialogBusy = false; }
    });
    ipcMain.handle('avalon:open', async event => {
      if (!trusted(event)) throw Error('File request is not from AvalonCad.');
      if (dialogBusy) return {canceled: true};
      dialogBusy = true;
      try {
        const selected = await dialog.showOpenDialog(window, {title: 'Open AvalonCad project, prefab or STL', filters, properties: ['openFile']});
        if (selected.canceled || !selected.filePaths.length) return {canceled: true};
        return {canceled: false, ...await readModel(selected.filePaths[0])};
      } finally { dialogBusy = false; }
    });
    menus(); await createWindow();
    app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow(); });
  }).catch(error => { dialog.showErrorBox('AvalonCad could not start', String(error.message)); app.quit(); });
}
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
