# Phase 04 - Convert Readout to Cards

## Context Links

- [Simple Shell Architecture Research](./research/simple-shell-architecture-research.md)
- [Phase 03](./phase-03-build-simple-lab-shell.md)

## Overview

Priority: P1  
Status: Done  Goal: make readout look and behave like DeCuong info cards, using structured data from current scene/readout metadata.

## Key Insights

- Current `lab.info.textContent` is a long sentence, hard to scan.
- Scene catalogs already define `readouts`.
- Behavior readout string can remain fallback but should not drive card UI.
- Current fallback readout can expose generic handle coordinates like `điểm kéo=(190; 255)`, which is not acceptable in the simple shell.

## Requirements

Functional:
- Render 2-6 cards per route depending on available readouts.
- Cards show label, value, unit.
- Cards show physical quantities or route concepts only; no generic handle/drag coordinate card.
- Objective/hint remains separate from readout.
- Cards update after slider, drag, animation tick.
- Visible card labels must not use generic `điểm kéo`, `điểm điều khiển`, `handle`, `cursor`, or raw coordinate fallback unless the coordinate is a named mechanics concept such as `IC`, `B`, `P`, or `m`.

Non-functional:
- No string parsing as primary mechanism.
- No per-route renderer rewrite required.
- Text wraps cleanly on mobile.

## Architecture

Add helper in `sim-professional-lab.js`:

```js
function formatReadoutItems(scene, state, d, handles) {
  return (scene.readouts || []).map(item => ({
    label: item.label,
    value: resolveValue(item, state, d),
    unit: item.unit || '',
    tone: item.tone || 'default'
  }));
}
```

Render via `SimLabUI.updateReadouts(lab, items)` or engine-owned DOM update.
Keep `formatReadout()` as debug/fallback only; visible UI should use structured cards.

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-professional-lab.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-lab-ui.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\*-scenes.js` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\*-scenes.js` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\*-scenes.js` |

## Implementation Steps

1. Add `readoutItemsFor(scene, state, d, handles)` in engine.
2. Prefer `behavior.formatReadoutItems` if route behavior provides one.
3. Fallback to `scene.readouts`.
4. Include a named mechanics point card only if route metadata explicitly labels it as a concept, not as a generic drag handle.
5. Add `renderReadoutCards(lab, items)` using DOM nodes and `textContent`.
6. In `draw()`, call card renderer after route render and state update.
7. Keep `lab.info.textContent` fallback only if tests/tools need plain text, but prefer visible cards.
8. Update tests to assert card labels/values change after retained hidden/object-bound interaction and controls.

## Todo List

- [ ] Add structured readout item formatter.
- [ ] Add card DOM renderer.
- [ ] Preserve existing derived/readout values.
- [ ] Update interaction/readout assertions.
- [ ] Check all 58 routes have at least 2 useful visible readouts.
- [ ] Remove visible generic handle coordinate text from readouts.

## Validation & Tests

```powershell
node --check js\sim-professional-lab.js
node --check js\sim-lab-ui.js
npm run test:sim:unit
npx playwright test tests\simulation-browser.spec.js --grep "@direct-drag"
npx playwright test tests\simulation-browser.spec.js --grep "@route-mount"
```

New/updated tests:
- For all routes, `.sim-readout-card` count >= 2.
- First retained interaction/control case changes at least one `.sim-readout-value`.
- No readout contains `undefined`, `[object Object]`, or stale generic `(190; 255)` unless route intentionally uses that value.
- No visible readout label contains `điểm kéo`, generic `điểm điều khiển`, `handle`, or `cursor`.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Some routes have weak `scene.readouts` | Add route-specific fallback cards from derived state only when needed. |
| Card renderer causes layout shift | Stable grid CSS, min/max widths, no viewport-scaled font. |
| Animation causes too many DOM writes | Only update text values, reuse nodes when possible if needed. |

## Security Considerations

- All dynamic values use `textContent`.
- No route metadata HTML injection.

## Next Steps

Phase 05 aligns controls/actions/hints with the simple UX.

## Unresolved Questions

None.
