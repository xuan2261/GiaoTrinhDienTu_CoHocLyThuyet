# Simulation Visual and Interaction Overhaul (Hardening Pass)

**Date**: 2026-05-08 11:30
**Severity**: Low (Enhancement)
**Component**: Simulation Engine, Renderers, FX
**Status**: Resolved

## What Happened

Tôi đã thực hiện quy trình TDD để xác minh và củng cố toàn bộ 6 giai đoạn của kế hoạch đại tu hình ảnh mô phỏng. Mặc dù kế hoạch được ghi nhận là đã hoàn thành, việc kiểm tra sâu cho thấy một số tính năng 'Virtual Lab' cao cấp vẫn còn thiếu hoặc chưa được tối ưu hóa.

## The Brutal Truth

Nhiều renderer vẫn sử dụng các hình khối phẳng đơn giản (`fillRect`) trong khi kế hoạch yêu cầu hiệu ứng 'realistic' và 'glowing'. Nếu không có đợt hardening này, trải nghiệm 'Virtual Lab' chỉ dừng lại ở mức sơ đồ kỹ thuật thay vì một môi trường tương tác sống động. Việc thiếu hụt các hiệu ứng hạt (particles) khi va chạm cũng làm giảm tính thuyết phục vật lý của hệ thống.

## Technical Details

1. **Infrastructure**: Thêm `emitCollisionSparks`, `emitEnergyBurst` và `drawGlassBar` vào `SimVisualHelpers`.
2. **Primitives**: Bổ sung `realisticWheel` với radial gradients, spokes và shadows để tái sử dụng cho pulley/gears.
3. **Chapter 2 Upgrade**: Nâng cấp renderer `ch2-3-2` (truyền động đai) bằng `realisticWheel` và `cable`, xóa bỏ code vẽ chồng chéo.
4. **Chapter 3 Upgrade**: Nâng cấp `ch3-5-4` (định lý động năng) với các thanh năng lượng phong cách Glassmorphism và hiệu ứng glow.
5. **Dynamics FX**: Tích hợp `emitCollisionSparks` trực tiếp vào behavior va chạm của Chương 3.
6. **Assessment Feedback**: Thêm hiệu ứng hạt ăn mừng khi người dùng vượt qua các checkpoint.

## Root Cause Analysis

Sự thiếu hụt ban đầu do tập trung vào việc chuyển đổi chức năng từ docx sang canvas mà chưa đầu tư đủ vào 'visual polish'. Giai đoạn hardening này tập trung vào việc biến các primitives cơ bản thành các thành phần 'Virtual Lab' chuyên nghiệp.

## Lessons Learned

TDD không chỉ dùng để tìm bug chức năng mà còn để định nghĩa 'tiêu chuẩn chất lượng hình ảnh'. Việc tạo ra các helper chuyên dụng như `drawGlassBar` giúp duy trì tính nhất quán trên 58 routes mà không làm tăng chi phí bảo trì.

## Next Steps

1. Theo dõi hiệu năng trên các thiết bị di động tầm thấp khi có nhiều hiệu ứng hạt.
2. Tiếp tục áp dụng `realisticWheel` cho các route khác trong Chương 2 sử dụng pulley.
