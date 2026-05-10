# Phase 11 Full QA Release Gate And Handoff

## Context Links

- [Plan](./plan.md)
- [Phase 10](./phase-10-assessment-manifest-and-documentation-sync.md)
- [README QA Simulation](../../README.md)

## Overview

Priority: P1. Status: Completed.

Run full verification after all 58 route scenes, assessments, and docs are updated. This phase produces final QA evidence and handoff notes.

## Requirements

- Full simulation identity gate passes.
- Existing release gates pass.
- Browser route-mount, direct drag, assessment, responsive, file/server smoke pass.
- No external network dependency.
- No generated content edited manually.

## Architecture

No new architecture. This phase validates:

```text
route map -> SIM_MAP -> SimSceneRegistry -> scene renderer -> assessment -> docs
```

## Related Code Files

| Action | Path | Notes |
|---|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\package.json` | Final scripts only if missing. |
| Create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\20260507-0846-route-specific-simulation-lab-repair\reports\final-qa-report.md` | Store command evidence. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\20260507-0846-route-specific-simulation-lab-repair\plan.md` | Mark completion after evidence only. |

## Implementation Steps

1. Run syntax checks.
2. Run scene catalog strict gate.
3. Run Python simulation gates.
4. Run unit simulation tests.
5. Run full Playwright simulation suite.
6. Run release gate.
7. Run content audit if simulation changes did not touch generated docs; still confirm no site regression.
8. Write final QA report with command, exit code, key output.
9. Update plan phase statuses only after evidence.

## Todo List

- [x] Run full syntax/unit gates.
- [x] Run strict scene identity.
- [x] Run full browser simulation suite.
- [x] Run full release gate.
- [x] Write final QA report.
- [x] Update plan status and docs final notes.

## Success Criteria

- `58/58` scene catalog entries unique.
- `58/58` browser scene identities unique.
- No fallback route remains.
- Full release command exits 0.

## Phase Tests

```powershell
node --check js\app.js
node --check js\loader.js
node --check js\sim-core.js
node --check js\sim-vector-math.js
node --check js\sim-rendering.js
node --check js\sim-interactions.js
node --check js\sim-lab-ui.js
node --check js\sim-professional-lab.js
node --check js\sim-scene-registry.js
node --check js\sim-scene-templates.js
node --check js\sims\ch1\ch1-force-law-scenes.js
node --check js\sims\ch1\ch1-support-spatial-scenes.js
node --check js\sims\ch1\ch1-friction-centroid-solver-scenes.js
node --check js\sims\ch2\ch2-particle-rotation-transmission-scenes.js
node --check js\sims\ch2\ch2-relative-plane-motion-scenes.js
node --check js\sims\ch3\ch3-fundamentals-differential-scenes.js
node --check js\sims\ch3\ch3-theorem-collision-solver-scenes.js
python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2
python tools\audit_simulation_quality.py --all --max-js-lines 220 --require-assessment
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimSceneRegistry,SimSceneTemplates --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --malformed-assessment-storage
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:browser
npm run test:sim:release
```

## Risk Assessment

- Risk: full browser suite slow or browser not installed. Mitigation: run `npm run test:sim:browser:install` if Playwright browser missing.
- Risk: release gate fails in unrelated content audit. Mitigation: report exact unrelated failure; do not claim release pass.

## Security Considerations

Verify no `.env`, credentials, or generated private artifacts included. Browser tests must block external network where intended.

## Next Steps

Completed.

Unresolved questions: none.
