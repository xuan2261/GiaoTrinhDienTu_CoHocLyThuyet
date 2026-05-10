# Phase 01 Baseline Metrics And QA Harness

## Context Links

- [Plan](./plan.md)
- [Scout Report](./reports/scout-report.md)
- [Previous P1 QA](../20260506-1045-interactive-mechanics-simulation-expansion/reports/p1-simulation-expansion-qa-report.md)
- [Code Standards](../../docs/code-standards.md)

## Overview

Priority: P1. Status: Completed. Establish measurable baseline and persistent QA before touching simulation behavior. This phase prevents visual/pedagogy refactor from becoming subjective.

## Key Insights

- Current gates pass but browser smoke is ad hoc.
- Need route manifest checks before content upgrade.
- Need file-size/interaction/assessment metrics tracked.

## Requirements

Functional:
- Create route quality rubric for all 58 current routes.
- Add persistent QA entrypoints for route manifest, browser smoke, and pedagogy audit.
- Preserve existing smoke scripts.

Non-functional:
- Tests run from clean checkout.
- Runtime app remains usable without npm.
- Dev-only test setup clearly documented.

## Architecture

Add QA layer beside existing tools:
- `tools/smoke_simulation_manifest.py`: checks route metadata, assessment/direct interaction declarations.
- `tools/audit_simulation_quality.py`: counts file size, sliders vs direct interactions, route rubric completion.
- `tests/simulation-browser.spec.js`: Playwright smoke for `file://` and static server.
- Optional `package.json`: dev scripts only, no runtime bundle.

## Related Code Files

Modify:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\README.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\code-standards.md`

Create:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\package.json`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\smoke_simulation_manifest.py`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\audit_simulation_quality.py`

## Implementation Steps

1. Snapshot current command outputs into plan reports.
2. Add dev-only Playwright package scripts: `test:sim:browser`, `test:sim:unit`, `test:sim:quality`.
3. Implement manifest smoke with temporary compatibility mode: warn before manifest exists, hard fail after Phase 5.
4. Implement quality audit with thresholds:
   - no sim implementation file >220 lines after Phase 2;
   - route count remains 58;
   - direct interaction declared for every route after content phases.
5. Add browser smoke for 6 representative routes first.
6. Document setup and fallback commands.

## Todo List

- [x] Record current baseline metrics.
- [x] Add dev-only QA package/scripts.
- [x] Add manifest smoke.
- [x] Add quality audit.
- [x] Add initial browser smoke.
- [x] Update docs with new QA commands.

## Verify / Tests

```powershell
node --check js\app.js
node --check js\loader.js
node --check js\sim-core.js
node --check js\sim-statics.js
node --check js\sim-kinematics.js
node --check js\sim-dynamics.js
node --check js\sim-activities.js
node --check js\simulations.js
python -m compileall -q tools
python tools\audit.py
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_runtime.py
python tools\smoke_simulation_manifest.py --allow-missing-manifest
python tools\audit_simulation_quality.py --baseline
npm run test:sim:browser:baseline
```

## Success Criteria

- Existing gates pass unchanged.
- New QA harness exists and runs.
- Browser smoke checks route hash, `.sim-container`, nonblank canvas, info text, console errors.

## Risk Assessment

Risk: Playwright install friction. Mitigation: dev-only dependency, document `npm install`, keep Python smoke gates.

Risk: QA too strict before refactor. Mitigation: staged flags and phase-specific thresholds.

## Security Considerations

No secrets. Do not commit browser cache, screenshots with private paths, or `node_modules`.

## Next Steps

Phase 2 uses new harness while splitting architecture.
