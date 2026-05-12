# Phase 02: DeCuong Interaction Grammar For Ch1

## Context Links

- [Phase 01 Baseline](./phase-01-baseline-and-legacy-scope-audit.md)
- `js/sim-professional-lab.js`
- `js/sim-interactions.js`
- `css/style.css`

## Overview

Priority: P1. Status: Completed. Normalized Ch1 interaction grammar so every route behaves like a direct manipulation lab.

## Key Insights

- DeCuong demos expose simple drag targets, reset button, and readout cards.
- Existing shared shell already draws route handles; Ch1 must make handles meaningful, not generic.

## Requirements

- Functional: each Ch1 route has at least one route-owned handle or clear route-specific control.
- Functional: hint names what to drag and what changes.
- Non-functional: touch target >= 44px, no horizontal overflow, no hidden state drift while paused.

## Architecture

Behavior owns input semantics. Renderer owns visual affordance. Shared lab owns shell, readouts, reset/play status.

## Related Code Files

- Modify: `js/sims/ch1/*-behaviors.js`.
- Modify: `js/sims/ch1/*-renderers.js`.
- Modify only if needed: `js/sim-professional-lab.js`, `js/sim-interactions.js`, `css/style.css`.
- Test/update: `tests/simulation-interaction-engine.spec.js`.

## Implementation Steps

1. Define Ch1 handle naming rules: `F`, `M`, `P`, `A`, `B`, `N`, `T`, `G`, `C`.
2. Ensure every handle changes a physical state variable, not only canvas coordinate.
3. Ensure readout labels match Ch1 formulas: `|F|`, `α`, `M_O`, `R_A`, `R_B`, `N`, `T`, `μN`, `x_G`.
4. Add visible feedback on hover/drag through existing handle layer and status text.
5. Ensure reset restores readout and visual state.
6. Update tests to assert Ch1 direct drag/readout stability.

## Todo List

- [x] Audit all Ch1 handle labels.
- [x] Remove/replace generic fallback handles.
- [x] Make hints action-specific.
- [x] Add route-specific readout labels where missing.
- [x] Add Ch1 direct-drag browser assertions.

## Verification / Tests

```powershell
npm run test:sim:unit
python tools\smoke_simulation_manifest.py --routes ch1 --require-routes 25 --require-objectives --require-direct
python tools\audit_simulation_quality.py --all --routes ch1 --require-lab-shell ch1 --require-direct-interaction ch1 --max-js-lines 220
npx playwright test tests/simulation-interaction-engine.spec.js --grep "@direct-drag|@keyboard|@touch|@reset"
```

## Success Criteria

- 25/25 Ch1 routes have route-owned, meaningful interactions.
- Drag changes visible canvas and readout immediately.
- Reset returns to exact initial readout.

## Risk Assessment

- Risk: changing shared lab affects Ch2/Ch3. Mitigation: shared edits require full `npm run test:sim:browser`.
- Risk: over-labeling canvas. Mitigation: keep labels compact like DeCuong.

## Security Considerations

- Use `textContent` for all labels/hints.
- No raw HTML injection in hint/readout.

## Next Steps

Proceed to route visual polish after interaction grammar passes.

## Unresolved Questions

Không có.
