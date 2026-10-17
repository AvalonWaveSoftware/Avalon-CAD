import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {packager} from '@electron/packager';
import {stageDesktop} from './stage.mjs';
const version = '44.7.0', filename = `electron-v${version}-darwin-arm64.zip`;
const expected = 'e04e411b58a0a14375dd21b0ab4a378fd38930a702e4e20e322fee4849404c0b';
const root = process.cwd(), cache = path.resolve(process.env.AVALON_ELECTRON_CACHE || 'build/electron-cache');
fs.mkdirSync(cache, {recursive: true});
const zip = path.join(cache, filename);
if (!fs.existsSync(zip)) {
  const response = await fetch(`https://github.com/electron/electron/releases/download/v${version}/${filename}`);
  if (!response.ok) throw Error('The Apple silicon runtime could not download.');
  const {Readable} = await import('node:stream'); const {pipeline} = await import('node:stream/promises');
  await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(zip));
}
if (createHash('sha256').update(fs.readFileSync(zip)).digest('hex') !== expected) throw Error('Runtime checksum mismatch. Delete the incomplete cached ZIP and build again.');
const dirs = await packager({dir: stageDesktop(root), out: path.join(root, 'build', 'mac'), platform: 'darwin', arch: 'arm64', electronVersion: version, electronZipDir: cache,
  name: 'AvalonCad', appBundleId: 'com.avaloncad.desktop', appVersion: '2.7.2', buildVersion: '23', overwrite: true, asar: false, prune: false,
  icon: path.join(root, 'desktop', 'AvalonCad.icns'), extendInfo: {LSMinimumSystemVersion: '13.0', NSHighResolutionCapable: true,
    CFBundleDocumentTypes: [{CFBundleTypeName: 'AvalonCad model', CFBundleTypeExtensions: ['tcad', 'avprefab', 'stl'], CFBundleTypeRole: 'Editor', LSHandlerRank: 'Alternate'}]}});
const bundle = path.join(dirs[0], 'AvalonCad.app');
if (process.platform === 'darwin') {
  execFileSync('/usr/bin/codesign', ['--force', '--deep', '--sign', '-', '--entitlements', path.join(root, 'desktop', 'entitlements.plist'), bundle], {stdio: 'inherit'});
  execFileSync('/usr/bin/codesign', ['--verify', '--deep', '--strict', bundle], {stdio: 'inherit'});
} else if (process.env.AVALON_RCODESIGN) {
  execFileSync(process.env.AVALON_RCODESIGN, ['sign', '--entitlements-xml-file', path.join(root, 'desktop', 'entitlements.plist'), bundle], {stdio: 'inherit'});
} else throw Error('The app is packaged but needs code signing. Build on a Mac, or supply AVALON_RCODESIGN for cross-platform ad-hoc signing.');
console.log('Apple silicon app ready:', bundle);
