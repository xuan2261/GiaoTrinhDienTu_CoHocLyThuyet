# Phase 07 - Docs Changelog And Release Handoff

## Context Links

- [Plan](./plan.md)
- [QA Results](./reports/qa-results.md)
- [Design Guidelines](../../docs/design-guidelines.md)
- [Project Changelog](../../docs/project-changelog.md)
- [System Architecture](../../docs/system-architecture.md)

## Overview

| Field | Value |
|---|---|
| Priority | P2 |
| Status | Completed |
| Estimate | 1h |
| Goal | Sync docs and provide clean implementation handoff |

## Key Insights

- Layout contract changes, so docs must mention right inspector behavior.
- Architecture contract does not change deeply unless JS wrapper fallback is used.
- Changelog should capture UX/layout improvement and QA gates.

## Requirements

Functional:
- Update design guidelines with right inspector rule.
- Update changelog with implementation summary and QA.
- Update system architecture only if DOM wrapper or runtime contract changes.
- Leave cook/release handoff clear.

Non-functional:
- Concise docs.
- No overstating route-specific changes.
- Keep dates concrete: `2026-05-13`.

## Architecture

Docs impact:

```text
CSS-only layout -> design-guidelines + changelog
JS wrapper fallback -> design-guidelines + system-architecture + changelog
```

## Related Code Files

Modify:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\design-guidelines.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-changelog.md`

Modify only if JS DOM structure changes:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\system-architecture.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\code-standards.md`

Create:
- None.

Delete:
- None.

## Implementation Steps

1. Read final diff and QA report.
2. Update `docs/design-guidelines.md`:
   - wide screens: viewport left, inspector right.
   - inspector contains readouts, controls, formula, hint.
   - mobile fallback stays stacked.
3. Update `docs/project-changelog.md` with date, changed files, QA gates.
4. Update architecture/code standards only if `sim-lab-ui.js` DOM contract changed.
5. Run lightweight docs grep/check for broken links if available.
6. Final status report.

## Todo List

- [x] Update design guidelines.
- [x] Update changelog.
- [x] Update architecture docs if needed.
- [x] Verify docs links.
- [x] Prepare final handoff.

## Tests / Verify Gate

Commands:

```powershell
python tools\audit.py
npm run test:sim:browser
npm run test:sim:visual-quality
```

Docs checks:
- Links to plan/report paths work.
- Changelog date is `2026-05-13`.
- No claim of route renderer/behavior changes unless they happened.

## Success Criteria

- Docs align with actual implementation.
- Changelog records QA evidence.
- Cook handoff is ready.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Docs claim more than implementation | Base docs on final diff only |
| Architecture omitted after JS wrapper | Conditional architecture update |

## Security Considerations

- Do not include secrets or local env values.

## Next Steps

- Implementation can start with `/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260513-2300-simulation-right-inspector-panel\plan.md`.

## Unresolved Questions

- None.
