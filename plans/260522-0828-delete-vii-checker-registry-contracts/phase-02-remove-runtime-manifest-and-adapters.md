---
title: "Phase 02 - Xóa manifest, adapters, route maps"
status: completed
priority: P1
dependsOn: [phase-01-baseline-and-red-tests.md]
---

# Phase 02 - Xóa manifest, adapters, route maps

## Context Links

- Manifest: `js/sim-route-manifest.js`
- Compatibility map: `js/simulations.js`
- Chapter route maps: `js/sims/ch1/statics-routes.js`, `js/sims/ch2/kinematics-routes.js`, `js/sims/ch3/dynamics-routes.js`

## Overview

Remove the six checker routes from top-level simulation discovery so they no longer appear as canonical simulation routes.

## Requirements

- Manifest count becomes 52.
- `window.SIM_MAP` no longer receives those ids from chapter route modules.
- Thin adapters no longer export deleted checker adapter names.
- Keep `index.html` navigation to Section VII pages unchanged.

## Architecture

The route discovery chain is:

`sim-route-manifest.js` -> chapter `*-routes.js` modules -> `simulations.js` builds `window.SIM_MAP`.

Delete only simulation entries. Do not delete textbook route ids from loader/page maps.

## Related Code Files

Modify:

- `js/sim-route-manifest.js`
- `js/sim-statics.js`
- `js/sim-kinematics.js`
- `js/sim-dynamics.js`
- `js/sims/ch1/statics-routes.js`
- `js/sims/ch2/kinematics-routes.js`
- `js/sims/ch3/dynamics-routes.js`

Read:

- `js/simulations.js`
- `js/loader.js`
- `index.html`

## Implementation Steps

1. Remove `ch1-7-1`, `ch1-7-2`, `ch2-7-1`, `ch2-7-2`, `ch3-7-1`, `ch3-7-2` from `SIM_ROUTE_MANIFEST`.
2. Remove exported adapter aliases: `simStaticsGuidedSolver`, `simStaticsNumericChecker`, `simKinematicsGuidedChecker`, `simKinematicsNumericChecker`, `simDynamicsTheoremSelector`, `simDynamicsNumericChecker`.
3. Remove the six ids from chapter route maps.
4. Run syntax checks on touched JS files.
5. Re-run Phase 01 focused tests; manifest/SIM_MAP absence should turn green, contract registry absence may still fail until Phase 03.

## Todo List

- [x] Remove six manifest entries.
- [x] Remove thin adapter aliases.
- [x] Remove six chapter route-map entries.
- [x] Confirm `window.SIM_MAP` is 52 routes.
- [x] Confirm Section VII pages still load content-only.

## Verification / Tests

```powershell
node --check js\sim-route-manifest.js
node --check js\sim-statics.js
node --check js\sim-kinematics.js
node --check js\sim-dynamics.js
node --check js\sims\ch1\statics-routes.js
node --check js\sims\ch2\kinematics-routes.js
node --check js\sims\ch3\dynamics-routes.js
npx playwright test tests/exercise-section-no-simulation.spec.js
```

Smoke commands may still fail until Phase 04 updates expected count defaults/scripts.

## Success Criteria

- Runtime simulation discovery no longer exposes the six deleted checker ids.
- No learner-facing content route is removed.

## Risk Assessment

- Removing adapters before contract modules may leave dead script modules loaded but harmless. Phase 03 cleans them.

## Security Considerations

No security impact.

## Next Steps

Proceed to Phase 03 to remove contract registrations and route-specific dead code.
