# Phase 05 - Ch1 Friction Centroid And Solver Routes

## Context Links

- [Phase 04](./phase-04-ch1-force-laws-supports-and-spatial-statics.md)
- `js/sims/ch1/ch1-friction-centroid-solver-scenes.js`
- `js/sims/ch1/ch1-friction-renderers.js`
- `js/sims/ch1/ch1-centroid-solver-renderers.js`
- `js/sims/ch1/ch1-solver-exercises-renderers.js`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Estimate | 12h |
| Goal | Upgrade 8 applied Ch1 routes: friction, centroid, and statics exercise solvers |

## Routes

`ch1-5-1`, `ch1-5-2`, `ch1-5-3`, `ch1-5-4`, `ch1-6-2`, `ch1-6-3`, `ch1-7-1`, `ch1-7-2`

## Key Insights

- Friction routes need state thresholds: hold/slip/self-locking.
- Centroid routes need geometric handles and weighted readout.
- Solver routes should feel like guided visual checking, not generic canvas.

## Requirements

### Functional

- Friction routes show normal force, friction cone/limit, incline angle, and hold/slip state.
- `ch1-5-3` must make cone/friction threshold obvious.
- Centroid routes show composite areas, removed cutouts, and centroid marker.
- Solver routes show step state, equation variables, and numeric comparison.
- Readouts use physics terms: `N`, `Fms`, `mu`, `alpha`, `x_C`, `y_C`, `R_A`, `R_B`.

### Non-Functional

- Do not reintroduce assessment panel.
- Solver interaction remains simple and offline.

## Architecture

```text
Friction/Centroid/Solver scenes
  -> route-specific state
  -> statics helper formulas
  -> renderer visual state
  -> readout cards + formula/equation panel
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-friction-centroid-solver-scenes.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-friction-centroid-solver-behaviors.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-friction-renderers.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-centroid-solver-scenes.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-centroid-solver-renderers.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-solver-exercises-scenes.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\ch1-solver-exercises-renderers.js` |
| Modify if needed | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-physics-statics.js` |
| Modify tests | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` |

## Implementation Steps

1. Audit current readout labels for all 8 routes.
2. Update friction behavior:
   - drag incline/load/contact force.
   - compute `N`, `Fms,max`, hold/slip margin.
3. Update friction renderers:
   - cone/limit visual.
   - red/green status.
   - no formula overlap.
4. Update centroid scenes:
   - make composite shapes explicit.
   - centroid marker with coordinate cards.
5. Update solver routes:
   - step selector/preset control.
   - equation card shows current step variables.
   - numeric checker readout visible but no assessment storage.
6. Add route-group tests.

## Todo List

- [ ] Friction state thresholds and visuals.
- [ ] Centroid geometry/readout polish.
- [ ] Solver step/equation panel.
- [ ] Ch1 applied tests.
- [ ] Run Ch1 full browser pass.

## Tests / Verify

```powershell
npm run test:sim:unit
npx playwright test tests/simulation-browser.spec.js --grep "@ch1-applied"
npm run test:sim:visual-quality
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct
python tools\audit_simulation_quality.py --all --max-js-lines 220
```

Route-specific assertions:

| Route | Verify |
|---|---|
| `ch1-5-3` | changing angle/mu changes hold/slip state |
| `ch1-5-4` | self-locking status changes at threshold |
| `ch1-6-2` | dragging/adjusting geometry changes centroid |
| `ch1-7-2` | numeric reactions/equation values stay finite |

## Success Criteria

- 8/8 routes have meaningful readouts and interaction.
- Friction thresholds are visually and numerically clear.
- Centroid routes show actual centroid marker and formula basis.
- Solver routes do not feel like generic placeholders.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Solver becomes assessment again | Keep local readout/checker only; no storage/checkpoint panel |
| Centroid formulas too dense | Use formula panel, not canvas text |
| Friction state flickers near threshold | Add small display tolerance/hysteresis for label only |

## Security Considerations

- No persistence changes.
- Numeric inputs must be bounded by control min/max.

## Next Steps

Proceed to Ch2 motion basics.

## Unresolved Questions

Không có.
