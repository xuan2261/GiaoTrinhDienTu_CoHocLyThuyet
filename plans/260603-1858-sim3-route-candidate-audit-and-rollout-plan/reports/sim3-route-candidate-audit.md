# Sim3 Route Candidate Audit

## Scoring

Scale:
- `3D value`: 0-5. Does 3D clarify the physics beyond decoration?
- `Reuse`: 0-5. Can it reuse existing Sim3 shell/adapters simply?
- `Risk`: 1-5. Higher = more complexity/performance/visual clutter risk.
- `Priority`: recommendation for the next Sim3 rollout.

## Summary

Top next batch: `ch2-3-2`, `ch2-4-4`, `ch3-5-3`.

Rationale: all three have real spatial concepts, reuse existing animation/state flow, and avoid turning static 2D diagrams into decorative 3D.

## Route Matrix

| Route | Topic | 3D value | Reuse | Risk | Priority | Notes |
|---|---|---:|---:|---:|---|---|
| `ch1-1-3` | Force vector components | 2 | 3 | 2 | Later | 3D vector possible, but current 2D teaches components well. |
| `ch1-1-4` | Moment arm | 3 | 3 | 2 | Later | 3D could show axis of moment; not urgent. |
| `ch1-1-5` | Reduce force system | 3 | 2 | 3 | Later | Spatial force system useful, but current route is planar reduction. |
| `ch1-1-6` | Couple moment | 3 | 3 | 2 | Later | Good classroom demo, lower than dynamic Ch2/Ch3. |
| `ch1-2-3` | Parallelogram of forces | 1 | 3 | 1 | No | 2D construction is the concept. |
| `ch1-1-8` | Beam reactions/FBD | 2 | 2 | 2 | No | 3D beam adds little unless support types expand. |
| `ch1-3-2` | Rope tension | 2 | 2 | 2 | No | 3D mostly decorative for symmetric 2D setup. |
| `ch1-3-6` | Cantilever reactions | 2 | 2 | 2 | No | 3D beam depth not worth next batch. |
| `ch1-5-3` | Friction cone/incline | 4 | 2 | 3 | Later | Friction cone is truly 3D; needs careful visual design. |
| `ch1-6-3` | Centroid composite/hole | 1 | 2 | 2 | No | 2D area subtraction is clearer. |
| `ch2-1-1` | Projectile path + v,a | 3 | 3 | 2 | Later | 3D trajectory possible, but 2D projectile is canonical. |
| `ch2-1-3` | Tangent/normal/curvature | 3 | 2 | 3 | Later | 3D Frenet frame useful, but route is 2D ellipse. |
| `ch2-2-2` | Fixed-axis rotation | 5 | 5 | 2 | Done | Pilot complete. |
| `ch2-3-2` | Gear/belt/pulley transmission | 5 | 4 | 2 | Batch 1 | Spatial axes, gear contact, belt direction benefit from 3D. |
| `ch2-4-4` | Relative motion/Coriolis | 5 | 3 | 4 | Batch 1 | Cross-product relation deserves 3D; risk is vector clutter. |
| `ch2-5-2` | Instantaneous center | 3 | 2 | 3 | Later | IC construction is planar; 3D not first priority. |
| `ch2-5-3` | Velocity field on rigid body | 4 | 3 | 3 | Stretch | Good for rotating plate/points; less urgent than Coriolis. |
| `ch3-2-2` | Newton II F=ma | 2 | 3 | 2 | No | 2D block and graph enough. |
| `ch3-2-3` | Action-reaction pair | 2 | 3 | 2 | No | 3D force pair possible but not high value. |
| `ch3-1-3` | Inertial vs non-inertial frame | 4 | 3 | 3 | Later | 3D train/pedulum is useful; can wait after batch 1. |
| `ch3-3-1` | ODE/RK4 oscillator | 2 | 3 | 2 | No | Plot/1D oscillator is clearer in 2D. |
| `ch3-5-2` | Impulse/momentum | 3 | 3 | 2 | Later | Could reuse collision-style body/impulse cue. |
| `ch3-5-3` | Angular momentum conservation | 5 | 4 | 2 | Batch 1 | Rotating masses + radius change is naturally 3D. |
| `ch3-5-4` | Work-energy | 2 | 3 | 2 | No | 1D work-energy relation is clear in 2D. |
| `ch3-6-2` | Collision restitution | 5 | 5 | 2 | Done | Pilot complete. |

## Recommended Sequence

1. `ch2-3-2`: likely easiest high-value win after pilot.
2. `ch3-5-3`: can reuse rotating-body patterns from `ch2-2-2`.
3. `ch2-4-4`: highest conceptual value but needs stricter vector clutter control.

## Deferred Candidates

- `ch2-5-3`: good stretch if batch 1 is smooth.
- `ch1-5-3`: real 3D friction cone value, but needs a cleaner conceptual scene.
- `ch3-1-3`: strong teaching value, but may need a more narrative scene.

## Rejected For Next Batch

Mostly static planar constructions and 1D graph-heavy routes. A 3D layer there would add cost without enough teaching gain.

## Unresolved Questions

- Should the next batch include `ch2-5-3` as a stretch route or stay strict at 3 routes?
- Should UMD deprecation be removed before adding more Sim3 routes?
