# Phase 06 - Ch1 Statics Visual & Drag Repair

## Context Links

- [Audit screenshot ch1-2-3](../reports/260508-0846-simulation-browser-audit/screenshots/ch1-2-3-sim.png)
- [Audit screenshot ch1-2-6](../reports/260508-0846-simulation-browser-audit/screenshots/ch1-2-6-sim.png)

## Overview

Priority: P1. Status: Complete. Repair Ch1 static diagrams so they are not cropped and direct drag maps to real construction points.

## Key Insights

- Ch1 routes can be static, but they must not feel broken.
- High edge ink exists in `ch1-2-3` and `ch1-2-6`.
- Static routes should show construction feedback on drag, even without passive animation.

## Requirements

- Known Ch1 clipped routes pass visual bounds.
- Ch1 direct drag moves real force/support/free-body element.
- Static routes preserve clear academic visual style.
- Optional construction animation is allowed only if simple.

## Architecture

Use route-owned handles for Ch1 where renderer has a visible force/vector/support point. Keep fallback handles only for routes not yet requiring custom handles.

## Related Code Files

Modify:
- `js/sims/ch1/ch1-force-law-behaviors.js`
- `js/sims/ch1/ch1-force-law-renderers.js`
- `js/sims/ch1/ch1-support-spatial-behaviors.js`
- `js/sims/ch1/ch1-support-renderers.js`
- `js/sims/ch1/ch1-friction-centroid-solver-behaviors.js`
- `js/sims/ch1/ch1-friction-renderers.js`
- `js/sims/ch1/ch1-centroid-solver-renderers.js`
- `tests/simulation-visual-quality.spec.js`

## Implementation Steps

1. Fix route `ch1-2-3` force parallelogram frame/handle positions.
2. Fix route `ch1-2-6` support/free-body diagram frame and bottom clipping.
3. Add Ch1 handle descriptors by family:
   - force law routes: force tip and origin.
   - support routes: reaction vector/control point.
   - friction routes: angle/contact point.
   - centroid routes: area/centroid control point.
4. Ensure formulas/readouts match actual construction.
5. Add edge and drag tests for known routes plus representative family routes.

## Todo List

- [x] Repair `ch1-2-3` canvas bounds.
- [x] Repair `ch1-2-6` canvas bounds.
- [x] Add Ch1 route-owned handles where useful.
- [x] Keep static diagrams visually stable.
- [x] Add representative Ch1 visual tests.

## Verification & Tests

Run:

```powershell
npm run test:sim:unit
npx playwright test tests/simulation-browser.spec.js --grep "ch1.*@direct-drag|@assessment"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@ch1|@visual-strict"
npm run test:sim:quality
```

Expected:
- `ch1-2-3`, `ch1-2-6` pass edge gate.
- Direct drag remains green for representative Ch1 routes.
- No Ch1 route regresses route identity.
- Release gate passed: `npm run test:sim:release`.

## Success Criteria

- Ch1 routes look like clean textbook diagrams with manipulable construction controls.
- No high edge ink in Ch1 known failing routes.

## Risk Assessment

- Risk: over-animating statics can confuse pedagogy. Mitigation: use construction feedback, not passive physical animation, unless route topic benefits.

## Security Considerations

- No security impact.

## Next Steps

Phase 07 turns visual quality gates strict across all 58 routes.
