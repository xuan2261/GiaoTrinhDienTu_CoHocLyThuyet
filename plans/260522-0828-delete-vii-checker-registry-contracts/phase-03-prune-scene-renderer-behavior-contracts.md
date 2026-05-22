---
title: "Phase 03 - Prune scene, renderer, behavior contracts"
status: planned
priority: P1
dependsOn: [phase-02-remove-runtime-manifest-and-adapters.md]
---

# Phase 03 - Prune scene, renderer, behavior contracts

## Context Links

- Scene registry modules under `js/sims/ch*/`
- Renderer registry: `js/sim-route-renderer-registry.js`
- Behavior registry: `js/sim-route-behavior-registry.js`
- Shared lab route-specific handles: `js/sim-professional-lab.js`

## Overview

Remove route-specific scene, renderer, behavior, and direct-handle code for the six deleted checker routes.

## Requirements

- Scene registry exposes no deleted ids.
- Renderer registry exposes no deleted ids.
- Behavior registry exposes no deleted ids.
- Remove now-empty modules and their script tags only when they contain no active route code.
- Preserve adjacent active routes such as `ch3-6-2`, `ch3-6-3`, `ch2-5-*`.

## Architecture

Prune by ownership:

- CH1: `ch1-solver-exercises-*` likely becomes empty after removing `ch1-7-*`; remove script loads if module has no active exports.
- CH2: `ch2-kinematics-exercises-renderers.js` likely becomes empty; `ch2-kinematics-behaviors-b.js` and scene modules contain active routes, so prune exact branches only.
- CH3: `ch3-dynamics-all-18-scenes.js`, `ch3-collision-exercises-renderers.js`, `ch3-dynamics-theorem-collision-behaviors.js` also cover active collision routes; prune exact checker entries only.
- Contract fallback files `js/sims/zz-simulation-contract-*` must not keep placeholder registrations for deleted ids.

## Related Code Files

Modify as needed:

- `js/sims/ch1/ch1-solver-exercises-scenes.js`
- `js/sims/ch1/ch1-solver-exercises-renderers.js`
- `js/sims/ch1/ch1-solver-exercises-behaviors.js`
- `js/sims/ch2/ch2-kinematics-scenes.js`
- `js/sims/ch2/ch2-relative-plane-motion-scenes.js`
- `js/sims/ch2/ch2-kinematics-exercises-renderers.js`
- `js/sims/ch2/ch2-kinematics-behaviors-b.js`
- `js/sims/ch3/ch3-dynamics-all-18-scenes.js`
- `js/sims/ch3/ch3-collision-exercises-renderers.js`
- `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js`
- `js/sims/zz-simulation-contract-scenes.js`
- `js/sims/zz-simulation-contract-renderers.js`
- `js/sims/zz-simulation-contract-behaviors.js`
- `js/sim-professional-lab.js`
- `index.html` if now-empty script modules are removed

## Implementation Steps

1. Remove CH1 scene/renderer/behavior registrations for `ch1-7-1`, `ch1-7-2`.
2. If CH1 checker files contain no active route code, delete those files and remove script tags.
3. Remove CH2 scene rows, defaults, readout policies, renderers, and behavior entries for `ch2-7-1`, `ch2-7-2`.
4. Remove CH3 scene rows, defaults, static/append policies, renderers, and behavior entries for `ch3-7-1`, `ch3-7-2`.
5. Remove route-specific direct-handle branches in `js/sim-professional-lab.js` for `ch2-7-*`, `ch3-7-*`.
6. Check legacy `js/routes/phase-05-ch3-dynamics-all-routes.js`; if inactive, leave as historical unless active tests load it. If active, remove deleted ids.
7. Re-run focused absence tests.

## Todo List

- [ ] Prune CH1 contracts.
- [ ] Prune CH2 contracts.
- [ ] Prune CH3 contracts.
- [ ] Prune shared lab route-specific branches.
- [ ] Remove script tags for deleted now-empty modules.
- [ ] Verify no active runtime JS registry contains deleted route ids.

## Verification / Tests

```powershell
node --check js\sim-professional-lab.js
Get-ChildItem js\sims -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
npm run test:sim:unit
npx playwright test tests/exercise-section-no-simulation.spec.js
```

Focused absence target:

```powershell
rg "ch1-7-1|ch1-7-2|ch2-7-1|ch2-7-2|ch3-7-1|ch3-7-2" js
```

Allowed after Phase 03: content route references in `index.html`, `js/loader.js` no-simulation denylist, generated `js/pages.js`/content bundle if present. No simulation registry/contract references.

## Success Criteria

- No deleted id appears in active simulation registry/contract modules.
- Remaining 52 routes still have scene, renderer, behavior contracts.
- Browser console has no missing-script or undefined-adapter errors.

## Risk Assessment

- Whole-file deletion can break `index.html` script order if a file also registers active routes. Confirm with `rg "registry.register|sceneRegistry.register|behavior"` before deleting.
- `sim-professional-lab.js` route branches may be used only by deleted ids; prune carefully to avoid changing generic handle behavior.

## Security Considerations

No security impact.

## Next Steps

Proceed to Phase 04 for QA tooling and baseline count updates.
