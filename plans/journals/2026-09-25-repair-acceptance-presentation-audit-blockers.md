---
title: Repair acceptance presentation audit blockers
date: 2026-09-25
summary: "TDD repair of scientific, evidence, cross-output, and layout defects in the Council presentation package."
---

# Repair acceptance presentation audit blockers

## What happened
- Audit found a sign-inconsistent Coriolis scalar formula, handout truncation, conflicting moment-demo instructions, Slide 8 overlap/Web overflow, weak Council evidence, stale candidate wording, softened gate disclosure, omitted LMS derivatives, and a non-minute-ready final request.
- Regression tests were added first. They failed on the old behavior, including `|a_cor| = 2ωv_rel`, five-item handout truncation, missing quiz/outcome evidence, incomplete gate detail, and stale README candidate data.

## Root causes
- The runtime theory panel omitted `|v_rel|` while the actual calculation already used `Math.abs(radialSpeed)`.
- The Web/handout renderer applied global item slicing instead of preserving slide contracts.
- Deck, guides, and scientific report maintained the moment demo independently.
- Scientific-sample and Council-evidence layouts allocated insufficient text height.
- Release appendices summarized counts without carrying human-readable causes and derivative scope.

## Changes
- Corrected Coriolis magnitude notation and regenerated full/focused live captures.
- Removed handout truncation; added complete, compact Web/print rendering and a 16:9 overflow test.
- Unified the fixed-O moment demo: hold F=50 N, drag the application point to d⊥=4.00 m, read +200 N·m, compare the local PDF.
- Added visible outcome conditions/criteria, three representative quiz items, and a minute-ready Council statement.
- Enumerated 9 environment-stopped checks and 4 blocked independent checks; clarified missing Chromium is not failed physics; included bounded QTI 3/Common Cartridge evidence.
- Updated README to `2026.09.02-candidate`, repaired Slide 8/12 layouts, reduced speaker handoffs to three, and rebuilt PPTX/PDF/Web/handout/guides/scientific report.

## Verification
- `node --test tests/presentation-deck-contract.test.js`: 21/21 pass.
- `python -m unittest tests.test_scientific_report`: 16/16 pass.
- `node tests/sim2-ch2-physics.test.js`: 7/7 pass.
- Visual physics regression and simulation drift: pass, 25 Sim2 + 10 Sim3.
- Simulation evidence contracts: 13/13 pass.
- Acceptance report contract and scoped `git diff --check`: pass.
- PowerPoint export reviewed at 1600×900; Web Slide 8 and full handout were rendered through installed Edge.

## Limitation
- `python tools/validate_traceability.py --strict-claims` still reports `evidence record: stale gate or repository hash` because the full 24-gate historical evidence registry was not rerun. The presentation explicitly preserves the 11/9/4 snapshot and states that the nine recorded failures were environment stops. A full release-evidence refresh remains separate from this presentation repair.

## Next steps
- Before a release decision, install/provide the required Playwright browser and rerun all 24 canonical gates together, then regenerate the acceptance snapshot and presentation appendix.

> Historical work record — not durable authority. Prefer docs/specs/ADRs for current decisions.
