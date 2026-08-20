---
title: Rebuild mechanics GIFs with true vector motion
date: 2026-08-16
summary: Replaced decorative raster overlays with eight reviewed physics-first vector animations
---

# Rebuild mechanics GIFs with true vector motion

## What happened
The first local GIF pass preserved each source raster and added only highlights, dots, and tracers. Metadata checks passed, but the mechanical bodies did not move; the user correctly rejected the visible quality.

## Decision
Replaced `gif-conversion-workspace/generate-gifs.py` with a deterministic Pillow vector renderer. Eight scenes now animate real geometry: spring deformation, rolling, fixed-axis rotation, belts/gears, rack-wedge-cam mechanisms, impact impulse, central collision, and eccentric-mass vibration. Rendering uses 2× supersampling, shared academic colors, 60 frames at 60 ms, loop=0, explicit runtime acceptance checks, and no hidden frame signatures.

Independent review found and drove fixes for equilibrium spring force, alpha fade artifacts, translating rack geometry, opposite belt-run motion, exact cam contact, τ notation, collision contact geometry, and optimized-Python check bypass.

## Verification
Generator rerun passed all eight outputs: 60 frames, 3600 ms, loop=0, max edge 1200 px, 2.07–3.72 MiB. Adjacent-frame motion passed 58–59 of 59 pairs for every GIF. Final code and visual re-reviews reported PASS with no remaining blocker. `output/contact-sheet.png` was regenerated.

## Next steps
User reviews the GIFs in `gif-conversion-workspace/output/`. Publish only approved files through the textbook content pipeline; do not overwrite canonical generated source assets manually.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
