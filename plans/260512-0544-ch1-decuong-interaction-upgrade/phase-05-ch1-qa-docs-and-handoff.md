# Phase 05: Ch1 QA Docs And Handoff

## Context Links

- [Plan](./plan.md)
- `package.json`
- `tests/simulation-*.spec.js`
- `docs/project-changelog.md`
- `docs/project-roadmap.md`

## Overview

Priority: P1. Status: Completed. Locked Ch1 quality, updated docs, and handed off cleanly to Ch2/Ch3 plans.

## Key Insights

- Ch1 changes can affect shared shell and all chapters if common files changed.
- Final QA should run both Ch1-filtered gates and full smoke gates.

## Requirements

- Functional: Ch1 routes pass static, browser, visual, interaction, and release gates.
- Non-functional: docs match active runtime, no stale Matter.js/SVG claims for current path unless scoped as historical.

## Architecture

QA stack: Python static smoke -> Node syntax/unit -> Playwright browser -> docs sync -> final release command.

## Related Code Files

- Modify docs if needed: `docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/design-guidelines.md`, `docs/project-roadmap.md`, `docs/project-changelog.md`.
- Modify tests if added: `tests/simulation-chapter-ux.spec.js`, `tests/simulation-test-utils.js`.
- Do not manually edit: `js/pages.js`.

## Implementation Steps

1. Run Ch1 route-filtered static gates.
2. Run unit and browser gates.
3. Run full route discovery and release smoke if shared files changed.
4. Update docs/changelog with Ch1 UX upgrade and legacy/pilot decision.
5. Write final QA report under this plan.
6. Mark phase statuses and unresolved risks.

## Todo List

- [x] Ch1 static gates pass.
- [x] Ch1 browser gates pass.
- [x] Full shared runtime gates pass if shared files changed.
- [x] Docs/changelog synced.
- [x] QA report saved.

## Verification / Tests

```powershell
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --routes ch1 --require-routes 25 --require-objectives --require-direct
python tools\smoke_simulation_scene_catalog.py --strict --routes ch1 --require-routes 25
python tools\smoke_simulation_renderer_contract.py --strict --routes ch1 --require-routes 25
python tools\smoke_simulation_runtime.py --routes ch1 --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:semantic
npm run test:sim:browser
npm run test:sim:visual-quality
python tools\audit.py
```

Run final only after Ch1 is clean and shared files changed:

```powershell
npm run test:sim:release
```

## Success Criteria

- Ch1 plan can be marked completed with QA evidence.
- No unresolved Ch1-specific blocker before Ch2 starts.
- Docs say current active simulation architecture accurately.

## Risk Assessment

- Risk: full release gate fails due Ch2/Ch3 unrelated baseline. Mitigation: record failure and separate from Ch1 completion only if Ch1 filtered gates pass.

## Security Considerations

- Confirm no confidential files added.
- Confirm no new external runtime dependency.

## Next Steps

Move to [Ch2 DeCuong Interaction Upgrade](../260512-0544-ch2-decuong-interaction-upgrade/plan.md).

## Unresolved Questions

Không có.
