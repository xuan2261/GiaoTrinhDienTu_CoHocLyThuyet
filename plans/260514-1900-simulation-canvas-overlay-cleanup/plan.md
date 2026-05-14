---
title: "Simulation Canvas Overlay Cleanup"
description: "Remove learner-facing formulas and dynamic values from the sim-canvas overlay across 58 simulation routes; move formulas/readouts to right inspector contracts with regression gates."
status: completed
priority: P1
effort: 42h
issue:
branch: master
tags: [bugfix, frontend, simulations, canvas, ux, qa]
blockedBy: []
blocks: []
created: 2026-05-14
source: "ck:plan --hard"
---

# Simulation Canvas Overlay Cleanup

## Overview

Plan này xử lý triệt để hiện tượng trong vùng `sim-canvas` có công thức và giá trị động. Root cause đã xác định: 58/58 routes đang dùng `.sim-lab-overlay` phủ lên canvas; renderer gọi `P.domMath(...)` 135 lần để render `.sim-overlay-formula`/panel trong scene. Readout cards và formula panel bên phải không bị lọt vào canvas.

Mục tiêu: canvas chỉ còn hình học/vật lý/handle/label ngắn; công thức nằm ở `.sim-formula-panel`; giá trị động nằm ở `.sim-readout-card`; regression gate khóa 58 routes để lỗi không quay lại.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Reverses part of | [Canvas HTML Overlay Migration](../260507-1600-canvas-html-overlay-migration/plan.md) | completed | Giữ overlay cho label/metadata nếu cần, nhưng bỏ formula/value learner-facing khỏi canvas |
| Builds on | [Simulation Right Inspector Panel](../260513-2300-simulation-right-inspector-panel/plan.md) | completed | Right inspector đã có slot formula/readout đúng chỗ |
| Builds on | [Simulation Readout Dedup Normalization](../260514-0617-simulation-readout-dedup-normalization/plan.md) | completed | Readout policy đã ổn; cần migrate giá trị động vào explicit readouts |
| Coordinates with | [DeCuong Simulation Full Rebuild](../260512-0845-decuong-simulation-full-rebuild/plan.md) | completed | Giữ 58 route contracts, direct drag, visual gates |

## Research And Reports

| Report | Purpose |
|---|---|
| [Root Cause Report](./reports/root-cause-report.md) | Evidence DOM/code/browser cho nguyên nhân overlay |
| [Research Synthesis](./research/research-synthesis.md) | So sánh giải pháp, chọn policy migration |
| [Red Team Review](./reports/red-team-review.md) | Rủi ro hard-mode và mitigation |
| [Validation Report](./reports/validation-report.md) | Acceptance criteria, tests, quyết định khóa |

## Phases

| Phase | Name | Status | Verify Gate |
|---:|---|---|---|
| 01 | [Baseline Overlay Inventory](./phase-01-baseline-overlay-inventory.md) | Completed | 58-route overlay matrix + 135 `P.domMath` calls classified |
| 02 | [Overlay Contract And Failing Tests](./phase-02-overlay-contract-and-failing-tests.md) | Completed | Tests fail while formulas/values remain in `.sim-lab-overlay` |
| 03 | [Shared Primitive Guard](./phase-03-shared-primitive-guard.md) | Completed | `P.domMath` no longer renders learner-facing formula/value overlay by default |
| 04 | [Formula Panel Migration](./phase-04-formula-panel-migration.md) | Completed | Route formulas present in `.sim-formula-panel`, no canvas formulas |
| 05 | [Dynamic Value Readout Migration](./phase-05-dynamic-value-readout-migration.md) | Completed | Dynamic values represented by explicit readout cards |
| 06 | [Scene Label And Diagram Cleanup](./phase-06-scene-label-and-diagram-cleanup.md) | Completed | Canvas keeps only short labels/markers; no equation-like overlay text |
| 07 | [All Route QA And Visual Verification](./phase-07-all-route-qa-and-visual-verification.md) | Completed | 58-route browser/visual/semantic/release gates pass |
| 08 | [Docs Changelog And Handoff](./phase-08-docs-changelog-and-handoff.md) | Completed | Docs synced, changelog updated, unresolved questions closed |

## Dependencies

- Runtime: static `HTML/CSS/JS`, must keep `file://` support.
- Core files: `js/sim-route-renderer-primitives.js`, `js/sim-professional-lab.js`, `js/sim-lab-ui.js`.
- Route files: `js/sims/ch1/*-renderers.js`, `js/sims/ch2/*-renderers.js`, `js/sims/ch3/*-renderers.js`, scene/behavior catalogs as needed.
- Tests: `tests/simulation-browser.spec.js`, `tests/simulation-visual-quality.spec.js`, `tests/simulation-test-utils.js`, possible new `tests/simulation-overlay-contract.spec.js`.
- Docs: `docs/design-guidelines.md`, `docs/system-architecture.md`, `docs/project-roadmap.md`, `docs/project-changelog.md`.

## Success Criteria

- 58/58 routes: `.sim-lab-overlay .sim-overlay-formula` count is `0` in learner UI.
- Overlay panels/labels do not contain equation/value patterns such as `=`, `\sum`, `\vec`, `toFixed` output, `N`, `rad/s`, `m/s`, unless explicitly whitelisted as a short diagram label.
- `.sim-formula-panel` contains route-level formulas where pedagogically needed.
- `.sim-readout-card` contains dynamic values previously shown in canvas.
- Direct drag, sliders, play/pause, reset, route-owned handles, scene identity, and visual-quality gates remain green.
- No runtime bundler/framework added; no edits to generated `js/pages.js`.

## Cook Handoff

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260514-1900-simulation-canvas-overlay-cleanup\plan.md
```

## Unresolved Questions

- None. Assumption locked: formula/value UI belongs to right inspector; canvas scene keeps only diagram visuals and short labels.
