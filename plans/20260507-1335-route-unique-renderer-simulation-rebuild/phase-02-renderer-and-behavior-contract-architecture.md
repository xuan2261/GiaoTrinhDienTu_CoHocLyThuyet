# Phase 02 - Renderer And Behavior Contract Architecture

## Context Links

- [Renderer Contract Research](./research/renderer-contract-research.md)
- [Red Team Review](./reports/red-team-review.md)
- `docs/code-standards.md`

## Overview

Priority: P0. Status: Complete. Introduce route renderer and behavior registries without migrating all routes yet. Keep lab shell and route count stable.

## Key Insights

- `family` can remain as metadata, but not as final renderer selector.
- Shared low-level primitives are acceptable; route-level renderer functions are not.

## Requirements

- Each route can register `rendererId`, render function, behavior contract.
- `SimProfessionalLab.mount(routeId)` resolves renderer and behavior by route id.
- Missing renderer fails visibly in dev/QA and falls back only for non-strict legacy diagnostics.
- Files stay kebab-case and focused.

## Architecture

```text
SimSceneRegistry -> scene metadata
SimRouteRenderers -> dedicated render function per route
SimRouteBehaviors -> controls, derived state, interactions
SimProfessionalLab -> shell orchestration only
```

## Related Code Files

| Action | File |
|---|---|
| Create | `js/sim-route-renderer-registry.js` |
| Create | `js/sim-route-behavior-registry.js` |
| Create/modify | `js/sim-route-renderer-primitives.js` |
| Modify | `js/sim-professional-lab.js` |
| Modify | `js/sim-scene-templates.js` |
| Modify | `index.html` |
| Modify | `tools/smoke_simulation_runtime.py` |

## Implementation Steps

1. Add `SimRouteRenderers.register(routeId, rendererId, renderFn, metadata)`.
2. Add `SimRouteRenderers.entries()`, `get(routeId)`, `identity(routeId)`.
3. Add `SimRouteBehaviors.register(routeId, behavior)`.
4. Move only primitive helpers into shared primitives, not route renderers.
5. Update `SimProfessionalLab` to call `renderer.render(ctx, scene, state, derived)`.
6. Preserve current scene template fallback only behind explicit legacy diagnostic path.
7. Add debug metadata to lab DOM: `data-route-id`, `data-renderer-id`, `data-behavior-id`.
8. Update script load order in `index.html`.

## Todo List

- [x] Add renderer registry.
- [x] Add behavior registry.
- [x] Update lab mount path.
- [x] Update runtime smoke expected globals.
- [x] Keep 58 routes mounted.

## Success Criteria

- `SIM_MAP` remains 58.
- Runtime smoke sees `SimRouteRenderers` and `SimRouteBehaviors`.
- New strict gate reports missing route renderers, not broken runtime.
- No browser route mount regression.

## Verify Gate

```powershell
node --check js\sim-route-renderer-registry.js
node --check js\sim-route-behavior-registry.js
node --check js\sim-professional-lab.js
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --malformed-assessment-storage
npm run test:sim:browser:route-mount
```

## Risk Assessment

- Risk: fallback hides missing renderer. Mitigation: strict gate fails missing renderer; fallback logs route id and never counts as pass.

## Security Considerations

No external scripts. No new persistence.

## Next Steps

Migrate route groups to dedicated renderers.


