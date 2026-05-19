---
phase: 8.5
title: "Accessibility ARIA Keyboard And Reduced Motion"
status: in-progress
priority: P2
effort: "3h"
dependencies: [2, 6, 8]
---

# Phase 08b: Accessibility ARIA Keyboard And Reduced Motion

## Overview

Bổ sung accessibility (a11y) cho 58 simulation routes — yêu cầu giáo dục đại học hiện đại + quy định WCAG 2.1 AA cho tài liệu số. Học sinh hải quân có thể có thị lực kém / mù màu / laptop touchpad lỗi → phải đảm bảo:
- Mọi handle có **ARIA label tiếng Việt** mô tả chức năng (vd: `aria-label="Kéo điểm A đầu lực F1, vị trí hiện tại x=120 y=80"`).
- **Keyboard navigation**: Tab focus vào handle, mũi tên di chuyển, Shift+arrow di chuyển nhanh.
- Tôn trọng **`prefers-reduced-motion`**: nếu user bật setting OS này:
  - Preset tween: snap instant.
  - Trail buffer: render static dotted polyline (không fade decay).
  - Impulse flash: render full opacity 100ms rồi xóa (không fade).
  - **Spring autoplay (ch3-3-1)**: skip autoplay + render visible **"Chạy mô phỏng"** button cho user manual trigger (autoplay là decoration, dao động lò xo là essential — user mất feature nếu không có button thay thế).
- Color-blind safe: kế thừa từ Phase 06 — arrow length-only scaling đã đủ phân biệt |F| mà không phụ thuộc màu.

Phase này được red-team pedagogy đề xuất sau khi review plan ban đầu, depends on Phase 02 (handle/anchor invariant), Phase 06 (arrow length-only), Phase 08 (preset gallery + impulse flash).

## Requirements

- Functional:
  - Mỗi handle declare `aria` field (object hoặc function) trả `{ role, label, valueText? }`.
  - Engine wrap canvas với invisible focusable button overlay tại vị trí handle:
    - `<button class="sim-handle-a11y" aria-label="..." style="position:absolute;...">` overlay tại pixel position của handle.
    - On focus: visual focus ring around handle.
    - On keydown: arrow keys translate to drag delta (1px / 10px with shift); Enter/Space: future preset action; Escape: blur.
  - Preset gallery buttons (Phase 08) inherit native `<button>` semantics — đảm bảo có aria-label + keyboard activate.
  - `prefers-reduced-motion: reduce`:
    - Preset tween: 0.4s → 0s (instant snap).
    - Trail buffer: kept on (educational), but no fade animation — show as static dotted polyline.
    - Spring autoplay: skipped (user must click run manually).
    - Impulse flash: instant render + instant remove (no fade).
  - Screen reader announcements: when state changes via keyboard, emit `aria-live="polite"` text via hidden div (vd: `"alpha = 90 độ, hợp lực = 120 N"`).
- Non-functional:
  - Zero impact on mouse drag UX (overlay buttons `pointer-events: none` when not focused).
  - `prefers-reduced-motion` check uses `window.matchMedia('(prefers-reduced-motion: reduce)')` with listener for runtime toggle.
  - All 58 routes pass automated a11y test.

## Architecture

```
DOM structure per simulation:
  <div class="sim-lab" role="img" aria-label="Mô phỏng {scene.title}">
    <canvas></canvas>
    <div class="sim-handle-a11y-layer" aria-hidden="false">
      <button class="sim-handle-a11y" aria-label="..." style="left:Xpx;top:Ypx" tabindex="0">
        <span class="sr-only">{handle.label}, x={x}, y={y}</span>
      </button>
      ... (one per handle)
    </div>
    <button class="sim-reduced-motion-run" aria-label="Chạy mô phỏng">
      Chạy mô phỏng
    </button>
    <div class="sim-aria-live" aria-live="polite" aria-atomic="true" class="sr-only"></div>
  </div>

Pointer-events strategy (mouse drag MUST work — overlay buttons MUST NOT hijack):
  .sim-handle-a11y-layer  { pointer-events: none; }   /* default — clicks pass through to canvas */
  .sim-handle-a11y        { pointer-events: none; }   /* default */
  .sim-handle-a11y:focus,
  .sim-handle-a11y:focus-visible { pointer-events: auto; }  /* only the focused button captures keys */

  // On mousedown anywhere on .sim-lab while a button is focused, blur it before dispatching the canvas drag:
  lab.containerEl.addEventListener('mousedown', e => {
    const focused = document.activeElement;
    if (focused && focused.classList.contains('sim-handle-a11y')) focused.blur();
  }, true /* capture */);

Reduced-motion check:
  const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
  const prefersReduced = mql.matches;
  mql.addEventListener('change', e => lab.setPrefersReducedMotion(e.matches));
  // Used by: presetTween duration, trailBuffer fade, autoplay decision, impulseFlash duration

Manual run button (only rendered when prefersReduced && scene.autoplay):
  if (lab.prefersReducedMotion && scene.autoplay) {
    renderRunButton(container, () => { lab.resume(); hideRunButton(); });
  }
```

ARIA labels viết bằng tiếng Việt (target audience hải quân VN, NVDA/VoiceOver hỗ trợ tiếng Việt qua TTS):
- Pattern: `"{verb} {target}, vị trí hiện tại x={x} y={y}"` — vd `"Kéo điểm A đầu lực F1, vị trí hiện tại x=120 y=80"`.
- aria-live announcements ngắn: `"F1 góc 45 độ, độ lớn 80 N"` (lấy từ scene.readouts hiện tại).

## Related Code Files

- Modify: `js/sim-professional-lab.js`
  - In `mount()`, after handles resolved, build `<button>` overlay layer mirroring handle positions.
  - On handle keyboard event, call same `set()` as drag would.
  - Update overlay positions on `onTick` (handle moves).
  - Wire `prefersReducedMotion` flag to scene state for downstream consumers.
- Modify: `js/sim-lab-ui.js`
  - `renderPresetGallery`: ensure buttons have `aria-label`, `<kbd>` hint.
  - Honor `prefersReducedMotion` in tween duration.
- Modify: `js/sim-animation-engine.js`
  - Trail update: if `prefersReducedMotion`, skip fade interpolation.
  - Spring autoplay: skip if `prefersReducedMotion`.
- Modify: `js/sim-visual-helpers.js`
  - `drawImpulseFlash`: instant on/off if `prefersReducedMotion`.
- Add: `css/simulation.css` (or existing sim CSS file):
  - `.sim-handle-a11y-layer` absolute layer over canvas.
  - `.sim-handle-a11y` invisible button with focus ring style.
  - `.sr-only` utility class.
- Modify: handle definitions in route registries — add `aria: { label: '...', valueText: s => '...' }`.
- Tests:
  - File: `tests/sim-accessibility.spec.js` (Playwright).
  - npm script: `test:sim:a11y` → `playwright test tests/sim-accessibility.spec.js`.
  - `@a11y-aria-label`: mount each of 58 routes, assert `.sim-handle-a11y` count = handle count, all have `aria-label` containing tiếng Việt (regex `[À-ỹ]` match).
  - `@a11y-keyboard-drag`: mount ch1-2-3, focus handle, dispatch ArrowRight 10×, assert `state.f1End.x` increased by 10. Shift+ArrowRight → 100. Escape blurs.
  - `@a11y-reduced-motion`: set `matchMedia` mock to `reduce`, mount ch3-3-1, assert:
    - `lab.isPlaying === false` (autoplay skipped).
    - `.sim-reduced-motion-run` button rendered + visible + has aria-label `"Chạy mô phỏng"`.
    - Click button → `lab.isPlaying === true`, button hidden.
    Mount ch1-2-3, click preset, assert state snaps instantly (no tween frames between click and final).
  - `@a11y-live-region`: mount ch1-2-3, focus handle, dispatch ArrowRight, read `.sim-aria-live` textContent within 300ms, assert non-empty + tiếng Việt + contains coord.
  - `@a11y-pointer-events`: mount ch1-2-3. Tab to focus a11y button. Issue mousedown on canvas at handle position. Assert `document.activeElement` is no longer the a11y button (focus blurred), AND drag begins normally on canvas (state changes after drag). Issue mousedown when no a11y button focused → assert canvas drag works without interception.

## Implementation Steps

1. RED: 5 a11y tests above (aria-label tiếng Việt, keyboard-drag, reduced-motion + run button, live-region, pointer-events).
2. Add CSS classes for `.sim-handle-a11y-layer`, `.sim-handle-a11y`, `.sim-reduced-motion-run`, `.sr-only`. Configure `pointer-events:none` default + `auto` on focus.
3. In `mount()`, build a11y overlay layer:
   - For each handle, create `<button>` with computed pixel position (`getAnchor()` mapped to canvas client coords).
   - Add tiếng Việt `aria-label` from `handle.aria.label || handle.label` (default Vietnamese template).
   - Wire keyboard handler: ArrowKeys → drag delta; Enter → noop (reserved); Escape → blur.
   - Update positions in onFrame loop (lightweight — only translate).
4. Wire blur-on-canvas-mousedown listener (capture phase) so mouse drag on canvas always works even when an a11y button has focus.
5. Add `lab.prefersReducedMotion` getter using `matchMedia`. Listener for runtime toggle.
6. Update preset gallery tween duration: `prefersReducedMotion ? 0 : 400`.
7. Update spring autoplay: `if (scene.autoplay)` — if `lab.prefersReducedMotion` then skip autoplay AND render `<button class="sim-reduced-motion-run">Chạy mô phỏng</button>` overlay; click → `lab.resume()` + hide button.
8. Update trail render: if reduced, render static dotted polyline (no per-sample alpha fade).
9. Update impulse flash: if reduced, hold full opacity for 100ms then remove (no fade in/out).
10. Wire aria-live region: on keyboard state change, write tiếng Việt state summary to `.sim-aria-live` (debounced 300ms).
11. Migrate all 58 handle declarations to include `aria.label` tiếng Việt (default fallback: use existing `handle.label` translated).
12. Run a11y tests + smoke test on ch1-2-3, ch2-1-1, ch3-3-1, ch3-6-2 with screen reader (NVDA on Windows tiếng Việt voice, VoiceOver dry-run).
13. All tests GREEN.

## Todo List

- [ ] RED: 5 a11y tests (aria-label VN, keyboard-drag, reduced-motion + run button, live-region, pointer-events)
- [ ] CSS classes for a11y overlay (pointer-events strategy)
- [ ] Build a11y button overlay in mount()
- [ ] Wire keyboard drag (arrow + shift+arrow)
- [ ] Wire blur-on-canvas-mousedown listener (capture phase)
- [ ] prefersReducedMotion detection + listener
- [ ] Apply reduced-motion to preset tween
- [ ] Apply reduced-motion to spring autoplay + render manual run button "Chạy mô phỏng"
- [ ] Apply reduced-motion to trail render
- [ ] Apply reduced-motion to impulse flash
- [ ] aria-live region for state announcements (tiếng Việt, debounced 300ms)
- [ ] Add tiếng Việt `aria.label` to all 58 handle declarations
- [ ] Manual NVDA tiếng Việt voice / VoiceOver test on 4 routes
- [ ] All tests GREEN
- [ ] Refresh visual baseline JSON for routes that gained ARIA layer (no canvas pixel change expected, but DOM mark count differs) + commit `reports/baseline-delta-phase-08b.md`

## Success Criteria

- [ ] Every handle in 58 routes has `<button class="sim-handle-a11y">` overlay with tiếng Việt `aria-label`
- [ ] Tab cycles through handles + preset buttons in logical reading order
- [ ] Arrow keys drag handle 1px (Shift = 10px); Escape blurs
- [ ] Mouse drag on canvas works even when an a11y button has focus (focus auto-blurs on mousedown)
- [ ] `prefers-reduced-motion: reduce` disables: preset tween, trail fade, impulse flash fade
- [ ] When reduced + scene.autoplay: spring DOES NOT autoplay; visible "Chạy mô phỏng" button rendered; click → spring resumes + button hides
- [ ] aria-live region announces tiếng Việt state on keyboard interaction (debounced)
- [ ] Preset buttons activate via Enter/Space
- [ ] Manual test: NVDA tiếng Việt voice reads handle on focus; arrow keys move + announce new state in tiếng Việt

## Risk Assessment

- **Risk:** Overlay `<button>` layer hijacks pointer events from canvas drag.
  **Mitigation:** `pointer-events: none` default; `auto` only on `:focus`. Capture-phase mousedown listener blurs focused a11y button before drag starts. Test `@a11y-pointer-events` covers this.
- **Risk:** Position update of buttons on every frame is expensive.
  **Mitigation:** Throttle to 30Hz; only update if position delta > 0.5px.
- **Risk:** Some handles compute position from animated state (ch2-2-2 rotation) — overlay button position lags 1 frame.
  **Mitigation:** Acceptable — keyboard user values exact final position; 16ms lag invisible.
- **Risk:** Screen reader spam if state changes 60×/s during keyboard hold.
  **Mitigation:** Debounce live-region update to 300ms; only announce on keyup or after 300ms idle.
- **Risk:** `prefersReducedMotion` flag inconsistent across mount lifecycle.
  **Mitigation:** Read once at mount; listener updates `lab.prefersReducedMotion` and re-applies to active animations + shows/hides run button.
- **Risk:** Manual run button position obscures simulation content.
  **Mitigation:** Position bottom-right of canvas overlay, max 120px wide, dismisses after click. Test with smallest canvas (320px) — fall back to top-right if collision.
- **Risk:** NVDA tiếng Việt voice not installed on test machine.
  **Mitigation:** Document NVDA Vietnamese voice install in test setup; fallback dry-run with text inspection if voice unavailable.

## Security Considerations
- N/A (no new external inputs).

## Next Steps
- Phase 09 cross-route regression includes a11y suite in release pipeline.
- Phase 10 docs add WCAG 2.1 AA compliance note + tiếng Việt ARIA convention rationale.
