# Phase 01 - Baseline Density Audit

## Context Links

- [Plan](./plan.md)
- [Scout Report](./reports/scout-report.md)
- [Right Inspector Plan](../260513-2300-simulation-right-inspector-panel/plan.md)
- `css/style.css`
- `tests/simulation-browser.spec.js`

## Overview

Priority: P2. Status: Complete. Captured current readout card density and overflow behavior before changes.

## Key Insights

- Current card uses column layout and `min-height:62px`.
- Right inspector already works; do not disturb its grid.
- Need baseline for desktop and mobile before compact CSS.

## Requirements

- Measure representative card height, grid height, overflow.
- Include routes with short and long readouts.
- Capture dark and light theme if easy through existing helpers.

## Architecture

No architecture change. Use browser tests/manual metrics against current DOM.

## Related Code Files

| Action | File |
|---|---|
| Read | `css/style.css` |
| Read | `js/sim-professional-lab.js` |
| Read | `tests/simulation-browser.spec.js` |
| Read | `tests/simulation-test-utils.js` |
| Create | `plans/260514-compact-simulation-readout-cards/reports/baseline-density-audit.md` |

## Implementation Steps

1. Pick representative routes: `ch1-1-3`, `ch1-2-3`, `ch2-1-2`, `ch3-6-2`.
2. Record `.sim-readout-card` count, first card height, max card height, `.sim-readout-grid` height.
3. Record `scrollWidth - clientWidth` for `document`, `.sim-lab`, `.sim-readout-grid`, card.
4. Record current CSS rules causing 2-line layout.
5. Save concise baseline report.

## Todo List

- [x] Gather route metrics at `1366x768`.
- [x] Gather route metrics at `1024x768`.
- [x] Gather route metrics at `768x900`.
- [x] Gather route metrics at `390x844`.
- [x] Save baseline report with numbers.

## Success Criteria

- Baseline proves current cards are 2-line/min-height heavy.
- No implementation done in this phase.
- Metrics are enough to compare Phase 03/04.

## Risk Assessment

- Risk: baseline overfits one route.
- Mitigation: include CH1/CH2/CH3 representatives.

## Security Considerations

- None. No user data or network.

## Tests

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "right inspector"
```

## Next Steps

- Phase 02 creates failing-first tests for compact layout.

## Unresolved Questions

- None.
