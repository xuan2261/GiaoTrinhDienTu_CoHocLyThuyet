# Phase 06 - Docs Changelog And Handoff

## Context Links

- [Plan](./plan.md)
- `docs/design-guidelines.md`
- `docs/project-changelog.md`
- `docs/codebase-summary.md`
- `docs/system-architecture.md`

## Overview

Priority: P2. Status: Complete. Synced docs and recorded QA evidence after compact readout implementation passed.

## Key Insights

- Design docs already mention right inspector and readout cards.
- This plan changes density/layout contract, not architecture.
- Changelog should record user-visible UI refinement and QA commands.

## Requirements

- Update docs only where actual behavior changed.
- Keep docs concise.
- Do not overstate architecture changes.

## Architecture

Docs-only phase. Likely updates:

- `docs/design-guidelines.md`: readout cards support compact name-value layout.
- `docs/project-changelog.md`: add changed entry with QA commands.
- Optional `docs/codebase-summary.md`: only if wording currently contradicts compact cards.

## Related Code Files

| Action | File |
|---|---|
| Modify | `docs/design-guidelines.md` |
| Modify | `docs/project-changelog.md` |
| Optional modify | `docs/codebase-summary.md` |
| Optional modify | `docs/system-architecture.md` |
| Create | `plans/260514-compact-simulation-readout-cards/reports/qa-results.md` |

## Implementation Steps

1. Read current docs sections mentioning readout cards/right inspector.
2. Update design guideline with compact card rule:
   - short label/value same row;
   - long text wraps;
   - no route-specific layout variants.
3. Add changelog entry with affected files and tests.
4. Save QA results report.
5. Provide cook handoff and rollback note.

## Todo List

- [x] Update design guideline.
- [x] Update changelog.
- [x] Save QA report.
- [x] Confirm no unresolved questions.

## Success Criteria

- Docs match implemented behavior.
- Changelog records user-visible density improvement.
- Handoff command remains valid.

## Risk Assessment

- Risk: docs churn beyond scope.
- Mitigation: only update readout/right-inspector paragraphs and changelog.

## Security Considerations

- None.

## Tests

Docs do not need extra tests beyond Phase 05. Re-run targeted test if docs edits happen alongside code in same commit:

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "compact readout|right inspector"
```

## Next Steps

- Use `/ck:cook` on this plan when ready to implement.

## Unresolved Questions

- None.
