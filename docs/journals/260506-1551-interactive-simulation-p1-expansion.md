# Interactive Simulation P1 Expansion

Date: 2026-05-06

## Summary

Expanded the mechanics textbook simulation layer from 18 registered routes to 58 registered routes, covering all P1 items in the simulation coverage matrix.

## Key Changes

- Added P1 Ch1 statics labs: force anatomy, force-system reducer, DOF/constraint explorer, two-force equilibrium, FBD builder, support reactions, friction, self-locking, centroid hole, statics checkers.
- Added P1 Ch2 kinematics labs: Cartesian motion graph, motion preset gallery, motion composition, absolute/relative/transport toggle, Coriolis acceleration, instantaneous center, slider-crank, kinematics checkers.
- Added P1 Ch3 dynamics labs: force-motion, inertial/non-inertial frame, inertia law, dynamic FBD, differential motion, coupled spring system, inverse dynamics, center of mass, impulse plot, angular momentum, collision solver, dynamics checkers.
- Added `SimActivities` helper layer with numeric/vector checks and `chlyt_activity_progress_v1`.
- Hardened activity persistence against malformed localStorage.
- Added runtime smoke coverage for malformed activity storage.
- Synced plan, phase files, docs, changelog, roadmap, and QA report.

## Validation

- `node --check` for all runtime JS: pass.
- `python -m compileall -q tools`: pass.
- `python tools\audit.py`: pass, 0 errors.
- `python tools\audit.py --strict-equations`: pass.
- `python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict --katex`: pass.
- `python tools\smoke_simulation_routes.py --require-p1`: pass, P1 58/58.
- `python tools\smoke_simulation_runtime.py`: pass.
- Chrome headless `file://`: pass, 58 routes x 3 viewports.

## Concerns

- Workspace has no `.git`, so no commit workflow.
- Code review/project/docs agents repeatedly failed with capacity/429; local fallback report written.
- `sim-statics.js`, `sim-kinematics.js`, `sim-dynamics.js` are large and should be split before P2/P3 expansion.
- 50 audit warnings for legacy figures remain, but 0 audit errors.

Unresolved questions: none.
