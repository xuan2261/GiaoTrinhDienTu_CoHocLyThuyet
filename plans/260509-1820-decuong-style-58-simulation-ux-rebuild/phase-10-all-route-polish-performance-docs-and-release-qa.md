# Phase 10 - All-Route Polish Performance Docs And Release QA

## Context Links

- [Phase 01](./phase-01-baseline-ux-audit-and-test-gates.md)
- [Phase 09](./phase-09-ch3-theorems-collision-and-exercises-routes.md)
- `README.md`
- `docs/code-standards.md`
- `docs/design-guidelines.md`
- `docs/system-architecture.md`
- `docs/project-roadmap.md`
- `docs/project-changelog.md`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | In Progress |
| Estimate | 12h |
| Goal | Polish all 58 routes, verify performance/responsive/offline behavior, update docs, and run release gate |

## Key Insights

- Route phases can pass individually while cross-route consistency still fails.
- Final work must be systematic: no skipped route visual audit.
- Docs must reflect actual runtime after implementation, not planned behavior.

## Requirements

### Functional

- 58/58 routes open through `file://` and static server.
- Dark/light route checks pass.
- Mobile/tablet/desktop layouts pass.
- Readout labels consistent in Vietnamese.
- No generic English UI text leaks.
- No route uses missing renderer diagnostic canvas.

### Non-Functional

- Full release gate passes.
- Performance acceptable on representative animated routes.
- Docs and changelog updated after final implementation.

## Architecture

```text
All route audit
  -> screenshot/visual metrics
  -> semantic drag checks
  -> theme checks
  -> route mount/lifecycle checks
  -> docs sync
  -> release QA
```

## Related Code Files

| Action | File |
|---|---|
| Modify if needed | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` |
| Modify if needed | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-visual-quality.spec.js` |
| Modify if needed | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\audit_simulation_quality.py` |
| Modify docs | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\README.md` |
| Modify docs | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\code-standards.md` |
| Modify docs | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\design-guidelines.md` |
| Modify docs | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\system-architecture.md` |
| Modify docs | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-roadmap.md` |
| Modify docs | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-changelog.md` |

## Implementation Steps

1. Run all route screenshots in dark and light theme.
2. Compare failures:
   - unreadable text
   - overlap
   - clipped objects
   - blank canvas
   - no-op drag
   - generic readout
3. Fix small route polish issues in owning route files.
4. Run performance sample:
   - `ch2-1-1`
   - `ch2-3-2`
   - `ch3-3-1`
   - `ch3-6-2`
5. Ensure no files violate line limits.
6. Run full release QA.
7. Update README/docs/changelog/roadmap.
8. Save final QA report under this plan `reports/`.

## Todo List

- [x] Run full release gate.
- [x] Save final QA report.
- [x] Save post-user debug review report.
- [x] Add all-58-route direct drag/readout stability audit.
- [ ] All-route dark/light screenshot audit.
- [ ] All-route responsive check.
- [ ] Fix residual route polish issues.
- [x] Update docs.
- [ ] Mark plan phases complete after implementation.

## Tests / Verify

Canonical final gate:

```powershell
npm run test:sim:release
```

Post-user debug gate:

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "@direct-drag-audit"
```

Expanded explicit gates:

```powershell
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:semantic
npm run test:sim:renderer-contract
npm run test:sim:visual-quality
npm run test:sim:browser
npm run test:sim:browser:route-mount
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct
python tools\audit_simulation_quality.py --all --max-js-lines 220
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup
python tools\audit.py
python tools\audit.py --strict-equations
python tools\audit.py --strict-images
```

Manual release smoke:

```powershell
python -m http.server 8000
# Desktop: http://localhost:8000/#ch1-2-3, #ch2-1-1, #ch3-6-2
# file:// open index.html and repeat route mount
# Toggle theme on each sample
```

## Success Criteria

- 58/58 route mount and visual-quality pass.
- Full release gate passes.
- Docs reflect actual simulation UX architecture.
- Final QA report records commands and results.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Full release exposes unrelated existing issue | Fix if caused by this plan; otherwise document and isolate |
| Strict image/equation gates slow handoff | Run after simulation gates; they protect publish readiness |
| Docs drift | Update docs only after final behavior stabilizes |

## Security Considerations

- Confirm no confidential files are added.
- No external network dependency for runtime.
- `file://` smoke protects offline use case.

## Next Steps

Continue visual route-by-route polish if higher visual fidelity is required beyond stable direct control.

## Unresolved Questions

Không có.
