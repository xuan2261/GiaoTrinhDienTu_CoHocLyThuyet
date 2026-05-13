# Promax Rollout Matrix

Date: 2026-05-13

## Recommendation

Do follow-up rollout by invariant family. Do not auto-upgrade remaining 52 routes in one sweep.

## Family Rollout

| Group | Non-pilot routes | Invariant strategy | Test gate | Risk |
|---|---|---|---|---|
| Statics vector/moment | `ch1-1-3`, `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-1-8`, `ch1-2-1`, `ch1-2-6` | vector components, moment balance, FBD residual | unit invariant + direct drag readout | Medium |
| Supports/reactions | `ch1-3-1`, `ch1-3-2`, `ch1-3-3`, `ch1-3-4`, `ch1-3-6`, `ch1-3-7` | reaction direction/DOF + equilibrium | support route browser + renderer contract | Medium |
| Spatial statics | `ch1-4-1`, `ch1-4-2`, `ch1-4-4` | 3D resultant/moment/equilibrium residual | spatial unit + browser semantic | High |
| Friction/centroid | `ch1-5-1`, `ch1-5-2`, `ch1-5-4`, `ch1-6-2`, `ch1-6-3` | friction limit, self-locking, weighted centroid | unit + visual mobile | Medium |
| Statics solvers | `ch1-7-1`, `ch1-7-2` | step/check residual against canonical answer | checker regression | Low |
| Particle kinematics | `ch2-1-1`, `ch2-1-3`, `ch2-1-4` | analytic position/velocity/acceleration family | unit + graph cursor browser | Medium |
| Rotation/transmission | `ch2-2-2`, `ch2-3-2` | `v=omega*r`, no-slip ratio | unit + slider browser | Low |
| Relative motion | `ch2-4-1`, `ch2-4-2`, `ch2-4-3`, `ch2-4-4` | `va=ve+vr`, Coriolis residual | unit + direct drag | Medium |
| Plane motion | `ch2-5-1`, `ch2-5-3` | `vB=vA+omega x AB`, distribution from IC | unit + visual | Medium |
| Kinematics solvers | `ch2-7-1`, `ch2-7-2` | canonical sinusoid and numeric checker residual | existing phase tests + invariant | Low |
| Newton/D'Alembert | `ch3-1-2`, `ch3-1-3`, `ch3-2-1`, `ch3-2-2`, `ch3-2-3`, `ch3-2-5`, `ch3-4-1`, `ch3-4-2` | `F=ma`, inertial force/equilibrium residual | unit + browser animation | Medium |
| ODE/spring | `ch3-3-2` | coupled spring energy/mode residual | deterministic animation unit | High |
| Theorems/collision | `ch3-5-1`, `ch3-5-2`, `ch3-5-3`, `ch3-5-4`, `ch3-6-3` | momentum/angular momentum/work-energy/collision residuals | signed-value unit + browser | High |
| Dynamics solvers | `ch3-7-1`, `ch3-7-2` | theorem selection + residual score | existing numeric checker regression | Low |

Non-pilot coverage: 52/52.

## Next Execution Path

1. Roll out Ch1 statics/friction families first. Lowest physics ambiguity.
2. Roll out Ch2 particle/plane families next. Reuse derivative and IC evaluators.
3. Roll out Ch3 theorem/ODE last. Highest sign/numeric risk.

## Unresolved Questions

- Có muốn split follow-up thành 3 chapter plans hay 1 invariant-family plan?
- Có cần screenshot evidence cho từng family trước khi mở rộng không?
