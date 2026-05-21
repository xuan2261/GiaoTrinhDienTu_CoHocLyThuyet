# Phase 02 — Empty Panel Hint

## Spec
`tests/sim-review-2026-05-19/empty-panel-hint.spec.js` — first describe loop.
- For each route in `EMPTY_PANEL_ROUTES`, asserts `.sim-lab-hint` innerText.trim().length > 24.

## Routes (`EMPTY_PANEL_ROUTES` — 11)
ch2-2-2, ch3-2-1, ch3-2-2, ch3-2-3, ch3-2-5, ch3-4-1, ch3-4-2, ch3-5-3, ch3-5-4, ch3-6-2, ch3-6-3

## Root Cause Hypothesis
Scene registrations for these routes have no `hint` field, leaving the hint element empty after `lab.hint.textContent = cfg.hint || cfg.formula || cfg.feedback || ''`.

## Fix Steps
1. Locate scene definitions in `js/sims/ch2/ch2-particle-rotation-transmission-scenes.js`, `js/sims/ch3/ch3-dynamics-all-18-scenes.js`.
2. Add `hint:` field per scene with concrete instructional text (≥ 25 chars).
3. Run spec: `npx playwright test tests/sim-review-2026-05-19/empty-panel-hint.spec.js`.

## Done When
- 11 spec assertions PASS
