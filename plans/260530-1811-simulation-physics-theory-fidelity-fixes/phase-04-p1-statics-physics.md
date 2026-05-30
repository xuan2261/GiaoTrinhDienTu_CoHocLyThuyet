---
phase: 4
title: "P1 Statics Physics (ch1-1-5, ch1-4-2, ch1-3-3, ch1-5-1)"
status: pending
priority: P1
effort: "1.5d"
dependencies: [1]
---

# Phase 04: P1 Statics Physics (ch1-1-5, ch1-4-2, ch1-3-3, ch1-5-1)

## Overview
Sửa 4 route Tĩnh học physics sai: thu gọn hệ lực giả, mô men 3D giả, phản lực bản lề cố định, ma sát vượt ngưỡng. Tất cả do RC1 (bỏ qua module toán đúng).

## Requirements
- ch1-1-5: F1,F2,F3 là véc tơ thật điều khiển được; R=ΣFi, M_O=Σ(ri×Fi).
- ch1-4-2: mô men = r×F·e (chiếu lên trục đơn vị); readout M in N·m (không độ).
- ch1-3-3: Ax,Ay dẫn từ ΣF=0 của tải P; renderer ẩn thành phần bị selector zero.
- ch1-5-1: Fms = min(applied, μN) (clamp như ch1-5-2); khi vượt → trạng thái "trượt".
- Đối chiếu: `muc-I-5.html`, `muc-IV-2.html`, `muc-III-3.html`, `muc-V-1.html`.

## Architecture
- Thay heuristic trong `ch1-force-law-behaviors.js` (ch1-1-5), `ch1-support-spatial-behaviors.js` (ch1-4-2, ch1-3-3), `ch1-friction-centroid-solver-behaviors.js` (ch1-5-1) bằng gọi `SimPhysicsStatics` (reduceToResultant, spatialMoment, checkEquilibrium, friction cone).
- Renderer đọc model, vẽ đúng số: bỏ mũi tên hardcode (ch1-1-5 F1-3, ch1-3-3 luôn-vẽ-cả-Ax-Ay).

## Related Code Files
- Modify: `js/sims/ch1/ch1-force-law-behaviors.js`, `ch1-force-law-renderers.js`, `ch1-support-spatial-behaviors.js`, `ch1-spatial-renderers.js`, `ch1-support-renderers.js`, `ch1-friction-centroid-solver-behaviors.js`, `ch1-friction-renderers.js`
- Read: `js/sim-physics-statics.js`, theory HTML nêu trên
- Evidence: renderers:94/behaviors:122 (1-1-5); behaviors:25 (1-4-2); behaviors:94-95/renderers:105-106 (1-3-3); behaviors:59 (1-5-1)

## Implementation Steps (tests-first)
1. Xác nhận RED Phase 01 cho 4 route.
2. ch1-5-1: clamp Fms=min(applied,μN); badge trượt khi vượt. (rẻ nhất, làm trước)
3. ch1-3-3: Ax,Ay từ ΣF=0; renderer tôn trọng selector Rx/Ry.
4. ch1-4-2: spatialMoment·e; readout N·m; bỏ "°".
5. ch1-1-5: 3 lực live; R,M_O = ΣFi/Σ(ri×Fi); renderer vẽ R từ tổng thật.
6. Chạy invariants + theory-fidelity → GREEN; `node --check` mỗi file.

## Success Criteria
- [ ] ch1-5-1: Fms ≤ μN luôn đúng; vượt → "trượt".
- [ ] ch1-3-3: phản lực đổi theo tải/góc; selector ẩn đúng thành phần.
- [ ] ch1-4-2: M in N·m từ r×F·e.
- [ ] ch1-1-5: R,M_O từ tổng 3 lực thật.
- [ ] 4 test GREEN.

## Risk Assessment
- ch1-1-5 cần thêm điều khiển cho 3 lực → kiểm scene control schema; nếu phức tạp, giữ 3 lực preset điều chỉnh độ lớn (vẫn là tổng thật) để KISS.
- Nhiều file 220 dòng → tách helper khi cần.
