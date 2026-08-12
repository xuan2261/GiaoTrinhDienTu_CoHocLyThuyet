---
title: "Tích hợp trình đọc PDF nội tuyến theo TDD"
description: "Trình đọc CoHocLyThuyet.pdf toàn màn hình, offline-first, cùng PDF.js renderer/UI trên file:// và static HTTP, không làm mất ngữ cảnh bài học."
status: completed
priority: P1
effort: ""
tags: [feature, frontend, pdf, offline, accessibility, tdd]
blockedBy: []
blocks: []
created: "2026-08-12"
---

# Tích hợp trình đọc PDF nội tuyến theo TDD

## Tổng quan

Thêm nút topbar có accessible name **`Xem bản PDF`**. Nút mở native `<dialog>` toàn màn hình, heading đúng tuyệt đối **`Giáo trình Cơ học lý thuyết - Bản PDF`**, render `CoHocLyThuyet.pdf` bằng PDF.js vendored. Controls: quay lại, đóng, trang trước/sau, nhập trang kèm tổng số, zoom −/+, vừa chiều rộng, tải xuống.

Cùng một shell/state/render pipeline chạy offline trong hai topology:

- `file://`/USB: classic/IIFE build sẵn, preload `WorkerMessageHandler` để fake-worker là baseline; lazy-load JavaScript-wrapped PDF rồi tạo `Uint8Array`; không runtime module import.
- Static HTTP: được dùng PDF URL + real worker local chỉ khi proof GREEN. Nếu fail, dùng đúng data/fake-worker baseline; không đổi renderer/UI, không hạ acceptance.

Viewer là overlay tạm thời, không phải route: không đổi hash/`#content-area`, không gọi `loadPage()`, không dispose simulation, không ghi localStorage mới.

## Phạm vi bị khóa

**Có:** local PDF.js `6.2.108`, `enableScripting: false`, license/provenance; navy-gold dark/light; 320 px; keyboard/focus/inert/Escape/Browser Back/reduced motion; loading/error/retry; canvas + text/structure layer; bảo toàn DOM/hash/scroll/focus/sidebar/quiz/simulation và `theme`, `fontZoom`, `quizScores`, `chlyt_progress`, `chlyt_bookmarks`, `chlyt_notes`.

**Không:** print, PDF search, thumbnails, annotation/editor, PDF bookmarks, outline, rotate, deep-link/sync PDF↔HTML, iframe/native PDF viewer, CDN, runtime framework/bundler/module/server bắt buộc. Không sửa generated `chapters/`, `images/`, `js/pages.js`, canonical DOCX hoặc release 20260701. Tránh `js/loader.js`/`js/app.js`; chỉ re-plan touchpoint nếu RED proof có bằng chứng chặn.

## Baseline và điểm neo hiện tại

| Điểm neo | Citation | Quyết định |
|---|---|---|
| Static HTML/CSS/JS, file và HTTP | `README.md:3-11` | Runtime mới tự đủ asset local; npm chỉ build/QA. |
| Topbar/menu/search/theme/font/breadcrumb | `index.html:18-39` | Trigger sau search, trước theme. |
| Script classic tuần tự | `index.html:300-370` | Eager controller nhỏ; heavy PDF.js/data lazy sau click. |
| Token dark/light và topbar | `css/style.css:10-37`, `css/style.css:53-82` | Namespace viewer, tái dùng token navy-gold. |
| Sidebar overlay z-index 140 | `css/style.css:717-725` | Không tái dùng; native dialog dùng top layer. |
| Breakpoint hiện hữu | `css/style.css:1147-1162`, `css/style.css:1606-1622` | Compact trigger; viewer không overflow ở 320 px. |
| Route state/sim dispose | `js/loader.js:19-150` | Không thêm PDF vào `PAGE_MAP`/`currentPageId`. |
| `loadPage()` đổi hash/DOM/scroll/sim | `js/loader.js:170-217`, `js/loader.js:247-274` | Dedicated PDF route bị loại. |
| Offline lesson ưu tiên bundle | `js/loader.js:228-242` | Wrapped bytes là transport file-mode tương ứng. |
| Theme/font persistence | `js/app.js:204-220`, `js/app.js:303-323` | PDF zoom chỉ là session state. |
| Progress đọc hash/observe content | `js/progress.js:18-35`, `js/progress.js:122-151` | Giữ hash và content node identity. |
| Simulation/persistence contracts | `docs/system-architecture.md:19-50` | Không remount/dispose; snapshot state trước/sau. |
| File-mode browser precedent | `tests/content-only-smoke.spec.js:1-45`, `tests/sim2-ch1-integration.spec.js:8-49` | Test production `index.html`, console/page errors, sim identity. |
| QA Node + Playwright | `package.json:6-28`, `playwright.config.cjs:1-12` | Gate PDF dev-only riêng. |
| Release artifact/local structure | `docs/deployment-guide.md:42-53` | Ship PDF/bundle/data/support/license; không sửa release cũ. |

Nguồn PDF hiện hữu: `CoHocLyThuyet.pdf` (binary; không có line citation).

## Hợp đồng công khai

| Contract | Giá trị |
|---|---|
| Trigger | `<button type="button" data-pdf-viewer-open>`, name `Xem bản PDF`, target ≥44×44 px. |
| Dialog | `#pdf-viewer-dialog`, native modal, `aria-labelledby="pdf-viewer-title"`. |
| Title | `#pdf-viewer-title`: `Giáo trình Cơ học lý thuyết - Bản PDF`. |
| Close | `Quay lại giáo trình`, `Đóng trình đọc PDF`, Escape, Browser Back cùng lifecycle idempotent. |
| Pages | `Trang trước`, label input `Đi đến trang`, `/ N`, `Trang sau`; disabled thật ở biên. |
| Zoom | 50%–300%, bước 25%; `Thu nhỏ`, output %, `Phóng to`, `Vừa chiều rộng`. |
| Download | Blob từ `PDFDocumentProxy.getData()`/loaded bytes; filename `CoHocLyThuyet.pdf`. |
| Status | polite live loading/page status; alert cho error. |

Runtime contracts:

- `js/pdf-viewer.js`: eager classic controller, bind một lần, lazy-load heavy assets.
- `lib/pdfjs/pdfjs-runtime.iife.min.js`: `window.PdfTextbookRuntime`, pin version/build, adapter document/render/layers/worker; app adapter + PDF.js bundled thành IIFE.
- `lib/pdfjs/pdf-data.js`: `window.PdfTextbookData.getBytes(): Uint8Array` + SHA-256/source metadata.
- File mode gọi `getDocument({data, enableScripting:false})` với preloaded `WorkerMessageHandler`; HTTP chỉ khác source/worker, mọi state/render phía sau giống hệt.
- Mỗi open có generation token; tối đa một loading task/document/page/render/canvas. Cancel render cũ trước khi tái dùng canvas.
- Close cancel/destroy/revoke, unlock scroll, consume đúng một history sentinel, restore scroll/focus. Cache script Promise, không duplicate listener/script/dialog.
- Không route/global state/localStorage contract mới.

## Data flow

```text
click trigger
 -> snapshot focus/scroll/hash/content/state
 -> showModal + focus heading + body lock + push 1 history sentinel
 -> loadScriptOnce(pdfjs-runtime.iife.min.js)
 -> file: loadScriptOnce(pdf-data.js) -> Uint8Array -> fake worker
    http: URL + local real worker only if proof passes; else same file baseline
 -> getDocument(enableScripting:false) -> getPage
 -> cancel stale task -> canvas + text/structure layer -> live status
 -> controls -> same renderCurrentPage state machine
 -> close/Escape/Back -> one cleanup path -> restore lesson exactly
```

PDF.js dist 6.2.108 modern/legacy đều là ESM, nên không load dist nguyên trạng qua `file://`. Nguồn: [release](https://github.com/mozilla/pdf.js/releases/tag/v6.2.108), [`getDocument({data})`](https://github.com/mozilla/pdf.js/blob/v6.2.108/src/display/api.js#L87-L237), [worker/fake-worker](https://github.com/mozilla/pdf.js/blob/v6.2.108/src/display/api.js#L2069-L2213), [fake-worker import path](https://github.com/mozilla/pdf.js/blob/v6.2.108/src/display/api.js#L2291-L2387), [license](https://github.com/mozilla/pdf.js/blob/v6.2.108/LICENSE).

## Dependency graph và phases

```text
P1 Contract/RED -> P2 Transport/vendor -> P3 Shell/lifecycle
                -> P4 Controls/resilience -> P5 Browser/release/docs
```

| # | Phase | Status | Depends on |
|---|---|---|---|
| 1 | [Khóa hợp đồng và dựng RED harness](./phase-01-start.md) | Completed | — |
| 2 | [Chứng minh transport file:// và vendor PDF.js](./phase-02-pdfjs-file-transport-proof.md) | Completed | 1 |
| 3 | [Xây shell viewer và lifecycle bảo toàn ngữ cảnh](./phase-03-viewer-shell-and-lifecycle.md) | Completed | 2 |
| 4 | [Hoàn thiện controls, accessibility và resilience](./phase-04-reader-controls-and-resilience.md) | Completed | 3 |
| 5 | [Chốt cross-browser, release và tài liệu](./phase-05-cross-browser-release-verification.md) | Completed | 4 |

Mỗi phase theo `RED -> xác nhận fail đúng lý do -> GREEN tối thiểu -> refactor -> scoped gate -> regression gate`; không GREEN bằng iframe/CDN/server requirement.

## File dự kiến

**Tạo:** `js/pdf-viewer.js`; `lib/pdfjs/{pdfjs-runtime.iife.min.js,pdf-data.js,LICENSE,provenance.json}`; real-worker artifact chỉ nếu proof pass; support dirs `cmaps/`, `standard_fonts/`, `wasm/`, `iccs/`; `tools/pdf-viewer/{build-assets.mjs,pdfjs-entry.mjs,pdfjs-worker-entry.mjs,playwright.pdf.config.cjs}`; `tests/fixtures/pdf-transport-proof.html`; `tests/pdf-vendor-contract.test.js`; `tests/pdf-viewer.spec.js`.

**Sửa:** `index.html`, `css/style.css`, `package.json`, `package-lock.json`; sau GREEN cập nhật `README.md`, `docs/{project-overview-pdr,system-architecture,code-standards,design-guidelines,deployment-guide,project-roadmap,project-changelog}.md`.

**Không sửa:** `js/app.js`, `js/loader.js` theo thiết kế mặc định; mọi generated content và dated release cũ.

## Test matrix và lệnh đích

| Gate | Matrix | Lệnh |
|---|---|---|
| Vendor | pin/build/hash/license/no runtime import-CDN/support assets | `npm run test:pdf:vendor` |
| Transport | file + HTTP; page 1/text layer; fake baseline; HTTP worker nếu có | `npm run test:pdf:transport` |
| Behavior/lifecycle | controls/races/download/error; close/Escape/Back; hash/scroll ±2px/DOM/focus/sidebar/quiz/sim/storage | `npm run test:pdf:browser` |
| Responsive/theme | 1440×900, 1024×768, 768×1024, 390×844, 320×568, 844×390; dark/light/reduced-motion | cùng browser gate |
| Engines | Chromium, Firefox, WebKit; installed Chrome và Edge release smoke | `npm run test:pdf:browser`; `npm run test:pdf:installed` |
| Regression/release | PDF + installed browser + app/content/quiz/Sim2/Sim3 | `npm run test:pdf:release` |

```powershell
npm ci
npm run build:pdf-assets
npm run test:pdf:vendor
npm run test:pdf:transport
npm run test:pdf:browser
npm run test:pdf:installed
npm run test:pdf:release
npm run test:audit:strict
python tools/audit.py --strict-images --strict-formula-image
```

`test:pdf:release` chain vendor, transport, browser, installed Chrome/Edge, `test:sim:release`, `test:sim3:pilot`.

## Failure modes và phản ứng

| Failure | Signal | Response |
|---|---|---|
| file ESM/worker/data blocked | CORS/module/import error, page 1 absent | IIFE + preloaded handler + wrapped bytes; không server/flag. |
| HTTP real worker fails/diverges | worker/CSP/version error | Bỏ branch/artifact, dùng same data/fake baseline. |
| Version/hash mismatch | API/worker mismatch hoặc decoded SHA lệch PDF | Fail build/release; regenerate từ pinned `6.2.108`, build `0365cbde0`. |
| Rare glyph/image support thiếu | warning/glyph/page sweep sai | Giữ CMap/font/WASM/ICC + licenses; chỉ prune sau proof toàn PDF. |
| Jank/race | close không phản hồi, stale page/canvas error | bounded single-page work; cancel + token; thử local worker nhưng giữ fake baseline. |
| Context bị phá | hash/node/storage/sim đổi, scroll >2px | Loại loader calls; sửa lifecycle trước merge. |
| History double-pop | close rồi Back bỏ qua lesson | One sentinel/one popstate owner/idempotent close. |
| 320 px overflow | scrollWidth > clientWidth/target <44px | wrap two rows; compact visual labels; chỉ document viewport pan. |
| Blank/error stale callback | blank canvas, retry/back unusable | explicit status; cancel/destroy/token; back/download luôn usable. |

## Rủi ro phối hợp

Plan pending `plans/260713-1524-fix-all-sim2-sim3-defects-deep-tdd/plan.md` cũng chạm production `index.html`/loader integration (`plan.md:36-49` của plan đó). Đây là **coordination/merge risk**, chưa phải blocking dependency vì viewer không đổi loader/sim contract; giữ `blockedBy`/`blocks` rỗng và không sửa plan Sim. Trước Phase 3 phải đọc diff mới nhất, reconcile script/CSS order, rồi chạy cả PDF và Sim gates. Chỉ thêm dependency nếu có bằng chứng một phase cần output chưa hoàn thành của plan kia.

## Rollback

Gỡ trigger/dialog/controller/CSS namespace; xóa `js/pdf-viewer.js`, `lib/pdfjs/**`, `tools/pdf-viewer/**`, PDF tests/scripts/devDependencies và cập nhật lock; hoàn nguyên phần docs PDF. Giữ root PDF, lesson runtime, generated content và release 20260701. Không để iframe/native-viewer fallback hoặc shim.

## Tiêu chí thành công

- [x] Trigger/name và dialog/title đúng tuyệt đối.
- [x] Cùng PDF.js IIFE/UI render thật offline trên file/USB và HTTP; `enableScripting:false`; không runtime module/CDN.
- [x] Đủ controls, keyboard/a11y/status/text layer, dark/light/reduced-motion và 320 px.
- [x] Hash, DOM, scroll ±2 px, focus, sidebar, quiz, simulation và sáu key storage giữ nguyên.
- [x] Rapid actions, close-during-load, missing/corrupt asset, retry/reopen không stale task/listener/blank state.
- [x] Không có print/search/thumbnails/annotation/bookmarks/route/sync/persistence ngoài scope.
- [x] Hash/provenance/licenses/support assets/release manifest và all regression gates pass.

## Câu hỏi mở

Không có câu hỏi sản phẩm. HTTP worker và support-asset pruning là proof gate kỹ thuật với phản ứng định trước.