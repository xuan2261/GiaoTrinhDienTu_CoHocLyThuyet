# Phase 06 Docs And Changelog Sync

## Context Links

- [Design guidelines](../../docs/design-guidelines.md)
- [Project changelog](../../docs/project-changelog.md)
- [Current layout summary](../../layout_hientai.md)
- [Brainstorm report](../reports/brainstorm-260513-2146-layout-simulation-responsive.md)

## Overview

Priority: P2. Status: Complete. Document the final layout contract so future changes do not undo the reading/simulation separation.

## Key Insights

- Existing docs already define layout and simulation shell rules.
- This change should update docs only after implementation passes QA.
- Keep docs concise; avoid duplicating every CSS selector.

## Requirements

- Functional: docs describe current final layout truth.
- Non-functional: docs concise, consistent with repo docs.
- Traceability: changelog records impact and QA.

## Architecture

Docs to update:

- `docs/design-guidelines.md`: add simulation wide-layout rule and topbar responsive priorities.
- `docs/project-changelog.md`: add changed entry.
- `layout_hientai.md`: update only if user wants this as current snapshot after implementation.

## Related Code Files

Modify:

- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\design-guidelines.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-changelog.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\layout_hientai.md` optional after implementation.

Create:

- None.

Delete:

- None.

## Implementation Steps

1. Update `docs/design-guidelines.md`:
   - Reading content remains narrow.
   - Simulation may use wider scoped container.
   - Topbar responsive priority order.
2. Update `docs/project-changelog.md`:
   - Date `2026-05-13` or implementation date.
   - Changed: simulation responsive width and topbar compact behavior.
   - QA commands run.
3. Update `layout_hientai.md` if it is intended as living snapshot.
4. Avoid over-documenting implementation details that may change.

## Todo List

- [x] Update design guidelines.
- [x] Update changelog.
- [x] Decide whether to update `layout_hientai.md`.
- [x] Cross-check docs against actual CSS.

## Tests

Docs sanity:

```powershell
python tools\audit.py
```

Manual:

- Links resolve.
- Dates are correct.
- Docs do not claim unimplemented behavior.

## Success Criteria

- Docs match final behavior.
- Changelog mentions QA evidence.
- No stale statement says simulation must stay inside text max width.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Docs ahead of code | Update after code tests pass |
| Duplicated layout truth | Keep `design-guidelines.md` canonical; `layout_hientai.md` snapshot only |

## Security Considerations

No security impact.

## Next Steps

Run full verification/review in Phase 07.
