# Phase 03 - Ch1 Duplicate Alias Cleanup

## Context Links

- [Scout Report](./reports/scout-report.md)
- `js/sims/ch1/ch1-force-law-scenes.js`
- `js/sims/ch1/ch1-support-spatial-scenes.js`
- `js/sims/ch1/ch1-support-spatial-behaviors.js`

## Overview

Priority: P0. Status: Complete. Remove confirmed Ch1 duplicate readout aliases while keeping support/spatial pedagogical values.

## Key Insights

- Ch1 force/friction/centroid routes mostly already use `appendGenericReadouts: false`.
- Ch1 support/spatial row factory lacks explicit policy and appends generic/control cards.
- Duplicates are alias-level, not physics equality, except `R_A=R_B` can be valid.

## Requirements

- Functional: Remove duplicate cards in:
  - `ch1-2-3`: `|F₁|` vs `|F1|`
  - `ch1-3-1`: `N` vs `|N|`
  - `ch1-3-2`: `Lực căng` vs `|T|`
  - `ch1-3-7`: `N dọc trục` vs `|N| dọc trục`
  - `ch1-4-4`: `ΣF` vs `|R| cân bằng`
- Functional: Keep `ch1-3-4` `R_A` and `R_B` even when equal.
- Non-functional: Preserve direct drag and control sync.

## Architecture

```text
Ch1 scene catalog
  -> explicit output readouts only
  -> readoutPolicy disables generic/control echo where output already covers it
  -> controls remain visible in controls panel
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `js/sims/ch1/ch1-force-law-scenes.js` |
| Modify | `js/sims/ch1/ch1-support-spatial-scenes.js` |
| Modify | `tests/simulation-browser.spec.js` |

## Implementation Steps

1. For `ch1-2-3`, remove or suppress the control card for `force` if `f1Magnitude` is already shown.
2. For support/spatial factory, add route-aware `readoutPolicy`.
3. Rename or remove route readouts so a single semantic card remains per quantity.
4. Keep controls available in `.sim-controls`; do not remove sliders.
5. Add targeted assertions for affected route card labels.

## Todo List

- [x] Fix `ch1-2-3` `|F₁|/|F1|`.
- [x] Fix `ch1-3-1` `N/|N|`.
- [x] Fix `ch1-3-2` `Lực căng/|T|`.
- [x] Fix `ch1-3-7` `N dọc trục/|N| dọc trục`.
- [x] Fix `ch1-4-4` `ΣF/|R| cân bằng`.
- [x] Preserve `R_A/R_B` route behavior.

## Verify / Tests

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "Ch1 readout dedup"
npx playwright test tests/simulation-browser.spec.js --grep "direct drag"
npm run test:sim:semantic
```

Manual snapshot target:

```text
ch1-2-3: |F₁|, |F₂|, |R|, α only; no |F1| echo
ch1-3-1: one normal force magnitude card
ch1-3-2: one tension magnitude card
ch1-3-7: one axial force magnitude card
ch1-4-4: one resultant force card plus moment/equilibrium context
```

## Success Criteria

- No confirmed Ch1 duplicate alias remains.
- Route controls still update canvas/readout.
- `ch1-3-4` still shows both reactions.

## Risk Assessment

- Risk: suppressing control readout hides slider value. Mitigation: slider inline value remains in controls.
- Risk: support row factory impacts 9 routes. Mitigation: targeted route matrix after change.

## Security Considerations

- No new input surface.
- Use existing DOM-safe text rendering.

## Next Steps

- Phase 04 handles Ch2 policy and `ch2-1-3`.
