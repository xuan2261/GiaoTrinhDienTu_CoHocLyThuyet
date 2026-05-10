# Phase 01 Baseline And Failing Scene Identity Gates

## Context Links

- [Plan](./plan.md)
- [Debug Root Cause Summary](./reports/debug-root-cause-summary.md)
- [Test Strategy](./research/test-strategy-scene-identity-research.md)
- [Code Standards](../../docs/code-standards.md)

## Overview

Priority: P1. Status: Completed.

Create tests that prove the current bug. This phase does not fix scenes. It adds reproducible gates so later phases cannot regress into chapter-level generic scenes.

## Key Insights

- Current route/mount tests pass while scenes duplicate.
- New tests must fail or report duplicates on current code.
- Phase completion uses `--expect-duplicates` or report-only mode so repo remains testable.

## Requirements

- Add static scene catalog smoke with strict and report modes.
- Add browser scene identity checks with route filter.
- Add npm scripts for strict full gate and filtered phase gates.
- Capture baseline duplicate groups in a report.

## Architecture

Add QA around current architecture first:

```text
SIM_MAP routes -> scene catalog audit -> browser initial scene identity probe
```

No runtime scene changes in this phase.

## Related Code Files

| Action | Path | Notes |
|---|---|---|
| Create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\smoke_simulation_scene_catalog.py` | Static catalog/identity gate; starts with current duplicate report support. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` | Add `@scene-identity` tests and helper. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\package.json` | Add `test:sim:scene-identity` and filtered docs command if needed. |
| Create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\20260507-0846-route-specific-simulation-lab-repair\reports\phase-01-baseline-scene-identity-report.md` | Store duplicate evidence. |

## Implementation Steps

1. Add `tools/smoke_simulation_scene_catalog.py`.
2. Support modes:
   - `--report-current` prints duplicate canvas/control signatures.
   - `--expect-duplicates` exits 0 only if current duplicate bug is present.
   - `--strict` exits non-zero on duplicates.
   - `--routes` filters route groups for later phases.
3. Add Playwright helper to collect route identity:
   - route chip
   - title
   - formula text
   - controls labels/buttons
   - readout keys/text
   - initial canvas hash compared within same run
4. Add `@scene-identity` tests.
5. Add npm script:
   - `test:sim:scene-identity`
6. Run baseline and save output to phase report.

## Todo List

- [x] Add static catalog/identity smoke.
- [x] Add browser scene identity tests.
- [x] Add npm script.
- [x] Run baseline duplicate report.
- [x] Confirm existing simulation gates still pass.

## Success Criteria

- New gate identifies Ch1, Ch2, Ch3 duplicate groups from current code.
- Existing gates still pass.
- Phase report records exact duplicate counts.

## Phase Tests

```powershell
python tools\smoke_simulation_scene_catalog.py --report-current --expect-duplicates
npm run test:sim:unit
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --malformed-assessment-storage
npm run test:sim:browser:route-mount
```

Strict identity gate is expected to fail before Phase 3+ migrations:

```powershell
python tools\smoke_simulation_scene_catalog.py --strict
npm run test:sim:scene-identity
```

## Risk Assessment

- Risk: strict failing test blocks normal dev. Mitigation: provide report/expect mode until migration complete.
- Risk: browser hash is flaky. Mitigation: compare duplicates within same run, not fixed golden values.

## Security Considerations

No runtime data or network changes. Browser tests must keep external request blocking.

## Next Steps

Completed.

Unresolved questions: none.
