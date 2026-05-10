# Phase 04 - Ch1 Supports And Spatial Renderers

## Context Links

- `js/sims/ch1/ch1-support-spatial-scenes.js`
- Routes: `ch1-3-1`, `ch1-3-2`, `ch1-3-3`, `ch1-3-4`, `ch1-3-6`, `ch1-3-7`, `ch1-4-1`, `ch1-4-2`, `ch1-4-4`

## Overview

Priority: P0. Status: Complete. Give every support/spatial route a distinct renderer and support constraint model.

## Requirements

- 9 dedicated renderer functions.
- Each support type shows distinct mechanical symbol and reaction set.
- Spatial routes show distinct 3D/projection/equilibrium visuals.

## Architecture

Create:

```text
js/sims/ch1/ch1-support-renderers.js
js/sims/ch1/ch1-support-behaviors.js
js/sims/ch1/ch1-spatial-renderers.js
js/sims/ch1/ch1-spatial-behaviors.js
```

## Related Code Files

| Action | File |
|---|---|
| Create | support/spatial renderer and behavior modules |
| Modify | `js/sims/ch1/ch1-support-spatial-scenes.js` |
| Modify | `index.html` |
| Modify | tests and smoke gates |

## Implementation Steps

1. Split support renderers by constraint: smooth, cable, hinge, roller, fixed, two-force member.
2. Split spatial renderers by concept: resultant vector, moment projection, equilibrium board.
3. Add behavior schemas for reaction selection and axis/projection changes.
4. Add tests for support reaction arrow count/direction and spatial projection board.
5. Run Ch1 partial strict gates.

## Todo List

- [x] Implement 6 support renderers.
- [x] Implement 3 spatial renderers.
- [x] Add behavior schemas.
- [x] Add tests for reaction set changes.

## Success Criteria

- 9/9 routes have unique renderer function/body.
- No support route shares final renderer.
- Browser can distinguish support symbols with text masked.

## Verify Gate

```powershell
python tools\smoke_simulation_renderer_contract.py --strict --routes ch1-3 ch1-4
npm run test:sim:renderer-contract -- --grep "ch1-3-|ch1-4-1|ch1-4-2|ch1-4-4"
npm run test:sim:browser -- --grep "@support|@spatial|@route-mount"
```

## Risk Assessment

- Risk: 3D visuals become confusing. Mitigation: use consistent axes and projection board; keep labels concise.

## Security Considerations

No storage changes.

## Next Steps

Finish Ch1 friction, centroid, solver routes.


