# Technical smoke - 2026.09.02-candidate

Observed: 2026-09-02

Artifact:
- Staging: `release/2026.09.02-candidate/package/`
- ZIP SHA-256: `3defec1306bab10288faed66e45f19d8aa2befc2b66ecb1b6f2066df186f005a`

## `file://`

- Fresh local state opened the reader and chapter quiz routes.
- Quiz rendered 100 questions and 8 scope options.
- KaTeX vector accents stayed inside their symbol cells; document overflow was zero.
- Browser console/page errors: none.

## HTTP

- Staging served with `python -m http.server 8123`.
- Quiz scope and chapter-reference routes loaded from the standalone package.
- Browser console/page errors: none.

## Simulation coverage

- Sim (2D canvas): ch1-1-3-sim, ch1-1-5-sim, ch1-3-2-sim, ch2-2-3-sim, ch2-5-3-sim, ch3-1-3-sim — all mount 1 canvas + 3 SVG, zero overflow.
- Sim2 (SVG-first): ch1-1-3-sim2, ch2-2-3-sim2, ch3-1-3-sim2 — all mount 1 canvas + 3 SVG, zero overflow.
- Sim3 (Three.js 3D): ch1-1-3-sim3, ch2-2-3-sim3, ch3-1-3-sim3 — all mount 1 canvas + 3 SVG, THREE.js loaded, zero overflow.

## Mobile (320×640)

- Quiz rendered 100 cards; content-width button hidden; scrollWidth == clientWidth == 320; zero overflow.

## Boundary

This is technical smoke evidence, not independent candidate acceptance. `data/release-smoke-review.json` remains pending until an independent reviewer records environment, role, evidence and decision.
