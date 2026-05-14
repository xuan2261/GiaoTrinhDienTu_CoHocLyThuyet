# Phase 07 - Docs Changelog And Release Verification

## Context Links

- `docs/design-guidelines.md`
- `docs/system-architecture.md`
- `docs/project-changelog.md`
- `docs/project-roadmap.md`
- [Validation Report](./reports/validation-report.md)

## Overview

Priority: P1. Status: Complete. Document readout policy, update changelog, and run final verification after implementation.

## Key Insights

- Docs already mention semantic readout cards and `appendGenericReadouts`.
- Need update to say controls are not auto-readouts unless explicitly declared.
- Changelog must not overclaim; report exact route groups fixed.

## Requirements

- Functional: Update docs to reflect readout policy.
- Functional: Update changelog with fixed duplicates and tests.
- Functional: Record command evidence in plan report.
- Non-functional: Concise docs; no generated content edits.

## Architecture

```text
implementation complete
  -> after snapshot
  -> targeted tests
  -> full simulation gates
  -> docs update
  -> changelog entry
  -> final verification report
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `docs/design-guidelines.md` |
| Modify | `docs/system-architecture.md` |
| Modify | `docs/project-changelog.md` |
| Possibly modify | `docs/project-roadmap.md` if milestone status changes |
| Create | `plans/260514-0617-simulation-readout-dedup-normalization/reports/final-verification-report.md` |

## Implementation Steps

1. Update design guideline readout rule:
   - readouts = outputs/status,
   - controls only explicit,
   - valid physics equalities allowed.
2. Update architecture runtime contract:
   - mention `readoutPolicy`,
   - `appendGenericReadouts` backward compatibility.
3. Add changelog entry:
   - affected route list,
   - tests added,
   - final gates.
4. Create final verification report with command outputs.
5. If final release gate too slow/fails for unrelated reason, document exact blocker.

## Todo List

- [x] Update design guidelines.
- [x] Update system architecture.
- [x] Update project changelog.
- [x] Create final verification report.
- [x] Run final gates.

## Verify / Tests

Minimum:

```powershell
npm run test:sim:unit
npx playwright test tests/simulation-browser.spec.js --grep "readout dedup"
npm run test:sim:browser
npm run test:sim:visual-quality
npm run test:sim:semantic
npm run test:sim:disposal
python tools\audit.py
```

Full release if engine policy touched broadly:

```powershell
npm run test:sim:release
```

## Success Criteria

- Docs reflect actual implemented policy.
- Changelog lists exact changes.
- Final report contains fresh verification evidence.
- No unresolved correctness questions remain.

## Risk Assessment

- Risk: full release gate slow. Mitigation: run targeted gates first; run release after fixes settle.
- Risk: docs mention behavior not implemented. Mitigation: update docs last from final code.

## Security Considerations

- No confidential info in reports.
- No `.env` or credentials touched.

## Next Steps

- Hand off to `/ck:cook` for implementation.
