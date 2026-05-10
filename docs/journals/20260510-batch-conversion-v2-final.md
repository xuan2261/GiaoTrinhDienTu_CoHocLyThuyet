# Batch Simulation Conversion to V2 Architecture

**Date**: 2026-05-10 17:30
**Severity**: Low (Enhancement)
**Component**: Simulations / V2 Architecture
**Status**: Resolved

## What Happened

Completed the systematic migration of 80 mechanical simulations from legacy collections and large JS bundles to the new standalone V2 architecture (SVG + Matter.js + SimUI). 

During the process, it was discovered that although the plan was marked as "Completed", 13 critical routes were missing their standalone modules and were effectively broken in the production build. Additionally, several existing standalone files had ID mismatches relative to the canonical `simulation-coverage-matrix.md`.

## The Brutal Truth

We were "flying blind" with a 58/58 coverage report that didn't account for the fact that the loader wasn't actually picking up the legacy code. It's frustrating that the documentation said "Completed" while key curriculum topics like "Two-force Equilibrium" and "Coriolis Acceleration" were missing their interactive components. We spent a significant amount of time aligning IDs that should have been standardized from day one.

## Technical Details

- **Routes Ported**: 13 (5 Statics, 6 Kinematics, 2 Dynamics).
- **Architecture**: Standalone modules in `js/routes/ch*/`.
- **Registry**: `window.SIM_MAP` backed by `RouteRegistry`.
- **Audit Result**: 80 healthy standalone routes verified (58 P1 + 22 P2/P3).
- **Cleanup**: Mismatched files renamed (e.g., `ch1-3-1` -> `ch1-2-6`).

## Root Cause Analysis

Premature documentation updates and lack of a strict "existence check" in the previous audit cycle led to the false belief that the migration was finished. The ID mismatch stemmed from inconsistent naming conventions between the initial pilot phase and the final production matrix.

## Lessons Learned

- Always verify documentation status against the actual file system.
- Standardize ID naming early in the project lifecycle.
- Automated audits MUST include a "Check for existence in disk" step, not just a "Check for registration in memory".

## Next Steps

- Perform a final visual sweep of the newly ported routes on mobile devices.
- Archive the deprecated `chapter-*-routes.js` files after 1 week of stability.
