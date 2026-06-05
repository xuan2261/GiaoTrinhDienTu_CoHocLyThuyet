---
phase: 1
title: "Research And Acceptance Baseline"
status: completed
priority: P1
effort: "4h"
dependencies: []
---

# Phase 01: Research And Acceptance Baseline

## Overview

Freeze the current six-scene visual baseline and convert the manual review findings into a concrete acceptance checklist before any code changes.

## Requirements

- Functional: capture all six current Sim3 screenshots, inspect route state/debug data, and define per-route acceptance criteria.
- Non-functional: no source changes in this phase; keep outputs plan-scoped.

## Architecture

Use existing `tools/sim3-visual/pilot-capture.spec.js` to generate evidence. The acceptance checklist becomes the reference for subsequent TDD and manual review.

## Related Code Files

- Read: `tools/sim3-visual/pilot-capture.spec.js`
- Read: `tests/sim3-pilot-fallback-dispose.spec.js`
- Read: `js/sim3/core/*`
- Read: `js/sim3/sims/*-3d.js`
- Create: `plans/260603-2145-sim3-visual-quality-upgrade-deep-tdd/reports/visual-acceptance-checklist.md`
- Create: `plans/260603-2145-sim3-visual-quality-upgrade-deep-tdd/visuals/baseline/*.png`

## Implementation Steps

1. Run `npm run test:sim3:visual:capture`.
2. Copy or regenerate baseline captures into this plan's `visuals/baseline/`.
3. Create acceptance checklist grouped by shared criteria and route-specific criteria.
4. Mark hard blockers versus nice-to-have polish.
5. Confirm no implementation files changed.

## Success Criteria

- [x] Six baseline captures exist for review.
- [x] Checklist covers camera, lighting/material, labels, route-specific cues, motion/phase clarity, and dispose/fallback safety.
- [x] Each current issue has a measurable acceptance target.
- [x] No source code changed in this phase.

## Risk Assessment

Risk: subjective visual targets become vague. Mitigation: require screenshot evidence and route-specific checklist items instead of generic “make better” language.
