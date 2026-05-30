---
phase: 8
title: "P2 Empty-Panel Cleanup"
status: pending
priority: P2
effort: "0.5d"
dependencies: [2, 3, 4, 5, 6]
---

# Phase 08: P2 Empty-Panel Cleanup

## Overview
Bỏ khung panel mồ côi: renderer vẽ `P.panel()` nhưng nội dung `P.domMath/domLabel` bị suppress toàn cục bởi cờ `SIM_ALLOW_CANVAS_FORMULA_OVERLAY` (tắt có chủ đích 2026-05-14). KHÔNG bật lại cờ — thông tin đã có ở readout panel phải.

## Requirements
- Bỏ/điều chỉnh các lệnh `P.panel()` không còn nội dung hiển thị (ch3-5-3, ch3-2-2, ch2-2-2, ch2-3-2, ch3-6-3 + quét toàn bộ).
- Không bật `SIM_ALLOW_CANVAS_FORMULA_OVERLAY` (tôn trọng quyết định cleanup; verified changelog L304, journal 260514).
- Sửa nhãn chồng đè (ch3-2-3 "FABFBA", ch2-5-1 "ω×AB v_B", ch1-1-8 "N N").
- Sửa render công thức vỡ do label cụt (ch3-5-1 "m·a_C M", ch3-6-3 "bảotoànp,e", ch2-5-2/5-3 "IÁ").

## Architecture
- Empty-panel guard (Phase 01) liệt kê mọi panel có viền + 0 node con → danh sách cần dọn.
- Với panel chỉ chứa domMath bị suppress: xóa lệnh `P.panel` đó; giữ nếu panel còn chứa barGraph/label canvas hợp lệ (vd ch3-5-4 dùng barGraph — KHÔNG xóa).
- Nhãn ngắn được phép overlay (isShortOverlayLabel) → giữ; chỉ dọn khung trống và nhãn chồng.

## Related Code Files
- Modify: `js/sims/ch3/ch3-theorems-renderers.js`, `ch3-newton-laws-renderers.js`, `ch3-collision-exercises-renderers.js`, `js/sims/ch2/ch2-rotation-gear-renderers.js`, `ch2-rotation-transmission-renderers.js`, `ch2-instant-center-plane-motion-renderers.js`, `js/sims/ch1/ch1-spatial-renderers.js`, `ch1-support-renderers.js`
- Read: `js/sim-route-renderer-primitives.js` (panel, domMath, isShortOverlayLabel:106), `tools/check-overlay-panels.js`
- Evidence: ảnh 49 (ch3-5-3), ch3-2-2 (2 ô rỗng), ch2-2-2/2-3-2 (ô rỗng)

## Implementation Steps (tests-first)
1. Chạy `tools/check-overlay-panels.js` mở rộng cho toàn bộ 52 route → liệt kê panel rỗng thật.
2. Xác nhận empty-panel guard RED.
3. Xóa lệnh `P.panel()` mồ côi; giữ panel có nội dung canvas hợp lệ.
4. Sửa nhãn chồng đè (giãn vị trí/đổi text) và công thức label cụt.
5. Chạy empty-panel guard + visual-quality → GREEN; `node --check`.

## Success Criteria
- [ ] Không còn khung panel có viền mà rỗng nội dung trên 52 route.
- [ ] Không còn nhãn chồng đè / công thức cụt nêu trên.
- [ ] Cờ overlay vẫn tắt (không đảo quyết định cũ).
- [ ] Empty-panel guard GREEN.

## Risk Assessment
- Xóa nhầm panel còn dùng (barGraph) → guard phân biệt "panel + 0 child hợp lệ" vs "panel + barGraph"; kiểm thủ công ch3-5-4 trước khi xóa hàng loạt.
