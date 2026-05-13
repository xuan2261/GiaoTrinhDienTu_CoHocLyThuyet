# Phase 01 Baseline Promax Audit Matrix

## Context Links

- [Plan](./plan.md)
- [Scout Report](./reports/scout-report.md)
- [System Architecture](../../docs/system-architecture.md)
- [Design Guidelines](../../docs/design-guidelines.md)
- [Simulation List](../../simulation-list.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Goal | Create measurable baseline before touching runtime code |
| Routes | All 58, with detailed focus on 6 pilot routes |

## Key Insights

- Current tests prove routes mount/render/interact. They do not fully prove physics correctness.
- Need matrix before implementation to avoid subjective “promax” arguments.
- This phase is read-only except reports/tests scaffolding.

## Requirements

### Functional

- Define Promax scoring rubric: correctness, interaction, formula/readout, diagnostics, pedagogy, accessibility, performance.
- Create baseline matrix for all 58 route ids.
- Mark 6 pilot routes:
  - `ch1-2-3`
  - `ch1-5-3`
  - `ch2-1-2`
  - `ch2-5-2`
  - `ch3-3-1`
  - `ch3-6-2`
- Capture current gaps per route without changing behavior.

### Non-Functional

- Keep reports concise.
- No implementation changes.
- No generated file edits.

## Architecture

```text
SIM_ROUTE_MANIFEST
  -> baseline audit script/manual matrix
  -> reports/promax-baseline-matrix.md
  -> later invariant manifest in Phase 02
```

## Related Code Files

| Action | File |
|---|---|
| Read | `js/sim-route-manifest.js` |
| Read | `js/sims/ch*/**/*.js` |
| Read | `tests/*.js`, `tests/*.spec.js` |
| Create | `plans/260513-1450-promax-simulation-correctness-pedagogy-upgrade/reports/promax-baseline-matrix.md` |
| Optional create | `tests/promax-baseline-smoke.test.js` |

## Implementation Steps

1. List 58 route ids from manifest.
2. Add matrix columns:
   - route id.
   - domain.
   - objective.
   - current interaction.
   - expected invariant.
   - missing invariant.
   - formula/readout status.
   - diagnostics status.
   - challenge suitability.
   - priority.
3. Run current release commands to record baseline pass/fail.
4. Inspect pilot routes in browser and note real UX/physics gaps.
5. Save report in `reports/promax-baseline-matrix.md`.
6. Do not fix findings in this phase.

## Todo List

- [ ] Generate 58-route matrix.
- [ ] Mark pilot routes and target invariants.
- [ ] Record current QA command results.
- [ ] Capture pilot screenshots if useful.
- [ ] List blockers and non-blockers.

## Verification / Tests

```powershell
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct
python tools\smoke_simulation_scene_catalog.py --strict --require-routes 58
python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58
python tools\smoke_simulation_runtime.py --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
npm run test:sim:unit
npm run test:sim:browser
npm run test:sim:visual-quality
```

Manual checks:

- Open 6 pilot routes in dark and light theme.
- Drag primary handles.
- Check visible readout changes and no overflow at 375px width.

## Success Criteria

- Baseline matrix exists and covers 58/58 route ids.
- Current release status is recorded.
- Pilot route gaps are specific enough for implementation.
- No runtime code modified.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Matrix becomes generic | Require route-specific invariant field |
| Audit takes too long | Deep inspect only 6 pilot routes |
| Old stale plans confuse scope | Reference completed rebuild as baseline |

## Security Considerations

- No security-sensitive changes.
- Do not inspect or commit secret/env files.

## Next Steps

- Phase 02 uses this matrix to create invariant manifest and evaluator helpers.

## Unresolved Questions

- None.
