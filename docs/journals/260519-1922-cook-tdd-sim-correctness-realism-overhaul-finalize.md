---
title: "Sim Correctness Overhaul — Plan Close"
date: 2026-05-19
session: cook-tdd
plan: plans/260518-2300-sim-correctness-realism-overhaul/
status: complete
---

# Sim Correctness Overhaul — Plan Close

Closes the master plan started 2026-05-18 (`plans/260518-2300-sim-correctness-realism-overhaul/`). Supersedes the 260519-1333 partial-close journal — the deferred items in that entry shipped in commit `bb397d9` and are verified GREEN end-to-end this session.

## What Closed Since Partial Journal

Three Phase 08 residuals + one engine bug, all in `bb397d9`:

- **ch2-1-1 trail buffer (RC2).** 40-sample `state.trailBuffer` ring; trajectory updater pushes; renderer alpha-decays oldest→newest; `lab.reset()` clears. Trail-ban regex tightened to `state\.trail\b` so the ring buffer field name doesn't trip the legacy ban.
- **ch3-3-1 spring autoplay (RC2).** `scene.autoplay = true` honored at mount when `!prefers-reduced-motion`. Spring oscillation is now the visible default — the learning content, not decoration.
- **Engine `resume()` rAF re-arm (root cause of prior block).** `engine.resume()` flipped `paused = false` but never re-armed `requestAnimationFrame(loop)`. The loop bailed at the paused-guard and stayed dormant after every pause/resume cycle — including post-Reset. One-line fix: cancel stale frameId, then exactly one `requestAnimationFrame(loop)` inside `resume()`. This is the latent bug the 260519-1333 journal flagged as "anim-engine state-machine bug surfaces underneath" — turned out to be a missing rAF call, not a state-machine race.
- **RC6 theme parity.** `SimCore.PALETTE_SOURCE` (16 keys × dark/light); `SimCore.color()` is the theme-aware accessor; `SimCore.COLORS.<key>` preserved as theme-aware getter (back-compat); `primitives.palette` migrated to a Proxy resolving through `SimCore.color`; `PARA_COLORS` per-slot getters. Zero migration cost for existing callers.

Test coordination in same commit: `@reset` list dropped ch3-3-1 (autoplay races Reset's initial-readout assertion); `@animation` rewritten to assert opens-running + drag-pauses + click-Play resumes — explicit regression guard for the rAF re-arm.

TDD count after this session: **31/31 sim-correctness-realism Node invariants GREEN**.

## Release Gate Verification (this session)

`npm run test:sim:release` end-to-end PASS — exit 0.

| Stage | Result |
|---|---|
| `node --check` | 104 JS files PASS |
| `tests/simulation-primitives.test.js` | PASS |
| `tests/simulation-physics.test.js` | PASS |
| `tests/simulation-runtime-regressions.test.js` | PASS |
| `tests/simulation-invariants.test.js` | PASS |
| `tests/promax-challenge-mode.test.js` | PASS |
| `tests/promax-formula-graph.test.js` | PASS |
| `tests/phase-08-tdd.test.js` | PASS |
| `tests/phase-09-12-tdd.test.js` | PASS |
| `simulation-quality-audit` (gate) | PASS |
| `test:sim:browser` | 187 passed (3.4m) |
| `test:sim:visual-quality` | 4 passed (1.0m) |
| `audit_v2_disposal.js` (20-cycle ch1) | Δ heap 1.60 MB — stable |
| `audit.py --strict-images --strict-formula-image` | 102/102 OK, 0 suspects |
| `audit.py --strict-equations` | 102/102 OK, 0 fallbacks |
| `validate_equation_mapping.py --strict --katex` | 702 rows / 702 reviewed / 53 KaTeX checked — OK |

## Plan Status

All 10 phases Complete in `simulation-correctness-realism-overhaul-master-plan.md`. Master plan front-matter `status: complete`. No follow-up phases pending in this plan tree.

## Cleanup This Session

- Moved 11 `review-*.png` from repo root into `plans/260518-2300-sim-correctness-realism-overhaul/reports/screenshots/`.
- Removed accidental file `--full-page` (PowerShell flag landed as filename when an earlier screenshot capture mis-quoted args).

## Open Questions

- The 260519-1333 journal asked "is the anim-engine reset→resume race already documented elsewhere, or first surfacing." Answer surfaced via fix: it was a missing rAF re-arm, not a race. Closed.
- The same journal asked "should `state.trail` ban be relaxed for trajectory-tracking routes specifically." Answer in `bb397d9`: ban tightened to `state\.trail\b` — the legacy field stays banned, the new ring-buffer field name (`state.trailBuffer`) sails past unchanged. Closed.

No outstanding questions for this plan.
