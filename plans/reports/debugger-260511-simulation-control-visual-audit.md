# Simulation Control/Animation/Visual Audit - Debug Report

## Executive Summary
- **Issue:** User reported weak controls, poor animations, weak visuals across simulations.
- **Impact:** 58 simulation routes; risk hidden because npm browser script was too shallow.
- **Root cause:** No dead controls reproduced; confirmed QA script gap. Two weak-control routes had only one slider.
- **Status:** Fixed QA script gap, added missing second controls for `ch2-1-4`, `ch3-7-2`, and fixed `ch3-7-2` residual overlay/readout consistency.
- **Fix:** Broadened browser QA scripts, added `Pha` slider, added `Độ nhiễu` residual slider/direct handle, and locked residual overlay/readout consistency.

## Timeline
- 23:xx - Read README/docs/debug/browser skill; confirmed current runtime is 58-route professional lab.
- 23:xx - Baseline smoke/unit/browser passed; no crash/dead control reproduced.
- 23:xx - Ad-hoc all-route control probe found weak routes: `ch2-1-4`, `ch3-7-2` only one slider.
- 23:xx - Patched controls and npm QA scripts.
- 23:xx - Re-ran browser/control/visual verification.

## Technical Analysis
### Findings
1. `package.json` `test:sim:browser` only ran `tests/mass-conversion-audit.spec.js`; this skipped shell/route/control/drag/animation checks.
2. `ch2-1-4` mounted and animated, but only had `omega` slider plus mode buttons.
3. `ch3-7-2` mounted and animated, but only had `Lực F` slider; residual checker had no direct residual/noise control.
4. Reviewer found a semantic mismatch in `ch3-7-2`: residual readout could show zero while overlay used fallback values.
5. Reviewer found a stale-state path after animation tick; `Độ nhiễu=0` could keep old residuals.
6. `ch3-7-2` direct handle initially wrote ignored residual fields; it now controls `residualScale`.
7. No confirmed dead handle/slider/button after full all-route probe.

### Evidence
- `npm run test:sim:unit` pass: node syntax check 100 JS files + simulation unit tests.
- `npx playwright test tests/simulation-interaction-engine.spec.js --grep @control-audit` pass: 1/1 test, all 58 routes.
- `npx playwright test tests/simulation-browser.spec.js --grep @route-mount` pass: 59/59 tests.
- `npm run test:sim:browser` pass: 148/148 tests.
- `npm run test:sim:visual-quality` pass: 4/4 tests.
- `python tools\smoke_simulation_routes.py --require-p1` pass: 58/58 P1 covered.
- `python tools\smoke_simulation_runtime.py --expect-globals ... --check-mount-rollback --check-listener-cleanup` pass.
- `python tools\audit.py` pass: 102 OK, 0 warnings, 0 errors.
- Focused post-fix probe:
  - `ch2-1-4`: sliders `omega`, `Pha`.
  - `ch3-7-2`: sliders `Lực F`, `Độ nhiễu`.
  - `ch3-7-2` with `Độ nhiễu=0`: readout `điểm:100|r1:0`, overlay residuals `0.000`, overlay score `100%`.
  - `ch3-7-2` with `Độ nhiễu=2`: readout/overlay residuals increase, overlay score leaves `100%`.
  - `ch3-7-2` direct drag: readout changed `Độ nhiễu:1.00` → `1.90`, `r1:0.02` → `0.038`.
- Agent-browser evidence: `plans/260511-2245-decuong-style-simulation-ux-refresh/reports/agent-browser-ch2-1-4-lab-scrolled.png`.

## Recommendations
### Immediate (P0)
- [x] Keep `test:sim:browser` wired to mass + browser + interaction suites.
- [x] Keep `test:sim:release` wired to visual-quality gate.

### Short-term (P1)
- [ ] Add a thresholded visual delta metric for animation quality, not only any pixel/readout change.
- [ ] Add route-level UX score report for slider count, handle count, readout count, and animation delta.

### Long-term (P2)
- [ ] Decide whether every animated route needs two or more direct controls, or whether some conceptual routes may stay minimal.

## Unresolved Questions
- Need target standard for "animation quá tệ": minimum visible movement, speed range, or route-specific physics realism?

## Review
- Code-reviewer final follow-up: DONE, no blocking issues remaining.
