---
phase: 4
title: "Chương 3 — 8 sim động lực học"
status: completed
priority: P1
effort: "3d"
dependencies: [3]
---

# Phase 4: Chương 3 — 8 mô phỏng động lực học (#18–25)

## Overview
Dựng 8 sim Ch3 trên engine P1. Dùng nhiều `rk4Step`/`integrateMotion` (ODE) và `resolveCollision2D`.
Bật canvas underlay cho #25 (vết va chạm). Còn lại SVG thuần.

## Requirements
- Functional: 8 route mount qua `SIM_MAP`, dispose sạch.
- Functional: tích phân số ổn định (RK4); bảo toàn năng lượng/động lượng/mô men trong sai số test.
- Functional: nhãn DOM không chồng; va chạm với e đúng chuẩn (port, không dùng game-physics).
- Non-functional: 0 console error; #21 ODE chạy mượt; #25 canvas↔SVG khớp.

## Architecture
| # | Route | Sim | Physics (dynamics) | Underlay |
|---|-------|-----|--------------------|----------|
| 18 | ch3-2-2 | Định luật II Newton F=m·a | accelerationFromForce + integrateMotion | SVG (graph DOM) |
| 19 | ch3-2-3 | Định luật III: lực & phản lực | force pair | SVG |
| 20 | ch3-1-3 | HQC quán tính vs phi quán tính | inertial force frame | SVG |
| 21 | ch3-3-1 | Giải ODE chuyển động | rk4Step/integrateMotion | SVG (quỹ đạo+graph) |
| 22 | ch3-5-2 | Định lý động lượng & xung lượng | impulse = Δp | SVG |
| 23 | ch3-5-3 | Bảo toàn mô men động lượng | angularMomentum (orbit) | SVG |
| 24 | ch3-5-4 | Định lý động năng (công–năng) | kineticEnergy/workDone | SVG |
| 25 | ch3-6-2 | Va chạm với hệ số phục hồi e | resolveCollision2D | **canvas** (vết) |

## Related Code Files
- **Create:** `js/sim2/sims/ch3/ch3-2-2.js` … `ch3-6-2.js` (8 file).
- **Modify:** `index.html` (thêm 8 script-tag ch3).
- **Reference:** `js/sim2/physics/dynamics.js` (rk4Step, integrateMotion, resolveCollision2D).

## TDD — Tests trước
1. **WRITE FIRST** `tests/sim2-ch3-physics.test.js` (node:test): ch3-2-2 a=F/m; ch3-3-1 RK4 con lắc/lò xo so chu kỳ giải tích (sai số <1%); ch3-5-2 J=Δp; ch3-5-3 L=const khi không mô men ngoài; ch3-5-4 W=ΔT; ch3-6-2 va chạm: bảo toàn p, e=1→bảo toàn động năng, e=0→dính, 0<e<1→mất đúng phần. RED.
2. **WRITE FIRST** `tests/sim2-ch3-mount.spec.js` (Playwright): 8 route mount; nhãn DOM không chồng (gotcha cũ "m1 1"/"m2 2", "vật vật"); ch3-2-2 graph KHÔNG rỗng sau Chạy (defect cũ); #25 canvas hasContent + canvas↔SVG khớp; 0 error; dispose hủy RAF.
3. Chạy → đỏ. Code. Chạy lại → xanh.

## Implementation Steps
1. Viết 2 test file (RED).
2. Code #19/#20/#22/#23/#24 (đại số/SVG) trước.
3. Code #18 + #21 (ODE realtime): integrate qua `dynamics.integrateMotion`; #18 graph DOM autoplay (chốt UX: autoplay như ch3-3-1 cũ, có placeholder trước khi chạy).
4. Code #25 va chạm: `resolveCollision2D` (port, e đúng chuẩn — KHÔNG matter.js); canvas vết; nhãn khối "m₁"/"m₂" 1 nguồn (né đúp).
5. Test invariants: ch3-5-3 L bảo toàn, ch3-6-2 p bảo toàn + e đúng.
6. Chạy toàn bộ Ch3 → xanh.

## Success Criteria
- [ ] `sim2-ch3-physics.test.js` xanh (8/8 invariants: F=ma, RK4 chu kỳ, J=Δp, L=const, W=ΔT, va chạm e).
- [ ] `sim2-ch3-mount.spec.js` xanh: 8/8 mount, nhãn không chồng, ch3-2-2 graph có dữ liệu, #25 canvas↔SVG khớp, dispose hủy RAF.
- [ ] 8 route trong `SIM_MAP`.

## Risk Assessment
- **RK4 không ổn định ở dt lớn.** Mitigation: dùng `rk4Step` đã port (không phụ thuộc 1/60s như matter.js); test so chu kỳ giải tích.
- **Va chạm e sai chuẩn nếu lỡ dùng lib.** Mitigation: bắt buộc `resolveCollision2D` port; test e=1 bảo toàn động năng (matter.js #13 fail chính chỗ này).
- **Nhãn đúp khối/lực** (defect cũ). Mitigation: overlay 1 nguồn + test no-overlap.

## Security Considerations
Không có.

## Next Steps
P5 — dựng test harness 25 route chính thức + cập nhật docs + xóa physics cũ.
