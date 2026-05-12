# Phase 04: Theorems Collision Exercises And Pilot Reconcile

## Context Links

- [Phase 03](./phase-03-newton-ode-and-forced-motion-polish.md)
- `js/sims/ch3/ch3-theorems-renderers.js`
- `js/sims/ch3/ch3-collision-exercises-renderers.js`
- `js/routes/phase-05-ch3-dynamics-all-routes.js`
- `js/routes/pilot-ch3-collision-solver.js`

## Overview

Priority: P1. Status: Pending. Polish theorem, collision, and exercise routes; settle Ch3 bulk/pilot status.

## Key Insights

- Collision/energy routes need clear before/after state, not only moving balls.
- Bulk legacy file is too large and should not be active without extraction/splitting.

## Requirements

- Functional: momentum/energy/angular momentum readouts tie to visual vectors/bars.
- Functional: collision routes show restitution, impulse, before/after velocities.
- Functional: exercise routes give immediate DeCuong-style feedback.
- Non-functional: no bulk active script load, no duplicate route registration.

## Architecture

Active runtime remains `js/sims/ch3/*`. Bulk/pilot code is reference only unless extracted into current route modules with tests and file-size compliance.

## Related Code Files

- Modify: `js/sims/ch3/ch3-theorems-renderers.js`
- Modify: `js/sims/ch3/ch3-collision-exercises-renderers.js`
- Modify: `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js`
- Reconcile: `js/routes/phase-05-ch3-dynamics-all-routes.js`
- Reconcile: `js/routes/pilot-ch3-collision-solver.js`
- Optional docs: `docs/codebase-summary.md`, `docs/system-architecture.md`

## Implementation Steps

1. Polish `ch3-5-1` to `ch3-5-4`: center mass, momentum, angular momentum, kinetic energy.
2. Polish `ch3-6-2`, `ch3-6-3`: collision and collision solver.
3. Polish `ch3-7-1`, `ch3-7-2`: theorem selector and numeric checker.
4. Compare bulk legacy routes with active routes; extract only useful visual/interaction ideas if needed.
5. Decide bulk/pilot fate: archive/remove/reference; never keep ambiguous active script.
6. Document decision if runtime package changes.

## Todo List

- [ ] Theorem routes pass momentum/energy readout checks.
- [ ] Collision routes pass before/after/restitution checks.
- [ ] Solver routes pass reset/feedback checks.
- [ ] Bulk/pilot Ch3 decision recorded.

## Verification / Tests

```powershell
python tools\smoke_simulation_manifest.py --routes ch3-5 ch3-6 ch3-7 --require-routes 8 --require-objectives --require-direct
python tools\audit_simulation_quality.py --all --routes ch3-5 ch3-6 ch3-7 --max-js-lines 220
npm run test:sim:unit
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch3-6-2|ch3-7-2|@control-audit|@animation"
npx playwright test tests/mass-conversion-audit.spec.js --grep "ch3"
```

## Success Criteria

- Remaining 8 Ch3 routes are DeCuong-style dynamic labs.
- Bulk and pilot files no longer ambiguous.
- Collision/theorem route readouts are physically credible.

## Risk Assessment

- Risk: bulk file removal loses useful visual logic. Mitigation: preserve as archived reference or extract small ideas into active modules before removal.

## Security Considerations

- No new persisted data.
- No raw HTML in checker feedback.

## Next Steps

Proceed to Ch3 final QA and full release handoff.

## Unresolved Questions

Không có.
