# Phase 00 — Research: mapping control↔physics↔readout + sign oracle

**Plan:** [plan.md](plan.md) · **TDD:** không (research) · **Status:** ✅ done · **Blocked by:** —

## Context Links
- Brainstorm summary §3 (probe A/B), §8 Q2
- `js/sim2/physics/{statics,kinematics,dynamics,index}.js` — hàm verify
- `js/sim2/sim2-route-manifest.js` — 25 route
- `js/sim3/sims/*-3d.js` + `js/sim3/core/mode-toggle.js` — 10 route 3D

## Overview
**Priority:** cao nhất (mở khóa P1–P3). Lập **bảng mapping/route** là input cho toàn bộ probe. Không viết code sản phẩm; output = 1 file dữ liệu + 1 report.

## Key Insights
- Sim3 dùng lại control Sim2; đo 3D qua `__SIM3_DEBUG__[id]`, không phải DOM readout.
- Sign oracle B = finite-difference hàm physics: `sign(f(x+dx) − f(x))`. Physics IS oracle → không đoán tay.
- 5 route bespoke-drag (ch1-1-5, ch1-2-3, ch1-6-3, ch2-1-3, ch2-5-2): input mouse-drag.

## Requirements
**Functional:** mỗi route trong 35 có entry: danh sách control (loại: slider id / drag-handle / playback), input physics tương ứng, readout-key đo được (DOM selector hoặc `__SIM3_DEBUG__` path), hàm physics + dấu kỳ vọng `d(readout)/d(control)`.
**Non-functional:** entry đủ để P2/P3 chạy thuần dữ liệu, KHÔNG đọc lại source/route.

## Architecture
Output `plans/.../research/sim-probe-route-map.json`:
```json
{ "ch1-1-4": {
    "engine": "sim2", "controls": [{ "kind":"slider", "id":"d", "physInput":"armLength" }],
    "readouts": [{ "key":"M", "selector":".sim2-readout-value[data-...]", "physFn":"moment", "expectSign":"+" }],
    "bMode": "monotonic", "notes": "..." }
}
```
`bMode ∈ {monotonic, local-monotonic(range), scene-delta, a-only}`. Route không map B sạch → `a-only` + lý do (flag, không drop).

## Related Code Files
**Đọc:** toàn bộ `js/sim2/physics/*`, `js/sim2/sims/**`, `js/sim3/sims/*-3d.js`, `js/sim2/core/{controls,panel,overlay}.js`.
**Tạo:** `research/sim-probe-route-map.json`, `research/sim-probe-route-map-report.md`.

## Implementation Steps
1. Dùng researcher agent đọc từng chương sims/ → liệt kê control thực tế (slider id, drag-handle class) per route.
2. Map control→input của hàm physics gọi trong sim.
3. Map readout-key → DOM selector (Sim2) hoặc `__SIM3_DEBUG__` path (Sim3).
4. Tính dấu kỳ vọng bằng finite-difference từ hàm physics (chạy node nếu cần).
5. Phân loại `bMode`/route; route không đơn điệu toàn cục → chọn `local-monotonic` + khoảng an toàn.
6. Ghi JSON + report (route a-only + lý do liệt kê rõ).

## Todo List
- [ ] Enumerate control 35 route
- [ ] Map physInput + physFn
- [ ] Map readout selector/path (Sim2 + Sim3)
- [ ] Tính expectSign finite-difference
- [ ] Phân loại bMode + flag a-only
- [ ] Viết JSON + report

## Success Criteria
35/35 route có entry hợp lệ; mỗi entry hoặc có `expectSign` hoặc `bMode:a-only`+lý do. JSON parse được, P2/P3 không cần đọc source.

## Risk Assessment
- Route hình học thuần (FBD) không có readout số → `scene-delta`/`a-only`. Đánh dấu, không ép B giả.
- Sim3 `__SIM3_DEBUG__` chỉ expose subset state → confirm field có đủ readout cần.

## Security Considerations
Không. Đọc-only, dev-only.

## Next Steps
Mở khóa P1 (scaffold) + P3 (cần sign oracle).
