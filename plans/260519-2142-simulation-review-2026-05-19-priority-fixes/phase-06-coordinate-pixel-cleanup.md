# Phase 06 — Coordinate Pixel Cleanup

## Spec
`tests/sim-review-2026-05-19/coordinate-pixel-cleanup.spec.js`
- For each route in `COORDINATE_CLEANUP_ROUTES`, walk readout cards. For cards whose label/key matches `(xG|yG|IC|x_C|Điểm đặt|tọa độ)`:
  - If label matches `Điểm đặt|diem dat` → fail (must be removed).
  - Else value must end in `m` (metre), no `px`, not bare 2-3 digit pair.

Plus `physics-invariants.test.js`:
  - ch1-3-6: `behaviors['ch1-3-6'].derived(...).moment ≈ 96 * 1.8` (uses physical 1.8m arm, not px divisor).
  - ch1-5-3: `derived.lockState === 'tự hãm'` for tan(19°)<0.46.

## Routes (`COORDINATE_CLEANUP_ROUTES` — 7)
ch1-1-3, ch1-1-8, ch1-6-2, ch1-6-3, ch2-5-2, ch2-5-3, ch3-5-1

## Root Cause Hypothesis
- Some readouts return canvas pixel positions as coordinate strings.
- Auxiliary "Điểm đặt" (point of application) cards exist and should be removed.
- ch1-3-6 moment formula divides force by px instead of multiplying by physical arm in metres.
- ch1-5-3 friction state classifier uses wrong threshold (slip when should be lock).

## Fix Steps
1. For the 7 routes, find readouts emitting xG/yG/IC/x_C/coordinate strings; ensure they use scene-physical metres (already the SimReadoutFormat target unit `m`).
2. Remove any `Điểm đặt …` cards from those scene readout configs.
3. Fix ch1-3-6 derived.moment to use scene arm length (1.8 m).
4. Fix ch1-5-3 derived.lockState classifier to compare `tan(alpha) < mu` ⇒ `'tự hãm'`.
5. Run spec + node test:
   - `node tests/sim-review-2026-05-19/physics-invariants.test.js`
   - `npx playwright test tests/sim-review-2026-05-19/coordinate-pixel-cleanup.spec.js`

## Done When
- Spec PASS for 7 routes
- Both physics assertions PASS
