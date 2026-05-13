# Phase 02 - TDD Compact Readout Layout Gates

## Context Links

- [Plan](./plan.md)
- [Baseline Density Audit](./phase-01-baseline-density-audit.md)
- `tests/simulation-browser.spec.js`
- `tests/simulation-visual-quality.spec.js`

## Overview

Priority: P2. Status: Complete. Added tests that define compact readout behavior before CSS changes.

## Key Insights

- Existing tests check readout existence and right-inspector placement.
- Need explicit density and overflow checks.
- Tests must not assume exact pixel-perfect values across browsers; use ranges/relationships.

## Requirements

- Test short readout card has label/value baseline aligned in one row on desktop.
- Test card height reduced target after implementation.
- Test no horizontal overflow for lab/grid/cards.
- Test mobile remains stacked and readable.

## Architecture

Extend existing Playwright spec. Prefer helper functions local to `simulation-browser.spec.js` unless reusable.

## Related Code Files

| Action | File |
|---|---|
| Modify | `tests/simulation-browser.spec.js` |
| Optional modify | `tests/simulation-test-utils.js` |
| Read | `tests/simulation-visual-quality.spec.js` |

## Implementation Steps

1. Add `compact readout` test group in `tests/simulation-browser.spec.js`.
2. Open representative route, likely `ch1-1-3`.
3. Compute label/value rects for first short card.
4. Assert vertical center/baseline proximity within tolerance.
5. Assert card height below agreed target, e.g. `< 58px`, after CSS phase.
6. Assert no overflow for `.sim-readout-grid` and `.sim-lab`.
7. Add mobile viewport assertion: no page overflow; card text still visible.
8. Run targeted test and confirm it fails against current CSS.

## Todo List

- [x] Add desktop one-row layout assertion.
- [x] Add card density assertion.
- [x] Add overflow assertion.
- [x] Add mobile fallback assertion.
- [x] Confirm failing-first evidence.

## Success Criteria

- Targeted test fails on current 2-line CSS.
- Failure message points to density/layout, not unrelated route issue.
- Tests use existing route helpers where possible.

## Risk Assessment

- Risk: font rendering causes flaky exact pixel tests.
- Mitigation: use relative checks, tolerances, and representative short labels.

## Security Considerations

- None.

## Tests

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "compact readout"
```

## Next Steps

- Phase 03 implements CSS until targeted tests pass.

## Unresolved Questions

- None.
