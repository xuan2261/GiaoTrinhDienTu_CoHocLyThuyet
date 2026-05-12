# Phase 05: Ch3 QA Docs And Release Handoff

## Context Links

- [Plan](./plan.md)
- `package.json`
- `tests/simulation-*.spec.js`
- `docs/project-changelog.md`
- `docs/project-roadmap.md`

## Overview

Priority: P1. Status: Pending. Lock Ch3 quality, run full release gates, update docs, and close the 3-plan simulation UX upgrade sequence.

## Key Insights

- Ch3 likely touches shared animation/physics helpers.
- Final Ch3 completion should run full simulation release, not only Ch3 filtered gates.

## Requirements

- Functional: Ch3 routes pass static, browser, visual, interaction, and release gates.
- Functional: all legacy/pilot route decisions across Ch1/Ch2/Ch3 are documented.
- Non-functional: docs match active runtime; no stale architecture claims without historical context.

## Architecture

QA stack: Python static smoke -> Node syntax/unit -> Playwright browser -> full release -> docs sync -> final QA report.

## Related Code Files

- Modify docs if needed: `docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/design-guidelines.md`, `docs/project-roadmap.md`, `docs/project-changelog.md`.
- Modify tests if added: `tests/simulation-chapter-ux.spec.js`, `tests/simulation-dynamics-invariants.spec.js`, `tests/simulation-test-utils.js`.
- Do not manually edit: `js/pages.js`.

## Implementation Steps

1. Run Ch3 route-filtered static gates.
2. Run unit and browser gates.
3. Run full simulation release gate.
4. Update docs/changelog with Ch3 UX upgrade and legacy/pilot decisions.
5. Write final QA report under this plan.
6. Mark Ch1/Ch2/Ch3 child plans and parent plan status recommendations.

## Todo List

- [ ] Ch3 static gates pass.
- [ ] Ch3 browser gates pass.
- [ ] Full `npm run test:sim:release` passes or documented blocker exists.
- [ ] Docs/changelog synced.
- [ ] Final QA report saved.

## Verification / Tests

```powershell
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --routes ch3 --require-routes 18 --require-objectives --require-direct
python tools\smoke_simulation_scene_catalog.py --strict --routes ch3 --require-routes 18
python tools\smoke_simulation_renderer_contract.py --strict --routes ch3 --require-routes 18
python tools\smoke_simulation_runtime.py --routes ch3 --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:semantic
npm run test:sim:browser
npm run test:sim:visual-quality
python tools\audit.py
npm run test:sim:release
```

## Success Criteria

- Ch3 plan can be marked completed with QA evidence.
- Full simulation release gate is clean before final handoff.
- Parent route-specific simulation rebuild can be closed or reduced to leftover docs only.

## Risk Assessment

- Risk: release gate fails from existing dirty worktree. Mitigation: record exact failing files/routes and separate pre-existing blockers from Ch3 regressions.

## Security Considerations

- Confirm no confidential files added.
- Confirm no new external runtime dependency.

## Next Steps

Close/update [Route-Specific Simulation Rebuild](../20260510-0516-route-specific-simulation-rebuild/plan.md) after child plans complete.

## Unresolved Questions

Không có.
