---
type: research
topic: professional-simulation-labs
created: 2026-05-06
---

# Research Synthesis

## Summary

Best path: keep offline static runtime, add professional interaction and assessment layers, split implementation by topic. Avoid WebGL/3D as default. Use Canvas 2D + SVG/HTML overlays. Add dev-only browser QA because current visual QA is ad hoc.

## Inputs Reused

| Source | Relevant finding |
|---|---|
| Previous offline interaction research | Script tags + Canvas/SVG best fit for `file://` |
| Previous mechanics coverage research | Highest learning value: FBD, friction, Coriolis, differential motion, collisions |
| P1 QA report | 58 routes pass, but P2/P3 backlog and large files remain |
| Current scout | 58 SIM routes, 99 lesson routes, current sim files over 700-1000 lines |

## Professional Lab Definition

| Layer | Standard |
|---|---|
| Visual | Stable canvas, clear labels, grid/axes/scale, motion trails, formula readout, no clutter |
| Direct interaction | Learner drags vectors, bodies, supports, points, collision setup, graph cursors |
| Pedagogy | Objective, guided steps, hint, feedback, reset, route progress |
| Assessment | At least 2 checkpoints per route; core routes 4-6 checkpoints |
| Maintainability | Files <200 lines target, pure physics separated from render/UI |
| QA | Unit formulas + route manifest + browser pixel + interaction smoke |

## Architecture Choice

| Option | Pros | Cons | Decision |
|---|---|---|---|
| Keep current 3 domain files | Lowest upfront work | Files already too large, hard to review | Reject |
| One file per route | Max isolation | Too many script tags, duplicated patterns risk | Use only for complex routes |
| Topic packs + shared kernels | Balanced maintainability | More files/script order management | Recommend |

## Scope Boundary

- Upgrade exactly current 58 `SIM_MAP` routes.
- Do not add the 20 P2/P3 missing routes in this plan.
- Do not change DOCX content pipeline.
- Dev-only Playwright is allowed; runtime must still work without npm.

## Unresolved Questions

- None. User confirmed pro visual + pro pedagogy, all 58 routes, more script files accepted.
