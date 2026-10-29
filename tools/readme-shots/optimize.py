#!/usr/bin/env python3
"""Shrink raw screenshots to 256-colour optimized PNGs.
Usage: python3 tools/readme-shots/optimize.py RAW_DIR [OUT_DIR]   (OUT_DIR defaults to docs/images). Needs Pillow."""
import os, sys
from PIL import Image
raw = sys.argv[1]
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.path.dirname(__file__), '..', '..', 'docs', 'images')
os.makedirs(out, exist_ok=True)
for n in sorted(os.listdir(raw)):
    if not n.endswith('.png'):
        continue
    im = Image.open(os.path.join(raw, n)).convert('RGB')
    q = im.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
    q.save(os.path.join(out, n), optimize=True)
    print(n, im.size)
