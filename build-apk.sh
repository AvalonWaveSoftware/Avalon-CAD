#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
SDK="${TRISTANCAD_SDK:-$PWD/tools/android-sdk}"
BT="$SDK/build-tools/35.0.0"
: "${AVALONCAD_KEYSTORE_PASS:?Set AVALONCAD_KEYSTORE_PASS to the signing keystore password}"
PLATFORM="$SDK/platforms/android-35/android.jar"
mkdir -p build/classes build/dex ../deliverables
./build-rust.sh
npm run build:web
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
with zipfile.ZipFile('build/base-resources.apk') as resources:
 assert 'AndroidManifest.xml' in resources.namelist()
 with zipfile.ZipFile('build/unsigned.apk','w',compression=zipfile.ZIP_DEFLATED) as z:
  for entry in resources.infolist():z.writestr(entry,resources.read(entry.filename))
  for p in Path('app/assets').rglob('*'):
   if p.is_file():z.write(p,'assets/'+str(p.relative_to('app/assets')))
  z.write('build/dex/classes.dex','classes.dex')
with zipfile.ZipFile('build/unsigned.apk') as z:
 assert 'AndroidManifest.xml' in z.namelist() and z.testzip() is None
PY
"$BT/zipalign" -f -p 4 build/unsigned.apk build/aligned.apk
if [ ! -f tools/signing.p12 ]; then
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
os.replace(signed, '../deliverables/AvalonCad-2.4.0.apk')
print('Signed installer ready:', Path('../deliverables/AvalonCad-2.4.0.apk').stat().st_size, 'bytes')
PY
