# 2026-06-03 — Sim3 ch2-5-3 Single Route Rollout

## Summary

Added one optional Sim3 adapter for `ch2-5-3`. Sim2 remains default and owns physics/state. Sim3 consumes forwarded `omega`, IC, sample point, radius, and `v_M`.

## Key Changes

- Added `js/sim3/sims/ch2-5-3-3d.js`.
- Wired adapter load order in `index.html` and `tests/fixtures/sim2-ch2.html`.
- Added TDD contract coverage for `ch2-5-3`: toggle, one canvas, state sync, IC drag, repeated toggle, dispose, and route-specific WebGL fallback.
- Updated Sim3 visual capture to include `ch2-5-3` and write artifacts to the current plan folder.
- Synced README, architecture, design guidelines, roadmap, changelog, and plan phase status.

## Review Fixes

- Removed hidden accumulated plate rotation from Sim3 adapter.
- Stopped unnecessary RAF loop for this static route after setup.
- Added route-specific fallback test for `ch2-5-3`.

## Verification

- `npm run test:sim3:pilot`: PASS, 11/11.
- `npm run test:sim3:visual:capture`: PASS, 6/6.
- `npm run test:sim:release`: PASS.

## Unresolved Questions

- None.
