---
phase: 3
title: "UI Layer"
status: completed
priority: P1
effort: "1d"
dependencies: [2]
---

# Phase 03: UI Layer

## Overview
Design and implement the standardized user interface controls (native HTML5 sliders, buttons) and integrate Chart.js for realtime data visualization.

## Requirements
- Functional: Reusable UI panel generation for parameters (mass, friction, velocity). Chart component that can hook into `SimulationEngine` to plot data over time (e.g., position vs. time).
- Non-functional: Must use native `<input type="range">`, styled exclusively via CSS variables to match the textbook's global theme.

## Architecture
- **UI Generator**: A helper class `SimUI` to auto-generate control panels.
- **Chart Wrapper**: A helper class `SimChart` that initializes a Chart.js instance and exposes an `updateData(time, value)` method called by the `SimulationEngine` loop.

## Related Code Files
- Create: `js/sim-ui-v2.js`
- Modify: `css/style.css` (styling native inputs, chart containers, control panels)

## Implementation Steps
1. Write CSS for `.sim-control-panel`, `.sim-slider` (targeting `input[type=range]::-webkit-slider-thumb` etc.), and `.sim-button`.
2. Create `js/sim-ui-v2.js` with `class SimUI`. Add methods like `addSlider(label, min, max, step, onChange)`.
3. Implement `class SimChart` wrapping Chart.js. Configure it to be responsive and disable unnecessary animations for performance during realtime 60fps updates.
4. Link `SimChart` to `SimulationEngine` so it can push data points on every tick if required.

## Success Criteria
- [x] Sliders look modern, unified, and use the project's color palette (e.g., navy/gold accents).
- [x] Changing a slider triggers a callback that updates the Matter.js physics engine in realtime.
- [x] Chart.js canvas renders and updates dynamically alongside the physics simulation.


## Risk Assessment
- Risk: Realtime Chart.js updates might cause GC pauses or lag.
- Mitigation: Limit chart history (e.g., keep only the last 100-200 data points) and use `chart.update('none')` to skip Chart.js internal animations.
