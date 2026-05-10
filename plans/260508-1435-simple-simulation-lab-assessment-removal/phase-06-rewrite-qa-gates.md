# Phase 06 - Rewrite QA Gates

## Context Links

- [Test Strategy Research](./research/test-strategy-research.md)
- [Phase 02](./phase-02-remove-assessment-runtime-and-storage.md)
- [Phase 03](./phase-03-build-simple-lab-shell.md)

## Overview

Priority: P1  
Status: Done  Goal: update Python and Playwright QA so release gates enforce simple shell, clean interaction visuals, animation correctness, and no assessment.

## Key Insights

- Assessment-era gates are now wrong product behavior.
- Removing gates without replacement would reduce confidence.
- Tests should assert no checkpoint UI/storage, 58-route mount, hidden/object-bound interaction, readout cards, route identity.
- Existing visual tests depend on handle diagnostics and currently tolerate visible round handles. New gate must allow hidden diagnostics but fail visible generic handle drawing.
- "Animation tick changes hash" is necessary but not enough; gate also needs pause/resume/reset and finite physics/readout checks.

## Requirements

Functional:
- `test:sim:quality` no longer requires checkpoints/assessment.
- `test:sim:release` no longer passes malformed assessment storage flag.
- Browser tests no longer expect `.sim-checkpoint-panel`.
- Add tests for no assessment UI/storage.
- Manifest smoke validates 58 route metadata/objectives/direct interaction, not checkpoints.
- Add tests for no visible generic circular drag handles/hit circles/handle labels.
- Add tests that sliders/buttons/reset/play-pause update visible readout cards.
- Add representative physics assertions across Ch1/Ch2/Ch3.
- Add animation assertions for running, paused, resumed, and reset states.

Non-functional:
- Keep release gate strict.
- Keep fast baseline commands.
- Keep `file://` route-mount tests.
- Avoid pixel tests that fail on legitimate physical circles such as wheels, particles, or balls.

## Architecture

New QA contract:
- Metadata: route count, objectives, direct interaction.
- Runtime: globals, route map, mount rollback, listener cleanup.
- Browser: simple shell, readout cards, clean controls, hidden/object-bound interaction, animation, responsive, file.
- Static: no assessment runtime references.
- Static: no default visible `drawRouteHandles()` call path unless guarded by debug mode.
- Physics: helper unit tests plus representative browser readout/value consistency.

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\package.json` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-visual-quality.spec.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-physics.test.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\smoke_simulation_manifest.py` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\audit_simulation_quality.py` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\smoke_simulation_runtime.py` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\test_simulation_qa_tools.py` |

## Implementation Steps

1. Update `smoke_simulation_manifest.py`:
   - remove required checkpoint minimum as default release criterion
   - add optional `--forbid-checkpoints` if useful
   - keep route/objective/direct gates
2. Update `audit_simulation_quality.py`:
   - remove `--require-assessment`
   - add scan that fails if runtime files still contain assessment contracts
3. Update `smoke_simulation_runtime.py`:
   - remove malformed assessment storage option from release path
4. Update Playwright tests:
   - replace assessment tests with simple-shell/no-assessment tests
   - update `expectLabShell`
   - update route identity assertions away from route chip if removed
   - assert visible lab text excludes `điểm kéo`, generic `điểm điều khiển`, `handle`, and `cursor`
   - assert no visible generic handle marker is drawn by shell-level code
   - keep interaction diagnostics available for tests without making them visible
5. Update `package.json` commands.
6. Extend physics/unit checks for representative readout formulas.
7. Add animation control tests:
   - running route changes over time
   - pause freezes canvas/readout state
   - resume changes again
   - reset returns representative state to initial readout/canvas signature
8. Update QA tool regression tests.

## Todo List

- [ ] Update Python manifest smoke.
- [ ] Update Python quality audit.
- [ ] Update Python runtime smoke.
- [ ] Update Playwright browser tests.
- [ ] Add clean-interaction visual tests.
- [ ] Add animation pause/resume/reset tests.
- [ ] Add representative physics/readout consistency tests.
- [ ] Update package scripts.
- [ ] Update QA tool tests.
- [ ] Run full release gate.

## Validation & Tests

```powershell
python tools\test_simulation_qa_tools.py
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct
python tools\audit_simulation_quality.py --all --max-js-lines 220
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:semantic
npm run test:sim:visual-quality
npm run test:sim:browser:route-mount
npm run test:sim:browser
```

Static no-assessment gate:

```powershell
rg -n "SimAssessment|chlyt_sim_assessment_v2|sim-checkpoint|Điểm kiểm tra|require-assessment|malformed-assessment-storage" index.html js css tests tools package.json
```

Static no-visible-generic-handle gate:

```powershell
rg -n "render\\.drawHandle\\(|điểm kéo|điểm điều khiển|legacy-primary|legacy-vector" js tests
```

Expected:
- `drawRouteHandles()` may exist only if it no longer calls `render.drawHandle()` by default.
- Tests may read hidden interaction diagnostics; they must not assert visible generic handle text/markers.
- Only historical docs/plans may mention old terms after docs phase.
- Runtime/test/package active paths must be clean.
- Browser visual gate distinguishes legitimate physical circles from generic handle markers.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Lowering QA accidentally | Replace each removed assessment assertion with simple-shell assertion. |
| Tool parser assumes checkpoints | Update parser tests before changing release scripts. |
| Full browser suite slow | Use focused grep while developing, full suite before phase done. |
| False positive on physical circles | Use static handle-call gates and DOM/text assertions, not raw arc-count only. |
| Animation looks active but physics is wrong | Pair animation hash checks with representative formula/readout assertions. |

## Security Considerations

- Static gate proves no assessment storage writes.
- No new network/dependency introduced.

## Next Steps

Phase 07 syncs docs and release handoff.

## Unresolved Questions

None.
