const fs = require('node:fs/promises');
const path = require('node:path');
const {randomUUID} = require('node:crypto');
const MAX_BYTES = 50 * 1024 * 1024;
const allowedExtensions = new Set(['.stl', '.tcad', '.avprefab', '.json']);
// ADR-0001 F2a: 3MF can be saved (export). Opening .3mf stays refused until 3MF import (F2b) exists.
const exportExtensions = new Set([...allowedExtensions, '.3mf']);

function exportPayload(value) {
  if (!value || typeof value.name !== 'string' || value.name.length > 160 || !value.name.length || path.basename(value.name) !== value.name || /[\x00-\x1f/\\]/.test(value.name)) throw Error('Invalid export filename.');
  const extension = path.extname(value.name).toLowerCase();
  if (!exportExtensions.has(extension)) throw Error('Choose an STL, project or prefab file.');
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

module.exports = {MAX_BYTES, allowedExtensions, exportExtensions, exportPayload, readModel, writeModel};
