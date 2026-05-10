# Professional Simulation Phase 02 Architecture Split

Date: 2026-05-06

## Summary

Hoàn tất Phase 02 cho professional interactive simulation labs. Runtime simulation vẫn là static script tags và vẫn giữ `file://`, nhưng route ownership đã chuyển sang registry + chapter route modules.

## Changes

- Added shared kernels/scaffolds: `sim-vector-math`, `sim-rendering`, `sim-interactions`, `sim-lab-ui`, `sim-assessment`, `sim-route-manifest`.
- Added `SimRegistry` in `sim-core.js` and rebuilt `simulations.js` as `window.SIM_MAP` compatibility adapter.
- Registered 58 routes through `js/sims/ch1`, `js/sims/ch2`, `js/sims/ch3`.
- Added runtime tests for executable route count, index script-order execution, discovered route modules, and failed mount DOM rollback.
- Updated browser route-mount discovery to recursively scan `js/sims/`.
- Preserved legacy cleanup compatibility for simulation implementations returning a cleanup function.

## Verification

- `python tools\test_simulation_architecture.py`: 4 passed.
- `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI --expect-runtime-routes 58 --check-mount-rollback`: pass.
- `npm run test:sim:unit`: pass.
- `npm run test:sim:quality`: pass.
- `npm run test:sim:browser:route-mount`: 58 passed.

## Notes

Legacy implementation files remain large on purpose to avoid visual/behavior drift before Phase 03-11 upgrades. Future split should follow route/topic contracts after lab shell stabilizes.

Unresolved questions: none.
