---
title: "Batch Simulation Conversion V2"
description: "Phased migration of 58 mechanical simulations to the V2 architecture (Matter.js + SVG/DOM + SimUI)."
status: completed
priority: P1
effort: "10d"
branch: master
tags: [simulation, migration, batch, matterjs]
created: 2026-05-10
blockedBy: [20260510-simulation-rewrite-v2]
---

# Batch Simulation Conversion V2

## Overview
This plan details the systematic migration of 58 existing simulations from the legacy 5-layer architecture to the verified V2 architecture. We will utilize a "V2 Primitive Factory" to accelerate development and ensure visual consistency across Chapter 1 (Statics), Chapter 2 (Kinematics), and Chapter 3 (Dynamics).

## Implementation Phases
- Status: completed | [Phase 01: Foundation Enhancement](./phase-01-foundation.md)
- Status: completed | [Phase 02: Statics (Ch1 - 25 Routes)](./phase-02-statics.md)
- Status: completed | [Phase 03: Kinematics (Ch2 - 15 Routes)](./phase-03-kinematics.md)
- Status: completed | [Phase 04: Dynamics (Ch3 - 18 Routes)](./phase-04-dynamics.md)
- Status: completed | [Phase 05: Mass QA & Optimization](./phase-05-qa.md)

## Success Criteria
- [x] All 80 simulation routes (80 unique IDs across 58 base pages) ported and functional in V2.
- [x] 100% feature parity with legacy versions (forces, graphs, interactions).
- [x] Improved performance (locked 60fps) and mobile responsiveness.
- [x] Significant reduction in per-simulation code complexity via reusable primitives.
