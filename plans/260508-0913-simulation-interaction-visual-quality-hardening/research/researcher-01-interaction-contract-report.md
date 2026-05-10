# Researcher 01 Report - Interaction Contract

## Summary

Current shell uses one generic interaction model for all route families. That made smoke tests pass but broke user perception: orange/red handles are not the actual simulated body, point, ball, mass, cursor, or vector.

## Findings

| Area | Current | Problem |
|---|---|---|
| Draw handles | `sim-professional-lab.js` draws `state.primary` and `state.vector` globally | Ch2/Ch3 route renderers use `currentX/currentY`, `px/py`, `ball1/ball2`, `masses`, etc. |
| Drag handlers | Default `addInteractions` mutates `state.primary` and `state.vector` | Readout changes but visual object often does not. |
| Behavior registry | Allows arbitrary behavior metadata | Good extension point for `handles()` contract. |
| Tests | Direct drag checks readout text only | Does not prove dragged object moved. |

## Recommended Architecture

Add route-owned handle descriptors through behavior contracts:

```js
handles(scene, state, d) {
  return [
    {
      id: 'particle',
      label: 'M',
      kind: 'body',
      get: () => ({ x: state.currentX, y: state.currentY }),
      set: point => { state.currentX = point.x; state.currentY = point.y; },
      hitRadius: 28
    }
  ];
}
```

`SimProfessionalLab` should:
- call `behavior.handles(scene, state, d, lab)`;
- draw only returned handles;
- bind interaction layer to same descriptors;
- use legacy `state.primary/vector` fallback only when behavior has no handles.

## Why this approach

- KISS: one small contract, no new interaction framework.
- DRY: central shell still binds pointer/touch/keyboard once.
- YAGNI: no Matter.js / p5.js. Current diagrams are educational, not free physical sandbox.

## Risks

- Some route states are derived by animation ticks. Drag may be overwritten on next tick unless behavior supports controlled pause/parameter update.
- Assessment currently reads `primary`, `P`, `b1`. Need preserve compatibility or map assessment state per route.

## Unresolved Questions

- Ch1: keep static route fallback handles, or require route-owned handles for all 25 Ch1 routes too?

