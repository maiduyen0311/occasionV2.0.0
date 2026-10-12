#!/usr/bin/env python3
"""Extract image content from Web_TopMarket_Full.psd.

Two-pass strategy:
  Pass 1: every smartobject + pixel layer regardless of visibility,
          using layer.topil() to get the raw image (bypasses parent masks).
  Pass 2: rasterise a curated set of high-level group composites (hero panels,
          promo grid cards, banners) so you also get the "as designed" output
          including masks/strokes/etc.
"""
import csv
import re
import sys
from pathlib import Path

from psd_tools import PSDImage
from psd_tools.api.layers import SmartObjectLayer, PixelLayer, Group

PSD_PATH = "design/Web_TopMarket_Full.psd"
OUT_DIR = Path("common/img/psd-extracted")
GROUPS_DIR = Path("common/img/psd-extracted/groups")
MANIFEST = Path("common/img/psd-extracted/_manifest.csv")
MIN_PIXELS = 40 * 40
GROUP_NAME_FILTER = re.compile(
    r"(banner|hero|slide|promo|category|trending|flash|sale|news|instagram|logo|brand|"
    r"feature|product|model|image \d+|imag e \d+|new arrivals|"
    r"video|cta|services|payment|icon )",
    re.IGNORECASE,
)

OUT_DIR.mkdir(parents=True, exist_ok=True)
GROUPS_DIR.mkdir(parents=True, exist_ok=True)


def safe_name(s, max_len=70):
    s = re.sub(r"[^\w\s\-]+", "", s).strip().lower()
    s = re.sub(r"[\s]+", "-", s)
    s = re.sub(r"-+", "-", s)
    return s[:max_len] or "unnamed"


def layer_path(layer):
    parts = []
    cur = layer
    while cur is not None and getattr(cur, "parent", None) is not None:
        parts.append(getattr(cur, "name", ""))
        cur = cur.parent
    return " > ".join(reversed(parts))


print(f"Loading {PSD_PATH} ...", file=sys.stderr)
psd = PSDImage.open(PSD_PATH)
print(f"Loaded. Canvas: {psd.size}\n", file=sys.stderr)

# ----- Pass 1: raw smart object + pixel layers -----
raw_count = 0
raw_errors = 0
with MANIFEST.open("w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["index", "kind", "name", "path", "left", "top", "width", "height", "file"])

    for idx, layer in enumerate(psd.descendants()):
        if not isinstance(layer, (SmartObjectLayer, PixelLayer)):
            continue
        try:
            w, h = layer.width, layer.height
        except Exception:
            continue
        if w * h < MIN_PIXELS:
            continue

        try:
            img = layer.topil()
            if img is None:
                continue
            bbox = img.getbbox()
            if bbox is None:
                continue
        except Exception as e:
            raw_errors += 1
            continue

        slug = safe_name(layer.name)
        fname = f"raw-{idx:04d}-{layer.kind}-{slug}.png"
        fpath = OUT_DIR / fname

        try:
            img.save(fpath, "PNG", optimize=True)
        except Exception as e:
            raw_errors += 1
            continue

        ctx = layer_path(layer)
        writer.writerow([idx, layer.kind, layer.name, ctx, layer.left, layer.top, layer.width, layer.height, fname])
        raw_count += 1
        if raw_count % 25 == 0:
            print(f"  [pass1] extracted {raw_count}", file=sys.stderr)

print(f"\nPass 1 done. {raw_count} raw images extracted, {raw_errors} errors.", file=sys.stderr)

# ----- Pass 2: composite curated groups -----
print("\nPass 2: compositing high-level groups...", file=sys.stderr)
group_count = 0
group_errors = 0

with MANIFEST.open("a", newline="") as f:
    writer = csv.writer(f)

    for idx, layer in enumerate(psd.descendants()):
        if not isinstance(layer, Group):
            continue
        if not GROUP_NAME_FILTER.search(layer.name or ""):
            continue
        try:
            w, h = layer.width, layer.height
        except Exception:
            continue
        if w * h < 100 * 100:
            continue
        if w * h > 1700 * 1700:  # Skip the giant top-level "BODY" container
            continue

        try:
            img = layer.composite()
            if img is None:
                continue
            bbox = img.getbbox()
            if bbox is None:
                continue
        except Exception as e:
            group_errors += 1
            continue

        slug = safe_name(layer.name)
        fname = f"grp-{idx:04d}-{slug}.png"
        fpath = GROUPS_DIR / fname
        try:
            img.save(fpath, "PNG", optimize=True)
        except Exception:
            group_errors += 1
            continue

        ctx = layer_path(layer)
        writer.writerow([idx, "group", layer.name, ctx, layer.left, layer.top, w, h, "groups/" + fname])
        group_count += 1
        if group_count % 15 == 0:
            print(f"  [pass2] extracted {group_count} groups", file=sys.stderr)

print(f"\nPass 2 done. {group_count} group composites, {group_errors} errors.", file=sys.stderr)
print(f"\nFinal totals: {raw_count} raw + {group_count} groups = {raw_count + group_count}", file=sys.stderr)
print(f"Output:      {OUT_DIR}", file=sys.stderr)
print(f"Manifest:    {MANIFEST}", file=sys.stderr)
