// test:ws14 runs the OCCT sidecar suites only when the sidecar ships (web/perf-flags.mjs OCCT_SIDECAR). With the flag
// off (2.7.1) the sidecar is not in the product, so the suite is skipped (exit 0) instead of failing by design.
import {execFileSync} from 'node:child_process';
import {OCCT_SIDECAR} from '../../web/perf-flags.mjs';
if(!OCCT_SIDECAR){console.log('test:ws14 skipped: OCCT_SIDECAR off (web/perf-flags.mjs); the sidecar suites run when it is on.');process.exit(0);}
for(const args of [['tests/occt-sidecar.mjs'],['tests/occt-sidecar-browser.mjs'],['tests/perf/ws14-bench.mjs','--check']])
 try{execFileSync(process.execPath,args,{stdio:'inherit'});}catch(e){process.exit(e.status||1);}
