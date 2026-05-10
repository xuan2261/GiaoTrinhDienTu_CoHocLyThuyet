---
phase: 5
title: "Mass QA & Optimization"
status: completed
priority: P2
effort: "1d"
dependencies: [1, 2, 3, 4]
---

# Phase 05: Mass QA & Optimization

## Overview
Perform a comprehensive audit of allported simulations. Fix visual glitches, optimize performance on mobile, and ensure all memory is correctly disposed of during navigation.

## Requirements
- Functional: 0 broken routes. 0 memory leaks. 0 SVG marker collisions.
- Non-functional: Target 60fps on mobile. Bundle size < 500KB total for logic.

## Implementation Steps
1. Create `tests/mass-conversion-audit.spec.js`: Check for JS crashes and 404s for all routes.
2. Create `tools/audit_v2_disposal.js`: Automate 100 random navigation cycles; verify heap size returns to baseline.
3. Performance profiling: Measure CPU/GPU load on a simulated mobile device (throttled).
4. Visual Polish: Fix KaTeX label offsets and arrow marker sizes across the suite.
5. Final Documentation: Update `project-changelog.md` and archive the old 5-layer code permanently.

## Todo List
- [x] Create automated audit test (Playwright).
- [x] Create memory leak profiling tool.
- [x] Verify all 80 routes load without console errors.
- [x] Fix visual regressions in ported modules.

## Success Criteria
- [x] 100% of 80 simulation routes (standalone modules) ported and verified.
- [x] Heap size delta < 5MB after 50 route changes.
- [x] All SVG markers are uniquely scoped per route.

## Risk Assessment
- Risk: Legacy content had specific visual quirks (e.g., custom colors) that were missed.
- Mitigation: Review legacy renderer source code during conversion of each route.

