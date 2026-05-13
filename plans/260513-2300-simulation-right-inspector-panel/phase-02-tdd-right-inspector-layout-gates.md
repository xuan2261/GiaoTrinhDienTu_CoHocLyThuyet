# Phase 02 - TDD Right Inspector Layout Gates

## Context Links

- [Plan](./plan.md)
- [Baseline Audit](./reports/baseline-layout-audit.md)
- [Red Team Review](./reports/red-team-review.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Completed |
| Estimate | 3h |
| Goal | Add tests that define right inspector behavior before CSS implementation |

## Key Insights

- Existing specs already cover mount/visibility; add positional/layout assertions.
- Prefer modifying existing specs over adding a new suite unless necessary.
- Tests must avoid brittle pixel-perfect checks.

## Requirements

Functional:
- Wide viewport: scene left, inspector items right.
- Inspector includes readouts, controls, formula, hint.
- Mobile viewport: inspector items stack below scene.
- No horizontal page scroll.

Non-functional:
- Tests must work with `file://` and static server patterns already used.
- Avoid screenshots as only assertion; use DOM rects.

## Architecture

Test helper logic:

```text
measure(scene)
measure(readout, controls, formula, hint)
wide: each inspector.left >= scene.right - tolerance
mobile: each inspector.top > scene.bottom - tolerance
overflow: scrollWidth <= innerWidth + tolerance
```

## Related Code Files

Modify:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-test-utils.js` if helper extraction is needed.

Create:
- None preferred.

Delete:
- None.

## Implementation Steps

1. Add helper to collect rects for `.sim-lab-scene`, `.sim-controls`, `.sim-readout-grid`, `.sim-formula-panel`, `.sim-lab-hint`.
2. Add wide layout test at `1366x768` and `1024x768`.
3. Assert inspector items are visually right of scene.
4. Add mobile fallback test at `390x844`.
5. Assert inspector items stack below scene on mobile.
6. Add overflow assertion at all tested breakpoints.
7. Run tests and confirm they fail before Phase 03 CSS, unless current layout unexpectedly already satisfies part of the assertions.

## Todo List

- [x] Add rect helper.
- [x] Add wide right-inspector assertions.
- [x] Add mobile stacked assertions.
- [x] Add overflow assertions.
- [x] Run targeted test and record expected failure.

## Tests / Verify Gate

Targeted command:

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "right inspector"
```

Expected result before implementation:
- Wide right-inspector assertion fails.
- Mount/visibility tests still pass.

## Success Criteria

- Tests clearly encode desired layout.
- Failure message identifies which element is not in right inspector.
- No unrelated test churn.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Pixel assertions flaky | Use relative rect ordering and tolerances |
| Tests too route-specific | Use representative route plus maybe one route per chapter |
| Existing helper too coupled | Add local helper in spec if smaller |

## Security Considerations

- No security-sensitive changes.

## Next Steps

- Implement CSS grid in Phase 03 until tests pass.

## Unresolved Questions

- None.
