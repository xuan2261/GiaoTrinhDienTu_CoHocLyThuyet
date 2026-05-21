---
title: "Phase 09 — Concept-Diagram UX Cleanup + Dynamics Animation Parity + Regression Harness"
description: "TDD-driven cleanup of 13 dynamics routes that have a Play button but no canvas evolution. Fix ch3-2-1 inertia, suppress Play for 7 concept-only routes (ch3-7-2 reclassified to animated), animate 5 should-animate candidates, lock the gap with a per-second canvas evolution harness wired into npm test:sim:browser."
status: complete
priority: P1
branch: "master"
tags: [simulation, ux, animation, regression-harness, tdd, phase-09]
blockedBy: []
blocks: []
created: "2026-05-21T08:32:47.927Z"
createdBy: "ck:plan"
source: skill
---

# Phase 09 — Concept-Diagram UX Cleanup + Dynamics Animation Parity + Regression Harness

## Overview

13/33 dynamic routes have a working Play button but the canvas does **not** evolve between t=0 and t=3s — engine ticks `state._t` correctly, readouts update, but renderers ignore `_t` and only paint scalar state. Verification report (2026-05-21, `qa-verification/qa-browser-chromium-deep-animation-evolution-verification-58-simulation-routes.md`) initially split these into:

- **8 concept-diagram routes** (FBD, theorem selector, residual checker, force-pair, exercise selector) where canvas-static is *intentional* but Play button misleads learners. **Post-red-team:** ch3-7-2 reclassified to animated (its `onTick_ch372` writes time-oscillating residuals), so this phase handles 7 concept routes; ch3-7-2 ships in the animated set.
- **5 should-animate candidates** (ch3-2-1 inertia, ch3-1-2 force-acceleration, ch3-5-1 center of mass, ch3-5-2 impulse-momentum, ch2-5-1 instant-center) where physics implies visible motion but renderer is missing the `state._t` term. With ch3-7-2 reclassified, the animated work in this plan totals 6 routes (ch3-2-1 in Phase 02, the other 5 in Phase 05).

Phase 09 (a) fixes ch3-2-1 because `F=0 → v=const` with a stationary body actively contradicts pedagogy, (b) suppresses Play for 7 concept-only routes via a `static: true` scene flag (3 of those carry `tickWithoutButton: true` so the engine still ticks for `_t`-derived readouts; 1 is dropped from the `appendTime` policy; ch3-7-2 reclassified to animated), (c) animates the 5 remaining candidates plus ch3-7-2 in Phase 05, (d) locks the regression with an engine-time-sampled canvas evolution harness wired into `npm run test:sim:browser`.

Plan is TDD-first per `--tdd`: every phase opens with a failing test that pins the user-visible defect, then a minimal change to green, then refactor + a11y/visual checks.

## Context Links

- Verification report: `qa-verification/qa-browser-chromium-deep-animation-evolution-verification-58-simulation-routes.md`
- Sweep data: `qa-verification/animation-sweep/per-route-animation-sweep-results.json`
- Sweep driver (reusable harness skeleton): `qa-verification/animation-sweep/full-58-route-animation-sweep-browser-eval-driver.js`
- Code-standards (will be updated phase 08): `docs/code-standards.md`
- Codebase summary: `docs/codebase-summary.md`
- Roadmap: `docs/project-roadmap.md`, changelog: `docs/project-changelog.md`
- Latest journal: `docs/journals/` (entry to be added phase 08)

## Key Insights

- Engine + state machine are **healthy** across 58 routes — 0 console errors, readouts tick, button states correct. Only renderer-side `state._t` references are missing on the 13 flagged routes.
- The Play button is wired in `js/sim-professional-lab.js:1656-1661`, gated only on `typeof behavior.onTick === 'function'`. Adding a `scene.static === true` short-circuit before that line is a one-line UX fix that keeps Reset functional.
- The Ch1 baseline (25 routes) is **correct by spec** — statics has no temporal dimension. Harness must allowlist this; never flag as "missing animation".
- Renderer fix patterns are uniform: read `state._t`, derive position/angle/length, fall through to existing draw primitives. ~5–15 lines per renderer; no behavior contract change needed.
- Per-route canvas hash via 16×16 grid + full-image digest fallback already proven by the QA driver — phase 04 lifts that into `tests/` and pins a baseline JSON.

## Phases

| Phase | Name | Priority | Sprint | Status |
|-------|------|----------|--------|--------|
| 1 | [Foundation TDD Setup](./phase-01-foundation-tdd-setup.md) | P0 | 1 | Complete |
| 2 | [P0 Fix ch3-2-1 Inertia Law Renderer](./phase-02-p0-fix-ch3-2-1-inertia-law-renderer.md) | P0 | 1 | Complete |
| 3 | [P0 Static Flag For Concept-Only Routes](./phase-03-p0-static-flag-for-concept-only-routes.md) | P0 | 1 | Complete |
| 4 | [P0 Regression Harness CI Hook](./phase-04-p0-regression-harness-ci-hook.md) | P0 | 1 | Complete |
| 5 | [P1 Animate Five Candidate Renderers](./phase-05-p1-animate-four-candidate-renderers.md) | P1 | 2 | Complete |
| 6 | [DROPPED — Autoplay Preview-Pause Defaults](./phase-06-p1-autoplay-preview-pause-defaults.md) | — | — | Dropped (F11) |
| 7 | [P2 Investigate ch2-5-2 ch2-5-3 Motion Intent](./phase-07-p2-investigate-ch2-5-2-ch2-5-3-motion-intent.md) | P2 | 3 | Complete |
| 8 | [P2 Documentation Sync](./phase-08-p2-documentation-sync.md) | P2 | 3 | Complete |
| 9 | [Backlog Visual Baseline Pixel-Diff Fallback](./phase-09-backlog-visual-baseline-pixelmatch.md) | P3 | Backlog | Complete |
| 10 | [Backlog Harness Expansion A11y Code Standards](./phase-10-backlog-harness-expansion-a11y-code-standards.md) | P3 | Backlog | Complete |

## Sprint Plan

| Sprint | Effort | Phases | Goal |
|--------|--------|--------|------|
| 1 | 1–2 days | 1 → 2 → 3 → 4 | Block release: ch3-2-1 fixes pedagogical regression, 7 concept routes lose misleading Play button (ch3-7-2 reclassified to animated, handled in Sprint 2), harness pins evolution baseline. |
| 2 | 1–2 days | 5 | Animation parity for 5 should-animate candidates (ch3-1-2, ch3-5-1, ch3-5-2, ch2-5-1, ch3-7-2). Phase 6 dropped per F11. |
| 3 | 1 day | 7 → 8 | ch2-5-2/3 decision logged, docs synced, journal entry written, roadmap closed. |
| Backlog | as time allows | 9 → 10 | Phase 9 completed via no-dependency JSON pixel-diff fallback; Phase 10 a11y polish + code-standards complete. |

## Dependencies

- **Sprint 1 internal**: Phase 1 (test fixtures) → 2,3 in parallel → 4 (consumes both for baseline).
- **Sprint 2 internal**: Phase 5 only (Phase 6 dropped per F11).
- **Cross-plan**: No active blocking plan. `260519-2142-simulation-review-2026-05-19-priority-fixes` is the most recent merged plan; Phase 09 logically follows but is independent.

## Success Criteria

- [x] `npm run test:sim:browser` green with new `tests/sim-canvas-evolution.spec.js` covering 58 routes.
- [x] `qa-verification/animation-sweep/per-route-animation-sweep-baseline.json` checked in; CI fails on diff.
- [x] ch3-2-1 body translates visibly with default sliders; soft-clamp halts body at canvas edges (no wrap-around — F13 resolved). Engine clamp keeps `state.v=5` on the F=0 branch (`onTick_ch321`); renderer reads `state.v`. Verified manually + Playwright. *(F1: `state._v0` does not exist; renderer reads `state.v`.)*
- [x] 7 concept-only routes have **no** Play button rendered; Reset still functional; aria-pressed not orphaned. F3 hybrid policy applied: 3 routes (`ch3-2-5`, `ch3-4-1`, `ch2-7-2`) use Option A (no engine), 3 routes (`ch3-1-3`, `ch3-2-3`, `ch3-6-3`) use Option B (`tickWithoutButton: true` — engine ticks, no Play affordance), 1 route (`ch3-7-1`) uses Option C (static + dropped from `appendTime`). ch3-7-2 reclassified to animated, handled in Phase 05.
- [x] 5 candidate routes (ch3-1-2, ch3-2-1, ch3-5-1, ch3-5-2, ch2-5-1) plus reclassified ch3-7-2 show ≥3 unique frame hashes between t=0 and t=3 *engine seconds* (not wall seconds — F15). ch2-5-1 invariant `\|v_B−v_A\|≈ω·\|AB\|` preserved (F5). ch3-5-1 F8 resolved (option a — mass-weighted centroid recomputed from displaced positions; centroid invariant test pins it).
- [x] Phase 06 dropped per F11 (planner-invented UX without content-owner validation). Autoplay-on-mount can be added later per-route via existing `autoplayFor(routeId)` allowlist if requested.
- [x] `docs/codebase-summary.md`, `docs/project-changelog.md`, `docs/project-roadmap.md` reflect Phase 09 completion; journal entry added.
- [x] No new console errors / unhandled rejections; `npm run test:sim:release` passes.

## Risk Assessment

| Risk | Likelihood | Mitigation |
|---|---|---|
| Renderer edits break visual-quality tier (`tests/simulation-visual-quality.spec.js`) | Medium | Run `npm run test:sim:visual-quality:update -- --routes <id>` per-route after each animation diff; review side-by-side. |
| Removing Play button on `static: true` routes orphans `aria-pressed` state on focus management | Low | Phase 03 step 6 explicitly clears stale aria attrs before short-circuit; covered by RED test. |
| Per-second canvas hash flaky on slower CI | Medium | Engine-time-coupled sampling (poll `state._t` crossings) replaces wall-clock sleep; step=8 hash grid (F14, F15). |
| `_t`-driven body drift on ch3-2-1 leaks into other Newton scenes via shared primitives | Low | Renderer-local fix only; primitives untouched. Phase 02 RED test asserts ch3-2-2 unaffected. |
| Existing `phase-09-12-tdd.test.js` semantics already claim "phase 09" namespace | Low | New file is `sim-canvas-evolution.spec.js` (different surface — invariants vs canvas evolution); naming-collision check phase 1 step 1. |
| **F3 hybrid creates 3 sub-modes per route (A/B/C)** | Medium | Single banner table + scene-identity test asserts every `static: true` route either has `tickWithoutButton: true` set or is excluded from `appendTime` — single rule, machine-checked. |
| **F8 — ch3-5-1 visual centroid desyncs from labeled "C" dot** | Resolved | Mass-weighted centroid recomputed from displaced particle positions every frame; centroid invariant test (`tests/phase-09-animation-parity.test.js → ch3-5-1 centroid invariant`) pins the relationship. |
| **F11 — Phase 06 planner-invented UX** | Resolved | Phase 06 dropped. If autoplay-on-mount is later requested, add per-route via `autoplayFor(routeId)` allowlist without a dedicated phase. |
| **F13 — ch3-2-1 wrap-around overlays arrows on label panel** | Resolved | Replaced wrap-around with soft-clamp `bodyX = Math.min(500, Math.max(68, baseX + dx))`; body halts at canvas edge by design — pedagogy "v=const until something stops it" preserved. |

## Security Considerations

No auth, network, or PII surface. All work is client-side rendering. Browser harness drives `file://` content; no exfil risk.

## Boundary Reminder

This plan is **plan-only**. Implementation belongs to `/ck:cook plans/260521-1100-phase-09-concept-diagram-cleanup-animation-parity/`.

## Red Team Review

### Session — 2026-05-21
**Findings:** 15 (15 accepted, 0 rejected)
**Severity breakdown:** 7 Critical, 8 High, 0 Medium
**Reports:**
- `reports/from-code-reviewer-to-planner-red-team-security-adversary-plan-review-report.md`
- `reports/from-code-reviewer-to-planner-red-team-assumption-destroyer-plan-review-report.md`
- `reports/from-code-reviewer-to-planner-red-team-scope-complexity-critic-plan-review-report.md`
- `reports/from-code-reviewer-to-planner-red-team-failure-mode-analyst-plan-review-report.md`

| # | Finding | Severity | Disposition | Applied To |
|---|---------|----------|-------------|------------|
| 1 | `state._v0` does not exist; renderer reads `state.v` (engine-populated) | Critical | Accept (resolved) | Phase 02, plan.md |
| 2 | Wrong file paths (`ch3-newton-laws-{behaviors,scenes}.js`); collapse to `ch3-dynamics-newton-dalembert-behaviors.js` + unified `ch3-dynamics-all-18-scenes.js`; ch2-7-2 in `ch2-relative-plane-motion-scenes.js` | Critical | Accept (resolved) | Phases 02, 03 |
| 3 | Engine `_t` freezes for static routes; option A/B/C decision needed | Critical | Accept (resolved — hybrid A+B+C plus reclassification) | Phase 03 banner + GREEN step 7 + plan.md success criteria |
| 4 | `[data-sim-play]` and `window.SIM_SCENES` don't exist; add `data-sim-play` in Phase 03 GREEN, use `window.SimSceneRegistry` | Critical | Accept (resolved) | Phases 01, 03, 06 |
| 5 | ch2-5-1: engine already integrates `state.phi`; renderer reads it directly (no `omega*t` term) | Critical | Accept (resolved) | Phase 05 step 5d |
| 6 | Phase 06 step-6 spec impossible by construction; sample DURING preview window | Critical | Moot (Phase 06 dropped per F11) | Phase 06 banner |
| 7 | preview-pause: 5 yields 0.28 px translation; per-route frames tuned to ≥10 px or ≥0.3 rad | Critical | Moot (Phase 06 dropped per F11) | Phase 06 banner |
| 8 | ch3-5-1 orbit desyncs labeled "C" dot from visual centroid for unequal masses | High | Accept (resolved — option a, mass-weighted centroid from displaced positions) | Phase 05 step 5b banner + GREEN |
| 9 | Sprint 1 over-engineered; collapse to single PR; trim Phase 04 ceremony | High | Accept (resolved) | Phase 04 banner |
| 10 | `knownDefect` bypass defeats TDD; replaced with explicit `test.fixme()` | High | Accept (resolved) | Phase 01 GREEN |
| 11 | Phase 06 autoplay may be planner-invented UX; confirm with content owner | High | Accept (resolved — phase dropped) | Phase 06 file replaced with DROPPED banner; plan.md Phases table + Sprint Plan |
| 12 | Phase 01 ≤90 s budget contradictory; bumped to ~4 min sequential | High | Accept (resolved) | Phase 01 non-functional req |
| 13 | Phase 02 wrap-around overlays arrows on label panel; soft-clamp or hide-on-wrap | High | Accept (resolved — soft-clamp + halt at canvas edge) | Phase 02 banner + GREEN code |
| 14 | 16×16 hash grid aliases ch3-1-2 slow pulse; drop to step=8 + full-image FNV fallback | High | Accept (resolved) | Phase 01 utils |
| 15 | Wall-clock sampling flakes on slow CI / DPR=2 / headed; sample by engine time | High | Accept (resolved) | Phase 04 key insights |

### Whole-Plan Consistency Sweep — pass 2 (post-resolution)

- Files reread: `plan.md`, `phase-01..phase-06`. Phases 07-10 unchanged by F3/F8/F11/F13 resolutions; not in scope.
- Decision deltas applied this pass: 4 (F3 hybrid policy + ch3-7-2 reclassification, F8 mass-weighted centroid from displaced positions, F11 Phase 06 dropped, F13 soft-clamp).
- Reconciled stale references this pass:
  - plan.md success criteria (8→7 concept routes; F3 hybrid; F8 resolved; F11 dropped; F13 soft-clamp).
  - plan.md Risk Assessment (F3/F8/F11/F13 rows flipped to Resolved with new mitigation language).
  - plan.md Phases table + Sprint Plan (Phase 06 → Dropped; Sprint 2 reduced to Phase 5 only).
  - plan.md Red Team Review disposition column (15 entries updated).
  - phase-02 banner + Risk Assessment (F13 resolved with soft-clamp).
  - phase-03 banner + Key Insights F3 line + GREEN step 7 + REFACTOR + Tests + Success Criteria + Risk Assessment + Overview (8→7 routes; hybrid A/B/C; ch3-7-2 reclassified out).
  - phase-05 frontmatter title (Four→Five) + banner (F8 resolved + ch3-7-2 reclassification) + Functional table + Related Code Files + Architecture + sub-step 5b (RED + GREEN) + new sub-step 5e + Tests + Todo + Success + Risk + Next Steps.
  - phase-06 file replaced with DROPPED banner; original implementation specification removed.
- Unresolved contradictions: 0. The 4 banners that were previously UNRESOLVED (F3, F8, F11, F13) now all carry resolution markers and link to the implementing GREEN steps or the dropped-file banner.

## Closeout Evidence

1. `/ck:cook --tdd plans/260521-1100-phase-09-concept-diagram-cleanup-animation-parity/` implementation is complete across phases 1-10.
2. `npm run test:sim:release` passes.
3. `npm run test:sim:visual-quality:full` passes, including the tier-2 JSON visual evolution baseline for 24 animated routes.
4. Code-review follow-up concerns were resolved: updater refuses drift normalization by default, Phase 9 docs describe JSON fallback only, roadmap separates 58-route sweep from 24-route tier-2 baseline, and plan frontmatter is `status: complete`.
