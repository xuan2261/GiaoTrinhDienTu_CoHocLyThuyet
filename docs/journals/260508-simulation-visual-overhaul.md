# Simulation Visual and Interaction Overhaul: Từ Phẳng 2D đến Virtual Lab Thực Tế

**Date**: 2026-05-08 10:30
**Severity**: Medium
**Component**: Simulation Engine (JS/Canvas)
**Status**: Resolved

## What Happened

Chúng ta vừa hoàn thành một đợt đại tu (overhaul) toàn diện hệ thống mô phỏng cơ học. Thay vì các khối hình học phẳng (flat 2D) đơn điệu, toàn bộ 58 lộ trình (routes) bài học hiện đã được nâng cấp lên giao diện "Virtual Lab". Hệ thống mới mang lại cảm giác vật lý thật hơn thông qua các chất liệu realistic và engine tương tác có độ phản hồi (feedback) cao.

## The Brutal Truth

Thú thật, hệ thống 2D cũ trông giống như một bài trình bày PowerPoint hơn là một giáo trình điện tử hiện đại. Nó thiếu sự "nặng" của vật lý. Người dùng chỉ kéo thả các khối mà không cảm nhận được lực đàn hồi, không có sự căn chỉnh tự động, dẫn đến trải nghiệm rời rạc. Việc duy trì 58 routes với code render cũ là một "cơn ác mộng" bảo trì khi mỗi thay đổi nhỏ đều có nguy cơ phá vỡ logic tính toán cơ học.

## Technical Details

### 1. Virtual Lab & Realistic Primitives
Chúng ta đã từ bỏ các lệnh `fillRect` và `strokeRect` đơn giản để chuyển sang một hệ thống `Renderer Primitives` phức tạp hơn:
- **Chất liệu**: Sử dụng Canvas Gradients và Shadow Blur để giả lập kim loại phay (brushed metal), gỗ bóng (polished wood) và dây thừng có vân (textured rope).
- **Ánh sáng**: Áp dụng hệ thống đổ bóng hướng tâm (radial shadows) giúp các vật thể có chiều sâu 3D trên nền Canvas 2D.

### 2. Engine tương tác thế hệ mới
- **Spring Drag**: Khi kéo vật thể, nó không còn bám cứng vào chuột mà có độ trễ động lực học (spring damping), tạo cảm giác về khối lượng.
- **Magnetic Snap**: Các điểm nối (joints) và giá đỡ hiện có vùng từ tính, tự động "hút" vật thể vào đúng vị trí lắp đặt khi ở gần.
- **Hover System**: Hệ thống highlight thông minh giúp người dùng biết rõ bộ phận nào có thể tương tác trước khi click.

### 3. TDD Rigor
Đây là phần "xương sống" của đợt overhaul:
- **83 Test Cases**: Bao gồm kiểm tra va chạm, tính toán vector lực, và độ chính xác của render.
- **58 Routes Coverage**: Đảm bảo từ các bài Tĩnh học (Statics) đơn giản đến Động lực học (Dynamics) phức tạp đều hoạt động ổn định.
- **Regression Suite**: Chạy trên Playwright để đảm bảo không có lỗi UI trên các trình duyệt khác nhau.

## Quyết định kỹ thuật: Native Shadows vs Complex Shaders

Một cuộc tranh luận lớn đã nổ ra: Liệu nên dùng WebGL Shaders (Three.js) hay tối ưu Canvas 2D?
- **Lựa chọn**: **Canvas Native Shadows & Gradients**.
- **Lý do**: Mặc dù Shaders có thể cho hiệu ứng ánh sáng rực rỡ hơn, nhưng nó tiêu tốn tài nguyên GPU quá mức trên các thiết bị di động của sinh viên. Bằng cách sử dụng `shadowBlur`, `shadowColor` kết hợp với `createLinearGradient`, chúng ta đạt được 90% chất lượng hình ảnh Virtual Lab mà vẫn giữ được tốc độ 60 FPS ổn định trên cả các máy tính bảng cấu hình thấp.

## What We Tried

- Đã thử dùng `requestAnimationFrame` kết hợp với `OffscreenCanvas` để tăng tốc nhưng nhận thấy overhead của việc chuyển dữ liệu giữa các luồng (workers) làm tăng độ trễ tương tác chuột (mouse latency). Cuối cùng quay lại render trực tiếp nhưng tối ưu hóa vùng vẽ (dirty rect).

## Root Cause Analysis

Tại sao cần overhaul? Vì sự tương tác là chìa khóa của việc học Cơ học. Nếu sinh viên không thấy "thích" khi chạm vào vật thể, họ sẽ không tò mò để thử các biến số khác nhau. Hệ thống cũ quá "tĩnh", không khơi gợi được sự khám phá.

## Lessons Learned

1. **Visuals Matter**: Trong giáo dục, thẩm mỹ không chỉ là vẻ ngoài, nó là công cụ để giữ chân người học.
2. **Performance Budget**: Luôn phải giữ một "ngân sách" hiệu năng. Đừng hy sinh khả năng tiếp cận của sinh viên chỉ vì một vài hiệu ứng đổ bóng phức tạp.
3. **Tests are Documentation**: 83 bài test này chính là tài liệu tốt nhất giải thích cách một hệ thống đòn bẩy hay ròng rọc phải hoạt động như thế nào.

## Next Steps

- Mở rộng thêm các phòng thí nghiệm chuyên sâu (Professional Lab) cho chương 3 (Động lực học).
- Thu thập phản hồi từ giảng viên về độ nhạy của hệ thống Magnetic Snap.
