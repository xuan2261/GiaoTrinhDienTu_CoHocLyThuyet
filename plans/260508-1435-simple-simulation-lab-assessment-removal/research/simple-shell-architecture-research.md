---
title: "Simple Shell Architecture Research"
type: research
created: 2026-05-08
---

# Simple Shell Architecture Research

## Current Architecture

Runtime path:
1. `loader.js` injects fragment into `#content-area`.
2. `initSimulations(container, pageId)` calls `window.SIM_MAP[pageId](container)`.
3. `simulations.js` wraps route function with lifecycle scope.
4. Thin adapters call `SimProfessionalLab.mount(routeId)`.
5. `SimProfessionalLab` resolves scene, renderer, behavior, handles.
6. `SimLabUI.createLab` creates shell.

This path is good. Keep it.

## Shell Problem

Current shell creates:
- route chip
- legend
- formula panel
- status panel
- feedback panel
- checkpoint panel
- generic circular canvas handles via engine-level `drawRouteHandles()`

For student reading flow, this is too much UI around a canvas. DeCuong shell works because it prioritizes:
- direct manipulation
- immediate values
- one hint
- no scoring flow
- controls outside canvas instead of generic drag points on top of the drawing

## Recommended Design

Use existing `SimLabUI.createLab`, but simplify slots:
- `header`: title + small badge + route optional hidden metadata.
- `scene`: canvas + overlay unchanged.
- `controls`: existing sliders/buttons unchanged.
- `readout`: grid of cards.
- `hint`: objective/formula short text.
- `interaction`: invisible hit targets or object-bound drag only; no visible shell-owned circular handle markers.

No new library. No new renderer layer.

## Metadata

Keep one metadata source:
- `window.SIM_ROUTE_MANIFEST[routeId].objective`
- `interaction`
- runtime `rendererId`, `behaviorId`

Remove:
- `checkpoints`
- `SimAssessment.registerAll`
- `expectedRendererId` per checkpoint
- visible generic handle labels and round marker rendering from shell/engine layer

## Readout Strategy

Preferred API:
- `behavior.formatReadoutItems(scene, state, derived, handles)` returns array `{ label, value, unit, tone }`.
- Fallback converts `scene.readouts` into cards.
- Keep old `formatReadout()` for minimal backward compatibility during transition.

Reason:
- Cards need structured data. String splitting would be brittle.
- Minimal route changes. Most route metadata already defines `scene.readouts`.
- Generic drag coordinates are not teaching readouts; expose named mechanics quantities only.

## Animation/Control Strategy

- Reset should restore the route's initial `makeState(scene, routeId)` state and redraw readout cards.
- Play/pause should be shown only for routes with `behavior.onTick` or active continuous animation.
- Animated state must stay finite and bounded; tests should pair canvas-hash movement with representative formula/readout checks.

## Unresolved Questions

- None.
