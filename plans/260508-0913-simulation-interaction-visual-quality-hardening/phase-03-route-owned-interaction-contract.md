# Phase 03 - Route-Owned Interaction Contract

## Context Links

- [Research 01](./research/researcher-01-interaction-contract-report.md)
- [Audit finding 1](../reports/260508-0846-simulation-browser-audit/report.md)

## Overview

Priority: P1. Status: Complete. Replace global generic handles with route-owned handle descriptors supplied by behavior contracts.

## Key Insights

- Current handles mutate `state.primary/state.vector`.
- Many renderers do not read those fields.
- Interaction must target same state as renderer.

## Requirements

- Behavior can declare route handles.
- Shell binds pointer/touch/keyboard from declared handles.
- Shell draws declared handles only.
- Legacy fallback remains for routes without handles.
- Assessment state compatibility remains intact.

## Architecture

Behavior contract extension:

```js
handles(scene, state, d, lab) {
  return [
    { id, label, kind, hitRadius, get, set, bounds, constraint, snap }
  ];
}
```

`SimProfessionalLab.draw()` flow:

1. compute derived model;
2. render route scene;
3. resolve `handles`;
4. draw handles through `SimRender.drawHandle`;
5. update interaction layer handle definitions;
6. update readout via behavior formatter.

## Related Code Files

Modify:
- `js/sim-professional-lab.js`
- `js/sim-route-behavior-registry.js`
- `js/sim-interactions.js`
- `js/sim-rendering.js`
- `tests/simulation-browser.spec.js`
- `tests/simulation-visual-quality.spec.js`

## Implementation Steps

1. Add helper in `sim-professional-lab.js`: `resolveHandles(scene, state, d, behavior, lab)`.
2. Add helper: `drawRouteHandles(ctx, handles)`.
3. Replace unconditional global handle draw with:
   - route handles if available;
   - legacy fallback only when no route handles.
4. Refactor `addInteractions` to bind resolved descriptors.
5. Prevent listener duplication on each draw:
   - create interaction layer once;
   - update handle definitions in place or rebuild safely with lifecycle cleanup.
6. Add readout field `handles=<ids>` only if useful for test diagnostics; avoid visible noise in final UI.
7. Preserve keyboard nudge behavior.

## Todo List

- [x] Define handle descriptor shape.
- [x] Add shell resolver/drawer.
- [x] Refactor interaction binding.
- [x] Preserve fallback for routes without handles.
- [x] Add tests for handle descriptors.

## Verification & Tests

Run:

```powershell
npm run test:sim:unit
npm run test:sim:browser -- --grep @direct-drag
npm run test:sim:visual-quality
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --malformed-assessment-storage
```

Expected:
- Direct drag tests still pass.
- No listener cleanup regression.
- Visual quality spec can detect route handle descriptors.
- Release gate passed: `npm run test:sim:release`.

## Success Criteria

- Shell no longer forces `kéo` and `v/F` on routes with route-owned handles.
- Ch2/Ch3 can opt into exact state handles in later phases.
- No memory/listener leaks.

## Risk Assessment

- Risk: rebuilding handles every frame creates duplicate listeners. Mitigation: one layer per lab, update data not listeners.
- Risk: fallback removal breaks Ch1. Mitigation: fallback remains until Ch1 routes get own handles.

## Security Considerations

- Pointer data is local only.
- No persistent state schema changes.

## Next Steps

Phase 04 maps Ch2 behavior state to route-owned handles.
