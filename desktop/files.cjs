const fs = require('node:fs/promises');
const path = require('node:path');
const {randomUUID} = require('node:crypto');
const MAX_BYTES = 50 * 1024 * 1024;
const allowedExtensions = new Set(['.stl', '.tcad', '.avprefab', '.json']);

function exportPayload(value) {
  if (!value || typeof value.name !== 'string' || value.name.length > 160 || !value.name.length || path.basename(value.name) !== value.name || /[\x00-\x1f/\\]/.test(value.name)) throw Error('Invalid export filename.');
  const extension = path.extname(value.name).toLowerCase();
  if (!allowedExtensions.has(extension)) throw Error('Choose an STL, project or prefab file.');
  const bytes = value.bytes;
  if (!ArrayBuffer.isView(bytes) && !(bytes instanceof ArrayBuffer)) throw Error('Invalid file data.');
  if (bytes.byteLength > MAX_BYTES) throw Error('Files are limited to 50 MB.');
  const data = ArrayBuffer.isView(bytes) ? Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength) : Buffer.from(bytes);
  return {name: value.name, extension, bytes: data};
}

async function readModel(file) {
  if (!allowedExtensions.has(path.extname(file).toLowerCase())) throw Error('Open an STL, .tcad project or .avprefab file.');
  const handle = await fs.open(file, 'r');
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > MAX_BYTES) throw Error('Import is limited to regular files up to 50 MB.');
    const bytes = await handle.readFile();
    if (bytes.byteLength > MAX_BYTES) throw Error('Import is limited to 50 MB.');
    return {name: path.basename(file), bytes: new Uint8Array(bytes)};
  } finally { await handle.close(); }
}

async function writeModel(file, bytes) {
  const temporary = path.join(path.dirname(file), '.' + path.basename(file) + '.' + randomUUID() + '.tmp');
  try {
    await fs.writeFile(temporary, bytes, {flag: 'wx'});
    await fs.rename(temporary, file);
  } finally { await fs.unlink(temporary).catch(() => {}); }
}

// ADR-0001 (C): Undo-history spill files. One directory per app under the OS temp dir, emptied at startup (single
// instance) and on quit; ids are the renderer's content hashes, restricted to [a-z0-9.]{1,64}.
const SPILL_ID = /^[a-z0-9.]{1,64}$/;
const SPILL_MAX = 64 * 1024 * 1024;
function spillStore(dir) {
  const file = id => { if (typeof id !== 'string' || !SPILL_ID.test(id) || id.includes('..')) throw Error('Invalid spill id.'); return path.join(dir, id + '.bin'); };
  return {
    dir,
    async put(id, bytes) {
      if (!ArrayBuffer.isView(bytes) || bytes.byteLength > SPILL_MAX) throw Error('Invalid spill data.');
      await fs.mkdir(dir, {recursive: true});
      const target = file(id), temporary = target + '.' + randomUUID() + '.tmp';
      try { await fs.writeFile(temporary, Buffer.from(bytes.buffer, bytes.byteOffset, bytes.byteLength), {flag: 'wx'}); await fs.rename(temporary, target); }
      finally { await fs.unlink(temporary).catch(() => {}); }
    },
    async get(id) { try { return new Uint8Array(await fs.readFile(file(id))); } catch (e) { if (e.code === 'ENOENT') return null; throw e; } },
    async del(id) { await fs.unlink(file(id)).catch(e => { if (e.code !== 'ENOENT') throw e; }); },
    async clear() { await fs.rm(dir, {recursive: true, force: true}); },
    clearSync() { require('node:fs').rmSync(dir, {recursive: true, force: true}); }
  };
}

module.exports = {MAX_BYTES, allowedExtensions, exportPayload, readModel, writeModel, spillStore};
