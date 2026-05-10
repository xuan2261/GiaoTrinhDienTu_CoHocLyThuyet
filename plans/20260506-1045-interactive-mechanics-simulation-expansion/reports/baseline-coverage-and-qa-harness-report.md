---
type: report
topic: baseline-coverage-and-qa-harness
created: 2026-05-06
---

# Baseline Coverage And QA Harness Report

## Summary

Phase 01 baseline complete. Runtime syntax, Python tools compile, content audit, and simulation route smoke pass. No feature simulation code changed.

## Commands

| Command | Result |
|---|---|
| PowerShell loop: `node --check` for `js\app.js`, `js\loader.js`, `js\quiz.js`, `js\progress.js`, `js\glossary.js`, `js\notes.js`, `js\simulations.js` | PASS, 7 files |
| `python -m compileall -q tools` | PASS |
| `python tools\audit.py` | PASS, 0 errors, 50 warnings |
| `python tools\smoke_simulation_routes.py` | PASS |
| `python tools\smoke_simulation_routes.py --matrix does-not-exist.md` | FAIL as expected; missing matrix no longer false-pass |

## Current Simulation Routes

18 routes in `window.SIM_MAP`:

`ch1-1-4`, `ch1-1-6`, `ch1-2-3`, `ch1-3-3`, `ch1-4-4`, `ch1-6-2`, `ch2-1-1`, `ch2-1-3`, `ch2-2-2`, `ch2-3-2`, `ch2-4-3`, `ch2-5-1`, `ch3-2-2`, `ch3-2-3`, `ch3-4-1`, `ch3-5-2`, `ch3-5-4`, `ch3-6-2`.

## Coverage Snapshot

| Metric | Value |
|---|---:|
| Coverage matrix routes | 78 |
| Covered by current SIM_MAP | 18/78 |
| P1 routes covered | 18/58 |
| P1 routes missing | 40 |

Missing P1 routes:

`ch1-1-3`, `ch1-1-5`, `ch1-1-8`, `ch1-2-1`, `ch1-2-6`, `ch1-3-1`, `ch1-3-2`, `ch1-3-4`, `ch1-3-6`, `ch1-3-7`, `ch1-4-1`, `ch1-4-2`, `ch1-5-1`, `ch1-5-2`, `ch1-5-3`, `ch1-5-4`, `ch1-6-3`, `ch1-7-1`, `ch1-7-2`, `ch2-1-2`, `ch2-1-4`, `ch2-4-1`, `ch2-4-2`, `ch2-4-4`, `ch2-5-2`, `ch2-5-3`, `ch2-7-1`, `ch2-7-2`, `ch3-1-2`, `ch3-1-3`, `ch3-2-1`, `ch3-2-5`, `ch3-3-1`, `ch3-3-2`, `ch3-4-2`, `ch3-5-1`, `ch3-5-3`, `ch3-6-3`, `ch3-7-1`, `ch3-7-2`.

## Representative Route Smoke

| Route | Page fragment exists | Current sim |
|---|---|---|
| `ch1-1-4` | yes | yes |
| `ch1-5-3` | yes | no |
| `ch2-4-4` | yes | no |
| `ch3-3-1` | yes | no |
| `ch3-6-2` | yes | yes |

## QA Harness Notes

- `tools\smoke_simulation_routes.py` fails when coverage matrix is missing or empty unless `--allow-missing-matrix` is explicit.
- Parser accepts single-quoted or double-quoted `SIM_MAP`/`PAGE_MAP` entries and fails loud when route-like entries cannot be parsed.
- Route source check accepts normal fragment files and the `js\pages.js` offline bundle fallback used by `file://`; use `--require-fragments` for strict source-fragment checks.

## Baseline Issues

- `python tools\audit.py` reports 50 warning files with remaining `<img>` tags. Exit code is 0 and equation media classes/rendering are OK.
- Project folder has no `.git`; future implementation should use explicit snapshot/backup if needed.
- `js\simulations.js` is 1800+ lines, so Phase 02 should split runtime foundation before adding many new sims.
- Current simulation lifecycle has no teardown hook: `loader.js` replaces `#content-area`, while `simulations.js` registers `resize` listeners and `requestAnimationFrame` loops without a shared dispose path. Phase 02 should start with mount/dispose support before adding new simulations.

## Files Added

- `tools\smoke_simulation_routes.py`: static offline smoke check for `SIM_MAP` wiring, route source readiness, matrix coverage counts, and representative route readiness.

## Unresolved Questions

- None.
