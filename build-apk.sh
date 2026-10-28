#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
SDK="${TRISTANCAD_SDK:-$PWD/tools/android-sdk}"
BT="$SDK/build-tools/35.0.0"
PLATFORM="$SDK/platforms/android-35/android.jar"
# Signing key selection.
#   (default)            release build: tools/signing.p12, app ID com.avalonwavesoftware.cad
#   --test-key           test build: throwaway test key (AVALON_TEST_KEYSTORE), app ID com.avalonwavesoftware.cad.test
#   --keystore FILE      sign with FILE (alias/password: AVALON_KEY_ALIAS, AVALON_KEYSTORE_PASS_FILE or AVALONCAD_KEYSTORE_PASS)
# AVALON_TEST_BUILD=1 with no --keystore defaults to the test key. A .test app ID is never signed with tools/signing.p12.
PROD_KEYSTORE=tools/signing.p12
RELEASE_ID=com.avalonwavesoftware.cad
TEST_ID=$RELEASE_ID.test
TEST_KEYSTORE="${AVALON_TEST_KEYSTORE:-$PWD/tools/test-only.p12}"
TEST_KEY_ALIAS="${AVALON_TEST_KEY_ALIAS:-avalontest}"
TEST_KEY_PASS_FILE="${AVALON_TEST_KEYSTORE_PASS_FILE:-$(dirname "$TEST_KEYSTORE")/pass.txt}"
KEYSTORE= USE_TEST_KEY=0
while [ $# -gt 0 ]; do
  case "$1" in
    --test-key) USE_TEST_KEY=1;;
    --keystore) [ $# -ge 2 ] || { echo "ERROR: --keystore needs a file" >&2; exit 2; }; KEYSTORE=$2; shift;;
    --keystore=*) KEYSTORE=${1#--keystore=};;
    *) echo "Usage: $0 [--test-key | --keystore FILE]" >&2; exit 2;;
  esac; shift
done
AVALON_TEST_BUILD="${AVALON_TEST_BUILD:-0}"
[[ "$AVALON_TEST_BUILD" = 0 || "$AVALON_TEST_BUILD" = 1 ]] || exit 1
[ "$USE_TEST_KEY" = 1 ] && [ -n "$KEYSTORE" ] && { echo "ERROR: use either --test-key or --keystore, not both" >&2; exit 2; }
[ "$USE_TEST_KEY" = 1 ] && AVALON_TEST_BUILD=1
if [ -z "$KEYSTORE" ]; then
  if [ "$AVALON_TEST_BUILD" = 1 ]; then KEYSTORE=$TEST_KEYSTORE; USE_TEST_KEY=1; else KEYSTORE=$PROD_KEYSTORE; fi
fi
# The .test app ID goes with test builds only; release builds keep the release ID.
APP_ID=$RELEASE_ID; [ "$AVALON_TEST_BUILD" = 1 ] && APP_ID=$TEST_ID
same_file(){ [ "$(readlink -m "$1")" = "$(readlink -m "$2")" ]; }
IS_PROD_KEY=0
{ [ "$KEYSTORE" = "$PROD_KEYSTORE" ] || same_file "$KEYSTORE" "$PROD_KEYSTORE"; } && IS_PROD_KEY=1
if [ "$IS_PROD_KEY" = 1 ] && [[ "$APP_ID" == *.test ]]; then
  echo "ERROR: refusing to sign test app ID $APP_ID with the production key $PROD_KEYSTORE. Use --test-key." >&2; exit 1
fi
if [ "$IS_PROD_KEY" = 1 ]; then
  : "${AVALONCAD_KEYSTORE_PASS:?Set AVALONCAD_KEYSTORE_PASS to the signing keystore password}"
  [ -f "$PROD_KEYSTORE" ] || [ "${AVALON_ALLOW_NEW_KEY:-0}" = "1" ] || { echo "ERROR: tools/signing.p12 is missing. Restore the existing signing key before building." >&2; exit 1; }
  SIGN_ARGS=(--ks "$PROD_KEYSTORE" --ks-pass env:AVALONCAD_KEYSTORE_PASS)
else
  [ -f "$KEYSTORE" ] || { echo "ERROR: keystore $KEYSTORE not found (set AVALON_TEST_KEYSTORE for --test-key)" >&2; exit 1; }
  if [ "$USE_TEST_KEY" = 1 ]; then
    SIGN_ARGS=(--ks "$KEYSTORE" --ks-pass "file:$TEST_KEY_PASS_FILE" --ks-key-alias "$TEST_KEY_ALIAS")
  elif [ -n "${AVALON_KEYSTORE_PASS_FILE:-}" ]; then
    SIGN_ARGS=(--ks "$KEYSTORE" --ks-pass "file:$AVALON_KEYSTORE_PASS_FILE")
  else
    : "${AVALONCAD_KEYSTORE_PASS:?Set AVALONCAD_KEYSTORE_PASS or AVALON_KEYSTORE_PASS_FILE for --keystore}"
    SIGN_ARGS=(--ks "$KEYSTORE" --ks-pass env:AVALONCAD_KEYSTORE_PASS)
  fi
  [ -n "${AVALON_KEY_ALIAS:-}" ] && SIGN_ARGS+=(--ks-key-alias "$AVALON_KEY_ALIAS")
fi
echo "Signing: app ID $APP_ID, keystore $([ "$IS_PROD_KEY" = 1 ] && echo "$PROD_KEYSTORE (production)" || echo "$KEYSTORE")"
mkdir -p build/classes build/dex ../deliverables
./build-rust.sh
npm run build:web
# WS13 (D6): app/assets is not tracked; make sure the web build produced every shipped asset.
for f in index.html style.css main.js worker.js worker-sidecar.js worker-android.js export-pool.js cad-kernel.wasm manifold.wasm mesh-core.wasm perf-flags.json THIRD_PARTY_NOTICES.txt; do
  [ -f "app/assets/$f" ] || { echo "Missing web asset app/assets/$f" >&2; exit 1; }
done
# ADR-0001 W0 (ruling 4): every lazy chunk main.js loads with import() must ship too.
CHUNKS=$(grep -oE 'import\("\./chunk-[A-Za-z0-9_-]+\.js"\)' "app/assets/main.js" | sed -E 's/.*\.\/(chunk-[^"]+)".*/\1/' | sort -u)
for f in $CHUNKS; do [ -f "app/assets/$f" ] || { echo "Missing lazy chunk app/assets/$f" >&2; exit 1; }; done
"$BT/aapt2" compile --dir app/res -o build/resources.zip
RENAME_ARGS=(); [ "$APP_ID" = "$RELEASE_ID" ] || RENAME_ARGS=(--rename-manifest-package "$APP_ID")
"$BT/aapt2" link -o build/base-resources.apk --manifest app/AndroidManifest.xml "${RENAME_ARGS[@]}" -I "$PLATFORM" build/resources.zip
# Opt-in test build only; release compilation never sees the crash-hook method.
rm -rf build/classes
mkdir -p build/classes build/java
python3 - "$AVALON_TEST_BUILD" <<'PYHOOK'
import pathlib,re,sys
source=pathlib.Path('app/src/com/avalonwavesoftware/cad/MainActivity.java').read_text()
if sys.argv[1] != '1':
 source=re.sub(r'        // BEGIN TEST_RENDERER_CRASH_HOOK.*?        // END TEST_RENDERER_CRASH_HOOK', '', source, flags=re.S)
pathlib.Path('build/java/MainActivity.java').write_text(source)
PYHOOK
java com.sun.tools.javac.Main -source 8 -target 8 -classpath "$PLATFORM" -d build/classes build/java/MainActivity.java
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
if [ "$IS_PROD_KEY" = 1 ] && [ ! -f tools/signing.p12 ]; then
 # Never mint a replacement key silently: an APK signed with a new key cannot
 # install as an update over the existing app. Restore tools/signing.p12 from
 # your private backup, or set AVALON_ALLOW_NEW_KEY=1 to deliberately create one.
 if [ "${AVALON_ALLOW_NEW_KEY:-0}" != "1" ]; then
  echo "ERROR: tools/signing.p12 is missing. Restore the existing signing key; refusing to generate a new one." >&2
  exit 1
 fi
 keytool -genkeypair -keystore tools/signing.p12 -storetype PKCS12 -alias tristancad -keyalg RSA -keysize 3072 -validity 10000 -storepass "$AVALONCAD_KEYSTORE_PASS" -keypass "$AVALONCAD_KEYSTORE_PASS" -dname 'CN=Tristan CAD, O=Personal Software, C=US' >/dev/null 2>&1
fi
"$BT/apksigner" sign "${SIGN_ARGS[@]}" --out build/signed.apk build/aligned.apk
"$BT/apksigner" verify --verbose build/signed.apk
"$BT/zipalign" -c -v 4 build/signed.apk | tail -1
PACKAGE_CHECK_ARGS=()
if [ "$AVALON_TEST_BUILD" = 1 ]; then PACKAGE_CHECK_ARGS+=(--test-build); fi
python3 tests/apk-package.py build/signed.apk "${PACKAGE_CHECK_ARGS[@]}"
OUT_NAME=AvalonCad-2.7.2.apk; [ "$AVALON_TEST_BUILD" = 1 ] && OUT_NAME=AvalonCad-2.7.2-test.apk
OUT_NAME=$OUT_NAME python3 - <<'PY'
import os
from pathlib import Path
from zipfile import ZipFile
signed = Path('build/signed.apk')
with ZipFile(signed) as archive:
 assert archive.testzip() is None
out = Path('../deliverables') / os.environ['OUT_NAME']
os.replace(signed, out)
print('Signed installer ready:', out, out.stat().st_size, 'bytes')
PY
