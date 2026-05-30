---
phase: 3
title: "P0 Instant-Center Geometry (ch2-5-2)"
status: pending
priority: P1
effort: "0.5d"
dependencies: [1]
---

# Phase 03: P0 Instant-Center Geometry (ch2-5-2)

## Overview
Tâm vận tốc tức thời (IC) hiện là chấm người dùng kéo tự do, KHÔNG suy từ hình học cơ cấu — dạy sai bản chất mục V-2. Nối helper `locateInstantCenter` (đã có sẵn, đang dead).

## Requirements
- IC phải được TÍNH từ hình học/vận tốc cơ cấu (giao của các pháp tuyến vận tốc), không phải input kéo tự do.
- vB ⟂ (B−IC) là hệ quả của IC đúng, không phải dựng ép.
- **GIỮ static snapshot (quyết định user): IC hiển thị tĩnh, KHÔNG handle kéo, KHÔNG tick/animation.** Bỏ hoàn toàn khả năng kéo IC; không thêm kéo cơ cấu realtime.
- Đối chiếu: `chapters/ch2/muc-V-2.html`.

## Architecture
- Gọi `locateInstantCenter(a, b, va, vb)` tại `js/sim-physics-kinematics.js:300` (VERIFIED: tồn tại, chữ ký đúng a/b={x,y}, va/vb={vx,vy}, export L392, hiện dead code không call site nào).
- **BẮT BUỘC tính IC trong `derived()` (chạy 1 lần khi render, snapshot), KHÔNG thêm tick/animation.** ch2-5-2 là `static:true` (ch2-kinematics-scenes.js:53), khóa bởi `tests/phase-09-static-scene-flag.test.js` + canvas-evolution baseline window [1,2] (không có knownDefect cushion). Thêm tick để recompute IC → vỡ cả unit test static-flag LẪN evolution baseline (trong release gate). No-play spec là ch3-only nên KHÔNG bắt được lỗi này → phải tự kỷ luật.
- Trong `derived` của ch2-5-2: bỏ nhánh `icX = isFinite(state.icX) ? state.icX : primary.x`; thay bằng IC tính từ 2 điểm thanh + vận tốc (1 lần).
- Renderer dùng `perpendicularResidual` đã có (renderers:87-96) làm self-check vẽ.

## Related Code Files
- Modify: `js/sims/ch2/ch2-kinematics-behaviors-b.js` (onTick ch2-5-2, ~126-136), `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js`
- Read: `js/sim-physics-kinematics.js` (locateInstantCenter:300), `chapters/ch2/muc-V-2.html`
- Evidence: behaviors-b.js:126-136; renderers:53-99

## Implementation Steps (tests-first)
1. Xác nhận RED: test assert IC nằm trên giao 2 pháp tuyến vận tốc (perpendicularResidual≈0) — hiện FAIL vì IC tự do.
2. Verify chữ ký `locateInstantCenter` trong phys-kinematics.js:300.
3. Thay IC kéo-tự-do bằng IC tính từ cơ cấu (trong `derived`, 1 lần); BỎ handle kéo IC hoàn toàn (giữ static, không kéo cơ cấu realtime).
4. Renderer: vẽ IC ở vị trí tính; dùng perpendicularResidual làm assertion runtime.
5. Sửa nhãn "I(270,245) m" → BỎ đơn vị "m" (tọa độ pixel không có mốc thật; phối hợp Phase 07).
6. Chạy invariants → GREEN; `node --check`.

## Success Criteria
- [ ] IC = giao điểm pháp tuyến vận tốc, perpendicularResidual < tol (1e-6).
- [ ] Không còn handle kéo IC; giữ static (không thêm tick/play).
- [ ] Test instant-center GREEN; static-flag test + evolution baseline vẫn PASS.

## Risk Assessment
- ch2-5-2 `static:true` → IC PHẢI tính trong derived (snapshot), tuyệt đối không thêm tick (sẽ vỡ static-flag test + evolution baseline). Đây là rủi ro cao nhất của phase.
- `locateInstantCenter` cần va,vb không song song → guard trường hợp suy biến (IC ở vô cùng → tịnh tiến thuần).
- Nhãn "I(270,245) m": tọa độ pixel KHÔNG có mốc độ dài thật → BỎ đơn vị "m" (theo quyết định user), không bịa scale SI; phối hợp Phase 07.
