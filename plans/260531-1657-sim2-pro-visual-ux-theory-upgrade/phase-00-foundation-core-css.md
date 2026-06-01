---
phase: 0
title: "Foundation: core components + CSS token"
status: done
priority: P1
effort: "1.5d"
dependencies: []
---

# Phase 0: Foundation — core components + CSS token

## Overview
Dựng hạ tầng UI dùng chung cho 25 sim: token màu, module controls (slider + play/pause/reset),
module panel lý thuyết (KaTeX + readout sống + legend + quan sát), mở rộng `sim-shell` để compose
4 vùng. KHÔNG đụng physics, KHÔNG sửa sim nào ở phase này.

## Requirements
- Functional:
  - `js/sim2/core/palette.js` (`Sim2Palette`): hằng màu UMD (browser `window.Sim2Palette` + Node export), khớp token CSS.
  - `js/sim2/core/controls.js` (`Sim2Controls`): tạo control bar; API `createControls(host, { sliders:[{id,label,min,max,step,value,unit,onInput}], playback:{playing,onPlay,onPause,onStep,onReset} })` → trả `{ root, setValue(id,v), setPlaying(bool), dispose }`; mỗi slider kèm `<output>` value+đơn vị (cập nhật `input` realtime); playback = nút ▶/⏸ + ⏭ step + ↺ reset; **mặc định `playing:false` (start paused)**; mọi listener tự đẩy vào cleanup.
  - `js/sim2/core/panel.js` (`Sim2Panel`): tạo theory panel; API `createPanel(host, { formulas:[latex], legend:[{color,label}], observe:string })` → trả `{ root, setReadout(rows), dispose }`; KaTeX guard (`window.katex` vắng → text fallback).
  - `sim-shell.js`: `createSimShell` nhận thêm `cfg.layout` (mặc định giữ behavior cũ nếu không khai báo panel/controls); thêm helper `shell.addControls(opts)`, `shell.setTheory(opts)`; tính lại `screenBox` khi panel đặt cạnh (viewport co lại), gọi `overlay.reflow()` sau layout.
- Non-functional: 0 dependency mới; mỗi file <200 dòng; `dispose()` gỡ sạch (kể cả listener slider).

## Architecture
- Control bar + panel là DOM riêng, đặt NGOÀI `sim2-root` (vùng vẽ) → `pointer-events` slider không chạm drag SVG.
- Token màu: CSS `:root { --sim-c-force, --sim-c-x, ... }` + `Sim2Palette` JS mirror (1 nguồn ý nghĩa, 2 mặt dùng: CSS class cho DOM, JS hằng cho SVG stroke).
- Shell layout: khi `clientWidth ≥ ~640` → panel cạnh phải (viewport co); else stack dọc (panel dưới viewport, control bar cuối). worldBox GIỮ NGUYÊN, chỉ screenBox đổi.

## Related Code Files
- Create: `js/sim2/core/palette.js`, `js/sim2/core/controls.js`, `js/sim2/core/panel.js`
- Create test: `tests/sim2-ui-components.spec.js` (Playwright, dùng fixture sim2-ch1.html)
- Modify: `js/sim2/core/sim-shell.js`, `css/style.css` (token + `.sim2-controls/.sim2-theory/.sim2-legend/.sim2-observe` + affordance), `index.html` (thêm `<script>` controls/panel/palette trước sim-shell)
- Modify: `tests/fixtures/sim2-ch1.html` (nạp 3 script core mới) nếu fixture tự liệt kê script

## Implementation Steps (TDD — test trước)
1. **Test trước**: viết `tests/sim2-ui-components.spec.js`:
   - `Sim2Controls`: render đúng số slider + nút; kéo slider → `onInput(value)` gọi với số đúng; ▶/⏸ toggle gọi `onPlay/onPause`; ↺ gọi `onReset`; `dispose()` → 0 node + listener gỡ (đếm qua remove rồi thử bắn event không nổ).
   - `Sim2Panel`: render formula (có/không KaTeX đều ra text); `setReadout(rows)` cập nhật giá trị; legend chips đúng màu; `dispose()` sạch.
   - `Sim2Palette`: các khóa bắt buộc tồn tại (force,x,y,v,a,moment,coriolis,reaction,handle,axis,grid).
   - Chạy đỏ (chưa có module) → xác nhận test thật.
2. Viết `palette.js` → test palette xanh.
3. Viết `controls.js` (native `<input type=range>` + nút) → test controls xanh.
4. Viết `panel.js` (KaTeX guard, tabular-nums cho readout) → test panel xanh.
5. Mở rộng `sim-shell.js`: helper `addControls/setTheory`, layout responsive, recompute screenBox, reflow. Giữ nhánh "không khai báo panel/controls = behavior cũ" để 23 sim chưa retrofit vẫn mount nguyên trạng.
6. CSS token + class + affordance (`.sim2-handle:hover` halo, `cursor:grab`).
7. Cập nhật `index.html` + fixture nạp script mới.
8. Chạy `npm run test:sim:mount` (toàn bộ) → KHÔNG hồi quy (23 sim cũ vẫn mount/dispose sạch vì nhánh behavior cũ giữ nguyên).

## Success Criteria
- [ ] `tests/sim2-ui-components.spec.js` xanh (controls + panel + palette + dispose sạch).
- [ ] `npm run test:sim:mount` xanh — 25 sim cũ KHÔNG hồi quy.
- [ ] `npm run test:sim:physics` xanh (transform round-trip không đổi).
- [ ] 3 file core <200 dòng; 0 dependency mới; chạy `file://`.

## Risk Assessment
- **screenBox recompute lệch nhãn** → mitigation: gọi `overlay.reflow()` sau set layout; test transform round-trip + nhãn-không-chồng bắt được.
- **Nhánh layout mới phá behavior cũ** → mitigation: default = behavior cũ khi sim không khai báo panel/controls; chạy full mount suite.
- **Listener slider rò sau dispose** → mitigation: assert trong test ui-components (đếm + bắn event sau dispose không nổ).
