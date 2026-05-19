---
phase: 5
title: "RC3a Primitive Spring Helix And Dual Pass"
status: completed
priority: P2
effort: "5h"
dependencies: [1, 3]
---

# Phase 05: RC3a Primitive Spring Helix And Dual Pass

## Overview

Thay zigzag spring (`js/sim-route-renderer-primitives.js:260-284`) bằng sinusoidal helix với fixed amplitude + variable pitch + dual-pass shadow. Coil count derived từ độ dài spring để pitch tự nhiên khi co/duỗi.

## Requirements

- Functional:
  - `P.spring(ctx, x1, y1, x2, y2, opts)` produces sinusoidal helix với 16 sample points/coil.
  - Amplitude cố định khi spring co/duỗi (chỉ pitch thay đổi).
  - Dual-pass: shadow stroke (offset 1.5,2; alpha 0.25) trước main stroke.
- Non-functional:
  - Paint cost ≤ +20% so với zigzag baseline.
  - Visual canvasStats `variants` ≥ 80 (current ~30).

## Architecture

Refer `research/researcher-canvas-realism.md` Section 3. Implementation outline:

```js
function spring(ctx, x1, y1, x2, y2, options) {
  const cfg = options || {};
  const dx = x2-x1, dy = y2-y1;
  const len = Math.hypot(dx, dy);
  if (len < 1) return;
  const nx = dx/len, ny = dy/len;
  const px = -ny, py = nx;
  const amplitude = cfg.amplitude || cfg.width || 8;
  const coilCount = cfg.coils || Math.max(4, Math.round(len / 14));
  const steps = coilCount * 16;
  const drawPath = () => {
    ctx.beginPath(); ctx.moveTo(x1, y1);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const along = len * t;
      const perp = amplitude * Math.sin(t * coilCount * Math.PI * 2);
      ctx.lineTo(x1 + nx*along + px*perp, y1 + ny*along + py*perp);
    }
  };
  ctx.save();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = (cfg.lineWidth||2) + 2;
  ctx.translate(1.5, 2); drawPath(); ctx.stroke();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = cfg.color || '#adb5bd'; ctx.lineWidth = cfg.lineWidth || 2;
  drawPath(); ctx.stroke();
  ctx.restore();
  mark('spring', x1, y1, x2, y2, coilCount);
}
```

## Related Code Files

- Modify: `js/sim-route-renderer-primitives.js` — replace `spring()` body.
- Modify: `js/sim-visual-helpers.js` — `drawSpring` thin wrapper (already exists, ensure not broken).
- Tests: `tests/sim-correctness-realism.test.js` — assert source contains `Math.sin` not `i % 4`.
- Tests: `tests/sim-handle-anchor-invariants.spec.js` `@rc3-spring-helix` browser suite — assert `data-structural-marks` shows `spring:...:coilCount` with coilCount > 4.

## Implementation Steps

1. RED (behavioral, NOT source-grep — red-team P0-4): Mount ch3-3-1, capture canvas pixels along the spring axis between (x1,y1) and (x2,y2). Compute first-derivative of perpendicular displacement. Assert it is approximately sinusoidal (alternating sign at regular intervals; FFT peak at `coilCount/len` frequency). Zigzag would produce sharp triangular wave with high-frequency harmonics.
2. RED: Browser test `@rc3-spring-helix`: mount ch3-3-1, get `data-structural-marks`, assert `spring:` mark has 6th colon-separated value (coilCount) > 4. Drag slider to extend spring; assert coilCount stable (amplitude fixed) but pitch increases (mark length grows).
3. Implement new helix. Confirm shadow + main pass both call `mark('spring', ...)` once total.
4. Run unit + browser tests → GREEN.
5. Visual review on ch3-3-1, ch3-3-2, ch1-1-8 cable mode (cable should NOT use spring helix — keep catenary).
6. Capture canvasStats `variants` baseline before/after.

## Todo List

- [ ] RED: Source check + browser coilCount check
- [ ] Replace `P.spring` with sinusoidal helix
- [ ] Verify shadow pass + main pass single mark
- [ ] Unit + browser tests GREEN
- [ ] Manual visual: ch3-3-1, ch3-3-2 OK
- [ ] canvasStats variants ≥ 80 on spring routes
- [ ] Refresh visual baseline JSON for spring routes (ch3-3-1, ch3-3-2, ch1-1-8, ch1-2-1) + commit `reports/baseline-delta-phase-05.md`

## Success Criteria

- [ ] Spring renders smooth sinusoidal coils
- [ ] Amplitude constant when slider changes
- [ ] Coil count adapts (4-12) to maintain ~14px pitch
- [ ] canvasStats `variants` ≥ 80 (was ~30)
- [ ] Paint cost increase ≤ 20%

## Risk Assessment

- **Risk:** 16 samples/coil → too many lineTo calls.
  **Mitigation:** Profile; reduce to 12 if ch3-3-1 onTick FPS drops below 55.
- **Risk:** Shadow stroke leaks outside `ctx.save/restore`.
  **Mitigation:** Wrap entire dual-pass in single `save/restore`; verify with smoke test.

## Security Considerations
- N/A.

## Next Steps
- Phase 06 builds on this — magnitude arrow uses similar dual-pass pattern.
