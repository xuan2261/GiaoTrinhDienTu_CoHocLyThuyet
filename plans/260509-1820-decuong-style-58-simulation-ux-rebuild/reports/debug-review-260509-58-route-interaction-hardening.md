# Debug Review 260509 - 58 Route Interaction Hardening

## Summary

- Issue: user reported simulations still feel poor, hard to control, or not interactive after plan.
- Scope: all 58 simulation routes.
- Root causes:
  - Animated routes auto-ran on mount, so drag state could be overwritten by `onTick`.
  - Active/hover handle metadata existed but visual feedback was weak.
  - Canvas lacked `touch-action: none`, risky for touch drag.
  - Several Ch3 readouts depended on `onTick` values, so paused/direct drag state did not update cards.

## Fixes

- `js/sim-professional-lab.js`
  - Animated routes now open paused.
  - Direct drag pauses running animation and keeps edited state stable.
  - Active handle redraws immediately; status chip shows running/paused/manual-edit state.
- `js/sim-rendering.js`
  - Handle renderer now uses `isActive` / `isHovered` for visible rings and label badge.
- `css/style.css`
  - `.sim-lab .sim-canvas` uses `touch-action: none` and `user-select: none`.
- `js/sim-lab-ui.js`
  - Exposes `lab.status` for runtime status updates.
- `js/sims/ch3/*behaviors.js`
  - Ch3 derived readouts compute from current state, not only animation tick snapshots.
- `tests/simulation-browser.spec.js`
  - Added all-58-route direct drag audit: first handle must update readout and remain stable.
  - Added tests for paused animated start, auto-pause on drag, active visual feedback, and touch gesture guard.
- `tests/simulation-runtime-regressions.test.js`
  - Updated contract: animated routes register frame callback but start only after Play.

## Verification

- `npx playwright test tests/simulation-browser.spec.js --grep "@direct-drag-audit"` PASS: 58/58 routes.
- Manual Playwright audit PASS: `routeCount=58`, `badCount=0`, `unstableCount=0`.
- `npm run test:sim:unit` PASS.
- `npx playwright test tests/simulation-browser.spec.js --grep "@direct-drag|@touch"` PASS: 11 passed, 55 skipped.
- `npm run test:sim:release` PASS: browser suite 24 passed, 150 skipped; visual-quality 4 passed, 3 skipped.

## Residual Risk

- Many legacy broad route-mount/localization/responsive tests remain skipped by existing suite design.
- This fix hardens direct control stability/readout feedback; it does not complete full route-by-route visual redesign.

## Unresolved Questions

Không có.
