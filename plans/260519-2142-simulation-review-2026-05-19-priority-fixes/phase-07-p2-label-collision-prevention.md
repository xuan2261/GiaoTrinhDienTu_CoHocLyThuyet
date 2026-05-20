---
phase: 7
title: "P2 Label Collision Prevention With Static Offsets"
status: pending
priority: P2
effort: "5h"
dependencies: [1, 4, 5]
---

# Phase 7: P2 Label Collision Prevention With Static Offsets

## Overview

15 route có label vector / cung mô men chồng nhau hoặc chồng body (S4 list trong analysis). Áp dụng **YAGNI**: ship `drawLabelOffset(ctx, text, anchor, dx, dy)` + per-route hand-tuned offset tables. KHÔNG quad-tree, KHÔNG leader-line spline, KHÔNG frame-cache singleton ở iteration đầu (red-team M1 fix). Chỉ thêm automatic detection nếu GREEN không đủ trên 3+ route.

## Requirements

**Functional:**
- Helper API: `drawLabelOffset(ctx, text, anchor, dx, dy, opts?)` — static offset từ anchor
- Per-route offset table cho vector labels (perpendicular offset cho arrow, radial cho cung mô men)
- Trace structural mark `label:{text, x, y}` cho test verification
- KHÔNG leader line iteration đầu — chỉ static offset

**Non-functional:**
- Zero per-frame allocation (offset tables là module-level constants)
- Frame budget: <0.5ms label layout per frame

## Architecture

```
canvas frame:
  for each label spec { text, anchor, dx, dy }:
    pos = { x: anchor.x + dx, y: anchor.y + dy }
    drawText(text, pos)
    emitMark(`label:${text}:${pos.x}:${pos.y}`)

per-route table example (ch1-3-2):
  LABELS_CH1_3_2 = [
    { text: 'T', anchor: 'rope-mid', dx: 12, dy: -8 },
    { text: 'P', anchor: 'mass-center', dx: 0, dy: 16 },
  ];
```

**Iteration roadmap (rule of three):**
- Iteration 1 (Phase 07 default): static offsets only.
- Iteration 2 (only if 3+ routes still collide after iteration 1): bump-detection (try preferred offset → if collide, try alternates from a small list).
- Iteration 3 (only if needed): leader line + spline.
- Quad-tree free-position search: defer to future plan unless data proves necessity.

## Related Code Files

- Create: `js/sim-label-layout.js` — exports `drawLabelOffset(ctx, text, anchor, dx, dy, opts?)` (small, ~30 lines)
- Modify: 15 route renderers (real shared files):
  - `js/sims/ch1/ch1-support-renderers.js` — labels cho ch1-3-x family
  - `js/sims/ch1/ch1-friction-renderers.js` — labels cho ch1-5-x family
  - `js/sims/ch3/ch3-theorems-renderers.js` — labels cho ch3-5-x family
  - Per-chapter renderers cho ch2 routes (locate via `grep -n "ctx.fillText" js/sims/ch2/`)
- Create: `js/sim-label-tables.js` — per-route offset tables (module-level constants, no allocation)
- Modify: `tests/sim-review-2026-05-19/label-collision-detector.spec.js` (RED → GREEN, 15-route fixture)
- Update: `tests/__snapshots__/sim-visual-quality-baseline.json` qua `npm run test:sim:visual-quality:update`

## Implementation Steps (TDD)

### RED
- `label-collision-detector.spec.js` confirm 15 route fail.

### GREEN
1. Implement `drawLabelOffset` (~30 lines):
   ```js
   export function drawLabelOffset(ctx, text, anchor, dx, dy, opts = {}) {
     const x = anchor.x + dx;
     const y = anchor.y + dy;
     ctx.save();
     if (opts.font) ctx.font = opts.font;
     if (opts.fillStyle) ctx.fillStyle = opts.fillStyle;
     ctx.textAlign = opts.align ?? 'left';
     ctx.fillText(text, x, y);
     ctx.restore();
     return { text, x, y };  // for marks
   }
   ```
2. Per-route migrate (3 batch, 5 route/batch):
   - Batch 1 (ch1 statics): ch1-3-2, ch1-3-6, ch1-4-2, ch1-5-1, ch1-5-4
   - Batch 2 (ch2 kinematics): 5 route from S4 list
   - Batch 3 (ch3 dynamics): ch3-5-3, ch3-5-4, ch3-6-2, ...
3. Mỗi batch: thay `ctx.fillText(label, x, y)` bằng `drawLabelOffset(ctx, text, anchor, dx, dy)` với offset tuned bằng manual visual review.
4. Document offset choices trong `js/sim-label-tables.js` comment ngắn (chỉ note lý do nếu non-obvious).

### Empirical escalation gate
After Batch 1 ships:
- Run `label-collision-detector.spec.js` — đếm số route còn collision.
- Nếu 0 collision: tiếp Batch 2/3 với cùng pattern.
- Nếu 1-2 route còn collide: hand-tune thêm offset.
- Nếu **3+ route** còn collide sau hand-tune: escalate to Iteration 2 (bump-detection). Document trong report; không silently leak quad-tree complexity.

### REFACTOR
- Sau 15 route GREEN, audit nếu offset table có duplication có thể compress (e.g., common perpendicular pattern). KHÔNG sớm extract abstraction giả.

## Success Criteria

- [ ] `js/sim-label-layout.js` ships `drawLabelOffset` (~30 lines, no quad-tree, no leader line, no frame cache)
- [ ] `js/sim-label-tables.js` per-route offset tables (module-level)
- [ ] 15 route migrate sang `drawLabelOffset`
- [ ] Capture re-run: 0 label collision visible (snapshot diff manual review)
- [ ] `tests/sim-review-2026-05-19/label-collision-detector.spec.js` PASS
- [ ] Frame budget: <0.5ms label layout per frame (perf bench)
- [ ] Visual baseline refresh + side-by-side diff approved trong PR
- [ ] Iteration escalation report: 0 escalation OR documented justification nếu Iteration 2 needed

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Static offset không đủ cho overlapping labels (3+ trong cùng vùng) | Empirical gate: nếu 3+ route fail sau hand-tune, escalate to Iteration 2 (bump-detection); không default to quad-tree |
| Offset tables grow khó maintain | Per-route tables module-level constants; <10 entries per route. Audit ở REFACTOR. |
| Theme parity (dark/light): label color contrast | `opts.fillStyle` accept theme color; test cả 2 theme |
| 15 route nhiều, scope quá lớn | Chia 3 batch: 5 route/batch, mỗi batch verify riêng + escalation gate sau Batch 1 |

## Verification Gate

Phase 07 đóng khi: 15 route migrate, spec PASS, manual visual review baseline diff acceptable, escalation report committed (0 hoặc justified), không regression text rendering.
