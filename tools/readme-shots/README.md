# README screenshots

`capture.mjs` (with `harness.mjs`) rebuilds the screenshots in `docs/images/` from the 3.0 build. It serves the bundled app from `app/assets` on localhost with outside requests blocked, using the same setup as `npm run test:browser` and `tests/pixels.mjs`, and drives it with Playwright in headless Chromium with software WebGL (SwiftShader). The screenshots come from the web build in a browser, not from the packaged Android or Electron apps.

```bash
npm run build:web                                  # app/assets must exist
npm install --no-save playwright                   # or set AVALON_PLAYWRIGHT=<path to an installed copy>
export AVALON_CHROMIUM=/path/to/chromium           # a local Chromium executable
SHOTS_OUT=/tmp/raw node tools/readme-shots/capture.mjs                    # every shot that does not exist yet
SHOTS_OUT=/tmp/raw node tools/readme-shots/capture.mjs screw-presets-imperial   # just one (name it to remake it)
SHOTS_OUT=/tmp/raw SHOTS_FORCE=1 node tools/readme-shots/capture.mjs      # remake all
python3 tools/readme-shots/optimize.py /tmp/raw    # 256-colour optimized PNGs into docs/images/ (needs Pillow)
```

Phone shots use 412×915 at 2× with touch, and desktop shots use 1440×900 at 1×, the same viewports as `tests/pixels.mjs`. Without `SHOTS_OUT` the script writes straight into `docs/images/`. The shots are `screw-presets-imperial`, `screw-presets-metric`, `screw-preset-sheet`, `screw-preset-sheet-metric`, `screw-tube-pair`, `desktop-main`, `phone-main`, `add-shapes-sheet`, `import-3mf-applied`, `import-cancel`, `glyph-emboss-sheet`, `glyph-emboss-result`, `rotate-rings`, `hollow-open-box`, `hollow-sheet`, `measure-tool`, `edge-chamfer-menu`, `export-sheet`, `overhang-view`, `mirror-mode`, `roundover-edge-selection`, `multi-select-merge` (writes `multi-select-desktop` and `merge-dialog-desktop`), `layers-panel`, `prefabs-panel` and `build-plane-desktop`.

With software rendering each shot takes about a minute. Set `AVALON_ASSETS` to serve a different build. `import-cancel` sets the test-only `testImportDelayMs` hook (honoured only on 127.0.0.1) to hold an import long enough for the Cancel button to show.
