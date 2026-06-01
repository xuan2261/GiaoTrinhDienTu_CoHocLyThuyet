---
phase: 1
title: "Pilot 2 sim + cổng DUYỆT look&feel"
status: done
priority: P1
effort: "1d"
dependencies: [0]
---

# Phase 1: Pilot — ch1-1-3 (tĩnh) + ch3-6-2 (động) + DUYỆT

## Overview
Retrofit 2 sim đại diện bằng component P0 để chốt look&feel. Cổng duyệt: user xem 2 sim thật
chạy `file://` trước khi nhân ra 23 sim còn lại. Phủ hết mọi component mới.

## Requirements
- Functional:
  - **ch1-1-3** (tĩnh, drag): thêm slider F (10–120 N), α (0–90°) + panel lý thuyết (công thức `F_x=F\cosα`, `F_y=F\sinα`, `|F|`) + legend (F teal, Fₓ rose, Fᵧ blue) + dòng quan sát. Drag handle VÀ slider đồng bộ 2 chiều (kéo → slider cập nhật; slider → vector cập nhật).
  - **ch3-6-2** (động, canvas): nút ▶/⏸/↺ + slider e (0–1), m₁ (1–5 kg), m₂ (1–5 kg) + panel (công thức bảo toàn động lượng `m_1v_1+m_2v_2=const`, hệ số phục hồi `e=...`) + readout sống (p tổng, T tổng, T mất) + legend (m₁ rose, m₂ blue). Reset đưa về trạng thái đầu; pause dừng RAF nhưng giữ frame.
- Non-functional: dùng `Sim2Palette` (hết hex inline ở 2 sim này); giá trị mặc định DEMO rõ khái niệm (e=0.7 cho thấy mất năng lượng vừa phải).

## Architecture
- ch1-1-3: nguồn trạng thái `{F, alphaDeg}` 1 chỗ; cả drag-handle lẫn slider ghi vào nó rồi `update()`. Tránh 2 nguồn lệch.
- ch3-6-2: slider e/m₁/m₂ ghi vào tham số mô phỏng; thay đổi giữa chừng → áp dụng ở lần va chạm kế (hoặc reset). Playback điều khiển `shell.start/stop`.

## Related Code Files
- Modify: `js/sim2/sims/ch1/ch1-1-3.js`, `js/sim2/sims/ch3/ch3-6-2.js`
- Modify test: `tests/sim2-ch1-mount.spec.js`, `tests/sim2-ch3-mount.spec.js` (thêm assert control + dispose listener slider)
- Read context: `js/sim2/core/{controls,panel,palette,sim-shell}.js` (từ P0)

## Implementation Steps (TDD)
1. **Test trước**: mở rộng mount spec cho 2 route pilot:
   - Có `.sim2-controls` với đúng số slider + nút playback.
   - Kéo slider e (ch3-6-2) → readout đổi; bấm ⏸ → RAF dừng (frame count đứng yên sau timeout); ↺ → về trạng thái đầu.
   - ch1-1-3: set slider α → vector/Fₓ/Fᵧ readout đổi đúng dấu; kéo handle → slider α phản ánh lại.
   - `dispose()` → 0 `.sim2-root`, 0 `.sim2-controls`, 0 `.sim2-label`; bắn input event sau dispose không nổ console error.
   - Chạy đỏ trước (sim chưa retrofit).
2. Retrofit `ch1-1-3` → test ch1 xanh.
3. Retrofit `ch3-6-2` → test ch3 xanh.
4. `npm run test:sim:release` (gate tổng) xanh.
5. **DUYỆT**: chạy `python -m http.server 8000`, mở 2 route, chụp/đưa user xem. Chốt: panel mở/thu gọn, palette, mật độ control, dòng quan sát. Ghi quyết định vào plan.md "Unresolved questions".

## Success Criteria
- [ ] 2 sim pilot: control + panel + legend + readout sống hoạt động; drag↔slider đồng bộ (ch1-1-3); playback đúng (ch3-6-2).
- [ ] `npm run test:sim:release` xanh.
- [ ] `dispose()` sạch tuyệt đối (kể cả slider listener) — assert pass.
- [ ] **User duyệt look&feel** → mở khóa P2-P4. Quyết định panel default + chuẩn bespoke ghi lại.

## Risk Assessment
- **drag↔slider vòng lặp cập nhật** (kéo → set slider → onInput → set vector → …) → mitigation: slider set bằng property (không bắn `input` event) khi nguồn là drag; hoặc cờ `suppress`.
- **Pause không thực sự dừng physics** → mitigation: playback gọi `shell.stop()`; test đếm frame đứng yên.
- **[RED-TEAM] start-paused phá test canvas đã verify**: `tests/sim2-ch3-mount.spec.js:59-69` chờ 400ms rồi assert canvas ch3-6-2 có pixel trail — giả định AUTOPLAY. Nếu đổi sang start-paused, canvas rỗng → test verified hóa đỏ. **Mitigation (bắt buộc trong P1)**: test phải bấm ▶ (click nút play) TRƯỚC `waitForTimeout` rồi mới assert trail. Không nới lỏng assertion (giữ kiểm tra trail thật).
- **User không ưng look** → đây CHÍNH là mục đích pilot; rẻ hơn sửa 25. Sửa P0 component rồi re-pilot.
