# Route Unique Renderer Simulation Rebuild

Date: 2026-05-07

## Root Cause

Existing route-specific scene identity was metadata-heavy. 58 routes had unique scene ids/labels/formulas, but final canvas rendering still collapsed through 14 `scene.family` branches.

## Changes

- Added `SimRouteRenderers` and `SimRouteBehaviors`.
- Added 58 dedicated route renderer functions under `js/sims/ch*/`.
- Kept `SimProfessionalLab` as shared shell and physics/state compatibility layer.
- Added renderer contract smoke + browser runtime structural identity gate.
- Linked manifest/checkpoints to renderer/behavior ids at runtime.
- Added `test:sim:semantic` and included it in `test:sim:release`.
- Hardened post-review contract: browser renderer identity uses runtime structural draw marks without common frame metadata, static smoke enforces explicit unique `behaviorId`, and missing renderer fallback is diagnostic instead of family dispatch.

## Verification

- `npm run test:sim:semantic`: PASS.
- `npm run test:sim:release`: PASS.
- `python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58 --require-assessment-links`: PASS, 58 unique rendererId, 58 unique behaviorId, `Family dispatch: no`.
- `python tools\test_simulation_qa_tools.py`: PASS 11 tests, including regression coverage for direct/switch family dispatch and explicit blank `behaviorId`.
- Full browser suite: 262 passed, 1 renderer-contract test skipped in default suite because it runs separately.

## Rollback

Remove new renderer/behavior modules from `index.html` and restore the previous `package.json` release script only if intentionally rolling back strict pedagogy. `SimSceneTemplates` no longer provides family-level visual fallback; restore older template dispatch from version control if legacy route visuals are required.

## Unresolved Questions

None.
