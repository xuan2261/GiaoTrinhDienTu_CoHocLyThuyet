---
phase: 6
title: "DROPPED — Autoplay Preview-Pause Defaults"
status: dropped
priority: P1
effort: "0"
dependencies: []
---

# Phase 6: DROPPED per F11 Resolution

> 🚫 **DROPPED 2026-05-21** — F11 resolution accepted by user.
>
> **Why dropped:** This phase proposed default-on autoplay (`preview-pause: 5`) for the 5 newly-animated routes from Phase 02 + Phase 05. The verification report `qa-verification/qa-browser-chromium-deep-animation-evolution-verification-58-simulation-routes.md §8` does **not** request autoplay-on-mount; the affordance was planner-invented UX without content-owner validation. F11 (scope-complexity-critic finding, severity High) flagged the risk: shipping default autoplay across an entire chapter set is a pedagogy decision the content owner has to make per route, not a planner default.
>
> **Practical concerns that compounded the F11 scope concern:**
> - **F6** — the original RED test (`uniqueFrames ≥ 2 within [0..0.5s] without clicking Play`) was mathematically impossible: `pauseAfterFrames(lab, 5)` finishes in ~80 ms, the spec settled 200 ms before sampling, so both samples landed on the post-pause frozen frame → `uniqueFrames = 1`. Fixable by sampling during the preview window, but only worth fixing if the phase ships.
> - **F7** — `preview-pause: 5` produces ~0.28 px translation for ch3-2-1 with default sliders (`0.5·10·0.083²·8 ≈ 0.28 px`). Sub-pixel — not learner-perceptible. Per-route frame tuning was required just to make motion visible. Effort grew while value stayed unclear.
>
> **What replaces it:** Nothing in this plan. The 5 animated routes still mount with their existing affordance — the user clicks ▶ Chạy and the canvas evolves. If the content owner later decides autoplay-on-mount is desired, it can be added per-route via the existing `autoplayFor(routeId)` allowlist in `js/sims/ch3/ch3-dynamics-all-18-scenes.js:198-203` without a dedicated phase.
>
> **Cross-plan effects of dropping this phase:**
> - `plan.md` Sprint 2 collapses to Phase 5 only.
> - `plan.md` success criteria line for "preview window produces ≥10 px translation" removed.
> - No dependency knock-on: Phases 7/8/9/10 only depended on Phases 4/5/8 — none depended on Phase 6.

## Status

- **Pre-cook decision:** dropped (F11 resolution).
- **No implementation will be performed for this phase.**
- **No tests, fixtures, or baseline updates from this phase.**

## File retained for traceability

This file is kept (rather than deleted) so red-team report cross-references and the `## Phases` table in `plan.md` remain stable. If the content owner later requests autoplay-on-mount, do **not** revive this file — open a fresh phase with new numbering and explicit content-owner authorization captured in the banner.
