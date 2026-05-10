---
type: report
topic: simulation-runtime-foundation
created: 2026-05-06
---

# Simulation Runtime Foundation Report

## Summary

Phase 02 runtime foundation complete. Existing 18 simulations are preserved, split into script-tag modules, and mounted through a disposable registry compatible with `loader.js`.

## Files Changed

| File | Change |
|---|---|
| `index.html` | Added simulation module script order before `js/simulations.js` |
| `js/loader.js` | Added `disposeActiveSimulation()` before route content replacement |
| `js/sim-core.js` | New shared helpers, lifecycle scope, RAF cleanup, resize cleanup |
| `js/sim-statics.js` | Ch1 simulation module |
| `js/sim-kinematics.js` | Ch2 simulation module |
| `js/sim-dynamics.js` | Ch3 simulation module |
| `js/sim-activities.js` | Activity namespace placeholder |
| `js/simulations.js` | Compatibility registry, keeps `window.SIM_MAP` |
| `tools/smoke_simulation_runtime.py` | New TDD smoke for script order, modules, registry, lifecycle tokens |

## Validation

| Command / Check | Result |
|---|---|
| `python tools\smoke_simulation_runtime.py` before refactor | Failed as expected |
| `node --check` for 12 JS runtime files | PASS |
| `python -m compileall -q tools` | PASS |
| `python tools\smoke_simulation_runtime.py` | PASS |
| `python tools\smoke_simulation_routes.py` | PASS, 18 routes |
| `python tools\audit.py` | PASS, 0 errors, 50 warnings |
| Chrome CDP route smoke | PASS, 18 current simulation routes |
| Chrome CDP lifecycle smoke | PASS, RAF pending before navigation, 0 active after navigation |
| Runtime harness for mount/dispose failure | PASS, mount failure cleans scope; custom dispose throw still runs scope cleanup |

## Notes

- Domain modules keep existing simulation bodies mostly unchanged to reduce behavior drift in the foundation phase.
- `sim-statics.js`, `sim-kinematics.js`, and `sim-dynamics.js` are still large because they preserve existing simulation implementations. Further per-sim splitting can be done after behavior is stable.
- Code review follow-up fixed mount error isolation, disposer `finally` cleanup, explicit page-id simulation init, and stale fallback fetch guard.
- No backend, bundler, dynamic import, or network dependency added.
- Snapshot before edits: `backups\20260506-115424-pre-phase02-simulation-runtime-foundation`.

## Unresolved Questions

- None.
