# QA Summary — 58 Simulation Routes

## Verification 2026-05-08

| Gate | Result | Notes |
|---|---|---|
| `npm run test:sim:unit` | PASS | `node --check` scanned 70 JS files; Phase 01 physics helper assertions and runtime regressions pass |
| `python tools/smoke_simulation_routes.py` | PASS | `SIM_MAP routes: 58`; P1 covered 58/58 |
| `python tools/smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2` | PASS | 58 objectives and direct interactions |
| `python tools/audit_simulation_quality.py --all --max-js-lines 220 --require-assessment` | PASS | Route files within 220-line gate; assessment links present |
| `python tools/smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors,SimAnimationEngine,SimPhysicsStatics,SimPhysicsKinematics,SimPhysicsDynamics,SimVisualHelpers --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --malformed-assessment-storage` | PASS | Runtime globals, mount rollback, listener cleanup, malformed storage guard |
| `npm run test:sim:renderer-contract` | PASS | 58 renderer registrations, 58 behavior registrations, unique ids, browser structural contract pass |
| `npx playwright test tests/simulation-browser.spec.js --grep @direct-drag` | PASS | 66 direct-drag tests pass |
| `npm run test:sim:release` | PASS | Full release gate pass; browser suite 268 passed, 1 skipped |

## Route Coverage

| Chapter | Runtime routes | Coverage |
|---|---:|---|
| Ch1 — Tĩnh học | 25 | Scene/renderer/behavior modules present |
| Ch2 — Động học | 15 | Scene/renderer/behavior modules present |
| Ch3 — Động lực học | 18 | Scene/renderer/behavior modules present |
| Total | 58 | `SIM_MAP` route count pass |

## Notes

- `test:sim:unit` now discovers current JS files recursively instead of hardcoding stale split-file paths.
- `tests/simulation-physics.test.js` now validates exported Phase 01 physics namespaces directly.
- Browser suite was rerun through `npm run test:sim:release`: 268 passed, 1 skipped.
- Runtime regression coverage now includes actual primitive arrow drawing, animation `onTick` wiring, renderer contract source order, browser animation progression, and keyboard nudge primary-handle focus.
- Dedicated low-end tablet FPS benchmark and 5-minute memory soak were outside this sync-back scope.

## Unresolved Questions

- None for current QA sync-back.
