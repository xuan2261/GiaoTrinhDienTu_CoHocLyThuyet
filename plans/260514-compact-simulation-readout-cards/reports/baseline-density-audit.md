---
type: baseline
date: 2026-05-14
topic: compact-simulation-readout-cards
status: complete
---

# Baseline Density Audit

## Summary

Current baseline before CSS change used vertical readout cards. TDD confirmed the first short desktop card rendered as `display:flex`, so label/value were not using the target compact grid alignment.

## Evidence

| Check | Result |
|---|---|
| Route | `ch1-1-3` |
| Viewport | `1366x768` |
| Existing card display | `flex` |
| Target card display | `grid` |
| Failing-first command | `npx playwright test tests/simulation-browser.spec.js --grep "compact readout|compact-readout"` |
| Failing-first result | FAIL: card should use grid for label/value alignment |

## Current CSS Drivers

- `.sim-lab .sim-readout-card` used `display:flex` and `flex-direction:column`.
- Later `.sim-lab .sim-readout-card` override set `min-height:62px`.
- Readout DOM already exposed `.sim-readout-label`, `.sim-readout-value`, and `data-readout-kind`, so no JS/route contract change was needed.

## Unresolved Questions

- None.
