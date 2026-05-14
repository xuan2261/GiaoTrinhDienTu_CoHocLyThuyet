---
title: "Phase 04 - Formula Panel Migration"
status: completed
priority: P1
effort: 7h
---

# Phase 04 - Formula Panel Migration

## Context Links

- `js/sim-lab-ui.js`
- `js/sim-professional-lab.js`
- `js/sims/ch1/*-scenes.js`
- `js/sims/ch2/*-scenes.js`
- `js/sims/ch3/*-scenes.js`
- [Baseline Overlay Inventory](./phase-01-baseline-overlay-inventory.md)

## Overview

Move pedagogical formulas that used to appear on canvas into the existing `.sim-formula-panel`.

## Key Insights

- Scene catalogs already expose `scene.formula`.
- Formula panel is already in right inspector on desktop.
- Some routes have multiple overlay formulas; choose one primary formula, not a formula dump.

## Requirements

- Every route with a meaningful static formula has `scene.formula`.
- Formula panel renders non-empty formula for those routes.
- Secondary formulas only appear if needed via concise hint/readout label, not canvas.
- Keep Vietnamese/localized learner text.

## Architecture

Prefer scene data changes over renderer changes. `SimLabUI.createLab` already receives `formula: scene.formula`; use that path. Only add `lab.setFormula(...)` for routes whose formula changes by mode.

## Related Code Files

Modify as needed:
- `js/sims/ch1/*-scenes.js`
- `js/sims/ch2/*-scenes.js`
- `js/sims/ch3/*-scenes.js`
- `js/sim-professional-lab.js` only if dynamic formula support is required

Create: none expected.

Delete: none.

## Implementation Steps

1. Use Phase 01 classification to identify static formulas per route.
2. Compare against current `scene.formula`.
3. Update missing/weak formulas in scene catalogs.
4. For mode-dependent formulas, define simple scene formula variants or derive display string in engine.
5. Add/extend tests that formula panel is not empty where expected.

## Todo List

- [x] Audit `scene.formula` coverage for 58 routes.
- [x] Update missing route formulas.
- [x] Handle multi-formula routes with a primary formula.
- [x] Verify formula panel text across representative Ch1/Ch2/Ch3 routes.

## Success Criteria

- Formula context is visible outside canvas.
- No route requires canvas formula to understand basic objective.
- Formula panel stays wrapped and responsive.

## Verify And Tests

```powershell
npx playwright test tests\simulation-browser.spec.js --grep "formula panel"
npx playwright test tests\simulation-browser.spec.js --grep "right inspector|responsive"
npm run test:sim:visual-quality
```

## Risk Assessment

- Risk: formula panel becomes too dense. Mitigation: one primary formula per route; move derivation details into content page, not simulation.

## Security Considerations

KaTeX still renders local formula strings; no user-supplied input.

## Next Steps

Phase 05 migrates dynamic numeric values into readout cards.
