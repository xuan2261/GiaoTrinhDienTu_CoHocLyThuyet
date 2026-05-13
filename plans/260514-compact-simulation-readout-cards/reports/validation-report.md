---
type: validation
date: 2026-05-14
topic: compact-simulation-readout-cards
status: complete
---

# Validation Report

## Locked Decisions

| Item | Decision |
|---|---|
| Expected output | Implementation plan and later CSS/test changes for compact readout cards |
| Preferred UX | `Label    Value` on one row when enough room |
| Primary method | CSS-only in shared `.sim-lab` |
| Scope | Readout card density inside simulation right inspector |
| Non-goal | Route physics, renderers, behaviors, data schema |
| Runtime constraint | Static `HTML/CSS/JS`, offline `file://`, no bundler |

## Acceptance Criteria

- Short readout cards use one-row label/value layout on desktop right inspector.
- Card height visibly reduced from current 62px baseline.
- Labels/values remain readable in dark and light theme.
- Long values wrap, no ellipsis, no clipping.
- Mobile stacked layout remains stable.
- 58-route browser/visual gates pass.

## Test Gates

| Level | Command |
|---|---|
| Targeted | `npx playwright test tests/simulation-browser.spec.js --grep "compact readout"` |
| Syntax/unit | `npm run test:sim:unit` |
| Responsive/browser | `npm run test:sim:browser` |
| Visual/overflow/theme | `npm run test:sim:visual-quality` |
| Release fallback | `npm run test:sim:release` if broad CSS regressions suspected |

## Unresolved Questions

- None.
