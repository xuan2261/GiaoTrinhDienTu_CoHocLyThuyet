# Phase 08 - Ch3 Newton ODE And Forced Motion Routes

## Context Links

- [Phase 03](./phase-03-interaction-grammar-and-control-model.md)
- `js/sims/ch3/ch3-dynamics-all-18-scenes.js`
- `js/sims/ch3/ch3-newton-laws-renderers.js`
- `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | In Progress |
| Estimate | 14h |
| Goal | Upgrade 10 Ch3 dynamics foundation routes: Newton laws, frames, FBD, ODE, direct/inverse dynamics |

## Routes

`ch3-1-2`, `ch3-1-3`, `ch3-2-1`, `ch3-2-2`, `ch3-2-3`, `ch3-2-5`, `ch3-3-1`, `ch3-3-2`, `ch3-4-1`, `ch3-4-2`

## Key Insights

- Ch3 must show causality: force -> acceleration -> motion.
- ODE/spring routes need stable animation controls and finite energy/readout values.
- Dynamic FBD must be visually distinct from Ch1 static FBD.

## Requirements

### Functional

- Newton II route shows `F`, `m`, `a` relation and updates values from controls/drag.
- Newton III route shows paired action/reaction forces.
- Inertial/non-inertial frame route shows pseudo-force clearly.
- Dynamic FBD route shows real forces and inertial term where appropriate.
- ODE route shows displacement, velocity, acceleration, spring/damping/force.
- Direct/inverse dynamics routes show known input and solved output.

### Non-Functional

- Avoid chaotic free physics; keep textbook idealized motion.
- Keep animation deterministic enough for tests.

## Architecture

```text
Dynamics state
  -> mass/force/spring/omega/frame params
  -> physicsDynamics helpers
  -> behavior tick or direct drag
  -> renderer + readout cards + formula panel
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\ch3-dynamics-all-18-scenes.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\ch3-dynamics-newton-dalembert-behaviors.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\ch3-newton-laws-renderers.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\ch3-spring-mass-coupled-springs-dalembert-renderers.js` |
| Modify if needed | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-physics-dynamics.js` |
| Modify tests | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` |

## Implementation Steps

1. Normalize Ch3 foundation readouts:
   - `F`, `m`, `a`, `x`, `v`, `T`, `V`, `E` where relevant.
2. Update Newton law renderers:
   - force vectors, acceleration vectors, paired forces.
3. Update frame/D'Alembert routes:
   - show inertial/pseudo-force with different style.
4. Update spring/ODE routes:
   - play/pause/reset stable.
   - drag mass changes displacement/initial condition.
   - formula panel shows ODE.
5. Update direct/inverse dynamics:
   - input/output labels clear.
6. Add route-group tests.

## Todo List

- [x] Fix `ch3-3-1` spring-mass paused drag energy/readout sync.
- [x] Keep `npm run test:sim:renderer-contract` green after P1 route filtering.
- [ ] Upgrade Newton law routes.
- [ ] Upgrade frame and dynamic FBD routes.
- [ ] Upgrade ODE/spring routes.
- [ ] Upgrade direct/inverse dynamics routes.
- [ ] Add Ch3 foundation tests.

## Tests / Verify

```powershell
npm run test:sim:unit
npx playwright test tests/simulation-browser.spec.js --grep "@ch3-foundation"
npx playwright test tests/simulation-browser.spec.js --grep "@animation"
npm run test:sim:visual-quality
npm run test:sim:renderer-contract
```

Route-specific assertions:

| Route | Verify |
|---|---|
| `ch3-2-2` | changing force/mass changes acceleration readout according to `F=ma` |
| `ch3-2-3` | paired forces equal magnitude, opposite direction |
| `ch3-2-5` | dynamic FBD includes inertial/acceleration term |
| `ch3-3-1` | mass drag changes spring displacement and energy/readout |
| `ch3-4-2` | inverse dynamics route shows solved force/output value |

## Success Criteria

- 10/10 Ch3 foundation routes are route-specific and readable.
- Representative physics formulas update correctly.
- Animation/reset stable and non-flaky.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Real dynamics too complex for route | Keep idealized formula model, not full physical sandbox |
| Spring route unstable | Clamp state and reset trails |
| Pseudo-force visual confuses students | Use explicit legend and formula panel |

## Security Considerations

- No persistence or external data.
- Numeric state clamped.

## Next Steps

Proceed to Ch3 theorem/collision/exercise routes.

## Unresolved Questions

Không có.
