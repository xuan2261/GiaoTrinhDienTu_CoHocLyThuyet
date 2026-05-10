# Phase 05: All-Route Regression And Doc Sync

## Context Links

- Overview: [plan.md](./plan.md)
- QA scripts: `package.json:7`, `package.json:10`, `package.json:11`, `package.json:12`, `package.json:16`, `package.json:17`, `package.json:19`
- Visual/interaction contracts: `tests/simulation-visual-quality.spec.js:48`, `tests/simulation-visual-quality.spec.js:71`, `tests/simulation-visual-quality.spec.js:96`, `tests/simulation-interaction-engine.spec.js:74`, `tests/simulation-interaction-engine.spec.js:149`
- Docs backlog note for route-specific polish: `docs/project-roadmap.md:69`

## Overview

- Priority: P1
- Status: pending
- Brief description: close the implementation with full 58-route QA, file-level rollback packs, and docs that reflect the finished route-specific polish.

## Key Insights

- The current release gate already bundles unit, quality, semantic, visual-quality, runtime smoke, audit, and browser tests; the plan should reuse that gate rather than inventing new QA (`package.json:19`).
- The broad UX rebuild plan is still open, but this plan is the precise route-specific slice that must complete before that umbrella plan can be closed.
- Docs already acknowledge route-specific polish as backlog, so implementation must update roadmap/architecture once work lands (`docs/project-roadmap.md:69`, `docs/system-architecture.md:5`).

## Requirements

- Keep all current tests and dark/light theme support intact.
- Verify that every canonical route remains registry-backed with unique route/renderer/behavior/scene identity.
- Update only docs that materially changed because of the implementation; no speculative doc churn.

## Architecture

- Input: final QA reads canonical routes from the manifest-backed browser suites and runtime smoke.
- Transform: failures are traced back to the exact shared or chapter phase file set; fixes stay localized.
- Output: green release gate, refreshed docs, and a rollback snapshot pack for the modified files.

## Related Code Files

- Modify during implementation closeout: `tests/simulation-visual-quality.spec.js`, `tests/simulation-interaction-engine.spec.js`, `docs/project-roadmap.md`, `docs/system-architecture.md`, `README.md` only if commands or behavior descriptions changed materially
- Do not modify: `js/pages.js`, canonical route registration files unless a verified regression forces it

## Implementation Steps

1. Run phase-local checks first, then the full release gate.
2. Perform manual all-route spot checks in dark and light theme, including `file://` launch, direct drag, pause/resume, reset, and overflow.
3. Update roadmap/system architecture/README only where the completed route-specific polish changed real behavior or QA process.
4. Archive the per-phase snapshots so rollback remains possible after handoff.

## Todo List

- [ ] Run full scripted QA
- [ ] Run manual representative route sweep
- [ ] Update docs that changed materially
- [ ] Package rollback snapshots

## Success Criteria

- `npm run test:sim:release` passes.
- No failures remain in all-route visual/identity/theme and direct-drag suites.
- Docs explicitly state that canonical routes remain registry-backed and route-specific, not family-dispatched.

## Risk Assessment

- High: broad release gate failure after chapter polish. Mitigation: fix by phase ownership, not by ad hoc sweep edits.
- Medium: manual spot checks miss a chapter-specific regression. Mitigation: use at least one representative route per renderer group plus all automated all-route gates.
- Medium: docs diverge from shipped behavior. Mitigation: update docs only after QA is green.

## Security Considerations

- No new secrets, network dependencies, or local-storage schema changes.
- Keep documentation limited to actual shipped behavior and commands.

## Test Matrix

- Unit: `npm run test:sim:unit`
- Integration: `npm run test:sim:quality`, `npm run test:sim:semantic`, `python tools/smoke_simulation_routes.py --require-p1`, `python tools/smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup`
- Browser/E2E: `npm run test:sim:visual-quality`, `npm run test:sim:browser`, `npm run test:sim:release`

## Rollback Plan

- Restore only the failing phase file set from snapshots, rerun the affected gate, then rerun `npm run test:sim:release`.

## Next Steps

- Once green, unblock closure of [../260509-1820-decuong-style-58-simulation-ux-rebuild/plan.md](../260509-1820-decuong-style-58-simulation-ux-rebuild/plan.md).
