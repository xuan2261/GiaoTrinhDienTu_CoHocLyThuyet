# Simulation Analysis Report: Chapter 1 & 2 (Legacy 5-Layer Arch)

**Researcher:** Gemini CLI
**Date:** 2026-05-10
**Scope:** Statics (Ch1) and Kinematics (Ch2)

## 1. Unique Route IDs & Objectives

### Chapter 1: Statics (25 Routes)
| Route ID | Objective | Legacy Renderer Name |
|----------|-----------|----------------------|
| ch1-1-3 | Force Vector Anatomy | renderCh113ForceVectorAnatomy |
| ch1-1-4 | Moment Arm | renderCh114MomentArm |
| ch1-1-5 | Force System Reducer 2D | renderCh115ForceSystemReducer |
| ch1-1-6 | Couple Moment | renderCh116CoupleFreeVector |
| ch1-1-8 | DOF/Constraint Explorer | renderCh118ConstraintRelease |
| ch1-2-1 | Two-Force Equilibrium | renderCh121TwoForceBody |
| ch1-2-3 | Parallelogram Law | renderCh123ParallelogramLaw |
| ch1-2-6 | FBD Builder | renderCh126FbdBuilder |
| ch1-3-1 | Smooth Support Reaction | renderCh131SmoothSupportNormal |
| ch1-3-2 | Cable Tension | renderCh132CableTension |
| ch1-3-3 | Support Component Types | renderCh133HingeReactionComponents |
| ch1-3-4 | Roller Support | renderCh134RollerPinBuilder |
| ch1-3-6 | Fixed Support (Ngàm) | renderCh136FixedSupport |
| ch1-3-7 | Two-Force Member | renderCh137TwoForceMember |
| ch1-4-1 | Spatial (3D) Reducer | renderCh141SpatialResultant |
| ch1-4-2 | Spatial Moment | renderCh142SpatialMomentProjection |
| ch1-4-4 | Spatial Equilibrium | renderCh144SpatialEquilibriumBoard |
| ch1-5-1 | Friction Force Decomposition | renderCh151ContactForceDecomposition |
| ch1-5-2 | Friction Type Tabs | renderCh152FrictionModeTabs |
| ch1-5-3 | Friction Cone/Incline | renderCh153FrictionConeIncline |
| ch1-5-4 | Self-Locking (Wedge) | renderCh154SelfLockingWedge |
| ch1-6-2 | Centroid (Composite) | renderCh162CentroidComposite |
| ch1-6-3 | Centroid (Hole/Negative) | renderCh163CentroidHoleShift |
| ch1-7-1 | Guided Statics Solver | renderCh171GuidedEquilibriumSolver |
| ch1-7-2 | Numeric Checker | renderCh172StaticsNumericChecker |

### Chapter 2: Kinematics (15 Routes)
| Route ID | Objective | Legacy Renderer Name |
|----------|-----------|----------------------|
| ch2-1-1 | Particle Trajectory | renderCh211Trajectory |
| ch2-1-2 | Kinematics Graphs (x,v,a) | renderCh212MotionGraphs |
| ch2-1-3 | Natural Coordinates | renderCh213NaturalCoords |
| ch2-1-4 | Motion Preset Gallery | renderCh214MotionPresets |
| ch2-2-2 | Fixed Axis Rotation | renderCh222FixedAxisRotation |
| ch2-3-2 | Gear/Belt Transmission | renderCh232GearBeltTransmission |
| ch2-4-1 | Velocity Composition | renderCh241VelocityComposition |
| ch2-4-2 | Motion Definition Toggle | renderCh242AbsoluteRelativeTransport |
| ch2-4-3 | Velocity Triangle | renderCh243VelocityTriangle |
| ch2-4-4 | Coriolis Acceleration | renderCh244CoriolisAcceleration |
| ch2-5-1 | Plane Motion (General) | renderCh251PlaneTranslationRotation |
| ch2-5-2 | Instant Center Finder | renderCh252InstantCenter |
| ch2-5-3 | Velocity Distribution | renderCh253VelocityDistribution |
| ch2-7-1 | Kinematics Guided Solver | renderCh271KinematicsGuidedChecker |
| ch2-7-2 | Kinematics Numeric Checker | renderCh272KinematicsNumericVerifier |

---

## 2. Visual Primitive Requirements

### Foundation (Shared)
- **Vectors:** `neonArrow` (Primary), `arrow` (Secondary).
- **Labels:** `domMath` (KaTeX for formulas), `label` (Text).
- **UI:** `frame`, `panel` (Groupings).
- **Markers:** `realisticPoint`, `point`.

### Statics-Specific
- **Physical Objects:** `realisticBody`, `realisticBeam`, `realisticGround`.
- **Supports:** `supportTriangle`.
- **Geometry:** `dashedLine` (Line of action), `angleArc` (Angles/Moments), `dimension` (Distances).
- **Advanced:** `cable` (Bezier/Quadratic), `vectorTriangle` (Shaded force triangles), `incline` (Sloped planes).

### Kinematics-Specific
- **Trails:** `trail` (Array-based, with alpha fading for motion history).
- **Paths:** `ctx.ellipse`, `ctx.arc`, `Parabola` (Custom parametric path rendering).
- **Graphs:** `graphPanel` (Requires Mini-Grid, Axes, and high-frequency curve plotting).
- **Sync:** Time cursor synchronized across multiple graph panels.

---

## 3. Input Control Requirements

- **Sliders (85%):**
  - Standard magnitudes: Force (N), Omega (rad/s), Alpha (rad/s²), Mass (kg).
  - Geometric parameters: Angles (deg), Lengths (px), Bán kính cong (rho).
- **Mode Buttons:**
  - Trajectory types (Tròn, Elip, Parabol).
  - Friction modes (Tĩnh, Trượt, Lăn).
  - Coordinate system toggle (Tuyệt đối vs Tương đối).
- **Interaction Schemas:**
  - `direct-manipulation`: Dragging force tips or point positions.
  - `drag-handle`: Specialized handles for moment arms or IC location.

---

## 4. Mechanized vs. Bespoke Strategy

### Mechanized (Template Candidate)
*Goal: Use standard layouts with data-driven primitives.*
- **Vector Analysis (Ch1-1):** Anatomy, Reducers.
- **Support Reactions (Ch1-3):** All single-reaction types.
- **Simple Motion (Ch2-1):** Path follow + Vector display.
- **Rotation (Ch2-2, 2-3):** Constant/Linear omega transmission.

### Bespoke (Custom Logic Required)
*Goal: Specialized component per route.*
- **FBD Builder (ch1-2-6):** Interactive "release" state machine.
- **Friction (ch1-5-3, 1-5-4):** Requires complex `hold` vs `slip` boundary logic.
- **Spatial (ch1-4):** 3D-to-2D projection shim for "fake" 3D look.
- **Graphs (ch2-1-2):** Real-time plot buffers and multi-axis sync.
- **Instant Center (ch2-5-2):** Dynamic intersection of normal vectors.
- **Guided Solvers (ch1-7, ch2-7):** Complex UI overlays and step validation logic.

## Unresolved Questions
1. How deep should the "Trail" history go in Kinematics? Legacy used ~20 samples.
2. Are the 3D routes (Ch1-4) intended to stay as static 2D projections or move to a true Three.js renderer?
