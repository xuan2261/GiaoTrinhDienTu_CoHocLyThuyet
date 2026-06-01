---
phase: 5
title: "Harness 25 route + docs sync"
status: done
priority: P2
effort: "0.5d"
dependencies: [2, 3, 4]
---

# Phase 5: Harness 25 route + docs

## Overview
Chốt: test harness phủ control/panel cho cả 25 route, chuẩn hóa control bespoke (nếu pilot lộ
nhu cầu), cập nhật docs/README phản ánh tầng UI mới. Không tính năng mới.

## Requirements
- Functional:
  - Test harness 25 route: mỗi route có control + panel + dispose sạch (gom assert dùng chung, đọc count từ manifest — KHÔNG hardcode 25).
  - `test:sim:mount` gồm `sim2-ui-components.spec.js`.
  - Docs: README mục "Mô phỏng" + `docs/design-guidelines.md` (token màu, control, panel) + `docs/codebase-summary.md` (3 module core mới).
- Non-functional: grep 0 hex inline trong `js/sim2/sims/**`; mọi sim dùng `Sim2Palette`.

## Architecture
Helper test chung `assertSimControls(page, route)` dùng lại cho 25 route; count từ `SIM2_ROUTE_MANIFEST`.

## Related Code Files
- Modify: `package.json` (thêm ui-components spec vào `test:sim:mount` nếu chưa), `README.md`, `docs/design-guidelines.md`, `docs/codebase-summary.md`
- Create (nếu cần): helper trong `tests/` cho assertSimControls
- Modify: `tests/sim2-route-coverage.test.js` nếu cần phủ thêm

## Implementation Steps
1. Gom assert control/panel dùng chung; áp 25 route (đọc manifest).
2. `npm run test:sim:release` xanh (physics + mount + content + quiz).
3. grep hex inline `js/sim2/sims/**` → 0 (trừ rgba có alpha cho fill mờ nếu giữ).
4. Cập nhật README + 2 docs.
5. Chuẩn hóa control bespoke nếu P1/P2 lộ ≥2 kiểu trùng (DRY).

## Success Criteria
- [ ] `npm run test:sim:release` xanh — 25 route có control + panel + dispose sạch.
- [ ] Docs/README khớp tầng UI mới.
- [ ] 0 hex màu rải rác (dùng token); count test đọc từ manifest.

## Risk Assessment
- **Docs lệch code** → mitigation: cập nhật cuối cùng sau khi code chốt; cross-check route-id với manifest.
- **Bespoke khó chuẩn hóa** → mitigation: nếu chỉ 1 kiểu mỗi sim, để tự do, ghi rõ lý do (YAGNI).
