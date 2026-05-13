# Researcher 01 Physics Correctness Report

## Summary

Promax simulation nên ưu tiên correctness trước visual. Codebase đã có `SimPhysicsStatics`, `SimPhysicsKinematics`, `SimPhysicsDynamics`, route scenes/renderers/behaviors, và release QA. Thiếu lớp invariant có hệ thống để chứng minh route đúng vật lý sau drag, slider, play/pause.

## Findings

| Area | Current state | Gap |
|---|---|---|
| Statics | Có force, moment, reaction, friction, centroid helpers | Invariant theo route chưa thành manifest/test chung |
| Kinematics | Có trajectory, derivative, rotation, Coriolis helpers | Graph/readout chain cần canonical hóa route-by-route |
| Dynamics | Có RK4, collision, energy, momentum helpers | Energy/momentum drift chưa có tolerance dashboard |
| Route contracts | 58 renderer + 58 behavior + scene identity | Contract kiểm cấu trúc tốt, chưa đủ kiểm physics truth |
| Browser tests | Mount, interaction, visual, direct drag | Cần semantic test sau mỗi tương tác quan trọng |

## Recommended Physics Upgrade

1. Add route invariant manifest separate from objective manifest.
2. Add invariant evaluator helpers by domain:
   - statics: `sumFx`, `sumFy`, `sumM`, friction margin, centroid residual.
   - kinematics: derivative consistency `v=dx/dt`, `a=dv/dt`, no-slip velocity, Coriolis direction/magnitude.
   - dynamics: `F=ma`, ODE energy drift, collision momentum, restitution, work-energy residual.
3. Expose invariant summary in dev/test only first; visible learner feedback later.
4. Pilot 6 routes before rollout.

## Hard Truths

- Matter.js for all routes is wrong fit. Most routes are symbolic/constraint demonstrations, not rigid body simulation.
- Pretty UI without invariant tests will regress again.
- Route-by-route correctness must still share helpers. No copy-paste formulas in renderers.

## Unresolved Questions

- None blocking planning.
