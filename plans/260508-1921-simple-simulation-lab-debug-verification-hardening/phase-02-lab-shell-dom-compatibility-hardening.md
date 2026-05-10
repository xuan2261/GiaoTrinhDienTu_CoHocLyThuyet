---
title: "Phase 02 - Lab Shell DOM Compatibility Hardening"
status: completed
priority: P1
effort: 2h
---

# Phase 02 - Lab Shell DOM Compatibility Hardening

## Context Links

- [Validation Report root cause](../260508-1435-simple-simulation-lab-assessment-removal/reports/validation-report.md#post-plan-debug-verification---2026-05-08)
- [System Architecture](../../docs/system-architecture.md)

## Overview

Harden `SimLabUI.createLab()` so browser DOM and fake-DOM smoke both work. Fix source cause, not smoke script.

## Key Insights

- Fake DOM lacks `querySelector` and `Element.remove`.
- Browser DOM supports both, but relying on them makes smoke brittle.
- A helper fallback keeps runtime behavior and test compatibility aligned.

## Requirements

- Keep one simple visible header.
- Remove legacy header from `SimCore.createSimContainer()`.
- Preserve `lab.header`, `lab.scene`, `lab.overlay`, `lab.readoutGrid`, `lab.hint`.
- Avoid broad DOM rewrites.

## Architecture

Use local helpers in `js/sim-lab-ui.js`:

- `findDirectChildByClass(parent, className)`
- `removeNode(node)`
- fallback through `parent.children` and `parent.removeChild`

## Related Code Files

- Modify: `js/sim-lab-ui.js`
- Read: `js/sim-core.js`, `tools/smoke_simulation_runtime.py`
- Tests: `tests/simulation-browser.spec.js`

## Implementation Steps

1. Inspect `SimCore.createSimContainer()` return contract.
2. Add small DOM helper functions to `sim-lab-ui.js`.
3. Replace direct `querySelector(...).remove()` use.
4. Keep shell assembly order unchanged.
5. Run syntax and runtime smoke.

## Todo List

- [x] Confirm legacy header lookup is direct child only.
- [x] Add safe helper fallback.
- [x] Run runtime fake-DOM smoke.
- [x] Confirm route shell browser tests still pass.

## Verification & Tests

```powershell
node --check js\sim-lab-ui.js
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup
npm run test:sim:browser -- --grep "@lab-shell|@responsive"
```

Expected: runtime smoke `simulation-runtime-smoke: PASS`, 58 route lab shell coverage passes.

## Success Criteria

- Fake-DOM smoke no longer fails on DOM API gaps.
- Browser shell remains visually identical.
- No duplicate `.sim-header` appears.

## Risk Assessment

- Risk: fallback matches nested header accidentally.
- Mitigation: only check direct `parent.children`.

## Security Considerations

- Use `textContent`, not `innerHTML`, for shell text.

## Next Steps

Proceed to Ch2 route interaction checks.

## Execution Result

Completed 2026-05-08. `SimLabUI.createLab()` direct-child lookup/remove fallback was present and runtime fake-DOM smoke passed with 58 executable routes.

## Unresolved Questions

None.
