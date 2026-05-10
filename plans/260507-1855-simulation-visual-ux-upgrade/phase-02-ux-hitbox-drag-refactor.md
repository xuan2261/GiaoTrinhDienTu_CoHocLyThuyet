---
phase: 2
title: "UX Hitbox & Drag Refactor"
status: pending       
priority: P1          
effort: "4h"            
dependencies: [1]      
---

# Phase 2: UX Hitbox & Drag Refactor

## Overview
Đại tu hệ thống tương tác (Interaction system) trong `sim-interactions.js` nhằm giúp người dùng thao tác kéo thả dễ dàng và mượt mà hơn.

## Requirements
- **Functional**: Tăng kích thước vùng bắt chuột (hitbox) lên khoảng 300% so với điểm neo (handle) thực tế.
- **Non-functional**: Thao tác kéo thả không bị lag, có hiệu ứng hover phản hồi ngay lập tức. Tránh sụt FPS khi check khoảng cách di chuột liên tục.

## Architecture
- Tách biệt giữa `Rendered Size` (kích thước hiển thị) và `Hitbox Size` (kích thước vật lý để bắt sự kiện chuột/touch).
- Tích hợp logic nội suy (interpolation) hoặc làm mượt (easing) cho drag tracking.
- Áp dụng kỹ thuật **Throttling** cho sự kiện `mousemove`. Chỉ kích hoạt hàm vẽ lại (redraw) khi trạng thái `isHovered` thực sự thay đổi.

## Related Code Files
- Modify: `js/sim-interactions.js`
- Modify: `js/sim-rendering.js` (để render trạng thái hover)

## Implementation Steps
1. Xác định các Class/Hàm quản lý Pointer Down/Move/Up.
2. Tách biến ranh giới kiểm tra chuột (bounding box/radius) ra khỏi biến radius hiển thị.
3. Thêm trạng thái `isHovered` cho các handle/vector. Lắng nghe `mousemove` có throttle.
4. Cập nhật hàm vẽ để khi `isHovered == true`, điểm neo sẽ hơi phóng to lên (hover effect). Chỉ gọi `redraw` khi `isHovered` đổi từ false sang true hoặc ngược lại.
5. Tối ưu thuật toán kéo thả để chuột không bị "tuột" khỏi vật thể khi rê chuột quá nhanh.

## Success Criteria
- [ ] Dễ dàng bấm trúng các handles trên cả màn hình cảm ứng lẫn chuột.
- [ ] Cảm giác kéo thả mượt mà, không giật cục.

## Verification & Testing
- Sử dụng công cụ mô phỏng thiết bị di động (Chrome DevTools) để test touch events.
- Kéo thả các handles rất nhanh để kiểm tra độ nhạy và bám dính của con trỏ.

## Risk Assessment
- *Rủi ro*: Hitbox quá to dẫn đến bấm nhầm giữa các handle nằm sát nhau.
- *Giảm thiểu*: Ưu tiên handle nào gần trung tâm con trỏ nhất (tính bằng khoảng cách vector) khi có sự chồng lấp hitbox.
