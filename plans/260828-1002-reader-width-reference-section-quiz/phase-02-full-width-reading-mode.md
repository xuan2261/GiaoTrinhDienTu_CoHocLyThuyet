---
phase: 2
title: "Chế độ chiều rộng đọc"
status: completed
priority: P1
effort: ""
dependencies: []
---

# Phase 2: Chế độ chiều rộng đọc

## Overview

Thêm lựa chọn “Tiêu chuẩn/Rộng” cho vùng nội dung. Default và reading-width hiện tại không đổi; wide mode chỉ bỏ cap của `.content-area`, giữ gutter, media ratio, simulation cap và responsive behavior.

## Context Links

- [Codebase evidence](./reports/codebase-evidence-and-recommendations.md)
- `css/style.css:425-443`: main/content width.
- `index.html:20-56`: topbar controls.
- `js/app.js:248-272`, `303-322`: theme/font preference pattern.
- `tests/accessibility-zoom-reflow.spec.js:46-83`: 200%/400% no-overflow contracts.

## Requirements

- Functional:
  - Button `#contentWidthBtn` switches `standard|wide` and exposes `aria-pressed`, label/title in Vietnamese.
  - State is stored in `localStorage.contentWidth`, normalized/applied in `<head>` before CSS first paint, then survives route changes and reload.
  - Invalid/missing values normalize to `standard`.
  - Wide mode fills available `main` width except responsive inline gutter.
  - Sidebar open/closed changes available width naturally; no manual pixel calculation in JS.
- Non-functional:
  - Default screenshots/layout stay unchanged.
  - No browser Fullscreen API; no media/image stretching.
  - At `<=900px`, control becomes compact icon-only but remains operable; hide only at `<=560px`, where the available content width is already below the standard cap.
  - File://, keyboard, high contrast tokens and reduced-motion behavior stay intact.
  - New feature logic lives in a focused module, not the already oversized `js/app.js`.

## Architecture

```text
<head> script before css/style.css
  -> read/normalize localStorage.contentWidth
  -> html[data-content-width] before first paint

DOMContentLoaded
  -> bind #contentWidthBtn
  -> update aria-pressed/aria-label/title
  -> toggle + persist

CSS dataset selector
  -> max-width override without JS geometry
```

Public DOM contract:

```html
<button id="contentWidthBtn"
        class="content-width-toggle"
        aria-pressed="false"
        aria-label="Mở rộng nội dung">↔</button>
```

CSS contract:

```css
[data-content-width="wide"] .content-area {
  max-width: none;
  padding-inline: clamp(1rem, 2.5vw, 3rem);
}
```

Child figures/simulations keep their existing width rules; “wide” applies to the reading container, not intrinsic assets.

## File Inventory

Repository root: `C:/Work/GiaoTrinhDienTu_CoHocLyThuyet`.

| Action | Path | Current size/evidence | Test impact |
|---|---|---|---|
| Modify | `index.html` | 444 lines; toolbar at 20-56, scripts at 361-378 | Add control and module load order |
| Create | `js/content-width.js` | none | Focused preference behavior |
| Modify | `css/style.css` | 2546 lines; content cap 437-443; breakpoints 1173+ | Wide override, state visuals, mobile hide |
| Create | `tests/content-width-preference.spec.js` | none | Default/toggle/persist/sidebar/invalid value |
| Modify | `tests/accessibility-landmarks.spec.js` | 4 tests, 28 assertions | Button accessible name/state |
| Modify | `tests/accessibility-zoom-reflow.spec.js` | 5 tests, 9 assertions | Wide geometry/no-overflow at responsive widths |
| Modify | `package.json` | `test:app`, `test:accessibility` | Add new focused spec to app gate |
| Document later | `README.md`, `docs/{design-guidelines,system-architecture,code-standards}.md` | Current state keys omit width | Phase 4 |

## Function and Interface Checklist

- [X] `normalizeContentWidth(value)` returns only `standard|wide`.
- [X] `readContentWidth()` handles unavailable storage without preventing page startup.
- [X] `applyContentWidth(mode)` updates the dataset immediately and synchronizes the control when it exists.
- [X] `updateContentWidthControl(mode)` owns pressed/name/title/icon state.
- [X] `toggleContentWidth()` persists only normalized values.
- [X] Initialization sets dataset while parsing `<head>`, tolerates the absent button, then binds/synchronizes the control on DOM readiness.
- [X] CSS selector changes no default rule and introduces no descendant exception for simulation/media.

## Dependency Map

- DOM owner: `index.html`.
- State/style owner: new `js/content-width.js` + `css/style.css`.
- Layout dependencies: `.main`, sidebar sibling rules and mobile topbar breakpoints only.
- No dependency on route loader, quiz, chapter data, PDF or simulation lifecycle.
- Phase dependency: none; Phase 4 consumes and documents final state.

## Test Scenario Matrix

| Priority | Scenario | Expected proof |
|---|---|---|
| Critical | Fresh profile at 1440px | `standard`, current max-width/default geometry unchanged |
| Critical | Toggle wide at 1440/1920px | Content becomes materially wider and remains inside main viewport |
| Critical | Reload and route change | Dataset/button/persisted value stay wide |
| Critical | Reload with saved wide mode | Dataset is wide before stylesheet/layout sampling; no standard→wide first-paint jump |
| High | 800px tablet | Compact control remains operable and wide mode can use the otherwise capped horizontal space |
| Critical | Sidebar open → closed → open | Content tracks available main width; no clipping/overflow |
| High | Invalid stored value | Normalizes to standard and control is not pressed |
| High | Storage get/set throws | App content remains usable; control reflects in-memory mode |
| High | 320px and 400% equivalent | No page horizontal overflow; control is hidden only at the no-benefit narrow breakpoint |
| High | Keyboard activation | Space/Enter toggle once; focus remains on button |
| Medium | Images/Sim2 in wide mode | Intrinsic/max caps remain; no stretch or logical viewport change |
| Medium | Print | Existing print full-width rule remains authoritative |

## Tests Before

1. Add RED browser spec for default bounding box, button semantics, toggle, persistence, route change and sidebar geometry.
2. Extend landmark test with RED name/pressed contract.
3. Extend reflow test with RED wide-mode checks at desktop, narrow and 400% equivalent.
4. Include one storage-error fixture before implementation to avoid a preference toggle breaking shell startup.

## Refactor

1. Keep all preference functions private inside one IIFE/module that supports early dataset bootstrap and later DOM binding.
2. Use dataset and CSS for layout; JS never calculates viewport/sidebar widths.
3. Reuse shared topbar target/focus styles; use icon-only state through tablet widths and hide at `<=560px`.
4. Keep `standard` equal to the existing cap so rollback is one module/control/override removal.

## Implementation Steps

1. Write RED Playwright and accessibility assertions.
2. Add the toolbar button at a stable location adjacent to theme/font controls.
3. Load `js/content-width.js` in `<head>` before `css/style.css`; let it set the dataset synchronously and bind the button on DOM readiness.
4. Implement normalize/read/apply/toggle/control-state functions with safe storage boundary.
5. Add wide CSS override, tablet compact state and narrow `<=560px` hide rule.
6. Exercise home, prose, quiz and simulation routes with sidebar both states, including 800px tablet.
7. Run phase gates; reject fixes that make wide the default or stretch child media.

## Tests After

- Add invalid value and storage exception cases discovered during GREEN.
- Add a pre-stylesheet dataset/layout-sampling assertion that fails on a saved-wide first-paint jump.
- Add computed-style/bounding-box assertion that fails if a future desktop rule silently restores the 900px cap in wide mode.
- Add narrow assertion that wide preference persists while the no-benefit control is hidden.

## Regression Gate

```powershell
playwright test tests/content-width-preference.spec.js
playwright test tests/accessibility-landmarks.spec.js tests/accessibility-zoom-reflow.spec.js
npm run test:app
```

## Todo

- [X] Write RED preference, semantics and reflow tests.
- [X] Add toolbar control and focused JS module.
- [X] Add standard/wide dataset and CSS contract.
- [X] Verify persistence, sidebar and route behavior.
- [X] Verify narrow, zoomed, media and simulation boundaries.
- [X] Pass app/accessibility gates.

## Success Criteria

- [X] Fresh users see exactly the existing standard layout.
- [X] Wide mode uses available horizontal main space with stable gutters.
- [X] State/name/title persist and are keyboard/screen-reader correct.
- [X] Sidebar, route changes, reload, storage failure and invalid values remain usable.
- [X] No page overflow at tested breakpoints/zoom; images/simulations do not stretch.

## Risk Assessment

| Risk/assumption | Observable break signal | Pre-decided response |
|---|---|---|
| Added topbar control causes wrap/overlap | 640px/400% owned-region test clips `.topbar` | Use icon-only control through tablet widths; hide only at `<=560px`; never shrink touch target |
| Wide rule loses to 2000/2560 media rules | Bounding test still reports old cap | Place explicit data-state overrides after responsive content caps |
| CSS child breakout double-centers Sim2 | Simulation rect leaves `.main` or page overflows | Keep child rule unchanged; add route-specific geometry assertion before considering override |
| Storage unavailable | Script throws and subsequent modules do not initialize | Catch read/write locally; preserve in-memory standard/wide behavior |
| Preference applies after first paint | Reload visibly jumps or early layout sampling sees standard despite saved wide | Execute normalized dataset bootstrap before stylesheet; defer only DOM button binding |

## Security Considerations

- Persist only two allowlisted string values.
- No HTML injection, URL mutation, browser permission or fullscreen capability.
- Local preference contains no personal or learning data.

## Next Steps

Phase 4 updates state-key/design/architecture documentation and runs cross-feature file:// gates.
