# Ch3 Scout Report

## Relevant Files

| Path | Use |
|---|---|
| `js/sims/ch3/dynamics-routes.js` | 18 active route registrations |
| `js/sim-dynamics.js` | Thin Ch3 adapter to `SimProfessionalLab` |
| `js/sims/ch3/ch3-dynamics-all-18-scenes.js` | Canonical Ch3 scenes |
| `js/sims/ch3/ch3-newton-laws-renderers.js` | Newton/D'Alembert renderers |
| `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js` | ODE/spring renderers |
| `js/sims/ch3/ch3-theorems-renderers.js` | Momentum/energy theorem renderers |
| `js/sims/ch3/ch3-collision-exercises-renderers.js` | Collision/exercise renderers |
| `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js` | Newton/ODE behavior group |
| `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js` | Theorem/collision behavior group |
| `js/routes/phase-05-ch3-dynamics-all-routes.js` | Large legacy/bulk reference |
| `js/routes/pilot-ch3-collision-solver.js` | Collision pilot/reference |
| `tests/simulation-interaction-engine.spec.js` | Direct drag/control/animation audit |
| `tests/simulation-visual-quality.spec.js` | Visual/identity/theme audit |

## Route Groups

- Newton/frame/linkage: `ch3-1-2`, `ch3-1-3`, `ch3-2-1`, `ch3-2-2`, `ch3-2-3`, `ch3-2-5`.
- ODE/forced/inverse: `ch3-3-1`, `ch3-3-2`, `ch3-4-1`, `ch3-4-2`.
- Theorems: `ch3-5-1`, `ch3-5-2`, `ch3-5-3`, `ch3-5-4`.
- Collision/exercises: `ch3-6-2`, `ch3-6-3`, `ch3-7-1`, `ch3-7-2`.

## Current Risks

- Legacy bulk file registers 22 Ch3 routes and can conflict if loaded.
- Ch3 dynamic values can be visually plausible but physically wrong.
- Animation lifecycle failures are more visible in Ch3 than Ch1/Ch2.

## Unresolved Questions

Không có.
