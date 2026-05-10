---
title: "Phase 01 - Baseline and Reproduction Inventory"
status: completed
priority: P1
effort: 2h
---

# Phase 01 - Baseline and Reproduction Inventory

## Context Links

- [Plan 260508](../260508-1435-simple-simulation-lab-assessment-removal/plan.md)
- [Source Validation Report](../260508-1435-simple-simulation-lab-assessment-removal/reports/validation-report.md)
- [QA Evidence Synthesis](./research/qa-evidence-synthesis.md)

## Overview

Confirm current baseline, list exact failing or high-risk simulation paths, and avoid starting with blind fixes.

## Key Insights

- The user-visible issue was "mô phỏng/tương tác chưa chạy giống DeCuong".
- Known-risk routes: `ch2-1-1`, `ch2-1-2`, `ch3-5-3`, `ch3-6-2`.
- Automated tests cover all routes, but manual browser evidence is still required for these high-risk routes.

## Requirements

- Identify whether failures are DOM shell, readout sync, interaction, renderer, or test drift.
- Capture initial test output before edits.
- Confirm no assessment runtime was reintroduced.

## Architecture

Baseline checks should cover:

| Layer | Files/Systems |
|---|---|
| Shell | `js/sim-lab-ui.js`, `css/style.css` |
| Engine | `js/sim-professional-lab.js` |
| Route behavior | `js/sims/ch2/*`, `js/sims/ch3/*` |
| Browser QA | `tests/simulation-browser.spec.js`, `tests/simulation-visual-quality.spec.js` |

## Related Code Files

- Read: `README.md`, `docs/code-standards.md`, `docs/system-architecture.md`
- Read: `plans/260508-1435-simple-simulation-lab-assessment-removal/reports/validation-report.md`
- Modify: none in this phase

## Implementation Steps

1. Run route/manifest smoke and record pass/fail.
2. Run focused browser tests for `@direct-drag`, `@responsive`, `@localization`.
3. Run grep for removed assessment tokens.
4. Use `ck:agent-browser` to inspect `ch2-1-1` initial shell and controls.
5. Write exact reproduction notes before any code edit.

## Todo List

- [x] Confirm dev server URL or start static server.
- [x] Capture failing commands and exit codes.
- [x] Confirm known-risk route list.
- [x] Save baseline notes under `reports/`.

## Verification & Tests

```powershell
python tools\smoke_simulation_manifest.py --require-routes 58 --require-objectives --require-direct
npm run test:sim:quality
npm run test:sim:browser -- --grep "@direct-drag|@responsive|@localization"
rg "SimAssessment|chlyt_sim_assessment_v2|sim-checkpoint|Điểm kiểm tra" js css tests tools package.json docs README.md
```

Expected: failures, if any, are specific and reproducible. Assessment tokens appear only in historical docs/plans.

## Success Criteria

- Root-cause candidates are documented.
- No fix happens before reproducible evidence exists.
- Known-risk route matrix is explicit.

## Risk Assessment

- Risk: test grep hits archived notes and causes confusion.
- Mitigation: classify matches by runtime source vs historical documentation.

## Security Considerations

- Do not paste local browser state/cookies.
- Do not add new localStorage keys for QA.

## Next Steps

Proceed to Phase 02 if shell/runtime smoke has any DOM compatibility issue; otherwise continue to route interaction phases.

## Execution Result

Completed 2026-05-08. Baseline confirmed: manifest 58/58, runtime smoke PASS, assessment grep limited to historical docs/tests, known-risk route list kept as ch2-1-1/ch2-1-2/ch3-5-3/ch3-6-2.

## Unresolved Questions

None.
