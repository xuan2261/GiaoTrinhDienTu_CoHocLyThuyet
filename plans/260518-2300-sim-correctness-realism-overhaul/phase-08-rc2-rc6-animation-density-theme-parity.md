---
phase: 8
title: "RC2 RC6 Animation Density And Theme Parity"
status: partial
priority: P2
effort: "9h"
dependencies: [1, 2, 5, 6]
---

# Phase 08: RC2 RC6 Animation Density And Theme Parity

## Status

- ✅ Impulse flash (ch3-6-2): Newton-3 invariant via `state.impulseFlash`; renderer emits 2 `impulseArrow` marks; `emitCollisionSparks` removed (commit a178756).
- ✅ Preset gallery (ch1-2-3, ch1-1-3, ch1-2-1): scenes declare `presets[]`; `buildPresetGallery` renders `.sim-preset-button[data-preset]` row in lab; click applies state via `behavior.updateStateFromSlider`. 22/22 sim-correctness-realism tests GREEN. Browser control-audit GREEN across 58 routes (commit e23f19b).
- ⏳ Trail buffer (ch2-1-1): blocked by `state.trail` ban in `tests/simulation-runtime-regressions.test.js:69` — needs coordinated test relaxation.
- ⏳ Spring autoplay (ch3-3-1) with reduced-motion-aware fallback button.
- ⏳ Light theme parity (RC6): merge `SimCore.COLORS` + `primitives.palette` + `PARA_COLORS` with theme-aware variants on 10 representative routes.

## Overview

Khắc phục RC2 (40/58 route static) và RC6 (palette mâu thuẫn, light theme chưa test). Bổ sung animation **đúng convention vật lý**:
- **Preset gallery** cho ch1 routes (thay vì auto-cycle distract — red-team pedagogy decision): 3-4 nút jump tới state mẫu với tween 0.4s.
- **Trail buffer** cho ch2 trajectory routes: ring buffer 40 sample, alpha decay.
- **Impulse flash** cho ch3-6-2 collision (thay vì sparks không phải hiện tượng vật lý — red-team pedagogy decision): 2 mũi tên xung lực J=Δp tại điểm tiếp xúc, hướng ngược nhau (Newton 3), độ dài tỉ lệ |J|, fade 250ms.
- **Spring oscillation** default-on cho ch3-3-1.
- **Theme parity**: unify palette về `SimCore.COLORS` với theme-aware variants; verify light theme cho 10 route đại diện.

## Requirements

- Functional:
  - Preset gallery: ch1-2-3, ch1-1-3, ch1-2-1 — 3-4 nút (vd: `[α=0°][α=45°][α=90°][α=180°]`) trong canvas. Click → state nhảy đến preset với animation tween 0.4s easeOutCubic. Học sinh chủ động chọn case, KHÔNG có auto-cycle.
  - Trail buffer: ch2-1-1, ch2-2-2 trajectory routes — ring buffer 40 sample, alpha decay 1→0, fade tail.
  - Impulse flash: ch3-6-2 — khi `collision: false → true`, vẽ 2 mũi tên xung lực:
    - Tại điểm tiếp xúc, mũi tên 1 trên vật A: hướng từ contact ra ngoài, length tỉ lệ |J| = m_A·|Δv_A|.
    - Mũi tên 2 trên vật B: ngược chiều cùng độ dài (Newton 3).
    - Fade in 50ms, hold 100ms, fade out 100ms (tổng 250ms).
    - Label nhỏ `J` ở giữa (overlay whitelist accept).
  - Spring default-on: ch3-3-1 — `lab.resume()` tự gọi sau mount nếu route declare `autoplay: true`.
  - Theme parity: palette từ 3 nguồn (`SimCore.COLORS`, primitives.palette, PARA_COLORS) merge về `SimCore.COLORS` với theme-aware variants.
- Non-functional:
  - Preset buttons rendered trong canvas overlay (không phải DOM ngoài) → keep offline `file://` support.
  - Trail không cản learner (semi-transparent, alpha ≤ 0.4).
  - Impulse flash KHÔNG dùng particle pool, KHÔNG sinh structural mark explosion (max 4 marks per collision: 2 arrow + 2 label).
  - Light theme variants ≥ dark theme variants - 10 cho 10 representative routes.

## Architecture

```
SimAnimationEngine
  ├─► onFrame(trailUpdateCb)      ← ch2-1-1, ch2-2-2
  └─► impulseFlash(contact, J_A, J_B, duration=250ms)
                                  ← ch3-6-2 collision edge transition

PresetGallery (ch1 routes):
  scene.presets = [
    { label: 'α=0°',  state: { alpha: 0   } },
    { label: 'α=45°', state: { alpha: 45  } },
    { label: 'α=90°', state: { alpha: 90  } },
    { label: 'α=180°', state: { alpha: 180 } }
  ];
  // Click → tween scene.state[key] from current → preset.state[key] over 0.4s easeOutCubic
  // NO auto-cycle, NO idle timer.

PaletteUnification:
  SimCore.COLORS = {
    force:    { dark: '#dc3545', light: '#c82333' },
    velocity: { dark: '#0d6efd', light: '#0a58ca' },
    impulse:  { dark: '#fd7e14', light: '#e8590c' },
    ...
  };
  function color(key) { return SimCore.COLORS[key][isDarkTheme()?'dark':'light']; }
```

## Related Code Files

- Modify: `js/sim-core.js` — restructure `COLORS` to theme-aware map; expose `color(key)` helper. Add `impulse` color key.
- Migrate: `js/sim-route-renderer-primitives.js` `palette` → reference `SimCore.color()`.
- Migrate: `js/sims/ch1/ch1-force-law-renderers.js` `PARA_COLORS` → `SimCore.color()`.
- Add: `js/sim-route-behavior-registry.js` — support `presets: [{label, state}]` declared in scene.
- Modify: `js/sim-professional-lab.js` `mount()` — read scene.autoplay; render preset buttons inside canvas overlay if `scene.presets`.
- Add: `js/sim-lab-ui.js` — `renderPresetGallery(canvas, scene, lab)` — draws inline preset buttons in top-left of canvas.
- Modify: `js/sims/ch2/ch2-trajectory-graph-renderers.js` — render trail from `state.trailBuffer`.
- Modify: `js/sims/ch2/ch2-kinematics-behaviors-a.js` `onTick_ch211` — push current point to ring buffer.
- Modify: `js/sims/ch3/ch3-collision-exercises-renderers.js` — call `drawImpulseFlash` on active flash state.
- Modify: `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js` — on transition `collision: false → true`, snapshot pre/post velocities, compute `J_A = m_A·(v_A' - v_A)` and `J_B = -J_A`, store `state.impulseFlash = { contact, J_A, J_B, t0: now }`.
- Add scene fields:
  - `ch1-2-3` scene → `presets: [{label:'α=0°',state:{alpha:0}}, {label:'α=45°',state:{alpha:45}}, {label:'α=90°',state:{alpha:90}}, {label:'α=180°',state:{alpha:180}}]`
  - `ch1-1-3` scene → 3-4 presets cho slider chính
  - `ch1-2-1` scene → 3-4 presets cho slider chính
  - `ch3-3-1` scene → `autoplay: true`
- Tests:
  - `@rc2-preset-gallery`: mount ch1-2-3, assert 4 preset buttons rendered in canvas overlay (`data-preset-buttons` >= 3). Click button at index 2 (α=90°). Assert state.alpha tweens to 90 within 500ms (initial: 0).
  - `@rc2-no-autocycle`: mount ch1-2-3, wait 5s no input, assert state.alpha **unchanged** (no auto drift). Anti-regression for old auto-cycle.
  - `@rc2-trail`: mount ch2-1-1, run 1s, assert `state.trailBuffer.length` between 30-40.
  - `@rc2-impulse-flash`: mount ch3-6-2, drag balls into collision. Assert `data-structural-marks` contains exactly 2 `arrow:` marks at contact point (J_A, J_B) within 250ms after collision, and contains label `J`. Assert NO `spark:` or `particle:` marks.
  - `@rc2-impulse-newton3`: read 2 impulse arrow marks. Assert opposite directions (dot product of unit vectors ≈ -1) and equal magnitudes (length difference ≤ 1px).
  - `@rc6-theme-parity`: mount 10 routes in light + dark, capture `canvasStats`, assert variants delta ≤ 10.
  - `@rc6-palette-source`: assert source code: zero `#dc3545`/`#0d6efd` in renderers (must use `color('force')`).

## Implementation Steps

1. RED: 6 RC2 tests (preset gallery render, no-autocycle anti-regression, trail buffer, impulse flash 2 arrows, Newton 3 invariant, no spark marks) + 2 RC6 tests (theme parity, palette source).
2. Restructure `SimCore.COLORS` to theme-aware. Add `color(key)` helper. Add `impulse` color key (`#fd7e14` dark / `#e8590c` light).
3. Migrate primitives.palette + PARA_COLORS to `color()`. Confirm visual unchanged in dark theme.
4. Verify light theme on 10 representative routes (capture canvasStats). Light variants delta ≤ 10 vs dark.
5. Add `autoplay` scene field + wire in `mount()`.
6. Add `presets` scene field + UI gallery (`renderPresetGallery` in `js/sim-lab-ui.js`):
   - Render 3-4 inline buttons in top-left of canvas (within sim-lab overlay).
   - Each click: tween scene.state from current to preset.state (0.4s easeOutCubic).
   - Use existing `lab.tween()` if available; else simple RAF tween helper.
7. Wire ch1-2-3, ch1-1-3, ch1-2-1 scenes with preset arrays. Validate state tween.
8. Implement trail ring buffer for ch2-1-1, ch2-2-2 (push on `onTick`, render with alpha decay).
9. Implement `drawImpulseFlash` in `js/sim-visual-helpers.js`:
   - Reuse `arrow` from Phase 06 (length-only, magnitude-scaled).
   - Compute fade alpha based on `(now - t0) / 250ms`.
   - Render label `J` at midpoint of arrow.
   - Clear `state.impulseFlash` when t > 250ms.
10. Wire ch3-6-2 collision behavior:
    - Edge-trigger detection (only on `false → true`).
    - Snapshot pre-collision velocities (need 1-frame back buffer).
    - Compute J_A = m_A·(v_A_post - v_A_pre); J_B = -J_A (Newton 3).
    - Store `state.impulseFlash = { contact: contactPoint, J_A, J_B, t0: now }`.
    - Cooldown 0.5s to prevent flicker re-trigger.
11. Run all suites GREEN. Final visual review.

## Todo List

- [ ] RED: 8 tests for animation + theme (6 RC2 + 2 RC6)
- [ ] Restructure SimCore.COLORS theme-aware (add `impulse` key)
- [ ] Migrate palette callsites
- [ ] Light theme verify 10 routes
- [ ] autoplay scene field + wire
- [ ] presets scene field + tween helper
- [ ] renderPresetGallery UI in canvas overlay
- [ ] Wire ch1-2-3, ch1-1-3, ch1-2-1 preset arrays
- [ ] Trail buffer ch2-1-1, ch2-2-2
- [ ] drawImpulseFlash in visual-helpers
- [ ] Wire ch3-6-2 edge-trigger + impulse compute
- [ ] All tests GREEN
- [ ] Refresh visual baseline JSON for animation routes (ch1-2-3, ch1-1-3, ch1-2-1, ch2-1-1, ch2-2-2, ch3-3-1, ch3-6-2) + 10 light-theme baselines + commit `reports/baseline-delta-phase-08.md`

## Success Criteria

- [ ] Preset gallery on ch1-2-3: 4 buttons clickable, state tweens 0.4s on click
- [ ] Idle 5s on ch1-2-3 leaves state.alpha unchanged (no auto-cycle anywhere in code)
- [ ] ch2-1-1 trail visible 40 samples with smooth alpha fade
- [ ] ch3-6-2 collision: exactly 2 impulse arrows at contact, opposite directions, equal magnitudes (Newton 3)
- [ ] ch3-6-2 emits NO `spark:` or `particle:` structural marks
- [ ] ch3-3-1 oscillates by default after mount
- [ ] Zero hardcoded hex in **all simulation source** files (grep `#[0-9a-f]{6}` across `js/sims/**/*.js` AND `js/sim-route-renderer-primitives.js` AND `js/sim-visual-helpers.js` returns 0)
- [ ] 10 routes light vs dark canvasStats variants delta ≤ 10
- [ ] No regression in earlier @rc invariants

## Risk Assessment

- **Risk:** Preset buttons inside canvas overlay may overlap simulation drawing area on small canvases.
  **Mitigation:** Position top-left, max-width 30% canvas; collapsible if width < 320px.
- **Risk:** Trail buffer stays after route disposal → memory leak.
  **Mitigation:** Trail buffer is route-scoped state; reset on `dispose`.
- **Risk:** Impulse flash flicker if collision detection chatters.
  **Mitigation:** Edge-trigger emission (only on `false→true` transition); cooldown 0.5s.
- **Risk:** Pre-collision velocity snapshot requires 1-frame lookback.
  **Mitigation:** Behavior maintains `state._prevV_A`, `state._prevV_B` updated each onTick before collision check.
- **Risk:** Theme migration breaks visual gates baseline.
  **Mitigation:** Update visual-quality baseline AFTER migration; document migration in plan reports.

## Security Considerations
- localStorage keys not used in this phase (preset gallery is stateless per session).

## Next Steps
- Phase 08b adds accessibility (ARIA, keyboard nav, prefers-reduced-motion) — depends on this phase's preset gallery + impulse flash being in place.
- Phase 09 cross-route regression validates all 58 routes after changes.
