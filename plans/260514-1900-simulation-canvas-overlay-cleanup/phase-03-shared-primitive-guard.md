---
title: "Phase 03 - Shared Primitive Guard"
status: completed
priority: P1
effort: 5h
---

# Phase 03 - Shared Primitive Guard

## Context Links

- `js/sim-route-renderer-primitives.js`
- [Overlay Contract And Failing Tests](./phase-02-overlay-contract-and-failing-tests.md)

## Overview

Make `P.domMath(...)` stop rendering learner-facing formula/value nodes by default across all routes.

## Key Insights

- One shared guard fixes 58 routes immediately.
- Do not delete `domMath` API yet; route renderer calls can be migrated safely later.
- Keep structural tracing stable enough for renderer identity tests.

## Requirements

- `domMath` must not append or update `.sim-overlay-formula` in normal learner runtime.
- Optional debug escape hatch may exist, e.g. `window.SIM_ALLOW_CANVAS_FORMULA_OVERLAY === true`, but default false.
- Existing stale overlay nodes must be removed by `endOverlay` or guard cleanup.
- No CSS-only hiding.

## Architecture

Change primitive behavior at source. When `domMath` is called:

```js
mark('domMathSuppressed', key, x, y);
return;
```

If an existing node exists from prior frame, ensure it is not marked active so `endOverlay()` removes it.

## Related Code Files

Modify:
- `js/sim-route-renderer-primitives.js`

Create: none.

Delete: none.

## Implementation Steps

1. Add helper `allowCanvasFormulaOverlay()`.
2. In `domMath`, mark trace then return early unless debug flag enabled.
3. Ensure early return happens before `overlayNode(...)` to avoid DOM node creation.
4. Keep function signature unchanged for backward compatibility.
5. Run syntax and overlay tests.

## Todo List

- [x] Add shared guard.
- [x] Preserve `domMath` signature.
- [x] Verify old overlay nodes do not persist after redraw/route change.
- [x] Run targeted browser tests.

## Success Criteria

- `.sim-overlay-formula` count is zero for 58 routes.
- No renderer crashes from existing `P.domMath` calls.
- Canvas remains nonblank on representative routes.

## Verify And Tests

```powershell
node --check js\sim-route-renderer-primitives.js
npx playwright test tests\simulation-browser.spec.js --grep "overlay contract"
npx playwright test tests\simulation-browser.spec.js --grep "@route-mount"
```

## Risk Assessment

- Risk: some routes lose all formula context. Mitigation: Phase 04/05 migrate content; do not stop after this phase.

## Security Considerations

No security impact.

## Next Steps

Phase 04 migrates static formulas into right inspector.
