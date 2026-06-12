---
phase: 1
title: "Extend buildCapturePlan slider-hi (pure, test-first)"
status: complete
priority: P1
effort: "1h"
dependencies: []
---

# Phase 1: Extend buildCapturePlan slider-hi (pure, test-first)

## Overview
Thêm khả năng sinh shot `slider-far` vào `tools/sim2-visual/capture-plan.js` (pure UMD), kích hoạt
qua `opts.sliderTargets`. Test-first: viết assertion mới TRƯỚC trong unit test.

**Đổi tên `slider-hi` → `slider-far`** (red-team #4): kéo tới biên XA NHẤT init = tương phản mạnh
nhất. Kéo mù tới "hi" làm ch3-5-3 (ω~1/r²) ra frame ω-nhỏ ≈ init → yếu nhất, phản tác dụng.

## Requirements
- Functional: route có entry trong `interactionTargets` → job thêm 1 shot tương tác (`slider-far`
  cho kind slider, `drag-far` cho kind drag).
- Non-functional: KHÔNG truyền `interactionTargets` → output y hệt hiện tại (8 assertion cũ xanh nguyên).

## Architecture
`buildCapturePlan(manifest, classifyMap, opts)` — thêm `opts.interactionTargets` =
`{ routeId: {kind:'slider'|'drag', control, selector, lo, hi} }`.
- Sau khi build `shots`, nếu `interactionTargets[r.id]` tồn tại → push shot tương tác:
  - kind slider → `{ label:'slider-far', kind:'slider', control, lo, hi }`
  - kind drag → `{ label:'drag-far', kind:'drag', selector }`
- Áp cho CẢ static lẫn dynamic eligible. Shot tương tác KHÔNG có `frame` — spec set control rồi chụp.
- Giữ pure: plan chỉ ghi metadata target (control/selector/lo/hi nullable); SPEC đọc DOM runtime thật
  + giá trị init → chọn biên XA init nhất (heuristic probe `cur>=mid?min:max`, clamp lo/hi). Plan KHÔNG
  quyết value cuối (cần DOM runtime).

## Related Code Files
- Modify: `tools/sim2-visual/capture-plan.js` (thêm nhánh interactionTargets)
- Modify: `tests/sim2-visual-capture-plan.test.js` (thêm assertion interaction-far; giữ 8 assertion cũ)

## Implementation Steps
1. Test-first: thêm vào `sim2-visual-capture-plan.test.js`:
   - không truyền `interactionTargets` → `planAll[0].shots` vẫn `['init','live']` (regression guard).
   - truyền `{ [id]: {kind:'slider', control:'F', lo:null, hi:null} }` → shots cuối label `'slider-far'`, `control:'F'`.
   - truyền `{ [id]: {kind:'drag', selector:'.sim2-handle'} }` → shots cuối label `'drag-far'`, giữ selector.
   - interaction-far áp được cho dynamic route (shots = t0/mid/end + shot tương tác).
   - lo/hi override giữ nguyên trong shot slider (vd `{kind:'slider', control:'mu', lo:0.1, hi:1.0}`).
2. Chạy `node tests/sim2-visual-capture-plan.test.js` → ĐỎ (chưa impl).
3. Impl nhánh `interactionTargets` trong `buildCapturePlan`.
4. Chạy lại → XANH. Verify 8 assertion cũ vẫn pass.

## Success Criteria
- [ ] `npm run test:sim:visual:unit` xanh (8 cũ + 5 mới).
- [ ] Không truyền interactionTargets → output byte-identical hành vi cũ.
- [ ] Shot slider-far giữ `control`+`lo`+`hi`; shot drag-far giữ `selector` để spec resolve.

## Risk Assessment
- Risk: phá assertion #3 `['init','live']`. Mitigation: assertion đó gọi `buildCapturePlan(manifest,{})`
  KHÔNG truyền sliderTargets → nhánh mới không chạy. Đã guard bằng default rỗng.
