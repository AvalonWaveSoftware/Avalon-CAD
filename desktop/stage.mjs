import fs from 'node:fs';
import path from 'node:path';
// WS13 (D6): app/assets is not tracked; fail before staging if the web build has not run.
export const REQUIRED_ASSETS = ['index.html', 'style.css', 'main.js', 'worker.js', 'cad-kernel.wasm', 'manifold.wasm', 'mesh-core.wasm', 'perf-flags.json', 'THIRD_PARTY_NOTICES.txt'];
export function stageDesktop(root = process.cwd()) {
  const missing = REQUIRED_ASSETS.filter(f => !fs.existsSync(path.join(root, 'app', 'assets', f)));
  if (missing.length) throw Error('Missing web assets in app/assets (' + missing.join(', ') + '). Run npm run build:web first.');
  const stage = path.join(root, 'build', 'desktop-stage');
  fs.mkdirSync(path.join(stage, 'web'), {recursive: true});
  fs.cpSync(path.join(root, 'app', 'assets'), path.join(stage, 'web'), {recursive: true});
  for (const file of ['main.cjs', 'preload.cjs', 'files.cjs']) fs.copyFileSync(path.join(root, 'desktop', file), path.join(stage, file));
  fs.copyFileSync(path.join(root, 'desktop', 'desktop.css'), path.join(stage, 'web', 'desktop.css'));
  const html = fs.readFileSync(path.join(stage, 'web', 'index.html'), 'utf8').replace('</head>', '<link rel="stylesheet" href="desktop.css"></head>').replace('<body>', '<body class="desktop">');
  fs.writeFileSync(path.join(stage, 'web', 'index.html'), html);
  fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify({name: 'avaloncad', productName: 'Avalon CAD', version: '2.7.0', main: 'main.cjs', private: true}));
  return stage;
}
if (process.argv[1] === new URL(import.meta.url).pathname) console.log(stageDesktop());
