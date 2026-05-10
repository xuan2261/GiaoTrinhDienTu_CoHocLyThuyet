---
phase: 6
title: "QA & Tối ưu Performance"
status: pending
priority: P1
effort: "4h"
dependencies: [5]
---

# Phase 6: QA & Tối ưu Performance

## Overview
Giai đoạn cuối cùng để đảm bảo tất cả 58 mô phỏng hoạt động hoàn hảo trên mọi thiết bị, không có lỗi visual và đạt hiệu năng tối ưu.

## Requirements
- Functional:
    - Chụp lại bộ 58 screenshots mới cho tài liệu.
    - Đảm bảo 100% test cases (Visual & Interaction) đều pass.
- Non-functional:
    - FPS trung bình toàn trang > 55.

## Architecture
- Không thay đổi kiến trúc, chỉ tinh chỉnh cấu hình (config).

## Related Code Files
- Modify: `tools/audit_simulation_quality.py`
- Modify: `tests/simulation-visual-quality.spec.js`

## Implementation Steps
1. Chạy full suite `npm run test:sim:quality`.
2. Kiểm tra độ tương phản màu sắc để đảm bảo tính dễ đọc (Accessibility).
3. Tối ưu lại các vòng lặp vẽ nếu phát hiện hiện tượng rớt khung hình (dropped frames).
4. Cập nhật `docs/project-changelog.md` với các thay đổi lớn về Visual/UX.

## Success Criteria
- [ ] 58/58 mô phỏng đạt chuẩn "High-Quality".
- [ ] Không có báo cáo lỗi về tương tác tách rời (detach).
- [ ] Dung lượng bundle không tăng quá 5% sau khi thêm các helpers mới.

## Risk Assessment
- Rủi ro: Có lỗi phát sinh trên trình duyệt Safari hoặc Firefox do các hiệu ứng shadow/glow khác nhau.
- Giảm thiểu: Kiểm thử trình duyệt chéo (Cross-browser testing) bằng Playwright.
