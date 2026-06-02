# Current Sim Quality Review

---
date: 2026-06-02
scope: 25/25 Sim2 routes
type: review
---

## Summary

Current Sim2 state is release-safe. No blocking visual/runtime issue found across 25 routes.

Evidence:

| Check | Result |
|---|---|
| `npm run test:sim:release` | PASS |
| `npm run test:sim:visual:capture` | PASS, 25/25 |
| `node tools/sim2-visual/build-contact-sheet.js` | PASS, 25 route, 58 images |
| Contact sheet | `plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals/contact-sheet.html` |

## Findings

| Severity | Route | Finding | Recommendation |
|---|---|---|---|
| Minor | `ch2-4-4` | Coriolis point is visually dense at end frame: `v_rel`, `a_cor`, point marker, and label cluster tightly. Still readable. | Offset labels more aggressively or add a local callout rule when vectors are short/close. |
| Minor | `ch3-6-2` | Collision end frame is correct and clean, but trail/impact cue are subtle. It may not strongly communicate before/after collision to casual learners. | Optional: stronger before/after trail legend or short impact state label. |
| Minor | `ch1-6-3` | Centroid route is visually clear, but large grey body dominates; pedagogical focus relies on the orange guide + C marker. | Optional: slightly emphasize removed area/negative-area concept in observe/readout. |
| Watch | All dynamic routes | Animation is verified by deterministic step shots, not continuous perceptual smoothness. | Keep step-shot capture; add representative motion GIF/video only if user wants teaching-demo polish. |
| Watch | All routes | No pixel baseline adopted. Good for avoiding brittle churn, weaker for visual regression automation. | Adopt selective screenshot baselines only for 5-8 representative routes, not all 25. |

## Route Coverage Snapshot

| Chapter | Routes | Assessment |
|---|---:|---|
| Ch1 statics | 10 | Clear, consistent, no render faults. Handles/guides improve affordance. |
| Ch2 kinematics | 7 | Strongest visual set; `ch2-3-2` now resolves prior gear/belt ambiguity. `ch2-4-4` has only density concern. |
| Ch3 dynamics | 8 | Release-safe. Collision/ODE/Newton routes show cause-effect well; impact/trail cue can be stronger if aiming premium pedagogy. |

## Quality Verdict

| Dimension | Verdict |
|---|---|
| Runtime stability | Strong |
| Physics/test coverage | Strong |
| Visual consistency | Strong |
| Label/readout clarity | Good |
| Interaction clarity | Good |
| Pedagogical depth | Good, with room for focused polish |
| Regression protection | Good functional; medium visual |

## Recommended Next Options

1. Do nothing for release. Current state passes gates and is visually coherent.
2. Small polish pass: fix `ch2-4-4` label density + strengthen `ch3-6-2` impact cue. Low risk.
3. Visual regression pass: add selective screenshot baselines for representative routes. Medium maintenance cost.

## Unresolved Questions

- Do we want a release-safe state only, or a premium teaching-demo polish pass?
- Should visual regression use selective baselines or keep current contact-sheet review workflow?
