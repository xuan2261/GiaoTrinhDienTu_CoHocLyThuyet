---
title: "Phase 01 Runtime VII Suppression"
description: "Chặn hoàn toàn mount/sim placeholder cho toàn bộ route VII tại loader layer."
status: completed
priority: P1
effort: 1.5h
branch: master
tags: [phase, loader, simulation, vii-exercise]
created: 2026-05-22
---

# Phase 01 Runtime VII Suppression

## Context links

- `README.md:18`, `README.md:21`, `README.md:90`
- `docs/code-standards.md:13`, `docs/code-standards.md:158`
- `js/loader.js:7`, `js/loader.js:159`, `js/loader.js:283`, `js/loader.js:435`
- `chapters/ch3/muc-VII-4.html:12`, `chapters/ch3/muc-VII-5.html:10`, `chapters/ch3/muc-VII-6.html:7`

## Overview

- Priority: P1
- Status: completed
- Mục tiêu: biến toàn bộ section VII thành content-only pages mà không đụng generated content files.

## Key insights

- `loadPage()` đã dispose simulation cũ trước khi render page mới, nên denylist ở `initSimulations()` đủ để không rò lifecycle sang VII pages: `js/loader.js:206`.
- `initSimulations()` hiện vừa lookup `SIM_MAP`, vừa tự tạo `.sim-mount`; đây là đúng choke point để chặn mount mới: `js/loader.js:441`, `js/loader.js:447`.
- Legacy alias `ch1-8-*`, `ch2-8-*` đã normalize về route VII thật trước khi load, nên denylist theo canonical page id tự cover alias cũ: `js/loader.js:7`, `js/loader.js:188`.

## Requirements

- Functional:
  1. 15 route VII của ch1/ch2/ch3 phải render nội dung mà không để lại bất kỳ simulation DOM nào.
  2. Non-VII routes vẫn giữ nguyên behavior mount/dispose hiện tại.
- Non-functional:
  1. Regenerate `js/pages.js` sau khi cập nhật fragment.
  2. Không thay đổi `SIM_ROUTE_MANIFEST` hay adapters chapter trong phase này.

## Architecture

- Data in:
  `window.location.hash` -> `loadPage(id)` -> canonical `pageId` sau `LEGACY_ROUTE_MAP` (`js/loader.js:187`).
- Transform:
  `initSimulations(container, pageId)` check `NO_SIMULATION_PAGE_IDS`; nếu match thì return sớm trước `loadSimScript()` / `SIM_MAP` lookup.
- Data out:
  `#content-area` chỉ còn textbook HTML; `activeSimulationDispose` tiếp tục là `null` sau route VII vì không mount mới (`js/loader.js:167`).

## Related code files

- Modify:
  - `js/loader.js`
  - `chapters/ch3/muc-VII-4.html`
  - `chapters/ch3/muc-VII-5.html`
  - `chapters/ch3/muc-VII-6.html`
  - `js/pages.js` (regenerated)
- Read only:
  - `js/simulations.js:39`
  - `js/sim-statics.js:40`
  - `js/sim-kinematics.js:30`
  - `js/sim-dynamics.js:33`
  - `chapters/ch1/muc-VII.html:8`
  - `chapters/ch2/muc-VII.html:8`
  - `chapters/ch3/muc-VII.html:8`
  - `chapters/ch3/muc-VII-4.html:12`
  - `chapters/ch3/muc-VII-5.html:10`
  - `chapters/ch3/muc-VII-6.html:7`
  - `js/pages.js [generated, no hand edit]`

## Implementation steps

1. Khai báo một `Set` chứa đủ 15 route VII ngay cạnh `LEGACY_ROUTE_MAP` / `SIM_ROUTE_ALIAS_MAP`.
2. Xóa placeholder `sim-ch3-7-4/5/6` khỏi fragment Ch3.
3. Trong `initSimulations()`, check denylist trước `loadSimScript()`; với route bị chặn thì `return`.
4. Giữ nguyên nhánh mount cho route ngoài VII; không đụng `SIM_MAP` build path.

## Todo list

- [x] Add canonical VII no-sim route set.
- [x] Remove stale Ch3 sim placeholders.
- [x] Early-return `initSimulations()` trước `loadSimScript()`.
- [x] Verify legacy aliases `ch1-8-*`, `ch2-8-*` also normalize into blocked VII routes.

## Success criteria

- Loading `#ch1-7-1`, `#ch2-7-2`, `#ch3-7-6` không render `.sim-container.sim-lab`.
- Loading `#ch3-7-4/5/6` không còn placeholder `#sim-ch3-7-*`.
- Loading `#ch1-2-3` vẫn mount 1 lab như cũ.

## Risk assessment

- High: selector scrub quá rộng xóa nhầm content.
  Mitigation: chỉ chạy trên denylist VII; chỉ xóa sim-specific selectors.
- Medium: denylist thiếu route, làm lọt mount.
  Mitigation: hard-code đủ 15 route theo `tests/exercise-section-no-simulation.spec.js:7`.

## Backwards compatibility

- Giữ nguyên 58 registered routes trong manifest/registry; chỉ đổi user-facing mount policy ở loader.
- Offline `file://` flow không đổi vì không thêm build/runtime dependency mới.

## Rollback plan

- Xóa denylist + helper scrub khỏi `js/loader.js`.
- Chạy lại `npm run test:sim:browser:route-mount` để confirm VII mount phục hồi.

## Security considerations

- Không thêm fetch/network path mới.
- Không chạm storage/client state keys.

## Next steps

- Sau khi Phase 01 xong mới cập nhật test taxonomy ở Phase 02.
