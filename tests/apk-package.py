"""Check Android's install-time resource-table requirements in the signed APK."""
import argparse
import re
import struct
from pathlib import Path
from zipfile import ZipFile, ZIP_STORED

# WS7: the Pyodide assets ship only when web/perf-flags.mjs has JS_ENGINE=false.
_FLAGS = (Path(__file__).resolve().parent.parent / 'web/perf-flags.mjs').read_text()
PYTHON_ENTRIES = ['assets/python/pyodide.mjs', 'assets/python/pyodide.asm.js', 'assets/python/pyodide.asm.wasm',
                  'assets/python/python_stdlib.zip', 'assets/python/pyodide-lock.json',
                  'assets/python/model_jobs.py'] if 'JS_ENGINE=false' in _FLAGS else []
# WS8: with PARALLEL_INIT the APK stores *.wasm and *.zip uncompressed (ADR D3) and ships assets/perf-flags.json.
STORED_ASSETS = 'PARALLEL_INIT=true' in _FLAGS


def check_apk(path):
    with ZipFile(path) as apk:
        names = apk.namelist()
        assert len(names) == len(set(names)), 'Duplicate APK entries'
        assert apk.testzip() is None, 'APK CRC check failed'
        for name in ['AndroidManifest.xml', 'resources.arsc', 'classes.dex',
                     'assets/index.html', 'assets/main.js', 'assets/worker.js', 'assets/export-pool.js',
                     'assets/cad-kernel.wasm', 'assets/manifold.wasm',
                     'assets/mesh-core.wasm'] + PYTHON_ENTRIES:
            assert name in names, f'Missing required APK entry: {name}'
        resources = apk.getinfo('resources.arsc')
        assert resources.compress_type == ZIP_STORED, (
            'Android API 30+ rejects compressed resources.arsc')
        with path.open('rb') as file:
            file.seek(resources.header_offset)
            header = struct.unpack('<4s5H3I2H', file.read(30))
            assert header[0] == b'PK\x03\x04', 'Invalid resource ZIP header'
            assert header[3] == ZIP_STORED, 'Local resource header is compressed'
            offset = resources.header_offset + 30 + header[-2] + header[-1]
            assert offset % 4 == 0, 'resources.arsc is not 4-byte aligned'
        assert apk.read('assets/cad-kernel.wasm')[:4] == b'\x00asm', 'Invalid CAD kernel'
        for asset in ['assets/manifold.wasm', 'assets/mesh-core.wasm'] + PYTHON_ENTRIES[2:3]:
            assert apk.read(asset)[:4] == b'\x00asm', f'Invalid runtime: {asset}'
        for info in apk.infolist():
            if info.filename.startswith('assets/') and info.filename.endswith(('.wasm', '.zip')):
                assert (info.compress_type == ZIP_STORED) == STORED_ASSETS, (
                    f'{info.filename} should be {"stored" if STORED_ASSETS else "deflated"}')
        if STORED_ASSETS:
            assert b'"PARALLEL_INIT":true' in apk.read('assets/perf-flags.json'), 'perf-flags.json missing PARALLEL_INIT'
        if PYTHON_ENTRIES:
            assert b'def process_job(' in apk.read('assets/python/model_jobs.py')
        else:
            assert not any(n.startswith('assets/python/') for n in names), 'JS_ENGINE build ships Python'
        # ADR-0001 W0 (ruling 4): lazy chunks in the WebView. main.js is a module script (index.html type="module"), every
        # import("./chunk-*.js") target is in assets/ next to it (same origin), is an ES module, and MainActivity serves
        # .js assets as text/javascript, which module loading requires. The phone checklist opens Help on a device.
        main = apk.read('assets/main.js').decode()
        assert b'type="module"' in apk.read('assets/index.html') and b'src="main.js' in apk.read('assets/index.html'), 'main.js is not a module script'
        chunks = sorted(set(re.findall(r'import\(["\']\./(chunk-[\w-]+\.js)["\']\)', main)))
        assert chunks, 'main.js has no lazy import() chunk'
        for name in chunks:
            assert 'assets/' + name in names, f'Missing lazy chunk assets/{name}'
            assert re.search(rb'\bexport\s*\{', apk.read('assets/' + name)), f'{name} is not an ES module'
        stray = [n for n in names if re.fullmatch(r'assets/chunk-.*\.js', n) and n[7:] not in chunks]
        assert not stray, f'Unreferenced chunks in the APK: {stray}'
        java = (Path(__file__).resolve().parent.parent / 'app/src/com/tristan/cad/MainActivity.java').read_text()
        assert 'asset.endsWith(".js")' in java and 'mime="text/javascript"' in java, 'MainActivity must serve .js as text/javascript'
    print(f'APK packaging passed: resources.arsc uncompressed and aligned at {offset}')
    print(f'Lazy chunks in the APK: {", ".join(chunks)}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('apk', type=Path)
    check_apk(parser.parse_args().apk)
