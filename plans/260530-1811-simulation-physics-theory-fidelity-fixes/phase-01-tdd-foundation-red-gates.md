---
phase: 1
title: "TDD Foundation & Red Gates"
status: pending
priority: P1
effort: "0.5d"
dependencies: []
---

# Phase 01: TDD Foundation & Red Gates

## Overview
Dựng harness test-first: viết các test RED bắt đúng từng lỗi physics/đơn vị/panel trước khi sửa code, để mọi phase sau có GREEN gate khách quan. Không sửa code sản phẩm ở phase này.

## Requirements
- Functional: mỗi route BROKEN/WEAK có ít nhất 1 assertion RED phản ánh đúng lỗi audit.
- Functional: thêm "physics-source guard" test — assert readout đại lượng vật lý của behavior khớp giá trị tính từ `SimPhysics{Statics,Kinematics,Dynamics}` (chống RC1 inline re-implementation).
- Non-functional: chạy được offline bằng Node + Playwright sẵn có; không thêm dependency mới.

### Helper bổ sung BẮT BUỘC trước khi guard chạy (red-team verified)
- `momentum2d` (vector 2D p=Σmᵢvᵢ) hiện KHÔNG có trong `sim-physics-dynamics.js` — chỉ là hàm route-local `ch3-dynamics-theorem-collision-behaviors.js:15`; shared module chỉ có `momentumBefore/After` scalar 1D. → Phase 01 THÊM `momentum2d` (đã có test) vào `sim-physics-dynamics.js` để physics-source guard có nguồn assert cho ch3-6-2/ch3-5-2.
- `resultant3D` (Σ theo x/y/z) hiện KHÔNG có; `reduceToResultant` chỉ 2D `{Rx,Ry,Mo}`. → Phase 01 THÊM helper sum 3D (dựa `spatialForceComponents`) vào `sim-physics-statics.js` cho ch1-4-1 (Phase 02 dùng).

## Architecture
- Node physics invariant layer: mở rộng `tests/simulation-invariants.test.js` + `js/sim-route-invariants.js` (đã có pilot 6 route) thêm spec cho route trong scope.
- Browser readout/unit layer: tạo `tests/sim-theory-fidelity.spec.js` (Playwright) — mount route, đọc readout panel + nhãn đơn vị, assert (a) giá trị khớp công thức, (b) không có ký hiệu sai thứ nguyên, (c) không còn khung panel rỗng (panel có viền nhưng 0 text con).
- CẢNH BÁO regex đơn vị (red-team): KHÔNG dùng `m(?!²)` chung — nó match cả `m/s`, `m/s²` hợp lệ gây false-positive. Chỉ áp regex diện tích cho readout KEY diện tích (S, area); chặn `°` chỉ trên key mô men/tan.
- Physics-source guard so sánh state THÔ (float) với giá trị shared-module + tolerance theo domain, KHÔNG so với DOM đã format (`toFixed`, map 'hold'→'bám' phá so khớp chuỗi).
- Dùng `data-sim-route` + readout DOM selector hiện có (theo `capture-all-58-simulations-screenshots.js` cho canvas wait).

## Related Code Files
- Modify: `tests/simulation-invariants.test.js`, `js/sim-route-invariants.js`
- Create: `tests/sim-theory-fidelity.spec.js`
- Read for context: `js/sim-physics-statics.js`, `js/sim-physics-kinematics.js`, `js/sim-physics-dynamics.js`, `package.json` (scripts test:sim:*)
- Modify: `package.json` (thêm script `test:sim:theory-fidelity`)

## Implementation Steps
1. Liệt kê assertion mong đợi cho 23 route từ 3 báo cáo chương (bảng verdict).
2. THÊM 2 helper còn thiếu vào shared module (mỗi helper kèm unit test thuần toán): `momentum2d` (vector 2D) vào `sim-physics-dynamics.js`; `resultant3D` (Σ x/y/z) vào `sim-physics-statics.js`.
3. Viết physics-source guard: với mỗi route, gọi shared physics với input từ state, so khớp readout behaviour (tolerance theo domain: statics 1e-6, kinematics 1e-2, dynamics RK4 5e-2). So state THÔ, không so DOM đã format.
4. Viết unit-label regex guard cho readout (chặn `°` trên key mô men/tan; regex diện tích chỉ trên key S/area — KHÔNG dùng `m(?!²)` chung).
5. Viết empty-panel guard: assert mọi `.sim-*` panel vẽ trên canvas không để vùng nội dung trống (đối chiếu số overlay node = 0 trên route nghi vấn từ `tools/check-overlay-panels.js`).
6. Chạy → xác nhận tất cả FAIL đúng chỗ (RED). Ghi snapshot kết quả RED vào report.

## Success Criteria
- [ ] `momentum2d` + `resultant3D` thêm vào shared module, có unit test thuần toán PASS.
- [ ] Test mới chạy được, FAIL đúng các route lỗi (RED baseline).
- [ ] Physics-source guard FAIL ở route inline-recompute (ch1-4-1, ch2-4-4...).
- [ ] Unit-label guard FAIL ở ch1-5-3, ch1-4-2, ch1-6-3, ch3-6-2; KHÔNG false-positive trên `m/s`.
- [ ] Empty-panel guard FAIL ở ch3-5-3, ch3-2-2, ch2-2-2, ch2-3-2, ch3-6-3.
- [ ] Script `npm run test:sim:theory-fidelity` thêm vào package.json.

## Risk Assessment
- Readout DOM selector có thể khác giữa route → dùng selector chung từ sim-lab-ui; nếu lệch, đọc 1 route mẫu để xác định cấu trúc trước khi tổng quát hóa.
- Tolerance quá chặt gây flaky → theo tolerance pilot trong `sim-route-invariants.js`.
