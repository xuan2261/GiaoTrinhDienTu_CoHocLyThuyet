---
phase: 2
title: "Lõi Tương tác Rigid"
status: pending
priority: P1
effort: "4h"
dependencies: [1]
---

# Phase 2: Lõi Tương tác Rigid

## Overview
Nâng cấp hệ thống tương tác để loại bỏ độ trễ, đảm bảo vị trí chuột và vị trí vật thể trùng khớp hoàn toàn (Rigid Bind), đồng thời thêm các phản hồi thị giác khi tương tác.

## Requirements
- Functional:
    - Loại bỏ Spring logic khỏi các Handle mặc định.
    - Thêm hiệu ứng "Ripple" (sóng tròn) khi click vào điểm kéo.
    - Thêm "Magnetic Snap" (hút nam châm) khi điểm kéo tới gần vùng mục tiêu.
- Non-functional:
    - Độ trễ tương tác (Input to Render) < 16ms (1 frame).

## Architecture
- `SimInteractions`: Cập nhật logic `mousemove` để cập nhật trạng thái ngay lập tức.
- `SimInteractionEnhancements`: Thêm các hàm vẽ Ripple và Guide Lines phát sáng.

## Related Code Files
- Modify: `js/sim-interactions.js`
- Modify: `js/sim-interaction-enhancements.js`
- Modify: `js/sim-professional-lab.js`

## Implementation Steps
1. Viết test case Playwright đo khoảng cách giữa chuột và vật thể khi drag nhanh (phải gần bằng 0).
2. Chỉnh sửa `SimInteractions.js` để vô hiệu hóa Spring logic cho các tương tác trực tiếp.
3. Triển khai hiệu ứng Ripple tại vị trí click trong `SimInteractionEnhancements`.
4. Cập nhật `SimProfessionalLab` để hỗ trợ hiển thị Guide Lines khi đang kéo.

## Success Criteria
- [ ] Không còn cảm giác "rời rạc" giữa chuột và vật thể.
- [ ] Có hiệu ứng hình ảnh rõ ràng khi vật thể "Snap" vào vị trí mục tiêu.
- [ ] Con trỏ chuột tự động đổi thành `grabbing` khi đang kéo.

## Risk Assessment
- Rủi ro: Tương tác quá nhạy có thể gây khó khăn cho việc tinh chỉnh giá trị nhỏ.
- Giảm thiểu: Duy trì các thanh Slider cho việc nhập giá trị chính xác (Precision Control).
