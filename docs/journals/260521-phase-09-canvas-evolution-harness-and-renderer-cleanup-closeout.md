# Phase 09 canvas evolution closeout

Date: 2026-05-21

## Context

Browser mount and interaction QA had proven that 58 routes load and controls work, but it did not compare canvas frames across simulation time. The 2026-05-21 verification sweep found routes where the engine ticked while canvas stayed visually static.

## What changed

- Added 58-route canvas evolution sweep and baseline drift checker.
- Split route intent into `static-ch1`, `static-concept`, and `animated`.
- Suppressed Play for concept diagrams via `scene.static`.
- Kept readout ticking for selected static routes with `tickWithoutButton`.
- Fixed animated parity for Phase 09 routes already present in this worktree, including `ch3-2-1` and `ch3-7-2`.
- Classified `ch2-5-2` and `ch2-5-3` as static-concept instant-state routes.
- Removed preview-pause autoplay; Phase 06 remains dropped.
- Closed Phase 10 a11y/docs slice: exact static/animated canvas `aria-label`, no orphan `aria-pressed`, renderer type recipes in `docs/code-standards.md`.
- Removed `window.__currentLab`; browser harness now reads scoped `.sim-lab[data-engine-time]`.
- Fixed silent `tickWithoutButton` routes so direct drag does not pause hidden readout ticks.

## QA result

- Baseline: 58 routes, 0 known defects, 24 animated, 25 static Ch1, 9 static-concept.
- Animated routes are sampled by engine time only; wall-time fallback is rejected.
- `npm run test:sim:unit`: PASS.
- `python tools\audit_simulation_quality.py --all --max-js-lines 220`: PASS.
- `npm run test:sim:browser:evolution`: PASS.
- `npx playwright test tests/phase-09-static-routes-no-play-button.spec.js`: PASS, 9/9.

## Remaining backlog

Backlog Phase 10 is closed for the no-dependency a11y/docs scope. Backlog Phase 9 is closed via the no-dependency JSON pixel-diff tier-2 baseline; `pixelmatch/pngjs` was not added.

## Unresolved questions

None.
