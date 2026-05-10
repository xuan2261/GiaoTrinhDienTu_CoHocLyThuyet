---
type: report
topic: scout-professional-simulation-labs
created: 2026-05-06
---

# Scout Report

## Summary

Current implementation is functionally stable but not professional enough for the new bar. Route/runtime gates pass. Main risks: huge domain files, slider-heavy UX, limited direct manipulation, no persistent visual/interaction suite.

## Current Metrics

| Metric | Value |
|---|---:|
| `SIM_MAP` routes | 58 |
| Lesson routes | 99 |
| Lesson coverage by current simulations | 58.6% |
| Ch1 sim routes | 25 |
| Ch2 sim routes | 15 |
| Ch3 sim routes | 18 |
| Current sliders | ~103 |
| Current buttons | ~23 |
| Current canvas drag hooks | ~7 |
| Current canvas click hooks | ~1 |

## Key Files

| File | Current role | Plan action |
|---|---|---|
| `index.html` | Script load order | Add more sim scripts; keep static |
| `js/loader.js` | Route loader and sim hook | Preserve API; maybe add manifest hooks |
| `js/sim-core.js` | Lifecycle/canvas/control helpers | Keep, split visual/interaction helpers out |
| `js/sim-statics.js` | Ch1 sims | Split by topic |
| `js/sim-kinematics.js` | Ch2 sims | Split by topic |
| `js/sim-dynamics.js` | Ch3 sims | Split by topic |
| `js/sim-activities.js` | Numeric checker | Upgrade to assessment engine or wrap with new engine |
| `js/simulations.js` | Compatibility registry | Keep small registry only |
| `css/style.css` | Sim styles | Add professional lab shell styles |
| `tools/smoke_simulation_routes.py` | Route gate | Extend with manifest/assessment checks |
| `tools/smoke_simulation_runtime.py` | Runtime gate | Extend with new globals/script order |

## Validation Evidence

- `node --check` on current simulation files: pass.
- `python tools\smoke_simulation_routes.py --require-p1`: pass.
- `python tools\smoke_simulation_runtime.py`: pass.
- `python tools\audit.py`: 0 errors, 50 legacy `<img>` warnings.

## Unresolved Questions

- None.
