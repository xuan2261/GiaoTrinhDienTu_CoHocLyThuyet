# Phase 01 Shared Sim3 Adapter Hardening

## Context Links

- `js/sim3/core/three-shell.js`
- `js/sim3/core/mode-toggle.js`
- `js/sim3/core/three-dispose.js`
- `plans/260603-1858-sim3-route-candidate-audit-and-rollout-plan/reports/sim3-route-candidate-audit.md`

## Overview

Priority: P1
Status: Complete
Effort: 4h
Goal: prepare shared Sim3 contracts before adding 3 more route adapters.

## Key Insights

- Current pilot already has shell, toggle, fallback, dispose.
- Shared extraction should be visual-only. Physics stays in Sim2 route/physics modules.
- Main risk is helper sprawl. Only extract repeated primitives needed by at least 2 adapters.

## Requirements

- Keep `SIM_MAP[pageId] -> factory(container) -> { dispose }`.
- Keep Sim2 default.
- Avoid route-specific duplicated arrow/body/grid helpers where simple shared helpers reduce duplication.
- Do not introduce a bundler.
- Keep fallback message Vietnamese and visible when WebGL/renderer/setup fails.
- Keep deterministic test hook pattern: `window.__SIM3_DEBUG__[routeId]`.

## Architecture

- `three-shell.js`: lifecycle, WebGL availability, renderer creation, RAF, resize, dispose.
- `mode-toggle.js`: 2D/3D toggle, lazy 3D creation, fallback UI, 2D restore.
- `three-dispose.js`: geometry/material/texture cleanup.
- Optional new shared helpers only if repeated: arrows, floor/grid, simple materials, debug setter.

## Related Code Files

Modify:
- `js/sim3/core/three-shell.js`
- `js/sim3/core/mode-toggle.js`
- `js/sim3/core/three-dispose.js`
- `tests/sim3-pilot-fallback-dispose.spec.js`

Create:
- Optional `js/sim3/core/three-primitives.js` only if repeated code justifies it.

Delete:
- None.

## Implementation Steps

1. RED: add/confirm tests that forced WebGL fail, renderer constructor fail, setup fail, repeated toggle, and dispose leave no `.sim3-*` DOM.
2. Review `ch2-2-2-3d.js` and `ch3-6-2-3d.js` for repeated arrow/grid/material/debug code.
3. Extract only repeated visual primitives used by current pilot plus upcoming routes.
4. Keep route adapters owning state mapping and physics-derived values.
5. GREEN: update current pilot adapters if needed to use helpers without behavior change.
6. VERIFY: run `npm run test:sim3:pilot`.

## Todo List

- [x] Write/confirm RED coverage for fallback/dispose/setup failure.
- [x] Identify repeated visual helpers.
- [x] Extract only helpers with 2+ route usage.
- [x] Preserve current pilot behavior.
- [x] Run `npm run test:sim3:pilot`.

## Success Criteria

- Current two pilot routes unchanged behaviorally.
- New route phases can reuse helpers without coupling physics into Sim3 core.
- No blank state on WebGL/renderer/setup failure.
- Toggle repeat count never creates duplicate canvas.
- Dispose removes toggle, fallback, host, canvas, RAF, and Three resources.

## Risk Assessment

- Over-abstraction: keep helpers under focused modules, no scene framework.
- Hidden lifecycle leak: require dispose assertions after every route.
- Fallback regression: test forced failure before rollout.

## Security Considerations

No network, no remote models/textures, no eval, no untrusted assets.

## Next Steps

Proceed to `ch2-3-2`.
