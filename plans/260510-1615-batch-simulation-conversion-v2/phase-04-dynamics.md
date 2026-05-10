---
phase: 4
title: "Dynamics (Ch3 - 18 Routes)"
status: completed
priority: P1
effort: "3d"
dependencies: [1, 2, 3]
---

# Phase 04: Dynamics (Ch3 - 18 Routes)

## Overview
Port all 20 Dynamics simulations from Chapter 3 as standalone modules. This phase is the most critical for physics accuracy, requiring energy conservation plots and stable collision handling.

## Requirements
- Functional: 
  - Newton's Laws labs with acceleration vectors.
  - Energy Theorem labs (Kinetic, Potential, Total).
  - Collision labs (1D/2D, elastic/inelastic).
- Non-functional: Energy drift < 0.5% per minute. 0 "Explosions" in multi-body spring systems.

## Implementation Steps
1. Create directory structure `js/routes/ch3/`.
2. Port **Newton's Laws** (ch3-1-x, ch3-2-x): 5 routes.
3. Port **Oscillators & ODEs** (ch3-3-x): 3 routes.
4. Port **Momentum & Center of Mass** (ch3-4-x, ch3-5-x): 4 routes.
5. Port **Energy & Theorems** (ch3-6-x): 4 routes.
6. Port **Collisions & Exercises** (ch3-7-x): 6 routes.
7. Verify each route calls `chart.dispose()` in its cleanup function and registers with `RouteRegistry`.

## Todo List
- [x] Create `js/routes/ch3/` folder.
- [x] Port ch3-1-1 to ch3-2-2 (Newton's Laws).
- [x] Port ch3-3-1 to ch3-6-4 (Momentum & Energy).
- [x] Port ch3-7-1 to ch3-7-6 (Collisions & Solver).
- [x] Verify all 20 routes load correctly.

## Success Criteria
- [x] Total Energy (E) stays constant in elastic oscillator scenes.
- [x] Multi-body systems (Coupled blocks) do not drift over time.
- [x] 100% of Ch3 routes port complete and verified.
