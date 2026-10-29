#!/usr/bin/env bash
# ADR-0001 F2a option B — Waydroid end-to-end export timing (QA, Sean's Fedora host). Box agents cannot run this.
# Measures STL x5 and 3MF x5 cold (app force-stopped and relaunched before each export) and x5 warm (same session),
# from the final "Build & save" tap to the SAF write completing, minus the time spent in the SAF picker.
# QA does the taps when prompted; the script restarts the app and collects the logcat lines (tag AvalonExport).
# Run from a folder that holds the APK, the .sha256 and the sample (see --apk / --sample). Needs: a running
# waydroid session, and either adb or sudo NOPASSWD for /usr/bin/waydroid (for `sudo -n waydroid shell`).
#
# Usage: ./waydroid-measure.sh [--waydroid-shell|--adb] [--sample FILE] [--apk FILE]
#                              [--setup-only] [--non-interactive] [--no-install] [--force-install]
#   --waydroid-shell  run device commands through `sudo -n waydroid shell` (the default when adb is not installed);
#                     install with `waydroid app install`, push through the Waydroid data path, logcat through the shell.
#   --adb             force the adb path (adb connect to the Waydroid IP), as before.
#   --sample FILE     project to push (default samples/sphere-524k.tcad).
#   --apk FILE        APK to install (default AvalonCad-3.0.0-test.apk, the test-key build from ./build-apk.sh --test-key;
#                     also the APK env var).
#   --package ID      Android app ID to install/launch/measure (default com.avalonwavesoftware.cad.test, the test-key
#                     build ID; also the PKG env var). Pass the old ID for APKs built before the app-ID change.
#   --setup-only      install, push, start logcat, launch once; one Enter when QA finishes all taps; then summarize.
#   --non-interactive skip read prompts (auto-continue). For stub/stand-in testing; not a substitute for real taps.
#   --no-install      never uninstall/install; keep app data. Fails if the package is missing.
#   --force-install   always uninstall+install (wipes app data). Default is safer: install only when missing or
#                     the installed base.apk sha256 differs from the host APK.
# Overrides (for testing): ACTIVITY (launch class, default com.avalonwavesoftware.cad.MainActivity), ADB, WAYDROID (default /usr/bin/waydroid), SUDO, WAYDROID_DATA (default ~/.local/share/waydroid/data).
set -euo pipefail
PKG=${PKG:-com.avalonwavesoftware.cad.test} APK=${APK:-AvalonCad-3.0.0-test.apk} SAMPLE=samples/sphere-524k.tcad MODE=
SETUP_ONLY=
NONINTERACTIVE=
NO_INSTALL=
FORCE_INSTALL=
while [ $# -gt 0 ]; do case "$1" in
  --waydroid-shell) MODE=shell;; --adb) MODE=adb;;
  --sample) SAMPLE=$2; shift;; --apk) APK=$2; shift;; --package) PKG=$2; shift;;
  --setup-only) SETUP_ONLY=1;; --non-interactive) NONINTERACTIVE=1;;
  --no-install) NO_INSTALL=1;; --force-install) FORCE_INSTALL=1;;
  -h|--help) sed -n '2,26p' "$0"; exit 0;;
  *) echo "unknown option: $1" >&2; exit 2;; esac; shift; done
if [ -n "$NO_INSTALL" ] && [ -n "$FORCE_INSTALL" ]; then
  echo "use only one of --no-install and --force-install" >&2; exit 2
fi
ADB=${ADB:-adb}
# The activity class keeps its source package when a test build renames the app ID, so it is named in full.
ACTIVITY=${ACTIVITY:-com.avalonwavesoftware.cad.MainActivity}
# Prefer the absolute path sudoers typically allows (NOPASSWD: /usr/bin/waydroid).
WAYDROID=${WAYDROID:-/usr/bin/waydroid}
SUDO=${SUDO:-sudo}
WAYDROID_DATA=${WAYDROID_DATA:-$HOME/.local/share/waydroid/data}
if [ -z "$MODE" ]; then if command -v "$ADB" >/dev/null 2>&1; then MODE=adb; else MODE=shell; echo "adb not found: using '$SUDO -n $WAYDROID shell'"; fi; fi
NAME=$(basename "$SAMPLE") OUT=avalon-export-logcat-$(date +%Y%m%d-%H%M).txt
sha256sum -c "$APK.sha256"
[ -f "$SAMPLE" ] || { echo "sample not found: $SAMPLE" >&2; exit 1; }
HOST_SHA=$(sha256sum "$APK" | awk '{print $1}')

ask() {
  if [ -n "$NONINTERACTIVE" ]; then
    printf '%s\n' "$*"
    return 0
  fi
  read -rp "$* "
}

# Pipe host-side output through `cat > file` so waydroid shell / lxc-attach cannot chown the host file
# (redirected fds become root:0600). Same for streamed push input via `cat file | …`.
# dev CMD...: one device shell command line (run by the device's sh).
if [ "$MODE" = adb ]; then
  IP=$("$WAYDROID" status | awk '/IP/{print $NF}'); "$ADB" connect "$IP:5555" >/dev/null; "$ADB" wait-for-device
  dev(){ "$ADB" shell "$*"; }
  do_install(){ "$ADB" uninstall "$PKG" >/dev/null 2>&1 || true; "$ADB" install "$APK"; }
  push(){ "$ADB" push "$1" "$2"; }
  logcat_start(){ "$ADB" logcat -c; "$ADB" logcat -v time -s AvalonExport:I | cat > "$OUT" & LOGCAT=$!; }
  logcat_stop(){ kill "${LOGCAT:-}" 2>/dev/null || true; }
else
  # No `sudo -v`: host sudoers grants NOPASSWD only for /usr/bin/waydroid. Use sudo -n only.
  wshell(){ "$SUDO" -n "$WAYDROID" shell -- "$@"; }
  dev(){ wshell sh -c "$*"; }
  do_install(){ dev "pm uninstall $PKG" >/dev/null 2>&1 || true; "$WAYDROID" app install "$(readlink -f "$APK")"; sleep 2
    dev "pm path $PKG" | grep -q package: || { echo "install failed: $PKG not listed by pm" >&2; exit 1; }; }
  # Data-path check without sudo (sudo test -d needs a password). sudo -n install only if NOPASSWD covers it;
  # otherwise stream through waydroid shell (the NOPASSWD path).
  push(){ local dest=$2 host="$WAYDROID_DATA/media/0/${2#/sdcard/}"
    if [ -d "$(dirname "$host")" ] && "$SUDO" -n install -m 0664 "$1" "$host" 2>/dev/null; then
      dev "chown \$(stat -c %u:%g $(dirname "$dest")) '$dest' 2>/dev/null; true"
    else
      # shellcheck disable=SC2002  # intentional: pipe so lxc does not chown/hold the host file fd
      cat "$1" | wshell sh -c "cat > '$dest'"
    fi
    dev "ls -l '$dest'"; }
  # logcat runs inside the container; its pid is kept there so only this logcat is stopped.
  # stdout is piped through cat so OUT stays user-owned.
  logcat_start(){ dev "logcat -c"; wshell sh -c 'echo $$ > /data/local/tmp/avalon-logcat.pid; exec logcat -v time -s AvalonExport:I' | cat > "$OUT" & LOGCAT=$!; }
  # shellcheck disable=SC2016  # $p must expand on the device, not the host
  logcat_stop(){ dev 'p=$(cat /data/local/tmp/avalon-logcat.pid 2>/dev/null) && kill $p; rm -f /data/local/tmp/avalon-logcat.pid' 2>/dev/null || true; kill "${LOGCAT:-}" 2>/dev/null || true; }
fi

# Default: reinstall only when missing or sha256 differs (avoids ~5 s wipe of an identical install).
# --force-install always reinstalls; --no-install never does (keeps imported projects).
ensure_apk(){
  local path inst_sha
  # pm path exits non-zero when the package is missing; tolerate that under pipefail.
  path=$(dev "pm path $PKG" 2>/dev/null | sed -n 's/^package://p' | head -n1 | tr -d '\r' || true)
  if [ -n "$NO_INSTALL" ]; then
    if [ -z "$path" ]; then echo "package $PKG not installed (--no-install)" >&2; exit 1; fi
    echo "APK install skipped (--no-install); keeping $path"
    return 0
  fi
  if [ -n "$FORCE_INSTALL" ] || [ -z "$path" ]; then
    echo "installing $APK (force=${FORCE_INSTALL:-0}, missing=$([ -z "$path" ] && echo 1 || echo 0))"
    do_install
    return 0
  fi
  inst_sha=$(dev "sha256sum '$path'" 2>/dev/null | awk '{print $1}' | tr -d '\r' || true)
  if [ -n "$inst_sha" ] && [ "$inst_sha" = "$HOST_SHA" ]; then
    echo "APK already installed (sha256 match), skipping reinstall"
    return 0
  fi
  echo "installing $APK (installed sha ${inst_sha:-unknown} != host $HOST_SHA)"
  do_install
}

echo "device path: $MODE"
ensure_apk
push "$SAMPLE" "/sdcard/Download/$NAME"
dev "getprop ro.product.cpu.abi; getprop ro.product.cpu.abilist; nproc"
logcat_start
trap logcat_stop EXIT
# am start: monkey LAUNCHER exits 251 on Waydroid (SYS_KEYS / no physical keys).
launch(){ dev "am force-stop $PKG"; dev "am start -n $PKG/$ACTIVITY >/dev/null"; }
LOAD="If the model is not on screen: + (Add) > \"Import an STL, project or prefab\" > Downloads > $NAME > Continue; wait until the status reads Ready."
if [ -n "$SETUP_ONLY" ]; then
  launch
  echo "Logcat → $OUT"
  echo "Do all STL/3MF cold and warm exports yourself (force-stop/relaunch between cold runs as needed)."
  echo "$LOAD"
  ask "Press Enter when finished (or Ctrl-C); logcat will stop and the summary will print."
else
  for FMT in STL 3MF; do
    for i in 1 2 3 4 5; do
      launch
      ask "COLD $FMT $i/5. $LOAD Then Export (toolbar) > File format $FMT > Build & save .$FMT > SAVE in Downloads (replace is fine). Press Enter after the 'File saved' toast."
    done
    for i in 1 2 3 4 5; do
      ask "WARM $FMT $i/5 (no restart): Export > File format $FMT > Build & save .$FMT > SAVE. Press Enter after the 'File saved' toast."
    done
  done
fi
sleep 2; logcat_stop
NLINES=$(grep -c '\[Avalon export\] ' "$OUT" 2>/dev/null || true)
echo "Raw lines: $OUT ($NLINES)"
# Medians per format, split by cold and poolWarm so an STL after a 3MF (cold:true, poolWarm:true)
# does not drag the true first-in-session cold+poolCold median.
python3 - "$OUT" <<'PY'
import json,re,statistics,sys
L=[json.loads(m.group(1)) for m in (re.search(r'\[Avalon export\] (\{.*\})',l) for l in open(sys.argv[1])) if m]
buckets=(
    ('cold+poolCold', lambda l: l.get('cold') and not l.get('poolWarm')),
    ('cold+poolWarm', lambda l: l.get('cold') and l.get('poolWarm')),
    ('warm+poolCold', lambda l: (not l.get('cold')) and not l.get('poolWarm')),
    ('warm+poolWarm', lambda l: (not l.get('cold')) and l.get('poolWarm')),
)
for f in ('stl','3mf'):
    xs=[l for l in L if l['fmt']==f and not l.get('canceled') and not l.get('error')]
    for name,pred in buckets:
        part=[l for l in xs if pred(l)]
        if not part: continue
        med=lambda k:statistics.median([p.get(k) or 0 for p in part])
        print(f,name,'n=%d'%len(part),'totalMs',med('totalMs'),'encodeMs',med('encodeMs'),'saveMs',med('saveMs'),'handoffMs',med('handoffMs'),'stageMs',med('stageMs'),'writeMs',med('writeMs'),'pickerMs(excluded)',med('pickerMs'))
    if xs: print(' path line example:',json.dumps(xs[-1]))
PY
echo "Gate (option B): median 3MF totalMs <= 3 x median STL totalMs, cold and warm. Send $OUT with the summary."
if [ "${NLINES:-0}" -eq 0 ]; then
  echo "WARNING: 0 export lines captured" >&2
  exit 1
fi
