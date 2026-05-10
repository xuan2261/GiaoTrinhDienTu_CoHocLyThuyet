---
phase: 1
title: "Foundation Enhancement"
status: completed
priority: P1
effort: "1d"
dependencies: []
---

# Phase 01: Foundation Enhancement (Architecture Hardening)

## Overview
Implement the `SimV2Primitives` factory and harden the `SimulationEngine` to handle mass migration. This phase addresses critical risks identified by the Red Team: memory leaks, SVG namespace collisions, and numerical instability.

## Requirements
- Functional: 
  - `SimV2ID`: Unique ID generator for SVG markers per simulation instance.
  - `FixedStepEngine`: SimulationEngine must support fixed time-steps and sub-stepping for Dynamics.
  - `SimV2Disposal`: Mandatory cleanup pattern for Chart.js and Engines.
- Non-functional: Prevent global state pollution. Ensure 58 simulations can load/unload without memory growth.

## Architecture
- **Dynamic Script Loading**: Update `loader.js` to lazy-load simulation scripts from `js/routes/{route-id}.js`.
- **Scoped SVG**: `SimSVG.arrow` will reference markers using unique IDs (e.g., `url(#arrow-ch1-1-3)`).
- **Hardened Loop**: `SimulationEngine` uses a fixed accumulator to ensure `Matter.Engine.update(16.66ms)` regardless of browser frame rate.

## Related Code Files
- Create: `js/sim-v2-foundation.js` (Combines primitives, ID gen, and disposal helpers)
- Modify: `js/loader.js` (Implement `loadSimScript` helper)
- Modify: `js/sim-engine-v2.js` (Update to fixed time-step)

## Implementation Steps
1. Create `js/sim-v2-foundation.js`.
2. Implement `SimV2ID.next(prefix)`: Generates `prefix-uuid` for SVG markers.
3. Update `SimulationEngine` to use a fixed time-step ($dt=1/60s$) with an accumulator to prevent drift.
4. Implement `SimChart.dispose()` to explicitly destroy Chart.js instances.
5. Update `loader.js`:
   - Implement `async loadSimScript(id)`: Checks cache, appends `<script>`, waits for `onload`.
   - Update `initSimulations` to use the dynamic loader.
6. Create a "Simulation Scaffold" snippet for authors that enforces the `init/dispose` contract.

## Todo List
- [x] Create `js/sim-v2-foundation.js`.
- [x] Implement `SimV2ID.next(prefix)` for marker scoping.
- [x] Update `SimulationEngine` for fixed time-step stability.
- [x] Implement `SimChart.dispose()` for memory management.
- [x] Update `loader.js` with `loadSimScript` helper.
- [x] Create Simulation Scaffold for consistent module implementation.

## Success Criteria
- [x] 10 sequential navigation cycles between different routes show 0 memory growth.
- [x] Multiple simulations with the same marker names (e.g., "arrowhead") do not conflict.
- [x] Dynamics simulations (oscillators) show identical behavior on 60Hz and 144Hz monitors.

## Risk Assessment
- Risk: Too many `<script>` tags polluting the DOM.
- Mitigation: `ScriptLoader` will reuse tags or remove them on dispose if necessary (though browser caching usually prefers keeping them).

