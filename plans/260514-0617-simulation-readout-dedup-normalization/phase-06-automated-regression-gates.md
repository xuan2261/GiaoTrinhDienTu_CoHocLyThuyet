# Phase 06 - Automated Regression Gates

## Context Links

- [Validation Report](./reports/validation-report.md)
- `tests/simulation-browser.spec.js`
- `tests/simulation-test-utils.js`
- `package.json`

## Overview

Priority: P0. Status: Complete. Lock readout dedup behavior with tests so future route edits cannot reintroduce duplicate alias cards.

## Key Insights

- Existing tests cover mount, layout, direct-drag, visual quality, but not semantic duplicate cards.
- Need targeted tests plus all-route audit.
- Naive same-value tests are unsafe because conservation/symmetry equalities are valid.

## Requirements

- Functional: Add targeted tests for known duplicate alias pairs.
- Functional: Add allowlist for intentional same-value cards.
- Functional: Verify no generic/control echo for routes normalized in phases 03-05.
- Non-functional: Tests must be stable under `file://`.

## Architecture

```text
readout snapshot
  -> normalize label aliases
  -> detect forbidden duplicate groups
  -> allow intentional equality pairs
  -> assert by route
```

Forbidden alias examples:

```text
ch1-2-3: |F₁|, |F1|
ch1-3-1: N, |N|
ch1-3-2: Lực căng, |T|
ch1-3-7: N dọc trục, |N| dọc trục
ch1-4-4: ΣF, |R| cân bằng
ch3-7-1: F, Lực F
```

Allowed equality examples:

```text
ch1-3-4: R_A, R_B
ch3-6-2: p trước, p sau
ch3-6-3: p trước, p sau
ch3-5-1: m1, m2
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `tests/simulation-browser.spec.js` |
| Possibly modify | `tests/simulation-test-utils.js` |
| No change expected | `package.json` unless adding a named script is justified |

## Implementation Steps

1. Add helper to get readout labels/keys/values from active lab.
2. Add focused tests:
   - `@readout-dedup forbidden duplicate aliases are absent`.
   - `@readout-dedup intentional equalities remain visible`.
   - `@readout-dedup ch2-1-3 separates normal acceleration and curvature radius`.
3. Keep grep-friendly test titles.
4. Run targeted tests first, then broader gates.
5. Save after-snapshot report.

## Todo List

- [x] Add forbidden alias tests.
- [x] Add intentional equality allowlist tests.
- [x] Add `ch2-1-3` formula/units test.
- [x] Generate `reports/readout-baseline-after.md`.

## Verify / Tests

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "readout dedup"
npm run test:sim:browser
npm run test:sim:visual-quality
npm run test:sim:semantic
```

Expected:

- Targeted tests pass after implementation.
- Browser and visual suites remain green.
- No unexpected route mount or identity regression.

## Success Criteria

- Regression tests fail for original duplicate cases.
- Regression tests pass on cleaned implementation.
- After-snapshot shows no P0 duplicate aliases.

## Risk Assessment

- Risk: tests become too string-fragile. Mitigation: match route-specific alias sets, not exact full card list unless necessary.
- Risk: locale labels change later. Mitigation: use route-specific forbidden pairs, update intentionally when copy changes.

## Security Considerations

- Test-only changes.
- No runtime risk.

## Next Steps

- Phase 07 updates docs and runs release verification.
