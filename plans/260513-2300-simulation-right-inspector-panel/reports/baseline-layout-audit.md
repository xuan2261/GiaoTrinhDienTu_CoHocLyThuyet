# Baseline Layout Audit

Date: 2026-05-13

## Scope

Representative routes:
- `ch1-2-3`: Ch1 static/vector route.
- `ch2-5-2`: Ch2 animated/graph-style route used for wide inspector TDD.
- `ch3-6-2`: Ch3 dynamics route used for mobile fallback TDD.

Touchpoints:
- `.sim-container.sim-lab`
- `.sim-header`
- `.sim-lab-scene`
- `.sim-lab-toolbar`
- `.sim-controls`
- `.sim-readout-grid`
- `.sim-formula-panel`
- `.sim-lab-hint`

## Baseline Findings

- DOM order already exposes the required inspector candidates as direct children of `.sim-container.sim-lab`.
- Before layout CSS, `.sim-container.sim-lab` computed `display: block` on wide screens.
- Canvas logical size remained `760x440`; existing CSS scaled visual size responsively.
- Existing mobile stack behavior was usable; plan preserved it under `<= 768px`.
- Existing overflow gates already covered representative widths, but did not assert right-side inspector positioning.

## Failing-First Evidence

Command:

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "right inspector"
```

Initial expected failure:
- Wide right-inspector test failed at `1366px`: expected lab `display: grid`, received `block`.
- Helper bug in lab rect measurement was fixed before implementation assertions were used.
- A Canvas2D `willReadFrequently` warning surfaced during repeated QA readbacks and was fixed at runtime/test helper source.

## Layout Contract For Implementation

- Wide `1366px` and `1024px`: scene left; readouts, controls, formula, hint right of scene.
- `768px` and `390px`: readouts, controls, formula, hint stack below scene.
- No horizontal page overflow at tested breakpoints.
- Canvas logical size remains `760x440`.

## Unresolved Questions

- None.
