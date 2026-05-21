# Phase 04 — DeCuong Shell Overlay

## Spec
`tests/sim-review-2026-05-19/decuong-shell-overlay.spec.js`
- For each `DECUONG_SHELL_ROUTES` route:
  1. Exactly 1 `.content-area .sim-container.sim-lab .sim-header`.
  2. 0 `.content-area .sim-container` without `sim-lab` class.
  3. Exactly 1 visible heading (h1/h2/`.sim-title`) containing the route id.

## Routes (`DECUONG_SHELL_ROUTES` — 3)
ch2-1-1, ch2-1-4, ch2-7-2

## Root Cause Hypothesis
Route fragments in `chapters/` may include a legacy `.sim-container` (without `sim-lab`) wrapper that the new `SimProfessionalLab` mounts inside, creating two containers and possibly duplicate route titles.

## Fix Steps
1. Inspect chapter fragments for these 3 routes (likely `chapters/chuong-2-*.html` segments).
2. Remove plain `.sim-container` wrapper that surrounds the lab mount point; keep only the mount target the engine expects.
3. Confirm route title appears once (heading vs sim-title).
4. Run spec: `npx playwright test tests/sim-review-2026-05-19/decuong-shell-overlay.spec.js`.

## Done When
- All 3 routes pass all 3 assertions
