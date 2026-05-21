# Phase 01 — Slider Unit Display

## Spec
`tests/sim-review-2026-05-19/slider-unit-display.spec.js`
- Asserts `.sim-controls` innerText for 13 routes contains no `\bpx\b` (case-insensitive).

## Routes (`S1_SLIDER_UNIT_ROUTES` — 13)
ch1-1-4, ch1-1-6, ch1-3-2, ch1-3-4, ch1-3-6, ch1-4-1, ch1-4-4, ch1-6-2, ch1-6-3, ch2-3-2, ch2-5-2, ch2-5-3, ch3-5-2

## Linked Physics Test
`physics-invariants.test.js` requires `behaviors['ch1-3-2'].derived(...)` returns `derived.alpha === state.alpha` — slider angle in degrees must equal readout alpha (no px-style implicit scaling).

## Root Cause Hypothesis
Slider configs in renderer/behavior files set `unit: 'px'` for length sliders or label sliders without a unit at all. Need to swap units to `m`/`°`/etc per `SimReadoutFormat.UNIT_RULES`.

## Fix Steps
1. Grep `slider` configs in `js/sims/ch1/`, `js/sims/ch2/`, `js/sims/ch3/` for the 13 routes.
2. Replace any `unit: 'px'` or empty unit with semantic unit (m for lengths, ° for angles, kg for masses, N for loads).
3. Confirm slider value passed to behavior matches the displayed unit (no implicit px→m conversion in derived).
4. Run spec: `npx playwright test tests/sim-review-2026-05-19/slider-unit-display.spec.js`.

## Done When
- 13 spec assertions PASS
- physics-invariants.test.js ch1-3-2 alpha drift assertion PASS
