---
phase: 5
title: "P1 Dynamics Wiring (ch3-3-2, ch3-6-2, ch3-5-3)"
status: pending
priority: P1
effort: "1.5d"
dependencies: [1]
---

# Phase 05: P1 Dynamics Wiring (ch3-3-2, ch3-6-2, ch3-5-3)

## Overview
Sửa 3 route Động lực: cơ hệ lò xo vẽ 3 nhưng mô hình 1, va chạm bảo toàn giả, mô men động lượng không dạy bảo toàn. Module toán dynamics đúng — lỗi ở wiring/render.

## Requirements
- ch3-3-2: PT chuyển động khớp hình 3 lò xo (tường-m1-m2-tường) HOẶC hình khớp PT 1 lò xo; dùng RK4 thay Euler.
- ch3-6-2: bỏ ép p_trước=p_sau mỗi tick; p tính từ CÙNG state dùng render; đơn vị px/frame quy đổi sang kg·m/s (scale dt + px/m).
- ch3-5-3: minh họa bảo toàn mô men động lượng (đổi I → ω điều chỉnh giữ L); I,ω,r ràng buộc I=mr² cho chất điểm.
- Đối chiếu: `muc-III-2.html`, `muc-VI-2.html`, `muc-V-3.html` (eq 3.31/3.32).

## Architecture
- ch3-3-2: sửa eq trong `ch3-dynamics-theorem-collision-behaviors.js`/`...newton-dalembert...` để gồm lực 2 lò xo tường, dùng `rk4Step` (đã dùng ở ch3-3-1). HOẶC nếu giữ 1-spring model thì renderer vẽ 1 lò xo — chọn khớp lý thuyết mục III-2.
- ch3-6-2: xóa `setCollisionMomentum(state,p0,p0,0)` mỗi tick (L75); chỉ set p từ trạng thái thật; quy đổi vx (px/frame)→m/s.
- ch3-5-3: thêm control đổi I, ω = L/I để giữ L; renderer vẽ r,v nhất quán I=mr².

## Related Code Files
- Modify: `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js`, `ch3-spring-mass-coupled-springs-dalembert-renderers.js`, `ch3-theorems-renderers.js`, `ch3-collision-exercises-renderers.js`
- Read: `js/sim-physics-dynamics.js` (rk4Step verified L78, restitutionVelocity verified L138), `muc-III-2.html`, `muc-VI-2.html`, `muc-V-3.html`
- LƯU Ý: `momentum2d` (vector 2D) KHÔNG có trong shared module — hiện route-local `ch3-dynamics-theorem-collision-behaviors.js:15`. Phase 01 đã chuyển nó vào `sim-physics-dynamics.js` (có unit test); ch3-6-2 gọi từ shared module để physics-source guard assert được.
- Evidence: behaviors:98-99 vs spring-renderers:87-107 (3-3-2); behaviors:65-95 L69/L75 (3-6-2); behaviors:49-53 / theorems-renderers:85-107 (3-5-3)

## Implementation Steps (tests-first)
1. Xác nhận RED Phase 01: ch3-6-2 (p giả luôn bảo toàn), ch3-3-2 (energy drift Euler / eq-visual mismatch), ch3-5-3 (không có scenario bảo toàn).
2. ch3-6-2: bỏ ép p; assert |p_after−p_before|<tol từ state thật; quy đổi đơn vị. (rõ nhất)
3. ch3-3-2: thống nhất eq↔hình; chuyển RK4; assert energy drift trong tol.
4. ch3-5-3: thêm bảo toàn L (đổi I→ω); ràng buộc I=mr²; bỏ slider độc lập mâu thuẫn.
5. Chạy invariants → GREEN; `node --check`.

## Success Criteria
- [ ] ch3-6-2: p tính từ state thật; va chạm tường không bị che; đơn vị kg·m/s đúng.
- [ ] ch3-3-2: eq khớp hình; RK4; năng lượng bảo toàn trong tol.
- [ ] ch3-5-3: đổi I thì ω đổi giữ L=const; hình nhất quán.
- [ ] 3 test GREEN.

## Risk Assessment
- Quyết định ch3-3-2 (vẽ-3 vs mô-hình-1): theo lý thuyết muc-III-2 chọn mô hình đúng; nếu mục dạy 2-khối-1-lò-xo-giữa thì sửa HÌNH (bỏ 2 lò xo tường) — rẻ hơn sửa eq. Xác nhận từ HTML trước khi code.
- ch3-5-3 panel rỗng xử lý ở Phase 08, ở đây chỉ lo physics.
