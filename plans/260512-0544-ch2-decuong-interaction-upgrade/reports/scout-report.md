# Ch2 Scout Report

## Relevant Files

| Path | Use |
|---|---|
| `js/sims/ch2/kinematics-routes.js` | 15 active route registrations |
| `js/sim-kinematics.js` | Thin Ch2 adapter to `SimProfessionalLab` |
| `js/sims/ch2/ch2-kinematics-scenes.js` | Canonical Ch2 scenes |
| `js/sims/ch2/ch2-particle-renderers.js` | Particle renderers |
| `js/sims/ch2/ch2-trajectory-graph-renderers.js` | Trajectory/graph renderers |
| `js/sims/ch2/ch2-rotation-gear-renderers.js` | Rotation/gear renderers |
| `js/sims/ch2/ch2-rotation-transmission-renderers.js` | Transmission renderers |
| `js/sims/ch2/ch2-relative-motion-velocity-renderers.js` | Relative velocity renderers |
| `js/sims/ch2/ch2-relative-renderers.js` | Relative motion renderers |
| `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js` | Plane/instant-center renderers |
| `js/sims/ch2/ch2-plane-checker-renderers.js` | Plane/checker renderers |
| `js/sims/ch2/ch2-kinematics-exercises-renderers.js` | Exercise renderers |
| `js/sims/ch2/ch2-kinematics-behaviors-a.js` | Ch2 behavior group A |
| `js/sims/ch2/ch2-kinematics-behaviors-b.js` | Ch2 behavior group B |
| `js/routes/pilot-ch2-particle-motion.js` | DeCuong-style pilot/reference |
| `tests/simulation-interaction-engine.spec.js` | Direct drag/control/animation audit |
| `tests/simulation-visual-quality.spec.js` | Visual/identity/theme audit |

## Route Groups

- Particle/graphs/presets: `ch2-1-1`, `ch2-1-2`, `ch2-1-3`, `ch2-1-4`.
- Rotation/transmission: `ch2-2-2`, `ch2-3-2`.
- Relative motion: `ch2-4-1`, `ch2-4-2`, `ch2-4-3`, `ch2-4-4`.
- Plane motion/solver: `ch2-5-1`, `ch2-5-2`, `ch2-5-3`, `ch2-7-1`, `ch2-7-2`.

## Current Risks

- Graph routes can pass nonblank tests but remain pedagogically weak if cursor/vector relation unclear.
- Animation can mutate readout after drag if pause logic is not enforced.
- Pilot projectile may duplicate concepts but is not active runtime.

## Unresolved Questions

Không có.
