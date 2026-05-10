---
phase: 1
title: "Nghiên cứu & Hạ tầng Visual"
status: pending
priority: P1
effort: "6h"
dependencies: []
---

# Phase 1: Nghiên cứu & Hạ tầng Visual

## Overview
Giai đoạn này tập trung vào việc nâng cấp các thư viện helper vẽ (`SimVisualHelpers.js`) và primitives (`SimRouteRendererPrimitives.js`) để hỗ trợ các hiệu ứng Neon, Glow, Gradients và Glassmorphism.

## Requirements
- Functional:
    - Mở rộng `SimVisualHelpers` với hàm `neonArrow`, `glowRect`, `glassPanel`.
    - Tích hợp Particle Engine đơn giản vào `SimAnimationEngine`.
- Non-functional:
    - Đảm bảo các hiệu ứng Glow không làm giảm FPS xuống dưới 60.

## Architecture
- `SimVisualHelpers`: Thêm các phương thức vẽ có sử dụng `shadowBlur` và `createLinearGradient`.
- `SimAnimationEngine`: Thêm hệ thống `Emitter` và `Particle` để xử lý các vụ nổ (sparks) hoặc tia lửa.

## Related Code Files
- Modify: `js/sim-visual-helpers.js`
- Modify: `js/sim-route-renderer-primitives.js`
- Modify: `js/sim-animation-engine.js`

## Implementation Steps
1. Nghiên cứu các mã màu Neon phù hợp với chủ đề Mechanics (Force: Red, Velocity: Blue, Accel: Green).
2. Viết Unit Test cho `neonArrow` để kiểm tra độ chính xác của hướng và độ phát sáng.
3. Cập nhật `SimVisualHelpers.js` với các hiệu ứng mới.
4. Triển khai Particle Emitter cơ bản cho các hiệu ứng va chạm.
5. Cập nhật `SimRouteRendererPrimitives.js` để hỗ trợ vẽ `realisticGround` và `realisticBeam` có texture/pattern.

## Success Criteria
- [ ] Hàm `neonArrow` vẽ đúng và có hiệu ứng glow đẹp mắt.
- [ ] Hệ thống Particle có thể sinh ra 20-30 hạt mà không bị lag.
- [ ] Primitives mới hỗ trợ vẽ vật liệu kim loại và bê tông chân thực.

## Risk Assessment
- Rủi ro: Canvas trở nên mờ (blurry) khi dùng quá nhiều shadow.
- Giảm thiểu: Sử dụng `save()` và `restore()` cẩn thận, giới hạn bán kính blur.
