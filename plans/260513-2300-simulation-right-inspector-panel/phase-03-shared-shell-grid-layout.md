# Phase 03 - Shared Shell Grid Layout

## Context Links

- [Plan](./plan.md)
- [UI UX Research](./research/ui-ux-right-inspector-research.md)
- [TDD Gates](./phase-02-tdd-right-inspector-layout-gates.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Completed |
| Estimate | 4h |
| Goal | Implement CSS-first wide layout: canvas left, inspector right |

## Key Insights

- Current `1120px` simulation width fits `760px + 16px gap + ~320px inspector`.
- Direct-child CSS grid can avoid JS changes.
- Keep class names unchanged for tests and runtime.

## Requirements

Functional:
- On wide screens, `.sim-lab` becomes a scoped grid.
- `.sim-header` spans both columns.
- `.sim-lab-scene` sits left.
- `.sim-readout-grid`, `.sim-controls`, `.sim-formula-panel`, `.sim-lab-hint`, Promax slots sit right.
- `.sim-lab-toolbar` placement remains useful; prefer left under/near scene if legend exists.

Non-functional:
- No canvas logical size change.
- No route renderer/behavior edits.
- CSS scoped to `.sim-container.sim-lab` / `.sim-lab`.

## Architecture

Proposed CSS shape:

```css
@media (min-width: 1040px) {
  .sim-container.sim-lab {
    display: grid;
    grid-template-columns: minmax(0, 760px) minmax(300px, 1fr);
    grid-template-areas:
      "header header"
      "scene inspector";
    gap: 12px 16px;
    align-items: start;
  }
}
```

Implementation can either:
- assign all inspector elements to `grid-column: 2`, or
- add `.sim-lab-side-panel` wrapper only if CSS direct-child flow is not maintainable.

## Related Code Files

Modify:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css`

Modify only if CSS-only blocks:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-lab-ui.js`

Create:
- None.

Delete:
- None.

## Implementation Steps

1. Add wide breakpoint under existing simulation CSS section.
2. Apply grid to `.sim-container.sim-lab` at `min-width: 1040px`.
3. Assign `.sim-header` to full row.
4. Assign `.sim-lab-scene` to left column with `width: 100%` and existing aspect ratio.
5. Assign inspector elements to right column.
6. Ensure `.sim-readout-grid` becomes one-column compact in side panel.
7. Ensure `.sim-controls` vertical/compact flow works in side panel.
8. Run Phase 02 targeted tests.
9. If direct-child CSS is fragile, add minimal side panel wrapper in `sim-lab-ui.js` and move existing nodes without renaming classes.

## Todo List

- [x] Add wide grid CSS.
- [x] Place scene/header/inspector areas.
- [x] Compact readout grid in side panel.
- [x] Compact controls in side panel.
- [x] Preserve mobile existing layout.
- [x] Run targeted Playwright.

## Tests / Verify Gate

Commands:

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "right inspector"
npm run test:sim:unit
```

Assertions:
- Wide layout tests pass.
- Node syntax/unit stays clean if JS fallback used.
- Canvas visual size remains close to current wide baseline.

## Success Criteria

- Canvas left and inspector right on wide screens.
- Formula/hint are right-side inspector items.
- No class rename breaks tests.
- No route-specific code touched.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| CSS grid direct children place hidden `.sim-info` oddly | Explicitly keep `.sim-sr-readout` visually hidden |
| Readout cards too wide/narrow | Side panel one-column grid with min width |
| Controls wrap badly | Use vertical flow for `.sim-controls` in wide side panel |

## Security Considerations

- No security-sensitive changes.

## Next Steps

- Tune density and ergonomics in Phase 04.

## Unresolved Questions

- None.
