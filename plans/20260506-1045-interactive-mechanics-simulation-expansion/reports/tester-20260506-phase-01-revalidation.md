---
type: report
topic: phase-01-revalidation
created: 2026-05-06
---

# Phase 01 Revalidation Report

## Summary

Phase 01 revalidated after smoke helper hardening and docs updates. All requested positive validation commands passed. The missing-matrix negative check failed as expected. `tools/smoke_simulation_routes.py` is 171 lines, under the 200-line limit.

## Test Results Overview

| Command | Result |
|---|---|
| `node --check js\app.js` | PASS |
| `node --check js\loader.js` | PASS |
| `node --check js\quiz.js` | PASS |
| `node --check js\progress.js` | PASS |
| `node --check js\glossary.js` | PASS |
| `node --check js\notes.js` | PASS |
| `node --check js\simulations.js` | PASS |
| `python -m compileall -q tools` | PASS |
| `python tools\audit.py` | PASS with warnings |
| `python tools\smoke_simulation_routes.py` | PASS |
| `python tools\smoke_simulation_routes.py --matrix does-not-exist.md` | FAIL as expected |

## Coverage / Smoke Snapshot

| Metric | Value |
|---|---:|
| `SIM_MAP` routes | 18 |
| Coverage matrix routes | 78 |
| Covered by `SIM_MAP` | 18/78 |
| P1 covered | 18/58 |
| P1 missing | 40 |
| Smoke helper line count | 171 |

Representative route smoke:

- `ch1-1-4`: `source=fragment`, `current_sim=yes`
- `ch1-5-3`: `source=fragment`, `current_sim=no`
- `ch2-4-4`: `source=fragment`, `current_sim=no`
- `ch3-3-1`: `source=fragment`, `current_sim=no`
- `ch3-6-2`: `source=fragment`, `current_sim=yes`

## Warnings

- `python tools\audit.py` reports 50 warnings, all from remaining `<img>` tags in chapter fragments.
- Warning summary from audit: `99 files | 49 OK | 50 warnings | 0 errors`.
- Workspace has no `.git`, so `git diff`-based change detection is unavailable here.

## Failures

- None for positive validation.
- Negative matrix test behaved correctly by exiting non-zero and reporting `Coverage matrix missing: does-not-exist.md`.

## Recommendations

1. Keep `tools\smoke_simulation_routes.py` as the Phase 01 gate for route wiring and matrix drift.
2. Treat the audit warnings as separate content cleanup work, not regression blockers for Phase 01.
3. Re-run the same command set after any simulation registry or loader change.

## Unresolved Questions

None.
