# README screenshots

`capture.mjs` (with `harness.mjs`) rebuilds the screenshots in `docs/images/`. It serves the bundled app from `app/assets` on localhost, using the same setup as `npm run test:browser`, and drives it with Playwright in headless Chromium with real WebGL (SwiftShader).

```bash
npm install --no-save playwright && npx playwright install chromium
SHOTS_OUT=docs/images node tools/readme-shots/capture.mjs               # all shots
SHOTS_OUT=docs/images node tools/readme-shots/capture.mjs objects-panel # just one
for f in docs/images/*.png; do pngquant --force --skip-if-larger --quality 75-95 --ext .png "$f"; done
```

Phone shots use 412×915 at 2×, and desktop shots use 1440×900. With software rendering, each shot takes about a minute. Set `AVALON_ASSETS` to serve a different build.
