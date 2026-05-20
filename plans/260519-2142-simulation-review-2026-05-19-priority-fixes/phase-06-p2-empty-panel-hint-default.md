---
phase: 6
title: "P2 Empty Panel Hint Default + Autoplay-Pause"
status: pending
priority: P2
effort: "5h"
dependencies: [1, 5]
---

# Phase 6: P2 Empty Panel Hint Default + Autoplay-Pause

## Overview

11 route có panel placeholder (`QUAN HỆ TRUYỀN ĐỘNG`, `MÔ MEN ĐỘNG LƯỢNG`, `PHƯƠNG TRÌNH HỆ`, `BẢNG SAI LỆCH`, ...) **rỗng** ở default mount state. Học viên mở mô phỏng nhưng không thấy gì cho đến khi Chạy.

Decision (user 2026-05-19): hint text default cho mọi panel rỗng; autoplay-then-pause cho **2 sim**: `ch3-6-2` (va chạm) và `ch3-5-4` (năng lượng — user-confirmed: "Có, ch3-5-4 thuộc diện năng lượng"). Mở rộng existing `scene.autoplay` field thay vì tạo `lab.boot()` mới (red-team C4 fix).

## Requirements

**Functional:**
- Mỗi panel rỗng ở default state hiển thị hint: "Kéo handle hoặc nhấn ▶ Chạy để xem kết quả"
- Hint biến mất khi panel có content (sau Chạy hoặc sau drag)
- 2 route va chạm/năng lượng: autoplay N frames rồi pause để có content sẵn (preview-pause mode)
- KHÔNG xung đột với existing `scene.autoplay` đang cho phép continuous run (ch3-3-1 spring shipped trong plan 260518-2300)

**Non-functional:**
- Hint không can thiệp scenario interactive (không gắn listeners thừa)
- Hint phải localizable (i18n-ready) — Tiếng Việt mặc định
- Không double-trigger với existing autoplay path

## Architecture

**Existing autoplay (verified `js/sim-professional-lab.js:1594`):**
```js
if (scene.autoplay && !lab.prefersReducedMotion && typeof lab.resume === 'function') {
  lab.resume();
}
```

**New autoplay shape (extension, không break existing boolean form):**
```js
// Old (continuous): scene.autoplay = true
// New (preview-pause): scene.autoplay = { mode: 'preview-pause', frames: 3 }
// New (continuous explicit): scene.autoplay = { mode: 'continuous' }

// At mount, after lab.resume():
if (typeof scene.autoplay === 'object' && scene.autoplay.mode === 'preview-pause') {
  lab.runFrames(scene.autoplay.frames ?? 3).then(() => lab.pause());
}
```

**Hint widget pattern:**
```
sim-lab-ui.js panel widget:
  if (panel.empty && !panel.suppressHint) {
    panel.appendChild(hintEl);
  }
  on(state.update, () => {
    if (panel.contentChanged) hintEl.remove();
  });
```

**KHÔNG đụng `meta.objective` injection ở `sim-professional-lab.js:1470`** — hint widget chỉ render khi panel content empty, objective render ở slot khác. Test cover non-collision.

## Related Code Files

- Modify: `js/sim-lab-ui.js` (panel widget, hint helper inline)
- Create: `js/sim-panel-hints.js` (hint text + i18n map)
- Modify: `js/sim-professional-lab.js`
  - Line 1594 area: extend autoplay handling để accept object form `{mode, frames}`
  - Add helper `lab.runFrames(n)` nếu chưa có (verify via grep)
- Modify: 11 route scene definitions (locate via grep `panel(\|"QUAN HỆ\|"BẢNG SAI`):
  - ch2-2-2 `QUAN HỆ QUAY` panel
  - ch3-2-1 `QUÁN TÍNH` panel
  - ch3-7-2 `BẢNG SAI LỆCH` (note: ch3-7-2 redesign tách sang split-plan; P06 chỉ thêm hint default)
  - + các panel rỗng còn lại trong S6 fixture
- Modify scene config cho 2 autoplay route:
  - **ch3-6-2** (collision): scene.autoplay = `{ mode: 'preview-pause', frames: 3 }`
  - **ch3-5-4** (energy): scene.autoplay = `{ mode: 'preview-pause', frames: 5 }` — energy sim cần nhiều frame hơn để bar bắt đầu fill
- READ-ONLY (anti-regression): `js/sims/ch1/...` (ch3-3-1 spring autoplay shipped in commit bb397d9 — verify still continuous)
- Modify: `tests/sim-review-2026-05-19/empty-panel-hint.spec.js` (RED → GREEN, +autoplay assertions)

## Implementation Steps (TDD)

### RED
- `empty-panel-hint.spec.js` confirm 11 panel rỗng FAIL.
- Add autoplay assertions cho ch3-6-2 (2 bi sau 3 frame có vận tốc) và ch3-5-4 (energy bar non-zero sau 5 frame) — confirm fail.

### GREEN
1. Tạo `js/sim-panel-hints.js` với map `{ kind → hint text }`. Default Tiếng Việt: "Kéo handle hoặc nhấn ▶ Chạy để xem kết quả".
2. Modify `sim-lab-ui.js` panel widget: thêm hint default khi `panel.empty`.
3. Hook `state.update` để remove hint khi content arrive.
4. Cho 11 route, declare `panel({ id, kind })` trong adapter.
5. Trong `js/sim-professional-lab.js`, modify autoplay block (line 1594 area):
   ```js
   if (scene.autoplay && !lab.prefersReducedMotion && typeof lab.resume === 'function') {
     lab.resume();
     const cfg = (typeof scene.autoplay === 'object') ? scene.autoplay : { mode: 'continuous' };
     if (cfg.mode === 'preview-pause' && typeof lab.runFrames === 'function') {
       lab.runFrames(cfg.frames ?? 3).then(() => { if (typeof lab.pause === 'function') lab.pause(); });
     }
   }
   ```
6. Cho ch3-6-2 và ch3-5-4: set `scene.autoplay = { mode: 'preview-pause', frames: <N> }`.
7. **Anti-regression ch3-3-1**: spring autoplay shipped trong bb397d9 dùng `scene.autoplay = true` — confirm boolean path tiếp tục `lab.resume()` continuous.

### REFACTOR
- Audit toàn 58 route, panel kind nào còn raw `<div>` chưa qua widget — chuyển hết sang `panel({})`.

## Success Criteria

- [ ] 11 panel có hint default (capture mới)
- [ ] `tests/sim-review-2026-05-19/empty-panel-hint.spec.js` PASS
- [ ] ch3-6-2 capture mặc định: 2 bi đã có vận tốc/displacement (preview-pause 3 frame)
- [ ] ch3-5-4 capture mặc định: energy bar non-zero, T+V hiển thị (preview-pause 5 frame)
- [ ] **Anti-regression ch3-3-1**: spring vẫn autoplay continuous (verify resume loop)
- [ ] `meta.objective` slot tại `sim-professional-lab.js:1470` không double-render với hint
- [ ] `npm run test:sim:browser` PASS
- [ ] Visual baseline refresh qua `npm run test:sim:visual-quality:update`

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Object-form autoplay break existing boolean callers | Type-check `typeof scene.autoplay === 'object'` trước khi đọc `mode`; default treat boolean as continuous |
| Double-trigger với prior plan's `lab.resume()` | Object form vẫn gọi `lab.resume()` đầu tiên (giữ behavior cũ), chỉ thêm `pause()` sau N frame nếu mode='preview-pause' |
| `lab.runFrames(n)` không tồn tại | Grep verify trước; nếu chưa có, implement: `runFrames(n) → returns Promise resolving after rAF n times` |
| Hint widget collide với `meta.objective` ở slot khác | Inspector slot `meta.objective` ≠ panel rỗng kind='result'; test khẳng định không double-render |
| Autoplay 5 frame cho ch3-5-4 thay đổi state đầu vào, gây test khác fail | Tách out ch3-5-4 specific anti-regression; existing energy tests dùng explicit start state |
| ch3-7-2 panel `BẢNG SAI LỆCH` (split-plan) — tránh đụng input table feature | P06 chỉ thêm hint widget cho panel; redesign input-check feature ở split plan riêng |

## Verification Gate

Phase 06 đóng khi: capture re-run cho 11 route + 2 autoplay route show content/hint, spec PASS, ch3-3-1 anti-regression PASS, baseline refresh approved.
