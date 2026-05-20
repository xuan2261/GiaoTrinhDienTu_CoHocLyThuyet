---
phase: 4
title: "P1 Slider Engine Refactor To Physical Units (Hard Cutover)"
status: pending
priority: P1
effort: "16h"
dependencies: [1, 2, 3]
---

# Phase 4: P1 Slider Engine Refactor To Physical Units (Hard Cutover)

## Overview

11 route hiển thị slider value bằng pixel (`d: 180px`, `Bán kính r1: 50px`, ...) trong khi readout panel đã ghi đơn vị vật lý (m, N, deg). **HARD CUTOVER** trong `js/sim-lab-ui.js:152` `addSlider(...)`: extend signature để nhận `physicalUnit` + `pxPerUnit` config, migrate toàn bộ 11 callsite, **xoá legacy positional path** trong cùng phase. Không feature flag, không dual-mode.

(ch1-3-3 punted: discrete chooser, không phải slider liên tục → Phase 05 mapper. 12 → 11 route.)

## Requirements

**Functional:**
- API extension: `addSlider(label, min, max, val, step, unit, onChange, opts?)` ở `js/sim-lab-ui.js:152` — backwards-compatible signature trong cùng phase trước khi xoá; opts là object mới `{physicalUnit, pxPerUnit, formatter}`.
- Engine in `js/sim-professional-lab.js:595` reads `control.physicalUnit` + `control.pxPerUnit` from per-route control config; pass through `addSlider` options.
- Slider value space chuyển sang physical unit (slider min/max/step REDEFINED trong physical units, không phải px).
- Renderer reads `state[key]` (physical), converts to px at draw boundary via `pxPerUnit`.
- Legacy positional path **xoá** sau migrate xong.

**Non-functional:**
- Không thay đổi UX (drag feel, click track) — chỉ thay value semantics + label.
- Performance: pxPerUnit precomputed (zero allocation per-frame).
- Resize listener recompute pxPerUnit khi canvas resize.

## Architecture

```
js/sim-lab-ui.js:152
  addSlider(label, min, max, val, step, unit, onChg, opts)   // opts MỚI
    where opts.physicalUnit = 'm' | 'rad' | 'N' | ...
          opts.pxPerUnit    = scalar (computed per-route from canvas dims)
          opts.formatter    = (v, u) => `${v.toFixed(...)} ${u}`

js/sim-professional-lab.js:595
  core.addSlider(lab.controls,
                 control.label, control.min, control.max, value, control.step,
                 control.unit, ...,
                 { physicalUnit: control.physicalUnit,
                   pxPerUnit:    control.pxPerUnit,
                   formatter:    control.formatter });

Per-route control config (in scene definition):
  { key: 'd', label: 'Khoảng cách d', min: 0.5, max: 5, step: 0.1,
    unit: 'm', physicalUnit: 'm', pxPerUnit: state.pxPerMeter }
```

**Critical: slider value domain change (red-team C3 fix)**
Old: `lab.addSlider('v', 10, 200, 80, 5, ' px/s', ...)` — value 80 means 80 px/s.
New: `lab.addSlider('v', 0.1, 2.0, 0.8, 0.05, 'm/s', ..., { pxPerUnit: 100 })` — value 0.8 means 0.8 m/s, renderer multiplies by 100 to get 80 px/s.

Each migrated slider = per-slider physics decision (min/max/default in physical units + pxPerUnit). KHÔNG phải generic engine relabel.

## Related Code Files

**Real codebase entry points (grep-verified 2026-05-19):**

- Modify: `js/sim-lab-ui.js:152` — extend `addSlider` signature with options-bag (additive trong cùng phase trước khi delete legacy).
- Modify: `js/sim-professional-lab.js:595` — engine forwards `control.physicalUnit` + `control.pxPerUnit` to addSlider.
- Modify: 11 route control configs (sliders embedded trong per-route scene config; grep `lab.addSlider` to find callsites):
  - `js/routes/phase-XX-ch1-statics-all-routes.js` — ch1-1-4, ch1-1-6, ch1-3-4, ch1-3-6, ch1-4-1, ch1-4-4, ch1-6-2, ch1-6-3
  - `js/routes/phase-05-ch3-dynamics-all-routes.js:188` — `lab.addSlider('v', 10, 200, 80, 5, ' px/s', ...)` — pixel-domain slider, needs full physical re-mapping
  - Per-chapter route files cho ch2-3-2, ch2-5-2, ch2-5-3 (locate via `grep -n "lab.addSlider" js/routes/`)
- Modify: `js/sims/ch1/ch1-support-spatial-behaviors.js` — slider plumbing for ch1-3-2 (lines 76, 98, 142) and ch1-3-6 (line 77). Phase 02 đã sửa math; Phase 04 sửa slider event → state binding tại đây.
- Modify: `tests/sim-review-2026-05-19/slider-unit-display.spec.js` (RED → GREEN, 11-route fixture, ch1-3-3 EXCLUDED)
- Modify: `tests/simulation-primitives.test.js` (slider unit unit-test)
- Modify: `tests/mass-conversion-audit.spec.js` (audit may auto-fail when units change — update expected values)
- DELETE LATER (cuối phase): legacy positional-only callsites — sau khi migrate hết 11 route, xoá fallback path nếu không còn caller dùng pure-pixel signature.

## Implementation Steps (TDD) — HARD CUTOVER

### Step 0 — Locate all callsites
```bash
grep -rn "lab.addSlider\|addSlider(lab.controls" js/
grep -rn "core.addSlider" js/
```
Document complete callsite list trong `reports/phase-04-slider-callsites-2026-05-20.md`. Confirm 11 target routes + any other consumers.

### Step 1 — RED
- `slider-unit-display.spec.js` confirm 11 route fail trên master HEAD.
- Add baseline cho `mass-conversion-audit.spec.js` (current pass state) để diff sau migration.

### Step 2 — GREEN engine API extension
1. Trong `js/sim-lab-ui.js:152`, extend `addSlider(label, min, max, val, step, unit, onChg, opts)` để nhận opts thứ 8.
2. Khi opts có `physicalUnit`: dùng `opts.formatter ?? defaultFormatter(v, opts.physicalUnit)` cho label rendering.
3. Trong `js/sim-professional-lab.js:595`, đọc `control.physicalUnit`, `control.pxPerUnit`, `control.formatter` và forward.
4. Add JSDoc `@param {{physicalUnit, pxPerUnit, formatter}} [opts]`.
5. Verify trong cùng phase trước Step 4: legacy callsites chưa migrate vẫn hoạt động (opts undefined → fallback to current label format).

### Step 3 — GREEN per-route migration (theo dependency order)
Pilot route đầu tiên: **ch1-1-4** (locate file via `grep -n "lab.addSlider" js/ | grep ch1-1-4`).

1. Chỉnh control config: thêm `physicalUnit`, `pxPerUnit`, `formatter` (nếu cần).
2. Re-define `min`, `max`, `default`, `step` ở **physical units** (không phải px). Document mapping trong commit message.
3. Renderer point: convert `state.d` (m) → `state.d * pxPerUnit` (px) tại draw boundary.
4. Run `slider-unit-display.spec.js` cho route đó → must PASS.
5. Run `npm run test:sim:browser` → no regression on other routes.
6. Run `npm run test:sim:visual-quality:update -- --routes ch1-1-4` + commit baseline diff với side-by-side review.

Tiếp theo theo thứ tự đơn giản → phức tạp (11 route, KHÔNG ch1-3-3):
1. ch1-1-4 (pilot, 1 slider d)
2. ch1-1-6 (1 slider d)
3. ch1-3-2 (slider angleDeg — Phase 02 đã sửa math; Phase 04 plumbing để finally green ch1-3-2 binding invariant)
4. ch1-3-4 (1 slider a)
5. ch1-3-6 (slider M arm — Phase 02 đã sửa math; Phase 04 plumbing)
6. ch1-4-1, ch1-4-4 (Fz / scale)
7. ch1-6-2, ch1-6-3 (xG/yG bằng m, hoặc remove nếu chỉ debug)
8. ch2-3-2 (r1)
9. ch2-5-2, ch2-5-3 (IC, length)
10. **ch3 dynamics** (`js/routes/phase-05-ch3-dynamics-all-routes.js:188` `v` slider) — full physical re-mapping cho velocity slider.

### Step 4 — GREEN delete legacy path
1. Sau 11 route migrate xong, grep lại để confirm KHÔNG còn callsite không dùng opts.
2. Trong `addSlider`, đổi opts từ optional → required (hoặc enforce `physicalUnit` non-null).
3. Run full `npm run test:sim:browser` + `mass-conversion-audit.spec.js` + `npm run test:sim:visual-quality` để confirm no regression.

### Step 5 — REFACTOR
- Nếu pattern `pxPerUnit = canvas.width / SCENE_WIDTH_M` lặp lại 11 lần, extract `computePxPerUnit(canvas, sceneWidthM)` helper.
- Document migration log trong `reports/phase-04-migration-log-2026-05-20.md`.

## Success Criteria

- [ ] `addSlider` API mới documented trong `js/sim-lab-ui.js` JSDoc với options-bag schema
- [ ] 11 route migrate xong; capture mới không còn `px` ở slider label
- [ ] `tests/sim-review-2026-05-19/slider-unit-display.spec.js` PASS (11 route fixture, ch1-3-3 EXCLUDED)
- [ ] `tests/sim-review-2026-05-19/physics-invariants.test.js` ch1-3-2 drift invariant GREEN (carryover from P02)
- [ ] `npm run test:sim:browser` PASS
- [ ] `npm run test:sim:browser:mass-conversion-audit` updated expected values + PASS
- [ ] `npm run test:sim:renderer-contract` PASS (58-route contract intact)
- [ ] Legacy positional-only path **xoá** sau migrate xong; grep `lab.addSlider` confirms no caller without opts
- [ ] Visual baseline cho 11 route refresh + side-by-side diff committed (per-phase protocol from P01)
- [ ] Migration log report committed

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Migrate 11 route đồng thời gây regression diện rộng | Pilot ch1-1-4 trước, batch 2-3 route/iteration, chạy `test:sim:browser` sau mỗi iteration; rollback iteration nếu fail |
| Discrete chooser ch1-3-3 (không trong fixture P04) | Punted to Phase 05 explicitly; fixture EXCLUDES ch1-3-3 |
| Pixel-domain slider (e.g., `addSlider('v', 10, 200, 80, 5, ' px/s')`) cần re-mapping value space | Per-slider physics decision: chọn physical min/max/default/step có nghĩa, document trong commit |
| `pxPerUnit` thay đổi khi resize canvas | Recompute trên `resize` event; renderer đọc fresh value không cache stale |
| `mass-conversion-audit.spec.js` auto-fail | Update expected values cho audit bằng physical units; commit audit update với migration |
| Phase 02 ↔ Phase 04 race trên `ch1-support-spatial-behaviors.js` | Phase 02 chỉ math (lines 77 cho ch1-3-6); slider plumbing (lines 76, 98, 142) chuyển P04. Documented split. |
| Floating point hiển thị `2.500001` | Formatter dùng toFixed; thêm test edge case |

## Verification Gate

Phase 04 đóng khi: 11 route migrate, legacy positional-only path xoá, all tests GREEN, capture diff cho mỗi route checked, side-by-side baseline diff approved trong PR.
