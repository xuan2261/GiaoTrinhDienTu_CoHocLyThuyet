# Phase 02 Simulation Architecture Split

## Context Links

- [Plan](./plan.md)
- [System Architecture](../../docs/system-architecture.md)
- [Code Standards](../../docs/code-standards.md)

## Overview

Priority: P1. Status: Completed. Split large simulation files into maintainable shared kernels and topic modules while preserving all 58 current route behaviors.

## Key Insights

- Current files exceed maintainability target: `sim-statics`, `sim-kinematics`, `sim-dynamics`.
- User accepts more script files in `index.html`.
- No dynamic import because `file://` support is required.

## Requirements

Functional:
- Preserve `window.SIM_MAP` API for `loader.js`.
- Preserve route IDs and default rendering.
- Introduce `window.SimRegistry` or equivalent for controlled registration.

Non-functional:
- New implementation files target <200 lines.
- Script load order deterministic and tested.
- No generated fragment edits.

## Architecture

Shared kernels:
- `js/sim-vector-math.js`: vector, clamp, angle, projection, units.
- `js/sim-rendering.js`: axes, grids, arrows, handles, labels, trails, meters.
- `js/sim-interactions.js`: pointer/touch abstraction, drag handles, snap, keyboard nudging.
- `js/sim-lab-ui.js`: shell, panels, toolbar, legend, formula panel.
- `js/sim-assessment.js`: later assessment API; scaffold only here.
- `js/sim-route-manifest.js`: route metadata scaffold.

Topic modules:
- `js/sims/ch1/*.js`, `js/sims/ch2/*.js`, `js/sims/ch3/*.js`.

Registry:
- `js/simulations.js` imports globals already loaded and builds `window.SIM_MAP`.

## Related Code Files

Modify:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\index.html`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\simulations.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-core.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\system-architecture.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\code-standards.md`

Create:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-vector-math.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-rendering.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-interactions.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-lab-ui.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch1\*.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch2\*.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sims\ch3\*.js`

## Implementation Steps

1. Create shared kernel files with globals and minimal no-op-safe APIs.
2. Move one low-risk route per chapter into new module structure.
3. Update `index.html` script order: core -> kernels -> topic modules -> activities/assessment -> registry.
4. Migrate remaining routes in small batches, preserving behavior first.
5. Keep old domain files only as temporary adapters during migration.
6. Remove old large domain files from script order after all routes moved.
7. Extend runtime smoke to check new globals and exact route count.

## Todo List

- [x] Create kernel scripts.
- [x] Add new script order.
- [x] Migrate Ch1 routes.
- [x] Migrate Ch2 routes.
- [x] Migrate Ch3 routes.
- [x] Shrink registry to mapping only.
- [x] Update architecture docs.

## Verify / Tests

```powershell
Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
python -m compileall -q tools
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI --expect-runtime-routes 58 --check-mount-rollback
python tools\audit_simulation_quality.py --max-js-lines 220 --allow-legacy-adapters
npm run test:sim:browser -- --grep @route-mount
```

Verified on 2026-05-06:
- `python tools\test_simulation_architecture.py`: 4 passed.
- `npm run test:sim:unit`: pass.
- `npm run test:sim:quality`: pass.
- `npm run test:sim:browser:route-mount`: 58 passed.

## Success Criteria

- 58 routes mount in `file://`.
- No duplicate `.sim-container`.
- Old behavior visually comparable on representative routes.
- No route removed, renamed, or orphaned.

## Risk Assessment

Risk: script order break. Mitigation: exact global smoke and representative browser route tests.

Risk: migration hides behavior regressions. Mitigation: one chapter batch at a time; compare route list before/after.

## Security Considerations

No external runtime script introduced. Dev dependency not loaded by production app.

## Next Steps

Phase 3 upgrades shared shell/visual quality after architecture is safe.
