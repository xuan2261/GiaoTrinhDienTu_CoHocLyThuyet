# Phase 07 Chapter 3 Dynamics Fundamentals And Differential Labs

## Context Links

- [Coverage Matrix](./research/simulation-coverage-matrix.md)
- [Phase 02](./phase-02-simulation-runtime-foundation.md)

## Overview

Priority: P1. Status: Complete. Add Ch3 I-IV labs: inertia/frame concepts, Newton laws, dynamic constraint release, differential equations, forward/inverse dynamics.

## Key Insights

- Ch3 needs real computation, but simple deterministic integrators enough.
- Differential equation lab should prioritize intuition, not numerical-method lecture.
- Existing D'Alembert route should be clarified if it currently sits under forward problem.

## Requirements

| Route Group | Required Interactions |
|---|---|
| `ch3-1-*` | body/system selector, force-motion, inertial frame |
| `ch3-2-*` | inertia, F=ma, Newton 3, superposition, dynamic FBD |
| `ch3-3-*` | numerical integrator, spring-mass/projectile/force-time graph |
| `ch3-4-*` | forward and inverse dynamics solvers |

## Architecture

Add Ch3 sims to `SimDynamics`. Use simple integrator helper in `SimCore`:

`state(t)` + `forceModel(state, t)` -> step -> path/graph.

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-dynamics.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-core.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\simulations.js` |

## Implementation Steps

1. Add mass/inertia concept lab for `ch3-1-1`.
2. Add force-motion lab for `ch3-1-2`.
3. Add inertial/non-inertial frame visual for `ch3-1-3`.
4. Add inertia law visual for `ch3-2-1`.
5. Extend Newton `F=ma` lab for `ch3-2-2`.
6. Extend Newton 3 lab for `ch3-2-3`.
7. Add independent force superposition lab for `ch3-2-4`.
8. Add dynamic constraint release/FBD for `ch3-2-5`.
9. Add differential equation integrator for `ch3-3-1`, `ch3-3-2`.
10. Add forward/inverse dynamics comparison for `ch3-4-1`, `ch3-4-2`.

## Todo List

- [x] Add deterministic integration helper.
- [x] Add frame visual.
- [x] Add differential motion presets: constant force and spring-mass.
- [x] Add inverse dynamics from known `x(t)` preset.
- [x] Validate existing D'Alembert placement and label.

## Completion Notes

- P1 route coverage complete. Projectile preset and independent-force P2 route remain backlog.

## Tests And Verification

```powershell
node --check js\sim-core.js
node --check js\sim-dynamics.js
node --check js\simulations.js
python tools\audit.py
```

Manual verify:

- `ch3-2-2`: doubling force doubles acceleration when mass fixed.
- `ch3-2-2`: doubling mass halves acceleration when force fixed.
- `ch3-3-1`: zero force keeps velocity constant.
- `ch3-3-1`: constant force produces parabolic `x(t)`.
- `ch3-4-2`: inverse solver returns `F=m a(t)` for preset.

## Success Criteria

- Ch3 I-IV P1 routes interactive.
- Differential equation lab shows path and graph.
- No fake computation: outputs derive from model state.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Numerical drift | Use simple presets and reset, not long-running precision claims |
| Too math-heavy UI | Show formula and visual side-by-side, minimal text |

## Security Considerations

No network. No sensitive state.

## Next Steps

Proceed to Ch3 theorem, energy, collision labs.
