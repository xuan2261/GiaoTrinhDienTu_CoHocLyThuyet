# Phase 01 - Shared Visual Motion Primitives

## Context Links

- Phase 00 tests: [Baseline And TDD Harness](./phase-00-baseline-and-tdd-harness.md)
- Core modules: `js/sim2/core/`
- CSS block: `css/style.css` section "Mô phỏng SVG-first"

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Goal | Them shared primitives nhe cho motion clarity va feedback ma khong tao runtime dependency moi. |

## Key Insights

- Existing `svg-render.js` da co gradient/depth; extend thay vi tao engine moi.
- `canvas-underlay.js` chi dung 4 route; trail fade can backward-compatible.
- `panel.js` and `controls.js` la noi tot nhat cho readout/slider feedback.
- `sim-shell.js` da quan ly cleanup; moi listener/timer/effect must register cleanup.

## Requirements

Functional:
- Trail fade API for canvas underlay.
- Ghost/afterimage helper for simple SVG body states.
- Handle pulse/active state.
- Slider/readout transient feedback.
- Formula term highlight hook via class/attribute, not rerender heavy.
- Reduced-motion disables pulse/flash/easing.

Non-functional:
- No edits to `physics/*`.
- No new runtime file unless existing file size makes it unavoidable; prefer existing core modules.
- Backward-compatible old signatures.
- Dispose clears timers/listeners/classes.

## Architecture

```
route state change
  -> controls input feedback
  -> shell marks active handle/vector
  -> panel flashes changed readout/formula row
  -> svg/canvas renders ghost/trail fade
```

## Related Code Files

Modify:
- `js/sim2/core/canvas-underlay.js` - `drawTrail(points,{fade:true,maxAlpha,minAlpha})`.
- `js/sim2/core/svg-render.js` - optional ghost/guide primitive or attributes for opacity/dash.
- `js/sim2/core/sim-shell.js` - handle pulse/active class, cleanup timers.
- `js/sim2/core/panel.js` - changed-row flash and optional `key` per readout row.
- `js/sim2/core/controls.js` - input changed class, output flash.
- `css/style.css` - scoped `.sim2-*` effect styles and reduced-motion rules.
- `tests/sim2-ui-components.spec.js`.
- `tests/sim2-visual-motion-polish.spec.js`.

Create:
- None preferred.

Delete:
- None.

## Implementation Steps

1. Implement `prefersReducedMotion()` helper in the smallest existing core location that needs it, likely `sim-shell.js` or local checks per module.
2. Extend `canvas-underlay.drawTrail(points, opts)`:
   - old behavior unchanged when `opts.fade` absent.
   - fade draws segments with alpha from old to new.
   - cap alpha and width predictable.
3. Extend `panel.setReadout(rows)`:
   - support row `key`.
   - remember previous values by key/label.
   - add `.sim2-readout-changed` when value changes.
   - cleanup timeout on dispose.
4. Extend `controls`:
   - add `.sim2-output-changed` on user input and programmatic `setValue`.
   - do not dispatch input from `setValue`.
5. Extend `addHandle`:
   - option `hintPulse`.
   - add `.sim2-handle-pulse` at mount.
   - add `.is-active` during drag.
   - remove classes and timers on dispose.
6. Add CSS:
   - subtle pulse, flash, active handle ring, guide line style.
   - `@media (prefers-reduced-motion: reduce)` disables transitions/animations.
7. Turn Phase 00 RED tests GREEN.

## Todo List

- [ ] Add fade trail support.
- [ ] Add readout changed feedback.
- [ ] Add output/slider feedback.
- [ ] Add handle pulse/active state.
- [ ] Add reduced-motion CSS.
- [ ] Verify cleanup after dispose.

## Success Criteria

- `npx playwright test tests/sim2-ui-components.spec.js tests/sim2-visual-motion-polish.spec.js --reporter=line` PASS.
- No existing tests regress.
- No code path requires new dependency or network.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Timers leak after route dispose | Store timer ids and clear in dispose. |
| Flash causes visual noise | Duration 300-500ms, opacity subtle, disabled in reduced-motion. |
| Core files grow too large | Keep helpers tiny; avoid abstraction unless repeated. |

## Security Considerations

- Continue safe DOM creation.
- No untrusted HTML injection for labels/readouts.

## Next Steps

- Phase 02 uses shared primitives on 3 pilot routes.

## Unresolved Questions

- None.
