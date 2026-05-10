# Baseline Inventory

Date: 2026-05-08

## Commands

| Command | Result |
|---|---|
| `git status --short` | Not a git repository |
| `python tools\smoke_simulation_routes.py --require-p1` | PASS, `SIM_MAP routes: 58`, P1 covered `58/58` |
| `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2` | PASS, objectives `58/58`, direct interactions `58/58` |
| `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --malformed-assessment-storage` | PASS |
| `npm run test:sim:unit` | PASS, `node --check: 70 JS files PASS`, physics/runtime regressions PASS |
| `python tools\audit_simulation_quality.py --baseline` | PASS, `SIM_MAP routes: 58`, JS scanned `63` |
| `python tools\test_simulation_qa_tools.py` | PASS, 12 tests |
| `python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58 --require-assessment-links` | PASS, 58 renderer ids, 58 behavior ids |

## Assessment Inventory

Active runtime references:

| File | Current role |
|---|---|
| `index.html` | Loads `js/sim-assessment.js` before `js/sim-route-manifest.js` |
| `js/sim-assessment.js` | Owns `SimAssessment`, `chlyt_sim_assessment_v2`, checkpoint panel, progress writes |
| `js/sim-lab-ui.js` | Creates `.sim-checkpoint-panel` and calls `SimAssessment.createAssessmentPanel` |
| `js/sim-route-manifest.js` | Stores `checkpoints`, links `expectedRendererId`, registers manifest into `SimAssessment` |

Active QA/package references:

| File | Current role |
|---|---|
| `package.json` | `test:sim:quality`, `test:sim:quality:baseline`, `test:sim:release`, `test:sim:renderer-contract` require assessment/checkpoint gates |
| `tests/simulation-browser.spec.js` | Expects `.sim-checkpoint-panel`, assessment positive path, localStorage save |
| `tools/smoke_simulation_manifest.py` | Supports `--require-assessment` and `--require-checkpoints-min` |
| `tools/audit_simulation_quality.py` | Supports `--require-assessment` |
| `tools/smoke_simulation_renderer_contract.py` | Supports `--require-assessment-links` |
| `tools/smoke_simulation_runtime.py` | Loads/expects `sim-assessment.js`, has malformed assessment storage guard |
| `tools/test_simulation_qa_tools.py` | Tests checkpoint and assessment gates |

Docs with active-state wording:

`README.md`, `docs/code-standards.md`, `docs/system-architecture.md`, `docs/design-guidelines.md`, `docs/project-roadmap.md`, `docs/project-changelog.md`.

Historical docs/journals also mention assessment; keep only as history.

## Generic Handle Inventory

Active runtime path:

| File | Current role |
|---|---|
| `js/sim-professional-lab.js` | `formatReadout()` appends `điểm điều khiển` / `điểm kéo`; `legacyHandles()` creates `legacy-primary` / `legacy-vector`; `drawRouteHandles()` calls `render.drawHandle()` |
| `js/sim-rendering.js` | Defines visible `drawHandle()` circle/label helper |
| `js/sim-interaction-enhancements.js` | Defines separate enhanced `drawHandle()` helper |

Active QA/docs references:

| File | Current role |
|---|---|
| `tests/simulation-browser.spec.js` | Localization test expects `điểm điều khiển` |
| `tests/simulation-visual-quality.spec.js` | Checks `data-handle-ids`, rejects `legacy-primary` for Ch2/Ch3 |
| `docs/*` | Describe route-owned handles and old visible handle/readout behavior |

## Phase Ownership

| Phase | Main files |
|---|---|
| 02 | `index.html`, `js/sim-lab-ui.js`, `js/sim-route-manifest.js`, `js/sim-professional-lab.js`, remove/retire `js/sim-assessment.js` |
| 03 | `js/sim-lab-ui.js`, `css/style.css` |
| 04 | `js/sim-professional-lab.js`, `js/sim-lab-ui.js`, `css/style.css`, browser tests |
| 05 | `js/sim-professional-lab.js`, `js/sim-rendering.js`, `css/style.css`, browser/visual tests |
| 06 | `package.json`, `tests/*`, `tools/*` QA scripts |
| 07 | `README.md`, `docs/*`, plan status |

## Notes

- Workspace has no `.git`; no git diff/status safety net available.
- Baseline confirms current assessment-era contract is healthy before intentional removal.
- `js/sim-professional-lab.js` is already a large shared file and exempt in current audit; keep edits focused.

## Unresolved Questions

None.
