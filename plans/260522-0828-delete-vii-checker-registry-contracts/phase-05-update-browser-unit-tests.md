---
title: "Phase 05 - Cập nhật unit và browser tests"
status: planned
priority: P1
dependsOn: [phase-04-update-tools-route-counts-and-baselines.md]
---

# Phase 05 - Cập nhật unit và browser tests

## Context Links

- `tests/phase-09-static-scene-flag.test.js`
- `tests/phase-09-12-tdd.test.js`
- `tests/phase-09-animation-parity.test.js`
- `tests/simulation-browser.spec.js`
- `tests/simulation-visual-quality.spec.js`

## Overview

Remove tests that assert behavior of deleted checker routes, and retarget only tests that still verify a valid active invariant.

## Requirements

- No active test imports behavior/renderer/scene for deleted ids.
- Section VII negative UI tests remain active.
- Browser route mount, visual quality, renderer-contract, scene-identity all operate on 52 canonical routes.
- No fake replacement routes just to keep old test names alive.

## Architecture

Classify each test:

- **Delete** when the only assertion concerns deleted checker route behavior.
- **Retarget** when the invariant is generic and a nearby active route covers it.
- **Keep** when it verifies Section VII content-only behavior.

## Related Code Files

Modify:

- `tests/phase-09-static-scene-flag.test.js`
- `tests/phase-09-12-tdd.test.js`
- `tests/phase-09-animation-parity.test.js`
- `tests/simulation-browser.spec.js`
- `tests/simulation-visual-quality.spec.js`
- `tests/exercise-section-no-simulation.spec.js`
- `tests/simulation-test-utils.js`

## Implementation Steps

1. Remove `ch3-7-1`, `ch3-7-2`, `ch2-7-2` assertions from static-scene tests.
2. Remove `ch2-7-*` and `ch3-7-2` checker invariant tests from `phase-09-12-tdd.test.js`; preserve unrelated active-route tests.
3. Remove `ch3-7-2` animation parity test; do not retarget unless a current route needs that exact residual-bar invariant.
4. Update browser discovery expectations from "58 canonical, 52 mountable" to "52 canonical".
5. Keep `tests/exercise-section-no-simulation.spec.js` as the guard that VII pages stay content-only.
6. Run the focused and aggregate suites.

## Todo List

- [ ] Delete obsolete checker-route tests.
- [ ] Retarget only generic invariants worth preserving.
- [ ] Update browser/visual route taxonomy assertions.
- [ ] Verify no active `tests/` file imports deleted route ids except page-only guard.
- [ ] Run aggregate test commands.

## Verification / Tests

```powershell
rg "ch1-7-1|ch1-7-2|ch2-7-1|ch2-7-2|ch3-7-1|ch3-7-2" tests
npm run test:sim:unit
npm run test:sim:semantic
npm run test:sim:renderer-contract
npm run test:sim:visual-quality
npm run test:sim:browser
```

Allowed grep hits in `tests/`: Section VII content-only route lists and the deleted-route absence test.

## Success Criteria

- Tests describe the new architecture, not the old dormant checker routes.
- No skipped test is introduced to bypass failures.
- Browser tests still exercise all 52 active simulations.

## Risk Assessment

- Removing old tests can reduce coverage of generic math invariants. If an invariant still matters to active route behavior, retarget it explicitly to an active route with the same responsibility.

## Security Considerations

No security impact.

## Next Steps

Proceed to Phase 06 for docs and release verification.
