# Docs Sync Verification - Sim3 ch2-5-3 Single Route Rollout

## Current State
- README, architecture, design guidelines, roadmap, changelog, and journal all describe Sim3 as a 6-route optional pilot.
- No reviewed doc overclaims a full 25-route Sim3 rollout.
- Visual artifact path is current: `plans/260603-2100-sim3-ch2-5-3-single-route-tdd-rollout/visuals/`.

## Changes Made
- Updated `docs/project-overview-pdr.md` to say Sim2 is the canonical runtime and Sim3 is only a 6-route optional pilot.
- Removed stale wording that implied the simulation runtime was tied to `js/simulations.js`.

## Verified Facts
- Sim3 pilot routes: `ch2-2-2`, `ch2-3-2`, `ch2-4-4`, `ch2-5-3`, `ch3-5-3`, `ch3-6-2`.
- Sim2 remains default and canonical.
- Gates passed: `npm run test:sim3:pilot`, `npm run test:sim3:visual:capture`, `npm run test:sim:release`.

## Gaps Identified
- `docs/project-overview-pdr.md` was lagging the rest of the docs on the Sim3 pilot scope.

## Recommendations
1. Keep future Sim3 references explicitly scoped to the 6-route pilot unless rollout expands.
2. Keep artifact paths plan-specific; do not reuse older plan folders in docs.

## Metrics
- Docs reviewed: 6
- Docs requiring no scope correction: 5
- Docs updated: 1
- Overclaim risk after fix: low

## Unresolved Questions
- None.
