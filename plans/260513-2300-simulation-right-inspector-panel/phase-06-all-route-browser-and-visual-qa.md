# Phase 06 - All Route Browser And Visual QA

## Context Links

- [Plan](./plan.md)
- [System Architecture](../../docs/system-architecture.md)
- [Code Standards](../../docs/code-standards.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Completed |
| Estimate | 3h |
| Goal | Verify right inspector across all 58 routes and release-level visual gates |

## Key Insights

- Layout change is shared, so one bad route with dense controls can expose issues.
- Existing visual-quality suite already checks bounded canvas, identity, readability, overflow.

## Requirements

Functional:
- 58 routes mount.
- Canvas stays nonblank and bounded.
- Route-owned handles remain visible.
- Readout/control values update after interaction.

Non-functional:
- No test skips to pass.
- No fake data/mocks to satisfy layout tests.
- Evidence summary saved in plan reports.

## Architecture

QA stack:

```text
node syntax/unit -> python quality/smoke -> Playwright browser -> Playwright visual-quality -> release gate
```

## Related Code Files

Modify if failures prove test gap:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-visual-quality.spec.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js`

Create:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260513-2300-simulation-right-inspector-panel\reports\qa-results.md`

Delete:
- None.

## Implementation Steps

1. Run JS syntax/unit gate.
2. Run simulation quality gate.
3. Run browser suite.
4. Run visual-quality suite.
5. Run route mount focused gate if full browser fails.
6. Fix only scoped layout/test issues.
7. Save command results summary to `reports/qa-results.md`.
8. If release gate is affordable, run full release and record result.

## Todo List

- [x] Run unit gate.
- [x] Run quality gate.
- [x] Run browser gate.
- [x] Run visual-quality gate.
- [x] Run focused route mount if needed.
- [x] Save QA report.

## Tests / Verify Gate

Commands:

```powershell
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:browser
npm run test:sim:visual-quality
npm run test:sim:browser:route-mount
```

Optional final:

```powershell
npm run test:sim:release
```

## Success Criteria

- Required gates pass.
- Any failure is fixed, not ignored.
- QA report lists command, status, key notes.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Full release slow | Required gates first; release optional unless implementation scope expands |
| Visual test exposes route-specific overflow | Fix shared CSS if possible; only route-specific fix if layout reveals real route bug |
| Existing unrelated failures | Document and isolate; do not mask |

## Security Considerations

- No secrets in reports.
- Do not commit generated sensitive artifacts.

## Next Steps

- Update docs/changelog and handoff in Phase 07.

## Unresolved Questions

- None.
