---
title: "Sim Correctness Overhaul — Phase 08 Partial Close"
date: 2026-05-19
session: cook-tdd
plan: plans/260518-2300-sim-correctness-realism-overhaul/
status: partial
---

# Sim Correctness Overhaul — Phase 08 Partial Close

## What Shipped This Session

- **Preset gallery (RC2)** for ch1-2-3, ch1-1-3, ch1-2-1.
  - Scenes declare `presets[]` arrays with id/label/state.
  - New `buildPresetGallery()` in `js/sim-professional-lab.js` renders a `.sim-preset-row` of `.sim-preset-button[data-preset]` buttons after the controls layer.
  - Click applies preset state via `behavior.updateStateFromSlider`, calls `syncControlDisplays`, redraws.
  - CSS: pill-shaped buttons in `.sim-preset-row` with focus-visible outline.
  - 22/22 sim-correctness-realism Node tests GREEN; 4/4 control-audit Playwright tests GREEN across 58 routes.
  - Commit: `e23f19b`.

- **Status doc updates**: Phase 08 marked Partial in the master plan; Phase 08 phase file documents both blockers in the Status section.

## What Was Tried And Deferred

### Spring autoplay for ch3-3-1

Tried scene `autoplay: true` flag plus a lab gate `if (scene.autoplay && !lab.prefersReducedMotion) lab.resume()` after `startBehaviorAnimation`. Two failures stacked:

1. **Test semantics mismatch.** `tests/simulation-interaction-engine.spec.js:168-178` clicks Play and asserts a snapshot change within 420ms. With autoplay, status reads "đang chạy" before the click, so the click pauses instead. Tried a coordinated patch (skip the assertion when `initialStatus` is already running).

2. **Anim-engine state-machine bug surfaces underneath.** Even with the test patch, after `resetRoute()` paused the autoplaying sim, the next Play click no longer produced a snapshot change within 420ms. Likely a race between `lab.reset()` clearing `lab.anim` particles and `lab.resume()` re-arming `onFrame`. Reverted; documented in `phase-08-rc2-rc6-animation-density-theme-parity.md`. Reapply requires anim-engine debugging beyond this session's scope.

### Trail buffer for ch2-1-1

Blocked by `state.trail` ban in `tests/simulation-runtime-regressions.test.js:69`. Coordinated test relaxation needed before the ring buffer + alpha decay implementation.

### Light theme parity (RC6)

Largest remaining Phase 08 item. Three palette sources (`SimCore.COLORS`, `primitives.palette`, `PARA_COLORS`) need merging with theme-aware variants and verification across 10 representative routes. Deferred to a follow-up plan.

## Lessons

- A coordinated test patch is sometimes the right answer (preset gallery's `force=130` nudge to `Đồng trục` to escape the initial-state-equality failure mode in control-audit). But when the patch only papers over a deeper bug (autoplay reset race), revert and document — don't ship the patch alone.
- Phase plans that stack visual-engine changes on top of a brittle anim engine should budget for engine debugging, not just feature work.

## Files Touched

- `js/sim-professional-lab.js` — added `buildPresetGallery()`, called after `buildControls()`
- `js/sims/ch1/ch1-force-law-scenes.js` — `presets[]` on 3 scenes; `Đồng trục` force nudged to 130
- `css/style.css` — `.sim-preset-row` + `.sim-preset-button` styling
- `tests/sim-correctness-realism.test.js` — 4 new RED→GREEN tests for preset gallery wiring
- `plans/260518-2300-sim-correctness-realism-overhaul/phase-08-rc2-rc6-animation-density-theme-parity.md` — Status block
- `plans/260518-2300-sim-correctness-realism-overhaul/simulation-correctness-realism-overhaul-master-plan.md` — Phase 08 marked Partial

## Open Questions

- Is the anim-engine reset→resume race already documented elsewhere, or is this its first surfacing?
- Should the `state.trail` ban be relaxed for trajectory-tracking routes specifically (ch2-1-1, ch2-2-2), or is the ban load-bearing for memory-leak prevention?
