---
phase: 2
title: "Statics (Ch1 - 25 Routes)"
status: completed
priority: P1
effort: "3d"
dependencies: [1]
---

# Phase 02: Statics (Ch1 - 25 Routes)

## Overview
Port all Statics simulations from Chapter 1 as standalone modules. Each route will be a self-contained file in `js/routes/ch1/` to ensure maintainability and follow the project's <200 LOC per file rule.

## Requirements
- Functional: 100% parity with legacy Ch1 routes. Accurate force addition and static equilibrium visualization.
- Non-functional: Clean modules with clear `init` and `dispose` exports.

## Architecture
- **Individual Modules**: One file per route ID (e.g., `js/routes/ch1/ch1-1-3.js`).
- **Dynamic Mounting**: `loader.js` will load the specific script for the current page only.

## Related Code Files
- Create: `js/routes/ch1/*.js` (25 files total)
- Modify: `js/loader.js` (Update registry to map page IDs to route file paths)

## Implementation Steps
1. Create directory structure `js/routes/ch1/`.
2. Port **Simple Vectors** (ch1-1-x).
3. Port **Equilibrium Laws** (ch1-2-x).
4. Port **Support Reactions** (ch1-3-x).
5. Port **Spatial Forces** (ch1-4-x).
6. Port **Friction & Centroids** (ch1-5-x, ch1-6-x).
7. Verify each route correctly utilizes `SimV2Foundation` for markers and arrows.

## Todo List
- [x] Create directory structure `js/routes/ch1/`.
- [x] Port Simple Vectors (ch1-1-x).
- [x] Port Equilibrium Laws (ch1-2-x).
- [x] Port Support Reactions (ch1-3-x).
- [x] Port Spatial Forces (ch1-4-x).
- [x] Port Friction & Centroids (ch1-5-x, ch1-6-x).
- [x] Verify each route correctly utilizes `SimV2Foundation`.

## Success Criteria
- [x] No single simulation file exceeds 200 lines of code.
- [x] Force vectors update in real-time as sliders move.
- [x] 100% of Ch1 routes are accessible via the sidebar and functional.
