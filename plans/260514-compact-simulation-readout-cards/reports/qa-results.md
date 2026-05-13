---
type: qa
date: 2026-05-14
topic: compact-simulation-readout-cards
status: pass
---

# QA Results

## Commands

| Command | Result |
|---|---|
| `npx playwright test tests/simulation-browser.spec.js --grep "compact readout|compact-readout"` before CSS | FAIL expected: card display `flex` |
| `npx playwright test tests/simulation-browser.spec.js --grep "compact readout|right inspector|responsive"` | PASS: 11 tests; final run includes narrow-value wrap assertion |
| `npm run test:sim:unit` | PASS |
| `npm run test:sim:browser` | PASS: 180 tests |
| `npm run test:sim:visual-quality` | PASS: 4 tests |

## Notes

- Runtime route count stayed at 58.
- Readout DOM hooks and `data-readout-kind` stayed unchanged.
- Compact CSS is scoped under `.sim-lab`.
- Long/mobile readouts were checked at `1024x768`, `768x900`, and `390x844`.
- Narrow `390px` route `ch2-4-3` asserts at least one readout value wraps instead of overflowing.

## Unresolved Questions

- None.
