---
title: "Phase 07 - All Route QA And Visual Verification"
status: completed
priority: P1
effort: 4h
---

# Phase 07 - All Route QA And Visual Verification

## Context Links

- `package.json`
- `tests/simulation-browser.spec.js`
- `tests/simulation-visual-quality.spec.js`
- `tools/smoke_simulation_*.py`

## Overview

Run targeted and full simulation QA after overlay cleanup and migrations.

## Key Insights

- Removing canvas overlays can change screenshots/layout but should not blank canvas.
- Existing release gate is the canonical full check.

## Requirements

- Run targeted overlay tests first.
- Run route mount and visual-quality gates.
- Run full release gate unless blocked by environment.
- Capture command outputs in plan reports.

## Architecture

No architecture change. Verification only.

## Related Code Files

Modify: none expected unless tests reveal bugs.

Create:
- `plans/260514-1900-simulation-canvas-overlay-cleanup/reports/qa-evidence.md`

Delete: none.

## Implementation Steps

1. Run syntax/unit checks.
2. Run overlay contract tests.
3. Run browser route tests.
4. Run visual-quality tests.
5. Run semantic/renderer contract gates.
6. Run release gate.
7. Record pass/fail evidence and fix blockers before proceeding.

## Todo List

- [x] `npm run test:sim:unit`
- [x] Overlay contract test.
- [x] `npm run test:sim:browser`
- [x] `npm run test:sim:visual-quality`
- [x] `npm run test:sim:semantic`
- [x] `npm run test:sim:release`
- [x] QA evidence report.

## Success Criteria

- All required tests pass.
- No skipped failure ignored.
- If a command cannot run, reason is documented with next best evidence.

## Verify And Tests

```powershell
npm run test:sim:unit
npx playwright test tests\simulation-browser.spec.js --grep "overlay contract"
npm run test:sim:browser
npm run test:sim:visual-quality
npm run test:sim:semantic
npm run test:sim:release
```

## Risk Assessment

- Risk: full release gate slow or environment-dependent. Mitigation: run targeted gates first; document blocker if dependency missing.

## Security Considerations

Confirm no confidential files or env data included in reports.

## Next Steps

Phase 08 updates docs and final handoff.
