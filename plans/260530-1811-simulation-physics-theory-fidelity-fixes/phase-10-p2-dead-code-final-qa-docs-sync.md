---
phase: 10
title: "P2 Dead-Code & Final QA + Docs Sync"
status: pending
priority: P2
effort: "0.5d"
dependencies: [9]
---

# Phase 10: P2 Dead-Code & Final QA + Docs Sync

## Overview
Dọn dead code adapter `SimStatics`, chạy full release gate, đồng bộ docs/changelog. Đóng plan.

## Requirements
- Xác minh đường mount thật (`loader.js:457`→`SIM_MAP`→`simulations.js`) và xử lý adapter `statics-routes.js`/`SimStatics` (nạp ở index.html:373 nhưng bị professional-lab ghi đè).
- Toàn bộ test suite PASS: `npm run test:sim:release`.
- Docs đồng bộ: changelog, codebase-summary nếu có thay đổi kiến trúc readout/units.

## Architecture
- Quyết định adapter: nếu xác nhận hoàn toàn dead cho 52 route → gỡ script khỏi index.html + xóa file (giảm nhiễu, đúng KISS); nếu còn entry khác dùng → giữ và ghi chú.
- Cập nhật `DanhSach_MoPhong_GiaoTrinh.md` (đang ghi 58, thực tế 52 canonical) cho khớp.

## Related Code Files
- Modify (nếu gỡ): `index.html` (bỏ line 370,373), xóa `js/sim-statics.js`, `js/sims/ch1/statics-routes.js`
- Modify: `docs/project-changelog.md`, `DanhSach_MoPhong_GiaoTrinh.md`, `docs/codebase-summary.md` (nếu cần)
- Read: `js/loader.js`, `js/simulations.js`, `js/sim-core.js` (SimRegistry)

## Implementation Steps
1. Grep route-id mà `statics-routes.js` đăng ký vs đường mount thật → xác nhận dead.
2. Nếu dead: gỡ script + xóa file; chạy smoke runtime 52 route đảm bảo không vỡ.
3. **REFRESH VISUAL BASELINE (bắt buộc — nếu bỏ qua, release gate RED mọi route sửa renderer):** sau khi review thủ công các capture mới, chạy `npm run test:sim:browser:update-evolution-baseline` (canvas-evolution hash) và `npm run test:sim:visual-quality:update-evolution-baseline` (pixelmatch tier-2). Mọi phase 02-09 sửa renderer đều làm drift baseline; đây là bước hợp thức hóa thay đổi có chủ đích.
4. Chạy `npm run test:sim:release` (content + unit + quality + browser + visual-quality + disposal + audit/equation strict).
5. Sửa `DanhSach_MoPhong_GiaoTrinh.md` 58→52 cho khớp manifest.
6. Cập nhật changelog: tóm tắt sửa physics/units/panel; KHÔNG tham chiếu phase number trong code comment. Ghi rõ 3 feature-add (ch3-6-3 xiên, ch2-4-1 frame, ch2-1-2 moving object) chuyển BACKLOG.
7. Đánh dấu plan completed.

## Success Criteria
- [ ] Adapter SimStatics: gỡ (nếu dead) hoặc ghi chú (nếu còn dùng), không còn nhầm lẫn.
- [ ] Visual baseline (evolution hash + pixelmatch) refresh sau review thủ công.
- [ ] `npm run test:sim:release` PASS toàn bộ.
- [ ] Docs + DanhSach đồng bộ con số 52 route; backlog ghi rõ.
- [ ] Plan đóng.

## Risk Assessment
- **Refresh baseline phải SAU review thủ công từng capture** — nếu update mù, sẽ hợp thức hóa luôn cả lỗi render mới phát sinh. Xem side-by-side capture trước khi update.
- Gỡ adapter có thể vỡ entry page khác (DeCuong_CoHocLyThuyet.html?) → grep toàn repo trước khi xóa; nếu nghi ngờ, giữ file + thêm comment "dead for app shell" thay vì xóa.
- Release gate strict-equations/images độc lập với sim → nếu fail vì lý do cũ, tách khỏi scope plan này và báo user.
