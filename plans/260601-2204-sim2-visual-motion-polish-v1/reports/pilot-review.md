# Pilot Review

Date: 2026-06-01

## Scope

- Shared primitives:
  - slider/output transient feedback.
  - keyed readout flash that survives repeated render calls during the flash window and replaces timers per key.
  - formula highlight hook via `data-key` and `.sim2-formula-highlight`.
  - `hintPulse` and `.is-active` handle affordance.
  - canvas trail fade with old `drawTrail(points, opts)` signature preserved.
  - reduced-motion opt-out for pulse/flash/fade.
- Pilot routes:
  - `ch1-1-3`: primary handle pulse, keyed readouts, slider/readout feedback.
  - `ch2-4-4`: faded Coriolis trail, stable vector hooks for `v_rel` and `a_cor`.
  - `ch3-6-2`: before/after trail distinction, impact cue, energy-loss flash.

## Verification

- `npx playwright test tests/sim2-visual-motion-polish.spec.js --reporter=line`: PASS, 9/9.
- `npm run test:sim:release`: PASS.
- `npm run test:sim:visual:capture`: PASS, 25/25.
- `node tools\sim2-visual\build-contact-sheet.js`: PASS, 25/25 route, 58 images.

## Visual Artifacts

- Contact sheet: `plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals/contact-sheet.html`.
- Pilot screenshots:
  - `ch1-1-3__init.png`, `ch1-1-3__live.png`.
  - `ch2-4-4__t0.png`, `ch2-4-4__mid.png`, `ch2-4-4__end.png`.
  - `ch3-6-2__t0.png`, `ch3-6-2__mid.png`, `ch3-6-2__end.png`.

## Gate

Phase 02 is technically complete. Rollout Phases 03-05 are intentionally blocked on user visual approval.

## Unresolved Questions

- User approval required before rollout to all Ch1/Ch2/Ch3 routes.
