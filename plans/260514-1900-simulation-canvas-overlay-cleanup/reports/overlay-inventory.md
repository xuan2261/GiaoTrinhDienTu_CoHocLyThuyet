# Overlay Inventory

Generated: 2026-05-14

## Summary

- Routes probed: 58/58 via Playwright `openRoute`.
- Routes with any `.sim-lab-overlay` node: 58/58.
- Routes with `.sim-overlay-formula`: 57/58.
- Initial DOM overlay totals: 140 formula nodes, 21 label nodes, 3 panel nodes.
- Static source call-sites: 135 `P.domMath(...)` calls in `js/sims`.

## Call-Site Distribution

| Count | File |
|---:|---|
| 15 | `js/sims/ch1/ch1-force-law-renderers.js` |
| 11 | `js/sims/ch1/ch1-solver-exercises-renderers.js` |
| 11 | `js/sims/ch3/ch3-newton-laws-renderers.js` |
| 10 | `js/sims/ch1/ch1-support-renderers.js` |
| 10 | `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js` |
| 10 | `js/sims/ch3/ch3-theorems-renderers.js` |
| 8 | `js/sims/ch2/ch2-kinematics-exercises-renderers.js` |
| 8 | `js/sims/ch2/ch2-relative-motion-velocity-renderers.js` |
| 7 | `js/sims/ch2/ch2-rotation-gear-renderers.js` |
| 6 | `js/sims/ch1/ch1-spatial-renderers.js` |
| 6 | `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js` |
| 6 | `js/sims/ch2/ch2-trajectory-graph-renderers.js` |
| 6 | `js/sims/ch3/ch3-collision-exercises-renderers.js` |
| 5 | `js/sims/ch1/ch1-friction-renderers.js` |
| 5 | `js/sims/ch2/ch2-plane-checker-renderers.js` |
| 4 | `js/sims/ch1/ch1-centroid-solver-renderers.js` |
| 4 | `js/sims/ch2/ch2-relative-renderers.js` |
| 3 | `js/sims/ch2/ch2-rotation-transmission-renderers.js` |

## High-Risk Routes

Routes with more than four initial overlay nodes:

- `ch1-4-4`: 7 formula, 0 label, 1 panel.
- `ch1-5-2`: 1 formula, 4 labels, 0 panel.
- `ch1-7-1`: 6 formula, 1 label, 0 panel.
- `ch1-7-2`: 5 formula, 0 label, 0 panel.
- `ch2-7-1`: 6 formula, 2 labels, 0 panel.
- `ch2-7-2`: 4 formula, 1 label, 0 panel.
- `ch3-7-1`: 4 formula, 1 label, 0 panel.
- `ch3-7-2`: 8 formula, 1 label, 0 panel.

## Classification

- Static formula overlays: equation-like `P.domMath` output such as resultant, moment, velocity relation, conservation law.
- Dynamic value overlays: numeric `P.domMath` output such as force, moment, reaction, velocity, residual, restitution, energy drift.
- Diagram labels: short `P.domLabel` text such as axis labels, state words, object markers.
- Solver/checker panels: `P.domPanel` and exercise-step labels in solver/checker routes.

## Representative Evidence

- `ch1-1-3`: vector formula and `F_x/F_y` numeric components in formula overlay.
- `ch1-1-4`: moment formula and `M_O` numeric value in formula overlay.
- `ch1-2-3`: parallelogram formula and `R` numeric value in formula overlay.
- `ch1-4-4`: six equilibrium equations plus residual value in formula overlay.
- `ch2-5-2`: instant-center formula plus `I(...)` and `|v_B|` values in formula overlay.
- `ch3-3-1`: spring displacement, velocity, and energy drift values in overlay.

## Commands

```powershell
rg -n "P\.domMath\(" js/sims
```

Playwright probe used `ALL_ROUTES` and `openRoute` from `tests/simulation-test-utils.js`.

## Unresolved Questions

None.
