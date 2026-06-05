---
phase: 5
title: "Dynamic Capture And QA"
status: completed
priority: P1
effort: "4h"
dependencies: [4]
---

# Phase 05: Dynamic Capture And QA

## Overview

Make Sim3 visual capture prove the best teaching state, especially for `ch3-6-2` collision, and add plan-scoped final artifacts for manual review.

## Requirements

- Functional: visual capture must generate meaningful screenshots for all six routes; collision capture must show near/after impact.
- Non-functional: capture remains dev-only and deterministic; release gate remains separate from visual review.

## Architecture

Extend `tools/sim3-visual/pilot-capture.spec.js` with route-specific capture setup and update `OUT_DIR` to this plan's `visuals/final/`. Prefer deterministic step clicks over time waits. For collision, add an explicit advance-to-impact helper or step count derived from current route behavior.

## Related Code Files

- Modify: `tools/sim3-visual/pilot-capture.spec.js`
- Modify: `tests/sim3-pilot-fallback-dispose.spec.js`
- Modify: `js/sim3/sims/ch3-6-2-3d.js` only if debug phase/capture state is insufficient
- Create: `plans/260603-2306-sim3-visual-polish-next-pass-deep-tdd/visuals/final/*.png`
- Create: `plans/260603-2306-sim3-visual-polish-next-pass-deep-tdd/reports/final-visual-review.md`

## Implementation Steps

1. RED: add test/capture assertion that `ch3-6-2` visual capture reaches `phaseCue: impact|after`, not only `before`.
2. Add explicit collision capture debug state if needed: `distanceToImpact`, `impactReached`, or `capturePhase`.
3. Add route-specific capture state:
   - `ch2-2-2`: frame with tangent vector visible and not edge-crowded.
   - `ch2-3-2`: frame with both gear and belt directions visible.
   - `ch2-4-4`: frame with non-zero `ω`, `v_rel`, `a_cor`.
   - `ch2-5-3`: default IC/M relation visible.
   - `ch3-5-3`: radius state showing clear arm/mass relation.
   - `ch3-6-2`: near/after impact state.
4. Keep screenshots under this plan's `visuals/final/`.
5. Run `npm run test:sim3:visual:capture`.
6. Manually inspect six screenshots and fill final visual review.

## Success Criteria

- [x] `npm run test:sim3:visual:capture` passes.
- [x] Six final screenshots exist under this plan.
- [x] `ch3-6-2` final screenshot is near/after impact.
- [x] Capture script `OUT_DIR` points to this plan's `visuals/final/`.
- [x] Final visual review compares baseline vs final per route.
- [x] Capture script remains dev-only and does not affect runtime.

## Risk Assessment

Risk: collision step count changes with future physics tweak. Mitigation: assert semantic debug state and use deterministic stepping, not pixel-only timing.
