---
phase: 2
title: "Chương 1 — retrofit 9 sim tĩnh học còn lại"
status: done
priority: P2
effort: "1.5d"
dependencies: [1]
---

# Phase 2: Chương 1 — 9 sim tĩnh học còn lại

## Overview
Áp khuôn pilot cho 9 sim Ch1 còn lại (Ch1 có 10 sim, pilot ch1-1-3 xong ở P1): ch1-1-4, ch1-1-5,
ch1-1-6, ch1-2-3, ch1-1-8, ch1-3-2, ch1-3-6, ch1-5-3, ch1-6-3. Dùng component P0; control
bespoke cho nhóm hình-học.

## Requirements
- Functional: mỗi sim có panel lý thuyết (công thức đề mục) + legend + readout sống + dòng quan sát; control phù hợp ngữ cảnh:
  - **Slider**: ch1-1-4 (mô men: F, d), ch1-1-5 (thu gọn hệ lực), ch1-1-6 (ngẫu lực), ch1-3-2 (lực căng dây), ch1-3-6 (ngàm: vị trí tải), ch1-5-3 (ma sát: góc, μ).
  - **Bespoke**: ch1-1-8 (nút chọn loại gối → FBD), ch1-2-3 (kéo 2 vector đồng quy → hợp lực), ch1-6-3 (kéo đỉnh/bán kính khoét hình).
- Non-functional: thay hex inline bằng `Sim2Palette`; mỗi sim chỉ thêm khai báo, không sửa physics.

## Architecture
Mỗi sim: state 1 nguồn; control ghi vào state → `update()`. Bespoke control vẫn đăng ký cleanup qua shell.

## Related Code Files
- Modify: `js/sim2/sims/ch1/{ch1-1-4,ch1-1-5,ch1-1-6,ch1-2-3,ch1-1-8,ch1-3-2,ch1-3-6,ch1-5-3,ch1-6-3}.js`
- Modify test: `tests/sim2-ch1-mount.spec.js` (mở rộng assert control cho từng route)

## Implementation Steps (TDD)
1. Mở rộng `sim2-ch1-mount.spec.js`: mỗi route có control (slider HOẶC bespoke), panel, legend; dispose sạch. Chạy đỏ.
2. Retrofit từng sim (slider trước, bespoke sau). Sau mỗi 2-3 sim chạy mount spec.
3. `npm run test:sim:mount` xanh toàn Ch1; nhãn không chồng giữ.

## Success Criteria
- [ ] 9 route Ch1 (gồm pilot ch1-1-3) đồng bộ component; bespoke đúng ngữ cảnh.
- [ ] `npm run test:sim:mount` xanh; 0 hex inline còn sót (grep kiểm).
- [ ] dispose sạch mọi route.

## Risk Assessment
- **Bespoke 3 kiểu khác nhau** → mitigation: theo chuẩn chốt ở P1; nếu lệch, ghi nhận để P5 chuẩn hóa.
- **Hồi quy nhãn chồng khi thêm panel** → mitigation: test bounding-box giữ nguyên, chạy mỗi sim.
