---
phase: 3
title: "Chương 2 — 7 sim động học"
status: completed
priority: P1
effort: "2.5d"
dependencies: [2]
---

# Phase 3: Chương 2 — 7 mô phỏng động học (#11–17)

## Overview
Dựng 7 sim Ch2 trên engine P1. Lần đầu bật **canvas underlay** (CÙNG transform với SVG) cho
#11 (vết quỹ đạo), #15 (Coriolis), #17 (trường vận tốc). #12/#13/#14/#16 SVG thuần.

## Requirements
- Functional: 7 route mount qua `SIM_MAP`, dispose sạch (gồm hủy RAF + canvas).
- Functional: canvas underlay khớp toạ độ SVG (vẽ qua cùng `tf`); nhãn vẫn DOM không chồng.
- Functional: animation (quay/quỹ đạo) chạy mượt; physics khớp dạng đóng.
- Non-functional: 0 console error; SVG không chậm (trail dày đẩy xuống canvas).

## Architecture
| # | Route | Sim | Physics (kinematics) | Underlay |
|---|-------|-----|----------------------|----------|
| 11 | ch2-1-1 | Quỹ đạo chất điểm + v, a | ellipsePoint/parabolaPoint + deriv | **canvas** (vết) |
| 12 | ch2-1-3 | Tiếp/pháp tuyến + bán kính cong | radiusOfCurvature | SVG |
| 13 | ch2-2-2 | Quay quanh trục cố định (ω, α) | angularDisplacement/Velocity | SVG |
| 14 | ch2-3-2 | Truyền động bánh răng–đai–puli | gearRatio/beltVelocity | SVG |
| 15 | ch2-4-4 | Hợp chuyển động & Coriolis | coriolisAcceleration | **canvas** (đường tương đối) |
| 16 | ch2-5-2 | Tâm vận tốc tức thời (IC) | locateInstantCenter/instantCenterVelocity | SVG |
| 17 | ch2-5-3 | Phân bố vận tốc điểm trên vật rắn | instantCenterVelocity (field) | **canvas** (trường) |

**Underlay rule:** `canvas-underlay.js` nhận cùng `tf`; mỗi frame `ctx.clear()` rồi vẽ trail/field;
SVG vẽ vật + handle ở trên; overlay nhãn trên cùng. 1 transform → 3 tầng khớp.

## Related Code Files
- **Create:** `js/sim2/sims/ch2/ch2-1-1.js` … `ch2-5-3.js` (7 file).
- **Modify:** `index.html` (thêm 7 script-tag ch2).
- **Reference:** `js/sim2/physics/kinematics.js`, `js/sim2/core/canvas-underlay.js`.

## TDD — Tests trước
1. **WRITE FIRST** `tests/sim2-ch2-physics.test.js` (node:test): 7 block — ch2-2-2 ω=ω0+αt; ch2-3-2 tỉ số truyền i=z2/z1=ω1/ω2; ch2-4-4 a_cor=2ω×v_rel (độ lớn+hướng); ch2-5-2 IC suy hình học; ch2-1-3 R=v²/a_n. RED.
2. **WRITE FIRST** `tests/sim2-ch2-mount.spec.js` (Playwright): 7 route mount; nhãn DOM không chồng; **#11/#15/#17 có `<canvas>` + canvas hasContent sau vài frame**; điểm SVG và điểm canvas tại cùng world-pt trùng pixel (sai số ≤1px) — `assertCanvasSvgAligned`; 0 error; dispose hủy RAF (no leak).
3. Chạy → đỏ. Code. Chạy lại → xanh.

## Implementation Steps
1. Viết 2 test file (RED).
2. Code #12/#13/#14/#16 (SVG thuần) trước — đơn giản hơn, validate shell.
3. Code #11/#15/#17 với underlay: dựng canvas layer, RAF vẽ trail/field qua `tf`.
4. ch2-2-2: né gotcha `derived()` emit `alpha` đè slider `alpha` → đổi tên readout.
5. Test alignment canvas↔SVG: mount, đặt 1 điểm marker SVG + 1 dot canvas tại world(1,1), so pixel.
6. Chạy toàn bộ Ch2 → xanh.

## Success Criteria
- [ ] `sim2-ch2-physics.test.js` xanh (7/7).
- [ ] `sim2-ch2-mount.spec.js` xanh: 7/7 mount, nhãn không chồng, #11/#15/#17 canvas hasContent, **canvas↔SVG khớp ≤1px**, dispose hủy RAF.
- [ ] 7 route trong `SIM_MAP`.

## Risk Assessment
- **Lệch toạ độ canvas↔SVG** (rủi ro TB). Mitigation: 1 `tf` dùng chung + test alignment.
- **RAF rò khi dispose** → animation chạy ngầm sau đổi route. Mitigation: shell lưu rafId, dispose `cancelAnimationFrame`; test mount-dispose-mount.
- **SVG chậm trail dày.** Mitigation: trail đẩy xuống canvas (đã phân #11/#15/#17).

## Security Considerations
Không có.

## Next Steps
P4 — 8 sim Ch3, underlay #25 (vết va chạm).
