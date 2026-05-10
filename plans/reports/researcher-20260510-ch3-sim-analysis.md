# Technical Planning Report: Legacy Simulation Analysis (Chapter 3 - Dynamics)

**Date:** 2026-05-10
**Researcher:** Gemini CLI Agent
**Scope:** `backups/20260510-legacy-5-layer-sim-arch/sims/ch3`

## 1. Unique Route IDs
The legacy dynamics module for Chapter 3 consists of 18 unique routes:

| Route ID | Description |
|----------|-------------|
| `ch3-1-2` | Force to Acceleration (Newton II Concept) |
| `ch3-1-3` | Inertial Frame Lab (Pseudo-forces) |
| `ch3-2-1` | Inertia Law (F=0) |
| `ch3-2-2` | Newton Second Law (F=ma) |
| `ch3-2-3` | Newton Third Law (Interaction) |
| `ch3-2-5` | Dynamic FBD (Inertia force in FBD) |
| `ch3-3-1` | ODE Solver (Spring-mass RK4) |
| `ch3-3-2` | Coupled Spring-mass (Two blocks) |
| `ch3-4-1` | D'Alembert Equilibrium |
| `ch3-4-2` | Inverse Dynamics (Motion to Force) |
| `ch3-5-1` | Center of Mass Theorem (Multi-body) |
| `ch3-5-2` | Impulse-Momentum Theorem |
| `ch3-5-3` | Angular Momentum Lab |
| `ch3-5-4` | Work-Energy Theorem (Harmonic Oscillator) |
| `ch3-6-2` | 2D Collision (Billiard style) |
| `ch3-6-3` | 1D Collision Solver |
| `ch3-7-1` | Dynamics Theorem Selector (Exercise) |
| `ch3-7-2` | Dynamics Numeric Checker (Validation) |

## 2. Physics Requirements
The analysis of behavior files (`ch3-dynamics-newton-dalembert-behaviors.js`, `ch3-dynamics-theorem-collision-behaviors.js`) reveals several advanced physics requirements:

- **Springs (Linear):**
    - `ch3-3-1`: Basic spring-mass system using RK4 integration.
    - `ch3-3-2`: Coupled oscillators with three springs and two masses.
    - `ch3-5-4`: Energy analysis of a spring-mass system.
- **Distance Constraints:**
    - `ch3-5-3`: Fixed radius constraint for circular motion (Angular Momentum).
    - `ch3-3-2`: Variable distance spring forces between multiple bodies.
- **Collision Detection & Response:**
    - `ch3-6-2`: Full 2D vector collision response between two balls and four boundary walls.
    - `ch3-6-3`: 1D restitution-based collision (Coefficient of restitution $e$).
- **Inertial/Pseudo Forces:**
    - `ch3-1-3`: Simulating motion in non-inertial frames ($F^* = -ma_0$).
    - `ch3-4-1`: D'Alembert's principle application ($F + F^* = 0$).

## 3. Visualization Requirements (Chart.js / Plotting)
The legacy system uses a manual canvas-based plotting loop for trajectories. For the modernized architecture, the following variables are identified for Chart.js integration:

- **Kinematics Data:**
    - **Position ($x, y$):** Time-series for `ch3-3-1`, `ch3-3-2`, `ch3-5-4`.
    - **Velocity ($v$):** Time-series for `ch3-2-2`, `ch3-3-1`.
    - **Acceleration ($a$):** Vector/scalar display for all Newton Law routes.
- **Energy Data ($T, V, E$):**
    - **Kinetic Energy ($T$):** `ch3-3-1`, `ch3-5-4`.
    - **Potential Energy ($V$):** `ch3-3-1`, `ch3-5-4`.
    - **Total Mechanical Energy ($E$):** `ch3-5-4`.
- **Momentum Data ($p, L$):**
    - **Linear Momentum ($p$):** Bar graphs for Impulse-Momentum (`ch3-5-2`) and Collisions (`ch3-6-2`, `ch3-6-3`).
    - **Angular Momentum ($L$):** `ch3-5-3`.
- **Impulse ($J$):** Area under $F(t)$ curve for `ch3-5-2`.

## 4. Specialized Interactions
- **Parameter Sliders:** Primary interaction for all routes (Mass $m$, Force $F$, Stiffness $k$, Restitution $e$).
- **Multi-body Configuration:** `ch3-5-1` involves a collection of masses (implied drag/repositioning).
- **Manual Impulse:** `ch3-5-2` allows setting an impulse value $J$ affecting the state.
- **Theorem Selection:** `ch3-7-1` is a logic-based interaction where the user selects the correct theorem for a given problem.

## 5. Categorization
| Category | Routes | Characteristics |
|----------|--------|-----------------|
| **Mechanized** | `ch3-1-2` to `ch3-2-5`, `ch3-4-1`, `ch3-4-2`, `ch3-5-2` | Standard linear kinematics, constant acceleration, basic force application. |
| **High Complexity Bespoke** | `ch3-3-1`, `ch3-3-2`, `ch3-5-1`, `ch3-5-3`, `ch3-5-4`, `ch3-6-2`, `ch3-7-1`, `ch3-7-2` | Requires custom ODE solvers (RK4), multi-body logic, 2D vector collisions, or rotational dynamics. |

## Unresolved Questions
- Are there specific collision filtering groups needed for multi-body scenes beyond the simple two-body case in `ch3-6-2`?
- Should the "Numeric Checker" (`ch3-7-2`) be implemented as a separate validation layer or integrated into the specific theorem scenes?
