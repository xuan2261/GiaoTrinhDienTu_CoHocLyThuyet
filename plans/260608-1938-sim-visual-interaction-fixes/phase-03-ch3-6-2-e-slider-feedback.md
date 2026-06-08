---
phase: 3
title: "Thêm ch3-6-2 e-slider live feedback"
status: completed
priority: P2
effort: "1.5h"
dependencies: []
---

# Phase 3: Thêm ch3-6-2 e-slider live feedback

## Overview
Slider hệ số phục hồi `e` hiện không phản hồi tức thì (`onInput` chỉ gán `params.e`, không redraw) → e chỉ tác động ở va chạm kế. Thêm preview "T mất (dự đoán)" tính từ va chạm ở điều kiện đầu, cập nhật ngay khi kéo e. Biến 2 cờ "dead" của probe (ch3-6-2/e + #sim3) thành live mà KHÔNG đổi physics.

## Requirements
- Functional: kéo `e` → readout cập nhật tức thì giá trị dự đoán T-mất hậu-va-chạm (dùng `D.resolveCollision2D` ở v ban đầu). Khi đang chạy/đã va chạm, readout vẫn phản ánh trạng thái thật.
- Non-functional: KHÔNG đổi `resolveCollision2D` (physics verify); preview chỉ GỌI hàm đó, không tính tay. Giữ động lượng/energy thật khi chạy.

## Architecture
File `js/sim2/sims/ch3/ch3-6-2.js`. Hiện `onInput: v => { params.e = v; }` (`:138`).

Sửa:
1. Tách hàm `predictLoss(e)`: từ v1/v2 ban đầu (2.2 / -1.0) gọi `D.resolveCollision2D(m1,m2,p1_0,p2_0,v1_0,v2_0,e)` → T_after; trả `max(0, T0 - T_after)`. (Dùng đúng hàm port, KHÔNG công thức tay.)
2. `onInput e`: `params.e = v; if (!collided && !shell.running) updateEPreview();` — chỉ preview khi đang ở pha trước va chạm/đứng yên; nếu đang chạy thì để `draw()` lo.
3. `updateEPreview()`: cập nhật 1 readout row "T mất (dự đoán)" qua `panel.setReadout([...])` giữ nguyên các row khác. HOẶC đơn giản hơn: thêm row dự đoán vào mảng readout trong `draw()` + 1 hàm nhẹ set lại khi đổi e ở trạng thái tĩnh.
4. Cập nhật `observe` text nếu cần (đổi e thấy dự đoán T-mất).

**Lưu ý schema readout (rủi ro probe B):** ch3-6-2 bMode=scene-delta → probe B skip, nên thêm row KHÔNG ảnh hưởng B. Probe A đo max|Δ| mọi row → thêm row preview đổi khi kéo e = e thành live. Đạt mục tiêu.

## Related Code Files
- Modify: `js/sim2/sims/ch3/ch3-6-2.js`

## Implementation Steps
1. **TDD (probe-as-check):** trước sửa, `npm run test:sim:probe` xác nhận ch3-6-2/e + ch3-6-2#sim3/e = dead (đã biết: 2 dead). Đây là "red".
2. Viết `predictLoss(e)` gọi `D.resolveCollision2D`; thêm row readout "T mất (dự đoán)".
3. `onInput e` cập nhật preview tức thì ở pha tĩnh.
4. Verify physics: `npm run test:sim:physics` 9/9 GIỮ NGUYÊN (không đụng dynamics.js).
5. `npm run test:sim:probe` lại → ch3-6-2/e chuyển live (delta≠0). "green".
6. `npm run test:sim:mount` xanh.
7. Sim3: state đẩy qua `sim3.setState` đã có `e`; kéo e ở pha tĩnh giờ cũng gọi draw→setState → #sim3/e cũng live. Xác nhận qua probe.

## Success Criteria
- [ ] Kéo e ở pha trước va chạm → readout "T mất (dự đoán)" đổi tức thì
- [ ] `test:sim:probe`: ch3-6-2/e + ch3-6-2#sim3/e từ dead → live (2 dead → 0)
- [ ] `test:sim:physics` 9/9 không đổi (preview chỉ gọi hàm port)
- [ ] `test:sim:mount` + giá trị thật khi chạy không sai

## Risk Assessment
- **Thêm row đổi layout panel** → mount coverage assert có thể nhạy. Mitigate: chạy mount sau sửa; row chỉ thêm, không xóa row cũ.
- **Preview ≠ giá trị thật gây nhầm**: ghi rõ label "(dự đoán)" để phân biệt với "T mất" thật khi chạy. User-decision: chọn preview thay vì re-render toàn scene (nhẹ hơn, không phá start-paused).
- **Đụng nhầm physics**: TUYỆT ĐỐI không sửa `dynamics.js`; chỉ gọi `D.resolveCollision2D`.
