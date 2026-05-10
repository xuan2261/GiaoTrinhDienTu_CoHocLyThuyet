# Phase 03 - Ch1 Force Fundamentals And Laws Renderers

## Context Links

- [Pedagogical Route Specificity Research](./research/pedagogical-route-specificity-research.md)
- `js/sims/ch1/ch1-force-law-scenes.js`
- Routes: `ch1-1-3`, `ch1-1-4`, `ch1-1-5`, `ch1-1-6`, `ch1-1-8`, `ch1-2-1`, `ch1-2-3`, `ch1-2-6`

## Overview

Priority: P0. Status: Complete. Replace generic statics/support/checker visuals for 8 foundational routes with distinct route renderer functions.

## Requirements

- 8 dedicated renderer functions, one per route.
- Concept-specific geometry: force anatomy, moment arm, reducer, couple, constraint release, two-force body, parallelogram, FBD builder.
- Behaviors expose correct state keys for assessment.

## Architecture

Create grouped module:

```text
js/sims/ch1/ch1-force-law-renderers.js
js/sims/ch1/ch1-force-law-behaviors.js
```

Renderer examples:
- `renderCh113ForceVectorAnatomy`
- `renderCh114MomentArm`
- `renderCh116CoupleFreeVector`

## Related Code Files

| Action | File |
|---|---|
| Create | `js/sims/ch1/ch1-force-law-renderers.js` |
| Create | `js/sims/ch1/ch1-force-law-behaviors.js` |
| Modify | `js/sims/ch1/ch1-force-law-scenes.js` |
| Modify | `index.html` |
| Modify | `tests/simulation-browser.spec.js` |

## Implementation Steps

1. Register 8 renderer functions with unique renderer ids.
2. Give each route a unique structural visual mark, not just label.
3. Add route-specific controls and derived model ids.
4. Add positive browser tests:
   - moment arm changes with perpendicular distance
   - couple keeps free moment under translation
   - parallelogram diagonal changes with angle
   - FBD builder toggles reaction set
5. Run strict gate scoped to 8 routes.

## Todo List

- [x] Implement 8 renderers.
- [x] Implement behaviors.
- [x] Link scene rows to renderer ids.
- [x] Add group browser tests.

## Success Criteria

- 8/8 routes pass unique renderer id, function reference, body hash.
- Masked canvas hashes unique across these 8.
- Direct interactions update concept-specific readout.

## Verify Gate

```powershell
python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-1-3 ch1-1-4 ch1-1-5 ch1-1-6 ch1-1-8 ch1-2-1 ch1-2-3 ch1-2-6
npm run test:sim:renderer-contract -- --grep "ch1-1-3|ch1-1-4|ch1-1-5|ch1-1-6|ch1-1-8|ch1-2-1|ch1-2-3|ch1-2-6"
npm run test:sim:browser:route-mount
```

## Risk Assessment

- Risk: renderers differ visually but not conceptually. Mitigation: route-specific browser tests target mechanics concept.

## Security Considerations

No new storage or network.

## Next Steps

Migrate Ch1 support and spatial routes.


