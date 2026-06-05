---
title: "Red-Team Review"
status: completed
created: 2026-06-03
---

# Red-Team Review

## Summary

Plan was reviewed for TDD gaps, subjective acceptance criteria, capture brittleness, and phase overlap.

## Findings Applied

| Finding | Resolution |
|---|---|
| Phase 01 called a checklist “RED” but did not define executable tests. | Phase 01 now lists concrete visual-contract assertions to add before implementation. |
| Visual terms were partly subjective. | Plan now requires thresholds: label overlap `0`, safe margins, vector ratios, material role metadata, and capture phase. |
| Capture output path risked pointing to prior plan. | Phase 05 explicitly requires `OUT_DIR` to this plan’s `visuals/final/`. |
| Shared helper scope could overgrow. | Phase 02 requires two planned consumers or deferral for each helper. |
| Phase 03/04 ownership overlapped. | Phase 03 now owns geometry/camera/labels; Phase 04 owns material/opacity/color/depth. |
| `ch3-6-2` capture could be brittle. | Phase 05 requires semantic collision capture debug state if current state is insufficient. |

## Unresolved Issues

None.
