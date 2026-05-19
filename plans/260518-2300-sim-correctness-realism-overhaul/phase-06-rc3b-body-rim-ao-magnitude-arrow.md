---
phase: 6
title: "RC3b Body Rim AO And Length-only Arrow"
status: completed
priority: P2
effort: "8h"
dependencies: [1, 2, 5]
---

# Phase 06: RC3b Body Rim AO And Length-only Arrow

## Overview

Nâng cấp `realisticBody` thêm rim highlight + ambient occlusion. `arrow`/`neonArrow` chỉ scale **chiều dài** theo magnitude (PhET / MyPhysicsLab convention) — KHÔNG dùng `shadowBlur` glow, KHÔNG scale `lineWidth`. Lý do: glow là sci-fi convention không có trong sách cơ học; width-coupled scaling tạo cảm giác |F|² thay vì |F|. Hai primitive này dùng nhiều nhất (>200 callsites trong renderers); nâng cấp sẽ thay đổi visual toàn bộ 58 route.

## Requirements

- Functional:
  - `P.realisticBody(ctx, x, y, w, h, title, opts)` thêm:
    1. AO ellipse fill phía dưới body (dark theme intensity 0.35, light 0.25).
    2. Rim highlight gradient từ top-left.
  - `P.arrow(ctx, x1, y1, x2, y2, opts)` chỉ scale **chiều dài** theo magnitude (PhET convention):
    1. `opts.magnitude` (0..1) scale `length = baseLength * magnitude`. Mũi tên ngắn khi |F| nhỏ, dài khi |F| lớn.
    2. `lineWidth` cố định 2.5px (KHÔNG scale theo magnitude — diện tích sẽ scale theo |F|² gây hiểu nhầm).
    3. KHÔNG dùng `shadowBlur` glow (paint cost cao + không phải convention vật lý của sách cơ học).
- Non-functional:
  - AO/rim không phá structural marks (giữ key `body:x:y:w:h`).
  - Magnitude defaults to 1.0 nếu không truyền (back-compat).
  - Both primitives keep `mark()` count = 1 per call.
  - Arrow paint cost increase ≤ 5% so với arrow hiện tại (length-only, không Gaussian blur).

## Architecture

Refer `research/researcher-canvas-realism.md` Sections 1, 5.

`realisticBody` order: AO ellipse → body fill (existing) → rim highlight overlay.

`arrow` length-only scaling (red-team pedagogy decision — drop shadowBlur and width scaling):
```js
function arrow(ctx, x1, y1, x2, y2, opts) {
  const cfg = opts || {};
  const mag = clamp(cfg.magnitude == null ? 1 : cfg.magnitude, 0, 1.5);
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy) * mag;     // length scales with |F|
  const ang = Math.atan2(dy, dx);
  const ex = x1 + Math.cos(ang) * len;
  const ey = y1 + Math.sin(ang) * len;
  ctx.lineWidth = 2.5;                      // FIXED — no magnitude coupling
  ctx.strokeStyle = cfg.color || color('force');
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(ex, ey);
  ctx.stroke();
  drawArrowHead(ctx, ex, ey, ang, 8);       // head size fixed
  mark('arrow', x1, y1, x2, y2, mag.toFixed(2));
}
```

PhET / MyPhysicsLab convention: distinguishable |F| via length only. Width-coupled scaling makes |F|² visual area, misleading; shadowBlur glow is sci-fi convention not physics textbook.

## Related Code Files

- Modify: `js/sim-route-renderer-primitives.js`
  - `body()` line 234-259: thêm AO + rim layer.
  - `realisticBody()` line 301-305: chuyển qua `body()` mới.
  - `arrow()` line 202: deprecate trong primitives; dùng `SimVisualHelpers.arrow` mới.
- Modify: `js/sim-visual-helpers.js`
  - Thêm `drawAO`, `drawRimHighlight` exports.
  - Update `arrow` (line 158-195) để hỗ trợ `magnitude` (length-only). KHÔNG thêm trapezoid, KHÔNG thêm shadowBlur.
  - `neonArrow` deprecated nếu chỉ glow — refactor callsites sang `arrow` length-only.
- Renderers: trong scene init, scene declare `magnitudeKey` (e.g., `'force'`) — engine tự normalize 0..1 để truyền vào arrow opts.
- Modify: `js/sim-professional-lab.js` — when calling `arrow()` from renderers, helper to compute magnitude từ `state[magnitudeKey] / scene.magnitudeMax`.

## Implementation Steps

1. RED: Test `@rc3-rim-ao`: mount any route with `realisticBody`, assert `data-structural-marks` contains both `ao:` and `rim:` marks (after refactor).
2. RED: Test `@rc3-arrow-length`: mount ch1-2-3, capture arrow structural mark `arrow:x1:y1:x2:y2:magnitude` ở 2 state khác nhau (F=30N → magnitude≈0.15, F=200N → magnitude≈1.0). Assert mag value differs ≥ 0.5; assert `lineWidth` constant 2.5 across both (read from canvasStats — pixel sample at arrow center).
3. RED (anti-regression): assert `data-structural-marks` does NOT contain `shadowBlur:` or `glow:` for arrow.
4. Implement `drawAO`, `drawRimHighlight` in visual-helpers.
5. Refactor `body()` to layer: AO → fill → rim. Mark each layer.
6. Refactor `arrow()` in visual-helpers: length-only scaling, fixed lineWidth=2.5, no shadowBlur. Add `opts.magnitude` (0..1, default 1.0).
7. Migrate `neonArrow` callers to plain `arrow` (or strip glow from neonArrow keeping name for back-compat).
8. Audit renderer arrow callsites — ensure key force routes pass `magnitude`. Keep default 1.0 elsewhere for back-compat.
9. Run @rc3 suites → GREEN. Run @rc1 + @rc4 → still GREEN.
10. Visual diff: capture before/after PNG for ch1-2-3, ch1-2-1, ch3-1-2, ch3-6-2. Verify length differs at low/high magnitude; lineWidth visually constant.

## Todo List

- [ ] RED: rim+ao mark presence test
- [ ] RED: arrow length-only variance test (mag value differs, lineWidth constant)
- [ ] RED: anti-regression test (no shadowBlur/glow marks)
- [ ] Implement drawAO/drawRimHighlight in visual-helpers
- [ ] Refactor body() to 3-layer
- [ ] Refactor arrow() with magnitude length-only, fixed lineWidth
- [ ] Migrate neonArrow callsites
- [ ] Audit 8 priority routes to pass magnitude
- [ ] Tests GREEN
- [ ] Visual review 4 routes (verify length variance, lineWidth constant)
- [ ] Refresh visual baseline JSON for routes with `realisticBody` + arrow callsites + commit `reports/baseline-delta-phase-06.md`

## Success Criteria

- [ ] Every `body`/`realisticBody` call emits `body:`, `ao:`, `rim:` marks
- [ ] Arrow length scales visibly with |F| (50N vs 150N → 3× length difference)
- [ ] Arrow `lineWidth` constant 2.5px regardless of magnitude (canvasStats verifies)
- [ ] Zero `shadowBlur:` or `glow:` marks in arrow renders
- [ ] Force routes show distinguishable arrow lengths at 50N vs 150N
- [ ] No regression in @rc1, @rc4, @rc5 suites
- [ ] Paint cost increase ≤ 10% on heavy routes (ch1-2-3, ch1-2-6) — was ≤25% with shadowBlur, now lighter

## Risk Assessment

- **Risk:** Light theme rim too bright, looks washed out.
  **Mitigation:** Dark intensity 0.45, light 0.25; review with user for both themes.
- **Risk:** Length-only scaling makes very small |F| invisible (length < 4px).
  **Mitigation:** Floor magnitude at 0.1 (4px min). Below that → render as small dot at base anchor + numeric readout takes over.
- **Risk:** Magnitude scaling breaks routes with no magnitude semantic.
  **Mitigation:** Default 1.0; explicit opt-in via scene declaring `magnitudeKey`.
- **Risk:** Removing shadowBlur regresses visual canvasStats `variants` baseline.
  **Mitigation:** Update baseline AFTER migration; document delta in plan reports.

## Security Considerations
- N/A.

## Next Steps
- Phase 07 wheel rim shine reuses rim highlight technique.
- Phase 08 collision impulse flash uses arrow length-only convention from this phase.
