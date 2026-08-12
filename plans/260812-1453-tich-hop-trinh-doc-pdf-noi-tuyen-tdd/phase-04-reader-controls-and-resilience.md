---
phase: 4
title: "Hoàn thiện controls, accessibility và resilience"
status: completed
priority: P1
effort: ""
dependencies: [3]
---

# Phase 4: Hoàn thiện controls, accessibility và resilience

## Tổng quan

Hoàn thiện single-page renderer, controls và loading/error/retry. Khóa render race, cleanup, accessibility, dark/light, reduced motion và responsive 320 px; không thêm print/search/thumbnails/annotation/bookmarks.

## Contract

### Trang, zoom, download

- Metadata ready: current=1, total=`pdfDocument.numPages`; Previous disabled ở 1, Next disabled ở N.
- Input `Đi đến trang`, numeric, min=1/max=N. Noninteger giữ current + báo lỗi; ngoài biên clamp 1..N + announce.
- `PageUp`/`PageDown` chỉ khi focus document viewport, không intercept input/button.
- Zoom 50%–300%, bước 25%; controls disabled thật ở min/max. Fit-width tính từ host/page width và recalculates on resize; manual zoom rời fit mode.
- DPR-aware canvas nhưng CSS dimensions ổn định; chỉ document viewport pan khi zoom vượt width.
- Một render task/canvas active; generation++ và `RenderTask.cancel()` trước reuse. 10 rapid actions chỉ commit final request.
- Render canvas + PDF.js text/structure layer; canvas không là nội dung duy nhất. Không annotation/editor UI.
- Download dùng `pdfDocument.getData()`/loaded bytes → Blob `application/pdf` → filename `CoHocLyThuyet.pdf`; same behavior file/HTTP; revoke URL.

### Loading/error/retry

- Shell hiện ngay với polite status `Đang mở CoHocLyThuyet.pdf…`; page/zoom disabled; back/close và download khi source available vẫn dùng được.
- Chỉ hiện progress thật từ callback; không fake %. Giữ layout, không blank canvas.
- Error: `role=alert`, heading `Không thể mở bản PDF`, mô tả không lộ local path/stack; actions `Thử lại`, `Tải tệp PDF`, `Quay lại giáo trình`.
- Retry destroy/cancel phiên lỗi, increment token, clear rejected asset promise, start clean. Close during load/render immediate; late callbacks ignored.

### A11y/responsive/theme

- DOM/tab order: Back → Download → Close → Previous → page input → Next → Zoom out → Zoom in → Fit width; visual order giống DOM.
- Native modal giữ Tab/Shift+Tab; initial focus heading; all controls named, focus-visible, ≥44×44 px.
- Live announce `Trang X trên N` sau commit, không spam intermediate zoom.
- Theme chrome dùng root tokens; PDF page giữ màu/nền gốc, không invert.
- 320 px toolbar wraps, no body/header/toolbar overflow; `100dvh` + safe-area. Chỉ document viewport được pan.
- Reduced motion: bỏ slide/scale/spinner/smooth-scroll/crossfade; giữ static status.

## Architecture

```text
state {page,total,zoom,fit,status,generation,loadingTask,document,pageProxy,renderTask,blobUrls}
setPage/setZoom/fit/resize
 -> normalize -> generation++ -> cancel old
 -> getPage -> compute viewport/DPR -> canvas + text/structure render
 -> token current ? commit controls/status : discard
failure -> error state
retry/close -> destroySession -> new token / Phase-3 close
```

Existing anchors: design tokens `css/style.css:10-37`; responsive `css/style.css:1147-1162`, `css/style.css:1606-1622`; reduced-motion precedent `css/style.css:2070-2073`; persisted font zoom `js/app.js:303-323`; fixed state keys `docs/code-standards.md:49-51`.

## Files

- Modify: `js/pdf-viewer.js` — render queue, controls, download, loading/error/retry/resize/cleanup.
- Modify: `index.html` — complete semantic toolbar/status/error markup; no route.
- Modify: `css/style.css` — page/text layers, responsive/focus/disabled/status/error/reduced-motion/print exclusion.
- Modify: `tests/pdf-viewer.spec.js` — GREEN existing contracts, không đổi expected.

## TDD ordering

1. **RED pages:** boundaries/input/current-total/live status; GREEN minimal page state/render.
2. **RED zoom/race:** min/max/fit/resize/rapid actions; GREEN one scheduler + cancel/token; refactor all entry points through it.
3. **RED download:** assert Playwright download filename/content SHA in both transports; GREEN Blob/revoke.
4. **RED resilience:** delayed/missing/corrupt asset, close-during-load, retry/reopen; GREEN explicit state reducer/cleanup.
5. **RED a11y/responsive:** keyboard/inert/live text/overflow/touch/theme/reduced-motion; GREEN semantics/CSS without new controls.
6. **Refactor:** deduplicate transitions/DOM writes/cleanup; remove debug/test hooks; run behavior then app/sim regressions.

```powershell
npm run test:pdf:browser -- --project=pdf-chromium
npm run test:pdf:browser -- --project=pdf-firefox
npm run test:app
npm run test:sim:mount
```

## Failure modes

| Failure | Signal | Response |
|---|---|---|
| Concurrent/stale render | canvas reuse error/stale flash | Cancel/await + generation guard. |
| Fit resize loop/overflow | repeated resize, scrollWidth excess | Observe host only; rounded delta guard; wrap controls. |
| DPR memory spike | oversized backing canvas/OOM | Cap DPR/dimensions; one current page; destroy old task/page. |
| Invalid input renders wrong page | 0/NaN/out-of-range | parse once, reject noninteger, clamp bounds, announce. |
| Download diverges | navigation/wrong bytes | always Blob, assert SHA/name. |
| Canvas-only | no selectable/a11y text | text + structure layer mandatory. |
| Blank error/retry duplicates | no alert/actions; duplicate requests/canvas | explicit reducer; destroy + token + count assertions. |
| Dark mode changes PDF | formulas/images inverted | theme chrome only. |
| PDF zoom changes lesson | `fontZoom`/root size changed | session-only state; storage regression fails. |

## Success criteria

- [x] Page/input/boundary and zoom/fit/resize contracts pass.
- [x] Rapid actions never commit stale render; one active task/canvas.
- [x] Download exact bytes/name works in both transports and URLs are revoked.
- [x] Canvas + text/structure layer, live status, keyboard order/focus pass.
- [x] Loading/error/missing/corrupt/retry/close-during-load remain closable/recoverable.
- [x] Dark/light/reduced-motion and viewport matrix to 320×568 have no shell/body overflow; targets ≥44 px.
- [x] No print/search/thumbnails/annotation/bookmarks/sync/persistence added.
- [x] Phase-3 context/lifecycle gates remain GREEN.