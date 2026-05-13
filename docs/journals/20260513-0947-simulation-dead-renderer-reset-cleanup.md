# Simulation Dead Renderer + Reset Cleanup

## Context
- Request fixed two low-severity simulation concerns: CH2 dead draft renderer code and CH3 generic reset state.
- Scope stayed in active static simulation runtime; no generated textbook content changed.

## Changes
- Removed `js/sims/ch2/ch2-particle-renderers.js` and its `index.html` script tag.
- Kept canonical CH2 particle renderers in `js/sims/ch2/ch2-trajectory-graph-renderers.js`.
- Changed CH3 theorem/collision behavior reset so `masses` is seeded only for `ch3-5-1`, and collision balls/flags only for `ch3-6-2`.
- Changed CH3 scene initial states so runtime reset, which restores `initialState`, also stays route-specific.
- Added regression coverage in `tests/phase-09-12-tdd.test.js` for dead renderer removal, behavior reset profiles, and scene initial state profiles.

## Verification
- `node tests\phase-09-12-tdd.test.js` PASS.
- `npm run test:sim:unit` PASS.
- `npm run test:sim:quality` PASS.
- `python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58` PASS.
- `python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58` PASS.
- `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup` PASS.

## Review
- Tester independently confirmed targeted gates stayed green with 58 runtime routes.
- Code review initially caught that runtime reset restores scene `initialState`, not direct `behavior.onReset`.
- Follow-up fixed scene `initialState`; reviewer rechecked and reported no remaining blockers.

## Unresolved Questions
- None.
