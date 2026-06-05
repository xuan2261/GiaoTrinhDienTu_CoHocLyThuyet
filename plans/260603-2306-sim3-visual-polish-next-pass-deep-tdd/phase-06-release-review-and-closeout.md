---
phase: 6
title: "Release Review And Closeout"
status: completed
priority: P1
effort: "3h"
dependencies: [5]
---

# Phase 06: Release Review And Closeout

## Overview

Run final contract/release gates, review visual artifacts against the diagnostic checklist, and close the plan without broad documentation churn.

## Requirements

- Functional: all Sim3 and Sim2 release gates pass; final screenshots pass route-specific visual criteria.
- Non-functional: docs remain untouched unless public claims changed; no unreviewed generated artifacts outside plan scope.

## Architecture

Automated gates prove contracts; visual artifacts prove actual teaching quality. Code review must explicitly check no public contract changes, no lifecycle regression, and no visual clutter regressions.

## Related Code Files

- Read/modify if needed: `tests/sim3-pilot-fallback-dispose.spec.js`
- Read/modify if needed: `tools/sim3-visual/pilot-capture.spec.js`
- Create/update: `plans/260603-2306-sim3-visual-polish-next-pass-deep-tdd/reports/final-visual-review.md`
- Optional modify only if public claims change: `README.md`, `docs/design-guidelines.md`, `docs/system-architecture.md`

## Implementation Steps

1. Run `npm run test:sim3:pilot`.
2. Run `npm run test:sim3:visual:capture`.
3. Run `npm run test:sim:release`.
4. Run code review focused on:
   - acceptance criteria,
   - lifecycle/fallback/dispose,
   - no physics/public contract changes,
   - route visual hierarchy not overdecorated.
5. Compare final screenshots against Phase 01 diagnostics; `final-visual-review.md` must include route id, baseline image path, final image path, pass/fail, remaining issue severity, and notes.
6. Update plan statuses and final report.
7. Keep README/docs unchanged unless a public command, route list, or architecture contract actually changed; otherwise record “docs unchanged by design”.

## Success Criteria

- [x] `npm run test:sim3:pilot` passes.
- [x] `npm run test:sim3:visual:capture` passes.
- [x] `npm run test:sim:release` passes.
- [x] Code review has no high-confidence actionable bug.
- [x] Final visual review has baseline/final path, pass/fail, severity, and notes per route.
- [x] Final visual review has no unresolved P1 issue.
- [x] Public docs untouched unless architecture/design claims changed.

## Risk Assessment

Risk: closing with “tests pass” while visual quality still weak. Mitigation: final closeout requires screenshot review against route-specific checklist, not only automated tests.
