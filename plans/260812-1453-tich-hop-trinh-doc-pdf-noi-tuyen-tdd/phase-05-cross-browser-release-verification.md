---
phase: 5
title: "Chốt cross-browser, release và tài liệu"
status: completed
priority: P1
effort: ""
dependencies: [4]
---

# Phase 5: Chốt cross-browser, release và tài liệu

## Tổng quan

Chạy browser/release matrix trên file, USB-like nested path và static HTTP; xác nhận artifact/provenance/licenses, existing regressions và tài liệu phát hành. Không sửa package release 20260701; chỉ tạo package mới ở release workflow sau khi mọi gate GREEN.

## Release matrix

| Axis | Cases | Oracle |
|---|---|---|
| Transport | direct root `file://`; live Chrome USB copy path có dấu/khoảng trắng; HTTP root; HTTP nested subdirectory | cùng UI/title/page/text/download, no external request/import; relative paths đúng. |
| Engine | Playwright Chromium, Firefox, WebKit; installed Chrome và Edge smoke | exact public contracts, zero unexpected console/page errors. |
| Viewport | 1440×900, 1024×768, 768×1024, 390×844, 320×568, 844×390 | no body/header/toolbar overflow; all controls visible/≥44 px; only document pans. |
| Theme/motion | dark, light, switch while open, reduced motion | chrome follows tokens, PDF not inverted, no prohibited motion. |
| Close paths | Back button, Close icon, Escape, Browser Back | one sentinel; same hash; scroll ±2 px; focus/DOM/sidebar/quiz/sim/storage preserved. |
| State/race | first/last/invalid page; min/max/fit; 10 rapid actions; 3 reopen cycles | final-request wins; no duplicate listener/script/dialog/task. |
| Fault | delayed runtime/data; missing/corrupt PDF/data; worker rejected; close during load; retry | explicit alert/recovery, never blank/trapped. |
| Offline | browser network offline after local navigation | viewer/read/download/retry local only; no CDN/native fallback. |
| Scope | DOM/control inventory + storage/hash snapshots | no print/search/thumbnails/annotation/bookmarks/route/sync/key. |

Automated WebKit là engine signal, không thay manual Safari nếu release target sau này có macOS. Direct `file://` được chạy trên Chromium/Firefox/WebKit và installed Chrome/Edge; USB copy path có dấu/khoảng trắng được smoke bằng live Chrome DevTools vì Playwright sandbox chặn subresource ngoài working tree.

## Artifact/release contract

Runtime ship list bổ sung:

- `CoHocLyThuyet.pdf`.
- `js/pdf-viewer.js`.
- `lib/pdfjs/pdfjs-runtime.iife.min.js`, `pdf-data.js`, selected worker artifact nếu proof GREEN.
- `lib/pdfjs/LICENSE`, `provenance.json`, shipped CMap/font/WASM/ICC assets + licenses.
- Existing `index.html`, `css/`, `js/`, `lib/`, `chapters/`, `images/`, quiz data.

Không ship `node_modules/`, `tests/`, `tools/`, `plans/`, source build entries, temp copies hoặc screenshots, nhất quán với `docs/deployment-guide.md:42-53`. Không chỉnh `release/GiaoTrinhDienTu_CoHocLyThuyet_release_20260701/` hay `.rar`; package mới dùng ngày phát hành thực tế.

Release được tạo ngày 2026-08-12:

- `release/GiaoTrinhDienTu_CoHocLyThuyet_release_20260812/`.
- `release/GiaoTrinhDienTu_CoHocLyThuyet_release_20260812.rar`.
- 342 runtime files; archive/folder exact checksum parity.
- RAR SHA-256: `4c96ca48115ff711866ae63f77209bdbb79b83fec3f9a0c2623fd2f3af0f6e65`.

`pdf-vendor-contract.test.js` phải fail nếu missing file, version/build/hash mismatch, decoded PDF mismatch, license/provenance thiếu, remote URL/runtime import còn tồn tại, hoặc committed artifact không khớp deterministic rebuild.

## Tài liệu cần cập nhật sau GREEN

| File | Nội dung |
|---|---|
| `README.md` | Cách mở `Xem bản PDF`, offline behavior, `test:pdf:*`, artifact mới; giữ runtime npm-free (`README.md:3-11`, `README.md:41-55`). |
| `docs/project-overview-pdr.md` | User outcome, strict file/HTTP parity và scope exclusions. |
| `docs/system-architecture.md` | Viewer overlay/data flow/transport/lifecycle; persistence unchanged (`docs/system-architecture.md:3-14`, `docs/system-architecture.md:43-50`). |
| `docs/code-standards.md` | Vendored/generated PDF artifact policy, build source, no hand-edit/module/CDN; generated policy hiện tại ở `docs/code-standards.md:37-51`. |
| `docs/design-guidelines.md` | Dialog/toolbar/token/focus/320 px/reduced-motion rules; baseline `docs/design-guidelines.md:3-23`, `docs/design-guidelines.md:68-75`. |
| `docs/deployment-guide.md` | Ship list, build/gates, file/HTTP/USB smoke, troubleshooting missing PDF/worker/data; baseline `docs/deployment-guide.md:25-72`. |
| `docs/project-roadmap.md` | Feature complete only after release gates. |
| `docs/project-changelog.md` | Added viewer, transport/security/accessibility contracts and vendored version. |

Docs không hứa print/search/thumbnails/annotation/bookmark/sync. Không sửa generated docs/content.

## Files liên quan

- Modify: `tools/pdf-viewer/playwright.pdf.config.cjs`, `tests/pdf-viewer.spec.js`, `tests/pdf-vendor-contract.test.js` only for additional valid matrix coverage, không nới oracle.
- Modify: `package.json`, `package-lock.json` final scripts/pins.
- Modify: eight docs listed above.
- Inspect/package: all runtime ship files; release `20260812` đã tạo ngoài old dated package.

## TDD/release ordering

1. **RED matrix gaps:** add missing engine/viewport/USB/subdirectory/fault/release assertions; confirm intended failure before fix.
2. **GREEN:** fix source/controller/CSS/build recipe only; never patch generated minified/data artifacts or tests to match bug.
3. **Refactor:** remove dead fallback/conditional worker artifacts not selected, test hooks/temp output; regenerate artifacts/provenance once.
4. Run scoped vendor/transport/browser gates, then existing regression/release/audit gates.
5. Update docs only from observed final behavior and selected topology.
6. Re-run complete release commands from clean install/build; review runtime manifest and manual installed-browser smoke.
7. Package to a new dated release only after all checkboxes pass.

## Exact commands

```powershell
npm ci
npx playwright install chromium firefox webkit
npm run build:pdf-assets
npm run test:pdf:vendor
npm run test:pdf:transport
npm run test:pdf:browser
npm run test:pdf:installed
npm run test:pdf:release
npm run test:audit:strict
python tools/audit.py --strict-images --strict-formula-image
```

Expected script composition:

- `test:pdf:vendor`: Node artifact/provenance contract.
- `test:pdf:transport`: focused file/HTTP proof fixture on core automated projects.
- `test:pdf:browser`: full viewer spec on Chromium/Firefox/WebKit.
- `test:pdf:installed`: installed Chrome và Edge smoke trên direct file, HTTP root và nested subdirectory.
- `test:pdf:release`: vendor + transport + browser + installed + existing `test:sim:release` + `test:sim3:pilot`.

## Failure modes và rollback trigger

| Failure | Signal | Response |
|---|---|---|
| Browser-specific file failure | one engine module/worker/data error | Fix classic/data baseline; do not exclude engine or require server. |
| HTTP works only at root | nested path 404/absolute URL | derive all URLs from `document.baseURI`/relative asset paths; rerun USB/subdir. |
| Offline request | remote HTTP(S) request or native viewer navigation | remove dependency/fallback; fail release. |
| Rebuild drift | hash/provenance differs | deterministic sort/options/pins; regenerate once and fail if still dirty. |
| Release omits support/license | manifest/vendor test missing | block package; copy exact licensed assets. |
| Existing app/sim regression | app/content/quiz/Sim gate fail | fix integration; do not narrow `test:pdf:release`. |
| Manual browser not available | project cannot launch | report browser unverified and block cross-browser release claim; automated results remain scoped. |
| Docs differ behavior | commands/topology/control list stale | update docs from observed final run, then consistency sweep. |

Feature rollback follows master plan: remove trigger/dialog/controller/CSS/vendor/build/tests/scripts/docs atomically; preserve root PDF, lesson runtime/generated content and old release; no iframe/native fallback.

## Success criteria

- [x] All automated transport/engine/viewport/theme/state/fault/offline/scope matrix cases pass retry-free.
- [x] Installed Chrome/Edge và Playwright Firefox direct file/HTTP smoke results are recorded; no untested browser claim.
- [x] Clean install + deterministic build reproduces committed hashes/provenance/licenses.
- [x] Runtime manifest includes every PDF runtime/support asset and excludes dev-only files.
- [x] `test:pdf:release`, strict audits and all existing app/content/quiz/Sim2/Sim3 gates pass.
- [x] Eight documentation files match selected topology, exact controls, security and release procedure.
- [x] Old dated release and all generated content remain unchanged.
- [x] No placeholder, unresolved product question or forbidden feature remains.