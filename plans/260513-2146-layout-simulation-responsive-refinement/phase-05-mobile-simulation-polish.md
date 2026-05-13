# Phase 05 Mobile Simulation Polish

## Context Links

- [Phase 03](./phase-03-scoped-simulation-width.md)
- [Phase 04](./phase-04-topbar-responsive-refinement.md)
- [Simulation interaction tests](../../tests/simulation-interaction-engine.spec.js)
- [Simulation test utils](../../tests/simulation-test-utils.js)

## Overview

Priority: P2. Status: Complete. Verify and polish mobile/touch behavior after width/topbar changes.

## Key Insights

- Mobile cannot get desktop-like canvas space. Goal is no overflow and usable controls.
- Existing `<=560px` rules make sliders/buttons full width and readouts 2 columns.
- `<=380px` readouts switch to 1 column; verify 390px remains acceptable.

## Requirements

- Functional: mobile simulation page has no page horizontal scroll.
- Functional: drag/touch still works on canvas.
- Functional: readout cards and controls remain readable.
- Non-functional: no route-specific layout hacks.

## Architecture

Keep current shell:

- `.sim-lab` scoped CSS only.
- `touch-action: none` on canvas remains.
- `min-height: 44px` controls remains.
- Readout grid remains responsive, with possible breakpoint tweak if 390px is cramped.

## Related Code Files

Modify:

- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\css\style.css`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-interaction-engine.spec.js` only if adding targeted mobile coverage.
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js` only if adding mobile layout coverage.

Create:

- None expected.

Delete:

- None.

## Implementation Steps

1. Test `390x844`, `375x812`, and `360x740`.
2. Inspect:
   - `.sim-lab-scene` width.
   - Canvas visible rect.
   - Controls wrapping.
   - Readout grid wrapping.
   - Formula/hint wrapping.
3. If needed, adjust:
   - `.sim-lab` padding at mobile.
   - `.sim-readout-grid` breakpoint threshold.
   - `.sim-overlay-formula` max width.
4. Verify direct drag/touch route still updates readouts.
5. Avoid route-specific exceptions.

## Todo List

- [x] Validate mobile no-overflow.
- [x] Validate touch drag.
- [x] Validate readout cards.
- [x] Validate formula/hint wrapping.
- [x] Add test if any regression found.

## Tests

Run:

```powershell
npx playwright test tests/simulation-interaction-engine.spec.js --grep "@touch"
npx playwright test tests/simulation-browser.spec.js --grep "@responsive"
npm run test:sim:visual-quality
```

Manual route matrix:

- `ch1-2-3`: vector handles.
- `ch2-5-2`: plane motion, likely dense canvas.
- `ch3-6-2`: collision, formula/readout heavy.

## Success Criteria

- `layoutOverflow(page) <= 1` on mobile routes.
- Touch drag updates readout.
- Controls remain at least `44px` high.
- No visible text overlap in readout/hint/formula.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Readout 2 columns too tight at 390px | Switch threshold earlier if metrics prove cramped |
| Canvas becomes too small for handles | Keep logical size, test touch route; do not solve with route-specific hacks |
| Formula overlay still crowded | Adjust scoped overlay max-width/wrap only |

## Security Considerations

No security impact.

## Next Steps

Update docs/changelog in Phase 06.
