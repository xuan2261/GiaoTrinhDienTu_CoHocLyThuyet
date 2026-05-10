# Mass Simulation Conversion V2: High-Rigor Planning and Architectural Hardening

**Date**: 2026-05-10 16:15
**Severity**: High (Strategic)
**Component**: Simulation Engine / UI Loader
**Status**: In-Progress (Planning Phase Complete)

## What Happened

We have officially moved into Phase 2 of the simulation project: a mass migration of 58 remaining simulations. To avoid the technical debt and "spaghetti" patterns observed in early prototypes, we executed a high-rigor planning phase. This involved deploying two dedicated researcher agents to map out every single mechanical system and a "Red Team" review to brutally challenge our architecture before a single line of V2 code was written.

## The Brutal Truth

Shipping 58 interactive simulations is a massive risk. In V1, we had "batch" files that were bloated, hard to debug, and prone to memory leaks. If we had continued that path, the application would have become a sluggish, unmaintainable mess. The "Red Team" review was painful but necessary—it exposed that our previous disposal logic was "theoretical" at best. We were essentially leaving engine instances alive in the background, which would have crashed mobile browsers within three page changes.

## Technical Details

- **Inventory**: 58 distinct mechanical systems (Statics, Kinematics, Dynamics).
- **Architecture Shift**: Moving from monolithic `simulations.js` to standalone route-based files. This strictly enforces the **200-line rule** for each simulation module.
- **Dynamic Loading**: `loader.js` now handles just-in-time script injection to keep the initial bundle size lean.
- **Resource Management**: Strict `dispose()` protocols for `Chart.js` instances and physics engines.
- **SVG Integrity**: Collision-free unique ID generation for SVG markers (essential for complex vector overlays).

## Decisions & Trade-offs

- **Standalone vs. Batch**: We chose standalone files. While it increases the file count significantly, it isolates failures and allows for granular testing.
- **Manual vs. Automated Disposal**: Automated disposal was deemed too risky given the variety of libraries (Matter.js, Three.js, Chart.js). We are mandating an explicit cleanup contract for every route.
- **SVG Markers**: We decided to implement a namespacing utility for SVG `defs` to prevent the "disappearing arrow" bug caused by ID collisions in a single-page app context.

## Lessons Learned

1. **Planning is the real work**: Spending 4 hours on a Red Team review saved us likely 40 hours of "debugging the loader" later.
2. **Batching is a trap**: Bundling 10 simulations in one file feels efficient until you need to fix a bug in the 5th one and risk breaking the other 9.
3. **Mismatched Lifecycles**: The biggest source of leaks wasn't the code logic, but the lifecycle mismatch between the SPA router and the persistent physics engine.

## Next Steps

The execution follows a strict 5-phase roadmap:
1. **Foundation**: Harden the `loader.js` and common utilities.
2. **Statics**: Port the first batch of equilibrium/truss sims.
3. **Kinematics**: Port motion/velocity sims.
4. **Dynamics**: Port force/acceleration/energy sims.
5. **Mass QA**: Automated browser audits for memory leaks and visual regressions.

The first simulation in the "Statics" phase starts now.
