---
phase: 7
title: "P2 Units & SI Scale Sweep"
status: pending
priority: P2
effort: "1d"
dependencies: [2, 3, 4, 5, 6]
---

# Phase 07: P2 Units & SI Scale Sweep

## Overview
Quét đơn vị toàn bộ (RC2): mức A sửa thứ nguyên sai, mức B gắn pxPerMeter để readout tọa độ ra SI thật. Chạy sau các phase physics để tránh đụng cùng renderer.

## Requirements
- Mức A (thứ nguyên): bỏ "°" trên mô men & tan α; "m"→"m²" cho diện tích; ω₀ "rad/s²"→"rad/s"; "Mô men ngàm: 1m"→N·m.
- Mức B (scale SI): route CÓ mốc độ dài vật lý thật gắn `pxPerMeter` mỗi scene → readout ra m/(m/s) thật: ch2-5-1, ch2-1-1, ch1-6-2, ch1-6-3.
- Route KHÔNG có mốc độ dài thật (tọa độ pixel thuần): **BỎ nhãn "m"/"m/s" thay vì bịa scale SI** (quyết định user): ch2-5-2 (IC_x/IC_y), ch3-5-1 (x_C). Hiển thị tọa độ không đơn vị hoặc nhãn "vị trí (px)".
- LƯU Ý: ch1-4-1 KHÔNG thuộc phase này — vấn đề của nó là hợp lực 3D + nhãn N, đã xử ở Phase 02 (tránh mâu thuẫn 02↔07).
- Cảnh báo scale 2 nguồn: `beam.pxPerM=100` (statics support) vs `pxPerMeter=8` hardcode (`ch3-newton-laws-renderers.js:55`) — thống nhất hằng mỗi domain, đừng trộn.
- Mọi readout đại lượng vật lý đúng đơn vị; pass unit-label guard (Phase 01).

## Architecture
- Tái dùng `beam.pxPerM` đã có trong support scenes (`ch1-support-spatial-behaviors.js:74,129`) làm mẫu; chuẩn hóa hằng `pxPerMeter` ở scene config từng route.
- Sửa nhãn đơn vị ở scene readout config (label/unit fields), không sửa công thức.

## Related Code Files
- Modify: scene config files `js/sims/ch1/*-scenes.js`, `js/sims/ch2/ch2-kinematics-scenes.js`, `js/sims/ch3/ch3-dynamics-all-18-scenes.js`; readout format `js/sim-readout-format.js` nếu cần helper chung
- Read: `js/sim-scene-templates.js`, các renderer liên quan
- Evidence: ch1-5-3 "tan°", ch1-4-2 "MO°", ch1-6-3 "S lỗ m", ch2-2-2 "ω₀ rad/s²", ch1-3-6 "1m"

## Implementation Steps (tests-first)
1. Xác nhận unit-label guard RED cho danh sách route trên.
2. Mức A: sửa nhãn thứ nguyên sai (rẻ, làm trước, sửa scene config).
3. Mức B: với route CÓ mốc (ch2-5-1, ch2-1-1, ch1-6-2, ch1-6-3) định nghĩa pxPerMeter; quy đổi readout sang SI. Với route KHÔNG mốc (ch2-5-2, ch3-5-1): bỏ nhãn "m" (không bịa scale).
4. Chạy unit-label guard + theory-fidelity → GREEN; `node --check`.

## Success Criteria
- [ ] Không còn "°" trên mô men/tan; diện tích "m²"; ω₀ "rad/s"; mô men ngàm "N·m".
- [ ] Route có mốc: tọa độ/vận tốc ra SI hợp lý. Route không mốc (ch2-5-2, ch3-5-1): bỏ nhãn "m", không giá trị SI bịa.
- [ ] Unit-label guard toàn bộ GREEN; không false-positive trên `m/s`.

## Risk Assessment
- Chọn pxPerMeter sai làm giá trị SI phi lý → với mỗi route có-mốc, ĐỌC `chapters/ch*/muc-*.html` (và DOCX nếu cần) tìm giá trị bài toán mẫu (chiều dài thanh, ω, khối lượng, diện tích) rồi calibrate pxPerMeter để readout KHỚP số liệu giáo trình (quyết định user). Kiểm 1 giá trị tham chiếu thủ công mỗi route.
- Phase này đụng nhiều renderer đã sửa ở 02-06 → chạy sau, re-run test các route đó để không hồi quy. Baseline drift refresh gom ở Phase 10.
- ch1-4-1 đã loại khỏi phase này (xử ở Phase 02) — không nhặt lại.
