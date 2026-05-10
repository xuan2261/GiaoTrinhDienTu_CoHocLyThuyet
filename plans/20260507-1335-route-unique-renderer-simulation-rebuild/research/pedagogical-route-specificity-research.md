---
title: "Pedagogical Route Specificity Research"
type: research
created: 2026-05-07
---

# Pedagogical Route Specificity Research

## Summary

Route-specific means the first visual, controls, motion, and assessment communicate the exact textbook concept for that route. For this plan, renderer uniqueness is mandatory for all 58 routes.

## Route-Specific Definition

| Dimension | Minimum standard |
|---|---|
| Visual model | Route-specific geometry, labels, and visual affordances |
| Physics state | Derived values match the route concept |
| Control intent | Sliders/buttons manipulate relevant parameters |
| Interaction | Drag target maps to the concept, not generic body/vector |
| Assessment | Checkpoints validate concept-specific success |
| Renderer | Dedicated function per route; no shared final renderer |

## Examples By Topic

| Route group | Distinct renderer expectation |
|---|---|
| Force vector anatomy | point of application, line of action, component triangle |
| Moment | pivot, perpendicular arm, sign of rotation |
| Couple | two equal opposite forces and free moment |
| Support reactions | each support type has different constraint symbol/reaction set |
| Spatial force | 3-axis projection and vector decomposition board |
| Friction | contact normal/tangent, cone, self-locking boundary |
| Centroid | composite geometry, hole/subtraction, centroid marker |
| Particle kinematics | path, position vector, velocity/acceleration decomposition |
| Rotation/transmission | disk/gear/belt geometry and angular relation |
| Relative motion | moving frame, transport/relative vectors, Coriolis cue |
| Plane motion | rigid body, instant center, velocity distribution |
| Dynamics laws | force-resultant, inertia, action/reaction, dynamic FBD differ visually |
| ODE | graph/integrator/system diagram, not generic force block |
| Theorems | CM/momentum/angular momentum/energy each gets distinct visual proof board |
| Collision | impact line, restitution, before/after vectors |
| Solvers/checkers | step-specific panels and answer validation visuals |

## Test Implication

Current “readout changed after drag” is too weak. Each group needs at least one positive browser test proving the core concept changes:

- moment: moving force line changes perpendicular arm and moment sign
- support: selected support changes reaction arrows
- friction: `mu` and slope cross hold/slip boundary
- IC: dragging IC changes velocity rays about IC
- collision: restitution changes after-impact velocity relation

## Unresolved Questions

None.

