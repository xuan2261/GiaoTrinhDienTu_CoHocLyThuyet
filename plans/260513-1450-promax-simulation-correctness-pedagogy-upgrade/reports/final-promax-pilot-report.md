# Final Promax Pilot Report

Date: 2026-05-13

## Shipped

- Added 6-route invariant manifest: `ch1-2-3`, `ch1-5-3`, `ch2-1-2`, `ch2-5-2`, `ch3-3-1`, `ch3-6-2`.
- Added pure invariant evaluators for vector resultant, friction cone, derivative chain, instant center velocity, spring energy drift, collision momentum/restitution.
- Added shared Promax shell slots: diagnostics toggles, invariant status, formula summary, observe/action/check mode, live challenge feedback.
- Added challenge specs for 6 pilot routes, no persistence.
- Added formula summary and route-owned mini graph summaries for `ch2-1-2`, `ch3-3-1`, and `ch3-6-2`.
- Added pilot renderer diagnostics for Ch2 graph/IC and Ch3 energy/collision residual views.
- Hardened invariant evaluators so missing required observables fail instead of passing from generated fallback values.
- Updated `ch3-6-2` collision invariant to use 2D momentum/restitution when route state uses `ball1`/`ball2`.
- Wired Promax scripts into `index.html` before `SimProfessionalLab`.
- Added Node and Playwright tests; wired Promax unit tests into `npm run test:sim:unit`, Promax shell tests into `npm run test:sim:browser`.
- Created baseline and rollout reports.

## Evidence

| Gate | Result |
|---|---|
| `node tests\simulation-invariants.test.js` | PASS |
| `node tests\promax-challenge-mode.test.js` | PASS |
| `node tests\promax-formula-graph.test.js` | PASS |
| `npx playwright test tests/promax-pilot-shell.spec.js` | PASS, 9 tests |
| `npm run test:sim:unit` | PASS |
| `npm run test:sim:quality` | PASS |
| `python tools\smoke_simulation_runtime.py --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup` | PASS |
| `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct` | PASS |
| `python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58` | PASS |
| `npm run test:sim:browser` | PASS, 173 tests |
| `npm run test:sim:visual-quality` | PASS, 4 tests |
| `npm run test:sim:release` | PASS |

## Honest Scope

Pilot implementation is complete for the 6 planned routes. Scope remains pilot-only: the remaining 52 routes are classified in the rollout matrix but not upgraded to Promax contracts.

## Remaining Work

- Decide next rollout plan for remaining 52 routes.

## Unresolved Questions

- Có muốn challenge progress persistence later? Current answer: no.
