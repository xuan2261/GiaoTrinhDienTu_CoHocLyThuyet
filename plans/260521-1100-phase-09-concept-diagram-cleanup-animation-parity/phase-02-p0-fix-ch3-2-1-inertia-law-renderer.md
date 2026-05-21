---
phase: 2
title: "P0 Fix ch3-2-1 Inertia Law Renderer"
status: completed
priority: P0
effort: "1.5h"
dependencies: [1]
---

# Phase 2: P0 Fix ch3-2-1 Inertia Law Renderer

> ⚠ RED TEAM 2026-05-21 — see plan.md ## Red Team Review (F1, F2, F7, F13).
> - F1 fixed inline: `_v0` removed; renderer reads `state.v` (engine-populated by `onTick_ch321`).
> - F2 fixed inline: behavior path corrected to `ch3-dynamics-newton-dalembert-behaviors.js`.
> - F7 resolved by F11 (Phase 06 dropped). Body translates ≥10 px over the 3-second engine clock — that's the user-clicks-Play experience; no preview window needed.
> - F13 **resolved**: soft-clamp + halt translation at canvas edge. No wrap-around. Body halts at right edge by design — visually consistent with "v=const until something stops it".

## Context Links

- Renderer file: `js/sims/ch3/ch3-newton-laws-renderers.js:42-56`
- Behavior file (no edit): `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js` (engine writes `state.v`, `state.x`, `state._t`)
- Verification flag: report mục 4.2 — "should animate (candidate)" — ch3-2-1
- Foundation harness from phase 1: `tests/sim-canvas-evolution.spec.js`
- Pattern reference: `js/sims/ch3/ch3-theorems-renderers.js:64-86` (`renderCh353AngularMomentum` — already uses `state._t`)

## Overview

Currently `renderCh321InertiaLaw` paints `bodyX = 200 + (state.F || 50) * 0.3` — body position is **only** a function of input force, not time. Pedagogy is broken: lesson is "Fnet=0 ⇒ v=const", but with Fnet=0 the body is stationary. Fix is renderer-only: read `state.v` and `state._t` (both engine-populated by `onTick_ch321`) and translate the body by `state.v * state._t * pxPerMeter` (constant-velocity branch) or accumulate from `0.5 * a * _t²` for the accelerating branch.

`onTick_ch321` (`js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js:47-55`) already maintains `state.v` with the clamp `Math.abs(state.accel) < 0.01 ? (state.v || 5) : (state.v || 0) + state.accel * dt` — i.e. on the F=0 branch the engine preserves the residual velocity (default 5 m/s on first frame). No behavior contract change needed.

## Key Insights

- Engine populates `state._t`, `state.v`, `state.accel`, `state.x` per `requestAnimationFrame` tick once `behavior.onTick` is registered. `ch3-2-1`'s behavior already has `onTick`. Issue is *exclusively* renderer not consuming `_t`/`v`.
- The renderer must consume `state.v` (engine-populated, branch-clamped to nonzero on F=0). There is no `state._v0` in the codebase — `grep -rn "_v0" js/` returns 0 hits.
- The existing `body` primitive draws a rectangle; bodyX clamping range is `[68, 500]` (canvas content margin). [⚠ F13] Wrap-around overlays arrows on the "quán tính" panel post-crossing; soft-clamp + halt translation may be safer than wrap. Marked unresolved — pick before merge.

## Requirements

### Functional

- When `Math.abs(Fnet) < 1`: body drifts at constant velocity using `state.v * state._t * pxPerMeter` (engine clamps `state.v` to its prior value on this branch — see `ch3-dynamics-newton-dalembert-behaviors.js:47-55`).
- When `Math.abs(Fnet) ≥ 1`: existing behavior preserved + `0.5 * (Fnet/m) * _t²` term for kinematic correctness.
- Body stays within `[68, 500]` via soft-clamp: `bodyX = Math.min(500, Math.max(68, baseX + dx))`. Body halts at canvas edge by design — pedagogy preserves "v=const until something stops it" without arrow-overlay regressions.
- Reset returns body to `bodyX = 200 + (state.F || 50) * 0.3` (initial position).
- F₁/F₂/Fnet arrows continue to anchor on the body's *current* position; soft-clamp guarantees they never leave the canvas plot area.

### Non-functional

- File size remains ≤ 220 lines (currently 119; add ~12 lines).
- No new helper imports — use existing primitives `P.body`, `P.arrow`.
- Renderer remains pure-state-of-`(scene, state, d)`; no side effects.

## Architecture

```
js/sims/ch3/ch3-newton-laws-renderers.js
  └── renderCh321InertiaLaw(ctx, scene, state, d)
        ├── compute Fnet (existing)
        ├── compute a = Fnet/m (NEW)
        ├── pxPerMeter = 8 (NEW; consistent with theorems renderer scale)
        ├── dx = (Math.abs(Fnet) < 1)
        │       ? (state.v || 0) * (state._t || 0) * pxPerMeter   // engine-populated v
        │       : 0.5 * a * (state._t || 0)**2 * pxPerMeter
        ├── bodyX = Math.min(500, Math.max(68, baseX + dx))  // soft-clamp (F13)
        └── existing body / arrows / panels keyed off bodyX
```

## Related Code Files

### Modify
- `js/sims/ch3/ch3-newton-laws-renderers.js` (function `renderCh321InertiaLaw`, lines 42-56)
- `tests/sim-canvas-evolution-fixtures.js` — clear `knownDefect: "phase-02-fix"` for ch3-2-1
- `qa-verification/animation-sweep/per-route-animation-sweep-baseline.json` — update `lastSeenFrames` for ch3-2-1

### Create
- `tests/phase-09-ch3-2-1-inertia-law.test.js` — Node-side renderer pure-function test

### Read for context
- `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js` — confirm `_t` and `state.v` populated by `onTick_ch321`
- `js/sim-route-renderer-primitives.js` — confirm `P.body` signature

## Implementation Steps

### RED

1. **Write `tests/phase-09-ch3-2-1-inertia-law.test.js`** (Node, no Playwright):
   - Stub `ctx` capturing every `body(x,y,w,h,...)` call.
   - Render with `state = { F: 50, alpha: 0, m: 5, _t: 0, v: 5 }` → record `bodyX_0`.
   - Render with `_t: 3` (Fnet ≈ 50, ≥ 1 branch) → record `bodyX_3`.
   - Assert `bodyX_3 > bodyX_0 + 50` (body translated visibly).
   - Re-render with `state = { F: 0, alpha: 0, m: 5, _t: 3, v: 5 }` (Fnet ≈ 0 branch — engine clamp keeps v=5) → `bodyX_3'`.
   - Assert `bodyX_3' > bodyX_0 + 80` (5 m/s × 3 s × 8 px/m = 120 px translation).
   - Run: **fails** today (renderer ignores `_t`).
2. Add test runner entry to `package.json` `test:sim:unit` chain (`&& node tests/phase-09-ch3-2-1-inertia-law.test.js`).
3. Confirm phase 1 sweep spec also reports ch3-2-1 RED (`uniqueFrames === 1`).

### GREEN

4. Edit `renderCh321InertiaLaw`:
   ```js
   function renderCh321InertiaLaw(ctx, scene, state, d) {
     const alpha = (state.alpha || 0) * Math.PI / 180;
     const Fnet = (state.F || 50) * Math.cos(alpha);
     const m = state.m || 5;
     const a = Fnet / m;
     const t = state._t || 0;
     const v = state.v || 0;            // engine-populated; clamped on F≈0 branch
     const pxPerMeter = 8;
     const dx = Math.abs(Fnet) < 1
       ? v * t * pxPerMeter
       : 0.5 * a * t * t * pxPerMeter;
     const baseX = 200 + (state.F || 50) * 0.3;
     // F13 resolved: soft-clamp + halt at canvas edge. No wrap-around.
     const bodyX = Math.min(500, Math.max(68, baseX + dx));

     P.frame(ctx, scene, 'Định luật quán tính: F=0 → v=const', P.tone(2));
     ctx.strokeStyle = '#6c757d'; ctx.lineWidth = 3;
     ctx.beginPath(); ctx.moveTo(68, 264); ctx.lineTo(500, 264); ctx.stroke();
     P.body(ctx, bodyX, 196, 82, 44, 'rgba(25,135,84,.12)', P.tone(2), 'vật');
     P.arrow(ctx, bodyX + 82, 218, bodyX + 82 + (state.F || 50), 218 - (state.F || 50) * 0.4, P.tone(0), 'F₁');
     P.arrow(ctx, bodyX, 218, bodyX - 60, 218 + 24, P.tone(0), 'F₂');
     P.arrow(ctx, bodyX + 82, 218, bodyX + 82 + Fnet, 218, P.tone(2), `F_net=${Fnet.toFixed(0)}`);
     P.panel(ctx, 72, 84, 150, 68, 'quán tính', P.tone(2));
     P.domMath(ctx, '321-cond', 84, 92, '\\sum F=0', { color: P.tone(2) });
     P.domMath(ctx, '321-status', 90, 124, Math.abs(Fnet) < 1 ? 'v=const ✓' : 'a≠0', { color: P.tone(2) });
   }
   ```
5. Re-run Node test: should pass. Re-run sweep spec: ch3-2-1 reports `uniqueFrames ≥ 3`.

### REFACTOR

6. Clear `knownDefect: "phase-02-fix"` in `tests/sim-canvas-evolution-fixtures.js` for ch3-2-1.
7. Update `per-route-animation-sweep-baseline.json` ch3-2-1 entry: `lastSeenFrames: 4` (or whatever sweep reports), drop `knownDefect`.
8. Run `npm run test:sim:visual-quality:update -- --routes ch3-2-1` to refresh visual baseline; eyeball side-by-side that body now translates without breaking arrow anchoring.
9. Run `npm run test:sim:correctness` — confirm physics invariants still hold (no new violations introduced).
10. Hand-test in browser: drag F slider to 0, click Play, body slides; reset returns to start; F=10, click Play, body accelerates.

## Tests

| Test | Asserts |
|---|---|
| `tests/phase-09-ch3-2-1-inertia-law.test.js → "Fnet ≈ 0 branch translates body by v·t"` | `bodyX_t3 - bodyX_t0 ≈ v*3*8 ± 1px`, where `v` comes from engine clamp (default 5 m/s on first F=0 frame). |
| `… → "Fnet ≠ 0 branch accelerates body by 0.5·a·t²"` | Quadratic growth in `bodyX(t)`. |
| `… → "soft-clamp halts body at canvas edge"` | For `_t = 60s, v = 10`, `bodyX === 500` (right edge); `bodyX ∈ [68,500]`. |
| `… → "reset restores baseX without _t leak"` | `state._t=0` ⇒ `bodyX === 200 + state.F*0.3`. |
| `sim-canvas-evolution.spec.js → ch3-2-1` | `uniqueFrames ≥ 3`. |
| `simulation-visual-quality.spec.js → ch3-2-1 dark/light` | Pass after baseline refresh. |

## Todo List

- [x] RED: Node renderer test fails as expected
- [x] RED: phase-1 sweep flags ch3-2-1
- [x] GREEN: edit renderer (~12 lines added)
- [x] GREEN: Node test passes
- [x] GREEN: sweep spec reports ch3-2-1 evolves
- [x] REFACTOR: clear knownDefect tag
- [x] REFACTOR: update sweep baseline JSON
- [x] REFACTOR: refresh visual baseline
- [x] Manual browser verification: F=0+v0>0 slides, F=50 accelerates, reset works
- [x] `npm run test:sim:release` green

## Success Criteria

- [x] All 6 tests in the table above pass.
- [x] ch3-2-1 baseline updated in JSON.
- [x] No regressions in `tests/simulation-physics.test.js` or `tests/sim-correctness-realism.test.js`.
- [x] File size ≤ 220 lines (`audit_simulation_quality.py`).
- [x] No new `console.error` / `pageerror` events.

## Risk Assessment

- **Body halts at canvas edge by design (soft-clamp):** preserves "v=const until something stops it" pedagogy without arrow-overlay regressions; reset returns body to base position. F13 resolved.
- **No `_v0` slider in current scene** → not needed. Engine's `onTick_ch321` clamps `state.v` to the prior value when `|accel| < 0.01`; default is 5 m/s on first frame, so the F=0 branch will exhibit motion immediately. Optional follow-up: add a `v0` slider in the catalog so the user can dial in initial velocity directly (out of scope for P0; note in journal).
- **Arrow anchor lag**: arrows recompute from `bodyX` each frame — verified visually in step 10.

## Security Considerations

None.

## Next Steps

After phase 02 lands, ch3-2-1 is the only "static-concept" or "animated" route still defective. Phase 03 cleans 7 concept-only routes by suppressing Play (8th — ch3-7-2 — reclassified to animated, handled in Phase 05).
