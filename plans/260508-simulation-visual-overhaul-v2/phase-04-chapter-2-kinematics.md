---
phase: 4
title: "Đại tu Chương 2 (Động học)"
status: pending
priority: P2
effort: "10h"
dependencies: [3]
---

# Phase 4: Đại tu Chương 2 (Động học)

## Overview
Cập nhật 17 mô phỏng thuộc Chương 2 (Động học). Trọng tâm là chuyển động mượt mà, véc tơ vận tốc/gia tốc trực quan và hiệu ứng Motion Blur/Trails.

## Requirements
- Functional:
    - 17 route renderers cập nhật xong.
    - Thêm hiệu ứng Trail (đường vết) cho quỹ đạo chất điểm.
    - Véc tơ vận tốc hiển thị dạng Neon Blue, gia tốc dạng Neon Green.
- Non-functional:
    - Chuyển động quay đạt 60fps ổn định.

## Architecture
- Cập nhật các renderers trong `js/sims/ch2/`.
- Sử dụng `SimAnimationEngine.drawTrail` cho các chuyển động quỹ đạo.

## Related Code Files
- Modify: `js/sims/ch2/*.js`
- Modify: `js/sim-kinematics.js`

## Implementation Steps
1. Viết test case kiểm tra tính liên tục của quỹ đạo (không bị đứt đoạn khi kéo nhanh).
2. Cập nhật renderers:
    - Áp dụng Neon style cho véc tơ vận tốc (V) và gia tốc (a).
    - Thêm hiệu ứng Trails mờ dần cho các vật thể đang chuyển động.
    - Nâng cấp hình ảnh các bánh răng, thanh truyền sang dạng Realistic Wheel/Beam.
3. Tích hợp hiệu ứng "Speed Gauge" (đồng hồ tốc độ) dạng Glassmorphism.
4. Kiểm duyệt độ mượt của chuyển động quay quanh trục cố định.

## Success Criteria
- [ ] Quỹ đạo chất điểm hiển thị mượt mà, có vết mờ phía sau.
- [ ] Véc tơ vận tốc và gia tốc phân biệt rõ ràng bằng màu Neon.
- [ ] Cơ cấu tay quay con trượt nhìn chắc chắn và chân thực.

## Risk Assessment
- Rủi ro: Hiệu ứng Trail tích lũy nhiều có thể tốn bộ nhớ.
- Giảm thiểu: Giới hạn độ dài Trail tối đa 20-30 điểm và xóa các điểm cũ.
