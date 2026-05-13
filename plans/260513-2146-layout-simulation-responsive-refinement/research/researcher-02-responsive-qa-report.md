# Researcher 02 Responsive QA Report

## Summary

Scope: QA strategy for responsive layout change.

Finding: existing Playwright suite already has useful simulation overflow gates. Add focused tests for topbar overlap and reading-vs-simulation width, then reuse existing all-route visual gates.

## Existing QA Assets

| File/Command | Use |
|---|---|
| `tests/simulation-browser.spec.js` | Representative responsive and shell tests |
| `tests/simulation-visual-quality.spec.js` | All-route overflow/readability checks |
| `tests/simulation-test-utils.js` | `layoutOverflow`, route open helpers |
| `tests/simulation-interaction-engine.spec.js` | Touch/direct drag checks |
| `python tools/smoke_simulation_runtime.py` | Runtime route/global/lifecycle smoke |
| `python tools/audit.py` | Content/docs audit |

## Gaps

- No explicit topbar overlap test.
- No explicit reading content width preservation test.
- No explicit "sim panel wider than reading" assertion.
- Existing visual-quality all-route check may catch overflow after the fact but not explain layout intent.

## Recommended Test Additions

1. Add helper returning layout metrics:
   - document overflow.
   - `.content-area` width.
   - `.sim-container.sim-lab` width.
   - topbar child rectangles.
2. Add viewport matrix:
   - `1366x768`.
   - `768x812`.
   - `390x844`.
3. Add route matrix:
   - Reading: home + long text + math-heavy page.
   - Simulation: `ch1-2-3`, `ch2-5-2`, `ch3-6-2`.

## Red Flags

- Tests that assert exact pixels too tightly will be brittle.
- Screenshots alone are insufficient; need numeric overflow/width assertions.
- If `loader.js` class management is added, test route changes from sim to non-sim.

## Unresolved Questions

- Whether to keep tests in `simulation-browser.spec.js` or create `layout-responsive.spec.js`. Prefer existing file unless it becomes noisy.
