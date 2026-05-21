---
phase: 5
title: "P1 Animate Five Candidate Renderers"
status: completed
priority: P1
effort: "1.5d"
dependencies: [4]
---

# Phase 5: P1 Animate Five Candidate Renderers

> ⚠ RED TEAM 2026-05-21 — see plan.md ## Red Team Review (F5, F8) + F3 reclassification.
> - F5 fixed inline (sub-step 5d, ch2-5-1): renderer must NOT add `omega * t` on top of engine-integrated `state.phi`. The engine already advances `state.phi += omega * dt` per frame in `js/sims/ch2/ch2-kinematics-behaviors-b.js:107-119`. Adding another `omega * t` doubles the rotation rate and breaks invariant `|v_B − v_A| ≈ ω·|AB|`. Renderer reads `state.phi` directly.
> - F8 **resolved (option a)** (sub-step 5b, ch3-5-1): mass-weighted centroid recomputed from the displaced particle positions each frame so the labeled "C" dot tracks the visual centroid exactly — preserves the theorem and the pedagogy. See sub-step 5b GREEN.
> - **ch3-7-2 reclassified as animated** (new sub-step 5e). Its `onTick_ch372` already writes time-oscillating residuals via `Math.sin/cos(t·k)` (`ch3-dynamics-theorem-collision-behaviors.js:117-125`); renderer change is a one-liner — read the engine-populated `d.deltaP*` directly and let the existing arrows reflect the per-frame value. No `static: true` flag for this route; Play button stays.

## Context Links

- Renderers to edit:
  - `js/sims/ch3/ch3-newton-laws-renderers.js:14-24` (ch3-1-2 force-acceleration)
  - `js/sims/ch3/ch3-theorems-renderers.js:14-37` (ch3-5-1 center of mass)
  - `js/sims/ch3/ch3-theorems-renderers.js:41-60` (ch3-5-2 impulse-momentum)
  - `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js:22-43` (ch2-5-1 plane translation+rotation)
- Pattern reference (already animated): `renderCh353AngularMomentum` at `js/sims/ch3/ch3-theorems-renderers.js:64-86` — uses `state._t * omega` for angle.
- Pattern reference (chart over time): `renderCh322NewtonSecond` at `js/sims/ch3/ch3-newton-laws-renderers.js:60-77` — `v = a * (state._t || 0)` then drawn line.
- Phase 04 baseline JSON to update: `qa-verification/animation-sweep/per-route-animation-sweep-baseline.json`

## Overview

Four renderers paint scalar state but never read `state._t`. After Sprint 1 lands the harness, each renderer gets a small `_t`-driven term. Cycle is RED → GREEN → REFACTOR per route, landed in 4 small commits to keep blast radius minimal. After all 4 GREEN, baseline JSON tightens animated-window from `[1,1]` to `[3,4]`.

## Key Insights

- Each renderer already draws a kinematic primitive (arrow, point, vector). The animation is "what does this primitive do over time" — not "add a new primitive".
- Keep the change renderer-local: behaviors already populate `_t`, `omega`, etc. No behavior contract change.
- `state._t` is unbounded; some scenes need a soft-clamp or modulo to keep visuals within canvas. Use the Phase 02 soft-clamp pattern (`Math.min(max, Math.max(min, baseX + dx))`) — it halts at canvas edges and avoids the wrap-overlay pathology F13 surfaced. Modulo only when the visual is genuinely periodic (e.g. ch3-5-2 cursor in F(t) panel).
- Don't over-animate. The point is "is this evolving?" — small visible deltas (10-30 px translation, 0.5-1 rad/s rotation) over 3 s is enough.

## Requirements

### Functional per route

| Route | Animation | Formula |
|---|---|---|
| ch3-1-2 | Force-acceleration arrow length pulses with `_t * a` (oscillates within ±20 px around base) | `a = F/m`; `arrowLen = 60 + 20*sin(0.8*t)` |
| ch3-5-1 | 3 mass particles orbit slowly; centroid C recomputed mass-weighted from displaced positions | `xCM(t) = (Σ mᵢ·xᵢ(t)) / Σ mᵢ`; same for y |
| ch3-5-2 | Impulse vector slides along F(t) panel; cumulative `Δp` bar grows | Cursor x slides left→right with `t mod 4`; `pAfter` includes `0.25*F*t` |
| ch2-5-1 | B rotates around A by engine-integrated `state.phi`; vBA recomputed each frame | Read `state.phi` from engine; do NOT add `omega * t` (F5) |
| ch3-7-2 | Numeric-residual arrows reflect engine `Math.sin/cos(t·k)` residuals each frame | Renderer reads `d.deltaP*` already populated by `onTick_ch372` |

### Non-functional

- Each renderer file remains ≤ 220 lines.
- Visual quality baseline updated per route via `npm run test:sim:visual-quality:update -- --routes <id>` after each commit.
- `npm run test:sim:correctness` still green — physics invariants must not change (we're animating *visualization*, not changing physics).

## Architecture

```
For each renderer:
  ┌─ Read state._t (default 0)
  ┌─ Compute time-derived geometry (position, angle, length)
  ┌─ Apply soft-clamp (or modulo only if genuinely periodic) when path leaves canvas
  └─ Pass to existing primitives (P.neonArrow, P.realisticPoint, P.barGraph)

No behavior change. No new primitive. No new helper module.
```

## Related Code Files

### Modify
- `js/sims/ch3/ch3-newton-laws-renderers.js` (function `renderCh312ForceAcceleration`)
- `js/sims/ch3/ch3-theorems-renderers.js` (functions `renderCh351CenterOfMass`, `renderCh352ImpulseMomentum`, `renderCh372…`)
- `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js` (function `renderCh251PlaneTranslationRotation`)
- `qa-verification/animation-sweep/per-route-animation-sweep-baseline.json` — clear `knownDefect: "phase-05-animate"` for the 4 originals (ch3-1-2, ch3-5-1, ch3-5-2, ch2-5-1) + clear `knownDefect: "phase-03-suppress"` for ch3-7-2 (reclassified); tighten window for all 5
- `tests/sim-canvas-evolution-fixtures.js` — flip 5 routes (4 originals + ch3-7-2) from `static-concept`/`animated-defect` to `animated`

### Create
- `tests/phase-09-animation-parity.test.js` — Node renderer pure-function test, 5 sub-tests (one per route)

### Read for context
- `js/sim-route-renderer-primitives.js` — confirm `P.neonArrow`, `P.realisticPoint`, `P.barGraph` accept dynamic args
- `js/sims/ch3/ch3-dynamics-newton-dalembert-behaviors.js` and `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js` — confirm `_t`, `omega`, ch3-7-2 residuals populated (no `ch3-newton-laws-behaviors.js` / `ch3-theorems-behaviors.js` files — F2)

## Implementation Steps (per route, RED → GREEN → REFACTOR)

### 5a. ch3-1-2 force-acceleration

#### RED
1. Author Node test in `tests/phase-09-animation-parity.test.js`:
   ```js
   // Capture P.neonArrow calls; assert arrow length differs between _t=0 and _t=2.
   const calls0 = render(renderCh312, { F: 50, m: 5, _t: 0 });
   const calls2 = render(renderCh312, { F: 50, m: 5, _t: 2 });
   const arrowF0 = calls0.find(c => c.fn === 'neonArrow' && c.label === 'F');
   const arrowF2 = calls2.find(c => c.fn === 'neonArrow' && c.label === 'F');
   assert.notDeepEqual([arrowF0.x2 - arrowF0.x1, arrowF0.y2 - arrowF0.y1],
                       [arrowF2.x2 - arrowF2.x1, arrowF2.y2 - arrowF2.y1]);
   ```

#### GREEN
2. Edit renderer:
   ```js
   function renderCh312ForceAcceleration(ctx, scene, state, d) {
     P.frame(ctx, scene, 'Lực tổng → gia tốc: F = ma', P.tone(0));
     const a = (state.F || 50) / (state.m || 5);
     const t = state._t || 0;
     const lenPulse = 1 + 0.3 * Math.sin(0.8 * t);            // NEW
     P.realisticGround(ctx, 72, 268, 492, { material: 'concrete' });
     const blockX = Math.min(300, 100 + a * 4);
     P.realisticBody(ctx, blockX, 194, 78, 50, `m=${state.m}`, { material: 'metal', radius: 4 });
     P.neonArrow(ctx, blockX + 78, 219,
                 blockX + 78 + (state.F || 50) * 1.2 * lenPulse,    // NEW
                 178 - (state.F || 50) * 0.4 * (lenPulse - 1),      // NEW
                 P.tone(0), 'F');
     P.neonArrow(ctx, blockX + 78, 244, blockX + 78 + a * 12 * lenPulse, 244, P.tone(2), `a=${a.toFixed(1)}`);
     P.panel(ctx, 58, 84, 148, 76, 'quan hệ lực-gia tốc', P.tone(0));
     P.domMath(ctx, '312-law', 74, 94, 'a = \\frac{\\sum F}{m}', { color: P.tone(0) });
   }
   ```

#### REFACTOR
3. Run sweep spec for ch3-1-2 → `uniqueFrames` ≥ 3.
4. Run `npm run test:sim:visual-quality:update -- --routes ch3-1-2`; eyeball.
5. Clear `knownDefect` in baseline JSON.

### 5b. ch3-5-1 center of mass

#### RED
6. Add Node test asserting:
   - mass particle position differs between t=0 and t=2,
   - mass-weighted centroid `(Σ mᵢ·xᵢ) / Σ mᵢ` computed from rendered particle positions equals the rendered "C" marker position within 0.5 px at three sample frames (t=0, t=1.5, t=3) for default masses [2, 1.5, 1].

#### GREEN — F8 resolved (option a)
7. Edit renderer to inject orbit AND recompute COM from displaced positions so the labeled "C" dot tracks the visual centroid:
   ```js
   const t = state._t || 0;
   const omega = 0.6;
   // Compute displaced positions first
   const displaced = masses.map((m, i) => {
     const ri = 24, theta_i = (i * 2 * Math.PI / 3) + omega * t;
     return {
       m: m.m,
       x: m.x + ri * Math.cos(theta_i),
       y: m.y + ri * Math.sin(theta_i),
       i,
     };
   });
   // Mass-weighted centroid OF the displaced positions (F8 fix — was static base positions)
   const totalM = displaced.reduce((s, p) => s + p.m, 0);
   const xCM = displaced.reduce((s, p) => s + p.m * p.x, 0) / totalM;
   const yCM = displaced.reduce((s, p) => s + p.m * p.y, 0) / totalM;
   displaced.forEach((p) => {
     P.realisticPoint(ctx, p.x, p.y, { text: `m${p.i + 1}`, fill: P.tone(p.i), radius: 6 + p.m * 2 });
     P.dashedLine(ctx, p.x, p.y, xCM, yCM, P.tone(6));
   });
   P.realisticPoint(ctx, xCM, yCM, { text: 'C', fill: P.tone(2), radius: 7 });
   ```
   *Note*: pedagogy preserved — students can see that even as particles orbit, the mass-weighted centroid `C` is well-defined every instant. (For equal masses on a circle the centroid would be stationary at the geometric centre; for unequal masses it traces a small loop, which is the correct theorem result and visually compelling.)

#### REFACTOR
8. Run sweep + visual-quality update + clear knownDefect.

### 5c. ch3-5-2 impulse-momentum

#### RED
9. Node test: `pAfter` differs at `_t=0` vs `_t=2`.

#### GREEN
10. Edit renderer:
    ```js
    const t = state._t || 0;
    const F = state.F || 20;
    const pBefore = (state.m || 2) * 6;
    const pAfter = pBefore + (state.J || 20) * Math.min(1, t / 4) + 0.25 * F * t;     // NEW: time-dependent

    // Add a moving cursor in the F(t) panel showing current integration position
    const cursorX = 96 + ((t * 30) % 110);                                              // NEW
    ctx.save();
    ctx.strokeStyle = P.tone(2); ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(cursorX, 100); ctx.lineTo(cursorX, 224); ctx.stroke();
    ctx.restore();

    // existing barGraph calls now consume time-dependent pAfter
    ```

#### REFACTOR
11. Sweep + visual update + clear knownDefect. Also verify `tests/simulation-physics.test.js` invariant `J = Δp` still holds at steady state (after `t > 4`, integration saturates).

### 5d. ch2-5-1 plane translation + rotation

#### RED
12. Node test: `vB.vx` differs at `_t=0` vs `_t=2`. Plus invariant assertion: `|v_B − v_A| ≈ ω·|AB|` within 0.5 %.

#### GREEN — F5 fix: read `state.phi` directly (engine already integrates it)

13. Edit renderer:
    ```js
    function renderCh251PlaneTranslationRotation(ctx, scene, state, d) {
      P.frame(ctx, scene, 'Chuyển động phẳng: v_B = v_A + ω × AB', P.tone(1));
      const ox = state.ox || 180, oy = state.oy || 170;
      // F5: engine integrates state.phi via onTick_ch251 (ch2-kinematics-behaviors-b.js:107-119);
      //     renderer reads phi directly. Do NOT add another `omega * t` term — that doubles rotation.
      const phi = state.phi || 0;
      const omega = state.omega || 1.0;
      const ax0 = state.ax || (ox + 80), ay0 = state.ay || oy;
      const bx0 = state.bx || (ax0 + 160), by0 = state.by || ay0;
      // Rotate B around A by phi (kinematic rigid-body motion)
      const dx = bx0 - ax0, dy = by0 - ay0;
      const bx = ax0 + dx * Math.cos(phi) - dy * Math.sin(phi);
      const by = ay0 + dx * Math.sin(phi) + dy * Math.cos(phi);
      // Recompute vBA from rotated geometry
      const vA = state.vA || { vx: 46, vy: -8 };
      const vBA = { vx: -omega * (by - ay0), vy: omega * (bx - ax0) };
      const vB = { vx: vA.vx + vBA.vx, vy: vA.vy + vBA.vy };
      // ... existing draws using bx/by/vBA/vB ...
    }
    ```

#### REFACTOR
14. Sweep + visual update + clear knownDefect. Verify invariant `|v_B - v_A| ≈ ω·|AB|` still passes (`tests/simulation-invariants.test.js`).

### 5e. ch3-7-2 numeric-residual checker (reclassified from static)

The engine already evolves the residual via `Math.sin/cos(t·k)` in `onTick_ch372` (`js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js:117-125`); the renderer just needs to read the per-frame `d.deltaP*` values that `onTick_ch372` writes to the readout-derived state instead of the time-zero snapshot.

#### RED
15. Add Node test asserting the rendered residual arrow length differs between `_t=0` and `_t=2` for fixed slider state. Use the actual `behavior.onTick(state, dt=2.0, scene)` to advance state, then call renderer with that mutated state.

#### GREEN
16. In the existing `renderCh372…` function, replace any baseline-state read with `state.deltaP1`, `state.deltaP2` (or whichever fields `onTick_ch372` writes — confirm via grep). One-liner per arrow length; no new primitives. Verify Play button stays (no `static` flag added).

#### REFACTOR
17. Sweep + visual update. Clear `knownDefect: "phase-03-suppress"` for ch3-7-2 in baseline JSON; bucket flips from `static-concept` → `animated`; expectedUniqueFrames `[3, 4]`. Update fixture file: move ch3-7-2 from `STATIC_ROUTES_CONCEPT_DIAGRAM` → `ANIMATED_ROUTES_EVOLVING`. Self-check assertion stays `25 + 7 + 26 = 58` (Phase 03 dropped one from concept, ch3-7-2 joins animated).

## Tests

| Test | Asserts |
|---|---|
| `phase-09-animation-parity.test.js` (5 sub-tests — one per route) | Each renderer mutates output between `_t=0` and `_t=2`. |
| `phase-09-animation-parity.test.js → ch3-5-1 centroid invariant` | At t∈{0,1.5,3} the rendered "C" dot is within 0.5 px of `(Σ mᵢ·xᵢ) / Σ mᵢ` of rendered particle positions. |
| `sim-canvas-evolution.spec.js → 5 candidates` | `uniqueFrames ≥ 3` after each phase 5* lands. |
| `simulation-invariants.test.js` | No regression. |
| `simulation-physics.test.js` | No regression. |
| `simulation-visual-quality.spec.js` | Pass after baseline update. |

## Todo List

- [x] 5a ch3-1-2 RED → GREEN → REFACTOR
- [x] 5b ch3-5-1 RED → GREEN → REFACTOR (F8 fix: mass-weighted centroid from displaced positions)
- [x] 5c ch3-5-2 RED → GREEN → REFACTOR
- [x] 5d ch2-5-1 RED → GREEN → REFACTOR
- [x] 5e ch3-7-2 RED → GREEN → REFACTOR (reclassified animated)
- [x] Baseline JSON: 5 entries cleared, window tightened
- [x] Fixtures bucket update for 5 routes
- [x] `npm run test:sim:release` green

## Success Criteria

- [x] All 5 renderers consume engine-populated time-derived state (`_t`, `phi`, residuals).
- [x] ch3-5-1 centroid test passes at all 3 sample frames within 0.5 px tolerance.
- [x] Each route's baseline window is `[3,4]` (animated bucket).
- [x] Visual baselines refreshed for all 5 routes.
- [x] No regressions in physics/invariants tests.

## Risk Assessment

- **F8 resolved (option a):** mass-weighted centroid recomputed from displaced positions every frame; the rendered "C" dot tracks the visual centroid by construction. Centroid invariant test (5b RED) pins the mathematical relationship so a future regression can't silently desync.
- **ch2-5-1 (F5 fixed):** renderer reads `state.phi` directly; engine integrates it via `onTick_ch251`. Body-rect translation not introduced — only rotation around A. Invariant `|v_B − v_A| ≈ ω·|AB|` preserved (verified by RED test).
- **ch3-5-2 cumulative pAfter could overflow bar graph max** → barGraph clamps to `pMax=100`; if pAfter > 100, just saturates visually — fine.
- **ch3-1-2 pulse-aliasing on hash grid** → step=8 hash (per Phase 01 F14 fix) catches the 0.8 rad/s pulse; verify in sweep RED.
- **ch3-7-2 reclassification (engine already animated):** the renderer change is small but the bucket flip touches `tests/sim-canvas-evolution-fixtures.js` self-check arithmetic. Update both the array and the assertion (`25 + 7 + 26 = 58`) atomically — single commit.

## Security Considerations

None.

## Next Steps

Phase 06 was dropped per F11 (planner-invented UX without content-owner validation). Phase 07 begins ch2-5-2/ch2-5-3 motion-intent investigation.
