# Phase 04 — Chạy end-to-end → user duyệt → báo cáo danh sách lỗi

## Context links
- Plan: [plan.md](plan.md) · blockedBy: Phase 03.

## Overview
- Priority: P1 · Status: completed
- Chạy toàn pipeline, user duyệt mắt contact-sheet, chốt báo cáo danh sách lỗi (kết quả cuối của cả plan).

## Key Insights
- Đây là điểm "augmented manual review": máy + Claude lọc trước, **mắt user quyết định cuối** về đẹp/rõ/đúng sư phạm.
- Kết quả KHÔNG phải code sửa — là **báo cáo lỗi** để user duyệt rồi quyết phiên sửa sau (out of scope lần này).

## Requirements
- Lệnh chạy gọn (tài liệu hoá trong README mục Mô phỏng hoặc plan): capture spec → build-contact-sheet → (Claude triage) → mở html.
- User duyệt contact-sheet, đánh dấu lỗi (miệng/ghi chú) → Claude tổng hợp.
- Báo cáo `plans/260531-2122-.../reports/sim2-visual-quality-findings-report.md`: bảng `route · §mục · kind · lỗi gì · mức (nặng/nhẹ) · ảnh kèm · nguồn (Claude/user)`.

## Architecture
```
npx playwright test tools/sim2-visual/capture-sims.spec.js
  → node tools/sim2-visual/build-contact-sheet.js
  → Claude soi → re-render
  → user mở visuals/contact-sheet.html duyệt mắt
  → Claude viết findings-report.md (chỉ đánh giá)
```

## Related code files
- Create: `reports/sim2-visual-quality-findings-report.md`.
- Read: `visuals/contact-sheet.html`, `claude-triage.json`.

## Implementation Steps
1. Chạy full pipeline, xác nhận đủ ảnh + sheet + triage.
2. Trình contact-sheet cho user; thu nhận đánh dấu lỗi của user.
3. Hợp nhất cờ Claude + phán của user → findings-report (phân mức nặng/nhẹ, ảnh kèm theo route).
4. Cập nhật `plan.md` các phase → completed; cập nhật memory (đã có pipeline đánh giá visual).
5. (Tùy chọn) ghi npm script tiện `test:sim:visual:capture` để chạy lại sau này.

## Todo
- [x] Chạy full pipeline OK
- [ ] User duyệt mắt contact-sheet (chờ user — deliverable đã sẵn sàng)
- [x] findings-report.md (route · lỗi · mức · ảnh)
- [x] Cập nhật plan status + memory
- [x] (tùy chọn) npm script capture (test:sim:visual:capture)

## Success Criteria
- findings-report liệt kê đủ route có vấn đề + mức + ảnh; route OK cũng ghi "đạt".
- User xác nhận báo cáo phản ánh đúng những gì họ thấy.
- `test:sim:release` vẫn xanh; không sim nào bị sửa trong lần này.

## Risk Assessment
- User thấy lỗi Claude bỏ sót → bình thường, đó là vai trò trọng tài cuối; ghi vào report nguồn=user.
- Nhiều lỗi → KHÔNG sửa ở đây; báo cáo làm input cho `/ck:plan` phiên sửa kế tiếp.

## Security Considerations
- Không có; chỉ đọc + viết markdown/html local.

## Next steps
- Phiên sau (ngoài plan này): `/ck:plan` sửa lỗi theo findings-report; sau khi sửa xong cân nhắc chốt baseline `toHaveScreenshot`.
