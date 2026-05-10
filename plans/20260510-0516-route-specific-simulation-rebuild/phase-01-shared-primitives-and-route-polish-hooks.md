# Phase 01: Shared Primitives And Route Polish Hooks

## Context Links

- Overview: [plan.md](./plan.md)
- DeCuong interaction evidence: `DeCuong_CoHocLyThuyet.html:2479`, `DeCuong_CoHocLyThuyet.html:2699`, `DeCuong_CoHocLyThuyet.html:2708`, `DeCuong_CoHocLyThuyet.html:3321`, `DeCuong_CoHocLyThuyet.html:3608`
- Current shared mount chain: `js/sim-lab-ui.js:74`, `js/sim-professional-lab.js:340`, `js/sim-professional-lab.js:800`, `js/sim-professional-lab.js:848`

## Overview

- Priority: P1
- Status: pending
- Brief description: add only the minimum shared hooks that route modules need for route-specific polish; do not introduce a new shell or framework layer.

## Key Insights

- The current lab already centralizes controls, readouts, hint text, and render dispatch (`js/sim-professional-lab.js:290`, `js/sim-professional-lab.js:330`, `js/sim-professional-lab.js:925`).
- Active-handle metadata and touch-safe interaction are already test-locked (`js/sim-interactions.js:67`, `tests/simulation-interaction-engine.spec.js:56`, `tests/simulation-interaction-engine.spec.js:135`).
- Existing shared helpers already expose particles, trails, spring handles, glow, and DOM overlay primitives; plan should reuse them instead of adding a second abstraction (`js/sim-animation-engine.js:37`, `js/sim-animation-engine.js:277`, `js/sim-interaction-enhancements.js:260`, `js/sim-visual-helpers.js:195`, `js/sim-route-renderer-primitives.js:48`).

## Requirements

- Keep `file://` runtime and dev-only QA model intact (`README.md:3`, `package.json:5`).
- Preserve `data-route-id`, `data-renderer-id`, `data-behavior-id`, `data-handle-ids`, and `data-active-handle-id` contracts (`js/sim-professional-lab.js:274`, `js/sim-professional-lab.js:934`, `js/sim-interactions.js:67`).
- Do not edit `js/pages.js` or change canonical route registrations (`README.md:79`, `js/sims/ch1/statics-routes.js:15`, `js/sims/ch2/kinematics-routes.js:15`, `js/sims/ch3/dynamics-routes.js:15`).

## Architecture

- Data in: pointer/touch/keyboard and slider/button events flow through `js/sim-interactions.js:57` and `js/sim-professional-lab.js:340`.
- Transform: shared phase may only add opt-in helpers for overlay panels, drag polish, trail/particle lifecycles, and readout synchronization; route modules remain the source of scene identity.
- Data out: renderers still own the final canvas/overlay output via `rendererEntry.render(...)` and route-specific structural marks (`js/sim-professional-lab.js:925`, `tests/simulation-visual-quality.spec.js:83`).

## Related Code Files

- Modify: `js/sim-route-renderer-primitives.js`, `js/sim-professional-lab.js`, `js/sim-animation-engine.js`, `js/sim-interaction-enhancements.js`, `js/sim-visual-helpers.js`
- Do not modify: `js/pages.js`, `js/sims/ch1/statics-routes.js`, `js/sims/ch2/kinematics-routes.js`, `js/sims/ch3/dynamics-routes.js`
- Create during implementation only: phase snapshots under `backups/route-specific-simulation-rebuild/phase-01/`

## Implementation Steps

1. Snapshot the shared files because rollback cannot rely on git in this workspace.
2. Add or refine opt-in primitives for route-specific overlays, focus cues, trails, and lightweight animation feedback; do not add a generic family renderer.
3. Keep `SimProfessionalLab.mount(routeId)` contracts stable and route-owned metadata unchanged while exposing only the extra hook points needed by chapter files (`js/sim-professional-lab.js:841`, `js/sim-professional-lab.js:965`).
4. Smoke one representative route per chapter after each shared edit before moving to chapter-wide passes.

## Todo List

- [ ] Snapshot shared JS files
- [ ] Limit shared edits to reusable polish hooks
- [ ] Verify metadata contracts unchanged
- [ ] Spot-smoke Ch1, Ch2, Ch3 representative routes

## Success Criteria

- Shared helpers make route-specific polish easier without changing route ids or introducing fallback scenes/renderers/behaviors.
- `tests/simulation-interaction-engine.spec.js:56` and `tests/simulation-visual-quality.spec.js:71` still describe the same contracts after the shared phase.
- No shared edit forces a second shell, external asset, or build step.

## Risk Assessment

- High: broad shared edits break all 58 routes. Mitigation: keep phase opt-in, smoke after every edit, and defer route art changes to chapter phases.
- Medium: `js/sim-professional-lab.js` is already large. Mitigation: keep edits narrow and prefer existing helper modules before adding new core logic.
- Medium: overusing particles/glow harms readability. Mitigation: treat DeCuong as the ceiling: simple controls, live readouts, restrained motion.

## Security Considerations

- No new network calls, storage keys, or HTML injection paths.
- Keep overlay text on `textContent`/KaTeX path only; do not switch to unsafe HTML composition.

## Test Matrix

- Unit: `npm run test:sim:unit`
- Integration: `python tools/smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup`
- Browser spot: `npm run test:sim:browser -- --grep @direct-drag`

## Rollback Plan

- Restore only the shared helper snapshots from `backups/route-specific-simulation-rebuild/phase-01/`.
- If rollback is required, do not touch chapter renderer/behavior files yet.

## Next Steps

- Unblock Ch1/Ch2/Ch3 route-specific passes with the new shared hooks in place.
