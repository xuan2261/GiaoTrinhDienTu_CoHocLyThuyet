---
phase: 4
title: "Synthesize report + action list"
status: complete
priority: P2
effort: "1h"
dependencies: [3]
---

# Phase 4: Tổng hợp report + danh sách hành động

## Overview
Tổng hợp kết quả chấm thành 1 report: bảng grade 35 route × 3 tiêu chí (26 fresh + 9 carried),
lỗi thật (đã lọc false-fail bằng interaction-far + probe), danh sách hành động ưu tiên cho vòng sửa sau.

## Requirements
- Functional: report self-contained, bảng grade + finding + ưu tiên P1/P2 + ghi nhận 2D-vs-3D.
- Non-functional: phân biệt rõ "lỗi thật" vs "false-fail đã minh oan"; nêu rõ verdict nào fresh, nào carried.

## Architecture
- Report tại `plans/reports/` theo naming convention.
- Cấu trúc: cổng kỹ thuật → phương pháp (interaction-far diệt false-fail, chỉ grade 26 mới) → bảng grade
  35 route (cờ fresh/carried) → lỗi thật theo ưu tiên → false-fail đã xác minh (KHÔNG hành động,
  kèm probe-cite) → quan sát 2D-vs-3D (chỉ ghi) → câu hỏi mở.

## Related Code Files
- Create: `plans/reports/visual-quality-review-260611-1042-35-sim-interactive-report.md`

## Implementation Steps
1. Tổng hợp 26 verdict fresh + 9 carried thành bảng grade (cột nguồn: fresh/carried-2231).
2. Phân nhóm finding: lỗi thật (P1/P2) vs false-fail (không hành động) — mỗi false-fail kèm probe-cite.
3. Ghi quan sát 2D-vs-3D (route nào 3D đáng giá) — CHỈ ghi nhận, KHÔNG đề xuất quyết định.
4. Đối chiếu: lỗi thật nào ĐÃ được fix bởi plan 0006 (ch2-2-2/ch2-4-4/ch3-1-3) → đánh dấu "đã xử".
5. Liệt kê câu hỏi mở.
6. Cập nhật memory `sim2-visual-qa-pipeline` (pipeline thêm slider-far + đường Sim3 bespoke).

## Success Criteria
- [ ] Report có bảng grade đủ 35 route × 3 tiêu chí, phân biệt fresh/carried.
- [ ] Danh sách hành động ưu tiên, lỗi thật tách bạch false-fail (probe-cite).
- [ ] Ghi nhận 2D-vs-3D (không quyết). Đánh dấu finding đã-fix-bởi-0006.

## Risk Assessment
- Risk: report trộn false-fail vào lỗi thật. Mitigation: mỗi finding "feedback" bắt buộc kèm probe
  match-state của đúng route (kế thừa HARD gate Phase 3).
- Risk: report trùng lặp 2231. Mitigation: report này tập trung phần MỚI (xác nhận/bác false-fail qua
  slider-far) + tham chiếu 2231 cho phần carried, KHÔNG sao chép lại verdict carried dạng dài.
