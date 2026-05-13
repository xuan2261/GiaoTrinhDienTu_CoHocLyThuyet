# Phase 05 - Responsive Fallback And Accessibility

## Context Links

- [Plan](./plan.md)
- [Design Guidelines](../../docs/design-guidelines.md)
- [Red Team Review](./reports/red-team-review.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Completed |
| Estimate | 2h |
| Goal | Ensure tablet/mobile fallback and accessibility remain correct |

## Key Insights

- Side panel must be conditional, not forced.
- Existing mobile stack is already known-good.
- Visual placement may change, semantic hooks should not.

## Requirements

Functional:
- `<= 768px`: scene top, controls/readouts/formula/hint below.
- `<= 560px`: existing mobile full-width behavior remains.
- `<= 380px`: readout one-column behavior remains.
- Keyboard focus visible for buttons, sliders, canvas.

Non-functional:
- No disabled zoom.
- No horizontal scroll.
- Reduced-motion CSS remains respected.

## Architecture

Responsive matrix:

| Width | Expected Layout |
|---|---|
| `1366` | 2-column right inspector |
| `1024` | 2-column if no overflow; otherwise stacked by breakpoint |
| `768` | stacked |
| `560` | contained stack |
| `390` | mobile stack |

## Related Code Files

Modify:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js`

Create:
- None.

Delete:
- None.

## Implementation Steps

1. Review breakpoint cutoffs after Phase 03/04.
2. Adjust side panel activation threshold if `1024px` is cramped.
3. Preserve existing `@media (max-width: 560px)` mobile rules.
4. Add/keep overflow assertions for `768`, `560`, `390`.
5. Add focus checks for first slider/button if not covered.
6. Confirm `aria-describedby` still points to hint.
7. Confirm `.sim-lab-status` still `aria-live`.

## Todo List

- [x] Verify breakpoint stack behavior.
- [x] Verify no horizontal scroll.
- [x] Verify keyboard focus rings.
- [x] Verify aria hint/status links.
- [x] Verify reduced-motion rule remains.

## Tests / Verify Gate

Commands:

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "right inspector|keyboard|touch|reset"
npm run test:sim:browser
```

Assertions:
- No overflow at `768` and `390`.
- `.sim-lab-hint` remains the canvas described-by target.
- Buttons/sliders remain visible and operable.

## Success Criteria

- Wide enhancement does not degrade mobile.
- Accessibility hooks unchanged.
- Browser simulation suite passes.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| `1024px` side panel cramped | Raise breakpoint to `1100px` if needed |
| Focus order feels odd | Preserve DOM order and visible focus |
| Hint moved visually but aria still valid | Explicit test `aria-describedby` target |

## Security Considerations

- No security-sensitive changes.

## Next Steps

- Run all-route QA in Phase 06.

## Unresolved Questions

- None.
