# Phase 03 Scoped Simulation Width

## Context Links

- [Phase 02](./phase-02-tdd-layout-gates.md)
- [CSS style](../../css/style.css)
- [Loader simulation mount](../../js/loader.js)
- [Design guidelines](../../docs/design-guidelines.md)

## Overview

Priority: P1. Status: Complete. Widen only simulation presentation. Do not widen reading text.

## Key Insights

- `.content-area` should remain centered and narrow.
- CSS alone may be enough using scoped width and negative margin/transform-safe centering.
- Markup/class changes are acceptable only if CSS cannot reliably target simulation pages.

## Requirements

- Functional: simulation container wider on desktop/tablet.
- Non-functional: no horizontal page scroll; mobile remains contained.
- Compatibility: no change to route ids, canvas logical size, renderer/behavior contracts.

## Architecture

Preferred CSS-only pattern:

```css
.content-area > .sim-container.sim-lab {
  width: min(1120px, calc(100vw - var(--sw) - 3rem));
  max-width: none;
  margin-left: 50%;
  transform: translateX(-50%);
}

@media (max-width: 768px) {
  .content-area > .sim-container.sim-lab {
    width: 100%;
    max-width: 100%;
    margin-left: 0;
    transform: none;
  }
}
```

Actual implementation must account for sidebar closed state and mobile off-canvas. If CSS-only becomes brittle, add a narrow class during simulation mount, e.g. `content-area.has-simulation`, but avoid route-specific classes.

## Related Code Files

Modify:

- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\loader.js` only if adding/removing `has-simulation` class is necessary.

Create:

- None expected.

Delete:

- None.

## Implementation Steps

1. Start with CSS-only scoped rule under simulation section.
2. Use `--sw` and viewport calc to avoid sidebar overlap on desktop.
3. Keep `.sim-lab-scene` `max-width: 100%` and `aspect-ratio: 760 / 440`.
4. Ensure `.sim-controls`, `.sim-readout-grid`, `.sim-formula-panel`, `.sim-lab-hint` remain within widened panel.
5. Test with sidebar open and closed.
6. If CSS-only cannot handle route changes cleanly, add `has-simulation` class in `loader.js` when simulation mount exists, and remove it on non-simulation pages.

## Todo List

- [x] Add scoped simulation width CSS.
- [x] Verify desktop width target.
- [x] Verify tablet no page overflow.
- [x] Verify mobile resets to contained width.
- [x] Verify sidebar closed/open states.
- [x] Avoid changing `content-area` width globally.

## Tests

Run after change:

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "@responsive"
npm run test:sim:visual-quality
python tools\smoke_simulation_runtime.py --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
```

Manual checks:

- `ch1-2-3`, `ch2-5-2`, `ch3-6-2` at `1366`, `768`, `390`.
- Sidebar toggle open/closed on desktop.

## Success Criteria

- Desktop/tablet simulation panel wider than reading content where viewport permits.
- No page-level horizontal scroll.
- Canvas/readout/control visible and bounded.
- Existing all-route visual-quality test passes.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Negative margin/transform causes overflow | Use `width: min(...)`, test scrollWidth |
| Sidebar closed state leaves panel too narrow/wide | Include closed-state viewport check |
| Loader class leaks to non-sim pages | If used, clear class before each page render |

## Security Considerations

No security impact. Keep DOM class updates deterministic; no user input.

## Next Steps

After simulation width passes, refine topbar responsive in Phase 04.
