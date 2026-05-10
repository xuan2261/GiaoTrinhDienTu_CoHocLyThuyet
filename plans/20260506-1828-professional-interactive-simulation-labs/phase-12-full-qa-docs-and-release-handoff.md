# Phase 12 Full QA Docs And Release Handoff

## Context Links

- [Plan](./plan.md)
- [Deployment Guide](../../docs/deployment-guide.md)
- [Project Roadmap](../../docs/project-roadmap.md)
- [Project Changelog](../../docs/project-changelog.md)

## Overview

Priority: P1. Status: Completed. Full-system verification, documentation sync, release readiness, and handoff completed with fresh evidence.

## Key Insights

- Current audit warnings for legacy `<img>` are not simulation blockers.
- Final must prove `file://` and static server behavior.
- Docs must reflect new script architecture and dev QA dependency.

## Requirements

Functional:
- All 58 route labs use professional shell and manifest.
- All 58 route labs have direct interaction and assessment.
- Browser QA covers all routes for mount, lab shell, route identity, direct drag, and assessment precondition; responsive/touch checks cover representative routes.
- Docs updated.

Non-functional:
- Runtime remains offline-first.
- No generated files manually edited.
- No confidential files committed.

## Architecture

Final gates:
- Static syntax/compile.
- Python audit.
- Route manifest/quality audit.
- Unit formula tests.
- Playwright browser smoke/interaction tests.
- `file://` smoke and local server smoke.
- Documentation sync.

## Related Code Files

Modify:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\README.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\system-architecture.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\code-standards.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\design-guidelines.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-roadmap.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-changelog.md`

Create:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\20260506-1828-professional-interactive-simulation-labs\reports\final-qa-report.md`

## Implementation Steps

1. Run all syntax and Python compile gates.
2. Run audit and strict equation audit.
3. Run route/manifest/quality smoke.
4. Run unit formula tests.
5. Run browser route smoke for all 58 routes in `file://` mode.
6. Run direct interaction smoke for all 58 routes plus representative touch/responsive routes.
7. Open direct `file://` and local server modes.
8. Update docs and changelog.
9. Write final QA report with command outputs summarized.
10. Reconcile related math release plan status before release handoff if still `in-progress`.

## Todo List

- [x] Full automated gates.
- [x] Full browser QA.
- [x] Final docs sync.
- [x] Final QA report.
- [x] Release handoff note.

## Verify / Tests

```powershell
Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
python -m compileall -q tools
python tools\audit.py
python tools\audit.py --strict-equations
python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict --katex
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --malformed-assessment-storage
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2
python tools\audit_simulation_quality.py --all --max-js-lines 220 --require-assessment
npm run test:sim:unit
npm run test:sim:browser
npm run test:sim:release
```

## Success Criteria

- 58/58 routes pass route, manifest, lab shell, direct drag, and assessment precondition gates.
- Positive assessment save path passes for representative Ch1/Ch2/Ch3 routes.
- Browser smoke has 0 console/page errors.
- `file://` mode works.
- Docs match real architecture.
- Final QA report saved.

## Risk Assessment

Risk: full browser suite slow. Mitigation: split quick smoke and full release smoke; final requires full.

Risk: docs drift. Mitigation: docs sync in same final phase, after code behavior is final.

## Security Considerations

Check no `.env`, browser profiles, screenshots with private data, or `node_modules` are staged.

## Next Steps

Completed for simulation labs. Before final release package, reconcile the related math release plan if it is still marked `In Progress`. See [plan](./plan.md) and [final QA report](./reports/final-qa-report.md).
