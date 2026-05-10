---
phase: 3
title: "Anti-Overlap Logic"
status: pending       
priority: P2          
effort: "3h"            
dependencies: [1, 2]      
---

# Phase 3: Anti-Overlap Logic

## Overview
Giải quyết tình trạng nhãn dán (text labels) hoặc KaTeX formulas bị đè lên các thành phần hình học (vector, đường thẳng, vật thể) khi di chuyển, gây khó đọc.

## Requirements
- **Functional**: Nhãn văn bản (hiện đang dùng KaTeX HTML Overlay) phải tự động né (offset) các đường vector (nằm dưới lớp Canvas).
- **Non-functional**: Thuật toán xử lý phải đủ nhanh để chạy trong Real-time render loop.

## Architecture
- Dùng logic Bounding Box cơ bản hoặc Raycasting để kiểm tra sự đụng độ (Collision Detection) giữa Text Label và Vector line.
- **Quan trọng**: Sử dụng hàm chiếu (Projection Matrix) từ `sim-vector-math.js` để chuyển đổi "Toạ độ logic (World Coords)" của Vector trên Canvas thành "Toạ độ màn hình (Screen Coords)" của DOM Overlay trước khi so sánh va chạm.
- Áp dụng các vị trí ưu tiên (Top, Bottom, Left, Right) cho Label và thử từng vị trí.

## Related Code Files
- Modify: `js/sim-core.js`
- Modify: `js/sim-rendering.js`

## Implementation Steps
1. Viết hàm tiện ích tính toán Bounding Box của Vector và Text, **áp dụng phép chiếu toạ độ (Projection)** để đồng bộ hệ quy chiếu DOM và Canvas.
2. Khi render một text label (cập nhật toạ độ overlay), xác định các vector lân cận.
3. Kiểm tra Bounding Box collision (dựa trên screen coords).
4. Nếu có va chạm, tịnh tiến text label theo vector trực giao hoặc chọn điểm offset xa dần cho đến khi an toàn.

## Success Criteria
- [ ] Label luôn đọc được, không bị cắt ngang bởi nét vẽ của các vector chính.
- [ ] Thu phóng (Zoom in/out) không làm hỏng vị trí của Label.

## Verification & Testing
- Thay đổi kích thước trình duyệt, di chuyển các điểm neo để tạo ra các góc hẹp.
- Kiểm tra xem text có tự động đổi vị trí tránh đè lên đường thẳng hay không.

## Risk Assessment
- *Rủi ro*: Thuật toán tìm vị trí nhãn quá đắt (chi phí O(N^2)) làm giảm FPS.
- *Giảm thiểu*: Giới hạn chỉ kiểm tra va chạm với các vật thể kề cận (local space), thay vì toàn cục (global space), và chỉ xử lý Anti-overlap cho Text chính.
