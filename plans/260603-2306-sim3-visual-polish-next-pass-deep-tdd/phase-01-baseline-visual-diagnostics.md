---
phase: 1
title: "Baseline Visual Diagnostics"
status: completed
priority: P1
effort: "3h"
dependencies: []
---

# Phase 01: Baseline Visual Diagnostics

## Overview

Freeze the current six Sim3 screenshots and turn the visual critique into a route-by-route measurable checklist before source changes.

## Requirements

- Functional: copy current reviewed screenshots into this plan, score each route, and define exact visual targets.
- Non-functional: no runtime source changes in this phase; outputs stay plan-scoped.

## Architecture

Use existing visual artifacts as baseline evidence. The report becomes the acceptance source for later RED tests and manual visual review.

## Related Code Files

- Read: `plans/260603-2145-sim3-visual-quality-upgrade-deep-tdd/visuals/final/*.png`
- Read: `tools/sim3-visual/pilot-capture.spec.js`
- Read: `tests/sim3-pilot-fallback-dispose.spec.js`
- Create: `plans/260603-2306-sim3-visual-polish-next-pass-deep-tdd/visuals/baseline/*.png`
- Create: `plans/260603-2306-sim3-visual-polish-next-pass-deep-tdd/reports/visual-diagnostics.md`

## Implementation Steps

1. RED: define executable visual-contract tests to add in later phases before route implementation:
   - label overlap count must be `0` for `.sim3-label` bounding boxes within each route viewport;
   - each route debug payload must expose `visualMetrics.routeScoreTargets`;
   - vector scale metadata must stay within declared min/max ratios;
   - `ch3-6-2` capture state must not be distant `before`.
2. Copy current six final screenshots from the prior plan into this plan's `visuals/baseline/`.
3. Document route scores and exact issues:
   - `ch2-2-2`: disk dominance and edge crowding.
   - `ch2-3-2`: clutter and weak hierarchy.
   - `ch2-4-4`: sparse composition, clustered labels, weak Coriolis frame cue.
   - `ch2-5-3`: oversized green vector and ambiguous gray arrows.
   - `ch3-5-3`: flat materials and rough radius label.
   - `ch3-6-2`: capture too pre-impact.
4. Define measurable targets per route: safe margins (`>=24px`, target `>=32px` where practical), vector scale ratios, label overlap count `0`, material role metadata, dynamic capture phase.
5. Confirm no implementation files changed.

## Success Criteria

- [x] Six baseline screenshots are copied plan-scoped.
- [x] `visual-diagnostics.md` lists pass/fail criteria per route.
- [x] Each issue has a concrete target suitable for tests or visual review.
- [x] Planned RED assertions are listed before implementation begins.
- [x] No runtime source file changed in this phase.

## Risk Assessment

Risk: subjective wording like “make better” sneaks back in. Mitigation: every finding must include a visual target and evidence screenshot.
