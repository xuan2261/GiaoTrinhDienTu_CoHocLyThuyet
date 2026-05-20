---
title: "Simulation Review 2026-05-19 Priority Fixes"
description: "Khắc phục các vấn đề phát hiện qua self-review 58 mô phỏng (capture 2026-05-19): 4 lỗi physics, 1 bug mount DeCuong shell, 3 lớp UX (slider unit, readout format, empty panel hint), label collision, pixel coordinate cleanup, và 7 redesign route. TDD-first per phase, 58-route registry contract bất biến, visual baseline refresh sau mỗi phase. Áp dụng red-team Tier 1 fixes 2026-05-20 (file paths grep-verified, hard-cutover slider, ch3-7-2 split-plan)."
status: pending
priority: P1
effort: "78h"
branch: "master"
tags: [bugfix, frontend, simulations, ux, qa, tdd, physics-correctness]
blockedBy: []
blocks: []
created: "2026-05-19"
createdBy: "ck:plan"
source: "ck:plan --deep --tdd"
---

# Simulation Review 2026-05-19 Priority Fixes

## Overview

Plan giải quyết toàn bộ findings từ batch capture `screenshots/sim-review-2026-05-19T13-00/`. Mục tiêu: zero physics regression + UX nhất quán cho 58 route. Áp dụng thứ tự **P0 → P1 → P2 → P3** để kiểm soát blast radius. Mỗi phase tests-first (RED → GREEN → REFACTOR), không phá `SIM_ROUTE_MANIFEST` (58 route contract), giữ release gate `npm run test:sim:release` 100% pass cuối plan.

**Decisions chốt với user (2026-05-19 / 2026-05-20):**
- **Slider px → unit vật lý**: **HARD CUTOVER** (không feature flag). Mở rộng `addSlider(label,min,max,val,step,unit,onChg,opts)` với `opts={physicalUnit,pxPerUnit,formatter}`; 11 route migrate trong P04 (ch1-3-3 EXCLUDED — discrete chooser → P05). Slider nội bộ lưu giá trị vật lý, render layer convert sang px.
- **Toạ độ pixel**: convert sang m với coordinate có nghĩa (xG, IC, x_C); bỏ với toạ độ phụ ("Điểm đặt"). KHÔNG ship `js/sim-coord-convert.js` central table — dùng `state.pxPerMeter` per-route (rule of three chưa trigger).
- **Panel rỗng**: hint text default ("Kéo handle hoặc nhấn ▶ Chạy để xem kết quả"); autoplay-then-pause cho **ch3-6-2** (va chạm) và **ch3-5-4** (năng lượng). Mở rộng `scene.autoplay = { mode: 'preview-pause', frames: N }` (KHÔNG thêm `lab.boot()` API mới).
- **DeCuong shell mount lỗi**: SCOUT trước khi MODIFY. `js/loader.js:427-449` Read-only (loader pattern verified working cho 55+ route khác); bug khả năng cao là per-route fragment HTML hoặc `SIM_ROUTE_ALIAS_MAP` entry.
- **ch3-7-2 redesign CUT khỏi plan**: Phase 11 thu hẹp về single route `ch3-5-3`. Input-check feature cho ch3-7-2 (cùng ch1-7-2, ch2-7-2 graded-exercise) lifted sang split-plan riêng tạo ở Phase 12.

## Source Findings

| Source | Path |
|---|---|
| Capture batch | `screenshots/sim-review-2026-05-19T13-00/` |
| Visual analysis | `screenshots/sim-review-2026-05-19T13-00/analysis/simulation-review-2026-05-19-visual-analysis-findings-and-issues.md` |
| Capture script | `tools/capture-all-58-simulations-screenshots.js` |
| Manifest JSON | `screenshots/sim-review-2026-05-19T13-00/capture-manifest.json` |

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Builds on | [Sim Correctness Realism Overhaul](../260518-2300-sim-correctness-realism-overhaul/simulation-correctness-realism-overhaul-master-plan.md) | completed | Baseline TDD harness, structural marks, handle-anchor invariants đã có; plan này mở rộng kiểm tra sang slider/readout/label layers. |
| Builds on | [Compact Simulation Readout Cards](../260514-compact-simulation-readout-cards/) | completed | Readout card layout giữ nguyên; plan này chỉ chuẩn hoá format số + unit. |
| Builds on | [Simulation Right Inspector Panel](../260513-2300-simulation-right-inspector-panel/) | completed | Inspector slot là source of truth; canvas chỉ trợ giúp. |

## Phases

| Phase | Name | Priority | Status | Verify Gate |
|---:|---|---|---|---|
| 01 | [Baseline TDD Harness And Failing Invariants](./phase-01-baseline-tdd-harness.md) | P0 | Pending | 8 RED suites parse + fail on master HEAD; capture-diff harness ready |
| 02 | [P0 Physics Correctness — ch1-3-2 ch1-3-6 ch1-5-3 ch3-5-2](./phase-02-p0-physics-correctness.md) | P0 | Pending | Physics invariants GREEN, slider↔readout drift = 0 |
| 03 | [P0 DeCuong Shell Mount Fix — ch2-1-1 ch2-1-4 ch2-7-2](./phase-03-p0-decuong-shell-mount-fix.md) | P0 | Pending | Capture re-run: 3 route hiển thị `.sim-header` đúng, không có DeCuong header overlay |
| 04 | [P1 Slider Engine Refactor To Physical Units](./phase-04-p1-slider-engine-refactor-physical-units.md) | P1 | Pending | `addSlider(...,opts={physicalUnit,pxPerUnit,formatter})` HARD CUTOVER; 11 route hết hiển thị `px` (ch1-3-3 → P05) |
| 05 | [P1 Readout Formatter And Unit Standardization](./phase-05-p1-readout-formatter-unit-standardization.md) | P1 | Pending | Readout audit: 0 ô missing-unit; 0 raw-number-as-discrete-label |
| 06 | [P2 Empty Panel Hint Default](./phase-06-p2-empty-panel-hint-default.md) | P2 | Pending | 11 panel rỗng có hint mặc định; `scene.autoplay = { mode:'preview-pause', frames:N }` cho ch3-6-2 + ch3-5-4 |
| 07 | [P2 Label Collision Prevention With Leader Lines](./phase-07-p2-label-collision-prevention.md) | P2 | Pending | Label-overlap detector: 0 collision ở 15 route mục tiêu (snapshot diff) |
| 08 | [P2 Coordinate Pixel Cleanup](./phase-08-p2-coordinate-pixel-cleanup.md) | P2 | Pending | xG/IC/x_C readout dùng m; "Điểm đặt" pixel bị remove |
| 09 | [P3 Redesign Statics Group A — ch1-3-1 ch1-3-3 ch1-3-7](./phase-09-p3-redesign-statics-routes-ch1-3-1-ch1-3-3-ch1-3-7.md) | P3 | Pending | Hình học gắn bề mặt; vector trong canvas; loại liên kết = label |
| 10 | [P3 Redesign Statics Group B — ch1-4-2 ch1-5-1 ch1-5-4](./phase-10-p3-redesign-statics-routes-ch1-4-2-ch1-5-1-ch1-5-4.md) | P3 | Pending | Vector có legend rõ; helper graphic gắn body; tải gắn đỉnh nêm |
| 11 | [P3 Redesign Dynamics — ch3-5-3](./phase-11-p3-redesign-dynamics-routes-ch3-5-3-ch3-7-2.md) | P3 | Pending | L panel có nội dung; ch3-7-2 CUT sang split-plan riêng (graded-exercise input-check) |
| 12 | [Re-capture Visual Regression And Release Gate](./phase-12-re-capture-visual-regression-and-release-gate.md) | P1 | Pending | Capture batch mới = 58/58 OK; `npm run test:sim:release` GREEN; baseline updated |

## Risk Snapshot

| Risk | Mitigation |
|---|---|
| Slider HARD CUTOVER (P04) phá 11 route đồng thời | RED suite per-route mount-mode test trước migrate; batch verification 4-route lots; rollback plan = revert slider commit + restore P02 ch1-3-2 binding |
| ch3-7-2 split-plan tạo cuối plan dễ bị quên | Phase 12 success criteria require split-plan stub created; tag `graded-exercise-input-check` cho 3 route ch1-7-2 / ch2-7-2 / ch3-7-2 |
| Physics fix làm sai bài toán đã in trong giáo trình | Phase 02 đối chiếu công thức trong `simulation-list.md` (DOCX truth) trước khi sửa code |
| Visual baseline drift quá lớn cuối plan | Phase 01 ship `tools/sim-visual-baseline-update.js` + `test:sim:visual-quality:update` script; mỗi phase visual-affecting refresh baseline cho route ảnh hưởng + commit side-by-side diff |
| 58-route registry contract đứt | Mỗi phase chạy `npm run test:sim:renderer-contract` trước khi đóng |
| Phase 02 ↔ Phase 04 race trên `ch1-support-spatial-behaviors.js` | P02 chỉ math (lines 77 cho ch1-3-6); slider plumbing (76, 98, 142 cho ch1-3-2/3-6) chuyển P04. Documented split. |
| Phase 04 → Phase 05 → Phase 09 ordering cho ch1-3-3 | P04 EXCLUDE ch1-3-3 (discrete chooser); P05 thêm DISCRETE_MAPPERS cho 'Loại liên kết'; P09 redesign sau P05 ổn định format. |

## Success Definition

- 58/58 route capture OK, không thay đổi route id/registry
- 0 physics bug remaining (4 route P0 sửa xong; ch1-3-2 drift binding green sau P04)
- 0 slider hiển thị `px` trong readout panel (11 route migrate; ch1-3-3 discrete handled in P05)
- 0 readout thiếu unit hoặc dùng raw number cho discrete
- DeCuong header không overlay sim header (3 route ch2-1-1, ch2-1-4, ch2-7-2)
- Empty panel hint cho 11 route; preview-pause autoplay cho ch3-6-2 + ch3-5-4
- `npm run test:sim:release` PASS (chain bao gồm `test:sim:review-2026-05-19` aggregate)
- `tests/sim-review-2026-05-19/` 8 suite GREEN
- Visual baseline refresh qua `tools/sim-visual-baseline-update.js` cho mỗi phase visual-affecting (no ad-hoc edits)
- Plan `archive` + journal entry chốt
- Split-plan stub cho ch3-7-2 graded-exercise input-check (cùng ch1-7-2 / ch2-7-2) created at Phase 12 close
