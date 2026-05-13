# Phase 04 - Inspector Density And Control Ergonomics

## Context Links

- [Plan](./plan.md)
- [UI UX Research](./research/ui-ux-right-inspector-research.md)
- [Shared Shell Grid Layout](./phase-03-shared-shell-grid-layout.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Completed |
| Estimate | 3h |
| Goal | Make right inspector scannable and usable without clutter |

## Key Insights

- Inspector is not a dashboard; it is contextual lab instrumentation.
- Readouts should appear before controls for fast state scanning.
- Controls still need 44px touch/click target.

## Requirements

Functional:
- Readout cards one-column or compact two-column only if width supports it.
- Slider label/value readable; tabular numeric values preserved.
- Formula and hint remain visible, not clipped.
- Reset/play buttons remain reachable.

Non-functional:
- No nested UI cards inside cards.
- Keep existing color tokens and chapter accents.
- Light/dark contrast remains acceptable.

## Architecture

Inspector visual hierarchy:

```text
Readouts
Controls
Formula/context
Hint/objective
Promax slots if present
```

## Related Code Files

Modify:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css`

Modify if needed:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-visual-quality.spec.js`

Create:
- None.

Delete:
- None.

## Implementation Steps

1. Tune side panel spacing: `gap` around `8-12px`.
2. Set `.sim-readout-grid` side-panel columns to `1fr` by default.
3. Keep `.sim-readout-card` min height stable, no layout shift on value changes.
4. Make `.sim-controls` vertical or dense wrapped row depending control count.
5. Ensure sliders keep visible label/value and thumb size.
6. Ensure button groups wrap without shrinking below usable size.
7. Check formula/hint text wraps, no overflow.
8. Verify dark and light themes.

## Todo List

- [x] Tune inspector spacing.
- [x] Tune readout density.
- [x] Tune controls layout.
- [x] Tune formula/hint wrapping.
- [x] Verify light/dark.

## Tests / Verify Gate

Commands:

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "right inspector"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@readability"
npm run test:sim:visual-quality
```

Manual checks:
- Long labels wrap without overlapping.
- Slider value text does not push controls out of panel.
- Buttons remain `>=44px` high.

## Success Criteria

- Inspector feels compact, readable, stable.
- No text overlap in controls/readouts/formula/hint.
- Theme readability gate passes.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Panel becomes too dense | Keep readable line-height and clear sections |
| Controls consume whole panel | Preserve natural vertical flow; do not hide controls |
| Color-only meaning | Existing readout `kind` color remains supplementary, label text still visible |

## Security Considerations

- No security-sensitive changes.

## Next Steps

- Lock responsive and accessibility behavior in Phase 05.

## Unresolved Questions

- None.
