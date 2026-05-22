---
title: "Loại bỏ mount simulation ở section VII bài tập"
description: "Plan ngắn để chặn hoàn toàn simulation UI trên toàn bộ route VII của ch1-ch3 và đồng bộ generated bundle/test taxonomy."
status: completed
priority: P1
effort: 3h
branch: master
tags: [plan, simulation, loader, regression, vii-exercise]
created: 2026-05-22
blockedBy: []
blocks: []
---

# Loại bỏ mount simulation ở section VII bài tập

## Scope đã verify

- Sidebar đang expose toàn bộ route VII của ch1/ch2/ch3 qua `loadPage(...)`: `index.html:122`, `index.html:179`, `index.html:238`.
- Loader luôn gọi `initSimulations(ca, id)` sau khi inject fragment, rồi mount nếu `window.SIM_MAP[simRouteId]` tồn tại; nếu thiếu mount point còn tự tạo `.sim-mount`: `js/loader.js:283`, `js/loader.js:435`, `js/loader.js:441`, `js/loader.js:447`.
- 6 route VII hiện vẫn là canonical simulation routes trong manifest/adapters: `js/sim-route-manifest.js:35`, `js/sim-route-manifest.js:52`, `js/sim-route-manifest.js:72`, `js/sim-statics.js:40`, `js/sim-kinematics.js:30`, `js/sim-dynamics.js:33`.
- 3 page VII của ch3 còn chứa placeholder HTML trực tiếp, nên chỉ skip mount là chưa đủ: `chapters/ch3/muc-VII-4.html:12`, `chapters/ch3/muc-VII-5.html:10`, `chapters/ch3/muc-VII-6.html:7`.

## Quyết định kiến trúc

- Không sửa tay `js/pages.js`; bundle được regenerate bằng `tools/bundle_pages.py`: `README.md:90`, `docs/code-standards.md:13`, `docs/code-standards.md:60`.
- Fragment Ch3 có placeholder simulation cũ được sửa trực tiếp vì user yêu cầu loại bỏ hoàn toàn UI mô phỏng trong section VII hiện tại.
- Không giảm manifest 58 routes trong thay đổi này. Chỉ chặn mount ở UI layer để tránh kéo theo churn lớn ở runtime contract và smoke hiện có: `js/sim-route-manifest.js:10`, `docs/code-standards.md:159`.
- Hướng sửa tối thiểu: thêm denylist 15 route VII trong `js/loader.js`, scrub mọi sim placeholder trên các route đó, giữ nguyên mount path cho route ngoài VII.

## Phases

1. [Phase 01](phase-01-runtime-vii-suppression.md): chặn mount + loại placeholder cũ.
2. [Phase 02](phase-02-regression-test-matrix.md): cập nhật route taxonomy test, nối regression spec vào npm gate, giữ coverage cho route ngoài VII.

## Dependency graph

- Phase 02 phụ thuộc Phase 01 vì regression spec cần hành vi suppress đã tồn tại.
- Không chạy song song; Phase 01 owns `js/loader.js`, Phase 02 owns `tests/*` và `package.json`.

## Success criteria

- 15 page thuộc section VII (`ch1-7*`, `ch2-7*`, `ch3-7*`) không còn `.sim-lab`, `.sim-mount`, `[data-sim-mount-route]`, `[id^="sim-ch"]` sau load; oracle đã có ở `tests/exercise-section-no-simulation.spec.js:7`.
- Route ngoài VII vẫn mount bình thường qua browser gate hiện có: `tests/simulation-browser.spec.js:366`, `tests/simulation-visual-quality.spec.js:48`.
- `js/pages.js` được regenerate, không sửa tay.

## Rollback

- Revert denylist/scrub trong `js/loader.js`.
- Revert test taxonomy `mountable` vs `registered`.
- Chạy lại browser gates để xác nhận VII mount trở về trạng thái cũ.

## Validation

- Tối thiểu: `playwright test tests/exercise-section-no-simulation.spec.js`, `npm run test:sim:browser:route-mount`.
- Trước khi chốt: `npm run test:sim:browser`, `npm run test:sim:visual-quality`, `npm run test:sim:unit`.

## Unresolved questions

- Có cần follow-up riêng để xóa hẳn dormant VII simulation code khỏi registries/scene catalogs không? Hiện browser/UI đã content-only, còn unit/contract nội bộ vẫn giữ 58 registered routes.
