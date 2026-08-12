---
phase: 1
title: "Khóa hợp đồng và dựng RED harness"
status: completed
priority: P1
effort: ""
dependencies: []
---

# Phase 1: Khóa hợp đồng và dựng RED harness

## Tổng quan

Khóa observable contract trước production code. Dựng Node/Playwright harness chạy cùng scenario trên production `index.html` qua `file://` và static HTTP; feature specs phải RED vì trigger/runtime chưa tồn tại, trong khi control specs chứng minh harness/server/temp-copy/error collector hoạt động đúng.

## Baseline liên quan

- File URL precedent và console/page-error capture: `tests/content-only-smoke.spec.js:1-45`.
- Production sim mount/dispose precedent: `tests/sim2-ch1-integration.spec.js:8-49`.
- Playwright hiện không có project/webServer matrix: `playwright.config.cjs:1-12`.
- Dev scripts hiện nằm trong `package.json:6-28`.
- Route PDF bị cấm vì `loadPage()` đổi hash, dispose sim, thay DOM và scroll: `js/loader.js:170-217`, `js/loader.js:247-274`.

## Requirements

- Functional: assert exact trigger name, exact dialog title, controls, first-page render, preservation, history và recovery.
- Transport: chạy cùng test API cho `file://`, HTTP root và nested subdirectory; fail external network.
- Non-functional: test deterministic, isolated temp directories/ports, cleanup đầy đủ; không dùng source-text assertion thay behavior trừ packaging contract.
- Scope guard: explicit tests chứng minh không route/storage key/print/search/thumbnails/annotation/bookmarks.

## Kiến trúc harness

```text
playwright.pdf.config.cjs
 -> projects: pdf-chromium, pdf-firefox, pdf-webkit, pdf-msedge(separate gate)
 -> pdf-viewer.spec.js
    -> fixture mode=file: production root or nested temp USB copy
    -> fixture mode=http: scoped Node static server from same root/copy
    -> snapshot lesson context
    -> interact by accessible role/name
    -> assert viewer + restore + no external request/error

pdf-vendor-contract.test.js
 -> package pin/provenance/license/artifact hashes/no runtime module-CDN
```

### Contract cases phải tồn tại ở RED

| Nhóm | Oracle |
|---|---|
| Open | button name `Xem bản PDF`; one modal; title exact; shell visible immediately. |
| Lazy | trước click chưa có PDF runtime/data/canvas request; sau click load local đúng một lần; reopen không duplicate. |
| Transport | page 1 + text layer render trên file/HTTP; no external request; nested path có dấu/khoảng trắng. |
| Context | route `#ch1-1-3`; content node identity/hash/sidebar/sim/quiz/localStorage giữ nguyên; scroll restore ±2 px. |
| Close | back button, close button, Escape, Browser Back; focus về trigger; Back chỉ consume one sentinel. |
| Controls | previous disabled page 1; next/current-total/input bounds; zoom 50–300/fit; download filename. |
| Race | 10 rapid next/prev/zoom chỉ final requested page; no canvas reuse error. |
| Resilience | delayed load, missing/corrupt runtime/data/PDF/worker; alert + Retry + Download + Back; close-during-load safe. |
| A11y/UI | Tab/Shift+Tab stays modal; background inert; live status; 44 px targets; no overflow at matrix; reduced motion. |
| Scope | no hash `pdf`, no storage key addition, no forbidden toolbar/control. |

## Files liên quan

- Create: `tests/pdf-viewer.spec.js`.
- Create: `tests/pdf-vendor-contract.test.js`.
- Create: `tools/pdf-viewer/playwright.pdf.config.cjs`.
- Create: shared helper inside the spec hoặc `tests/helpers/pdf-viewer-harness.cjs` chỉ khi reuse thật sự cần.
- Modify: `package.json`, `package-lock.json` chỉ để thêm Playwright projects/scripts/dependency pins ở Phase 2; Phase 1 có thể chạy lệnh trực tiếp để giữ RED độc lập.
- Do not modify: production files.

## TDD ordering

1. **RED — contract:** viết specs theo bảng trên bằng role/name/DOM identity/state, không query internal controller để “pass”. Chạy từng nhóm và ghi expected failure cụ thể: trigger/artifact absent, không phải lỗi harness.
2. **GREEN — harness only:** làm scoped static server, nested temp-copy, transport parametrization, request/error collectors và teardown hoạt động. Một control test mở baseline lesson thành công ở cả modes; feature assertions vẫn RED.
3. **Refactor:** trích helper chỉ cho URL/server/context snapshot; giữ oracle ngay cạnh scenario; loại sleeps tùy ý bằng event/status waits.
4. Freeze tên test và contract; các phase sau GREEN theo nhóm, không sửa expected để hợp implementation.

### Lệnh phase

```powershell
node tests/pdf-vendor-contract.test.js
npx playwright test --config=tools/pdf-viewer/playwright.pdf.config.cjs --project=pdf-chromium
```

Kết quả cuối Phase 1: control harness GREEN; PDF feature specs RED với diagnostic đã định danh.

## Failure modes

| Failure | Signal | Response |
|---|---|---|
| RED vì baseline/CDN KaTeX thay vì PDF | error không liên quan trigger/PDF | Chặn external request sau local asset load; sửa harness isolation, không nới console oracle. |
| Static server khác release semantics | absolute path hoặc MIME custom che lỗi | Server tối giản root-relative, đúng MIME `.js/.mjs/.pdf`; thêm nested subdirectory case. |
| Temp-copy làm mất asset | lesson control test fail | Copy runtime manifest đầy đủ; kiểm source/copy hash trước feature scenario. |
| Test fixture remount sim | sim identity đổi trước click | Chọn production route và wait mount ổn định trước snapshot. |
| Flaky timeout | retry mới pass | Wait semantic status/render generation; không tăng timeout để che race. |
| Test phụ thuộc source text | refactor vô hại làm fail | Chỉ static-inspect packaging invariants; behavior dùng browser API/DOM. |

## Success criteria

- [x] Control specs pass file + HTTP và chứng minh collectors bắt được injected console/request failure.
- [x] Feature specs fail đúng vì chưa có trigger/dialog/vendor/controller.
- [x] Test matrix chứa exact title/name, all controls, state/history/race/error/responsive/scope contracts.
- [x] Nested USB-like path, offline network và external-request guard có trong harness.
- [x] Không production/docs/generated file bị sửa.
- [x] Không placeholder/TODO hoặc unresolved product choice trong test plan.