---
title: "Phase 02 - Overlay Contract And Failing Tests"
status: completed
priority: P1
effort: 6h
---

# Phase 02 - Overlay Contract And Failing Tests

## Context Links

- [Validation Report](./reports/validation-report.md)
- `tests/simulation-browser.spec.js`
- `tests/simulation-visual-quality.spec.js`
- `tests/simulation-test-utils.js`

## Overview

Add failing-first tests that define the new canvas contract before implementation.

## Key Insights

- Tests must inspect DOM, not screenshots only.
- Need route-wide gate, not sample-only gate.

## Requirements

- Add test for 58/58 routes: no `.sim-overlay-formula` in learner UI.
- Add test forbidding equation/value-like text inside `.sim-lab-overlay`.
- Keep allowed short label exceptions explicit.
- Ensure the new test fails on current baseline.

## Architecture

Prefer adding to `tests/simulation-browser.spec.js` near existing route-wide browser gates, unless file size/organization suggests a focused `tests/simulation-overlay-contract.spec.js`. Reuse `openRoute`, `ALL_ROUTES`.

## Related Code Files

Modify:
- `tests/simulation-browser.spec.js` or new focused overlay spec
- `tests/simulation-test-utils.js` only if helper reuse is needed

Create:
- `tests/simulation-overlay-contract.spec.js` if keeping browser spec small is cleaner

Delete: none.

## Implementation Steps

1. Define helper to collect overlay nodes and normalized text.
2. Add assertion `.sim-overlay-formula` count is zero.
3. Add forbidden pattern list for overlay panel/label text: `\\`, `=`, `∑`, `vec`, `toFixed` outputs, physical units with numbers.
4. Add allowlist for labels like `A`, `B`, `O`, `IC`, `F1`, `F2`, `v`, `a`, `α`.
5. Run test and record failing evidence.

## Todo List

- [x] Add route-wide overlay contract test.
- [x] Add short-label allowlist.
- [x] Run failing-first command.
- [x] Save failure summary to phase notes/report.

## Success Criteria

- Test fails before implementation on existing overlay routes.
- Failure messages identify route and offending text.
- No false dependency on screen size/theme.

## Verify And Tests

```powershell
npx playwright test tests\simulation-browser.spec.js --grep "overlay contract"
```

Expected before Phase 03: fail.

## Risk Assessment

- Risk: regex too strict blocks legitimate labels. Mitigation: start with formula nodes zero as hard gate; tune panel/label gate with explicit allowlist.

## Security Considerations

No app security impact.

## Next Steps

Phase 03 implements shared guard until failing tests pass.
