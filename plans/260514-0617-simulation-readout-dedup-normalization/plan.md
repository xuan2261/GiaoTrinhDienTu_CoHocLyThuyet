---
title: "Simulation Readout Dedup Normalization"
description: "Normalize simulation readout cards so they show core physics outputs, avoid duplicate control echoes, and keep 58-route QA contracts clean."
status: completed
priority: P1
effort: 34h
issue:
branch: master
tags: [bugfix, frontend, simulations, ux, qa]
blockedBy: []
blocks: []
created: 2026-05-14
source: "ck:plan --hard"
---

# Simulation Readout Dedup Normalization

## Overview

Plan này sửa hiện tượng readout cards bị lặp/trùng trong 58 simulation. Mục tiêu: readout cards chỉ hiển thị đại lượng vật lý kết quả/trạng thái học tập cốt lõi; controls không bị echo tự động; các route có duplicate alias hoặc seed gây hiểu nhầm được sửa có kiểm chứng.

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Builds on | [Simulation Right Inspector Panel](../260513-2300-simulation-right-inspector-panel/plan.md) | completed | Readouts đang nằm trong right inspector |
| Builds on | [Compact Simulation Readout Cards](../260514-compact-simulation-readout-cards/plan.md) | completed | Compact card CSS đã ổn, plan này sửa data/content |
| References | [Promax Simulation Correctness Pedagogy Upgrade](../260513-1450-promax-simulation-correctness-pedagogy-upgrade/plan.md) | completed | Giữ invariant metadata/pilot hidden behavior |
| Coordinates with | [DeCuong Simulation Full Rebuild](../260512-0845-decuong-simulation-full-rebuild/plan.md) | completed | Không phá 58-route renderer/behavior contracts |

## Research And Reports

| Report | Purpose |
|---|---|
| [Scout Report](./reports/scout-report.md) | Runtime evidence, duplicate matrix, source files |
| [Research Synthesis](./research/research-synthesis.md) | Policy options, recommendation |
| [Red Team Review](./reports/red-team-review.md) | Risks, failure modes, mitigations |
| [Validation Report](./reports/validation-report.md) | Locked acceptance criteria and tests |

## Phases

| Phase | Name | Status | Verify Gate |
|---:|---|---|---|
| 01 | [Baseline Readout Audit Harness](./phase-01-baseline-readout-audit-harness.md) | Completed | Machine-readable 58-route readout matrix committed under plan reports |
| 02 | [Readout Policy And Engine Guard](./phase-02-readout-policy-and-engine-guard.md) | Completed | Engine supports explicit append policy without changing compact CSS |
| 03 | [Ch1 Duplicate Alias Cleanup](./phase-03-ch1-duplicate-alias-cleanup.md) | Completed | Ch1 duplicate values removed except intentional physics equality |
| 04 | [Ch2 Kinematics Readout Normalization](./phase-04-ch2-kinematics-readout-normalization.md) | Completed | Ch2 no generic/control noise; `ch2-1-3` `a_n` and `rho` distinct with units |
| 05 | [Ch3 Dynamics Readout Normalization](./phase-05-ch3-dynamics-readout-normalization.md) | Completed | Ch3 no `F`/`Lực F` echo; conservation duplicates classified |
| 06 | [Automated Regression Gates](./phase-06-automated-regression-gates.md) | Completed | New tests fail on duplicate aliases and pass after cleanup |
| 07 | [Docs Changelog And Release Verification](./phase-07-docs-changelog-and-release-verification.md) | Completed | Docs updated; targeted + release simulation gates recorded |

## Dependencies

- Runtime: static `HTML/CSS/JS`, offline `file://`.
- Main engine: `js/sim-professional-lab.js`.
- Scene catalogs: `js/sims/ch1/*-scenes.js`, `js/sims/ch2/ch2-kinematics-scenes.js`, `js/sims/ch3/ch3-dynamics-all-18-scenes.js`.
- Tests: `tests/simulation-test-utils.js`, `tests/simulation-browser.spec.js`, possible new readout policy spec.
- Docs: `docs/design-guidelines.md`, `docs/system-architecture.md`, `docs/project-changelog.md`.

## Success Criteria

- No duplicate alias cards: `|F₁|/|F1|`, `N/|N|`, `Lực căng/|T|`, `N dọc trục/|N| dọc trục`, `ΣF/|R| cân bằng`, `F/Lực F`.
- Control values are not auto-added to readout cards unless scene opts in explicitly.
- Generic `mode`, `alpha`, and `time` are opt-in or context-limited, not blanket noise.
- `ch2-1-3` shows `a_n` and `rho` as distinct concepts with units and formula consistency.
- Intentional conservation/default equalities remain allowed: `R_A=R_B`, `p trước=p sau`, `m1=m2`.
- Existing 58-route mount, direct drag, renderer/behavior/scene identity, visual overflow, and compact card tests pass.

## Cook Handoff

```powershell
/ck:cook D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\plans\260514-0617-simulation-readout-dedup-normalization\plan.md
```

## Unresolved Questions

- None. Assumption locked: readout cards prioritize physics outputs; controls only appear when explicitly declared for pedagogy.
