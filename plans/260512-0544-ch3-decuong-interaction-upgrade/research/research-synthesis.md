# Ch3 Research Synthesis

## Summary

Ch3 cần nâng theo “dynamic lab”: kéo thông số/vật thể, play/pause rõ, năng lượng/xung lượng/va chạm đọc được. Không nên phục hồi bulk `phase-05-ch3-dynamics-all-routes.js` làm active runtime vì file lớn và duplicate route risk.

## Evaluated Approaches

| Approach | Pros | Cons | Decision |
|---|---|---|---|
| Revive bulk Ch3 dynamics file | Có nhiều demo cũ | File rất lớn, duplicate registrations, trái file-size rule | Reject as active |
| Route-by-route active Ch3 polish | Bám current contracts/tests | Cần physics checks kỹ | Select |
| Only visual skin | Nhanh | Không giải quyết dynamic correctness | Insufficient |

## Ch3 Design Direction

- Newton/D'Alembert: force, acceleration, inertial force directions obvious.
- ODE/spring: drag displacement/mass/spring, energy readout stable.
- Momentum/energy: bars/vectors tied to motion.
- Collision: restitution, impulse, before/after states visible.
- Exercises: simple checker, immediate feedback, no heavy panels.

## Constraints

- Active route path is `js/sims/ch3/*` and `js/sim-dynamics.js`.
- `js/routes/phase-05-ch3-dynamics-all-routes.js` and `pilot-ch3-collision-solver.js` are reference/legacy unless explicitly integrated.
- Dynamic routes must not drift when paused after direct manipulation.

## Recommended Solution

Upgrade Ch3 in two batches: Newton/ODE/forced motion first, theorems/collision/exercises + legacy/pilot reconcile second.

## Unresolved Questions

Không có.
