# Scout Report - Simulation Quality Hardening

## Summary

Relevant work sits in simulation infrastructure, Ch1/Ch2/Ch3 renderer and behavior modules, QA tools, and docs. No DOCX/content pipeline changes required.

## Key Files

| File | Why relevant |
|---|---|
| `js/sim-professional-lab.js` | Global handle draw/bind, behavior integration, readout, animation hookup |
| `js/sim-route-behavior-registry.js` | Best place to preserve route behavior metadata and new handle contract |
| `js/sim-route-renderer-registry.js` | Duplicate renderer warning source |
| `js/sim-scene-registry.js` | Duplicate scene warning source |
| `js/sim-rendering.js` | Handle drawing helper |
| `js/sim-route-renderer-primitives.js` | Shared arrows, points, panels, edge-prone drawing primitives |
| `js/sims/ch1/*renderers.js` | Ch1 high edge routes and route drag semantics |
| `js/sims/ch2/*scenes.js` | Duplicate Ch2 scene registrations |
| `js/sims/ch2/*renderers.js` | Duplicate Ch2 renderer registrations and Ch2 visual repair |
| `js/sims/ch2/*behaviors*.js` | Ch2 animation, mode bug `Thang`/`Thẳng`, future handles |
| `js/sims/ch3/*renderers.js` | Ch3 clipped arrows and route-specific visuals |
| `js/sims/ch3/*behaviors*.js` | Ch3 animation and future handles |
| `tests/simulation-browser.spec.js` | Existing route/browser QA; keep green |
| `package.json` | Add visual quality script if new test file created |
| `tools/audit_simulation_quality.py` | Static quality gate; may include no-overwrite source scan |
| `docs/code-standards.md` | Must sync new QA gates and route-owned handle contract |
| `docs/system-architecture.md` | Must sync interaction contract after implementation |
| `docs/project-changelog.md` | Must record fix |

## Current Risk Points

- Browser console warning is not a failing gate.
- Direct drag test checks text, not actual object position.
- Renderer uniqueness gate still allows overwritten intermediate registrations.
- Ch2 has two scene/render paths loaded; final state depends on script order.

## Unresolved Questions

- None blocking plan. Implementation should inspect each route family before editing.

