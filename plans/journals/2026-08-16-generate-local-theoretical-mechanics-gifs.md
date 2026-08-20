---
title: Generate local theoretical mechanics GIFs
date: 2026-08-16
summary: Built and verified eight deterministic physics-safe GIFs without browser automation
---

# Generate local theoretical mechanics GIFs

## What happened
Implemented `gif-conversion-workspace/generate-gifs.py` and generated eight local animated GIFs plus `output/contact-sheet.png`. The renderer uses deterministic Pillow overlays on the original PNGs; it does not redraw labels, formulas, or geometry.

## Decision
Keep GIF generation isolated from `images/`, `chapters/`, and runtime contracts. Use 48 frames at 80 ms, infinite loop, max edge 1200, shared palettes, and explicit metadata/file-size assertions.

## Verification
Generator self-check passed 8/8. Independent artifact validation confirmed 48 frames, 3840 ms, loop 0, proportional dimensions, files under 8 MiB, and nontrivial frame changes. Physics review found fixed-axis and transmission-direction errors; both were corrected and re-reviewed PASS. Final code review PASSed with no blockers.

## Next steps
User reviews the GIFs in `gif-conversion-workspace/output/`. Publish only approved artifacts through the established content pipeline; do not overwrite generated source images manually.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
