# Phase 03 Professional Lab Shell And Visual System

## Context Links

- [Plan](./plan.md)
- [Design Guidelines](../../docs/design-guidelines.md)
- [Red Team Review](./reports/red-team-review.md)
- [Phase 03 Report](./reports/phase-03-professional-lab-shell-report.md)

## Overview

Priority: P1. Status: Completed. Replace basic simulation card with professional lab shell used by representative routes: scene-first layout, formula/status panels, toolbar, legend, responsive behavior.

## Key Insights

- Current `.sim-container` is stable but visually basic.
- Professional feel should improve reading clarity, not add decoration.
- Controls must not dominate learning.

## Requirements

Functional:
- Create unified lab shell via `SimLabUI.createLab`.
- Provide standard slots: scene canvas, overlay, toolbar, formula panel, feedback panel, checkpoint panel.
- Add standard reset/play/pause/step controls where relevant.

Non-functional:
- Fit mobile width without text overlap.
- Keep print behavior sane.
- Maintain current dark textbook shell with light lab panel.

## Architecture

`SimLabUI` wraps existing `createSimContainer` compatibility:
- `createLab(host, config)` returns canvas, ctx, overlay, controls, readout, assessment panel.
- CSS adds `.sim-lab`, `.sim-lab-toolbar`, `.sim-readout-grid`, `.sim-feedback-panel`.
- Existing simulations can call adapter during migration.

## Related Code Files

Modify:
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-core.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-lab-ui.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-route-manifest.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-statics.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-kinematics.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-dynamics.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js`

## Implementation Steps

1. Define lab shell DOM without `innerHTML` for untrusted strings.
2. Build compact toolbar with icons/text only for clear commands.
3. Add formula/readout grid with stable dimensions.
4. Add scene overlay layer for handles/labels if needed.
5. Convert 6 representative routes to new shell:
   - `ch1-1-5`, `ch1-5-3`, `ch2-1-1`, `ch2-5-2`, `ch3-3-1`, `ch3-6-2`.
6. Add responsive CSS checks for 375, 768, 1280 widths.

## Todo List

- [x] Implement `createLab`.
- [x] Add visual tokens/classes.
- [x] Convert representative routes.
- [x] Add screenshot/browser assertions.
- [x] Update design docs.

## Verify / Tests

```powershell
Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }
python tools\audit.py
python tools\smoke_simulation_runtime.py
python tools\audit_simulation_quality.py --require-lab-shell ch1-1-5,ch1-5-3,ch2-1-1,ch2-5-2,ch3-3-1,ch3-6-2
python tools\smoke_simulation_manifest.py --routes ch1-1-5,ch1-5-3,ch2-1-1,ch2-5-2,ch3-3-1,ch3-6-2 --require-objectives
python tools\smoke_simulation_manifest.py --routes ch2-5-2,ch3-6-2 --require-direct
npx playwright test tests/simulation-browser.spec.js --grep lab-shell
npx playwright test tests/simulation-browser.spec.js --grep responsive
```

Verified 2026-05-06:

- `Get-ChildItem js -Recurse -Filter *.js | ForEach-Object { node --check $_.FullName }`
- `node --check tests\simulation-browser.spec.js`
- `python -m compileall -q tools`
- `python tools\audit.py`
- `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI --expect-runtime-routes 58 --check-mount-rollback`
- `python tools\smoke_simulation_manifest.py --routes ch1-1-5,ch1-5-3,ch2-1-1,ch2-5-2,ch3-3-1,ch3-6-2 --require-objectives`
- `python tools\smoke_simulation_manifest.py --routes ch2-5-2,ch3-6-2 --require-direct`
- `python tools\audit_simulation_quality.py --require-lab-shell ch1-1-5,ch1-5-3,ch2-1-1,ch2-5-2,ch3-3-1,ch3-6-2`
- `python tools\smoke_simulation_runtime.py --routes ch1-1-5`
- `npm run test:sim:unit`
- `npm run test:sim:quality`
- `python tools\test_simulation_architecture.py`
- `python tools\test_simulation_qa_tools.py`
- `npx playwright test tests/simulation-browser.spec.js --grep lab-shell`
- `npx playwright test tests/simulation-browser.spec.js --grep responsive`
- `npx playwright test tests/simulation-browser.spec.js` (`80 passed`)

Reviewer follow-up verified 2026-05-07:

- `python tools\smoke_simulation_runtime.py --routes not-a-route` fails with `Unknown route filter: not-a-route`.
- `python tools\smoke_simulation_manifest.py --routes ch1-1-5 --require-direct` fails because slider-only lab routes no longer false-pass direct interaction.

## Success Criteria

- Representative routes use new shell.
- Canvas remains nonblank.
- No overlapping toolbar/readout text at 375x812.
- Existing route injection still works.

## Risk Assessment

Risk: layout too card-heavy. Mitigation: scene-first, compact controls, formula panel secondary.

Risk: CSS affects quiz/notes. Mitigation: namespace all new selectors under `.sim-lab`.

## Security Considerations

Avoid injecting route titles via raw `innerHTML` unless sanitized.

## Next Steps

Phase 4 adds direct manipulation kernel and upgrades route interactions.
