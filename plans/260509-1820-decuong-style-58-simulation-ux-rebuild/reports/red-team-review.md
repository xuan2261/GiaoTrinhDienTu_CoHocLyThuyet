---
title: "Red Team Review"
status: complete
created: 2026-05-09
---

# Red Team Review

## Critical Findings

| Risk | Severity | Why It Can Fail | Mitigation |
|---|---:|---|---|
| Looks good but physics still generic | High | Shell polish can hide weak route behavior | Every route group phase must include numeric/semantic checks |
| 58-route manual polish explodes scope | High | Bespoke route changes can become unbounded | Work by topic families; shared primitives; route-specific only where learning differs |
| Light theme becomes afterthought | High | DeCuong reference is dark-only | Phase 02 must test dark and light before route work |
| Existing QA still skips too much | Medium | Browser suite currently has many skipped route-wide cases | Add targeted route-group assertions, not only screenshot smoke |
| Visual effects hurt low-end laptops | Medium | Glow/shadows on 58 canvas routes can degrade FPS | Use restrained effects, measure representative animation routes |
| Direct drag breaks precision tasks | Medium | Large handles can interfere with formula reading | Use hit radius separate from visual radius; snap/guide only where useful |
| Route files exceed 220 lines | Medium | More polish can bloat renderers | Split by topic group before adding dense code |
| Docs drift again | Medium | Simulation docs are living and already changed often | Phase 10 updates docs and changelog after QA, not before |
| Overfitting to DeCuong samples | Medium | Only 3 sample simulations exist there | Extract UX pattern, not code or exact layout |

## Forced Decisions

- Do not start Ch1/Ch2/Ch3 route polish until Phase 02 light/dark shell passes.
- Do not accept route group phase if drag only changes cosmetic coordinates.
- Do not introduce new framework or bundler for visual polish.
- Do not add assessment/checkpoints back.
- Do not change DOCX-generated fragments for simulation UX; runtime mounts should own lab UI.

## Red-Team Test Additions

| Failure Mode | Test Gate |
|---|---|
| Dark-only regression | Playwright toggles `data-theme` and checks contrast/readability |
| Generic readout regression | Browser test rejects detached default coordinate/readout on route groups |
| No-op drag | Representative route drag must change semantic readout and canvas hash |
| Clipped visuals | `test:sim:visual-quality` edge ink and bbox thresholds |
| Registry overwrite | Existing visual strict warning test remains mandatory |
| File-size creep | `audit_simulation_quality.py --all --max-js-lines 220` |

## Conclusion

Plan is feasible only if it treats visual polish and route physics as one deliverable. Shell-only work is not enough. Full rewrite is not justified.

## Unresolved Questions

Không có.
