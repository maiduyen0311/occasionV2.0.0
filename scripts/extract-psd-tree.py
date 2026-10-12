#!/usr/bin/env python3
"""Dump the PSD layer tree to understand what's named what + where."""
import sys
from psd_tools import PSDImage
from psd_tools.api.layers import Group

PSD_PATH = "design/Web_TopMarket_Full.psd"

print(f"Loading {PSD_PATH} ...", file=sys.stderr)
psd = PSDImage.open(PSD_PATH)
print(f"Loaded.\n", file=sys.stderr)

def walk(layer, depth=0):
    """Recurse and print layer hierarchy with kind, size, visibility."""
    indent = "  " * depth
    name = layer.name
    try:
        w, h = layer.width, layer.height
        size = f"{w}×{h}"
    except Exception:
        size = "?"
    vis = "✓" if layer.is_visible() else "·"
    print(f"{indent}{vis} [{layer.kind:11s}] {size:>11s}  {name}")
    if isinstance(layer, Group):
        for child in layer:
            walk(child, depth + 1)

for layer in psd:
    walk(layer)
