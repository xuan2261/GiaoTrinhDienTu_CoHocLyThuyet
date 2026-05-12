# Phase 02: DeCuong Interaction Grammar For Ch3

## Context Links

- [Phase 01 Baseline](./phase-01-baseline-and-legacy-scope-audit.md)
- `js/sim-professional-lab.js`
- `js/sim-animation-engine.js`
- `js/sim-interactions.js`

## Overview

Priority: P1. Status: Pending. Normalize Ch3 interaction grammar: dynamic drag, play/pause, reset, invariant readouts.

## Key Insights

- Ch3 requires more controlled animation than Ch1/Ch2.
- User manipulation must never fight the simulation tick.

## Requirements

- Functional: every Ch3 route has route-owned handle/control with visible/readout response.
- Functional: drag pauses running animation where needed.
- Functional: invariant readout remains credible after reset/play.
- Non-functional: no readout drift while paused after drag.

## Architecture

Behavior owns dynamic state and invariant math. Renderer shows body/vectors/bars. Lab shell exposes play/pause/status/readouts.

## Related Code Files

- Modify: `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js`
- Modify: `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js`
- Modify: relevant Ch3 renderer files.
- Modify only if needed: `js/sim-professional-lab.js`, `js/sim-animation-engine.js`, `js/sim-physics-dynamics.js`.
- Test/update: `tests/simulation-interaction-engine.spec.js`.

## Implementation Steps

1. Define Ch3 handle naming rules: `m`, `F`, `x`, `v`, `J`, `e`, `m1`, `m2`, `bi 2`.
2. Ensure every handle updates physical state and derived values.
3. Standardize play/pause/reset lifecycle across Ch3 routes.
4. Add invariant readout categories: force, accel, energy, momentum, result, residual.
5. Ensure direct drag pauses animation and status text updates.
6. Add/extend tests for dynamic drift and reset.

## Todo List

- [ ] Normalize Ch3 handles.
- [ ] Normalize dynamic play/pause/reset lifecycle.
- [ ] Add invariant readout acceptance.
- [ ] Remove generic fallback handle usage.

## Verification / Tests

```powershell
npm run test:sim:unit
python tools\smoke_simulation_manifest.py --routes ch3 --require-routes 18 --require-objectives --require-direct
python tools\audit_simulation_quality.py --all --routes ch3 --require-lab-shell ch3 --require-direct-interaction ch3 --max-js-lines 220
npx playwright test tests/simulation-interaction-engine.spec.js --grep "@direct-drag|@animation|@reset|@control-audit"
```

## Success Criteria

- 18/18 Ch3 routes expose meaningful direct thao tác.
- Drag/play/pause/reset is deterministic.
- Physics readouts do not drift while paused.

## Risk Assessment

- Risk: deterministic tests mask real physics drift. Mitigation: include semantic/invariant checks in Phase 03/04.

## Security Considerations

- No raw HTML injection.
- No new third-party runtime library.

## Next Steps

Proceed to Newton/ODE/forced motion polish.

## Unresolved Questions

Không có.
