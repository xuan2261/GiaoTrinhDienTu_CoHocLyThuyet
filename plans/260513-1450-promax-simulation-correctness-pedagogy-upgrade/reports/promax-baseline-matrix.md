# Promax Baseline Matrix

Date: 2026-05-13

## Route Coverage

| Family | Routes | Pilot | Baseline gap |
|---|---|---|---|
| Ch1 force/vector/moment | `ch1-1-3`, `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-1-8`, `ch1-2-1`, `ch1-2-3`, `ch1-2-6` | `ch1-2-3` | Strong direct drag/rendering. Missing explicit invariant residual contract before this work. |
| Ch1 supports/spatial | `ch1-3-1`, `ch1-3-2`, `ch1-3-3`, `ch1-3-4`, `ch1-3-6`, `ch1-3-7`, `ch1-4-1`, `ch1-4-2`, `ch1-4-4` | none | Route-specific renderer/behavior complete. Promax rollout needs support/reaction equilibrium invariants. |
| Ch1 friction/centroid/checker | `ch1-5-1`, `ch1-5-2`, `ch1-5-3`, `ch1-5-4`, `ch1-6-2`, `ch1-6-3`, `ch1-7-1`, `ch1-7-2` | `ch1-5-3` | Friction state visible. Missing shared tolerance/status and optional challenge mode. |
| Ch2 particle/graphs | `ch2-1-1`, `ch2-1-2`, `ch2-1-3`, `ch2-1-4` | `ch2-1-2` | Graph routes mount and interact. Need derivative-chain residuals and graph/formula coupling. |
| Ch2 rotation/transmission/relative | `ch2-2-2`, `ch2-3-2`, `ch2-4-1`, `ch2-4-2`, `ch2-4-3`, `ch2-4-4` | none | Existing invariants implicit in behavior/renderers. Promax rollout needs family-level evaluator specs. |
| Ch2 plane/checker | `ch2-5-1`, `ch2-5-2`, `ch2-5-3`, `ch2-7-1`, `ch2-7-2` | `ch2-5-2` | IC and solver routes good direct manipulation baseline. Need explicit IC/perpendicular residual contract. |
| Ch3 Newton/ODE | `ch3-1-2`, `ch3-1-3`, `ch3-2-1`, `ch3-2-2`, `ch3-2-3`, `ch3-2-5`, `ch3-3-1`, `ch3-3-2`, `ch3-4-1`, `ch3-4-2` | `ch3-3-1` | Animated/readout baseline pass. Need ODE/energy residual and deterministic challenge feedback. |
| Ch3 theorems/collision/checker | `ch3-5-1`, `ch3-5-2`, `ch3-5-3`, `ch3-5-4`, `ch3-6-2`, `ch3-6-3`, `ch3-7-1`, `ch3-7-2` | `ch3-6-2` | Collision signs and reset already hardened. Need momentum/restitution invariant exposed as first-class status. |

Coverage: 58/58 routes listed. Pilot routes: 6/6.

## Current QA Baseline

| Gate | Result |
|---|---|
| `npm run test:sim:unit` | PASS |
| `python tools\smoke_simulation_runtime.py --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup` | PASS |
| `python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct` | PASS |
| `python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58` | PASS |
| `npm run test:sim:quality` | PASS |
| `npm run test:sim:browser` | PASS, 173 tests |

## Completion Update

This baseline was created before Phase 08 completion. Current completion evidence is recorded in `final-promax-pilot-report.md` and `pm-20260513-1730-promax-completion-sync.md`.

## Pilot Gap Summary

| Route | Target invariant | Implemented evidence | Remaining gap |
|---|---|---|---|
| `ch1-2-3` | `R = F1 + F2` | Unit invariant + shell status + browser shell | No pilot-blocking gap. |
| `ch1-5-3` | `mu - tan(alpha)` | Unit invariant + shell status + browser shell | No pilot-blocking gap. |
| `ch2-1-2` | `v=dx/dt`, `a=dv/dt` | Unit invariant + shell status + browser shell + tangent diagnostic + mini graph summary | No pilot-blocking gap. |
| `ch2-5-2` | `v = omega x r` | Unit invariant + shell status + browser shell + perpendicular residual overlay | No pilot-blocking gap. |
| `ch3-3-1` | spring energy drift | Unit invariant + shell status + browser shell + energy diagnostic + mini graph summary | No pilot-blocking gap. |
| `ch3-6-2` | momentum + restitution | Unit invariant + shell status + browser shell + before/after momentum graph summary | No pilot-blocking gap. |

## Unresolved Questions

- Có chấp nhận giữ challenge feedback không persistence như hiện tại không?
