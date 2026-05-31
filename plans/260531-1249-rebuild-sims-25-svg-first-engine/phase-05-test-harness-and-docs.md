---
phase: 5
title: "Test harness 25 route + docs + dọn physics cũ"
status: pending
priority: P2
effort: "1d"
dependencies: [4]
---

# Phase 5: Test harness 25 route chính thức + cập nhật docs + dọn dẹp

## Overview
Gom các test per-chương thành harness chính thức cho 25 route, dựng lại npm `test:sim:*` gọn,
cập nhật README/docs, và xóa 3 file `js/sim-physics-*.js` cũ (đã port sang `js/sim2/physics/`).

## Requirements
- Functional: `npm run test:sim:*` mới xanh, cover đúng 25 route (không hardcode 52).
- Functional: docs (README + docs/) khớp kiến trúc engine mới + 25 sim.
- Non-functional: 1 lệnh release gate chạy được offline; 0 console error toàn 25 route.

## Architecture
**npm scripts mới** (thay block `test:sim:*` đã cắt ở P0):
- `test:sim:physics` → `node tests/sim2-*-physics.test.js` (port + ch1/ch2/ch3 invariants).
- `test:sim:mount` → `playwright test tests/sim2-*-mount.spec.js` (smoke + no-overlap + alignment + disposal).
- `test:sim:release` → physics + mount + `test:content` + `test:quiz`.

**Manifest 25 route**: `js/sim2/sim2-route-manifest.js` (id + tên + chương) thay `sim-route-manifest.js` cũ.
Test count đọc từ manifest, KHÔNG hardcode.

## Related Code Files
- **Create:** `js/sim2/sim2-route-manifest.js` (25 route metadata).
- **Create:** `tests/sim2-route-coverage.test.js` (assert mọi route manifest có factory trong `SIM_MAP` + có physics test + có mount case).
- **Modify:** `package.json` (thêm `test:sim:physics`, `test:sim:mount`, `test:sim:release` mới).
- **Modify:** `README.md` (mục "QA simulation" mới: 25 route, engine SVG-first, lệnh test mới).
- **Modify:** `docs/system-architecture.md`, `docs/codebase-summary.md` (engine 3 tầng, `js/sim2/`).
- **Modify:** `docs/project-roadmap.md`, `docs/project-changelog.md` (ghi rebuild 52→25).
- **Delete:** `js/sim-physics-statics.js`, `js/sim-physics-kinematics.js`, `js/sim-physics-dynamics.js` (đã port + verify ở P1).
- **Delete:** `js/sim2/sims/ch1/hello-sim.js` + gỡ `register('sim2-hello',…)` + script-tag (scaffold P1, không thuộc 25 route).
- **Update memory:** prune `sim-physics-verified-visual-remaining` (52-route state cũ) → ghi nhận đã thay bằng `js/sim2/`.

## TDD — Tests trước
1. **WRITE FIRST** `tests/sim2-route-coverage.test.js`: đọc manifest → assert `length===25`; mỗi id khớp `/^ch\d-\d-\d$/`; mỗi id có trong `SIM_MAP`; mỗi id có ≥1 physics assert + ≥1 mount case (grep test files). RED cho tới khi manifest + scripts đủ.
2. **WRITE FIRST** guard `tests/sim2-no-legacy-physics.test.js`: assert `js/sim-physics-*.js` KHÔNG còn (sau khi đã port); `js/sim2/physics/*` tồn tại + require() được. RED trước khi xóa.
3. Chạy → đỏ. Dựng harness + xóa physics cũ. Chạy lại → xanh.

## Implementation Steps
1. Viết 2 test guard/coverage (RED).
2. Tạo `sim2-route-manifest.js` 25 route.
3. Thêm npm scripts mới; gom test per-chương vào `test:sim:physics` + `test:sim:mount`.
4. Xác nhận P1–P4 đã port + verify physics → xóa 3 file `js/sim-physics-*.js` cũ.
5. Gỡ scaffold `sim2-hello` (file + register + script-tag) — `SIM_MAP` chỉ còn đúng 25.
6. Cập nhật README + docs/ + memory.
7. Chạy `npm run test:sim:release` → xanh toàn bộ.

## Success Criteria
- [ ] `sim2-route-coverage.test.js` xanh: đúng 25 route, mỗi route có factory + test.
- [ ] `sim2-no-legacy-physics.test.js` xanh: physics cũ đã xóa, `js/sim2/physics` require() OK.
- [ ] `npm run test:sim:release` xanh (physics + mount + content + quiz), offline.
- [ ] README + docs/ khớp engine mới; memory pruned.
- [ ] `git grep "52"` không còn route-count cứng trong test/tool runtime.

## Risk Assessment
- **Xóa physics cũ trước khi port verify xong** → mất nguồn. Mitigation: guard test bước 2 + tag archive; chỉ xóa sau khi P1 physics-port test xanh.
- **Test count cứng tái xuất.** Mitigation: đọc từ manifest, coverage test bắt drift.
- **Docs lệch thực tế.** Mitigation: docs-manager review sau khi code xong, đối chiếu `js/sim2/` thật.

## Security Considerations
Không có.

## Next Steps
Hoàn tất rebuild. Cân nhắc (unresolved): archive thành nhánh ngoài tag nếu muốn bảo trì bộ cũ song song.
