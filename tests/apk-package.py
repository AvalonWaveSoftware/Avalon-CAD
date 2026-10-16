"""Check Android's install-time resource-table requirements in the signed APK."""
import argparse
import struct
from pathlib import Path
from zipfile import ZipFile, ZIP_STORED

# WS7: the Pyodide assets ship only when web/perf-flags.mjs has JS_ENGINE=false.
_FLAGS = (Path(__file__).resolve().parent.parent / 'web/perf-flags.mjs').read_text()
PYTHON_ENTRIES = ['assets/python/pyodide.mjs', 'assets/python/pyodide.asm.js', 'assets/python/pyodide.asm.wasm',
                  'assets/python/python_stdlib.zip', 'assets/python/pyodide-lock.json',
                  'assets/python/model_jobs.py'] if 'JS_ENGINE=false' in _FLAGS else []


def check_apk(path):
    with ZipFile(path) as apk:
        names = apk.namelist()
        assert len(names) == len(set(names)), 'Duplicate APK entries'
        assert apk.testzip() is None, 'APK CRC check failed'
        for name in ['AndroidManifest.xml', 'resources.arsc', 'classes.dex',
                     'assets/index.html', 'assets/main.js', 'assets/worker.js',
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
        if PYTHON_ENTRIES:
            assert b'def process_job(' in apk.read('assets/python/model_jobs.py')
        else:
            assert not any(n.startswith('assets/python/') for n in names), 'JS_ENGINE build ships Python'
    print(f'APK packaging passed: resources.arsc uncompressed and aligned at {offset}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('apk', type=Path)
    check_apk(parser.parse_args().apk)
