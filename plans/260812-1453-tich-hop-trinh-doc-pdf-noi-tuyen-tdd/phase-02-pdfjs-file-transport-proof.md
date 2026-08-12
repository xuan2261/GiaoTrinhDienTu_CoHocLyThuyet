---
phase: 2
title: "Chứng minh transport file:// và vendor PDF.js"
status: completed
priority: P1
effort: ""
dependencies: [1]
---

# Phase 2: Chứng minh transport file:// và vendor PDF.js

## Tổng quan

Chứng minh PDF thật render bằng classic/IIFE trên direct `file://` và static HTTP trước khi xây UI. Pin PDF.js, tạo deterministic build/provenance/license, wrap `CoHocLyThuyet.pdf` thành lazy JavaScript `Uint8Array`, và quyết định HTTP worker bằng proof có response định trước.

## Cơ sở quyết định

- Runtime repository là classic script, không bundler/module ở runtime: `index.html:300-370`, `docs/code-standards.md:5-10`.
- File lesson dùng inline bundle vì fetch file không đáng tin: `js/loader.js:228-242`, `docs/system-architecture.md:5-14`.
- `pdfjs-dist@6.2.108` modern/legacy đều ESM; worker tạo module worker; fake-worker mặc định còn dynamic import nếu `WorkerMessageHandler` chưa preload.
- Pin version/build `6.2.108`/`0365cbde0`; `enableScripting:false` bắt buộc.
- Primary sources: [dist](https://github.com/mozilla/pdf.js/releases/download/v6.2.108/pdfjs-6.2.108-dist.zip), [data API](https://github.com/mozilla/pdf.js/blob/v6.2.108/src/display/api.js#L87-L237), [worker source](https://github.com/mozilla/pdf.js/blob/v6.2.108/src/display/api.js#L2069-L2213), [license](https://github.com/mozilla/pdf.js/blob/v6.2.108/LICENSE).

## Artifact và adapter contract

| Artifact | Contract |
|---|---|
| `pdfjs-runtime.iife.min.js` | App adapter + PDF.js display/layer APIs + preloaded `WorkerMessageHandler`; classic IIFE, no runtime `import()`. Expose only `window.PdfTextbookRuntime`. |
| `pdf-data.js` | Chunked base64/static JS wrapper; lazy script; `getBytes()` returns exact `Uint8Array`; metadata SHA/source. |
| `pdfjs-worker.iife.min.js` | Conditional classic real-worker artifact for HTTP; retain only if all HTTP worker proofs pass. |
| Support dirs | Copy CMaps, standard fonts, WASM, ICC and their licenses until whole-document instrumentation proves safe pruning. |
| `provenance.json` | PDF.js version/build/source URL, build tool/version/command, SHA-256 input PDF + every shipped artifact, generation timestamp policy and selected topology. |
| `LICENSE` | Apache 2.0 upstream plus required third-party notices/licenses. |

`PdfTextbookRuntime.openDocument(source)` luôn ép `enableScripting:false`. `source` chỉ là `{data}` hoặc `{url, workerPort}`; output/loading/render adapter giống nhau. Controller Phase 3 không biết internals PDF.js.

## Build/provenance recipe

1. Add exact dev pins `pdfjs-dist: "6.2.108"` và exact `esbuild` version vào `package.json`/lock; runtime release không ship `node_modules`.
2. `tools/pdf-viewer/pdfjs-entry.mjs` import display/layer APIs từ pinned package và `WorkerMessageHandler`; assign adapter + `globalThis.pdfjsWorker.WorkerMessageHandler` before `getDocument`.
3. `tools/pdf-viewer/build-assets.mjs` bundle entry thành `format=iife`, browser target đã ghi trong provenance, minified, không sourcemap/runtime chunk/import.
4. Build optional worker entry thành self-contained classic worker; HTTP tạo `Worker` và gán `GlobalWorkerOptions.workerPort`. Không dùng module worker.
5. Đọc root `CoHocLyThuyet.pdf`, SHA-256, encode deterministic fixed-size chunks vào `pdf-data.js`; decoder cấp đúng một `Uint8Array` cho phiên.
6. Copy license/support dirs local, rồi emit sorted deterministic `provenance.json` và artifact hashes. Không sửa generated artifact tay.
7. `pdf-vendor-contract.test.js` decode bytes và compare SHA với source; assert version/build/license/no remote URL/no module bootstrap; verify regenerate cho cùng hashes (trừ field thời gian nếu có, tốt nhất bỏ timestamp biến động).

## Files liên quan

- Create: `tools/pdf-viewer/build-assets.mjs`, `tools/pdf-viewer/pdfjs-entry.mjs`, conditional `pdfjs-worker-entry.mjs`.
- Create: `lib/pdfjs/pdfjs-runtime.iife.min.js`, `pdf-data.js`, conditional worker, `LICENSE`, `provenance.json`, support dirs/licenses.
- Create: `tests/fixtures/pdf-transport-proof.html` — permanent focused fixture dùng exact shipped runtime/adapter, không copy renderer.
- Modify: `package.json`, `package-lock.json`; add `build:pdf-assets`, `test:pdf:vendor`, `test:pdf:transport`.
- Source only: `CoHocLyThuyet.pdf` remains unchanged.

## TDD ordering

1. **RED:** enable Phase-1 vendor/transport groups. Expected failures: package pin/artifact/license absent; page 1 not rendered in fixture.
2. **GREEN file baseline:** build IIFE + data wrapper; preload handler; `getDocument({data,enableScripting:false})`; render page 1/text layer in direct file path with no network/import.
3. **GREEN HTTP baseline:** first prove same data/fake path under HTTP. Then test URL + classic real worker. Keep optimization only if page/text/output/error contracts equal across Chromium/Firefox/WebKit and version/CSP checks pass.
4. **Refactor:** one adapter/render path; isolate only source/worker selection; deterministic builder; delete unused worker artifact/entry if optimization rejected.
5. Run vendor + transport gates; full viewer specs remain RED until Phases 3–4.

```powershell
npm run build:pdf-assets
npm run test:pdf:vendor
npm run test:pdf:transport
```

## Failure modes

| Failure | Signal | Response |
|---|---|---|
| Runtime still contains ESM import | file CORS/module error hoặc static test match | Fix bundle entry/external config; artifact không được ship. |
| Fake worker tries dynamic import | warning/error references worker `.mjs`/import | Ensure preloaded global handler before document creation; prove no worker asset request in file mode. |
| HTTP real worker fails | worker/CSP/version/browser divergence | Delete branch/artifact; select universal data/fake topology. |
| Version mismatch | PDF.js API/worker mismatch | Main/worker build from same lock/install; hash gate fail closed. |
| Wrapped bytes stale/corrupt | decoded SHA differs source hoặc page count/render fail | Regenerate only through build script; never hand-patch. |
| Base64 memory/jank | close/status probe stalls; duplicate decoded buffers | Lazy script/decode, one active document, release bytes/tasks on close; no eager decode. |
| Support asset missing | glyph/image warnings on page sweep | Keep full relevant dirs/licenses; pruning deferred until measured proof, not assumption. |
| License/provenance incomplete | file/hash/source/version absent | Fail vendor/release gate; artifact cannot ship. |

## Success criteria

- [x] Package lock pins exactly PDF.js 6.2.108 and one exact build tool version.
- [x] File fixture renders page 1 + text layer from IIFE/wrapped bytes, offline, no runtime import/worker request.
- [x] HTTP renders through same adapter/UI primitives; real worker retained only after full proof, otherwise universal baseline selected.
- [x] `enableScripting:false` is enforced by adapter, not optional caller behavior.
- [x] Decoded PDF SHA equals root source; artifact regeneration is deterministic.
- [x] Licenses/provenance/support asset inventory complete.
- [x] No production shell/controller or generated textbook output modified yet.