# Phase 07 - Ch2 Relative Plane Checker Renderers

## Context Links

- `js/sims/ch2/ch2-relative-plane-motion-scenes.js`
- Routes: `ch2-4-1`, `ch2-4-2`, `ch2-4-3`, `ch2-4-4`, `ch2-5-1`, `ch2-5-2`, `ch2-5-3`, `ch2-7-1`, `ch2-7-2`

## Overview

Priority: P0. Status: Complete. Finish Ch2 with unique renderers for relative motion, plane motion, and kinematics checkers.

## Requirements

- 9 dedicated renderer functions.
- Relative motion routes differ by frame scenario, definition toggle, velocity triangle, Coriolis.
- Plane motion routes differ by rigid-body composition, instant center, velocity distribution.

## Architecture

Create:

```text
js/sims/ch2/ch2-relative-renderers.js
js/sims/ch2/ch2-plane-renderers.js
js/sims/ch2/ch2-kinematics-checker-renderers.js
js/sims/ch2/ch2-relative-plane-behaviors.js
```

## Related Code Files

| Action | File |
|---|---|
| Create | Ch2 relative/plane/checker modules |
| Modify | `js/sims/ch2/ch2-relative-plane-motion-scenes.js` |
| Modify | tests |

## Implementation Steps

1. Implement moving-frame scene renderer.
2. Implement absolute/relative/transport toggle renderer.
3. Implement velocity triangle renderer.
4. Implement Coriolis renderer with cross-product visual cue.
5. Implement plane rigid-body renderer.
6. Implement instant center renderer.
7. Implement velocity distribution renderer.
8. Implement guided and numeric checker renderers.
9. Add browser tests for IC placement, Coriolis zero/nonzero, velocity distribution.

## Todo List

- [x] Implement 4 relative renderers.
- [x] Implement 3 plane renderers.
- [x] Implement 2 checker renderers.
- [x] Add Ch2 full strict tests.

## Success Criteria

- Ch2 15/15 renderer functions unique.
- IC positive assessment still passes.
- Ch2 relative routes no longer share same renderer/interaction signature.

## Verify Gate

```powershell
python tools\smoke_simulation_renderer_contract.py --strict --routes ch2
npm run test:sim:renderer-contract -- --grep "ch2-"
npm run test:sim:browser -- --grep "ch2-|instant-center|@assessment"
```

## Risk Assessment

- Risk: Coriolis and velocity composition visuals overlap. Mitigation: dedicated structural markers required by test.

## Security Considerations

No new persistence.

## Next Steps

Migrate Ch3 fundamentals and differential routes.


