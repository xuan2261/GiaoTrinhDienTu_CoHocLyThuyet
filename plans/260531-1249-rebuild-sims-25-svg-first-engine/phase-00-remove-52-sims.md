---
phase: 0
title: "Gỡ 52 sim cũ + test/tool cũ"
status: completed
priority: P1
effort: "0.5d"
dependencies: []
---

# Phase 0: Gỡ 52 mô phỏng cũ + hạ tầng test/tool

## Overview
Tag archive điểm quay đầu, gỡ sạch 52 sim khỏi master để app thành **content-only**
(0 console error offline), xóa `test:sim:*` + `tools/*sim*`. **GIỮ LẠI** 3 file
`js/sim-physics-*.js` làm nguồn port cho P1.

## Requirements
- Functional: app mở `file://` offline, mọi route hiện nội dung, math render, image tabs hoạt động; KHÔNG còn sim mount.
- Functional: `npm run test:quiz`, `npm run test:content`, `npm run test:quiz:browser` xanh.
- Non-functional: 0 console error mọi route; không sửa text/markup chương (`chapters/` không nhúng sim — đã verify).

## Architecture
`loader.js` giữ route-map + lazy fragment + KaTeX render + image tabs; chỉ **rút khối sim**
(dispose + initSimulations + loadSimScript). `index.html` cắt script-tags sim. `SIM_MAP`
builder (`simulations.js`) xóa — sẽ dựng lại ở P1.

## Related Code Files
- **Tag (không sửa file):** `git tag archive/52-sims-pre-removal` + push.
- **Modify:** `index.html` (cắt script-tags sim ~316–376; giữ KaTeX 304–307, shared 308–314; gỡ `dispatchEvent('sim:katex-ready')` ở CDN fallback line 305).
- **Modify:** `js/loader.js` (gỡ `activeSimulationDispose`/`disposeActiveSimulation` 153–165, call 203; `initSimulations` 431–469 + call 280/302; `loadSimScript` 407–429 **dead code**; const `NO_SIMULATION_PAGE_IDS`/`SIM_ROUTE_ALIAS_MAP` 17–22).
- **Modify:** `package.json` (cắt mọi script `test:sim:*`; giữ `test:quiz*`, `test:content`, `test:equations`, `test:audit:strict`).
- **Modify:** `README.md` (gỡ mục QA simulation; thêm note "sim đang rebuild — xem plan").
- **Delete:** `js/sim-*.js` **TRỪ** `sim-physics-statics.js` `sim-physics-kinematics.js` `sim-physics-dynamics.js`.
- **Delete:** `js/sims/` (toàn bộ ch1/ch2/ch3/zz, gồm 2 orphan `ch2-particle-rotation-transmission-scenes.js`, `ch2-relative-plane-motion-scenes.js`).
- **Delete:** `js/simulations.js`, `js/sim-route-manifest.js`.
- **Delete:** `tools/*sim*` (smoke_simulation_*.py, capture-all-58…, capture_sims.js, debug_sim_mount.js, audit_simulation_quality.py, audit_v2_disposal.js, run-sim-review-2026-05-19-tests.js, sim-visual-baseline-update.js, update_sim_ids.py, test_simulation_*.py).
- **Delete:** `tests/*sim*`, `tests/phase-0*-tdd*.test.js`, `tests/promax-*.test.js`, `tests/*.spec.js` sim-only (giữ `quiz-*`, `author-page-content-regression`, `section-vii-*`).

## TDD — Tests trước (định nghĩa "content-only đạt")
1. **WRITE FIRST** `tests/sim2-removal-guard.test.js` (Node): assert KHÔNG tồn tại `js/sims/`, `js/simulations.js`; assert `js/sim-physics-*.js` **vẫn còn**; grep `index.html` không còn `js/sims/` script-tag; grep `loader.js` không còn `initSimulations`. → RED ngay (file chưa gỡ).
2. **WRITE FIRST** `tests/content-only-smoke.spec.js` (Playwright): load 3 route đại diện (1 mỗi chương) → `expect(consoleErrors).toEqual([])`; nội dung + KaTeX hiển thị; KHÔNG có `.sim-*` mount.
3. Chạy → đỏ. Gỡ theo Implementation Steps. Chạy lại → xanh.

## Implementation Steps
1. `git tag archive/52-sims-pre-removal && git push origin archive/52-sims-pre-removal`.
2. Viết 2 test guard ở trên (RED).
3. Cắt script-tags sim trong `index.html` (giữ physics? **KHÔNG** — physics không nạp ở browser nữa, chỉ là nguồn port Node; xác nhận không route nào nạp). Gỡ `sim:katex-ready` dispatch.
4. Rút khối sim khỏi `loader.js` (4 vùng liệt kê trên). Xác minh route-map/fragment/KaTeX/image-tabs còn nguyên.
5. Xóa files theo danh sách Delete (TRỪ 3 physics).
6. Cắt npm `test:sim:*`. Cập nhật README.
7. Chạy `test:quiz` + `test:content` + 2 guard test mới → tất cả xanh.

## Success Criteria
- [ ] Tag `archive/52-sims-pre-removal` đã push.
- [ ] `sim2-removal-guard.test.js` xanh (sims gỡ, physics giữ).
- [ ] `content-only-smoke.spec.js` xanh: 0 console error, 0 sim mount, content+KaTeX OK.
- [ ] `npm run test:quiz` + `npm run test:content` + `npm run test:quiz:browser` xanh.
- [ ] `git grep -n "initSimulations\|SIM_MAP\|js/sims/"` chỉ còn trong plans/tests-guard, không trong runtime js.

## Risk Assessment
- **Test harness cũ khóa "52 route" → CI đỏ.** Mitigation: xóa cùng lúc trong bước này (đã chốt).
- **Lỡ xóa physics nguồn port.** Mitigation: guard test assert 3 file còn; tag archive cứu được.
- **`loader.js` rút nhầm route-map.** Mitigation: smoke spec 3 route bắt regression ngay.
- **Tests đã đỏ sẵn** (`sim-engine-v2.test.js`, `foundation.test.js`, `phase-01-tdd.test.js` ref file không tồn tại) → xóa luôn, không để nhiễu.

## Security Considerations
Không có bề mặt auth/data. Chỉ đảm bảo không commit nhầm file nhạy cảm khi `git add`.

## Next Steps
P1 dựng engine + dựng lại `SIM_MAP` builder. Physics 3 file giữ lại là input P1.
