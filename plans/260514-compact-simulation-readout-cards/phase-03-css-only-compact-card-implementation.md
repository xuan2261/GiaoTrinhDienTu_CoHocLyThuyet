# Phase 03 - CSS-Only Compact Card Implementation

## Context Links

- [Plan](./plan.md)
- [Research Synthesis](./research/research-synthesis.md)
- [Red Team Review](./reports/red-team-review.md)
- `css/style.css`

## Overview

Priority: P2. Status: Complete. Implemented compact readout cards in shared CSS only.

## Key Insights

- DOM already separates label/value.
- Best change is scoped CSS under `.sim-lab`.
- Do not edit `js/sim-professional-lab.js` unless CSS cannot work.

## Requirements

- Short label/value align on one row.
- Preserve semantic border/color by `data-readout-kind`.
- Keep value emphasized and tabular.
- Keep card readable in dark and light themes.

## Architecture

Change only presentation:

```css
.sim-lab .sim-readout-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) max-content;
  align-items: baseline;
}
```

Final implementation may tune padding, gap, min-height, wrapping.

## Related Code Files

| Action | File |
|---|---|
| Modify | `css/style.css` |
| Do not modify | `js/sim-professional-lab.js` |
| Do not modify | `js/sims/ch*/**/*.js` |

## Implementation Steps

1. Replace/follow override for `.sim-lab .sim-readout-card` with grid layout.
2. Lower `min-height` from 62px to a compact but readable target, likely `42px-48px`.
3. Set `column-gap` around `8px-10px`.
4. Set label `min-width:0`, `overflow-wrap:anywhere`.
5. Set value `justify-self:end`, `text-align:right`, preserve `tabular-nums`.
6. Keep all `data-readout-kind` color rules unchanged.
7. Run targeted compact test.

## Todo List

- [x] Update card layout CSS.
- [x] Tune padding/min-height.
- [x] Preserve semantic color rules.
- [x] Run targeted test.
- [x] Inspect representative routes manually if test shows ambiguity.

## Success Criteria

- `compact readout` targeted tests pass.
- Existing `right inspector` tests still pass.
- No JS route or engine files changed.

## Risk Assessment

- Risk: `max-content` value column causes overflow with long values.
- Mitigation: Phase 04 adds responsive hardening and may change to bounded second column.

## Security Considerations

- None.

## Tests

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "compact readout|right inspector"
npm run test:sim:unit
```

## Next Steps

- Phase 04 handles long labels/values and narrow screens.

## Unresolved Questions

- None.
