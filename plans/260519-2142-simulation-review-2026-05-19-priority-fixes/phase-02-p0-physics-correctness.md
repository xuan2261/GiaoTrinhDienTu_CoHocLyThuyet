---
phase: 2
title: "P0 Physics Correctness — ch1-3-2 ch1-3-6 ch1-5-3 ch3-5-2"
status: pending
priority: P0
effort: "8h"
dependencies: [1]
---

# Phase 2: P0 Physics Correctness

## Overview

Sửa 4 lỗi physics phát hiện qua review:
1. **ch1-3-2 Lực căng dây mềm**: slider `Hướng dây 20°` nhưng readout `α = 28°` → drift slider ↔ engine. Phase 02 chỉ giữ math invariant; slider plumbing chuyển P04 (HARD CUTOVER).
2. **ch1-3-6 Phản lực tại ngàm**: `MA = 0.9 N·m` quá nhỏ so với `R = 96 N` và arm — sai scale (px-flavored divisor 120 trong shared moment derive). Sửa scale per-route, anti-regression cho ch1-4-2.
3. **ch1-5-3 Nón ma sát mặt nghiêng**: trạng thái `trượt` ở `α=19°, μ=0.46` nhưng `tan(19°)=0.34 < 0.46` → state machine sai. Narrow fix to `routeId === 'ch1-5-3'` slipState branch.
4. **ch3-5-2 Xung lượng - động lượng**: `J = —N·s` lifecycle bug — readout đọc trước first tick. Fix: evaluate Δp on mount (no tick required).

Fix độc lập route, không làm thay đổi route id/registry. Đối chiếu công thức trong `simulation-list.md` (truth source) trước khi sửa.

## Requirements

**Functional:**
- Trạng thái physics (trượt / tự hãm / cân bằng) phải khớp công thức Coulomb / Newton
- `Δp` và `J` luôn equal khi cả hai defined; ch3-5-2 readout có giá trị ngay ở mount
- ch1-3-6 `MA = R · d_m` (m, không phải px-divisor)
- ch1-3-2 single source `state.angleDeg` (slider plumbing fix qua P04)

**Non-functional:**
- Không refactor renderer của 4 route (sửa minimal)
- Không thay đổi UI control labels
- Performance: không thêm tick per-frame

## Architecture

Mỗi route có một `behavior contract` trong shared per-chapter file. Sửa logic state evaluation/derive trong behavior, không sửa renderer.

```
[Slider Input] → [Behavior Contract.derive(state)] → [Readout Output + Renderer Marks]
                              ↑
                              └─ Phase 02 sửa MATH chỉ; slider plumbing → P04
```

## Related Code Files

**Real shared per-chapter behavior files (grep-verified 2026-05-19):**

- Modify: `js/sims/ch1/ch1-support-spatial-behaviors.js`
  - **ch1-3-2** (rope tension): lines 76, 98, 142 — angle math only. KHÔNG đụng slider event handler / state binding (chuyển P04).
  - **ch1-3-6** (fixed-end reaction): line 77 — `moment` derive `force*clamp(state.load,0,180)*Math.cos(...)/120`. Sửa scale `120` → physical `R·d_m`. **Anti-regression cho ch1-4-2** (cùng dùng `moment` derive với `routeId === 'ch1-4-2' ? alphaDeg : 0` cos factor).
- Modify: `js/sims/ch1/ch1-friction-centroid-solver-behaviors.js`
  - **ch1-5-3** (friction cone): lines 60-70 (`slipState` 3-branch logic). Narrow fix: chỉ thêm `if (routeId === 'ch1-5-3') { state.slipState = state.lockState; return; }` ĐẦU branch, trước khi rơi xuống `applied <= limit` test (route này không có applied force input).
- Modify: `js/sims/ch3/ch3-dynamics-theorem-collision-behaviors.js`
  - **ch3-5-2** (impulse-momentum): lines 39-40 (`state.pBefore`, `state.pAfter`, `state.deltaP`). State already binds `state.deltaP = J` ở tick — bug là **lifecycle**: renderer đọc trước first tick. Fix: evaluate Δp **on mount** (no tick required), seed `state.m = 2, state.J = 20, state.deltaP = 20` ở mount-time. Cùng update `derived_ch352` line 137-139.
- READ-ONLY (anti-regression assertions):
  - `js/sims/ch1/ch1-support-renderers.js:160,163` (renders cho ch1-3-2/3-6)
  - `js/sims/ch1/ch1-friction-renderers.js:86` (renders cho ch1-5-3)
  - `js/sims/ch3/ch3-theorems-renderers.js:39,110` (renders cho ch3-5-2)
- Modify: `tests/sim-review-2026-05-19/physics-invariants.test.js` (update fixtures + anti-regression for ch1-4-2, ch1-5-1, ch1-5-2, ch1-5-4)

**Scope split với Phase 04:** Phase 02 chỉ giữ MATH (công thức, state machine, mount-time eval). Toàn bộ slider plumbing cho ch1-3-2 và ch1-3-6 (slider event → state binding, value space, unit display) chuyển sang Phase 04. Tránh diff churn race khi P04 refactor `addSlider` cùng file.

## Implementation Steps (TDD)

### RED → assert failures from Phase 01
- Re-run `node tests/sim-review-2026-05-19/physics-invariants.test.js` → confirm 4 FAIL (ch1-3-2, ch1-3-6, ch1-5-3, ch3-5-2).
- Anti-regression baseline: capture readout cho ch1-4-2, ch1-5-1, ch1-5-2, ch1-5-4 ở default state — lưu fixtures để compare sau GREEN.

### GREEN — sửa từng route

**ch1-3-2 (math only):**
1. Đọc `ch1-support-spatial-behaviors.js:76,98,142` — angle math.
2. Đảm bảo angle math đọc `state.angleDeg` (single source). NẾU đang có 2 biến drift (slider raw vs derived), document trong P04 ticket nhưng KHÔNG sửa binding ở phase này.
3. Physics invariant test sẽ green hoàn toàn khi P04 đóng (slider plumbing). Phase 02 chỉ cần verify math không sai.

**ch1-3-6 (math only):**
1. Đọc `ch1-support-spatial-behaviors.js:77` — `moment: routeId === 'ch1-3-4' ? rb*(span/beam.pxPerM) : force*clamp(state.load,0,180)*Math.cos(toRad(routeId === 'ch1-4-2' ? alphaDeg : 0))/120`.
2. Branch cho `routeId === 'ch1-3-6'`: convert divisor `120` (px-flavored) → `state.pxPerM` từ scene config; verify `MA = R · d_m`. Ở `R=96 N, d=2 m`, `MA ≈ 192 N·m`.
3. **Anti-regression test ch1-4-2:** assert ch1-4-2 readout `M_O`, `M_axis` không thay đổi pre/post fix.
4. Anti-regression sibling routes ch1-3-1/3, 3-4, 3-5, 3-7 (cohabit cùng file): readout values bất biến.

**ch1-5-3 (narrow scope):**
1. Đọc `ch1-friction-centroid-solver-behaviors.js:60-70`.
2. Trong hàm derive slipState, BEFORE branch `applied <= limit`:
   ```js
   if (routeId === 'ch1-5-3') {
     state.slipState = state.lockState; // mirror lockState (no applied force on cone route)
     return;
   }
   ```
3. **Anti-regression:** ch1-5-1, ch1-5-2, ch1-5-4 displayed state KHÔNG đổi. Test fixtures cho 3 sibling routes.
4. Verify ch1-5-3: ở `α=19°, μ=0.46` → `tự hãm` (lockState true vì 19° < φ=24.7°).

**ch3-5-2 (mount-time evaluate):**
1. Đọc `ch3-dynamics-theorem-collision-behaviors.js:39-40,210` + `derived_ch352:137-139`.
2. State init seed `state.m = 2, state.J = 20, state.pBefore = 2*6 = 12, state.pAfter = 12 + 20 = 32, state.deltaP = 20` ở mount (không chờ tick).
3. Verify: trước khi user nhấn ▶ Chạy, readout `J: 20 N·s`, `Δp: 20 kg·m/s` (em-dash gone).
4. KHÔNG đụng tick logic (đã đúng).

### REFACTOR
- KHÔNG extract helpers ở phase này — tránh tạo abstraction giả khi 4 route fix nhỏ.

## Success Criteria

- [ ] `node tests/sim-review-2026-05-19/physics-invariants.test.js` math-portion PASS (ch1-3-2 binding test sẽ green ở P04)
- [ ] Capture re-run cho 4 route: ch1-3-6 MA đúng scale, ch1-5-3 hiển thị `tự hãm`, ch3-5-2 readout `J: 20 N·s` ở mount
- [ ] Anti-regression cho ch1-4-2, ch1-5-1, ch1-5-2, ch1-5-4, sibling ch1-3-x routes — readout values bất biến
- [ ] `npm run test:sim:unit` không regress
- [ ] `npm run test:sim:renderer-contract` PASS
- [ ] Đối chiếu công thức với `simulation-list.md` row tương ứng — note vào commit message
- [ ] Visual baseline cho 4 route refresh qua `npm run test:sim:visual-quality:update -- --routes ch1-3-2,ch1-3-6,ch1-5-3,ch3-5-2` + side-by-side diff committed

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Sửa scale MA cho ch1-3-6 phá ch1-4-2 (cùng `moment` derive trong `ch1-support-spatial-behaviors.js:77`) | Branch trên `routeId === 'ch1-3-6'` riêng; ch1-4-2 giữ nguyên divisor cũ; explicit anti-regression assertion |
| ch1-5-3 narrow fix bypass branch sau, làm sai ch1-5-1/5-2/5-4 | Early-return chỉ trong `routeId === 'ch1-5-3'` block; sibling routes pass-through qua applied/limit branch như cũ |
| ch3-5-2 mount-time seed phá tick lifecycle | Chỉ thêm init values; tick path đọc `state.J` đã có sẵn — không thay đổi flow |
| Phase 02 ↔ Phase 04 race trên `ch1-support-spatial-behaviors.js` | P02 chỉ math (line 77 cho ch1-3-6); slider plumbing (lines 76, 98, 142) chuyển P04. Documented split. |

## Verification Gate

Phase 02 đóng khi: 3/4 RED test GREEN (ch1-3-2 drift defer to P04), capture mới của 4 route khớp công thức, anti-regression sibling routes intact, `npm run test:sim:semantic` PASS, journal entry note physics fix details.
