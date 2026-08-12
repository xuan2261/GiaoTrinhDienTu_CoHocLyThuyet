---
phase: 3
title: "Xây shell viewer và lifecycle bảo toàn ngữ cảnh"
status: completed
priority: P1
effort: ""
dependencies: [2]
---

# Phase 3: Xây shell viewer và lifecycle bảo toàn ngữ cảnh

## Tổng quan

Tích hợp trigger topbar, native full-screen dialog và controller lifecycle. Dialog mở tức thì rồi lazy-load runtime/PDF, đóng bằng bốn đường nhưng chỉ có một cleanup path; lesson bên dưới giữ nguyên DOM/hash/scroll/focus/sidebar/quiz/simulation/localStorage.

## Existing anchors

- Topbar markup: `index.html:18-39`; đặt trigger sau `.search`, trước `#themeBtn`.
- Script include order: `index.html:300-370`; add `js/pdf-viewer.js` classic sau feature shell scripts, không import/module.
- Tokens/topbar: `css/style.css:10-82`; responsive: `css/style.css:1147-1162`, `css/style.css:1606-1622`.
- Existing `.overlay` chỉ cho sidebar: `index.html:41-42`, `css/style.css:717-725`; không reuse.
- Route-changing side effects: `js/loader.js:140-150`, `js/loader.js:170-217`, `js/loader.js:247-274`; controller không gọi các symbols này.
- Theme/localStorage: `js/app.js:204-220`, `js/app.js:303-323`; progress hash observer: `js/progress.js:122-151`.

## Shell contract

- Topbar button: `type=button`, `data-pdf-viewer-open`, accessible name `Xem bản PDF`, local decorative SVG; desktop shows full label, 481–900 shows `PDF`, ≤480 may icon-only, name unchanged; target ≥44 px.
- Top-level `#pdf-viewer-dialog` native `<dialog>` outside `#content-area`; `aria-labelledby=pdf-viewer-title`.
- `#pdf-viewer-title` text exactly `Giáo trình Cơ học lý thuyết - Bản PDF`, focusable programmatically.
- Header exposes `Quay lại giáo trình`, `Tải xuống bản PDF` placeholder-disabled until Phase 4, and icon `Đóng trình đọc PDF`.
- Body contains status/error host and document viewport; Phase 4 fills toolbar/render controls.
- Native `showModal()` supplies top-layer/modal background inert behavior; tests confirm background unreachable. No custom z-index scrim.

## Lifecycle state machine

```text
closed
 -> opening: save trigger, scrollY, hash, content node, lesson state
             push one {pdfViewer:true, token} same-URL history entry
             add scroll lock, showModal, focus title
 -> loading: loadScriptOnce(runtime); select transport; loading task
 -> ready/error
 -> closing: idempotent guard; cancel loading/render; destroy doc/worker;
             revoke URLs; close dialog; unlock body
             consume sentinel exactly once; restore scroll + trigger focus
 -> closed
```

Rules:

- Delegated document click handles any `[data-pdf-viewer-open]`; bind once.
- `runtimePromise` and `dataPromise` cache successful lazy script loads; failure clears rejected promise so Retry can reload. Reopen never inserts duplicate script/listener/dialog.
- Save focus immediately before open. Focus heading after `showModal()`, then natural DOM order: Back → Download → Close → future controls.
- `cancel` event intercepts Escape and calls same close request.
- Open pushes exactly one same-URL history sentinel without hash mutation. Browser Back `popstate` closes directly. UI/Escape close calls `history.back()` only when current sentinel belongs to the active token; popstate performs cleanup. Fallback direct cleanup only if sentinel is already absent.
- Body lock preserves scrollbar geometry and recorded `scrollY`; close restores within ±2 px.
- Do not serialize lesson state for restoration: DOM remains mounted. Snapshots only verify invariants.
- Close during loading invalidates generation before async cleanup so callbacks cannot mutate closed/reopened dialog.

## Files liên quan

- Modify: `index.html` — one trigger, one top-level dialog shell, one controller script include.
- Modify: `css/style.css` — `.pdf-viewer-*` namespace, topbar trigger, dialog shell, focus-visible, body lock, dark/light and 320 px layout.
- Create: `js/pdf-viewer.js` — shell/lifecycle/lazy loader/history/context controller.
- Consume unchanged: Phase-2 `lib/pdfjs/**` artifacts and root PDF.
- Avoid: `js/app.js`, `js/loader.js`, generated files.

## TDD ordering

1. **RED:** run open/title/lazy/context/close/history/focus specs. Confirm exact failures are absent trigger/dialog/controller.
2. **GREEN shell:** add semantic trigger/dialog and CSS; open dialog synchronously; title/name/focus/inert specs pass before loading finishes.
3. **GREEN lifecycle:** implement one-time binding/lazy Promise, state machine, history sentinel, cancellation and context restore. Make button/Escape/Back variants pass independently.
4. **GREEN first render handoff:** call Phase-2 adapter and display page 1/status with the same source selector; full controls remain RED for Phase 4.
5. **Refactor:** centralize `requestClose(reason)`/`finalizeClose(token)`, generation guard and script loader; remove duplicated close paths and unused state.
6. Run scoped browser project then existing app/sim integration smoke.

```powershell
npm run test:pdf:transport
npm run test:pdf:browser -- --project=pdf-chromium --grep "open|lifecycle|context|history"
npm run test:app
npm run test:sim:mount
```

## Failure modes

| Failure | Signal | Response |
|---|---|---|
| Trigger crowds search | overlap/overflow at 900/480/320 | Compact only visual label; preserve search/trigger/theme and 44 px target; hide redundant brand text first. |
| Dialog under notes/glossary | background popup appears above | Native modal top layer; close transient popup on open only if test proves it remains interactive. |
| Focus leaks/background usable | Tab reaches topbar/sidebar or a11y tree exposes interactive background | Fix dialog semantics/focus order; no div-overlay fallback. |
| Escape conflicts with search | Escape closes search but not viewer | Dialog `cancel` owns Escape while open; outside viewer existing behavior unchanged. |
| Double history pop | close then Back skips lesson | Active-token sentinel + one popstate owner + idempotent cleanup. |
| Scroll jump/layout shift | restore >2 px or content shifts when scrollbar removed | Record scroll/scrollbar compensation before lock; restore after close. |
| Lesson remount/dispose | content node/sim SVG identity changes | Remove loader/hash calls; viewer remains top-level sibling. |
| Async callback after close | stale loading/error appears on reopened dialog | Increment generation before cancel/destroy; token-check every continuation. |
| Reopen duplicates | multiple scripts/listeners/dialogs/network loads | cache successful promises, clear only failures, assert DOM/request counts. |

## Success criteria

- [x] Exact trigger name/title and one native modal pass at all breakpoints.
- [x] Shell appears/focuses immediately before heavy PDF load completes.
- [x] Back, Close, Escape and Browser Back share idempotent cleanup and restore trigger focus.
- [x] One history sentinel closes viewer before lesson navigation; hash never changes.
- [x] DOM identity, scroll ±2 px, sidebar, quiz/sim state and six storage keys remain unchanged.
- [x] Close-during-load/reopen produces no stale callbacks, duplicate assets/listeners/dialogs.
- [x] First page hands off to Phase-2 renderer in both transports.
- [x] `js/app.js`, `js/loader.js` and generated content remain untouched.