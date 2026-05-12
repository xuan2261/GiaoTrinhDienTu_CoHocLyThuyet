# Phase 01: Baseline And Legacy Scope Audit

## Context Links

- [Plan](./plan.md)
- [Scout Report](./reports/scout-report.md)
- [Research Synthesis](./research/research-synthesis.md)
- `plans/260511-2245-decuong-style-simulation-ux-refresh/plan.md`

## Overview

Priority: P1. Status: Pending. Build exact Ch3 baseline before editing: active routes, dynamic invariants, legacy/bulk/pilot files, and test gaps.

## Key Insights

- Active Ch3 route count is 18 via `js/sims/ch3/dynamics-routes.js`.
- Legacy bulk file contains 22 route registrations and must not be loaded silently.
- Dynamic routes need physics-specific baseline, not only visual baseline.

## Requirements

- Functional: route matrix includes renderer/behavior/scene, handles, controls, animation flag, physics invariant/readout.
- Functional: legacy/bulk/pilot reconciliation table.
- Non-functional: no runtime edits in this phase except optional test/report additions.

## Architecture

Audit path: manifest/routes -> scene registry -> renderer registry -> behavior registry -> browser mount -> drag/play/equation evidence.

## Related Code Files

- Read: `js/sims/ch3/*.js`, `js/sim-dynamics.js`, `js/sim-professional-lab.js`, `js/sim-route-manifest.js`.
- Read: `js/routes/phase-05-ch3-dynamics-all-routes.js`, `js/routes/pilot-ch3-collision-solver.js`, deleted/indexed `js/routes/ch3/*`.
- Create: `plans/260512-0544-ch3-decuong-interaction-upgrade/reports/ch3-route-baseline-matrix.md`.
- Optional create: `tests/simulation-dynamics-invariants.spec.js` if current tests lack invariant coverage.

## Implementation Steps

1. List 18 active Ch3 routes from manifest and registration.
2. Record animation/play-pause support per route.
3. Record route invariant: `F=ma`, energy, momentum, restitution, residual, etc.
4. Inspect bulk legacy Ch3 file; map 22 legacy route ids against active 18.
5. Inspect pilot collision solver; decide reference/adapt/archive.
6. Capture representative screenshots: `ch3-2-2`, `ch3-3-1`, `ch3-6-2`, `ch3-7-2`.
7. Write baseline matrix and gap list.

## Todo List

- [ ] Create Ch3 active route matrix.
- [ ] Create Ch3 legacy/bulk/pilot reconciliation table.
- [ ] Capture dynamic invariant/readout evidence.
- [ ] Mark routes needing renderer polish vs behavior polish vs test updates.

## Verification / Tests

```powershell
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --routes ch3 --require-routes 18 --require-objectives --require-direct
python tools\smoke_simulation_scene_catalog.py --strict --routes ch3 --require-routes 18
python tools\smoke_simulation_renderer_contract.py --strict --routes ch3 --require-routes 18
python tools\audit_simulation_quality.py --all --routes ch3 --max-js-lines 220
python tools\smoke_simulation_runtime.py --routes ch3 --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
```

## Success Criteria

- Matrix covers 18/18 Ch3 routes and every Ch3 legacy/bulk/pilot item.
- Dynamic invariant gaps are explicit before implementation.
- Baseline failures documented, not hidden.

## Risk Assessment

- Risk: bulk file is tempting to use because it has many routes. Mitigation: active status requires route contract and file-size compliance.

## Security Considerations

- No external runtime dependency.
- Keep tests local/offline.

## Next Steps

Proceed Phase 02 after matrix completion.

## Unresolved Questions

Không có.
