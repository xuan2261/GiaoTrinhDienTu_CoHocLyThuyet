---
phase: 2
title: "Chương 1 — 10 sim tĩnh học"
status: pending
priority: P1
effort: "3d"
dependencies: [1]
---

# Phase 2: Chương 1 — 10 mô phỏng tĩnh học (#1–10)

## Overview
Dựng 10 sim Ch1 trên engine P1. Mỗi sim = physics (port từ `statics`) + scene SVG + overlay nhãn/readout
+ drag-handle DOM. Tất cả SVG thuần (không canvas underlay). Mỗi sim có Node physics test + smoke mount.

## Requirements
- Functional: 10 route mount qua `SIM_MAP`, dispose sạch khi đổi route.
- Functional: nhãn KHÔNG chồng (test bounding-box DOM); readout đúng đơn vị (`noUnit` khi giá trị có ký hiệu).
- Functional: mỗi sim minh hoạ điều hình tĩnh không làm được (kéo handle → physics đổi realtime).
- Non-functional: 0 console error; physics khớp dạng đóng đã verify.

## Architecture
| # | Route | Sim | Physics dùng (statics) | Drag handle |
|---|-------|-----|------------------------|-------------|
| 1 | ch1-1-3 | Véc tơ lực: điểm đặt/phương/độ lớn | resolveForceComponents | đầu mũi tên lực |
| 2 | ch1-1-4 | Mô men lực & cánh tay đòn | computeMoment | điểm đặt lực + đường tác dụng |
| 3 | ch1-1-5 | Thu gọn hệ lực phẳng → R + M | reduceToResultant | các lực thành phần |
| 4 | ch1-1-6 | Ngẫu lực & mô men ngẫu | coupleMoment | cặp lực |
| 5 | ch1-2-3 | Hình bình hành lực (2 đồng quy) | resolveForceComponents | 2 véc tơ |
| 6 | ch1-1-8 | Phản lực liên kết + dựng FBD | beamReactions (gộp đổi loại gối) | vị trí tải + chọn loại gối |
| 7 | ch1-3-2 | Lực căng dây (ràng buộc 1 chiều) | beamReactions/tension | điểm treo/góc dây |
| 8 | ch1-3-6 | Phản lực & mô men ngàm (tải đổi vị trí) | beamReactions (cantilever) | vị trí tải |
| 9 | ch1-5-3 | Nón ma sát trên mặt nghiêng | frictionNormal + cone angle | góc nghiêng + lực đẩy |
| 10 | ch1-6-3 | Trọng tâm hình ghép / khoét | centroidComposite + centroidWithHole | kích thước/vị trí mảnh |

**Mẫu chung** (`js/sim2/sims/ch1/<route>.js`): `register(routeId, (container)=>{ const tf=makeTransform(...);
const sim=createSimShell({container, tf}); /* build SVG scene + overlay labels; wire handles → recompute physics → re-render */ return sim })`.

## Related Code Files
- **Create:** `js/sim2/sims/ch1/ch1-1-3.js` … `ch1-6-3.js` (10 file, mỗi file <200 dòng).
- **Modify:** `index.html` (thêm 10 script-tag ch1, sau core/registry).
- **Reference:** `js/sim2/physics/statics.js`, `js/sim2/core/*`.

## TDD — Tests trước (mỗi sim)
1. **WRITE FIRST** `tests/sim2-ch1-physics.test.js` (node:test): 10 block, mỗi block assert physics khớp dạng đóng (vd ch1-1-4 M=F·d·sinθ; ch1-6-3 centroid biết trước; ch1-5-3 cân bằng tại góc tới hạn `tanφ=μ`). RED.
2. **WRITE FIRST** `tests/sim2-ch1-mount.spec.js` (Playwright): for-each 10 route → mount có `<svg>`; **bounding-box mọi `.sim2-label` không giao nhau** (helper `assertNoOverlap`); 0 console error; dispose sạch.
3. Chạy → đỏ. Code từng sim. Chạy lại → xanh.

## Implementation Steps
1. Viết 2 test file trên với 10 case (RED).
2. Code lần lượt ch1-1-3 → ch1-6-3, mỗi sim chạy ngay test physics+mount tương ứng cho tới xanh.
3. ch1-1-8 gộp đổi loại gối: dropdown DOM chọn gối (cố định/di động/ngàm) → đổi `beamReactions` mode.
4. ch1-6-3 (defect cũ ~50% canvas trống): dùng transform fit `worldBox` sát hình → tự căn giữa, không hardcode.
5. Quét key trùng `state`↔`derived()` (gotcha desync) — đặt tên readout khác slider.
6. Chạy toàn bộ Ch1 → xanh.

## Success Criteria
- [ ] `sim2-ch1-physics.test.js` xanh (10/10 khớp dạng đóng).
- [ ] `sim2-ch1-mount.spec.js` xanh: 10/10 mount, 0 error, **nhãn không chồng**.
- [ ] 10 route trong `SIM_MAP`; đổi route dispose sạch (no leak).
- [ ] Mỗi sim kéo handle → readout cập nhật realtime, đơn vị đúng.

## Risk Assessment
- **ch1-6-3 rescale đụng mapping điểm kéo** (defect cũ). Mitigation: handle dùng `tf.toWorld`, rescale chỉ đổi transform — handle tự đúng.
- **Nhãn drag-handle trùng nhãn vector** (defect cũ ch1-1-5 "R" trôi). Mitigation: overlay 1 nguồn nhãn; test no-overlap bắt ngay.
- **Đơn vị "N N"** (gotcha formatter). Mitigation: `noUnit:true` cho readout có ký hiệu sẵn.

## Security Considerations
Không có.

## Next Steps
P3 — 7 sim Ch2, lần đầu bật canvas underlay (#11/#15/#17).
