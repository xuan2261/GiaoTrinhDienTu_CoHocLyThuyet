---
type: report
topic: baseline-coverage-and-qa-harness
role: tester
created: 2026-05-06
---

# Tester Report: Baseline Coverage And QA Harness

## Scope

Validate Phase 01 baseline coverage and QA harness for the interactive mechanics simulation expansion.

## Results

| Check | Result |
|---|---|
| `node --check js\app.js` | PASS |
| `node --check js\loader.js` | PASS |
| `node --check js\quiz.js` | PASS |
| `node --check js\progress.js` | PASS |
| `node --check js\glossary.js` | PASS |
| `node --check js\notes.js` | PASS |
| `node --check js\simulations.js` | PASS |
| `python -m compileall -q tools` | PASS |
| `python tools\audit.py` | PASS, 0 errors, 50 warnings |
| `python tools\smoke_simulation_routes.py` | PASS |

## Smoke Harness Verification

Confirmed in `tools/smoke_simulation_routes.py`:

- parses `window.SIM_MAP`
- parses `const PAGE_MAP`
- validates each SIM route exists in `PAGE_MAP`
- validates each mapped fragment path exists on disk
- reports coverage matrix counts and P1 gaps
- prints representative route smoke rows

Relevant line refs:

- `tools/smoke_simulation_routes.py:68`
- `tools/smoke_simulation_routes.py:115`
- `tools/smoke_simulation_routes.py:127`
- `tools/smoke_simulation_routes.py:131`
- `tools/smoke_simulation_routes.py:169`
- `tools/smoke_simulation_routes.py:181`

## Coverage Snapshot

- `SIM_MAP` routes: 18
- Coverage matrix routes: 78
- Covered by `SIM_MAP`: 18/78
- P1 covered: 18/58
- P1 missing: 40

Representative routes:

- `ch1-1-4`: page=yes, current_sim=yes
- `ch1-5-3`: page=yes, current_sim=no
- `ch2-4-4`: page=yes, current_sim=no
- `ch3-3-1`: page=yes, current_sim=no
- `ch3-6-2`: page=yes, current_sim=yes

## Warnings

- `python tools\audit.py` returned 50 warnings, all from remaining `<img>` tags in generated chapter HTML.
- No audit errors.

## Failures

- None.

## Notes

- `js/simulations.js` exposes `window.SIM_MAP` at line 1815.
- `js/loader.js` defines `PAGE_MAP` at line 21 and `loadPage()` / `initSimulations()` wiring used by the runtime.

## Conclusion

Phase 01 baseline verification passes. Smoke helper behavior matches the acceptance criteria, and the current QA harness is stable offline.

