# Phase 01 Baseline Responsive Audit

## Context Links

- [Brainstorm report](../reports/brainstorm-260513-2146-layout-simulation-responsive.md)
- [Current layout summary](../../layout_hientai.md)
- [Design guidelines](../../docs/design-guidelines.md)
- [Simulation browser tests](../../tests/simulation-browser.spec.js)
- [Visual quality tests](../../tests/simulation-visual-quality.spec.js)

## Overview

Priority: P1. Status: Complete. Capture current layout behavior before changing CSS. This prevents "looks better on my screen" changes.

## Key Insights

- Current text layout is good; preserve it.
- Current simulation shell is stable; only available width is constrained.
- Existing tests already check representative overflow at `375`, `768`, `1280`, but not reading-vs-simulation width separation.

## Requirements

- Functional: capture baseline screenshots for reading, topbar, and simulation pages.
- Non-functional: do not modify production code in this phase.
- QA: document exact existing overflow/width metrics.

## Architecture

Use Playwright/browser only for observation. No CSS changes. Evidence stored in plan-local reports.

## Related Code Files

Modify:

- None.

Create:

- `plans/260513-2146-layout-simulation-responsive-refinement/reports/baseline-responsive-audit.md`
- `plans/260513-2146-layout-simulation-responsive-refinement/reports/screenshots/*`

Delete:

- None.

## Implementation Steps

1. Open representative routes with `file://` or static server.
2. Capture screenshots for:
   - Home page.
   - Long text page, e.g. `ch1-7-1` or other long route.
   - Math-heavy page, e.g. selected Ch2/Ch3 equation page.
   - Simulation routes: `ch1-2-3`, `ch2-5-2`, `ch3-6-2`.
3. Measure per viewport `1366x768`, `768x812`, `390x844`:
   - `document.documentElement.scrollWidth - clientWidth`.
   - `.content-area` bounding width.
   - `.sim-container.sim-lab` bounding width.
   - `.topbar` child bounding boxes overlap.
4. Record findings in baseline report.

## Todo List

- [x] Capture baseline screenshots.
- [x] Record width/overflow metrics.
- [x] Identify exact topbar crowded breakpoints.
- [x] Confirm which route has worst simulation controls/readouts.

## Tests

Run:

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "@responsive"
npm run test:sim:visual-quality
```

Manual/metric checks:

- `layoutOverflow(page) <= 1` for sample routes.
- Topbar children do not overlap at `768` and `390`.

## Success Criteria

- Baseline report exists with metrics and screenshots.
- No production files changed.
- Existing responsive tests status known.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Baseline route choice misses worst case | Include one Ch1, one Ch2, one Ch3 simulation plus long text/math pages |
| Screenshots not reproducible | Record viewport, route id, theme, and command |

## Security Considerations

No data/security changes. Do not capture confidential local paths beyond repo evidence.

## Next Steps

Use baseline metrics to write failing/protective layout tests in Phase 02.
