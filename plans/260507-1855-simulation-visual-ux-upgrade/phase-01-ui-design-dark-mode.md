---
phase: 1
title: "UI Design & Dark Mode"
status: pending       
priority: P1          
effort: "4h"            
dependencies: []      
---

# Phase 1: UI Design & Dark Mode

## Overview
Cập nhật tầng Rendering (chủ yếu trong `sim-rendering.js`) để hỗ trợ Native Dark Mode cho Canvas và cải thiện tính thẩm mỹ (Aesthetics) cho các đối tượng mô phỏng.

## Requirements
- **Functional**: Canvas phải tự động cập nhật màu sắc khi user chuyển đổi theme (Light/Dark). *Bắt buộc phải có event listener hoặc MutationObserver để force redraw khi đổi theme.*
- **Non-functional**: Hiệu năng render (FPS) không bị ảnh hưởng đáng kể.

## Architecture
- Sử dụng CSS Variables (`--bg-card`, `--text-main`, v.v.) truyền vào ngữ cảnh Canvas rendering.
- Bổ sung hệ thống Modern Palette, gradient, shadow, và glow effect để tạo chiều sâu khối cho vật thể.
- Tích hợp hook vào hàm `togTheme()` (hoặc theo dõi `data-theme` mutation) để gọi `simulation.requestRedraw()` ngay lập tức, khắc phục lỗi lệch pha render.

## Related Code Files
- Modify: `js/sim-rendering.js`
- Modify: `js/sim-lab-ui.js`
- Modify: `css/style.css` (nếu cần thêm các biến màu cho Canvas)

## Implementation Steps
1. Khảo sát các hàm render hiện tại trong `sim-rendering.js` (vẽ vector, mũi tên, hình học).
2. Viết thêm tiện ích lấy màu từ CSS Variables vào hàm vẽ.
3. Thay thế các màu hard-code thành các màu theme-aware.
4. Tăng độ dày (`lineWidth`) và thêm shadow (ví dụ `shadowBlur`, `shadowColor`) cho các đối tượng quan trọng.
5. Cập nhật `app.js` hoặc `sim-core.js` để bắt sự kiện thay đổi theme và gọi `requestRedraw()` cho Canvas.

## Success Criteria
- [ ] Chuyển đổi Dark Mode hoàn hảo mà không làm chói mắt hoặc che khuất hình vẽ.
- [ ] Các thành phần hình học trông nổi bật, có khối và đẹp mắt hơn.

## Verification & Testing
- Mở giáo trình, chuyển sang Dark Theme, kiểm tra Canvas.
- Xác nhận các Vector có màu sắc chuẩn, nét vẽ mượt mà, không bị răng cưa hay nhòe.

## Risk Assessment
- *Rủi ro*: Tính toán shadow/glow liên tục trong `requestAnimationFrame` có thể làm tụt FPS trên máy cấu hình yếu.
- *Giảm thiểu*: Chỉ kích hoạt shadow cho các trạng thái tĩnh hoặc giới hạn độ phức tạp của glow effect.
