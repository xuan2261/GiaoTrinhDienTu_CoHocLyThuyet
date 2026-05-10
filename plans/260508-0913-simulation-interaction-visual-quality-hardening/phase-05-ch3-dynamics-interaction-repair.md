# Phase 05 - Ch3 Dynamics Interaction Repair

## Context Links

- [Audit screenshot ch3-5-3](../reports/260508-0846-simulation-browser-audit/screenshots/ch3-5-3-sim.png)
- [Audit screenshot ch3-6-2](../reports/260508-0846-simulation-browser-audit/screenshots/ch3-6-2-sim.png)

## Overview

Priority: P1. Status: Complete. Repair Ch3 dynamics interactions, clipped vectors, collision bodies, and generic control/readout behavior.

## Key Insights

- Ch3 objects are balls, masses, springs, bars, theorem panels.
- Default `primary/vector` handle is unrelated to most Ch3 renderers.
- `ch3-5-3` angular momentum arrow is visibly clipped.
- `ch3-6-2` collision body/arrow reaches canvas edge.

## Requirements

- All 18 Ch3 routes declare route-owned handles.
- Collision routes allow direct body placement/velocity adjustment.
- Theorem routes expose meaningful controls, not generic `Lực F/m` where wrong.
- Vectors render bounded but readout preserves true value.
- Assessment positive paths remain green.

## Architecture

Route behavior owns:

- handles for draggable body/mass/ball/cursor;
- derived model for readout;
- assessment mapping;
- optional `onDragStart/onDragEnd` to pause/resume animation if needed.

Rendering owns:

- visual objects;
- bounded arrows using local clamp helper or primitive helper.

## Related Code Files

Modify:
- `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js`
- `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js`
- `js/sims/ch3/ch3-newton-laws-renderers.js`
- `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js`
- `js/sims/ch3/ch3-theorems-renderers.js`
- `js/sims/ch3/ch3-collision-exercises-renderers.js`
- `js/sims/ch3/ch3-dynamics-all-18-scenes.js`
- `tests/simulation-visual-quality.spec.js`
- `tests/simulation-browser.spec.js`

## Implementation Steps

1. Add Ch3 route handle descriptors:
   - Newton routes: body and force vector.
   - Spring routes: mass block displacement.
   - Theorem routes: mass/CM point or selected theorem card if relevant.
   - Collision routes: ball centers and velocity vectors.
2. Clamp render-only arrow endpoints:
   - `ch3-5-3`: replace `vx * 10 / vy * 10` with viewport-aware scale.
   - `ch3-6-2`: clamp velocity arrows within frame.
3. Replace generic controls where route needs topic controls:
   - `ch3-7-2`: add theorem residual controls or problem preset buttons.
   - shared `Lực F/m` only where physically relevant.
4. Ensure route assessment state maps to actual body/ball positions.
5. Add tests for Ch3 known failures.

## Todo List

- [x] Add Ch3 handle descriptors.
- [x] Fix `ch3-5-3` angular momentum clipping.
- [x] Fix `ch3-6-2` collision clipping.
- [x] Improve `ch3-7-2` controls and formula text.
- [x] Preserve Ch3 assessment tests.

## Verification & Tests

Run:

```powershell
npm run test:sim:unit
npx playwright test tests/simulation-browser.spec.js --grep "ch3.*@direct-drag|@assessment"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@ch3|@visual-strict"
npm run test:sim:renderer-contract
```

Expected:
- Ch3 direct drag and assessment tests pass.
- `ch3-5-3` and `ch3-6-2` pass edge-ink gate.
- `ch3-7-2` no longer looks like placeholder single-slider route.
- Release gate passed: `npm run test:sim:release`.

## Success Criteria

- No detached handle remains in Ch3.
- Ch3 vectors stay inside scene frame.
- Collision animation looks physically coherent at default settings.

## Risk Assessment

- Risk: clamped vector hides magnitude. Mitigation: render normalized arrow, show magnitude in readout/overlay.
- Risk: route controls change assessment assumptions. Mitigation: run assessment tests after each route group.

## Security Considerations

- No network or storage schema changes.

## Next Steps

Phase 06 fixes Ch1 static route visuals and meaningful drag.
