# Review Report: Simulation Quality Audit

**Date:** 2026-05-18
**Reviewer:** /ck:debug + /ck:brainstorm hybrid
**Scope:** All 58 active simulation routes (ch1, ch2, ch3)

## 1. Evidence captured

| File | Phenomenon |
|---|---|
| `review-sim-ch1-2-3.png` | Parallelogram law: F1 handle (đỏ) lơ lửng cách mũi tên ~30px; F2 handle đặt cạnh mũi tên nhưng vector đi qua điểm khác |
| `review-sim-ch2-1-1.png` | Trajectory: ellipse mờ + 1 chấm + 2 mũi tên chen lấn, không trail, label rỗng |
| `review-sim-ch3-3-1.png` + `…running.png` | Spring: khi `m` trượt, lò xo KHÔNG co giãn theo — đầu lò xo cố định, mass dịch ra phải, hở khoảng trắng |
| `review-sim-ch2-2-2.png` | Rotation: bánh xe = vòng tròn + 4 nan, panel "QUAN HỆ QUAY" rỗng |
| `review-sim-ch3-6-2.png` | Collision: 2 chấm tròn 6px + mũi tên 30px trong canvas 760×440 → tỉ lệ vật/khung cực thấp |

## 2. Root causes (line:file evidence)

### RC1 · Handle decoupled from body
- `js/sim-professional-lab.js:919` `ch1Handles()` ch1-2-3 returns `{x: 248, y: clamp(112+alpha, 72, 214)}` while `js/sims/ch1/ch1-force-law-renderers.js:151-178` draws F2 from `PARA_O` to `state.secondary`. Two different state sources.
- `js/sim-professional-lab.js:1086-1091` legacy fallback `legacy-primary` + `legacy-vector` still active, contradicting `docs/system-architecture.md:39`.

### RC2 · 40/58 routes static
- `grep -rn "function onTick" js/sims/` returns 18 onTicks, all in ch2/ch3. Ch1 has zero onTick.
- `js/sim-animation-engine.js` particle pool 200 unused — `grep createParticleEmitter` in `js/sims/` returns 0 hits.

### RC3 · Low-fidelity primitives
- `js/sim-route-renderer-primitives.js:301-393`: `realisticBody`/`realisticBeam`/`realisticWheel` rely on `rect + linearGradient(5 stops) + shadow`. No rim highlight, no AO.
- `js/sim-route-renderer-primitives.js:260-284`: `spring()` zigzag via alternating `lineTo`. Sharp V-shapes, not coil.

### RC4 · Spring/cable base decoupling
- `js/sims/ch3/ch3-spring-mass-coupled-springs-dalembert-renderers.js:18-21`:
  - `sx1 = 80` (fixed) but mass body at `92 + x*50` → 12px gap when stationary, more when displaced.

### RC5 · Overlay text suppressed
- `js/sim-route-renderer-primitives.js:91-98`: `isShortOverlayLabel` whitelist `^([A-Z]|[A-Z]\d|O|IC|F|F1|F2|v|a|N|T|x|y|α)$` rejects `M_O`, `Rx`, `v_a`, `m₁`, `aₙ`. Without `SIM_ALLOW_CANVAS_FORMULA_OVERLAY`, all such labels become `domLabelSuppressed`.

### RC6 · Three palette layers
- `SimCore.COLORS` (`js/sim-core.js`)
- `primitives.palette = ['#dc3545','#0d6efd',...]` (`js/sim-route-renderer-primitives.js:4`)
- `PARA_COLORS` (`js/sims/ch1/ch1-force-law-renderers.js:9`)
- Dark grid `rgba(255,255,255,.045)` too faint, light theme not exercised.

## 3. Brainstorm options

| Option | Scope | Effort | Trade-off |
|---|---|---|---|
| A · Targeted P0 fix | RC1 + RC4 + RC5 | 2-3 days | Bớt sai, không nâng cấp visual |
| B · Primitive overhaul | Rebuild 7 primitives với rim highlight + texture cache + sinusoidal spring | 1 week | +30% paint, cần test 58 route |
| C · Mass-add animation | Generic onTick cho ch1, sparks cho collision, trail cho trajectory | 1 week | Animation tự động có thể nhiễu giáo huấn |
| D · Engine swap | Matter.js/pixi.js | 3-4 weeks | Phá legacy/pilot policy, +500KB bundle |
| **E · Hybrid (A + B + selective C)** ★ | A trước, sau đó B, cuối cùng C chỉ áp ch1-2-3, ch3-6-2, ch2-1-1 | 2-3 weeks | Cân bằng nhất, không vi phạm offline policy |

**Selected:** Option E. Past rewrites (`260508-simulation-redesign`, `260508-simulation-visual-overhaul`, `260510-simulation-rewrite-v2`) show full rebuild fails to address bugs; need correctness-first then incrementally improve fidelity.

## 4. Plan mapping

- Phase 02 → RC1
- Phase 03 → RC4
- Phase 04 → RC5
- Phase 05/06/07 → RC3 split
- Phase 08 → RC2 + RC6

## Unresolved questions

- Matter.js for ch3-6-2 elastic collision opt-in?
- Light theme as first-class delivery?
- Allow PNG sprite (50-200KB) for texture realism?
- Auto-demo cycle for ch1 statics: default on or opt-in?
