# Phase 03: Newton ODE And Forced Motion Polish

## Context Links

- [Phase 02](./phase-02-decuong-interaction-grammar-for-ch3.md)
- `js/sims/ch3/ch3-newton-laws-renderers.js`
- `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js`
- `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js`

## Overview

Priority: P1. Status: Pending. Polish Ch3 Newton, ODE/spring, D'Alembert, and inverse/forced motion routes.

## Key Insights

- These routes are the foundation for Ch3 dynamic reasoning.
- Visuals must show force/acceleration/inertial-force direction clearly.

## Requirements

- Functional: Newton routes show `F`, `m`, `a` relation.
- Functional: ODE/spring routes show displacement, restoring force, energy.
- Functional: D'Alembert/inverse routes show force balance and desired motion.
- Non-functional: dynamic tick stable and reset deterministic.

## Architecture

Use `SimPhysicsDynamics` for math where possible. Keep route renderers unique and compact. Use bars/vectors rather than dense text.

## Related Code Files

- Modify: `js/sims/ch3/ch3-dynamics-all-18-scenes.js`
- Modify: `js/sims/ch3/ch3-newton-laws-renderers.js`
- Modify: `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js`
- Modify: `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js`
- Modify if formula needed: `js/sim-physics-dynamics.js`

## Implementation Steps

1. Polish `ch3-1-2`, `ch3-1-3`: force-motion concept and frames.
2. Polish `ch3-2-1`, `ch3-2-2`, `ch3-2-3`, `ch3-2-5`: Newton laws and dynamic FBD.
3. Polish `ch3-3-1`, `ch3-3-2`: ODE and system differential motion.
4. Polish `ch3-4-1`, `ch3-4-2`: D'Alembert and inverse dynamics.
5. Add invariant checks for `F=ma`, spring energy, and reset state.
6. Ensure all routes remain mobile readable.

## Todo List

- [ ] Newton routes pass semantic readout checks.
- [ ] ODE/spring routes pass energy/readout checks.
- [ ] D'Alembert/inverse routes pass direct-drag checks.
- [ ] Animation lifecycle stable.

## Verification / Tests

```powershell
python tools\smoke_simulation_scene_catalog.py --strict --routes ch3-1 ch3-2 ch3-3 ch3-4 --require-routes 10
python tools\smoke_simulation_renderer_contract.py --strict --routes ch3-1 ch3-2 ch3-3 ch3-4 --require-routes 10
npm run test:sim:unit
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch3-3-1|@animation|@reset|@control-audit"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-all|@theme-all"
```

## Success Criteria

- First 10 Ch3 routes are clear dynamic labs.
- Representative `ch3-3-1` spring route has stable energy/readout behavior.
- No fallback or duplicate renderer/behavior identity.

## Risk Assessment

- Risk: visually smoother animation hides incorrect formulas. Mitigation: readout/invariant checks required before phase completion.

## Security Considerations

- No external physics dependency.
- Keep all user-visible text escaped through DOM text APIs.

## Next Steps

Proceed to theorem/collision/exercise routes and legacy reconcile.

## Unresolved Questions

Không có.
