# Phase 02 — GREEN Adapter And Wiring

## Context Links

- Phase 01: [RED Contract Tests](./phase-01-red-contract-tests.md)
- Current Sim2 route: `js/sim2/sims/ch2/ch2-5-3.js`
- Existing adapter examples: `js/sim3/sims/ch2-4-4-3d.js`, `js/sim3/sims/ch2-2-2-3d.js`

## Overview

Priority: P1. Status: Complete.

Implement the smallest optional Sim3 adapter for `ch2-5-3` and wire Sim2 state into it.

## Key Insights

- Sim3 must not calculate physics independently.
- Sim2 `render2()` already computes IC, sample point, radius, and velocity via canonical `K.instantCenterVelocity`.
- This route is visually about planar velocity field; 3D should show a rigid plate, IC post, sample M, radius guide, sparse velocity arrows.

## Requirements

Functional:
- New adapter `js/sim3/sims/ch2-5-3-3d.js`.
- Export `root.Sim3Ch253 = { create }`.
- In `ch2-5-3.js`, attach `Sim3Mode` only when `root.Sim3Ch253` exists.
- In `render2()`, call `sim3.setState(...)` with deterministic state.
- Add script load to `index.html` and Ch2 fixture.

Non-functional:
- Keep adapter route-scoped and thin.
- File should stay comfortably under code size target.
- No new dependency.

## Architecture

Data flow:

```text
Sim2 state/control/drag
  -> render2()
  -> K.instantCenterVelocity(...)
  -> sim3.setState({ omega, ic, sample, radius, vM })
  -> Sim3 adapter updates mesh positions/arrows/debug
```

Visual design:
- Plane disk/plate with subtle grid.
- IC marker vertical post at P.
- Sample point M as sphere.
- Radius guide P→M.
- One prominent `v_M` arrow at M.
- Optional sparse background field arrows, capped and low-opacity.

## Related Code Files

Modify:
- `js/sim2/sims/ch2/ch2-5-3.js`
- `index.html`
- `tests/fixtures/sim2-ch2.html`

Create:
- `js/sim3/sims/ch2-5-3-3d.js`

Delete: none.

## Implementation Steps

1. Create `ch2-5-3-3d.js` following existing UMD adapter style.
2. Use `Sim3Shell.create` with label `Phân bố vận tốc 3D`.
3. Add plate/grid, IC marker, sample point, radius guide, and velocity arrow.
4. Use `Sim3Primitives.arrow`, `orientArrow`, `cylinderBetween`, `setCylinderBetween`.
5. In `setState`, update objects from Sim2 state and write `window.__SIM3_DEBUG__['ch2-5-3']`.
6. In Sim2 route, attach `Sim3Mode` after shell creation.
7. Send state from `render2()` after canonical velocity calculation.
8. Add cleanup `shell.addCleanup(() => sim3.dispose())`.
9. Add adapter script to `index.html`.
10. Run `npm run test:sim3:pilot`; fix only route-scoped failures.

## Todo List

- [x] Adapter created.
- [x] Sim2 route state forwarding added.
- [x] Runtime script order updated.
- [x] Ch2 fixture script order updated.
- [x] Focused Sim3 tests pass.

## Success Criteria

- Phase 01 RED test turns GREEN.
- Existing five Sim3 routes still pass.
- Sim2 `ch2-5-3` works in 2D when Sim3 unavailable.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Duplicate physics | Only pass values already computed by Sim2. |
| Visual clutter | Keep sparse arrows; one primary `v_M`. |
| Hidden work | Reuse `Sim3Mode` lifecycle. Add no custom RAF. |
| Load order break | Adapter script before Sim2 route script. |

## Security Considerations

No network, no user data, no external assets.

## Next Steps

Proceed to Phase 03 after focused test passes.

## Unresolved Questions

- None.
