---
phase: 2
title: "Core Visual Foundation TDD"
status: completed
priority: P1
effort: "6h"
dependencies: [1]
---

# Phase 02: Core Visual Foundation TDD

## Overview

Build shared Sim3 visual primitives so route polish is DRY: material tokens, edge/rim helpers, shadow-safe scene setup, semantic arrows/guides, and optional helper groups.

## Requirements

- Functional: shared helpers must support existing adapters without changing route physics/state contracts.
- Non-functional: no new runtime dependency; helper output must dispose through existing Sim3 disposal path.

## Architecture

Extend `Sim3Primitives` or add a small `Sim3VisualKit` global loaded before route adapters. The kit owns reusable materials, improved arrow options, ghost material, guide lines, plane/rim helpers, and shadow receiver conventions. `Sim3Shell` keeps renderer lifecycle ownership.

## Related Code Files

- Modify: `js/sim3/core/three-primitives.js`
- Create: `js/sim3/core/visual-kit.js` if helpers outgrow primitives
- Modify: `index.html`
- Modify: `tests/fixtures/sim2-ch2.html`
- Modify: `tests/fixtures/sim2-ch3.html`
- Modify: `tests/sim3-pilot-fallback-dispose.spec.js`

## Implementation Steps

1. RED: add focused tests that shared helper globals exist and route 3D still mounts when helpers load.
2. RED: add dispose assertions for helper-created meshes/materials via repeated 2D/3D toggles.
3. GREEN: implement shared material tokens mirroring Sim2 semantic colors.
4. GREEN: implement guide/ghost/rim helpers using existing Three.js UMD APIs only.
5. Refactor one low-risk route to use the kit as a pilot, then run Sim3 tests.

## Success Criteria

- [x] `npm run test:sim3:pilot` passes after helper introduction.
- [x] No duplicate canvas/scene objects after repeated toggles.
- [x] Shared materials cover `moment`, `v`, `a`, `coriolis`, `force`, `mass1`, `mass2`, `axis`, `ghost`.
- [x] Existing visual output does not regress before route-specific polish.

## Risk Assessment

Risk: over-abstracting route scenes. Mitigation: helpers stay primitive-level; routes still own concept-specific composition.
