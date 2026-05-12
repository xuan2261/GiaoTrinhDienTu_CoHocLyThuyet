# Ch2 Research Synthesis

## Summary

Ch2 cần nâng tương tác theo “motion lab”: kéo điểm, kéo time cursor, bật/dừng animation, graph đồng bộ. Không nên rewrite engine; nên chỉnh scene/renderer/behavior route-specific trên `SimProfessionalLab`.

## Evaluated Approaches

| Approach | Pros | Cons | Decision |
|---|---|---|---|
| Matter.js/SVG standalone for Ch2 | Có motion physics engine | Lệch active runtime, tăng duplicate code | Reject |
| Canvas professional lab polish | Bám active tests, ít rủi ro | Cần route-by-route visual review | Select |
| Only CSS/control polish | Nhanh | Không đủ cho graph/vector/cơ cấu | Insufficient |

## Ch2 Design Direction

- Particle: drag point or time cursor; vector velocity/acceleration clear.
- Graph: x/v/a graph with cursor and synchronized readouts.
- Rotation/transmission: drag radius/point, gear ratio visible.
- Relative/plane motion: velocity triangle, instant center, Coriolis direction.
- Solver routes: simple guided checks, no heavy assessment panel.

## Constraints

- Active route path is `js/sims/ch2/*` and `js/sim-kinematics.js`.
- `js/routes/pilot-ch2-particle-motion.js` is reference/pilot scope, not active unless explicitly integrated.
- Keep animation paused by default where route supports direct drag.

## Recommended Solution

Upgrade Ch2 in two implementation batches: particle/rotation/transmission first, relative/plane/solver + pilot reconcile second.

## Unresolved Questions

Không có.
