# Phase 01 - Baseline UX Audit And Test Gates

## Context Links

- [Plan](./plan.md)
- [Scout Report](./reports/scout-report.md)
- [Research Synthesis](./research/research-synthesis.md)
- Existing screenshots: `test-results/brainstorm-simulation-redesign/`
- Current tests: `tests/simulation-browser.spec.js`, `tests/simulation-visual-quality.spec.js`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Completed |
| Estimate | 10h |
| Goal | Lock current baseline, create UX failure gates, and avoid subjective-only polish |

## Key Insights

- Current release gates prove runtime stability, not enough UX quality.
- DeCuong comparison needs objective test criteria: theme, readout, no-op drag, clipping, route identity.
- This phase should not modify simulation behavior yet except test harness additions.

## Requirements

### Functional

- Capture baseline screenshots for representative routes in dark and light theme.
- Add/extend tests that fail when:
  - `.sim-lab` does not render dark/light readable shell.
  - Readout cards are empty or generic.
  - Drag does not change semantic readout on representative routes.
  - Main canvas object is blank/clipped.
- Record route-group test matrix for all later phases.

### Non-Functional

- No app runtime behavior change.
- No generated file edits.
- Tests must run through existing `package.json` scripts or existing test files.

## Architecture

Test layer only:

```text
Playwright route open
  -> switch data-theme dark/light
  -> inspect .sim-container.sim-lab
  -> sample canvas pixels + readout cards
  -> drag first route-owned handle
  -> compare semantic readout/canvas hash
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-visual-quality.spec.js` |
| Modify if needed | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tools\audit_simulation_quality.py` |
| Read | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\package.json` |

## Implementation Steps

1. Add route-group constants matching the 58-route matrix from the scout report.
2. Add helper to toggle `data-theme` to `dark` and `light`.
3. Add shell readability check:
   - title visible
   - canvas visible
   - controls visible
   - readout grid visible
   - hint/formula text not empty where expected
4. Add representative drag checks:
   - `ch1-2-3`: force/parallelogram resultant changes.
   - `ch1-3-1`: support/reaction readout changes.
   - `ch2-1-1`: particle motion readout changes.
   - `ch2-5-2`: instant center readout changes.
   - `ch3-3-1`: spring/ODE state changes.
   - `ch3-6-2`: collision momentum/velocity changes.
5. Add baseline screenshot command/report path convention under `test-results/simulation-ux-rebuild/`.
6. Run existing gates to confirm no accidental regression.

## Todo List

- [x] Define route-group matrix in browser tests.
- [x] Add dark/light shell checks.
- [x] Add representative semantic drag checks.
- [x] Add baseline screenshot capture path.
- [x] Run baseline QA commands.
- [x] Save short baseline report under this plan `reports/`.

## Tests / Verify

```powershell
npm run test:sim:unit
npm run test:sim:quality:baseline
npm run test:sim:browser:route-mount
npm run test:sim:visual-quality
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup
```

Phase-specific:

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "@ux-baseline"
npx playwright test tests/simulation-visual-quality.spec.js --grep "@visual-strict"
```

## Success Criteria

- Baseline screenshots exist for representative routes.
- New UX baseline tests run and either document current failures or pass after non-behavior harness updates.
- No current release gate is broken by test additions.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Test too brittle to visual details | Prefer semantic DOM/readout/canvas nonblank checks over exact pixels |
| More skipped tests hide issues | Mark new tests active for representative routes |
| False failures from animation timing | Pause animation or wait fixed short interval before sample |

## Security Considerations

- No user data, network, auth.
- Do not introduce external CDN/test dependency.

## Next Steps

Proceed to Phase 02 only after shell/theme baseline is measurable.

## Unresolved Questions

Không có.
