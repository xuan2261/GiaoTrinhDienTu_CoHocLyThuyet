# Phase 01 - Shared Visual Primitives

## Context Links

- `DeCuong_CoHocLyThuyet.html`
- `js/sim-route-renderer-primitives.js`
- `js/sim-visual-helpers.js`
- `docs/design-guidelines.md`

## Overview

Priority: High  
Status: Completed  
Goal: nâng canvas primitives theo phong cách DeCuong để mọi route có nền grid, symbols, vector helpers, bar/graph helpers ổn định.

## Requirements

- Theme-aware canvas background and grid.
- Helpers for route-specific symbols: rotated beam, support, force pair, vector triangle, curve graph, residual/energy bars.
- No framework/build step.
- Preserve structural marks for visual QA.

## Related Code Files

- Modify: `js/sim-route-renderer-primitives.js`
- Modify if needed: `js/sim-visual-helpers.js`

## Implementation Steps

1. Update `P.frame()` to draw DeCuong-like dark/light grid background.
2. Add small primitives used by multiple route groups.
3. Keep trace marks deterministic.
4. Guard optional `SimVisualHelpers` calls.

## Todo List

- [x] Add themed grid background.
- [x] Add rotated beam/support/vector/graph primitives.
- [x] Add safe bar helpers.
- [x] Run `npm run test:sim:unit`.

## Success Criteria

- Existing renderers still mount.
- Structural marks remain route-specific.
- Canvas text/ink remains bounded.

## Risk Assessment

- Shared primitive changes affect all 58 routes. Mitigation: keep helpers additive and preserve old function signatures.

## Security Considerations

- No user HTML injection; DOM overlay continues to use `textContent`/KaTeX.

## Next Steps

Proceed to Ch1 renderer pass.
