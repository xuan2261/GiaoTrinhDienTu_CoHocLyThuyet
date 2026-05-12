# Ch1 Scout Report

## Relevant Files

| Path | Use |
|---|---|
| `js/sims/ch1/statics-routes.js` | 25 active route registrations |
| `js/sim-statics.js` | Thin Ch1 adapter to `SimProfessionalLab` |
| `js/sims/ch1/ch1-force-law-scenes.js` | Force/moment/couple scene data |
| `js/sims/ch1/ch1-force-law-renderers.js` | Force/moment/couple renderers |
| `js/sims/ch1/ch1-force-law-behaviors.js` | Force/moment/couple behaviors |
| `js/sims/ch1/ch1-support-spatial-scenes.js` | Supports/spatial scenes |
| `js/sims/ch1/ch1-support-renderers.js` | Support renderers |
| `js/sims/ch1/ch1-spatial-renderers.js` | Spatial renderers |
| `js/sims/ch1/ch1-support-spatial-behaviors.js` | Support/spatial behaviors |
| `js/sims/ch1/ch1-friction-centroid-solver-scenes.js` | Applied statics scenes |
| `js/sims/ch1/ch1-friction-renderers.js` | Friction renderers |
| `js/sims/ch1/ch1-centroid-solver-renderers.js` | Centroid renderers |
| `js/sims/ch1/ch1-friction-centroid-solver-behaviors.js` | Applied statics behaviors |
| `js/sims/ch1/ch1-solver-exercises-scenes.js` | Solver scenes |
| `js/sims/ch1/ch1-solver-exercises-renderers.js` | Solver renderers |
| `js/sims/ch1/ch1-solver-exercises-behaviors.js` | Solver behaviors |
| `js/routes/pilot-ch1-parallelogram.js` | DeCuong-style pilot/reference |
| `DeCuong_CoHocLyThuyet.html` | Reference interaction at parallelogram/beam demos |
| `tests/simulation-interaction-engine.spec.js` | Direct drag/control audit |
| `tests/simulation-visual-quality.spec.js` | Visual/renderer/identity audit |
| `tools/*simulation*.py` | Route-filtered static gates |

## Route Groups

- Core laws: `ch1-1-3`, `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-1-8`.
- Equilibrium: `ch1-2-1`, `ch1-2-3`, `ch1-2-6`.
- Supports/spatial: `ch1-3-1`, `ch1-3-2`, `ch1-3-3`, `ch1-3-4`, `ch1-3-6`, `ch1-3-7`, `ch1-4-1`, `ch1-4-2`, `ch1-4-4`.
- Applied/solver: `ch1-5-1`, `ch1-5-2`, `ch1-5-3`, `ch1-5-4`, `ch1-6-2`, `ch1-6-3`, `ch1-7-1`, `ch1-7-2`.

## Current Risks

- Dirty worktree shows deleted indexed `js/routes/ch1/*` plus untracked active `js/sims/*`; implementation must not restore/revert blindly.
- Docs still mention Matter.js/SVG V2 in places; plan must follow actual active runtime.
- Pilot file may duplicate active route intent; reconcile by reference, archive, or adapt explicitly.

## Unresolved Questions

Không có.
