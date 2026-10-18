#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
SDK="${TRISTANCAD_SDK:-$PWD/tools/android-sdk}"
BT="$SDK/build-tools/35.0.0"
: "${AVALONCAD_KEYSTORE_PASS:?Set AVALONCAD_KEYSTORE_PASS to the signing keystore password}"
PLATFORM="$SDK/platforms/android-35/android.jar"
[ -f tools/signing.p12 ] || [ "${AVALON_ALLOW_NEW_KEY:-0}" = "1" ] || { echo "ERROR: tools/signing.p12 is missing. Restore the existing signing key before building." >&2; exit 1; }
mkdir -p build/classes build/dex ../deliverables
./build-rust.sh
npm run build:web
# WS13 (D6): app/assets is not tracked; make sure the web build produced every shipped asset.
for f in index.html style.css main.js worker.js export-pool.js cad-kernel.wasm manifold.wasm mesh-core.wasm perf-flags.json THIRD_PARTY_NOTICES.txt; do
  [ -f "app/assets/$f" ] || { echo "Missing web asset app/assets/$f" >&2; exit 1; }
done
# ADR-0001 W0 (ruling 4): every lazy chunk main.js loads with import() must ship too.
CHUNKS=$(grep -oE 'import\("\./chunk-[A-Za-z0-9_-]+\.js"\)' "app/assets/main.js" | sed -E 's/.*\.\/(chunk-[^"]+)".*/\1/' | sort -u)
for f in $CHUNKS; do [ -f "app/assets/$f" ] || { echo "Missing lazy chunk app/assets/$f" >&2; exit 1; }; done
"$BT/aapt2" compile --dir app/res -o build/resources.zip
"$BT/aapt2" link -o build/base-resources.apk --manifest app/AndroidManifest.xml -I "$PLATFORM" build/resources.zip
java com.sun.tools.javac.Main -source 8 -target 8 -classpath "$PLATFORM" -d build/classes app/src/com/tristan/cad/MainActivity.java
python3 - <<'PY'
import zipfile,pathlib
with zipfile.ZipFile('build/classes.jar','w') as z:
 for p in pathlib.Path('build/classes').rglob('*.class'):z.write(p,str(p.relative_to('build/classes')))
PY
"$BT/d8" --min-api 28 --lib "$PLATFORM" --output build/dex build/classes.jar
python3 - <<'PY'
import zipfile
from pathlib import Path
stored='PARALLEL_INIT=true' in Path('web/perf-flags.mjs').read_text()
with zipfile.ZipFile('build/base-resources.apk') as resources:
 assert 'AndroidManifest.xml' in resources.namelist()
 with zipfile.ZipFile('build/unsigned.apk','w',compression=zipfile.ZIP_DEFLATED) as z:
  for entry in resources.infolist():z.writestr(entry,resources.read(entry.filename))
  for p in Path('app/assets').rglob('*'):
   # WS8 (PARALLEL_INIT, ADR D3): store wasm/zip uncompressed so AssetManager streams them without inflating.
   if p.is_file():z.write(p,'assets/'+str(p.relative_to('app/assets')),compress_type=zipfile.ZIP_STORED if stored and p.suffix in ('.wasm','.zip') else None)
  z.write('build/dex/classes.dex','classes.dex')
with zipfile.ZipFile('build/unsigned.apk') as z:
 assert 'AndroidManifest.xml' in z.namelist() and z.testzip() is None
PY
"$BT/zipalign" -f -p 4 build/unsigned.apk build/aligned.apk
if [ ! -f tools/signing.p12 ]; then
 # Never mint a replacement key silently: an APK signed with a new key cannot
 # install as an update over the existing app. Restore tools/signing.p12 from
 # your private backup, or set AVALON_ALLOW_NEW_KEY=1 to deliberately create one.
 if [ "${AVALON_ALLOW_NEW_KEY:-0}" != "1" ]; then
  echo "ERROR: tools/signing.p12 is missing. Restore the existing signing key; refusing to generate a new one." >&2
  exit 1
 fi
 keytool -genkeypair -keystore tools/signing.p12 -storetype PKCS12 -alias tristancad -keyalg RSA -keysize 3072 -validity 10000 -storepass "$AVALONCAD_KEYSTORE_PASS" -keypass "$AVALONCAD_KEYSTORE_PASS" -dname 'CN=Tristan CAD, O=Personal Software, C=US' >/dev/null 2>&1
fi
"$BT/apksigner" sign --ks tools/signing.p12 --ks-pass env:AVALONCAD_KEYSTORE_PASS --out build/signed.apk build/aligned.apk
"$BT/apksigner" verify --verbose build/signed.apk
"$BT/zipalign" -c -v 4 build/signed.apk | tail -1
python3 tests/apk-package.py build/signed.apk
python3 - <<'PY'
import os
from pathlib import Path
from zipfile import ZipFile
signed = Path('build/signed.apk')
with ZipFile(signed) as archive:
 assert archive.testzip() is None
os.replace(signed, '../deliverables/AvalonCad-2.7.2.apk')
print('Signed installer ready:', Path('../deliverables/AvalonCad-2.7.2.apk').stat().st_size, 'bytes')
PY
