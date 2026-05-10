# Phase 02 Simulation Runtime Foundation

## Context Links

- [Plan](./plan.md)
- [Offline Interaction Research](./research/researcher-01-offline-interaction-patterns.md)
- [Red Team Review](./reports/red-team-review.md)
- [Simulation Runtime Foundation Report](./reports/simulation-runtime-foundation-report.md)

## Overview

Priority: P1. Status: Complete. Refactor simulation runtime to support many interactions without growing one giant file.

## Key Insights

- Current `js/simulations.js` violates maintainability by size.
- Static script loading must work with `file://`.
- Existing `window.SIM_MAP` contract should stay compatible with `loader.js`.
- Current runtime has no shared teardown for `resize` listeners or `requestAnimationFrame` loops when route changes.

## Requirements

| Type | Requirement |
|---|---|
| Functional | Preserve all 18 existing simulations |
| Functional | Create shared helpers for canvas, controls, drag, labels, numeric formatting |
| Functional | Add mount/dispose lifecycle so route changes stop animation loops and remove listeners |
| Functional | Create route registry that can merge Ch1/Ch2/Ch3 modules |
| Non-functional | No dynamic import, no bundler, no network |
| Non-functional | New JS files kebab-case, focused, under practical size |

## Architecture

Proposed script-tag modules:

| File | Responsibility |
|---|---|
| `js/sim-core.js` | shared utility and base UI helpers |
| `js/sim-statics.js` | Ch1 simulations |
| `js/sim-kinematics.js` | Ch2 simulations |
| `js/sim-dynamics.js` | Ch3 simulations |
| `js/sim-activities.js` | checker/scoring helpers |
| `js/simulations.js` | compatibility registry, defines `window.SIM_MAP` |

Load order in `index.html`: core -> chapter modules -> activities -> registry.

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\index.html` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\simulations.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css` |
| Create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-core.js` |
| Create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-statics.js` |
| Create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-kinematics.js` |
| Create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-dynamics.js` |
| Create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-activities.js` |
| Create | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\smoke_simulation_runtime.py` |

## Implementation Steps

1. Create a simulation lifecycle contract: mount returns optional `dispose()`.
2. Update `loader.js` to dispose the active simulation before replacing page content.
3. Move shared utility functions from `js/simulations.js` into `js/sim-core.js`.
4. Move existing Ch1 sims into `js/sim-statics.js`.
5. Move existing Ch2 sims into `js/sim-kinematics.js`.
6. Move existing Ch3 sims into `js/sim-dynamics.js`.
7. Keep `window.SIM_MAP` produced by `js/simulations.js`.
8. Consolidate duplicate `.sim-*` CSS rules.
9. Add guards: if module missing, log clear warning, not blank page.

## Todo List

- [x] Define `window.SimCore`.
- [x] Add route-change teardown for active simulation.
- [x] Define `window.SimStatics`, `window.SimKinematics`, `window.SimDynamics`.
- [x] Keep existing route ids unchanged.
- [x] Update script order in `index.html`.
- [x] Remove duplicate simulation CSS.
- [x] Validate all current 18 routes.

## Tests And Verification

```powershell
node --check js\sim-core.js
node --check js\sim-statics.js
node --check js\sim-kinematics.js
node --check js\sim-dynamics.js
node --check js\sim-activities.js
node --check js\simulations.js
node --check js\loader.js
python tools\audit.py
python tools\smoke_simulation_routes.py
python tools\smoke_simulation_runtime.py
```

Manual route smoke:

- Ch1: `ch1-1-4`, `ch1-1-6`, `ch1-2-3`, `ch1-3-3`, `ch1-4-4`, `ch1-6-2`.
- Ch2: `ch2-1-1`, `ch2-1-3`, `ch2-2-2`, `ch2-3-2`, `ch2-4-3`, `ch2-5-1`.
- Ch3: `ch3-2-2`, `ch3-2-3`, `ch3-4-1`, `ch3-5-2`, `ch3-5-4`, `ch3-6-2`.

## Success Criteria

- All existing simulations render same or better.
- No duplicate injection.
- Start simulation -> navigate away leaves no active animation loop or resize listener.
- `window.SIM_MAP` still available to `loader.js`.
- App works from `file://`.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Split causes load-order bug | Explicit script order, defensive registry |
| Regression in existing sims | Route-by-route smoke before adding new work |
| Large chapter modules keep growing | Split per-simulation/topic modules before Phase 03 growth |

## Security Considerations

No external scripts. No user data changes.

## Next Steps

Proceed to Ch1 expansion after foundation stable.
