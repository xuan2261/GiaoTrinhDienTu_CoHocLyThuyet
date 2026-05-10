# Phase 02 Route Scene Registry Architecture

## Context Links

- [Plan](./plan.md)
- [Architecture Research](./research/root-cause-and-architecture-research.md)
- [Red Team Review](./reports/red-team-review.md)
- [System Architecture](../../docs/system-architecture.md)

## Overview

Priority: P1. Status: Completed.

Introduce route-scene architecture while preserving `SIM_MAP`, thin adapters, and existing lab shell. This phase creates the seam for per-route scenes but does not need final content for all 58 routes.

## Key Insights

- Do not replace router; fix scene selection below `SimProfessionalLab.mount(routeId)`.
- Keep current renderers as temporary fallback only.
- Split registry, templates, and catalog files to avoid one giant file.

## Requirements

- Add `SimSceneRegistry`.
- Add template renderer dispatch.
- Modify `SimProfessionalLab.mount(routeId)` to look up route scene first.
- Keep legacy fallback for unmigrated routes until Phase 11.
- Add script load order for registry/templates and future scene files.

## Architecture

```text
index.html
  sim-scene-registry.js
  sim-scene-templates.js
  sim-professional-lab.js
  sims/ch*/route-scene-files.js
  sim-statics/kinematics/dynamics adapters
  sims/ch*/route-registration.js
  simulations.js
```

`SimProfessionalLab.mount(routeId)`:

1. `const scene = SimSceneRegistry.get(routeId)`.
2. If scene exists: create route-specific lab.
3. Use `scene.template` + `scene.initialState`.
4. Generate controls/readouts from scene definition.
5. If missing: legacy fallback logs warning.

## Related Code Files

| Action | Path | Notes |
|---|---|---|
| Create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-scene-registry.js` | Registry API: register, registerMany, get, entries. |
| Create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-scene-templates.js` | Template renderer dispatch and common helpers. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-professional-lab.js` | Use scene registry; keep physics exports. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\index.html` | Add script tags in deterministic order. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\smoke_simulation_runtime.py` | Add expected globals if needed. |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\package.json` | Include syntax checks for new JS files. |

## Implementation Steps

1. Implement `SimSceneRegistry` with defensive validation and overwrite warnings.
2. Implement `SimSceneTemplates` with:
   - `drawGridBase`
   - route-safe clamp/math helpers
   - template lookup by name
   - deterministic draw contract
3. Refactor `SimProfessionalLab`:
   - keep `mount(routeId)` public API
   - support `scene.getAssessmentState`
   - build controls from scene config
   - expose `sceneSignature(routeId)` for static/browser tests
4. Add index script order.
5. Add minimal placeholder scenes for representative routes only if needed to validate seam.
6. Keep current legacy fallback until all content phases complete.

## Todo List

- [x] Add scene registry.
- [x] Add scene templates dispatch.
- [x] Refactor `SimProfessionalLab.mount`.
- [x] Update script order.
- [x] Update syntax/runtime smoke tests.
- [x] Confirm no route count drift.

## Success Criteria

- Existing 58 route map still mounts.
- New registry global exists.
- Representative scene can render through new path.
- Legacy fallback warning is visible for unmigrated routes.

## Phase Tests

```powershell
node --check js\sim-scene-registry.js
node --check js\sim-scene-templates.js
node --check js\sim-professional-lab.js
npm run test:sim:unit
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimSceneRegistry,SimSceneTemplates --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --malformed-assessment-storage
npm run test:sim:browser:route-mount
```

## Risk Assessment

- Risk: script order breaks `file://`. Mitigation: runtime smoke and browser route mount.
- Risk: fallback masks missing scenes. Mitigation: strict catalog gate in Phase 11 requires zero fallback.

## Security Considerations

All scene data is local static JS. Validate registry input to avoid runtime exceptions from malformed scene definitions.

## Next Steps

Completed.

Unresolved questions: none.
