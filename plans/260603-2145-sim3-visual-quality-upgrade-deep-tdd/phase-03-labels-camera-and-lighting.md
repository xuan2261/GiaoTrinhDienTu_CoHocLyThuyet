---
phase: 3
title: "Labels Camera And Lighting"
status: completed
priority: P1
effort: "7h"
dependencies: [2]
---

# Phase 03: Labels Camera And Lighting

## Overview

Fix the three shared visual weaknesses: missing in-canvas labels, static camera composition, and flat lighting/material perception.

## Requirements

- Functional: each active 3D scene can show stable DOM labels anchored to 3D points or objects.
- Non-functional: labels must not block controls, must be removed on dispose, and must remain readable without WebGL-specific text rendering.

## Architecture

Add a label layer inside `Sim3Shell` host: route adapters register label anchors and `Sim3Shell` projects world coordinates with the active camera into absolutely positioned HTML labels. Camera presets remain route-owned but use shared fit/composition helpers. Lighting upgrades stay inside shell setup defaults unless a route overrides them.

## Related Code Files

- Modify: `js/sim3/core/three-shell.js`
- Create: `js/sim3/core/label-layer.js` if separation is cleaner
- Modify: `js/sim3/core/three-primitives.js`
- Modify: `css/style.css` only for label styling hooks, if inline styles are insufficient
- Modify: `tests/sim3-pilot-fallback-dispose.spec.js`
- Modify: `tools/sim3-visual/pilot-capture.spec.js`

## Implementation Steps

1. RED: assert 3D mode creates `.sim3-label-layer` and route labels for at least two representative routes.
2. RED: assert dispose removes `.sim3-label-layer` and `.sim3-label`.
3. GREEN: implement label creation/update/dispose in shell or a small helper.
4. Add shared lighting preset: hemisphere + key + soft fill + optional shadow receiver; keep performance low.
5. Add camera composition helpers/presets and apply to all six routes without changing state logic.
6. Add label styling with high contrast and pointer-events disabled.
7. Capture six screenshots and compare against Phase 01 checklist.

## Success Criteria

- [x] Every Sim3 route has at least labels for the main moving point/body and one core vector/axis.
- [x] Labels stay inside or near the viewport and do not overlap the side theory panel.
- [x] Camera view exposes the main concept without excessive empty space.
- [x] Materials show stronger depth than baseline while staying clean and academic.
- [x] Fallback and dispose tests pass.

## Risk Assessment

Risk: label projection may become flaky in screenshots. Mitigation: fixed camera, deterministic viewport size, no animated label transitions in tests.
