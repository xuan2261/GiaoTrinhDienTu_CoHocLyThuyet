---
phase: 3
title: "ch3-1-3 framing"
status: pending
priority: P1
effort: "1.5h"
dependencies: []
---

# Phase 3: ch3-1-3 framing (CORE — đã sửa chẩn đoán sau red-team)

## Overview
ch3-1-3 nền toa xám đục tương phản thấp + dead-space dưới đáy/trên đỉnh toa. CHỈ sửa tương phản + thu minY/maxY. KHÔNG đụng feedback (false-fail), KHÔNG thu maxX (clip toa), KHÔNG đụng gradient 'axis' shared.

## DIVERGENCE so với bản nháp (red-team — đọc kỹ)
- **"dead-space upper-right" CHẨN ĐOÁN SAI.** Vùng phải-trên là THÂN TOA (poly x∈[-3.5,3.5], y∈[0,5] — ch3-1-3.js:20). Thu maxX (5→3.5) sẽ **CLIP cạnh phải toa**. → KHÔNG đụng maxX.
- Dead-space THẬT: `minY=-1` (dưới đáy toa y=0) và `maxY=6` (trên đỉnh toa y=5). worldBox dòng 11.
- **"Thêm gradient key riêng" BẤT KHẢ THI**: `ensureDefs` (svg-render.js:45-53) auto-sinh gradient cho MỌI token; muốn key mới phải thêm token → decision #2 cấm. Gradient 'axis' shared bởi ch1-1-8/ch1-3-2/ch1-6-3 → KHÔNG sửa stops.

## Requirements
- Functional: nền toa tương phản đủ để đọc khung; bỏ dead-space dọc; con lắc cân khung.
- Non-functional: KHÔNG đổi physics (theta=atan2(a,g)); KHÔNG đổi token/gradient global; slider a vẫn drive theta.

## Architecture
Code thật (`js/sim2/sims/ch3/ch3-1-3.js`):
- worldBox `{minX:-5,minY:-1,maxX:5,maxY:6}` (dòng 11) → cao 7, rộng 10.
- Toa = poly `gradient:'axis', depth:true` (dòng 19-21), `Pal.axis=#64748b` slate mờ.

Hai sửa:
1. **Tương phản nền toa**: thêm `stroke` viền đậm cho poly toa (vd stroke width 2-3, màu đậm hơn slate) để khung toa rõ — KHÔNG đụng gradient 'axis' stops (shared). Đây là per-element attribute, an toàn.
2. **Thu dead-space dọc**: minY -1→0 (sát đáy toa), maxY 6→~5.4 (lề nhẹ trên đỉnh). GIỮ minX/maxX (-5/5) để không clip toa.

## Related Code Files
- Modify: `js/sim2/sims/ch3/ch3-1-3.js` (worldBox dòng 11; poly stroke dòng 19-21)
- KHÔNG chạm: `js/sim2/core/svg-render.js` (gradient shared)
- Modify (test): `tests/sim2-ch3-mount.spec.js`

## Implementation Steps
1. (TDD) Assertion: poly toa có `stroke-width` ≥ ngưỡng (viền rõ); worldBox y-range thu (đọc qua content bbox lề dưới/trên giảm). Chạy → đỏ.
2. Thêm viền đậm cho poly toa (per-element stroke, không đụng gradient).
3. worldBox minY -1→0, maxY 6→5.4. GIỮ maxX=5.
4. Re-capture → soi nền rõ + khung cân, toa KHÔNG bị clip phải.
5. `npm run test:sim:release` xanh; verify handle a vẫn khớp arrow (world-coords auto-map — red-team xác nhận không desync) + slider drive theta.

## Success Criteria
- [ ] Test framing đỏ trước, xanh sau.
- [ ] Re-capture: nền toa tương phản đủ, dead-space dọc giảm, toa KHÔNG clip cạnh phải.
- [ ] Slider a vẫn drive theta (không regress feedback).
- [ ] Physics + token + gradient 'axis' shared KHÔNG đổi; `test:sim:release` xanh.

## Risk Assessment
- Risk: thu maxY quá sát đỉnh toa cắt nhãn/arrow trên. Mitigation: 5.4 cho lề 0.4 trên đỉnh y=5; verify nhãn không clip.
- Risk: viền toa đậm chồng gradient depth. Mitigation: stroke mảnh-vừa (≤3), verify không che nội dung.
- Verified an toàn (red-team): handle/arrow dùng world-coords qua tf → đổi worldBox tự map, KHÔNG desync.
