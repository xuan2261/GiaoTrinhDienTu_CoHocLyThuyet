# Phase 03 — Probe B: dấu đơn điệu khớp finite-difference toàn 35 route

**Plan:** [plan.md](plan.md) · **TDD:** ✅ · **Status:** ✅ done · **Blocked by:** P0, P2

## Context Links
- P0 `research/sim-probe-route-map.json` (field `expectSign`, `bMode`, `physFn`)
- P2 cơ chế drive control + đo delta

## Overview
**Priority:** cao. Chứng minh binding nối **đúng biến**: dấu `d(readout)/d(control)` khớp dấu finite-difference của hàm physics đã verify. Bắt nối nhầm biến (A che không hết).

## Key Insights
- **Oracle = physics port**, không đoán tay: `expectSign = sign(physFn(x+dx) − physFn(x))` tính ở P0.
- Probe đo delta thực rồi so dấu: `sign(after − before) === expectSign`.
- `bMode:a-only` route (FBD/hình học không readout số) → bỏ B, ghi `bSkipped + reason` (KHÔNG drop âm thầm — user chốt B cho 35, route không khả thi phải hiện trong report).
- `bMode:local-monotonic` → drive trong khoảng an toàn P0 chỉ định (tránh cực trị).

## Requirements
**Functional:** mỗi route có readout B-able: drive control 2 mức (low→high trong range an toàn) → đo dấu delta thực → so `expectSign`. Ghi `{route, readoutKey, expectSign, observedSign, match}`.
**Non-functional:** dùng lại drive của P2, chỉ thêm tầng so dấu — DRY.

## Architecture
`probeB` field/route. So dấu qua `signOf(delta)` (P1 helper). Mismatch → flag high. `a-only`/`scene-delta` route → `match:null, bSkipped:reason`.

## Related Code Files
**Sửa:** `probe-runner.spec.js` (thêm B pass), `probe-delta.js` (`compareSign`).
**Tạo:** `tests/sim-probe-b-sign.test.js`.
**Đọc:** route-map (expectSign).

## Implementation Steps
1. **TDD red:** node test `compareSign(observed, expect)` (+/−/0/null) → fail.
2. **Green:** thêm compareSign, pass.
3. Runner: với route `bMode:monotonic|local-monotonic`, drive low→high (range P0) → đo dấu → so.
4. `a-only`/`scene-delta` → ghi `bSkipped` + reason, KHÔNG ép.
5. Emit `probeB`. Mismatch → high; skip → low+reason.
6. Verify release xanh.

## Todo List
- [ ] Node test compareSign (red→green)
- [ ] Runner B pass monotonic
- [ ] local-monotonic range handling
- [ ] a-only/scene-delta skip + reason
- [ ] Emit probeB JSON
- [ ] release xanh

## Success Criteria
Mọi route `bMode≠a-only` có `observedSign` + `match`; mismatch flag đúng (verify bằng 1 route cố ý đảo dấu). Route a-only liệt kê `bSkipped`+lý do trong JSON → vào report.

## Risk Assessment
- **Phi đơn điệu toàn cục** (cực trị): drive vượt đỉnh → dấu lật → false mismatch. Mitigate: P0 chỉ định range cục bộ; nếu vẫn rủi ro → giảm dx.
- expectSign P0 sai → B sai theo. Cross-check: 2-3 route tính tay đối chiếu finite-difference.
- Sim3 readout subset → readout cần đo không có trong `__SIM3_DEBUG__` → `bSkipped:sim3-no-readout`.

## Security Considerations
Không.

## Next Steps
P5 gom probeA+probeB vào trục 3 triage.
