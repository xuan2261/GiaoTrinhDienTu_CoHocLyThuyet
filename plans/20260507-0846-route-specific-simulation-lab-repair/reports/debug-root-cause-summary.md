# Debug Root Cause Summary

## Summary

The simulations route correctly. The issue is scene selection: current professional lab engine renders by chapter kind, not by route-specific simulation intent.

## Evidence

| Check | Result |
|---|---|
| `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct --require-checkpoints-min 2` | PASS |
| `python tools\audit_simulation_quality.py --all --max-js-lines 220 --require-assessment` | PASS |
| `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --malformed-assessment-storage` | PASS |
| `python tools\smoke_simulation_routes.py --require-p1` | PASS |
| `npm run test:sim:unit` | PASS |
| `npm run test:sim:browser:route-mount` | 59 passed |

## Canvas Identity Probe

| Chapter | Routes | Unique initial canvas hashes | Finding |
|---|---:|---:|---|
| Ch1 | 25 | 1 | All Ch1 route visuals identical at initial state. |
| Ch2 | 15 | 3 | `ch2-1-1` and `ch2-5-2` differ; 13 routes identical. |
| Ch3 | 18 | 1 | All Ch3 route visuals identical at initial state. |

## Root Cause

| File | Root issue |
|---|---|
| `js/sim-professional-lab.js` | `kind(routeId)` maps every route to only `statics`, `kinematics`, or `dynamics`. |
| `js/sim-professional-lab.js` | `draw()` calls only three renderer functions. |
| `js/sim-professional-lab.js` | `makeState()` has only a few route-specific values. |
| `tests/simulation-browser.spec.js` | Tests assert mount identity, not semantic scene uniqueness. |

## Correct Fix

Fix source, not symptom:

- preserve routing and registry
- add route-scene registry
- migrate all 58 routes to distinct scene definitions
- add static and browser scene identity tests
- keep existing shell, lifecycle, assessment, and offline constraints

Unresolved questions: none.
