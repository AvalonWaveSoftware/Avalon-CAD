"""Validate Apple silicon Mach-O page hashes and the signed app's resource seals.

This checks bytes and packaging; it does not replace Apple's on-device codesign
or Gatekeeper checks. Ad-hoc signatures deliberately have no CMS certificate.
"""
import hashlib
import plistlib
import struct
import sys
from pathlib import Path

app = Path(sys.argv[1]).resolve()
# WS7: the Pyodide assets ship only when web/perf-flags.mjs has JS_ENGINE=false.
PYTHON = 'JS_ENGINE=false' in (Path(__file__).resolve().parent.parent / 'web/perf-flags.mjs').read_text()
info = plistlib.loads((app / 'Contents/Info.plist').read_bytes())
assert info['CFBundleIdentifier'] == 'com.avaloncad.desktop'
assert info['CFBundleExecutable'] == 'AvalonCad'
assert info['CFBundleShortVersionString'] == '2.7.2'
assert info['LSMinimumSystemVersion'] == '13.0'
hashes = {1: hashlib.sha1, 2: hashlib.sha256, 3: hashlib.sha256, 4: hashlib.sha384}
machos = 0
for file in app.rglob('*'):
    if not file.is_file() or file.is_symlink():
        continue
    with file.open('rb') as stream:
        magic = stream.read(4)
    if magic != b'\xcf\xfa\xed\xfe':
        continue
    data = file.read_bytes()
    header = struct.unpack_from('<8I', data)
    assert header[1] == 0x100000C, f'Non-arm64 binary: {file}'
    cursor, signature = 32, None
    for _ in range(header[4]):
        command, size = struct.unpack_from('<II', data, cursor)
        if command == 0x1D:
            offset, length = struct.unpack_from('<II', data, cursor + 8)
            signature = data[offset:offset + length]
        cursor += size
    assert signature, f'Missing code signature: {file}'
    magic, length, count = struct.unpack_from('>III', signature)
    assert magic == 0xFADE0CC0
    directories = 0
    for i in range(count):
        kind, offset = struct.unpack_from('>II', signature, 12 + i * 8)
        magic, length = struct.unpack_from('>II', signature, offset)
        if magic != 0xFADE0C02:
            continue
        directory = signature[offset:offset + length]
        _, _, version, flags, hash_offset, _, special, slots, limit = struct.unpack_from('>9I', directory)
        hash_size, hash_type, platform, page_exp = struct.unpack_from('>4B', directory, 36)
        assert flags & 2, f'Expected ad-hoc signature: {file}'
        digest = hashes[hash_type]
        page_size = 1 << page_exp
        assert slots == (limit + page_size - 1) // page_size
        for slot in range(slots):
            page = data[slot * page_size:min((slot + 1) * page_size, limit)]
            expected = directory[hash_offset + slot * hash_size:hash_offset + (slot + 1) * hash_size]
            assert digest(page).digest()[:hash_size] == expected, f'Code-page hash mismatch: {file}'
        directories += 1
    assert directories
    machos += 1

sealed = 0
for resources in app.rglob('CodeResources'):
    if resources.parent.name != '_CodeSignature' or resources.is_symlink():
        continue
    contents = resources.parent.parent
    rules = plistlib.loads(resources.read_bytes())
    for name, entry in rules.get('files2', {}).items():
        file = contents / name
        if 'symlink' in entry:
            assert file.is_symlink() and file.readlink().as_posix() == entry['symlink']
        elif 'hash2' in entry:
            assert hashlib.sha256(file.read_bytes()).digest() == entry['hash2'], f'Resource seal mismatch: {file}'
        elif 'hash' in entry:
            assert hashlib.sha1(file.read_bytes()).digest() == entry['hash']
        sealed += 1
assert machos >= 7
assets = app / 'Contents/Resources/app/web'
for name in ['cad-kernel.wasm', 'manifold.wasm', 'mesh-core.wasm'] + (['python/pyodide.asm.wasm'] if PYTHON else []):
    assert (assets / name).read_bytes()[:4] == b'\x00asm'
for name in ['main.js', 'worker.js', 'style.css'] + (['python/model_jobs.py', 'python/python_stdlib.zip'] if PYTHON else []):
    assert (assets / name).is_file()
# ADR unified-desktop-layout: no desktop-only stylesheet and a plain <body>.
assert not (assets / 'desktop.css').exists() and not list(assets.glob('*.css'))[1:]
assert '<body>' in (assets / 'index.html').read_text() and 'desktop.css' not in (assets / 'index.html').read_text()
# ADR-0001 W0 (ruling 4): every lazy chunk main.js loads with import() ships in the app.
import re as _re
chunks = sorted(set(_re.findall(r'import\(["\']\./(chunk-[\w-]+\.js)["\']\)', (assets / 'main.js').read_text())))
for name in chunks:
    assert (assets / name).is_file(), f'Missing lazy chunk {name}'
print(f'PASS: Apple silicon app identity, {machos} arm64 Mach-O binaries with valid ad-hoc page hashes, {sealed} resource seals and complete offline Python/Rust/CAD assets.')
