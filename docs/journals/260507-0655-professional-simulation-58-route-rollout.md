# Professional Simulation 58-Route Rollout

Date: 2026-05-07

## Context

Executed `ck:cook --tdd --auto` for `plans/20260506-1828-professional-interactive-simulation-labs/plan.md`.

## Changes

- Added `js/sim-professional-lab.js` as shared professional lab engine.
- Converted `js/sim-statics.js`, `js/sim-kinematics.js`, and `js/sim-dynamics.js` into thin route-id adapters.
- Kept static script-tag runtime; `index.html` now loads `sim-professional-lab.js` after `sim-lab-ui.js`.
- Upgraded 58/58 simulation routes to `.sim-lab` shell with direct scene drag/readout and assessment panel state.
- Fixed review findings: `ch1-4-2` route identity now correct; initial checkpoint state no longer passes before interaction.
- Expanded browser QA to 258 tests: route identity, all-route shell, direct drag, assessment precondition, responsive, `file://`, and server smoke.
- Synced plan status, docs, roadmap, changelog, and final QA report.

## Verification

- `npm run test:sim:unit` PASS.
- `npm run test:sim:browser` PASS, 258/258.
- `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2` PASS.
- `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --malformed-assessment-storage` PASS.
- `python tools\audit_simulation_quality.py --all --max-js-lines 220 --require-assessment` PASS.
- `python tools\audit.py` PASS; `python tools\audit.py --strict-equations` PASS.
- Docs validation PASS.

## Notes

- Repo path is not a git repository, so commit/push handoff is unavailable from this workspace.
- Remaining release work: packaging policy for `backups/`, `Old/`, and local OCR/dev artifacts.

Unresolved questions: none.
