---
title: "Validation Report - Simple Simulation Lab"
type: validation-report
created: 2026-05-08
---

# Validation Report

## Confirmed Requirements

| Item | Decision |
|---|---|
| Scope count | 58 current simulations only |
| Assessment removal | Remove UI, runtime module, storage contract, test gate |
| Visual direction | Similar simplicity to `DeCuong_CoHocLyThuyet.html`, not inline rewrite |
| Clean interaction | Remove visible round drag handles/drag-placement markers from canvas |
| Animated controls | Add reset/play-pause for continuously animated routes |
| Architecture | Keep current registry/renderer/behavior engine |
| Tests | Tests per phase required |
| Plan mode | `ck:plan --hard` |

## Assumptions

- Existing route renderers remain the source of visual mechanics.
- Direct manipulation can remain only through hidden hit targets or real physical objects/vectors, not generic handle dots.
- `sim-route-manifest.js` can remain as route metadata file name to reduce script-order churn.
- Old `chlyt_sim_assessment_v2` data can remain unused in user browsers; no runtime cleanup needed.
- Pending visual/neon plans wait for this simpler shell baseline.

## Acceptance Criteria

- `index.html` no longer loads `js/sim-assessment.js`.
- `rg "SimAssessment|chlyt_sim_assessment_v2|sim-checkpoint|Điểm kiểm tra" js css tests tools package.json docs README.md` returns only archived plans/journals or explicit historical notes after implementation docs are updated.
- 58 routes mount and canvas remains nonblank.
- `.sim-container.sim-lab` has simple shell with canvas, controls, readout cards, hint/formula.
- No visible generic circular handles, orange hit circles, `điểm kéo`, or generic `điểm điều khiển` labels over canvas/readout.
- Direct pointer/touch/keyboard interaction, when retained, changes route state without visible standalone drag markers.
- Reset and play/pause work on representative animated routes.
- Representative Ch1/Ch2/Ch3 physics/readout assertions pass.
- No assessment gate remains in `npm run test:sim:quality` and `npm run test:sim:release`.

## Post-Plan Debug Verification - 2026-05-08

### Root Cause Fixed

- `js/sim-lab-ui.js` called `lab.wrap.querySelector(':scope > .sim-header')`.
- Runtime smoke fake DOM does not implement `querySelector` or `Element.remove`.
- Fix: add direct-child class lookup fallback and safe node removal helper, keeping browser DOM behavior same.
- Post-hardening fix: user-driven slider/handle/reset updates now force immediate readout sync, reset clears runtime-only state, `ch3-6-2` collision drag velocity uses pointer-down state with valid zero components, and `ch3-5-3` derives finite `L=Iω` after reset.

### Agent-Browser Evidence

Screenshots saved in this report folder:

| Route | Evidence | Result |
|---|---|---|
| `ch2-1-1` | `agent-browser-ch2-1-1-after-tron.png`, `agent-browser-ch2-1-1-after-parabol.png` | Preset buttons update canvas and `CHẾ ĐỘ`: `Elip` -> `Tròn` -> `Parabol` |
| `ch2-1-2` | `agent-browser-ch2-1-2-readout-initial.png`, `agent-browser-ch2-1-2-after-drag.png` | Drag graph cursor updates `X(T)`/`V(T)` readout |
| `ch3-5-3` | `agent-browser-ch3-5-3-paused.png`, `agent-browser-ch3-5-3-after-radius-drag.png` | Drag radius updates `L`: `2` -> `3.04` |
| `ch3-6-2` | `agent-browser-ch3-6-2-paused.png`, `agent-browser-ch3-6-2-after-ball-drag.png` | Drag ball updates momentum: `11` -> `15` |

### Fresh QA

- `npm run test:sim:quality`: PASS.
- `npm run test:sim:semantic`: PASS.
- `npx playwright test tests/simulation-browser.spec.js --grep '@direct-drag'`: PASS, `70 passed`.
- `python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup`: PASS.
- `python tools\audit.py`: PASS, `99/99 OK`, `0 warnings`, `0 errors`.
- `npm run test:sim:browser`: PASS, `211 passed, 1 skipped`.
- `npm run test:sim:release`: PASS, browser suite `211 passed, 1 skipped`, visual-quality `69 passed`.

## Unresolved Questions

- None.
