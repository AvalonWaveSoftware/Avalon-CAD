# Glyph data generator (Letters, numbers & symbols)

ADR: `ADR-new-primitives-polyhedra-text.md` §2.2, Phase A.3.

`extract.py` turns Roboto Bold into the outline data used by the `glyph` shape:

| Output | Contents | Who may import it |
|---|---|---|
| `web/glyphs.mjs` | Full outlines + `glyphPath(c)` / `glyphInfo(c)` | Worker / OCCT side only (`kernel.mjs`, `cad-solid.mjs`), never `main.js` |
| `web/glyph-metrics.mjs` | `[xMin, yMin, xMax, yMax]` per glyph | UI-safe |

Character set (94, picker order): `0-9`, `A-Z`, `a-z`, then the 32 printable ASCII symbols
``!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~`` (no space). Font id: `roboto-bold@1`.

## Pinned inputs

| Input | Pin |
|---|---|
| Font | `Roboto[wdth,wght].ttf` Version 3.015, from Google Fonts' official repo at commit `1c627bfa375fc51cf86fabeca4f6e08a95f0aa5c`: https://raw.githubusercontent.com/google/fonts/1c627bfa375fc51cf86fabeca4f6e08a95f0aa5c/ofl/roboto/Roboto%5Bwdth%2Cwght%5D.ttf |
| Font sha256 | `d7598e12c5dbef095ff8272cfc55da0250bd07fbdecbac8a530b9b277872a134` |
| Licence | SIL OFL 1.1, no Reserved Font Name. `OFL.txt` from the same commit (sha256 `061402327a96aadb0bfb694a960ed289ecd38d383e396243831ab81feb109c41`) is committed verbatim as `licenses/Roboto-OFL-1.1.txt`. Upstream source per `METADATA.pb`: googlefonts/roboto-classic @ `91d5d3e`, release v3.015. |
| Tools | `fonttools==4.65.0`, `skia-pathops==0.9.2` (`requirements.txt`); the script refuses other versions. |

The TTF is downloaded on first run into `tools/glyphs/.cache/` (git-ignored) and its sha256 is
checked every run. The TTF itself is not committed or shipped.

## Pipeline

1. Static instance `wght 700 / wdth 100` with `fontTools.varLib.instancer`, **`OverlapMode.REMOVE`**
   (skia-pathops). The variable font has overlapping contours (`8 a e g B % & @ $` …); without this
   step NonZero ≠ EvenOdd and OCCT builds wrong solids (ADR §2.2).
2. Decompose components, split implied-on-curve TrueType quads into explicit `Q` segments, drop
   zero-length segments and the redundant closing line.
3. Coordinates are stored in **half font units** (upm 2048 → data upm 4096), so the implied
   midpoints are exact integers. `capHeight` = 2912 (OS/2 sCapHeight 1456 × 2, checked against `H`).
   Scale by `size / capHeight` so cap height = `size` mm.
4. Paths are stored as a compact relative string (`m l q z`, each x,y pair relative to the
   previously written pair) and decoded by `glyphPath(c)` into
   `[['M',x,y] | ['L',x,y] | ['Q',cx,cy,x,y] | ['Z']]` (absolute, y up). Outer contours are
   clockwise, counters counter-clockwise.

Sizes: `glyphs.mjs` ≈ 28.9 KB raw / 13.1 KB gzip -9; `glyph-metrics.mjs` ≈ 3.9 KB / 2.0 KB.

## Run

```sh
python3 -m venv /tmp/glyphs-venv && /tmp/glyphs-venv/bin/pip install -r tools/glyphs/requirements.txt
/tmp/glyphs-venv/bin/python tools/glyphs/extract.py           # regenerate web/glyphs*.mjs
/tmp/glyphs-venv/bin/python tools/glyphs/extract.py --check   # exit 1 if the committed files are stale
```

Output is deterministic. Changing the font, axes, character set or encoding requires bumping
`FONT_ID` (`roboto-bold@2`, …): the id is part of each glyph object's params and therefore of
`geometryKey` and the content hash, so old saved letters never silently reshape.

Tests: `node tests/glyph-data.mjs` (add `MANIFOLD_MODULES=<dir with manifold-3d>` for the kernel cross-check).
