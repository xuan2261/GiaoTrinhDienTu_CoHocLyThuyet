---
title: "Codebase Scout Report"
type: scout
created: 2026-05-07
---

# Codebase Scout Report

## Summary

Simulation wiring is healthy. Route-specific pedagogy is weak because runtime still uses generic render/derived/interaction paths. Existing gates pass but do not enforce strict renderer uniqueness.

## Evidence

| Evidence | Result |
|---|---|
| `python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58` | PASS |
| `python tools\smoke_simulation_runtime.py ... --expect-runtime-routes 58` | PASS |
| `npm run test:sim:scene-identity` | PASS |
| Probe | 58 unique templates, 14 renderer families, 43/58 routes share semantic control/readout shape |

## Key Files

| File | Finding |
|---|---|
| `js/sim-scene-templates.js` | `renderScene()` dispatches by `scene.family`; `signature()` includes metadata. |
| `js/sim-professional-lab.js` | `derived()`, `updateStateFromSlider()`, `addInteractions()` are generic. |
| `js/sims/ch*/` scene files | Rows create unique labels/templates but many same controls/readouts. |
| `tests/simulation-browser.spec.js` | Scene identity mixes canvas hash with labels/formula/readout. |
| `tools/smoke_simulation_scene_catalog.py` | Static signature can pass with metadata-only uniqueness. |
| `package.json` | Release gate should explicitly include strict renderer contract checks. |

## Affected Runtime Surface

- Keep: `SimLabUI`, `SimRegistry`, `SIM_MAP`, loader lifecycle, assessment storage.
- Replace/refactor: route renderer selection, behavior selection, QA identity gates.
- Do not edit: `chapters/`, `js/pages.js`, generated DOCX outputs.

## Unresolved Questions

None.

