# Phase 01: Baseline And Legacy Scope Audit

## Context Links

- [Plan](./plan.md)
- [Scout Report](./reports/scout-report.md)
- [Research Synthesis](./research/research-synthesis.md)
- `plans/260511-2245-decuong-style-simulation-ux-refresh/plan.md`
- `DeCuong_CoHocLyThuyet.html`

## Overview

Priority: P1. Status: Completed. Built exact Ch1 baseline before editing: active routes, legacy/pilot files, visual gaps, and test gaps.

## Key Insights

- Active Ch1 route count is 25 via `js/sims/ch1/statics-routes.js`.
- Worktree has many deleted indexed legacy route files; do not restore blindly.
- User wants DeCuong thao tác first, not new physics engine.

## Requirements

- Functional: create Ch1 route matrix with current renderer, behavior, scene, handles, controls, readouts, and legacy/pilot relation.
- Non-functional: no runtime edits in this phase except optional test/report additions.

## Architecture

Audit path: manifest/routes -> scene registry -> renderer registry -> behavior registry -> browser mount -> screenshot/readout/handle evidence.

## Related Code Files

- Read: `js/sims/ch1/*.js`, `js/sim-statics.js`, `js/sim-professional-lab.js`, `js/sim-route-manifest.js`.
- Read: `js/routes/pilot-ch1-parallelogram.js`, deleted/indexed `js/routes/ch1/*` via git status/history.
- Created: `plans/260512-0544-ch1-decuong-interaction-upgrade/reports/ch1-route-baseline-matrix.md`.
- Optional create: `tests/simulation-chapter-ux.spec.js` only if existing tests cannot filter/report Ch1 cleanly.

## Implementation Steps

1. List 25 active Ch1 routes from manifest and route registration.
2. For each route, record scene id, renderer id, behavior id, handle ids, controls, readout labels.
3. Compare with DeCuong demos: parallelogram force and beam support interaction.
4. Inspect `js/routes/pilot-ch1-parallelogram.js`; decide reference/adapt/archive.
5. Record git worktree legacy state: deleted `js/routes/ch1/*`, deleted deprecated pilot, untracked pilot.
6. Capture representative screenshots: `ch1-2-3`, `ch1-3-1`, `ch1-5-3`, `ch1-7-2`.
7. Write baseline matrix and gap list.

## Todo List

- [x] Create Ch1 active route matrix.
- [x] Create Ch1 legacy/pilot reconciliation table.
- [x] Capture representative visual/readout evidence.
- [x] Mark routes needing renderer polish vs behavior polish vs only CSS polish.

## Verification / Tests

```powershell
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --routes ch1 --require-routes 25 --require-objectives --require-direct
python tools\smoke_simulation_scene_catalog.py --strict --routes ch1 --require-routes 25
python tools\smoke_simulation_renderer_contract.py --strict --routes ch1 --require-routes 25
python tools\audit_simulation_quality.py --all --routes ch1 --max-js-lines 220
python tools\smoke_simulation_runtime.py --routes ch1 --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
```

## Success Criteria

- Matrix covers 25/25 Ch1 routes and every Ch1 legacy/pilot item.
- No route enters implementation without known current failure/gap.
- Any test failure is documented as baseline, not hidden.

## Risk Assessment

- Risk: baseline tests fail due dirty worktree unrelated to Ch1. Mitigation: record exact failure and scope before fixing.
- Risk: legacy files confuse active runtime. Mitigation: matrix marks active vs reference vs remove.

## Security Considerations

- No new network dependency.
- Do not load external CDN in tests except existing KaTeX fallback behavior.

## Next Steps

Proceed Phase 02 only after matrix is complete.

## Unresolved Questions

Không có.
