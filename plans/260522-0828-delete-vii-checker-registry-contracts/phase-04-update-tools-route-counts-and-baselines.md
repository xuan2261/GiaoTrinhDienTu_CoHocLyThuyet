---
title: "Phase 04 - Cập nhật tools, counts, baselines"
status: completed
priority: P1
dependsOn: [phase-03-prune-scene-renderer-behavior-contracts.md]
---

# Phase 04 - Cập nhật tools, counts, baselines

## Context Links

- `package.json`
- `tools/smoke_simulation_manifest.py`
- `tools/smoke_simulation_scene_catalog.py`
- `tools/smoke_simulation_renderer_contract.py`
- `tools/smoke_simulation_runtime.py`
- `tests/sim-canvas-evolution-fixtures.js`

## Overview

Change the canonical QA model from 58 routes with 52 mountable routes to exactly 52 canonical routes.

## Requirements

- All smoke scripts accept and validate `--require-routes 52` or `--expect-runtime-routes 52`.
- `package.json` scripts no longer pass 58.
- Test utilities no longer carry a special 58-vs-52 split except where Section VII content pages are explicitly checked.
- Baseline fixtures represent 52 canonical routes.

## Architecture

The previous split was a transitional compromise. After deletion, the invariant is simpler:

`canonical simulation routes == browser mountable simulation routes == visual/canvas routes == 52`.

Keep a separate Section VII page-list only for content-only negative tests.

## Related Code Files

Modify:

- `package.json`
- `tests/simulation-test-utils.js`
- `tests/sim-canvas-evolution-fixtures.js`
- `tests/phase-09-canvas-evolution-baseline-check.test.js`
- `tools/smoke_simulation_manifest.py`
- `tools/smoke_simulation_scene_catalog.py`
- `tools/smoke_simulation_renderer_contract.py`
- `tools/smoke_simulation_runtime.py`
- `tools/test_simulation_architecture.py`
- `tools/test_simulation_qa_tools.py`

Inspect:

- `qa-verification/animation-sweep/*`
- Any checked-in baseline JSON consumed by active tests

## Implementation Steps

1. Replace `EXPECTED_ROUTE_COUNT = 58` with 52 in test utilities.
2. Remove `EXERCISE_SECTION_SIM_ROUTES` from simulation sweeps if it only exists to subtract 6 dormant routes.
3. Update `EXPECTED_MOUNTABLE_ROUTE_COUNT` to either 52 or delete it if redundant.
4. Update package scripts from `--require-routes 58` to `--require-routes 52`.
5. Update Python tests that assert outputs mentioning 58.
6. Update or regenerate active baseline fixtures after reviewing route list diff.
7. Leave historical QA artifacts alone unless an active test reads them.

## Todo List

- [x] Route count constants changed to 52.
- [x] Package QA scripts changed to 52.
- [x] Python smoke tests changed to 52.
- [x] Active canvas/visual baselines aligned to 52.
- [x] Transitional 58/52 wording removed from executable tests.

## Verification / Tests

```powershell
python tools\smoke_simulation_manifest.py --require-routes 52 --require-objectives --require-direct
python tools\smoke_simulation_scene_catalog.py --strict --require-routes 52
python tools\smoke_simulation_renderer_contract.py --strict --require-routes 52
python tools\smoke_simulation_runtime.py --expect-runtime-routes 52 --check-mount-rollback --check-listener-cleanup
python -m compileall -q tools
npm run test:sim:quality
npm run test:sim:quality:baseline
```

## Success Criteria

- Tooling fails if route count is not 52.
- No script still requires 58 for current release gates.
- Baseline tests do not silently skip deleted routes.

## Risk Assessment

- Bulk updating `58` can corrupt historical docs or unrelated numeric examples. Use targeted replacements by command/script/test context.

## Security Considerations

No security impact.

## Next Steps

Proceed to Phase 05 to remove or retarget tests that encode deleted checker behavior.
