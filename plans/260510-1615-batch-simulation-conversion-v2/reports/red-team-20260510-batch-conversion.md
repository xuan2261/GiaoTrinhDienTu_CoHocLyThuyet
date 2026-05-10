# Red-Team Review: Batch Simulation Conversion V2
**Date**: 2026-05-10
**Reviewer**: Tech Lead / QA Lead
**Status**: CRITICAL CONCERNS

## 1. Performance & Dynamic Loading
### 🚩 The "Batch File" Bottleneck
The plan proposes bundling simulations into large files (e.g., `ch1-statics-batch.js` for 25 routes). 
- **Risk**: If these are loaded via `<script>` tags in `index.html`, the initial load time will spike significantly. If loaded via `loader.js`, the plan doesn't specify a dynamic script loading mechanism (currently `loader.js` only fetches HTML fragments).
- **Architecture Risk**: Loading 25 simulations into memory when only one is viewed is wasteful.
- **Recommendation**: Implement a dynamic `ScriptLoader` in `loader.js` to load `{route-id}.js` only when needed, or use a truly modular approach where each simulation is its own file.

## 2. Visual Accuracy & SVG Risks
### 🚩 Global Namespace/ID Collision in SVG
Phase 1 uses `SimSVG` for arrows and markers.
- **Risk**: SVG `<marker>` and `<symbol>` rely on `id` references. If 58 simulations use the same `id="arrowhead"`, and the browser caches the first one it sees, visual glitches will occur across simulations (e.g., an arrow from Ch1 showing up in Ch3).
- **Recommendation**: `SimSVG` must generate unique IDs for markers per simulation instance or ensure cleanup of the global SVG `<defs>` on unmount.

### 🚩 KaTeX/SVG Alignment
Mechanical labels (KaTeX) need to follow SVG elements (Force arrows).
- **Risk**: SVG and HTML use different coordinate systems and scaling behaviors. Mobile browsers often handle SVG `viewBox` scaling differently than standard CSS transforms.
- **Recommendation**: Standardize the "SVG-Overlay" pattern where KaTeX is absolutely positioned over a fixed-aspect-ratio SVG container to prevent labels from drifting.

## 3. Physics Stability (Phase 4: Dynamics)
### 🚩 Numerical Instability in Matter.js
- **Risk**: `SimulationEngine` uses variable `delta` for `Matter.Engine.update`. For high-speed dynamics or high-stiffness springs (oscillators), this will lead to "explosions" or numerical drift.
- **Risk**: Energy conservation visualization (Bar charts) will fail if the integrator drifts.
- **Recommendation**: Hard-code a fixed time step (e.g., `1/60`) and use sub-stepping (3-5 iterations) for Chapter 3 routes to ensure energy conservation matches textbook theory.

## 4. Memory Leaks
### 🚩 Chart.js Instance Leak
- **Risk**: `SimChart` (Phase 3) creates a `new Chart()` instance. The plan has no mention of a `destroy()` call on unmount. Chart.js keeps internal references to the canvas and window resize events.
- **Recommendation**: `SimChart` MUST have a `.dispose()` method that calls `this.instance.destroy()`, and this must be called in the simulation's main `dispose` function.

### 🚩 SimulationEngine Loop Persistence
- **Risk**: If a simulation author forgets to call `engine.stop()` in their dispose function, the `requestAnimationFrame` loop will run forever in the background, consuming CPU for an invisible simulation.
- **Recommendation**: The `SimulationEngine` should be registered with the `loader.js` or a `SimManager` that automatically stops all engines when a route change occurs.

## 5. Code Maintenance
### 🚩 Violation of File Size Limits
- **Risk**: Creating "Batch" files for 25 routes will result in single files exceeding 3,000 lines. This directly violates the project's **Development Rules** (files < 200 lines).
- **Architecture Risk**: Huge files are "God Objects" that make testing and regression tracking impossible.
- **Recommendation**: Abandon the "Batch" file approach. Every route should be a standalone file. Use a build script to bundle them if deployment requires it, but keep them separate in source.

## Summary of Unresolved Questions
1. How will the "Batch" files be loaded by `loader.js`?
2. Is there a plan for automated physics regression (checking if $E_{total}$ stays constant)?
3. How will `SimSVG` handle unique ID generation for markers?
4. What is the plan for handling mobile-specific touch interactions in 58 different routes?
