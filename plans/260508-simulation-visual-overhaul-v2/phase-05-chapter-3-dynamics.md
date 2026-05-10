---
phase: 5
title: "Đại tu Chương 3 (Động lực học)"
status: pending
priority: P2
effort: "10h"
dependencies: [4]
---

# Phase 5: Đại tu Chương 3 (Động lực học)

## Overview
Cập nhật 18 mô phỏng thuộc Chương 3 (Động lực học). Tập trung vào các hiện tượng vật lý năng động như va chạm, lò xo, và bảo toàn năng lượng với hiệu ứng Particles.

## Requirements
- Functional:
    - 18 route renderers cập nhật xong.
    - Va chạm có hiệu ứng Metallic Sparks (tia lửa).
    - Lò xo hiển thị dạng Realistic Spring với biến dạng mượt mà.
    - Biểu đồ năng lượng hiển thị dạng Glass Bar (thanh kính) phát sáng.
- Non-functional:
    - Logic va chạm chính xác theo hệ số phục hồi (e).

## Architecture
- Cập nhật các renderers trong `js/sims/ch3/`.
- Tích hợp `SimAnimationEngine.emitCollisionSparks`.

## Related Code Files
- Modify: `js/sims/ch3/*.js`
- Modify: `js/sim-dynamics.js`

## Implementation Steps
1. Viết test case cho va chạm: kiểm tra xem event `collision` có kích hoạt đúng thời điểm không.
2. Cập nhật renderers:
    - Thêm hiệu ứng phát tia lửa khi có va chạm (sparks).
    - Cập nhật lò xo (springs) sang chuẩn visual mới (đường nét thanh mảnh, bóng đổ).
    - Nâng cấp biểu đồ năng lượng động năng/thế năng sang chuẩn Glassmorphism.
3. Tích hợp hiệu ứng rung màn hình nhẹ khi có va chạm lớn.
4. Kiểm soát tính ổn định của tích phân ODE (RK4) khi có hiệu ứng Visual đi kèm.

## Success Criteria
- [ ] Va chạm nhìn rất "đã mắt" nhờ tia lửa và rung màn hình.
- [ ] Lò xo co giãn mượt mà, cảm giác có độ đàn hồi thật.
- [ ] Bảng năng lượng thay đổi động, trực quan.

## Risk Assessment
- Rủi ro: Nhiều hiệu ứng Particles đồng thời trong bài toán hệ vật có thể gây lag.
- Giảm thiểu: Tối ưu pool particles, tái sử dụng các object hạt cũ.
