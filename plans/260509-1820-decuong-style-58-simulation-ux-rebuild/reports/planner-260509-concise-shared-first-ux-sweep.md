---
title: "Concise Turn Plan - Shared-First DeCuong UX Sweep"
status: pending
created: 2026-05-09
source: "ck:cook --auto"
---

# Concise Turn Plan - Shared-First DeCuong UX Sweep

## Intent

Đẩy cả 58 routes tiến gần DeCuong-style UX bằng shared shell + shared mount/readout + shared interaction + shared QA trước. Không copy legacy DeCuong inline JS. Không lao vào sửa 58 route files ngay.

## Verified Anchors

- Shared lab DOM slots đã tập trung trong `SimLabUI.createLab()` tại `js/sim-lab-ui.js:78`; slot hiện có gồm header/readout/formula/hint tại `js/sim-lab-ui.js:150`, `js/sim-lab-ui.js:181`, `js/sim-lab-ui.js:185`, `js/sim-lab-ui.js:191`.
- Shared mount/control/readout lifecycle tập trung trong `SimProfessionalLab.mount()` tại `js/sim-professional-lab.js:799`; readout cards ở `js/sim-professional-lab.js:279`, controls ở `js/sim-professional-lab.js:322`, metadata/handle ids ở `js/sim-professional-lab.js:263` và `js/sim-professional-lab.js:892`, reset/play ở `js/sim-professional-lab.js:837`, `js/sim-professional-lab.js:857`, `js/sim-professional-lab.js:864`.
- Pointer/touch/keyboard và `data-active-handle-id` tập trung trong `js/sim-interactions.js:57`, `js/sim-interactions.js:67`, `js/sim-interactions.js:139`, `js/sim-interactions.js:178`, `js/sim-interactions.js:199`.
- Contract 58 routes vẫn phải đi qua registry + `window.SIM_MAP` theo `js/sim-route-renderer-registry.js:36`, `js/sim-route-behavior-registry.js:42`, `js/simulations.js:65`, `js/simulations.js:99`.
- Browser gates hiện đã khóa 58 mounts, shell slots, theme delta, route-owned handles, overflow tại `tests/simulation-browser.spec.js:26`, `tests/simulation-browser.spec.js:83`, `tests/simulation-browser.spec.js:97`, `tests/simulation-visual-quality.spec.js:48`, `tests/simulation-visual-quality.spec.js:71`, `tests/simulation-visual-quality.spec.js:96`; release wiring ở `package.json:11`, `package.json:12`, `package.json:19`.
- Shared UX phải giữ `.sim-lab` scoping, `data-theme`, và release visual gate theo `docs/design-guidelines.md:117`, `docs/design-guidelines.md:143`, `docs/code-standards.md:30`, `docs/code-standards.md:95`, `docs/code-standards.md:154`, `docs/system-architecture.md:7`, `docs/system-architecture.md:32`, `docs/system-architecture.md:34`.

## Current-Turn Scope

- In-scope:
  - `css/style.css`
  - `js/sim-lab-ui.js`
  - `js/sim-professional-lab.js`
  - `js/sim-interactions.js`
  - `tests/simulation-browser.spec.js`
  - `tests/simulation-visual-quality.spec.js`
- Deferred until failures exist:
  - individual `js/sims/ch*/` route modules
  - docs sync in `docs/project-roadmap.md` và `docs/project-changelog.md`
- Out of scope:
  - `js/pages.js`
  - framework/build-step changes
  - route id / registry contract changes

## Data Flow

`routeId` -> `window.SIM_MAP[routeId]` -> `SimProfessionalLab.mount(routeId)` -> `SimLabUI.createLab()` -> scene/behavior/renderer metadata -> controls + handles + readout cards + formula/hint -> DOM attrs (`data-route-id`, `data-renderer-id`, `data-behavior-id`, `data-handle-ids`, `data-active-handle-id`) -> Playwright visual/interaction gates -> docs changelog/roadmap when stable.

Theme flow: app `data-theme` -> `.sim-lab` scoped CSS tokens -> scene/readout/control contrast in both dark/light.

## Execution Order

| Step | Files owned | Data in -> out | Blockers | Done when |
|---|---|---|---|---|
| 1. Shell polish | `css/style.css`, `js/sim-lab-ui.js` | route title/formula/hint -> stable DeCuong-like shell slots | none | header, scene, readout, formula, hint rõ ở dark + light |
| 2. Mount/readout/control normalize | `js/sim-professional-lab.js` | scene + manifest + behavior -> consistent status/readout/reset/play layout | step 1 | no generic fallback text; readout cards ổn định khi route mount |
| 3. Interaction grammar tighten | `js/sim-interactions.js`, `js/sim-professional-lab.js` | pointer/touch/keyboard -> immediate state/readout/status feedback | step 2 | drag/pause/focus/nudge nhất quán, không no-op |
| 4. QA ratchet | `tests/simulation-browser.spec.js`, `tests/simulation-visual-quality.spec.js` | live DOM/canvas -> fail-fast on theme/readout/overflow/drag regressions | steps 1-3 | shared-layer failures lộ rõ trước khi đụng route files |
| 5. Route sweep only from failures | failing `js/sims/ch*/...` files, exact list TBD | failing route list -> minimal route-specific fixes | step 4 | chỉ sửa route thật sự bị blocker sau shared pass |
| 6. Docs sync | `docs/project-roadmap.md`, `docs/project-changelog.md` | verified outcomes -> roadmap/changelog entries | steps 4-5 | docs phản ánh behavior thật, không phản ánh ý định |

Thực thi nên serial. Step 1-4 cùng chạm shared files/test gates; không phù hợp chạy song song.

## Concrete Steps

1. Polish `.sim-lab` visual hierarchy theo shell hiện có, không đổi contract class names.
2. Chuẩn hóa header/status/reset/play/readout/formula placement trong shared mount path.
3. Siết active/hover/focus feedback và pause-on-drag trên shared interaction path.
4. Nâng browser assertions để fail khi shell đẹp nhưng readout/overflow/tương tác vẫn yếu.
5. Chỉ sau khi shared gates ổn định mới mở route-group fix list theo failure report.
6. Sau cùng mới cập nhật changelog/roadmap; không update docs trước code/test reality.

## Test Matrix

- Shared syntax/runtime:
  - `npm run test:sim:unit`
  - `npm run test:sim:quality`
- Shared browser shell:
  - `npm run test:sim:browser:route-mount`
  - `npx playwright test tests/simulation-browser.spec.js --grep @sim-shell-theme`
  - `npx playwright test tests/simulation-browser.spec.js --grep @responsive`
- Shared interaction/visual:
  - `npm run test:sim:visual-quality`
  - `npx playwright test tests/simulation-interaction-engine.spec.js --grep @direct-drag`
- Full gate after blocker fixes:
  - `npm run test:sim:release`

## Risks

| Risk | Likelihood x Impact | Mitigation |
|---|---|---|
| Shell CSS đẹp hơn nhưng làm vỡ 58 routes | High x High | giữ `.sim-lab` scoping, không đổi slot names, chạy `@route-mount` + `@theme-all` sau mỗi shared edit |
| Shared readout/control change làm sai semantics route-specific | Medium x High | khóa representative drag/readout checks trước route sweep |
| Dark pass nhưng light fail | Medium x Medium | all-route dark/light gate giữ bắt buộc trước docs sync |
| Shared JS đang lớn sẵn, edit lan rộng khó rollback | Medium x Medium | edit nhỏ theo step; nếu delta phình ra thì tách ở follow-up, không trộn với visual sweep |

## Rollback Plan

- Step 1 fail -> rollback chỉ `css/style.css` / `js/sim-lab-ui.js`.
- Step 2 fail -> rollback phần shared mount/readout, giữ nguyên QA additions để thấy regression.
- Step 3 fail -> rollback interaction delta riêng, không kéo lùi shell polish.
- Step 5 chưa được phép bắt đầu nếu step 1-4 chưa xanh; nhờ vậy tránh rollback 58 route files hàng loạt.

## Docs Impact

Hiện tại: none. Sau implementation pass dự kiến update `docs/project-roadmap.md` và `docs/project-changelog.md`; `README.md` chỉ đụng nếu QA scope/count đổi.

## Success Criteria

- `window.SIM_MAP` vẫn expose đủ 58 canonical routes.
- `npm run test:sim:browser:route-mount` pass đủ 58 routes.
- `npm run test:sim:visual-quality` pass: không `missing-renderer`, không `legacy-primary`, không overflow dark/light.
- Shared shell giữ dark + light readable, formula/hint/readout không overflow ở widths hiện có.
- Route-specific fixes, nếu có, xuất phát từ failure list thật thay vì sửa đại trà.

## Unresolved Questions

Không có.
