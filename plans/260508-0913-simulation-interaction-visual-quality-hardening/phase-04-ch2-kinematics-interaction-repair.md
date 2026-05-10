# Phase 04 - Ch2 Kinematics Interaction Repair

## Context Links

- [Audit screenshot ch2-1-1](../reports/260508-0846-simulation-browser-audit/screenshots/ch2-1-1-sim.png)
- [Audit screenshot ch2-1-4](../reports/260508-0846-simulation-browser-audit/screenshots/ch2-1-4-sim.png)

## Overview

Priority: P1. Status: Complete. Repair all Ch2 route interactions so handles follow the actual animated point/cursor/body.

## Key Insights

- Ch2 renderers use many state shapes: `currentX/currentY`, `cursorX/cursorY`, `px/py`, `theta`, `phi`, gear radii, instant-center points.
- `ch2-1-4` has `Thang`/`Thẳng` mismatch.
- Ch2 routes should feel animated and manipulable, not just readout-changing.

## Requirements

- All 15 Ch2 routes declare route-owned handles.
- Drag updates visual state or controlling parameter.
- Passive animation remains meaningful.
- No detached default `điểm kéo=(190; 255)` on Ch2.
- Vietnamese labels cleaned.

## Architecture

Ch2 behavior files become owner of handle mapping:

- `ch2-kinematics-behaviors-a.js`: `ch2-1-1..ch2-3-2`
- `ch2-kinematics-behaviors-b.js`: `ch2-4-1..ch2-7-2`

Examples:

- `ch2-1-1`: handle `M` binds `currentX/currentY`; drag maps to ellipse parameter `t`.
- `ch2-1-2`: handle cursor binds `cursorX/cursorY`; drag maps to time.
- `ch2-5-2`: instant center handle binds IC/slider-crank state.

## Related Code Files

Modify:
- `js/sims/ch2/ch2-kinematics-behaviors-a.js`
- `js/sims/ch2/ch2-kinematics-behaviors-b.js`
- `js/sims/ch2/ch2-trajectory-graph-renderers.js`
- `js/sims/ch2/ch2-relative-*.js`
- `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js`
- `js/sims/ch2/ch2-rotation-*.js`
- `tests/simulation-visual-quality.spec.js`
- `tests/simulation-browser.spec.js`

## Implementation Steps

1. Add handle descriptors route by route.
2. For animated routes, make drag update parameter, not just point:
   - ellipse/parabola: infer nearest `t`;
   - graph cursor: infer x-domain time;
   - rotation: infer `theta/phi`;
   - gear/transmission: infer radius or angular phase when appropriate.
3. Fix `state.mode === 'Thang'` to `Thẳng`; update display text with accents.
4. Ensure animation tick respects user-controlled parameter after drag.
5. Update readouts to reflect actual Ch2 state.
6. Add route family tests over all Ch2 routes.

## Todo List

- [x] Add Ch2 handle schema.
- [x] Fix `Thang`/`Thẳng`.
- [x] Repair `ch2-1-1` detached vector/point first.
- [x] Repair graph/cursor routes.
- [x] Repair plane motion / instant center routes.
- [x] Add Ch2 strict visual assertions.

## Verification & Tests

Run:

```powershell
npm run test:sim:unit
npx playwright test tests/simulation-browser.spec.js --grep "ch2.*@direct-drag|@animation|@responsive"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@ch2|@visual-strict"
npm run test:sim:scene-identity
```

Expected:
- All Ch2 direct-drag tests pass.
- Ch2 visual quality gate finds no default detached handles.
- `ch2-1-1` edge ink no longer touches left edge.
- `ch2-1-4` button/readout text uses `Thẳng`.
- Release gate passed: `npm run test:sim:release`.

## Success Criteria

- Every Ch2 route has at least one meaningful route-owned handle.
- Dragging a visible Ch2 handle moves the corresponding visible object/cursor.
- Ch2 screenshots look coherent at desktop and mobile widths.

## Risk Assessment

- Risk: passive animation overwrites drag. Mitigation: drag controls parameter used by tick.
- Risk: too much per-route logic in one file. Mitigation: split behavior files if line count grows beyond standard.

## Security Considerations

- No data persistence changes.

## Next Steps

Phase 05 applies same contract to Ch3.
