# Phase 05 - Align Controls and Interaction UX

## Context Links

- [Brainstorm Synthesis](./reports/brainstorm-synthesis.md)
- [Phase 04](./phase-04-convert-readout-to-cards.md)
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\DeCuong_CoHocLyThuyet.html`

## Overview

Priority: P1  
Status: Done  Goal: make controls and interaction feel simple and consistent across 58 routes without visible round drag markers inside the simulation canvas.

## Key Insights

- DeCuong uses reset/play controls that are obvious.
- Current controls are functional but can be visually heavy.
- Route renderers and behavior logic should stay unchanged unless a control is unusable.
- Current engine draws extra circular handles through `drawRouteHandles()`/`SimRender.drawHandle()`. These are generic UI markers, not mechanics visuals, and must be removed from the visible canvas.

## Requirements

Functional:
- Keep current sliders/buttons functional.
- Add or preserve reset where existing engine supports reset state.
- Add play/pause for routes with `behavior.onTick` or continuous animation.
- Show a short hint from route objective or scene feedback.
- Remove visible standalone circular drag handles, orange hit circles, and handle labels from canvas rendering.
- Preserve pointer/touch/keyboard interaction only when the hit target is invisible or tied to an existing physical object/vector/curve.
- Prefer sliders/buttons/select-like controls for adjustment when direct manipulation would require a visible generic drag point.

Non-functional:
- No new physics library.
- No broad renderer rewrite.
- Controls fit mobile width.
- No in-app long instructional prose.
- Buttons are rectangular/compact, not decorative round floating controls.

## Architecture

`buildControls()` remains in `sim-professional-lab.js`, using `SimCore.addSlider`/`addButton`.

Enhance shell-level controls only:
- group controls compactly
- use route objective as hint
- do not use active handle label as visible hint copy
- optional reset button if initial state clone is available
- optional play/pause button when `behavior.onTick` exists
- keep `canvas.__simInteractionLayer` diagnostics, but decouple them from visible handle drawing

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-professional-lab.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-core.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-rendering.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-interactions.js` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-animation-engine.js` |

## Implementation Steps

1. Review `buildControls()` output and CSS after Phase 03-04.
2. Add a consistent reset action if it can safely restore `makeState(scene, routeId)` without breaking behavior.
3. Add a consistent play/pause action for routes with `behavior.onTick`; keep non-animated routes without play/pause.
4. Set `lab.hint.textContent` from `meta.objective || scene.feedback || scene.formula`.
5. Ensure controls have accessible names and focus states.
6. Stop visible handle drawing in `drawRouteHandles()` or replace it with a debug-only mode disabled by default.
7. Keep invisible hit testing through `SimInteractions` where useful.
8. Validate mouse, touch, keyboard nudge still update readout cards for representative routes without visible handle markers.

## Todo List

- [ ] Compact slider/button CSS.
- [ ] Add safe reset only if it reuses existing state factory.
- [ ] Add play/pause for animated routes.
- [ ] Remove visible round handle/hit-circle drawing.
- [ ] Preserve invisible/direct object hit targets where meaningful.
- [ ] Preserve touch.
- [ ] Preserve keyboard focus/nudge.
- [ ] Check no button text overflow on mobile.

## Validation & Tests

```powershell
npm run test:sim:unit
npx playwright test tests\simulation-browser.spec.js --grep "@direct-drag"
npx playwright test tests\simulation-browser.spec.js --grep "@touch-viewports"
npx playwright test tests\simulation-browser.spec.js --grep "@keyboard"
npx playwright test tests\simulation-browser.spec.js --grep "@responsive"
npm run test:sim:visual-quality
```

New/updated tests:
- reset returns at least one changed readout to initial value on representative routes.
- animated route play/pause freezes and resumes canvas/readout changes.
- slider input changes a visible readout card.
- mobile controls do not overflow.
- keyboard nudge updates a visible readout card.
- no route renders generic circular handle marker or generic handle label.
- pointer/touch drag on representative routes still updates state through invisible hit targets or real scene objects.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Reset breaks route-owned state | Use `makeState()` clone and redraw; test representative Ch1/Ch2/Ch3. |
| Animated routes need custom behavior | Use animation engine pause/resume/reset where available; skip play/pause only for non-animated routes. |
| Removing visible handles breaks drag discoverability | Use hint/readout/control labels and cursor/focus behavior; keep hit targets invisible or bound to real objects. |
| Touch tests brittle | Use representative cases, keep all-route mount smoke separate. |

## Security Considerations

- No user input persisted.
- No unsafe HTML.

## Next Steps

Phase 06 rewrites QA commands and tests to lock the new contract.

## Unresolved Questions

None.
