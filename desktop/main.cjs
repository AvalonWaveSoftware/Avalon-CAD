'use strict';
// Avalon CAD desktop wrapper (Electron).
// Serves the bundled web app (app/assets) from a private, privileged app:// origin:
// no TCP port is opened, all requests stay local, and network access is blocked.
const {app, BrowserWindow, protocol, session, shell, Menu} = require('electron');
const fs = require('node:fs');
const path = require('node:path');

const SCHEME = 'app';
const HOST = 'avalon-cad';
const ORIGIN = `${SCHEME}://${HOST}`;
const WEB_ROOT = process.env.AVALON_WEB_DIR
  ? path.resolve(process.env.AVALON_WEB_DIR)
  : app.isPackaged ? path.join(process.resourcesPath, 'web') : path.join(__dirname, 'build', 'web');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.py': 'text/plain; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.zip': 'application/zip',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

const smokeArg = process.argv.find(a => a.startsWith('--smoke-test'));
const smokeShot = smokeArg && smokeArg.includes('=') ? smokeArg.split('=').slice(1).join('=') : null;

// Must run before app 'ready'. "standard"+"secure" gives a stable secure origin, so
// localStorage projects persist between launches and WASM/module workers/fetch work.
protocol.registerSchemesAsPrivileged([{
  scheme: SCHEME,
  privileges: {standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true, codeCache: true},
}]);

app.setName('Avalon CAD');
if (process.platform === 'linux') app.commandLine.appendSwitch('class', 'avalon-cad');
// The viewport needs WebGL 2. Chromium blocklists some Linux drivers (e.g. llvmpipe in
// VMs) which would leave the app unusable, so ignore the blocklist. Set
// AVALON_SOFTWARE_GL=1 to force SwiftShader software rendering if a GPU driver misbehaves.
app.commandLine.appendSwitch('ignore-gpu-blocklist');
if (process.env.AVALON_SOFTWARE_GL === '1') {
  app.commandLine.appendSwitch('use-gl', 'angle');
  app.commandLine.appendSwitch('use-angle', 'swiftshader');
  app.commandLine.appendSwitch('enable-unsafe-swiftshader');
}
const single = smokeArg ? true : app.requestSingleInstanceLock();
if (!single) app.quit();

function serve(request) {
  const url = new URL(request.url);
  if (url.host !== HOST) return new Response('Blocked', {status: 403});
  let rel = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
  const file = path.resolve(WEB_ROOT, rel);
  if (!file.startsWith(WEB_ROOT + path.sep)) return new Response('Forbidden', {status: 403});
  let data;
  try { data = fs.readFileSync(file); } catch { return new Response('Not Found', {status: 404}); }
  return new Response(data, {
    status: 200,
    headers: {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      // Cross-origin isolation (enables SharedArrayBuffer should the engines use it);
      // every resource is same-origin, so this is safe.
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 360, minHeight: 560,
    title: 'Avalon CAD', backgroundColor: '#10191f', show: !smokeArg || !!process.env.DISPLAY,
    icon: app.isPackaged ? undefined : path.join(__dirname, 'build', 'icons', '512x512.png'),
    autoHideMenuBar: true,
    webPreferences: {contextIsolation: true, nodeIntegration: false, sandbox: true, spellcheck: false, devTools: !app.isPackaged || !!process.env.AVALON_DEVTOOLS},
  });
  win.webContents.setWindowOpenHandler(({url}) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url);
    return {action: 'deny'};
  });
  win.webContents.on('will-navigate', (e, url) => { if (!url.startsWith(ORIGIN + '/')) e.preventDefault(); });
  win.on('page-title-updated', e => { e.preventDefault(); win.setTitle('Avalon CAD'); });
  if (smokeArg) runSmoke(win);
  win.loadURL(`${ORIGIN}/index.html`);
  return win;
}

function runSmoke(win) {
  const log = [], errors = [], external = [];
  const wc = win.webContents;
  wc.on('console-message', (event) => {
    const {level, message, sourceId, lineNumber} = event;
    const line = `[console:${level}] ${message} (${sourceId}:${lineNumber})`;
    log.push(line); console.log(line);
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
      const engine = await wc.executeJavaScript(`new Promise((res,rej)=>{const t=setInterval(()=>{const e=window.__cad?.model?.engine;if(e&&e.local){clearInterval(t);res(e);}},250);})`);
      const initMs = Date.now() - t0;
      const info = await wc.executeJavaScript(`({isolated: self.crossOriginIsolated, webgl2: !!document.createElement('canvas').getContext('webgl2'), sab: typeof SharedArrayBuffer, ua: navigator.userAgent})`);
      // Exercise the full pipeline: add a 40x30x10 box through the UI and wait for its mesh.
      await wc.executeJavaScript(`(async()=>{const $=id=>document.getElementById(id);$('addBtn').click();document.querySelector('[data-shape="box"]').click();
        const set=(id,v)=>{const el=$(id);if(el){el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));}};
        set('p_w','40');set('p_d','30');set('p_h','10');$('applyObject').click();})()`);
      const objects = await wc.executeJavaScript(`new Promise(res=>{let n=0;const t=setInterval(()=>{const c=window.__cad;const k=c?.project?.objects?.length||0;const tri=c?.model?.triangles?.length||c?.model?.parts?.length||0;if((k>0&&tri>0)||++n>240){clearInterval(t);res({objects:k,meshReady:tri>0,busy:document.getElementById('busy')?.textContent});}},250);})`);
      await new Promise(r => setTimeout(r, 1500));
      const result = {engine, initMs, ...info, ...objects, consoleErrors: errors, externalRequests: external};
      console.log('SMOKE RESULT ' + JSON.stringify(result));
      if (smokeShot) { const img = await wc.capturePage(); fs.writeFileSync(smokeShot, img.toPNG()); console.log('SMOKE SCREENSHOT ' + smokeShot); }
      clearTimeout(timer);
      const ok = engine.python && engine.rust && engine.local && objects.objects > 0 && errors.length === 0 && external.length === 0;
      console.log(ok ? 'SMOKE PASS' : 'SMOKE FAIL');
      app.exit(ok ? 0 : 1);
    } catch (e) { fail(e.stack || String(e)); }
  });
}

app.whenReady().then(() => {
  protocol.handle(SCHEME, serve);
  // Offline app: refuse every request that is not served from the bundled origin.
  if (!smokeArg) session.defaultSession.webRequest.onBeforeRequest((d, cb) => {
    cb({cancel: !(d.url.startsWith(ORIGIN + '/') || /^(blob|data|devtools):/.test(d.url))});
  });
  session.defaultSession.setPermissionRequestHandler((_wc, _perm, cb) => cb(false));
  Menu.setApplicationMenu(null);
  const win = createWindow();
  app.on('second-instance', () => { if (win.isMinimized()) win.restore(); win.focus(); });
});
app.on('window-all-closed', () => app.quit());
