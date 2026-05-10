---
title: "Simple Simulation Lab Debug Verification Hardening"
description: "Hard plan kiểm tra lại toàn diện simple simulation lab sau Plan 260508, khóa regression cho shell, direct interaction, browser evidence, automated QA, docs handoff trước khi unblock visual overhaul."
status: completed
priority: P1
effort: 18h
issue:
branch: none
tags: [simulation, debug, qa, browser, regression, hardening]
blockedBy: [260508-1435-simple-simulation-lab-assessment-removal]
blocks: [260507-1855-simulation-visual-ux-upgrade, 260508-simulation-visual-overhaul-v2]
created: 2026-05-08
source: "ck:plan --hard"
---

# Simple Simulation Lab Debug Verification Hardening

## Overview

Plan này biến kết quả debug/report sau Plan 260508 thành quy trình hardening có thể chạy lại: reproduce lỗi, fix root cause đúng tầng, kiểm trực tiếp bằng `ck:agent-browser`, chạy full automated QA, cập nhật docs, rồi chỉ unblock các visual plan khi evidence đủ.

## Inputs

| Source | Purpose |
|---|---|
| [Plan 260508](../260508-1435-simple-simulation-lab-assessment-removal/plan.md) | Scope simple shell, assessment removal, direct interaction rules |
| [Validation Report](../260508-1435-simple-simulation-lab-assessment-removal/reports/validation-report.md) | Root cause, agent-browser evidence, fresh QA results |
| [QA Evidence Synthesis](./research/qa-evidence-synthesis.md) | Condensed report-derived research |
| [Red Team Review](./reports/red-team-review.md) | Risks before execution |
| [Validation Checklist](./reports/validation-checklist.md) | Acceptance checklist and command gates |

## Cross-Plan Dependencies

| Relationship | Plan | Reason |
|---|---|---|
| Blocked by | [Simple Simulation Lab and Assessment Removal](../260508-1435-simple-simulation-lab-assessment-removal/plan.md) | This plan validates the completed simple shell baseline |
| Blocks | [Simulation Visual & UX Upgrade](../260507-1855-simulation-visual-ux-upgrade/plan.md) | Visual polish must not hide broken direct interaction/readout contracts |
| Blocks | [Simulation Visual Overhaul V2](../260508-simulation-visual-overhaul-v2/plan.md) | Neon/visual work must start from stable simple lab QA baseline |

## Phases

| Phase | Name | Status | Tests Included |
|---|---|---|---|
| 01 | [Baseline and Reproduction Inventory](./phase-01-baseline-and-reproduction-inventory.md) | Completed | Smoke, grep, targeted browser failure list |
| 02 | [Lab Shell DOM Compatibility Hardening](./phase-02-lab-shell-dom-compatibility-hardening.md) | Completed | `node --check`, runtime fake-DOM smoke |
| 03 | [Ch2 Trajectory and Graph Interaction Regression](./phase-03-ch2-trajectory-and-graph-interaction-regression.md) | Completed | `ch2-1-1`, `ch2-1-2` Playwright + agent-browser |
| 04 | [Ch3 Angular Momentum and Collision Regression](./phase-04-ch3-angular-momentum-and-collision-regression.md) | Completed | `ch3-5-3`, `ch3-6-2` Playwright + agent-browser |
| 05 | [All-Route Agent-Browser QA Matrix](./phase-05-all-route-agent-browser-qa-matrix.md) | Completed | Representative route manual matrix + screenshots |
| 06 | [Automated QA Gate Consolidation](./phase-06-automated-qa-gate-consolidation.md) | Completed | unit, quality, semantic, visual, release |
| 07 | [Docs Changelog Release Handoff](./phase-07-docs-changelog-release-handoff.md) | Completed | docs links, changelog, report evidence |
| 08 | [Visual Plan Unblock Readiness](./phase-08-visual-plan-unblock-readiness.md) | Completed | dependency checklist, no unresolved blockers |

## Global Success Criteria

- 58/58 routes mount in browser and `file://` route-mount gate.
- No visible assessment/checkpoint UI/runtime/storage contract returns.
- Direct manipulation updates readout for all route-owned handles.
- `ch2-1-1`, `ch2-1-2`, `ch3-5-3`, `ch3-6-2` have explicit browser evidence.
- `npm run test:sim:release` passes after all fixes/docs updates.
- Report folder contains enough screenshots and command evidence for later visual plans.

## Execution Summary

Completed 2026-05-08. Final hardening fixed readout sync for user-driven interactions, reset cleanup for runtime-only state, `ch3-6-2` collision drag velocity from pointer-down state, and finite `ch3-5-3` `L=Iω` fallback after reset.

Fresh QA evidence:

- `npm run test:sim:unit`: PASS, `node --check: 69 JS files PASS`.
- `npx playwright test tests/simulation-browser.spec.js --grep '@direct-drag'`: `70 passed`.
- `npm run test:sim:visual-quality`: `69 passed`.
- Runtime smoke: `simulation-runtime-smoke: PASS`.
- `npm run test:sim:browser`: `211 passed, 1 skipped`.
- `npm run test:sim:release`: PASS.

Visual plans listed in `blocks` are no longer blocked by this debug verification baseline.

## Cook Handoff

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260508-1921-simple-simulation-lab-debug-verification-hardening\plan.md
```

## Unresolved Questions

None.
