# Phase 01 - Baseline Readout Audit Harness

## Context Links

- [Plan](./plan.md)
- [Scout Report](./reports/scout-report.md)
- `tests/simulation-test-utils.js`
- `tests/simulation-browser.spec.js`
- `js/sim-professional-lab.js`

## Overview

Priority: P0. Status: Complete. Capture a reproducible baseline of current readout cards for all 58 routes before implementation.

## Key Insights

- Current evidence came from ad hoc Playwright extraction.
- Need durable helper/test output for implementation and review.
- Baseline must distinguish duplicate alias bugs from valid equal values.

## Requirements

- Functional: Extract route id, title, readout label, key, value, kind for `58/58` routes.
- Functional: Detect duplicate alias patterns and generic/control noise count.
- Non-functional: Test-only/report-only; no runtime behavior change.

## Architecture

```text
Playwright route open
  -> labState()/DOM extraction
  -> route readout snapshot
  -> duplicate classifier
  -> report artifact under plan reports
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `tests/simulation-test-utils.js` if helper reuse needed |
| Modify | `tests/simulation-browser.spec.js` for tagged baseline/dedup tests |
| Create | `plans/260514-0617-simulation-readout-dedup-normalization/reports/readout-baseline-before.md` |
| Create | `plans/260514-0617-simulation-readout-dedup-normalization/reports/readout-baseline-before.json` |

## Implementation Steps

1. Add or reuse a helper to return full readout cards with `label`, `key`, `value`, `kind`.
2. Add a focused Playwright test tagged `@readout-dedup` that can enumerate all `ALL_ROUTES`.
3. Generate a JSON artifact manually during cook using the same extraction logic.
4. Classify:
   - duplicate aliases needing fix,
   - generic/control noise,
   - intentional equality allowlist.
5. Save markdown summary in `reports/readout-baseline-before.md`.

## Todo List

- [x] Create baseline extraction helper or inline test helper.
- [x] Capture all-route JSON.
- [x] Create markdown summary table.
- [x] Mark known valid equalities allowlist.

## Verify / Tests

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "readout dedup baseline"
npm run test:sim:browser:route-mount
```

Expected:

- 58 routes opened.
- Baseline report lists P0 duplicates.
- No runtime code touched.

## Success Criteria

- Baseline artifact exists and is referenced by later phases.
- Known duplicates match scout report.
- Intentional equalities are documented, not treated as bugs.

## Risk Assessment

- Risk: report generation becomes flaky. Mitigation: use same `openRoute()` helper and stable viewport.
- Risk: too much artifact noise. Mitigation: JSON full, markdown summary concise.

## Security Considerations

- No external network needed; `openRoute()` blocks non-local HTTP by default.
- No secrets or user data.

## Next Steps

- Phase 02 uses baseline to design policy and failing tests.
