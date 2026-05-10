---
title: "QA Evidence Synthesis"
type: research
created: 2026-05-08
---

# QA Evidence Synthesis

## Summary

Post-plan debug evidence shows the simple lab shell is mostly stable, but there were real regressions in fake-DOM smoke compatibility and route-owned direct interactions. The plan must preserve the root-cause-first flow: reproduce, fix at source, verify by automated tests, then confirm with `ck:agent-browser`.

## Report-Derived Findings

| Area | Finding | Source Evidence |
|---|---|---|
| Lab shell DOM | `SimLabUI.createLab()` assumed `querySelector(':scope > .sim-header')` and `Element.remove` | Runtime fake-DOM smoke failed before fix |
| Ch2 trajectory preset | `ch2-1-1` preset buttons needed redraw/readout sync for `mode` | Agent-browser evidence: `Elip -> Tròn -> Parabol` |
| Ch2 graph cursor | `ch2-1-2` drag needed `xVal`, `vVal`, `aVal` sync | Readout changed after graph drag |
| Ch3 angular momentum | `ch3-5-3` drag needed radius, inertia, and `L` sync | `L` changed `2 -> 3.04` |
| Ch3 collision | `ch3-6-2` ball drag needed velocity/momentum recalculation | Momentum changed `11 -> 15` |
| Visual quality | Previous edge-ink issue on `ch2-7-1` must remain covered | `test:sim:visual-quality` passed 69 tests |
| Release gate | Current canonical proof is `npm run test:sim:release` | Browser suite `211 passed, 1 skipped` after hardening regressions |

## Constraints

- Do not reintroduce assessment panels, checkpoint UI, or `chlyt_sim_assessment_v2`.
- Do not add framework/build step; repo stays static/offline-first.
- Do not use visible generic drag handles/labels as a workaround.
- Keep fixes in existing files, no duplicate enhanced files.

## Recommended Test Ladder

1. Fast local syntax: `node --check` for touched JS.
2. Targeted smoke: runtime fake-DOM, manifest, quality.
3. Focused browser: route-specific direct drag and preset tests.
4. Visual quality: bounded ink and route-owned drag visuals.
5. Manual `ck:agent-browser`: screenshot evidence for known-risk routes.
6. Full release: `npm run test:sim:release`.

## Unresolved Questions

None.
