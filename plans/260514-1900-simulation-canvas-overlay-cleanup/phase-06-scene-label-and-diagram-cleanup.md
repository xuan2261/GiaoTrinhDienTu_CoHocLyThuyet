---
title: "Phase 06 - Scene Label And Diagram Cleanup"
status: completed
priority: P2
effort: 5h
---

# Phase 06 - Scene Label And Diagram Cleanup

## Context Links

- `js/sim-route-renderer-primitives.js`
- `js/sims/ch1/*-renderers.js`
- `js/sims/ch2/*-renderers.js`
- `js/sims/ch3/*-renderers.js`
- [Red Team Review](./reports/red-team-review.md)

## Overview

Clean up remaining `P.domPanel`/`P.domLabel` scene text so canvas has only short diagram labels and no equation-like/value-like annotation blocks.

## Key Insights

- Formula nodes are hard-blocked in Phase 03.
- Panels and labels can still carry equation/value text.
- Some diagram labels are legitimate and should remain.

## Requirements

- Allowed: `A`, `B`, `O`, `I`, `IC`, `F`, `F1`, `F2`, `v`, `a`, `N`, `T`, `α`, short object names.
- Forbidden in overlay labels/panels: equations, long formulas, changing numeric values, solver residuals.
- Use canvas text labels or `P.domLabel` for short labels only.

## Architecture

Use tests to detect equation-like text in `.sim-lab-overlay .sim-overlay-label,.sim-overlay-panel`. Convert offender content:

- formula/value -> formula panel/readout card
- panel title -> short diagram label
- explanatory sentence -> hint text

## Related Code Files

Modify as needed:
- `js/sims/ch1/*-renderers.js`
- `js/sims/ch2/*-renderers.js`
- `js/sims/ch3/*-renderers.js`
- `js/sim-professional-lab.js` if hint/readout support needs minor extension

Create: none expected.

Delete: none.

## Implementation Steps

1. Run overlay contract test and collect remaining panel/label offenders.
2. Convert each offender based on target classification.
3. Preserve diagram readability with shorter labels.
4. Re-run browser tests for all routes.

## Todo List

- [x] Identify non-formula overlay offenders.
- [x] Replace long panels with inspector/hint/readout content.
- [x] Keep short labels only.
- [x] Verify no overlap/overflow after cleanup.

## Success Criteria

- Overlay contains no equation-like or value-like learner text.
- Canvas still communicates geometry through short labels and visual marks.
- No route loses handle labels or accessibility metadata.

## Verify And Tests

```powershell
npx playwright test tests\simulation-browser.spec.js --grep "overlay contract"
npm run test:sim:visual-quality
```

## Risk Assessment

- Risk: overly aggressive cleanup removes useful point labels. Mitigation: allowlist short labels and inspect representative screenshots.

## Security Considerations

No security impact.

## Next Steps

Phase 07 runs full route verification.
