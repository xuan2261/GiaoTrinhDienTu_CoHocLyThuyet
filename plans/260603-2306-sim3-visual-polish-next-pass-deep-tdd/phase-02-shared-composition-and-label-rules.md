---
phase: 2
title: "Shared Composition And Label Rules"
status: completed
priority: P1
effort: "5h"
dependencies: [1]
---

# Phase 02: Shared Composition And Label Rules

## Overview

Add small shared helpers and tests for visual quality primitives: viewport-safe composition, label offsets, visual metrics, and screenshot-state metadata.

## Requirements

- Functional: routes can expose deterministic visual debug metrics and use shared label/composition helpers.
- Non-functional: no new runtime dependency; helpers must remain optional and not force changes on all routes.

## Architecture

Extend `Sim3VisualKit` with lightweight functions for camera presets, vector scale clamps, label offset presets, visual debug metric helpers, and maybe a bounding helper. `Sim3Shell` should keep label lifecycle ownership; adapters keep route-specific pedagogy.

## Related Code Files

- Modify: `js/sim3/core/visual-kit.js`
- Modify: `js/sim3/core/three-shell.js` only if label placement needs shared support
- Modify: `tests/sim3-pilot-fallback-dispose.spec.js`
- Read: `js/sim3/sims/*-3d.js`

## Implementation Steps

1. RED: add tests/assertions for route visual debug fields without relying on pixel snapshots:
   - label layer removed on 3D→2D and dispose remains covered.
   - representative routes expose `visualMetrics` or equivalent route debug payload.
   - shared visual kit exposes helper keys for composition/label offsets/vector scale clamps.
2. GREEN: add only `Sim3VisualKit` helpers used by at least two route changes in this phase or the next phase:
   - `vectorScale(value, {min,max,factor})`
   - `cameraPreset(camera, presetName, targetOverride)`
   - `labelOffset(kind)` or named offset presets
   - `visualMetrics(routeId, metrics)` for debug payload consistency.
3. Keep helpers plain UMD globals and compatible with vendored Three.js.
4. Refactor no route behavior yet except minimal test pilot if needed; defer any helper with only one consumer.
5. Run `npm run test:sim3:pilot`.

## Success Criteria

- [x] Shared helper API exists and is covered by tests.
- [x] Every new helper has at least two planned route consumers or is explicitly deferred.
- [x] Existing routes still mount/fallback/dispose correctly.
- [x] 3D→2D toggle removes canvas and label layer.
- [x] No route visual output changes significantly before route polish unless intentional.

## Risk Assessment

Risk: over-engineering a visual framework. Mitigation: only add helpers used by at least two route fixes or required by deterministic tests.
