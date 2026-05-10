---
title: "Validation Report"
status: complete
created: 2026-05-09
---

# Validation Report

## User Decisions Captured

| Question | Answer |
|---|---|
| Priority | Vừa đẹp giống DeCuong, vừa đúng vật lý/tương tác từng route |
| Theme | Cần giữ theme sáng cho simulation |
| Approach | Duyệt hướng 2: route-by-route UX upgrade trên engine hiện có |
| Output requested | Hard plan chi tiết, cụ thể, đầy đủ phases, có verify/tests từng phase |

## Interpretation

- "Đẹp giống DeCuong" means UX pattern: dark/navy lab, readable readout cards, direct drag, formula context, minimal controls.
- "Giữ theme sáng" means simulation must react to existing `data-theme`, not force dark canvas everywhere.
- "Route-by-route" means all 58 routes must be covered, but execution should be grouped by mechanics topic to avoid chaotic edits.
- "Tests từng phase" means every phase file includes exact verification commands and route-specific acceptance checks.

## Acceptance Contract

| Area | Must Pass |
|---|---|
| Runtime | 58 route ids remain mounted through `window.SIM_MAP` |
| UX | Student knows what to drag without reading long instructions |
| Visual | No major text/object overlap, no cropped main objects |
| Theme | Dark and light both readable |
| Physics | Key readouts update from actual route state/formulas |
| QA | Full `npm run test:sim:release` passes at end |

## Unresolved Questions

Không có.
