---
phase: 4
title: "Make Sim2 Responsive and Accessible"
status: completed
priority: P1
dependencies: [3]
effort: "3-4 days"
---

# Phase 4: Make Sim2 Responsive and Accessible

## Overview

Make every Sim2 route responsive after mount and keyboard-operable without remounting or losing state. Keep one logical coordinate space across SVG, overlay, DPR-aware canvas, and pointer/keyboard input.

## Requirements

- Resize `360 -> 1024 -> 360` while paused/playing without state reset, overflow, clipping, or transform drift.
- Canvas/SVG/overlay alignment within 1 CSS pixel at DPR 1 and 2.
- Every SVG handle focusable, named, keyboard-controllable, clamped, and focus-visible.
- Playback step/reset buttons have meaningful Vietnamese accessible names.
- Resize observers/listeners and focused-handle callbacks are disposed cleanly.

## Architecture

- Stable logical width/height and transform/viewBox.
- Responsive `.sim2-root` uses `width:100%`, `aspect-ratio`, bounded max width.
- SVG and canvas fill root; canvas backing store scales by DPR while drawing in logical coordinates.
- Pointer CSS coordinates convert to logical coordinates before `tf.toWorld`.
- `ResizeObserver` observes visible host, with window fallback; cleanup registered through shell.
- `addHandle()` accepts an accessibility contract and routes keyboard deltas through the same state/clamp callback used by pointer drag.

## File Inventory

| Action | File group | Change | Test impact |
|---|---|---|---|
| Modify | `js/sim2/core/sim-shell.js` | Logical sizing, resize lifecycle, pointer mapping, keyboard handles | All 25 routes |
| Modify | `transform.js`, `svg-render.js`, `overlay.js` | Responsive projection/viewBox, unique marker IDs | Shared geometry |
| Modify | `canvas-underlay.js` | DPR-aware backing store and redraw | Four canvas routes |
| Modify | `controls.js` | Accessible labels for step/reset | Eight dynamic routes |
| Modify | `css/style.css` | Responsive wrapping, 44 px targets, focus-visible | UI |
| Modify | All handle-owning route files | Route-specific label/step/domain metadata | Keyboard matrix |
| Create | `tests/sim2-responsive-accessibility.spec.js` | Resize, DPR, keyboard, cleanup | New browser gate |
| Modify | `tests/sim2-ui-components.spec.js`, `sim2-ui-coverage.spec.js`, `sim2-mount-robustness.spec.js` | Shared contracts | Regression |

Handle routes include all Ch1 routes plus `ch2-1-3`, `ch2-5-2`, `ch2-5-3`, `ch3-1-3`, `ch3-2-3`, `ch3-5-2`, `ch3-5-3`, `ch3-5-4`. Discover/assert exact handle count from mounted DOM rather than hardcode.

## Function and Interface Checklist

- [x] `addHandle({a11y, keyboardStep, onDrag})` sets `tabindex`, role, name, values.
- [x] Arrow keys move correct axis; Shift+Arrow uses larger step.
- [x] Slider-linked handle updates slider without recursive `input`.
- [x] Pointer capture and keyboard share clamp/update path.
- [x] `ResizeObserver.disconnect()` and fallback listener cleanup verified.
- [x] `canvas.width/height = CSS size * capped DPR`.
- [x] Renderer coordinates remain logical after DPR scaling.
- [x] Two equal-size SVGs have unique marker/gradient/filter IDs.
- [x] Step/reset buttons expose text names, not glyph-only names.

## Dependency Map

- Depends on deterministic lifecycle from phase 3.
- Blocks phase 5 no-clip/domain assertions and phase 11 mobile captures.
- Sim3 responsive work is separate in phase 7 but reuses test utilities.

## Test Scenario Matrix

| Surface | Matrix | Acceptance |
|---|---|---|
| All Sim2 | 360, 520, 900, 1024 px | No document overflow |
| Canvas routes | DPR 1/2 + resize cycle | Backing size/alignment correct |
| Static/dynamic | Resize paused/playing | State preserved |
| Pointer | Drag before/after resize | Same world result |
| Keyboard | Tab, arrows, Shift+arrows | Readout/geometry updates |
| Accessibility | Names, roles, values, focus ring | Axe-like semantic assertions |
| Disposal | Resize/focus then dispose | No callbacks/DOM/RAF |

## Tests Before

1. Add RED narrow-host test reproducing current fixed 342+ px overflow.
2. Add RED pointer mapping test after CSS scale.
3. Add RED keyboard test showing current handles have `tabIndex=-1`.
4. Add RED accessible-name tests for step/reset.
5. Add RED observer/disposal and DPR backing-store assertions.

## Refactor

1. Separate logical viewport size from CSS display size.
2. Make SVG/canvas/overlay consume the same logical transform.
3. Add resize observation and cleanup.
4. Extend shared handle API.
5. Add route-specific accessibility metadata/steps.
6. Add responsive/focus styles without visual redesign.

## Tests After

- Repeated resize loops and sidebar-like width changes.
- Two simultaneously mounted simulations to catch SVG ID collisions.
- Home/End or repeated arrows reaching clamps without overflow.
- Reduced-motion mode and keyboard focus persistence.

## Implementation Steps

1. Write RED shared shell tests.
2. Refactor logical/CSS sizing and pointer mapping.
3. Make canvas DPR-aware.
4. Add handle semantics and keyboard behavior.
5. Migrate route metadata chapter by chapter.
6. Add control labels and CSS.
7. Run 25-route responsive matrix and lifecycle regression.

## Regression Gate

```powershell
npx playwright test tests/sim2-responsive-accessibility.spec.js
npx playwright test tests/sim2-ui-components.spec.js tests/sim2-ui-coverage.spec.js tests/sim2-mount-robustness.spec.js
npm run test:sim:mount
npm run test:sim:release
```

## Success Criteria

- [x] 25/25 routes fit supported widths with no horizontal overflow.
- [x] Canvas/SVG/overlay and pointer mapping remain aligned after resize.
- [x] Every handle is operable and understandable without a pointer.
- [x] All resize/listener/RAF resources dispose cleanly.
- [x] No route state is lost by resize.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Remount loses state/Sim3 bridge | Never remount for ordinary resize |
| CSS scales visual but not pointer | Explicit CSS-to-logical conversion test |
| Universal keyboard step is wrong | Route-specific world-unit steps |
| DPR raises memory | Cap DPR at 2 and test four canvas routes |

## Security and Accessibility

No new data flow. Avoid injecting accessible labels through HTML; use text attributes. Target WCAG keyboard operation, visible focus, named controls, and 44 px touch targets.

## Next Steps

Phase 5 repairs route-specific domain, geometry, collision, and state defects using the responsive test harness.
