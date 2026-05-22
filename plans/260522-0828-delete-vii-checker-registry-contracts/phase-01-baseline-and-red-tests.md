---
title: "Phase 01 - Baseline và red tests"
status: completed
priority: P1
dependsOn: []
---

# Phase 01 - Baseline và red tests

## Context Links

- Predecessor: `plans/260522-0744-remove-vii-exercise-simulations/plan.md`
- Current manifest: `js/sim-route-manifest.js`
- Current browser utilities: `tests/simulation-test-utils.js`
- Current no-simulation guard: `tests/exercise-section-no-simulation.spec.js`

## Overview

Add TDD checks that fail before implementation because 6 Section VII checker routes still exist in internal simulation contracts.

## Requirements

- Define one canonical list of deleted checker route ids for tests.
- Assert these ids are absent from manifest, `SIM_MAP`, scene registry, renderer registry, behavior registry.
- Assert Section VII content pages remain routeable and content-only.
- Mark expected route count as 52 in red tests only where the implementation has not yet caught up.

## Architecture

Create a focused regression spec or extend an existing simulation contract spec. Prefer a small test file such as `tests/vii-checker-routes-deleted.test.js` for Node-level registry checks plus a Playwright check in `tests/exercise-section-no-simulation.spec.js` if browser registry access is needed.

## Related Code Files

Modify:

- `tests/simulation-test-utils.js`
- `tests/exercise-section-no-simulation.spec.js`
- New or existing focused contract test under `tests/`
- `package.json` only if adding a new focused test command is needed

Read only:

- `js/sim-route-manifest.js`
- `js/simulations.js`
- `js/sim-scene-registry.js`
- `js/sim-route-renderer-registry.js`
- `js/sim-route-behavior-registry.js`

## Implementation Steps

1. Add `DELETED_VII_CHECKER_ROUTES = ['ch1-7-1', 'ch1-7-2', 'ch2-7-1', 'ch2-7-2', 'ch3-7-1', 'ch3-7-2']`.
2. Add red assertion: manifest keys must not include any deleted id.
3. Add red assertion: browser `window.SIM_MAP` must not include any deleted id.
4. Add red assertion: scene/renderer/behavior registries must not expose deleted ids.
5. Keep existing page-content guard for all Section VII page ids, including parent and non-checker pages.
6. Run focused tests and record expected failures in phase notes during implementation.

## Todo List

- [x] Add deleted-route constant.
- [x] Add manifest absence test.
- [x] Add browser registry absence test.
- [x] Add no-simulation content-only assertion remains green.
- [x] Confirm red failure points mention exact remaining registry.

## Verification / Tests

Expected before Phase 02/03: focused absence tests fail.

```powershell
npm run test:sim:unit
npx playwright test tests/exercise-section-no-simulation.spec.js
python tools\smoke_simulation_manifest.py --require-routes 52 --require-objectives --require-direct
```

Expected after Phase 03: all focused absence tests pass.

## Success Criteria

- Failing tests prove the problem: route ids still exist in internal registry/contract.
- Tests do not rely on fake data or mocks.
- Tests distinguish textbook page routes from simulation route contracts.

## Risk Assessment

- Over-broad grep assertions could fail on docs/history. Limit runtime absence checks to active JS registries and runtime objects.

## Security Considerations

No security impact.

## Next Steps

Proceed to Phase 02 after red tests exist.
