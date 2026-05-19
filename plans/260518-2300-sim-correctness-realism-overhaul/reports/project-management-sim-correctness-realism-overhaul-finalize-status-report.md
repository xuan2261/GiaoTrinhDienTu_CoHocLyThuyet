---
title: "Sim Correctness Realism Overhaul — Finalize Status"
date: 2026-05-19
session: cook --tdd plans/260518-2300-sim-correctness-realism-overhaul/
---

# Plan Status

| Phase | Title | Status | Note |
|---:|---|---|---|
| 01 | Baseline TDD harness | completed | 12 Node + 26 Playwright invariants in repo, all GREEN |
| 02 | RC1 handle/body anchor | in-progress | Engine fail-loud + ch1 explicit branches shipped; per-renderer `getAnchor` migration deferred |
| 03 | RC4 spring/cable base | in-progress | `P.spring` accepts `{ anchor, wallAnchor }`; ch3-3-1/3-2 migrated; remaining renderers deferred |
| 04 | RC5 overlay whitelist | completed | Regex widened, Node test green, browser overlay-contract green |
| 05 | RC3a spring helix | completed | Sinusoidal helix dual-pass, mark `spring:...:coilCount` |
| 06 | RC3b body AO + magnitude arrow | completed | `realisticBody` AO/rim marks; `magnitudeArrow` length-only PhET |
| 07 | RC3c wheel shine + pattern cache | completed | Wheel shine arc; OffscreenCanvas LCG cache; theme MutationObserver |
| 08 | RC2/RC6 animation density + theme | pending | Preset gallery, trail buffer, impulse flash, autoplay, light theme parity not started |
| 08b | A11y ARIA + keyboard + reduced-motion | in-progress | Engine `setupA11yOverlay` + `attachReducedMotion` (with leak-safe teardown) shipped; downstream consumers (preset tween, autoplay skip) pending |
| 09 | Release gate | completed | Full `npm run test:sim:release` GREEN end-to-end after 4 regressions fixed in same session |
| 10 | Docs / changelog / handoff | completed | `docs/project-changelog.md` + journal entry shipped |

# Release Gate Results (post-fix)

- node --check: 104 JS files PASS
- 8 unit suites PASS (primitives, physics, runtime-regressions, invariants, promax-challenge, promax-formula, phase-08-tdd, phase-09-12-tdd)
- simulation-quality-audit: PASS (max 220 lines/file)
- npm run test:sim:browser: 188 passed
- npm run test:sim:visual-quality: passed (included in browser bundle)
- audit_v2_disposal: stable (1.59 MB delta over 20 cycles)
- strict-images, strict-formula-image, strict-equations: PASS
- equation_mapping validation: 702 rows, 53 KaTeX checks, OK
- 12/12 sim-correctness-realism Node tests GREEN

# Regressions Caught and Fixed

| # | Symptom | Cause | Fix |
|---|---|---|---|
| 1 | overlay-contract: ch1-5-2 "trượt", ch2-7-2 "Đúng" rejected | Test regex out-of-sync with widened production whitelist | Sync `OVERLAY_SHORT_LABEL_PATTERN` in `tests/simulation-browser.spec.js:39` |
| 2 | control-audit: ch3-3-1/3-2 m slider had no canvas/readout effect | `realisticBody` width was hardcoded `60` / `50` | Map `m` → body width in `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js` |
| 3,4 | responsive: ch1-2-3 + ch3-6-2 page overflow at 390px | `.sim-handle-a11y-layer` allowed off-canvas focus rings to push viewport | `overflow: hidden` on `.sim-handle-a11y-layer` in `css/style.css:1220` |

# Code Review (high-priority finding addressed)

`attachReducedMotion` could leak `matchMedia` listener on remount when no scope was provided. Fixed with `lab._reducedMotionTeardown` stash + idempotent re-call (`js/sim-professional-lab.js:1177-1205`).

# Files Changed (vs master HEAD)

| File | LOC ± |
|---|---|
| css/style.css | +11 |
| docs/project-changelog.md | +54 |
| js/sim-professional-lab.js | +117 / -10 |
| js/sim-route-renderer-primitives.js | +113 / -12 |
| js/sim-visual-helpers.js | +97 / -8 |
| js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js | +60 / -9 |
| package.json | +2 |
| tests/simulation-browser.spec.js | +3 / -1 |
| tests/simulation-runtime-regressions.test.js | +8 |
| tests/sim-correctness-realism.test.js | NEW |
| tests/sim-correctness-realism-fixtures.js | NEW |
| tests/sim-handle-anchor-invariants.spec.js | NEW |
| tests/__snapshots__/sim-correctness-baseline.json | NEW |

# Pending Carry-Over (next session)

1. Phase 02/03 deep migration — per-route `getAnchor`/anchor adoption across remaining 58 routes
2. Phase 08 — preset gallery (ch1-2-3/ch1-1-3/ch1-2-1), trail buffer (ch2-1-1, blocked by `state.trail` ban — needs coordinated test relaxation), impulse flash + Newton-3 (ch3-6-2), autoplay (ch3-3-1), light theme parity
3. Phase 08b — wire `lab.prefersReducedMotion` into trail/preset/autoplay paths
4. Per-phase `reports/baseline-delta-phase-NN.md` for visual review

# Unresolved Questions

- Should the `state.trail` ban in `tests/simulation-runtime-regressions.test.js:69` be relaxed in a coordinated way for Phase 08, or should Phase 08 use a different field name like `__trail` (and update the assertion to ban only the legacy form)?
- Phase 02 deep migration: route-by-route `getAnchor` is mechanical but tedious — worth a single sweep PR or split per chapter?
