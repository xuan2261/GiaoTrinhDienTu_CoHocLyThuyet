# Phase 05 — Label Collision Detector

## Spec
`tests/sim-review-2026-05-19/label-collision-detector.spec.js`
- For each route in `LABEL_COLLISION_ROUTES`:
  1. `data-structural-marks` attribute contains at least 1 mark starting with `label:`.
  2. Each `label:` mark has form `label:NAME:X:Y` (4 colon-segments, last 2 numeric).
  3. No two visible `.sim-overlay-label`/`.sim-overlay-panel` boxes overlap (intersection > 1px).

## Routes (`LABEL_COLLISION_ROUTES` — 15)
ch1-3-1, ch1-3-2, ch1-3-3, ch1-3-6, ch1-3-7, ch1-4-2, ch1-5-1, ch1-5-3, ch2-1-1, ch2-1-4, ch2-5-2, ch2-5-3, ch3-5-2, ch3-5-3, ch3-6-2

## Root Cause Hypothesis
- Route renderers don't emit `label:NAME:x:y` structural marks.
- Overlay labels may share placement coordinates → bbox overlap.

## Fix Steps
1. Add a label-emit primitive to `SimRouteRendererPrimitives` that records `label:${name}:${x}:${y}`.
2. Update each route's renderer to call this for every overlay label/panel it places.
3. Add a leader-line / collision avoidance pass: when two label boxes overlap by > 1px, offset one along its leader vector.
4. Run spec: `npx playwright test tests/sim-review-2026-05-19/label-collision-detector.spec.js`.

## Done When
- 15 routes report ≥ 1 well-formed label mark
- No overlapping label boxes in any of the 15 routes
