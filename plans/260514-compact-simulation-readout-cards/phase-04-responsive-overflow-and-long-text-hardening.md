# Phase 04 - Responsive Overflow And Long Text Hardening

## Context Links

- [Plan](./plan.md)
- [Red Team Review](./reports/red-team-review.md)
- `css/style.css`
- `tests/simulation-visual-quality.spec.js`

## Overview

Priority: P2. Status: Complete. Hardened compact cards against long text, long numeric values, dark/light theme, and mobile layout.

## Key Insights

- Vietnamese labels can be long: `Trạng thái`, `Gia tốc Coriolis`, solver residual labels.
- Values may include units, signs, decimals, or state words.
- Compact does not mean single line at all costs.

## Requirements

- No horizontal overflow in lab/grid/card.
- Long text wraps cleanly.
- On narrow widths, cards may become two-row naturally.
- Maintain mobile readout grid rules: `<=560px` two columns, `<=380px` one column.

## Architecture

CSS fallback only. Possible tactics:

- Use `grid-template-columns: minmax(0, 1fr) minmax(max-content, auto)` only if safe.
- Add media query for narrow screens to allow `grid-template-columns: 1fr`.
- Keep `overflow-wrap:anywhere` on both label and value.

## Related Code Files

| Action | File |
|---|---|
| Modify | `css/style.css` |
| Modify | `tests/simulation-browser.spec.js` |
| Optional modify | `tests/simulation-visual-quality.spec.js` |

## Implementation Steps

1. Test routes likely to expose long text: `ch1-5-4`, `ch2-4-3`, `ch3-6-2`, `ch3-7-2`.
2. Add/extend overflow assertions at `1366`, `1024`, `768`, `390`.
3. Add theme check if visual-quality already exposes contrast metrics.
4. Tune card CSS:
   - preserve compact desktop;
   - allow wrap when card width is small;
   - avoid ellipsis/truncation.
5. Re-run targeted responsive tests.

## Todo List

- [x] Add long-label route checks.
- [x] Add narrow viewport overflow checks.
- [x] Tune CSS fallback.
- [x] Verify dark/light readout readability.

## Success Criteria

- No card/grid/lab/page horizontal overflow.
- Long labels/values visible and readable.
- Mobile layout stays stable.
- Compact desktop cards remain compact for short readouts.

## Risk Assessment

- Risk: mobile two-column readout becomes too tight.
- Mitigation: allow single-column below `380px` already exists; adjust threshold only if evidence requires.

## Security Considerations

- None.

## Tests

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "compact readout|responsive"
npm run test:sim:visual-quality
```

## Next Steps

- Phase 05 runs all-route regression gates.

## Unresolved Questions

- None.
