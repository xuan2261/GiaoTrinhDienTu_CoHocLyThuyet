---
phase: 3
title: "Đại tu Chương 1 (Tĩnh học)"
status: pending
priority: P2
effort: "10h"
dependencies: [2]
---

# Phase 3: Đại tu Chương 1 (Tĩnh học)

## Overview
Cập nhật 22 mô phỏng thuộc Chương 1 (Tĩnh học) sang chuẩn Visual và Interaction mới. Tập trung vào việc thể hiện các véc tơ lực phát sáng và các liên kết cơ học chân thực.

## Requirements
- Functional:
    - 22 route renderers cập nhật xong.
    - Hiển thị phản lực liên kết (reactions) với hiệu ứng Neon đặc trưng.
    - Bài toán ma sát có hiệu ứng rung nhẹ khi vật sắp trượt.
- Non-functional:
    - Tất cả 22 routes pass smoke tests.

## Architecture
- Cập nhật các renderers trong `js/sims/ch1/`.
- Sử dụng `SimVisualHelpers.neonArrow` cho các véc tơ lực.

## Related Code Files
- Modify: `js/sims/ch1/*.js`
- Modify: `js/sim-statics.js`

## Implementation Steps
1. Thiết lập baseline screenshots cho 22 routes.
2. Lần lượt cập nhật từng file renderer:
    - Thay thế `P.arrow` bằng `P.neonArrow` (nếu có).
    - Thêm hiệu ứng Glassmorphism cho các bảng thông số.
    - Cập nhật hình ảnh các liên kết (gối đỡ, ngàm) sang dạng Realistic (metal/concrete).
3. Kiểm tra tương tác Rigid cho từng route.
4. Chạy audit chất lượng hình ảnh (`audit_simulation_quality.py`).

## Success Criteria
- [ ] Các véc tơ lực có hiệu ứng phát sáng neon rõ rệt.
- [ ] Liên kết cơ học nhìn "thật" hơn (có bóng đổ, vật liệu kim loại).
- [ ] Ma sát hiển thị vùng "tự hãm" trực quan.

## Risk Assessment
- Rủi ro: Một số mô phỏng tĩnh học có cấu trúc phức tạp (không gian 2.5D) khó cập nhật visual.
- Giảm thiểu: Ưu tiên làm mượt các bài toán phẳng trước, giữ nguyên logic 2.5D chỉ nâng cấp shader/màu sắc.
