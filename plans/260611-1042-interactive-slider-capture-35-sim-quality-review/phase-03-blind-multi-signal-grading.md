---
phase: 3
title: "Multi-signal grading — 26 fresh interaction-far + 9 carry-forward"
status: complete
priority: P1
effort: "2h"
dependencies: [2]
---

# Phase 3: Chấm đa tín hiệu — 26 route frame MỚI + 9 route carry-forward

## Overview
Chấm 3 tiêu chí (visual/bố cục · feedback tương tác · đúng vật lý/sư phạm). **Chỉ grade MỚI 26
route có frame tương tác mới** (slider-far hoặc drag-far); 9 route animation-only frame không đổi →
carry-forward verdict report 2231 (kèm note "pixel không đổi từ 06-10"). Tránh re-litigate verdict
đã chốt trên pixel y hệt.

## SCOPE quyết định (red-team #3 + validation Q1)

- **Grade MỚI (26):** 16 Sim2 slider-far + 5 Sim2 drag-far + 5 Sim3 slider-far.
- **Carry-forward (9):** animation-only không interaction-far → frame y hệt 2231 → lấy thẳng verdict
  2231 (`independent-blind-recheck-260610-2231...:63-104`), KHÔNG re-grade. NGOẠI LỆ: ch2-2-2,
  ch2-4-4 pixel ĐÃ đổi do fix 0006 → grade-fresh bằng mắt re-capture, KHÔNG carry.

## Architecture
- Grader chấm MÙ song song theo chương cho 26 route mới (cấm đọc report 1418/2231 + cấm đọc của nhau).
- Mỗi grader nhận: ảnh (init + interaction-far slider/drag + step nếu động) + **entry probe JSON của
  ĐÚNG route đó** + source path (`js/sim2/sims/*.js` / `js/sim3/sims/*.js`).
- **Bind probe per-route (red-team #6 — HARD):** mỗi finding "feedback yếu/none" BẮT BUỘC kèm
  `probeB.items[].match` / `probeA.deltaNonZero` của đúng route. match=true + ảnh đổi yếu → phân loại
  "yếu-nhưng-đúng" (false-fail), KHÔNG "broken". Controller reject finding feedback không có probe-cite.
- **Rubric note (red-team #7):** "feedback có thể nằm ở READOUT-SỐ panel, không chỉ ở scene hình học"
  (vd ch3-3-1 k→ω, ch2-5-3 ω→vM đổi số, hình gần đứng yên). Grader phải đọc panel, không chỉ nhìn vector.

## Related Code Files
- Read-only: capture PNG (2 thư mục visuals), `interaction-probe.json`, source sim files, report 2231.
- KHÔNG modify file nào ở phase này.

## Implementation Steps
1. Gom artifact mỗi route trong 26: ảnh path + probe entry (đúng route) + source path.
2. Spawn grader mù song song theo chương (prompt tự chứa: ảnh, probe entry, source, 3 tiêu chí,
   rubric-note feedback-readout, cấm-list report cũ).
3. Mỗi grader trả: grade/route × 3 tiêu chí + finding + phân loại real vs false-fail (bắt buộc probe-cite).
4. Controller gom 26 verdict mới + 9 verdict carry-forward → bảng 35 route.
5. Reject mọi finding "feedback" thiếu probe-cite (red-team #6).

## Success Criteria
- [ ] 26 route mới có verdict 3 tiêu chí; 9 route carry-forward có verdict 2231 + note.
- [ ] MỌI finding "feedback yếu/none" kèm `probe.match`/`deltaNonZero` của đúng route (HARD gate).
- [ ] Bảng phủ đủ 35 route (26 fresh + 9 carried), phân biệt rõ nguồn verdict.

## Risk Assessment
- Risk: grader vẫn anchor dù cấm. Mitigation: prompt không nêu grade cũ; chỉ artifact thô.
- Risk: carry-forward 9 route giấu regression (lỡ pixel đổi). Mitigation: trước carry, controller
  so file PNG 9 route với capture 2231 (size/mtime) — chỉ carry nếu thật sự không đổi; đổi → grade mới.
- Risk: ch3-5-3 interaction-far ω-nhỏ vẫn gần init dù đã chọn biên xa. Mitigation: probe match=true (sign '-')
  là bằng chứng cứng "đúng nhưng yếu"; grader buộc dùng nó, không chấm "broken" từ ảnh.
