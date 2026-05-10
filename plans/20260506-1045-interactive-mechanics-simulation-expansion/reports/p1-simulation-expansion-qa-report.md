# P1 Simulation Expansion QA Report

Date: 2026-05-06

## Scope

Implemented P1 interactive simulation coverage from the matrix:

- `SIM_MAP`: 58 routes.
- P1 matrix coverage: 58/58.
- P2/P3 routes remain backlog.

## Changed Areas

- `js/sim-core.js`: plot helpers, Euler helper, drag listener cleanup.
- `js/sim-activities.js`: numeric/vector checker helpers, route progress storage guard.
- `js/sim-statics.js`: Ch1 P1 labs for force vectors, reducers, constraints, FBD, supports, friction, centroid, checkers.
- `js/sim-kinematics.js`: Ch2 P1 labs for Cartesian motion, presets, composition, Coriolis, instantaneous center, slider-crank, checkers.
- `js/sim-dynamics.js`: Ch3 P1 labs for frames, inertia, dynamic FBD, differential motion, inverse dynamics, center of mass, angular momentum, collision solver, checkers.
- `js/simulations.js`: registry expanded to 58 routes.
- `css/style.css`: activity checker UI.
- `tools/smoke_simulation_runtime.py`: malformed localStorage schema guard.

## Automated Validation

```powershell
node --check js\app.js
node --check js\loader.js
node --check js\quiz.js
node --check js\progress.js
node --check js\glossary.js
node --check js\notes.js
node --check js\sim-core.js
node --check js\sim-statics.js
node --check js\sim-kinematics.js
node --check js\sim-dynamics.js
node --check js\sim-activities.js
node --check js\simulations.js
python -m compileall -q tools
python tools\audit.py
python tools\audit.py --strict-equations
python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict --katex
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_runtime.py
```

Result: PASS.

## Browser Smoke

Chrome headless `file://` smoke:

- 58 registered simulation routes.
- Viewports: 1280x900, 375x812, 768x1024.
- Checks: route hash, `.sim-container`, `.sim-canvas`, nonblank canvas pixels, info text, console/page/log errors.

Result: PASS, 58 routes x 3 viewports.

## Known Residuals

- Resolved 2026-05-07: `python tools\audit.py` and `python tools\audit.py --strict-images` now pass with 0 image warnings/errors for the current corpus.
- `sim-statics.js`, `sim-kinematics.js`, `sim-dynamics.js` are large after P1 expansion; future split should be topic-based.
- P2/P3 matrix ideas remain long-term backlog unless real DOCX/scenario demand appears.
- No package manager or persistent Playwright suite added; browser smoke was run as an ad hoc Chrome CDP validation.

Unresolved questions: none.
