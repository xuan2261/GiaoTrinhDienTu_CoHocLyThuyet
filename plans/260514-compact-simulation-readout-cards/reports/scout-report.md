---
type: scout
date: 2026-05-14
topic: compact-simulation-readout-cards
status: complete
---

# Scout Report

## Summary

Vấn đề nằm ở shared CSS/card layout, không ở từng route. `sim-professional-lab.js` đã tạo label/value riêng. `style.css` đang ép card dọc bằng `flex-direction: column` và `min-height: 62px`.

## Project Type

| Area | Finding |
|---|---|
| Runtime | Static `HTML/CSS/JS`, `file://` safe |
| Framework | None at runtime |
| QA | Node, Python smoke, Playwright |
| Simulation | 58 canonical routes, shared `SimProfessionalLab` shell |

## Relevant Files

| File | Role |
|---|---|
| `css/style.css` | Main compact layout change |
| `js/sim-professional-lab.js` | Creates `.sim-readout-card`, `.sim-readout-label`, `.sim-readout-value` |
| `js/sim-lab-ui.js` | Creates `.sim-readout-grid` slot |
| `tests/simulation-browser.spec.js` | Responsive right-inspector assertions |
| `tests/simulation-visual-quality.spec.js` | Overflow/theme readability across routes |
| `tests/simulation-test-utils.js` | Readout card helper extraction |
| `docs/design-guidelines.md` | Shared shell and responsive rules |

## Current Pattern

- DOM card structure already ideal for CSS grid:
  - parent `.sim-readout-card`
  - child `.sim-readout-label`
  - child `.sim-readout-value`
- Current CSS:
  - grid: `repeat(auto-fit, minmax(130px, 1fr))`
  - card: `display:flex; flex-direction:column; gap:2px`
  - later override: `min-height:62px`
- Right inspector already places `.sim-readout-grid` in grid column 2 for desktop.

## Constraints

- Do not edit route scenes/renderers/behaviors.
- Do not change readout text generation or units.
- Keep `data-readout-kind` and semantic colors.
- Keep touch controls min 44px; readout cards do not need 44px but must remain legible.
- No horizontal overflow at `1366`, `1024`, `768`, `560`, `390`.
- No framework/build step.

## Recommended Touchpoints

1. Add Playwright layout assertions first.
2. Change scoped CSS under `.sim-lab`.
3. If long text overflows, tune CSS wrapping, not JS.
4. Update docs/changelog after gates pass.

## Unresolved Questions

- None.
