---
title: Expand mechanics GIF collection to twenty
date: 2026-08-16
summary: Added twelve reviewed physics-first GIFs, completed the 20-GIF set, and integrated it as an accessible textbook variant
---

# Expand mechanics GIF collection to twenty

## What changed
Expanded `gif-conversion-workspace/` from 8 to exactly 20 procedural mechanics GIFs by adding 12 source/prompt pairs and renderers: 4 from chapter 1, 4 from chapter 2, and 4 from chapter 3. Added `prepare-expanded-assets.py`, normalized all new source copies as true PNG, extended `generate-gifs.py`, regenerated `output/contact-sheet.png`, and updated `huong-dan.txt` to the 20-GIF contract. Replaced plain-text mathematical labels with a cached Cambria Math-aware formula renderer for true subscripts, superscripts, primes, radicals, integrals, inequalities, and vector-direction symbols.

## Physics and implementation decisions
Used actual vector redraws rather than decorative overlays. Encoded no-slip roller motion, a fixed-wheel rolling-resistance construction, taut fixed- and moving-pulley constraints, a continuous crank circle-line intersection, hinge-slot contact, opposed acceleration vectors at J, inelastic bullet-cart motion, rigid planar motion, and wedge/plane contact. Rejected invalid crank geometry instead of clamping. Formula labels now preserve source notation such as `F_A`, `F_{ms}`, `N*`, `ω²`, `ε²`, `m₁`, `m₂`, and `v_rel` without exposing markup characters in the GIF. Output-set validation is recursive and exact.

## Verification
`python gif-conversion-workspace/generate-gifs.py` passed for all 20 GIFs: chapter counts 6/7/7; 60 frames; 60 ms/frame; 3,600 ms; loop=0; 56-59/59 significant moving pairs; 1.71-3.60 MiB; max edge 1,200 px; max loop-seam mean error 3.50. `prepare-expanded-assets.py` passed idempotence for all 24 added PNG/TXT files. Independent Pillow decode, native decoded-frame inspection, code review, and visual/physics review all passed after corrections. Canonical chapters, `images/`, and generated `js/pages.js` remained untouched.

## Textbook integration and release
Published the reviewed set once under `assets/gifs/` while retaining canonical PNGs in `images/`. Added exact 20-entry runtime mapping, global GIF/PNG toggle, persistent explicit preference, reduced-motion default, load-error fallback, responsive 44 px control, and file-safe publisher/check tooling. Release package `GiaoTrinhDienTu_CoHocLyThuyet_release_20260816.zip` contains 377 runtime files and exactly 20 GIFs; folder/archive checksum parity and direct `file://` GIF→PNG behavior passed. ZIP SHA-256: `f5617ca6976403a88a44353543ab32434a192da3370090add102d63f03d638e4`.

## Final verification
`test:gif` 4/4, `test:app` 6/6, `test:sim:mount` 110/110, content regression, strict image/formula audit, desktop/mobile browser inspection, independent runtime review, and independent visual/accessibility review all passed. A fresh-clone simulation with ignored `gif-conversion-workspace/output/` physically absent also passed `test:gif`; Pillow is pinned in `gif-conversion-workspace/requirements.txt`.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
