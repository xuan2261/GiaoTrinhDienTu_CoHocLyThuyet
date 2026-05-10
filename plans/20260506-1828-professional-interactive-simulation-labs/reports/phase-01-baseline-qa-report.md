---
type: report
topic: phase-01-baseline-qa-harness
created: 2026-05-06
---

# Phase 01 Baseline QA Report

## Summary

Phase 01 QA harness added. Existing route/runtime/content gates still pass. New manifest smoke, quality audit, Python regression tests, and Playwright baseline browser smoke pass.

## Baseline Metrics

| Metric | Value |
|---|---:|
| `SIM_MAP` routes | 58 |
| P1 coverage | 58/58 |
| JS files scanned by quality audit | 6 |
| Sliders | 104 |
| Buttons | 24 |
| Canvas drag hooks | 8 |
| Canvas/click handlers | 6 |

## File Size Baseline

| File | Lines |
|---|---:|
| `js/sim-activities.js` | 139 |
| `js/sim-core.js` | 246 |
| `js/sim-dynamics.js` | 950 |
| `js/sim-kinematics.js` | 826 |
| `js/sim-statics.js` | 1035 |
| `js/simulations.js` | 110 |

## Commands Run

| Command | Result |
|---|---|
| `node --check js\app.js` and current simulation JS syntax gates | Pass |
| `python -m compileall -q tools` | Pass |
| `python tools\audit.py` | Pass, 99 files OK, 0 warnings, 0 errors |
| `python tools\smoke_simulation_routes.py --require-p1` | Pass, 58 routes, P1 58/58 |
| `python tools\smoke_simulation_runtime.py` | Pass |
| `python tools\test_simulation_qa_tools.py` | Pass, 6 tests |
| `python tools\smoke_simulation_manifest.py --allow-missing-manifest` | Pass, missing manifest allowed for Phase 01 |
| `python tools\audit_simulation_quality.py --baseline` | Pass |
| `npm run test:sim:unit` | Pass |
| `npm run test:sim:quality` | Pass |
| `npm run test:sim:browser:baseline` | Pass, 12 tests |

## Browser Smoke Coverage

Routes: `ch1-1-4`, `ch1-5-3`, `ch2-1-1`, `ch2-4-4`, `ch3-3-1`, `ch3-6-2`.

Modes: direct `file://` and a local in-process static server.

Assertions: route hash, one `.sim-container`, canvas present/nonblank, `.sim-info` nonempty, no console/page errors.

## Notes

- `package.json` and `package-lock.json` are dev-only QA setup; runtime still static/offline-first.
- `js/sim-route-manifest.js` intentionally not required yet; Phase 05 hardens manifest gate.
- `--routes` filters are supported by manifest/quality tools for later chapter phases; hard assessment/direct gates must cover selected `SIM_MAP` routes.
- File-mode browser smoke blocks external `http://` and `https://` requests so CDN fallback cannot hide missing local assets.
- Baseline quality audit is a metrics gate, not a release maintainability gate; later phases must use strict flags such as `--max-js-lines`, `--require-direct-interaction`, and `--require-assessment`.
- Workspace has no `.git`, so rollback/snapshot cannot rely on git state.

## Unresolved Questions

- None.

## Sync-Back

- `plan.md`: Phase 01 row remains `Completed`.
- `phase-01-baseline-metrics-and-qa-harness.md`: Overview status remains `Completed`; TODO list fully checked.
- No source code changes required for this final sync-back.
