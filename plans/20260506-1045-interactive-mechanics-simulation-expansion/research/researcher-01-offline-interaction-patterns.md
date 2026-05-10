---
type: research
topic: offline-interaction-patterns
created: 2026-05-06
---

# Offline Interaction Research

## Summary

Best route for this repo: plain JS + Canvas 2D/SVG, progressive enhancement after fragment load. Avoid WebGL/3D except future isolated proof. Current offline-first and no-package constraints make external libraries risky.

## Findings

| Area | Recommendation | Reason |
|---|---|---|
| Runtime | Keep script-tag JS | Works with `file://`, no bundler |
| Rendering | Canvas 2D for motion; SVG/HTML for labels/checkers | Good performance, easy QA |
| Interaction | Sliders, drag handles, toggles, reset, play/pause | Touch-friendly, already local pattern |
| Assessment | Micro-checkers in shared layer | Avoid bloating quiz JSON only |
| Content source | Keep textbook text from DOCX; inject sims by route | Avoid generated fragment hand edits |
| Persistence | Reuse localStorage, new namespaced key | Preserve old keys |
| Testing | Syntax + audit + route smoke + file mode | Matches deployment risk |

## External Pattern Notes

- PhET style: focused controls, immediate visual feedback, no long instructions in UI.
- Open Source Physics style: simple model parameters, graph output, resettable scenarios.
- GeoGebra style: draggable geometric/mechanics constructs, formula tied to visual state.

No direct dependency proposed. Use patterns only.

## Risks

| Risk | Mitigation |
|---|---|
| `js/simulations.js` already ~1800 lines | Split into real modules, not duplicate enhanced files |
| Too many simulations | MVP each route, then enrich |
| Mobile canvas controls cramped | Fixed control patterns, responsive smoke per phase |
| Formula mismatch | Keep formulas explicit, add unit tests/manual worked examples |

## Unresolved Questions

- None blocking. Default: no new third-party runtime.
