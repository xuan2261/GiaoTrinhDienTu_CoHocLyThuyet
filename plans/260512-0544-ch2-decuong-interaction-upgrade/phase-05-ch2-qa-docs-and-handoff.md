# Phase 05: Ch2 QA Docs And Handoff

## Context Links

- [Plan](./plan.md)
- `package.json`
- `tests/simulation-*.spec.js`
- `docs/project-changelog.md`
- `docs/project-roadmap.md`

## Overview

Priority: P1. Status: Pending. Lock Ch2 quality, update docs, and hand off cleanly to Ch3 plan.

## Key Insights

- Ch2 changes often touch animation/interaction shared paths.
- If shared paths changed, full 58-route browser gates are mandatory.

## Requirements

- Functional: Ch2 routes pass static, browser, visual, interaction, and release gates.
- Non-functional: docs accurately describe active canvas/professional-lab runtime and legacy/pilot status.

## Architecture

QA stack: Python static smoke -> Node syntax/unit -> Playwright browser -> docs sync -> final release command.

## Related Code Files

- Modify docs if needed: `docs/codebase-summary.md`, `docs/system-architecture.md`, `docs/design-guidelines.md`, `docs/project-roadmap.md`, `docs/project-changelog.md`.
- Modify tests if added: `tests/simulation-chapter-ux.spec.js`, `tests/simulation-test-utils.js`.
- Do not manually edit: `js/pages.js`.

## Implementation Steps

1. Run Ch2 route-filtered static gates.
2. Run unit and browser gates.
3. Run full route discovery and release smoke if shared files changed.
4. Update docs/changelog with Ch2 UX upgrade and legacy/pilot decision.
5. Write final QA report under this plan.
6. Mark phase statuses and unresolved risks.

## Todo List

- [ ] Ch2 static gates pass.
- [ ] Ch2 browser gates pass.
- [ ] Full shared runtime gates pass if shared files changed.
- [ ] Docs/changelog synced.
- [ ] QA report saved.

## Verification / Tests

```powershell
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --routes ch2 --require-routes 15 --require-objectives --require-direct
python tools\smoke_simulation_scene_catalog.py --strict --routes ch2 --require-routes 15
python tools\smoke_simulation_renderer_contract.py --strict --routes ch2 --require-routes 15
python tools\smoke_simulation_runtime.py --routes ch2 --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:semantic
npm run test:sim:browser
npm run test:sim:visual-quality
python tools\audit.py
```

Run final only after Ch2 is clean and shared files changed:

```powershell
npm run test:sim:release
```

## Success Criteria

- Ch2 plan can be marked completed with QA evidence.
- No unresolved Ch2-specific blocker before Ch3 starts.
- Docs describe graph/animation interaction expectations accurately.

## Risk Assessment

- Risk: full release gate fails due Ch3 unrelated baseline. Mitigation: record failure and separate from Ch2 completion only if Ch2 filtered gates pass.

## Security Considerations

- Confirm no confidential files added.
- Confirm no new external runtime dependency.

## Next Steps

Move to [Ch3 DeCuong Interaction Upgrade](../260512-0544-ch3-decuong-interaction-upgrade/plan.md).

## Unresolved Questions

Không có.
