# Phase 04: Relative Plane Motion And Pilot Reconcile

## Context Links

- [Phase 03](./phase-03-particle-rotation-and-transmission-polish.md)
- `js/sims/ch2/ch2-relative-motion-velocity-renderers.js`
- `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js`
- `js/routes/pilot-ch2-particle-motion.js`

## Overview

Priority: P1. Status: Pending. Polish relative motion, plane motion, solver routes, and settle Ch2 pilot status.

## Key Insights

- Relative motion routes are pedagogically hard; vector triangle/instant center must be unambiguous.
- Pilot projectile is useful reference but may not map to active route ids.

## Requirements

- Functional: velocity/acceleration composition responds to drag.
- Functional: instant center/plane motion visuals show geometry and vector direction.
- Functional: solver routes give immediate DeCuong-style feedback.
- Non-functional: no active duplicate pilot route.

## Architecture

Active runtime remains `js/sims/ch2/*`. Pilot is reference unless promoted through explicit registry and tests.

## Related Code Files

- Modify: `js/sims/ch2/ch2-relative-motion-velocity-renderers.js`
- Modify: `js/sims/ch2/ch2-relative-renderers.js`
- Modify: `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js`
- Modify: `js/sims/ch2/ch2-plane-checker-renderers.js`
- Modify: `js/sims/ch2/ch2-kinematics-exercises-renderers.js`
- Modify: `js/sims/ch2/ch2-kinematics-behaviors-b.js`
- Reconcile: `js/routes/pilot-ch2-particle-motion.js`

## Implementation Steps

1. Polish `ch2-4-1` to `ch2-4-4`: moving frame, absolute/relative/transport, velocity triangle, Coriolis.
2. Polish `ch2-5-1` to `ch2-5-3`: plane body, instant center, velocity distribution.
3. Polish `ch2-7-1` and `ch2-7-2`: guided/numeric checker.
4. Compare pilot projectile with `ch2-1-*`; import only useful control grammar.
5. Decide pilot fate: reference, archive, or remove from release package.
6. Document decision if runtime package changes.

## Todo List

- [ ] Relative motion routes pass vector semantic checks.
- [ ] Instant-center route passes direct-drag and readout checks.
- [ ] Solver routes pass reset/feedback checks.
- [ ] Pilot projectile decision recorded.

## Verification / Tests

```powershell
python tools\smoke_simulation_manifest.py --routes ch2-4 ch2-5 ch2-7 --require-routes 9 --require-objectives --require-direct
python tools\audit_simulation_quality.py --all --routes ch2-4 ch2-5 ch2-7 --max-js-lines 220
npm run test:sim:unit
npx playwright test tests/simulation-interaction-engine.spec.js --grep "ch2-5-2|@direct-drag|@keyboard|@reset|@control-audit"
npx playwright test tests/mass-conversion-audit.spec.js --grep "ch2"
```

## Success Criteria

- Remaining 9 Ch2 routes are DeCuong-style direct labs.
- Pilot Ch2 no longer ambiguous.
- No route duplicates active registry ids.

## Risk Assessment

- Risk: Coriolis/relative acceleration direction wrong. Mitigation: add semantic snapshot/readout checks for representative route.

## Security Considerations

- No persisted user data beyond existing progress/local storage.
- No raw user HTML.

## Next Steps

Proceed to Ch2 release QA and docs.

## Unresolved Questions

Không có.
