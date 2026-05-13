---
type: red-team
date: 2026-05-14
topic: compact-simulation-readout-cards
status: complete
---

# Red Team Review

## Summary

Plan is feasible. Main risk is over-compressing physics values until learners cannot scan them. Compactness is useful only if readability and overflow gates stay clean.

## Findings

| Severity | Risk | Why It Matters | Mitigation |
|---|---|---|---|
| High | Long label/value horizontal overflow | Vietnamese labels and formulas can be long | Add tests for scrollWidth/clientWidth on card/grid/lab |
| High | Value cramped or clipped | Numeric readouts are core learning feedback | Keep `max-content` only when safe; fallback wrap on narrow widths |
| Medium | One-row layout harms mobile | `390px` width may squeeze two-column mobile readouts | Add mobile viewport assertions and media fallback |
| Medium | Tests only check visibility | Current tests may miss layout regression | Add geometry/height/overflow assertions |
| Medium | Theme contrast regression | Smaller text can reduce readability | Run visual-quality dark/light contrast gates |
| Low | DOM order/a11y changes | If JS changed unnecessarily, screen reader path may shift | CSS-only; no DOM reorder |

## Required Plan Rules

- Tests first for compactness and overflow.
- No JS unless CSS-only proves impossible.
- No route-specific overrides.
- No hiding values or truncating with ellipsis.
- Rollback is removing compact CSS rules.

## Verdict

Proceed with CSS-only compact cards. Reject table/list rewrite for this round.

## Unresolved Questions

- None.
