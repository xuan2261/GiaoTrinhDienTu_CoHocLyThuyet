---
phase: 3
title: "Kinematics (Ch2 - 15 Routes)"
status: completed
priority: P1
effort: "2d"
dependencies: [1, 2]
---

# Phase 03: Kinematics (Ch2 - 15 Routes)

## Overview
Port all 15 Kinematics simulations from Chapter 2 as standalone modules. Focus on path visualization and high-frequency data plotting for displacement, velocity, and acceleration.

## Requirements
- Functional: Real-time velocity/acceleration vectors. Trajectory trails (with alpha-fading). Motion graphs (x-v-a vs time).
- Non-functional: Frame-perfect synchronization between Matter.js state and Chart.js points.

## Implementation Steps
1. Create directory structure `js/routes/ch2/`.
2. Port **Particle Motion** (ch2-1-x): Trajectories + `Chart.js` graphs (4 routes).
3. Port **Rotation & Gears** (ch2-2-x, ch2-3-x): Gear teeth sync (4 routes).
4. Port **Velocity Composition & Plane Motion** (ch2-4-x, ch2-5-x): Mechanisms and Coriolis (7 routes).
5. Verify each route calls `chart.dispose()` in its cleanup function.

## Todo List
- [x] Create `js/routes/ch2/` folder.
- [x] Port ch2-1-1 to ch2-1-4 (Trajectories & x-v-a).
- [x] Port ch2-2-1 to ch2-3-2 (Rotation & Gears).
- [x] Port ch2-4-1 to ch2-5-4 (Composition & Mechanisms).
- [x] Port Fixed Point Rotation & Exercises.
- [x] Verify all routes load correctly.

## Success Criteria
- [x] Trajectory trails fade out smoothly without causing DOM bloat.
- [x] Velocity triangles close visually at all times.
- [x] Navigation away from a graphing route stops all Chart.js update events.
- [x] 100% of Ch2 routes are accessible and verified.
