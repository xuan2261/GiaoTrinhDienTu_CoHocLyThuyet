# Phase 07 - Strict Visual Quality Gates

## Context Links

- [Research 02](./research/researcher-02-visual-qa-gates-report.md)
- [Red team review](./reports/red-team-review.md)

## Overview

Priority: P1. Status: Complete. Convert audit probes into release-grade gates so current issues cannot return.

## Key Insights

- Existing QA lets visual regressions pass.
- Quality gates must be numeric, deterministic, and not screenshot-only.
- Screenshot artifacts remain useful for debugging, but tests should fail on metrics.

## Requirements

- Strict gate for duplicate console warnings.
- Strict edge-ink gate for all 58 routes.
- Strict detached-handle gate for all routes with declared handles.
- Animation/interaction gate by chapter family.
- Integrate into release path.

## Architecture

`tests/simulation-visual-quality.spec.js` becomes canonical browser quality gate. `package.json` scripts expose:

- `test:sim:visual-quality`
- included in `test:sim:release`

Optionally static Python tool additions:

- `tools/audit_simulation_quality.py` checks duplicate source registrations.

## Related Code Files

Modify:
- `tests/simulation-visual-quality.spec.js`
- `tests/simulation-browser.spec.js` if common helpers need sharing
- `package.json`
- `tools/audit_simulation_quality.py`
- `tools/test_simulation_qa_tools.py`
- `docs/code-standards.md`

## Implementation Steps

1. Remove env guard from strict visual tests.
2. Define edge threshold:
   - default: max edge ink <= 12 per side;
   - allow documented route-specific exception only if mathematically necessary.
3. Add detached-handle assertion:
   - handle descriptor point must be within visual frame.
   - no default fallback handle on Ch2/Ch3 unless descriptor says fallback.
4. Add console warning assertion:
   - fail on registry overwritten warnings.
5. Add animation/interaction assertion:
   - Ch2/Ch3 dynamic routes show canvas delta or route-declared animated=false with explicit reason.
   - Ch1 static routes must show drag delta on representative handles.
6. Add script to `test:sim:release`.
7. Update QA tool tests.

## Todo List

- [x] Enable strict visual tests.
- [x] Add release script integration.
- [x] Add static duplicate-registration audit if practical.
- [x] Update test docs.
- [x] Run full browser suite.

## Verification & Tests

Run:

```powershell
npm run test:sim:visual-quality
npm run test:sim:browser
npm run test:sim:semantic
python tools\test_simulation_qa_tools.py
npm run test:sim:release
```

Expected:
- Visual quality is part of release.
- No known audit issue remains.
- Existing 268+ browser tests still pass or are intentionally updated with stronger assertions.
- Release gate passed: `npm run test:sim:release`.

## Success Criteria

- A future detached handle/cropped vector fails CI/local release QA.
- Reported user complaints become testable regressions.

## Risk Assessment

- Risk: tests become flaky due animation timing. Mitigation: wait for stable mount, sample multiple frames, compare threshold not exact hash.

## Security Considerations

- Test-only changes. No credentials. No network.

## Next Steps

Phase 08 syncs docs and runs final release validation.
