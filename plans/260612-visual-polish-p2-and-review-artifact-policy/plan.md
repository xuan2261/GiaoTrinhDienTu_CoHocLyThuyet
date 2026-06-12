---
title: "P2 visual polish + review artifact policy"
status: complete
created: 2026-06-12
mode: tdd
source: plans/reports/visual-quality-review-260611-1042-35-sim-interactive-report.md
---

# Plan — P2 visual polish + review artifact policy

## Context

Latest interactive review found 0 P1 issue and 3 P2 visual findings:
`ch3-2-3` Sim2 lower whitespace, `ch3-5-4` Sim2 lower whitespace, and `ch2-4-4` Sim3 peach-sweep/crop artifact.
PNG review artifacts are ignored by git, so future reviews need better manifest/contact-sheet traceability without adding Git LFS.

## Requirements

1. Keep physics, formulas, readouts, mount contract, and route IDs unchanged.
2. Improve only low-risk visual polish where tests can protect no-clip behavior.
3. Do not force a `ch3-2-3` layout change if existing no-clip evidence shows the whitespace is label clearance.
4. Make visual review artifact policy explicit: PNG remains ignored; manifest/contact-sheet/report must point to exact artifact folders; release evidence can be zipped outside git.
5. Clarify the 2026-06-11 report/plan discrepancy: final execution graded 35 fresh because historical PNG was not versioned.

## Acceptance Criteria

- `npm run test:sim:visual:unit` passes.
- Focused mount/visual tests for touched routes pass.
- `npm run test:sim3:visual:capture` passes if Sim3 visual code changes.
- `npm run test:sim:release` passes after code changes.
- Docs/report notes state the artifact policy and the 35-fresh rationale clearly.

## Scope Boundary

Out of scope: physics changes, 2D/3D default policy, new simulation routes, Git LFS, broad redesign, or full baseline refresh.

## Touchpoints

- Sim2: `js/sim2/sims/ch3/ch3-5-4.js`; `ch3-2-3` read/test only unless safe.
- Sim3: `js/sim3/sims/ch2-4-4-3d.js`.
- Tests: existing focused Sim2/Sim3 tests where possible; add narrow assertions only when needed.
- Docs/reports: `docs/project-changelog.md`, `docs/design-guidelines.md`, current visual review report/plan notes.

## Steps

1. Read source and existing tests for the 3 routes.
2. TDD: add/adjust focused guard for the intended visual polish, especially preventing label clip.
3. Implement minimal visual changes.
4. Run targeted tests, then release gate.
5. Update docs/report and journal.

## Risks

- `ch3-2-3` whitespace may be required for labels; forcing a tighter viewport can regress no-clip.
- Sim3 crop artifact may be camera/material dependent; avoid large camera rewrite.
- Visual PNG evidence is ignored; rely on manifest/contact-sheet and fresh capture for verification.

## Current Decision

Treat `ch3-5-4` and `ch2-4-4` as fix candidates. Treat `ch3-2-3` as validate-first; document as non-blocking if tests confirm current spacing is intentional label clearance.

## Completion Notes

- `ch2-4-4` Sim3 sector cue reduced from strong peach sweep to subtle-contained sector (`opacity 0.28`, outer radius `0.86`).
- `ch3-5-4` Sim2 kept at existing `minY:-0.4`; regression/no-clip tests confirm the prior fix still holds.
- `ch3-2-3` Sim2 kept unchanged; no-clip guard confirms current lower clearance protects A/B labels at F max.
- Docs/report updated with artifact policy and final 35-fresh rationale.

## Verification

- `npm run test:sim:visual:unit`: PASS.
- `npm run test:sim3:visual:capture`: PASS.
- `npx playwright test tests/sim3-pilot-fallback-dispose.spec.js`: PASS.
- `node tests/sim2-visual-physics-regression.test.js`: PASS.
- Focused `sim2-ch3-mount` no-clip tests for `ch3-5-4` and `ch3-2-3`: PASS.
- `npm run test:sim:release`: PASS.

## Unresolved Questions

- None.
