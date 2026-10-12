#!/usr/bin/env python3
"""Extract font names and sizes from text layers in the Web_TopMarket_Full.psd."""
import sys
from collections import Counter
from psd_tools import PSDImage
from psd_tools.api.layers import TypeLayer

PSD_PATH = "design/Web_TopMarket_Full.psd"

print(f"Loading {PSD_PATH} ...", file=sys.stderr)
psd = PSDImage.open(PSD_PATH)
print(f"Loaded.", file=sys.stderr)

type_layers = [l for l in psd.descendants() if isinstance(l, TypeLayer)]

font_counter = Counter()
size_counter = Counter()
font_to_samples = {}  # font_name -> list[(size, text)]

for layer in type_layers:
    text = (layer.text or '').strip().replace('\r', ' | ')[:60]
    if not text:
        continue

    # font_names is a convenient property
    try:
        fonts_in_layer = list(layer.font_names) or []
    except Exception:
        fonts_in_layer = []

    # Sizes via engine_dict StyleRun
    sizes = []
    try:
        ed = layer.engine_dict
        style_runs = ed['StyleRun']['RunArray']
        for run in style_runs:
            sheet = run['StyleSheet']['StyleSheetData']
            if 'FontSize' in sheet:
                sizes.append(float(sheet['FontSize']))
    except Exception:
        pass

    for f in fonts_in_layer:
        font_counter[f] += 1
        font_to_samples.setdefault(f, []).append((sizes[0] if sizes else None, text))
    for s in sizes:
        size_counter[round(s, 1)] += 1

print("\n=== UNIQUE FONTS USED (PSD = 1920×8998 design canvas) ===")
for font, count in font_counter.most_common():
    print(f"  {count:4d}× {font}")

print("\n=== FONT SIZES (px at design scale; divide by ~1.33 for 1440 viewport) ===")
for size, count in size_counter.most_common(30):
    print(f"  {count:4d}× {size}px  (~{round(size/1.33, 1)}px at 1440)")

print("\n=== SAMPLES PER FONT (first 8 each) ===")
for font, samples in font_to_samples.items():
    print(f"\n  FONT: {font}")
    seen = set()
    for sz, text in samples:
        key = (sz, text[:20])
        if key in seen:
            continue
        seen.add(key)
        print(f"    {sz}px  {text!r}")
        if len(seen) >= 8:
            break
