---
title: "Renderer Contract Research"
type: research
created: 2026-05-07
---

# Renderer Contract Research

## Summary

Current repair solved route registration, not route pedagogy. The strict fix is a route renderer registry where each route owns a dedicated renderer function. Shared primitives stay allowed; shared route-level renderer functions are blocked by tooling.

## Current Failure Pattern

| Layer | Current behavior | Why insufficient |
|---|---|---|
| Scene catalog | 58 unique `sceneId`, `template`, `visualKey` | Metadata can differ while rendered lesson stays same |
| Render dispatch | `renderScene()` selects by `scene.family` | 58 routes collapse into 14 renderer branches |
| Physics | `derived()` computes generic force/alpha/moment/etc. | Many topics expose same math response |
| Interaction | always `scene-body` + `force-tip` | Different lessons feel same |
| QA | signature includes labels/formula/text | Text changes can pass without pedagogical change |

## Recommended Contract

Each route scene must declare:

```js
{
  routeId: 'ch1-1-4',
  rendererId: 'ch1-1-4-moment-arm-renderer',
  behaviorId: 'ch1-1-4-moment-arm-behavior',
  interactionSchemaId: 'ch1-1-4-moment-arm-interactions',
  derivedModelId: 'ch1-1-4-moment-arm-derived'
}
```

Runtime registries:

| Registry | Purpose |
|---|---|
| `SimRouteRenderers` | `register(routeId, rendererId, renderFn)` and strict lookup |
| `SimRouteBehaviors` | optional route-specific controls, derived state, interactions |
| `SimSceneRegistry` | metadata only; no longer acts as proof of uniqueness |

## Strict Renderer Standard

Allowed:
- shared constants, colors, labels, arrows, axes, grid, vector primitives
- shared lab shell and lifecycle
- shared math helpers used inside distinct renderer functions

Not allowed:
- two routes mapped to same renderer function
- two routes with same normalized renderer source hash
- renderer uniqueness based only on `sceneId`, formula text, or label
- `family` as final renderer selector

## QA Design

Static gates:
- require 58 route renderers
- require unique `rendererId`
- require unique function names
- require unique normalized renderer source hash
- require every `SIM_MAP` route has renderer + behavior contract
- fail if `renderScene()` dispatches by `family` only

Browser gates:
- collect `rendererId` from lab debug metadata
- compute masked canvas hash: ignore top label/formula/readout text bands
- validate route-specific structural marks per route group
- run representative interactions that match concept, not generic drag

## Architecture Choice

Use registry-based route renderers, grouped by existing scene catalog groups:

```text
sim-route-renderer-registry.js
sim-route-behavior-registry.js
js/sims/ch1/*-renderers.js
js/sims/ch2/*-renderers.js
js/sims/ch3/*-renderers.js
```

This preserves no-bundler static loading and avoids bloating `sim-scene-templates.js`.

## Unresolved Questions

None. User explicitly chose strict route-specific standard: completely distinct renderer per route.

