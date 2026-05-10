# Phase 04 - Ch1 Force Laws Supports And Spatial Statics

## Context Links

- [Phase 03](./phase-03-interaction-grammar-and-control-model.md)
- `js/sims/ch1/ch1-force-law-scenes.js`
- `js/sims/ch1/ch1-force-law-renderers.js`
- `js/sims/ch1/ch1-support-spatial-scenes.js`
- `js/sims/ch1/ch1-support-renderers.js`
- `js/sims/ch1/ch1-spatial-renderers.js`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Estimate | 16h |
| Goal | Upgrade 17 Ch1 core statics routes to DeCuong-like direct manipulation with correct force/support/spatial statics readouts |

## Routes

`ch1-1-3`, `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-1-8`, `ch1-2-1`, `ch1-2-3`, `ch1-2-6`, `ch1-3-1`, `ch1-3-2`, `ch1-3-3`, `ch1-3-4`, `ch1-3-6`, `ch1-3-7`, `ch1-4-1`, `ch1-4-2`, `ch1-4-4`

## Key Insights

- Ch1 is where DeCuong samples are strongest: vector addition and beam/support reactions.
- These routes must prioritize force geometry clarity and equation cards.
- Spatial routes can stay 2.5D schematic, but readouts must not be generic.

## Requirements

### Functional

- Force vectors drag from head/endpoints with immediate magnitude/angle/resultant updates.
- Moment routes show lever arm, rotation sense, and `M = F.d`.
- Parallelogram route matches DeCuong affordance: F1/F2 endpoints, dashed construction, resultant.
- Support routes show real support symbol, load, reaction direction, and equilibrium equations where useful.
- FBD route shows removed supports and replacement reactions clearly.
- Spatial routes show axis/resultant/moment components in readable cards.

### Non-Functional

- Keep renderers route-specific.
- Use shared primitives only for arrows, beams, supports, labels.
- Avoid more than 220 lines per touched JS file.

## Architecture

```text
Ch1 scene config
  -> route objective
  -> force/support state
  -> behavior handles
  -> renderer uses shared primitives
  -> readout cards + optional equation panel
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-force-law-scenes.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-force-law-renderers.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-force-law-behaviors.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-support-spatial-scenes.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-support-spatial-behaviors.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-support-renderers.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-spatial-renderers.js` |
| Modify if needed | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-physics-statics.js` |
| Modify tests | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` |

## Implementation Steps

1. Start with `ch1-2-3` as visual reference route.
2. Add/update readout keys for force magnitude, angle, resultant, moment, reaction.
3. Add equation panel content for:
   - parallelogram resultant
   - moment
   - beam/support equilibrium
   - FBD replacement reactions
4. Update force law renderers:
   - clear vector colors
   - dashed construction
   - labels not overlapping arrows
   - visible handle affordance
5. Update support renderers:
   - pin/roller/fixed/smooth support icons.
   - reaction arrows scale to value.
   - load position can be dragged where route teaches load position.
6. Update behaviors:
   - no generic point readout.
   - route handles set real state fields.
7. Add targeted browser tests for representative Ch1 routes.
8. Run route mount and renderer contract gates.

## Todo List

- [ ] Upgrade `ch1-2-3` parallelogram to DeCuong-level interaction.
- [ ] Upgrade force/moment/couple routes.
- [ ] Upgrade FBD and support reactions.
- [ ] Upgrade spatial statics display/readouts.
- [ ] Add Ch1 representative tests.
- [ ] Verify all 17 Ch1 routes.

## Tests / Verify

```powershell
npm run test:sim:unit
python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58
npx playwright test tests/simulation-browser.spec.js --grep "@ch1-core-statics"
npm run test:sim:visual-quality
npm run test:sim:browser:route-mount
```

Route-specific assertions:

| Route | Verify |
|---|---|
| `ch1-2-3` | drag F1/F2 changes resultant magnitude and angle |
| `ch1-1-4` | drag force/arm changes moment sign or magnitude |
| `ch1-3-1` | drag load/surface changes reaction readout |
| `ch1-2-6` | FBD shows replacement reaction labels |
| `ch1-4-4` | equilibrium status changes with component state |

## Success Criteria

- 17/17 Ch1 core statics routes visually distinct and readable.
- Representative direct drags change physical values.
- Dark and light theme pass for Ch1 samples.
- No renderer duplicate/overwrite warning.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Spatial statics too abstract | Keep simple 2.5D schematic with component cards |
| Equation overlays overlap vectors | Prefer formula panel for dense equations |
| Ch1 files get too large | Split by route group before adding more logic |

## Security Considerations

- Equation text controlled by static route config.
- No dynamic HTML from user input.

## Next Steps

Proceed to Ch1 friction/centroid/solver routes.

## Unresolved Questions

Không có.
