---
title: "Phase 05 - Dynamic Value Readout Migration"
status: completed
priority: P1
effort: 8h
---

# Phase 05 - Dynamic Value Readout Migration

## Context Links

- `js/sim-professional-lab.js`
- `js/sims/ch1/*-scenes.js`
- `js/sims/ch2/*-scenes.js`
- `js/sims/ch3/*-scenes.js`
- `plans/260514-0617-simulation-readout-dedup-normalization/plan.md`

## Overview

Move values like `R=...`, `x=...`, `v=...`, `omega=...`, residuals, reactions, and solver outputs from canvas overlay into explicit readout cards.

## Key Insights

- Readout dedup policy already prevents uncontrolled control echoes.
- Most dynamic values already exist in `derived(...)`; missing values should be added there or in route behavior derived functions.
- Avoid reintroducing duplicate aliases.

## Requirements

- Dynamic numeric outputs formerly shown by `P.domMath` are represented by readout cards when pedagogically needed.
- Use explicit `scene.readouts`, not blanket append policy.
- Preserve units and semantic `kind`.
- Keep known intentional equalities allowed; avoid duplicate alias cards.

## Architecture

Source of truth should be derived model state:

```js
scene.readouts = [
  { label: '|R|', key: 'resultantMagnitude', digits: 1, unit: 'N', kind: 'result' }
];
```

If key does not exist, add it to route behavior/derived helper, not to renderer.

## Related Code Files

Modify as needed:
- `js/sim-professional-lab.js`
- `js/sims/ch1/*-scenes.js`
- `js/sims/ch1/*-behaviors.js`
- `js/sims/ch2/*-scenes.js`
- `js/sims/ch2/*-behaviors.js`
- `js/sims/ch3/*-scenes.js`
- `js/sims/ch3/*-behaviors.js`
- `tests/simulation-browser.spec.js`

Create: none expected.

Delete: none.

## Implementation Steps

1. From inventory, list dynamic value overlays by route.
2. For each value, map to existing derived key or add a clear derived key.
3. Add explicit readout entries with label/unit/digits/kind.
4. Run readout dedup tests after each chapter group.
5. Ensure drag/slider updates readout cards in same draw cycle.

## Todo List

- [x] Migrate Ch1 dynamic overlays.
- [x] Migrate Ch2 dynamic overlays.
- [x] Migrate Ch3 dynamic overlays.
- [x] Add parity tests for representative values.
- [x] Re-run readout dedup gates.

## Success Criteria

- No important dynamic value is lost after `domMath` suppression.
- Readout cards remain compact and non-duplicative.
- Direct drag and slider changes visibly update readouts.

## Verify And Tests

```powershell
npx playwright test tests\simulation-browser.spec.js --grep "readout dedup"
npx playwright test tests\simulation-browser.spec.js --grep "direct drag|readout"
npm run test:sim:unit
```

## Risk Assessment

- Risk: using renderer-local computed values impossible to read out. Mitigation: move calculation into behavior/derived helper; renderer consumes the same derived value.

## Security Considerations

No security impact.

## Next Steps

Phase 06 cleans remaining scene text and diagram labels.
