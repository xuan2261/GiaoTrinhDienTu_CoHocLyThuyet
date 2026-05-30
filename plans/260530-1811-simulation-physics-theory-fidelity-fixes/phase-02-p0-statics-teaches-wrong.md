---
phase: 2
title: "P0 Statics Teaches-Wrong (ch1-4-4, ch1-4-1)"
status: pending
priority: P1
effort: "1d"
dependencies: [1]
---

# Phase 02: P0 Statics Teaches-Wrong (ch1-4-4, ch1-4-1)

## Overview
Sửa 2 route Tĩnh học đang dạy NGƯỢC khái niệm: cân bằng không gian không bao giờ về 0, và hợp lực không gian hiển thị 2 giá trị mâu thuẫn. Cao nhất vì sai về mặt kiến thức.

## Requirements
- ch1-4-4: ΣF, ΣM phải dẫn từ một hệ lực thật người dùng cân chỉnh, hội tụ →0 khi cân bằng; trạng thái "cân bằng/chưa" phản ánh đúng.
- ch1-4-1: một và chỉ một |R| hợp lực; thành phần Rx/Ry/Rz từ tổng véc tơ thật; hình chiếu lực mang đơn vị N (không "m").
- Đối chiếu lý thuyết: `chapters/ch1/muc-IV-4.html` (R=0 ∧ M=0), `muc-IV-1.html` (véc tơ chính).

## Architecture
- Thay heuristic pixel trong `derived` bằng gọi `SimPhysicsStatics` (RC1): ch1-4-4 dùng `checkEquilibrium` (verified L214); ch1-4-1 dùng `resultant3D` (helper MỚI thêm ở Phase 01 — `reduceToResultant` hiện chỉ 2D `{Rx,Ry,Mo}`, KHÔNG đủ cho hợp lực 3D) cộng `spatialForceComponents` (verified L110).
- Renderer chỉ đọc kết quả từ `derived`, bỏ mũi tên trang trí không bám số.
- ch1-4-1: đây là vấn đề HỢP LỰC + nhãn N (không phải scale px→SI) → relabel hình chiếu = N ngay tại phase này; KHÔNG đưa ch1-4-1 vào sweep px→SI phase 07 (tránh trùng/mâu thuẫn).

## Related Code Files
- Modify: `js/sims/ch1/ch1-support-spatial-behaviors.js` (derived ch1-4-4, ch1-4-1), `js/sims/ch1/ch1-spatial-renderers.js`
- Read: `js/sim-physics-statics.js`, `chapters/ch1/muc-IV-1.html`, `muc-IV-4.html`
- Evidence: behaviors:80-88,98; ảnh 15, 17

## Implementation Steps (tests-first)
1. Xác nhận RED của Phase 01 cho ch1-4-4 (residual không →0) và ch1-4-1 (2 resultant).
2. ch1-4-1: thay `Math.hypot(spatialX,spatialY,spatialZ)` bằng tổng véc tơ lực thật qua `SimPhysicsStatics`; xóa giá trị "|R| 3D" thứ hai; gắn đơn vị N cho hình chiếu.
3. ch1-4-4: dựng force list điều khiển được; ΣF, ΣM, residual = `checkEquilibrium()`; renderer hiển thị residual→0 và badge cân bằng.
4. Cập nhật renderer bỏ véc tơ trang trí.
5. Chạy theory-fidelity + invariants → GREEN cho 2 route. `node --check` file sửa.

## Success Criteria
- [ ] ch1-4-4: tại cấu hình cân bằng, ΣF→0 và ΣM→0; residual phản ánh thật.
- [ ] ch1-4-1: chỉ 1 |R|; hình chiếu đơn vị N; thành phần = tổng véc tơ.
- [ ] Test Phase 01 cho 2 route chuyển GREEN.

## Risk Assessment
- Helper statics đã VERIFIED tồn tại (checkEquilibrium L214, spatialForceComponents L110, spatialMoment L127, reduceToResultant L140). `resultant3D` là helper MỚI (Phase 01 thêm) vì reduceToResultant chỉ 2D.
- Cap 220 dòng (audit_simulation_quality, file behavior KHÔNG nằm trong exempt list): `ch1-support-spatial-behaviors.js` hiện 166 dòng. Thêm wiring 2 physics có thể vượt 220. → Nếu vượt, tách derived ch1-4-1/ch1-4-4 ra file mới `js/sims/ch1/ch1-spatial-equilibrium-derived.js`, export hàm derived, và re-register trong behavior registry (`ch1-support-spatial-behaviors.js` map cuối file) TRƯỚC khi chạy gate. Ghi rõ bước wiring registry.
- Sửa renderer làm đổi canvas → visual baseline sẽ drift; refresh baseline gom ở Phase 10 (không tự update giữa chừng).
