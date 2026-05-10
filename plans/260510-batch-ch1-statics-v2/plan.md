---
title: "Batch Port Chapter 1 Statics Simulations to V2"
description: "Porting Group 2 (7 simulations) from legacy Canvas to V2 (SVG + Matter.js + SimUI)."
status: completed
priority: P1
effort: 7h
branch: main
tags: [statics, simulation, v2, porting]
created: 2026-05-10
---

# Overview Plan

This plan covers porting 7 simulations from Chapter 1 (Statics) to the V2 architecture.

## Phases
1. **Phase 1: Moment & Couples (4 routes)** - `ch1-2-1` to `ch1-2-4` [DONE]
2. **Phase 2: Equilibrium & FBD (3 routes)** - `ch1-3-1` to `ch1-3-3` [DONE]

## Status
- `ch1-2-1`: Completed
- `ch1-2-2`: Completed
- `ch1-2-3`: Completed
- `ch1-2-4`: Completed
- `ch1-3-1`: Completed
- `ch1-3-2`: Completed
- `ch1-3-3`: Completed

## SUCCESS: Extended Content Verification
- Several "extra" files with suffix `b` (e.g., `ch1-1-3b.js`, `ch1-2-3b.js`) were found in `js/routes/ch1/`.
- Verification confirms these are NOT registered in `PAGE_MAP` or `SIM_ROUTE_ALIAS_MAP`.
- They function as "extended content" or alternative variants, registering themselves in `SIM_MAP` and `RouteRegistry` but not currently mapped to any main navigation node.
- They are safe to keep as auxiliary/experimental content.

## Success Criteria
- Separate files in `js/routes/ch1/`.
- Use `SimV2Foundation`, `SimV2Primitives`, `SimUI`, and `SimulationEngine`.
- Follow `dispose` pattern.
- Layout: Left (SVG), Right (Controls).
- Mobile-responsive (flexbox layout).
