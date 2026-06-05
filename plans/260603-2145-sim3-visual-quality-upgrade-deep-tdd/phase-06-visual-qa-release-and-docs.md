---
phase: 6
title: "Visual QA Release And Docs"
status: completed
priority: P1
effort: "2h"
dependencies: [5]
---

# Phase 06: Visual QA Release And Docs

## Overview

Verify the upgraded Sim3 pilot with automated contract tests, fresh visual captures, manual checklist review, and minimal docs sync only if implementation changes public claims.

## Requirements

- Functional: all Sim3 and Sim2 release gates pass after visual changes.
- Non-functional: generated visual artifacts stay plan-scoped; no runtime build step is introduced.

## Architecture

Use the existing dev-only Playwright capture pipeline. Keep release validation separate from visual review: automated tests prove contracts; screenshots prove actual visual quality for human review.

## Related Code Files

- Modify: `tools/sim3-visual/pilot-capture.spec.js`
- Modify: `package.json` only if a new QA script is justified
- Modify: `README.md` only if Sim3 scope/commands change
- Modify: `docs/design-guidelines.md` only if new Sim3 visual language becomes canonical
- Modify: `docs/system-architecture.md` only if new core files are added
- Create: `plans/260603-2145-sim3-visual-quality-upgrade-deep-tdd/visuals/final/*.png`
- Create: `plans/260603-2145-sim3-visual-quality-upgrade-deep-tdd/reports/final-visual-review.md`

## Implementation Steps

1. Run `npm run test:sim3:pilot`.
2. Run `npm run test:sim3:visual:capture` and store final captures plan-scoped.
3. Run `npm run test:sim:release` to ensure Sim2/default runtime remains safe.
4. Compare final captures against Phase 01 checklist.
5. Document unresolved visual concerns in a plan-scoped final review.
6. Update README/docs only for factual architecture/design changes.

## Success Criteria

- [x] `npm run test:sim3:pilot` passes.
- [x] `npm run test:sim3:visual:capture` passes.
- [x] `npm run test:sim:release` passes.
- [x] Six final captures exist and are reviewed against checklist.
- [x] Final report states pass/fail per route and any remaining issues.
- [x] Docs are untouched unless required by changed public architecture.

## Risk Assessment

Risk: visual subjective review passes despite hidden lifecycle regressions. Mitigation: do not close phase unless both visual artifacts and automated release gates pass.
