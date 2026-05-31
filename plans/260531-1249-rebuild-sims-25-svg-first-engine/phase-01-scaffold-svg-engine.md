---
phase: 1
title: "Scaffold engine SVG-first 3 tầng"
status: completed
priority: P1
effort: "1.5d"
dependencies: [0]
---

# Phase 1: Scaffold engine SVG-first (physics kernel + transform + SVG render + overlay + SIM_MAP)

## Overview
Dựng engine mới `js/sim2/`: port physics sang module Node-testable, transform `world→screen`
DÙNG CHUNG, SVG render core, HTML overlay nhãn/readout tuyệt đối, tích hợp lại `SIM_MAP`.
Chứng minh bằng **1 sim "hello"** mount được + test Node xanh.

## Requirements
- Functional: `window.SIM_MAP[pageId] → factory(container) → { dispose }` hoạt động lại.
- Functional: physics port `require()` được trong Node (UMD guard), giữ kết quả số đã verify.
- Functional: transform round-trip `screen→world→screen` sai số < 1e-9.
- Functional: nhãn = HTML overlay, vị trí tính qua transform; resize/zoom không lệch.
- Non-functional: chạy `file://` offline, 0 console error; dispose gỡ sạch listener + DOM.

## Architecture
```
js/sim2/
├── physics/
│   ├── statics.js      ← port js/sim-physics-statics.js  + UMD guard
│   ├── kinematics.js   ← port js/sim-physics-kinematics.js
│   ├── dynamics.js     ← port js/sim-physics-dynamics.js (rk4Step canonical)
│   └── index.js        ← gom export (browser: window.Sim2Physics; node: module.exports)
├── core/
│   ├── transform.js    ← makeTransform({worldBox, screenBox}) → {toScreen(p), toWorld(p), scale}
│   ├── svg-render.js   ← helpers: line+arrowMarker, circle, path, polygon (nhận transform)
│   ├── overlay.js      ← label(html, worldPt, anchor), readoutCard(items) — định vị tuyệt đối
│   ├── canvas-underlay.js ← optional layer, CÙNG transform, vẽ sau SVG
│   └── sim-shell.js    ← factory chung: dựng <svg>+overlay (+canvas), wire pointer, RAF loop, dispose
├── registry.js         ← Sim2Registry.register(routeId, factory); build window.SIM_MAP
└── sims/               ← (P2–P4 đổ vào đây) ch1/ ch2/ ch3/
```
**Transform** là trái tim: scale = min(screenW/worldW, screenH/worldH) giữ tỉ lệ;
flip-y (`screenY = originY - worldY*scale`). MỌI tầng (SVG, overlay, canvas) gọi cùng instance.

**Mount contract**: `index.html` nạp `js/sim2/**` theo thứ tự physics→core→registry→sims;
`loader.js initSimulations()` (dựng lại bản gọn) trỏ `window.SIM_MAP`.

## Related Code Files
- **Create:** `js/sim2/physics/{statics,kinematics,dynamics,index}.js`
- **Create:** `js/sim2/core/{transform,svg-render,overlay,canvas-underlay,sim-shell}.js`
- **Create:** `js/sim2/registry.js`
- **Create:** `js/sim2/sims/ch1/hello-sim.js` (sim demo, route tạm `ch1-1-3` placeholder hoặc `sim2-hello`)
- **Modify:** `index.html` (thêm script-tags `js/sim2/**` đúng thứ tự nạp)
- **Modify:** `js/loader.js` (dựng lại `initSimulations(container,pageId)` gọn: tra `SIM_MAP`, mount, lưu dispose; gọi dispose khi đổi route)
- **Reference (port nguồn):** `js/sim-physics-statics.js` / `-kinematics.js` / `-dynamics.js`

## TDD — Tests trước
1. **WRITE FIRST** `tests/sim2-physics-port.test.js` (node:test): `require('../js/sim2/physics')` → assert **giá trị kỳ vọng đã snapshot** (hằng số verified, vd `dynamics.rk4Step` chu kỳ con lắc; `statics.computeMoment`; `kinematics.gearRatio`). Test phải SỐNG SÓT sau khi P5 xóa physics cũ → KHÔNG live-compare file cũ trong test commit. (Live cross-check vs `js/sim-physics-*.js` qua vm chỉ là bước dev confidence 1 lần trong P1, không commit.) RED trước khi tạo module.
2. **WRITE FIRST** `tests/sim2-transform.test.js` (node:test): `toWorld(toScreen(p)) ≈ p` (<1e-9); scale dương; flip-y đúng (world +y → screen nhỏ hơn).
3. **WRITE FIRST** `tests/sim2-hello-mount.spec.js` (Playwright): mount `sim2-hello` → có `<svg>` + overlay; nhãn là HTML (`getByText` trong DOM, KHÔNG canvas); 0 console error; dispose() gỡ DOM + listener (mount lại không double-bind).
4. Chạy → đỏ. Code engine. Chạy lại → xanh.

## Implementation Steps
1. Viết 3 test trên (RED).
2. **Port physics**: copy 3 file vào `js/sim2/physics/`, thêm cuối mỗi file UMD guard:
   `if (typeof module!=='undefined'&&module.exports){module.exports=API}` đồng thời giữ `window.SimPhysics*`. `index.js` re-export. KHÔNG đổi công thức.
3. `transform.js`: `makeTransform`. `svg-render.js`: primitives nhận `tf` + trả SVG nodes.
4. `overlay.js`: container `position:relative`; `label()` tạo `<div style="position:absolute;left;top;transform:translate(-50%,-50%)">` từ `tf.toScreen`. `readoutCard()` panel HTML + KaTeX (`katex.render`, throwOnError:false).
5. `canvas-underlay.js`: `<canvas>` cùng kích thước, `ctx` vẽ qua `tf`. `sim-shell.js`: lắp `<svg>`+overlay(+canvas), pointer drag → `tf.toWorld`, RAF, `dispose()`.
6. `registry.js`: `register()` + build `window.SIM_MAP[id]=factory`. `hello-sim.js` đăng ký.
7. `index.html` nạp `js/sim2/**`. `loader.js` dựng lại `initSimulations` gọn.
8. Chạy 3 test → xanh.

## Success Criteria
- [ ] `sim2-physics-port.test.js` xanh — giá trị khớp file cũ (verified-sticky giữ nguyên).
- [ ] `sim2-transform.test.js` xanh — round-trip <1e-9, flip-y đúng.
- [ ] `sim2-hello-mount.spec.js` xanh — SVG+HTML overlay mount, 0 error, dispose sạch.
- [ ] `SIM_MAP['sim2-hello']` là factory; mount/dispose 2 lần không rò listener.
- [ ] Engine chạy `file://` (mở `index.html` trực tiếp, không cần server).

## Risk Assessment
- **Port lệch công thức.** Mitigation: snapshot giá trị verified trong test (TDD-1) + dev cross-check 1 lần vs file cũ qua vm trước khi commit.
- **KaTeX trong overlay vỡ ở file://.** Mitigation: dùng KaTeX local-first (index.html đã có fallback); test mount kiểm có node `.katex`.
- **Transform sai dấu flip-y → toàn bộ sim lật.** Mitigation: test round-trip + assert hướng y.
- **dispose rò listener** (defect kinh điển). Mitigation: shell giữ danh sách listener/RAF, test mount-dispose-mount.

## Security Considerations
Không có. Engine thuần client, offline.

## Next Steps
P2 đổ 10 sim Ch1 vào `js/sim2/sims/ch1/` dùng shell+transform+overlay+physics đã có.
