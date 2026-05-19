---
phase: 9
title: "Cross Route Regression And Release Gate"
status: completed
priority: P1
effort: "6h"
dependencies: [2, 3, 4, 5, 6, 7, 8, 8.5]
---

# Phase 09: Cross Route Regression And Release Gate

## Overview

Validate cuối cùng: chạy đầy đủ 58 route qua release pipeline (bao gồm a11y suite), đối chiếu visual baselines, capture screenshots cho 12 route đại diện, audit performance, verify offline `file://` mount, và lock visual-quality baseline mới.

## Requirements

- Functional:
  - Tất cả gate hiện tại (`npm run test:sim:release` + Python smoke + new correctness suites + a11y suite) GREEN.
  - Capture screenshots cho 12 route đại diện trong dark + light theme.
  - Performance audit: ch3-6-2 60fps mid-collision (impulse flash), ch3-3-1 spring oscillation 60fps, ch2-1-1 trail 60fps.
  - Offline `file://` mount works for representative routes.
  - A11y verify: NVDA / VoiceOver dry-run on 4 routes (ch1-2-3, ch2-1-1, ch3-3-1, ch3-6-2).
- Non-functional:
  - Documentation: visual-quality baseline updated, before/after comparison saved as plan artifact.

## Architecture

```
Release pipeline order:
1. python tools/smoke_simulation_runtime.py
2. python tools/smoke_simulation_renderer_contract.py
3. npm run test:sim:unit
4. npm run test:sim:correctness          ← NEW (Phase 01-08)
5. npm run test:sim:correctness:browser  ← NEW (Phase 01-08)
6. npm run test:sim:a11y                 ← NEW (Phase 08b)
7. npm run test:sim:browser
8. npm run test:sim:visual-quality
9. npm run test:sim:disposal
10. npm run test:sim:release
```

## Related Code Files

- Modify: `package.json` — add new correctness scripts to `test:sim:release` umbrella.
- Update: `tests/__snapshots__/sim-visual-quality-baseline.json` — refresh baselines.
- Add: `plans/260518-2300-sim-correctness-realism-overhaul/reports/before-after-screenshots/` (12 routes × 2 themes = 24 PNG).
- Add: `plans/260518-2300-sim-correctness-realism-overhaul/reports/perf-audit-2026-05-XX.md` — FPS measurements.
- Modify: `tools/smoke_simulation_runtime.py` if new global window keys added.

## Implementation Steps

1. Run full release pipeline. Resolve any failures.
2. Verify visual-quality baseline is **already current** — Phase 02-08b each refreshed baselines for their affected routes per the master plan's Baseline Refresh Convention. Phase 09 only validates no further drift.
   - If `npm run test:sim:visual-quality` reports unexpected diffs → trace back to which earlier phase missed its refresh. Do NOT mass-overwrite baseline here.
3. Capture before/after screenshots:
   - Routes: `ch1-1-3, ch1-1-4, ch1-1-8, ch1-2-1, ch1-2-3, ch2-1-1, ch2-1-3, ch2-2-2, ch2-5-2, ch3-1-2, ch3-3-1, ch3-6-2`
   - Themes: dark, light
   - Tool: agent-browser screenshot for each.
4. Performance audit:
   - Open ch3-6-2, drag balls to collide repeatedly, capture FPS via `lab.anim.getFPS()`.
   - Open ch3-3-1, run animation, capture FPS.
   - Open ch2-1-1, run trajectory animation, capture FPS.
   - Document in `perf-audit-...md`.
5. Offline test: copy build to USB, open `index.html` directly via `file://` on Windows + Mac, verify 5 routes (ch1-2-3, ch2-1-1, ch2-2-2, ch3-3-1, ch3-6-2).
6. Cross-browser: Chrome, Firefox, Edge — confirm `OffscreenCanvas` fallback paths work.
7. Aggregate per-phase `baseline-delta-phase-NN.md` reports into single `reports/baseline-delta-summary.md` for reviewer convenience.
8. Tag release in changelog (`docs/project-changelog.md`).

## Todo List

- [ ] Run full release pipeline, fix anything red
- [ ] Verify baseline is current (no surprise drift from earlier phases)
- [ ] 24 PNG screenshots captured (12 routes × 2 themes)
- [ ] FPS audit document with 3 route data points
- [ ] Offline `file://` test on 5 routes
- [ ] Cross-browser test on Chrome/Firefox/Edge
- [ ] Aggregate per-phase baseline-delta reports into summary
- [ ] Tag release in changelog

## Success Criteria

- [ ] `npm run test:sim:release` GREEN end-to-end
- [ ] All Python smoke gates GREEN
- [ ] FPS ≥ 55 on ch3-6-2 collision, ≥ 58 on ch3-3-1, ≥ 58 on ch2-1-1
- [ ] All 5 offline routes mount without console errors via `file://`
- [ ] All 3 browsers render identical structural marks
- [ ] Before/after screenshots committed; visible improvement on all 12 routes
- [ ] Visual baseline already accurate from per-phase refreshes — Phase 09 makes zero baseline mutations

## Risk Assessment

- **Risk:** A phase missed its baseline refresh → Phase 09 surfaces large diff.
  **Mitigation:** Trace back to the missing phase, refresh there + amend its baseline-delta report. Do not absorb the diff into Phase 09.
- **Risk:** `file://` paths break for new modules due to relative imports.
  **Mitigation:** All new code uses same `(function(){...})()` IIFE + window.X pattern as existing.
- **Risk:** Cross-browser shadow rendering differs (Firefox blur ≠ Chrome).
  **Mitigation:** Cap shadow blur ≤ 16; verify within tolerance.

## Security Considerations
- Verify no localStorage namespace collision with existing keys.

## Next Steps
- Phase 10 docs sync.
