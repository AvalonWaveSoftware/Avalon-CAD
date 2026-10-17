// test:ws14 runs the OCCT sidecar suites whenever the sidecar is on (web/perf-flags.mjs OCCT_SIDECAR: desktop and web).
// It skips (exit 0) when the flag is off: a fixed false in perf-flags.mjs, or an Android-flagged run
// (AVALON_ANDROID_BUILD=1 installs the same 'Android' bridge marker the APK's WebView has, so OCCT_SIDECAR resolves to off).
import {execFileSync} from 'node:child_process';
if(process.env.AVALON_ANDROID_BUILD==='1')globalThis.Android={};
const {OCCT_SIDECAR}=await import('../../web/perf-flags.mjs');
if(!OCCT_SIDECAR){console.log('test:ws14 skipped: OCCT_SIDECAR off ('+(globalThis.Android?'Android build':'web/perf-flags.mjs')+'); the sidecar suites run when it is on.');process.exit(0);}
for(const args of [['tests/occt-sidecar.mjs'],['tests/occt-sidecar-browser.mjs'],['tests/perf/ws14-bench.mjs','--check']])
 try{execFileSync(process.execPath,args,{stdio:'inherit'});}catch(e){process.exit(e.status||1);}
