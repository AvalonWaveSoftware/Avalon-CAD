import fs from 'node:fs';
import path from 'node:path';
// WS13 (D6): app/assets is not tracked; fail before staging if the web build has not run.
export const REQUIRED_ASSETS = ['index.html', 'style.css', 'main.js', 'worker.js', 'worker-sidecar.js', 'export-pool.js', 'cad-kernel.wasm', 'manifold.wasm', 'mesh-core.wasm', 'perf-flags.json', 'THIRD_PARTY_NOTICES.txt'];
// ADR-0001 W0 (ruling 4): the lazy chunks main.js or a worker bundle loads with import(); each must ship in every package.
export function lazyChunks(dir) {
  const main = ['main.js', 'worker.js', 'worker-sidecar.js'].map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
  return [...new Set([...main.matchAll(/import\(["']\.\/(chunk-[\w-]+\.js)["']\)/g)].map(m => m[1]))].sort();
}
export function stageDesktop(root = process.cwd()) {
  const missing = REQUIRED_ASSETS.filter(f => !fs.existsSync(path.join(root, 'app', 'assets', f)));
  if (missing.length) throw Error('Missing web assets in app/assets (' + missing.join(', ') + '). Run npm run build:web first.');
  const chunks = lazyChunks(path.join(root, 'app', 'assets')), lost = chunks.filter(f => !fs.existsSync(path.join(root, 'app', 'assets', f)));
  if (lost.length) throw Error('Missing lazy chunks in app/assets (' + lost.join(', ') + '). Run npm run build:web first.');
  const stage = path.join(root, 'build', 'desktop-stage');
  fs.rmSync(path.join(stage, 'web'), {recursive: true, force: true}); // no stale chunks from an earlier build
  fs.mkdirSync(path.join(stage, 'web'), {recursive: true});
  fs.cpSync(path.join(root, 'app', 'assets'), path.join(stage, 'web'), {recursive: true});
  for (const file of ['main.cjs', 'preload.cjs', 'files.cjs']) fs.copyFileSync(path.join(root, 'desktop', file), path.join(stage, file));
  for (const f of chunks) if (!fs.existsSync(path.join(stage, 'web', f))) throw Error('Staged desktop app is missing lazy chunk ' + f);
  fs.writeFileSync(path.join(stage, 'package.json'), JSON.stringify({name: 'avaloncad', productName: 'Avalon CAD', version: '3.0.0', main: 'main.cjs', private: true}));
  return stage;
}
if (process.argv[1] === new URL(import.meta.url).pathname) console.log(stageDesktop());
