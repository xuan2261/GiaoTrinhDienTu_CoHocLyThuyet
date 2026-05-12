# Phase 02: DeCuong Interaction Grammar For Ch2

## Context Links

- [Phase 01 Baseline](./phase-01-baseline-and-legacy-scope-audit.md)
- `js/sim-professional-lab.js`
- `js/sim-animation-engine.js`
- `js/sim-interactions.js`

## Overview

Priority: P1. Status: Pending. Normalize Ch2 interaction grammar: drag, time cursor, play/pause, reset, graph readout.

## Key Insights

- Ch2 differs from Ch1 because animation and graph state can drift.
- Direct drag must pause animation when needed.

## Requirements

- Functional: every Ch2 route has a route-owned handle/control with visible/readout response.
- Functional: animated routes open controlled and reset cleanly.
- Non-functional: no readout drift while paused after drag.

## Architecture

Behavior defines animation lifecycle, derived values, and handle setters. Renderer shows trajectory/vector/graph state. Lab shell exposes status.

## Related Code Files

- Modify: `js/sims/ch2/ch2-kinematics-behaviors-a.js`
- Modify: `js/sims/ch2/ch2-kinematics-behaviors-b.js`
- Modify: relevant Ch2 renderer files.
- Modify only if needed: `js/sim-professional-lab.js`, `js/sim-animation-engine.js`, `js/sim-interactions.js`.
- Test/update: `tests/simulation-interaction-engine.spec.js`.

## Implementation Steps

1. Define Ch2 handle naming rules: `M`, `t`, `P`, `B`, `IC`, `v_a`, `v_r`, `r1`.
2. Ensure drag updates semantic state and derived values.
3. Ensure animation route opens paused when direct manipulation is expected.
4. Ensure play/pause status is Vietnamese and visible.
5. Ensure time cursor changes graph and readout together.
6. Add/extend tests for drift-free pause and graph cursor response.

## Todo List

- [ ] Normalize Ch2 handles.
- [ ] Normalize play/pause/reset lifecycle.
- [ ] Add graph/time cursor acceptance.
- [ ] Remove generic fallback handle usage.

## Verification / Tests

```powershell
npm run test:sim:unit
python tools\smoke_simulation_manifest.py --routes ch2 --require-routes 15 --require-objectives --require-direct
python tools\audit_simulation_quality.py --all --routes ch2 --require-lab-shell ch2 --require-direct-interaction ch2 --max-js-lines 220
npx playwright test tests/simulation-interaction-engine.spec.js --grep "@direct-drag|@animation|@keyboard|@reset"
```

## Success Criteria

- 15/15 Ch2 routes expose meaningful direct thao tác.
- Time/play/drag state is stable.
- No English UI leak in visible Ch2 simulation controls.

## Risk Assessment

- Risk: animation tests become flaky. Mitigation: use deterministic settle windows and readout hash comparisons.

## Security Considerations

- No raw HTML injection.
- No external graph library added.

## Next Steps

Proceed to particle/rotation/transmission polish.

## Unresolved Questions

Không có.
