# Phase 01: Baseline And Legacy Scope Audit

## Context Links

- [Plan](./plan.md)
- [Scout Report](./reports/scout-report.md)
- [Research Synthesis](./research/research-synthesis.md)
- `plans/260511-2245-decuong-style-simulation-ux-refresh/plan.md`

## Overview

Priority: P1. Status: Pending. Build exact Ch2 baseline before editing: active routes, graph/animation state, legacy/pilot files, and test gaps.

## Key Insights

- Active Ch2 route count is 15 via `js/sims/ch2/kinematics-routes.js`.
- Existing tests already include semantic cases for `ch2-1-1` and `ch2-5-2`.
- Pilot projectile is reference only unless reconciled.

## Requirements

- Functional: route matrix includes renderer/behavior/scene, handles, controls, animation flag, graph/cursor presence, readouts.
- Non-functional: no runtime edits in this phase except optional test/report additions.

## Architecture

Audit path: manifest/routes -> scene registry -> renderer registry -> behavior registry -> browser mount -> drag/time/play evidence.

## Related Code Files

- Read: `js/sims/ch2/*.js`, `js/sim-kinematics.js`, `js/sim-professional-lab.js`, `js/sim-route-manifest.js`.
- Read: `js/routes/pilot-ch2-particle-motion.js`, deleted/indexed `js/routes/ch2/*` via git status/history.
- Create: `plans/260512-0544-ch2-decuong-interaction-upgrade/reports/ch2-route-baseline-matrix.md`.
- Optional create: `tests/simulation-chapter-ux.spec.js` if chapter filtering/reporting is needed.

## Implementation Steps

1. List 15 active Ch2 routes from manifest and registration.
2. Record animation/play-pause support per route.
3. Record graph/time cursor affordance per route.
4. Compare with DeCuong motion demo style.
5. Inspect `js/routes/pilot-ch2-particle-motion.js`; decide reference/adapt/archive.
6. Capture representative screenshots: `ch2-1-1`, `ch2-1-2`, `ch2-4-3`, `ch2-5-2`.
7. Write baseline matrix and gap list.

## Todo List

- [ ] Create Ch2 active route matrix.
- [ ] Create Ch2 legacy/pilot reconciliation table.
- [ ] Capture graph/animation evidence.
- [ ] Mark routes needing renderer polish vs behavior polish vs test updates.

## Verification / Tests

```powershell
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --routes ch2 --require-routes 15 --require-objectives --require-direct
python tools\smoke_simulation_scene_catalog.py --strict --routes ch2 --require-routes 15
python tools\smoke_simulation_renderer_contract.py --strict --routes ch2 --require-routes 15
python tools\audit_simulation_quality.py --all --routes ch2 --max-js-lines 220
python tools\smoke_simulation_runtime.py --routes ch2 --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
```

## Success Criteria

- Matrix covers 15/15 Ch2 routes and every Ch2 legacy/pilot item.
- Graph/animation gaps are explicit before implementation.
- Baseline failures documented, not hidden.

## Risk Assessment

- Risk: graph route looks nonblank but labels/cursor unusable. Mitigation: matrix includes graph-specific usability field.

## Security Considerations

- No external runtime dependency.
- Keep tests local/offline.

## Next Steps

Proceed Phase 02 after matrix completion.

## Unresolved Questions

Không có.
