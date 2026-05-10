# Root Cause And Architecture Research

## Summary

Current routing is correct. Content is wrong because every route calls `SimProfessionalLab.mount(routeId)`, then the engine selects only one of three renderers by chapter prefix.

## Findings

| Area | Evidence | Impact |
|---|---|---|
| Loader | `loader.js:initSimulations()` calls `window.SIM_MAP[pageId]` | Route id reaches simulation layer. |
| Registry | `simulations.js` builds `SIM_MAP` from `SimRegistry.entries()` | 58 keys executable. |
| Adapters | `sim-statics.js`, `sim-kinematics.js`, `sim-dynamics.js` bind route ids | No route key loss. |
| Engine | `kind(routeId)` returns only `statics`, `kinematics`, `dynamics` | Scene selection too coarse. |
| Renderers | `draw()` calls only `statics()`, `kinematics()`, `dynamics()` | Most routes share identical canvas. |
| State | `makeState()` changes only a few route-specific values | Initial visual mostly unchanged. |

## Recommended Architecture

Add route-scene layer, not a new router.

```text
loader.js pageId
  -> window.SIM_MAP[pageId]
  -> registered adapter function
  -> SimProfessionalLab.mount(routeId)
  -> SimSceneRegistry.get(routeId)
  -> scene template renderer + route-specific config
```

## Route Scene Contract

Each scene definition should include:

| Field | Purpose |
|---|---|
| `sceneId` | Stable unique id, one per route. |
| `routeId` | Must match `SIM_MAP` route. |
| `kind` | `statics`, `kinematics`, or `dynamics` for chapter accent only. |
| `template` | Shared drawing family, e.g. `force-vector`, `support-reaction`. |
| `title` | Route-specific simulation title. |
| `formula` | Route-specific formula/readout focus. |
| `visualKey` | Stable semantic key used by uniqueness tests. |
| `initialState` | Route-specific starting positions/parameters. |
| `controls` | Route-specific direct controls and precision controls. |
| `readouts` | Route-specific values shown in `.sim-info`. |
| `assessmentKeys` | Keys consumed by `sim-assessment.js`. |

## File Split

Keep small files:

- `js/sim-scene-registry.js`: registry only.
- `js/sim-scene-templates.js`: shared template dispatch/common drawing helpers.
- `js/sims/ch1/*-scenes.js`: Ch1 scene definitions by section group.
- `js/sims/ch2/*-scenes.js`: Ch2 scene definitions by section group.
- `js/sims/ch3/*-scenes.js`: Ch3 scene definitions by section group.

## Rejected Approaches

| Approach | Reason |
|---|---|
| One hand-written function per route in adapters | High duplication, hard to keep under file-size guidance. |
| Keep current renderer and vary only labels | Would pass route identity but not user requirement. |
| Add framework/build step | Violates static `file://` constraint. |
| Replace lab shell | Shell is not root cause; reuse it. |

Unresolved questions: none.
