# Phase 03 - Ch2 Kinematics Route Polish

## Context Links

- `js/sims/ch2/*.js`
- `tests/simulation-interaction-engine.spec.js`

## Overview

Priority: High  
Status: Completed  
Goal: polish 15 Ch2 routes with coherent motion graphics, mode-aware trajectories, vector triangles, IC construction, and stable animation/drag state.

## Requirements

- Fix state/readout mismatch where renderer and behavior use different keys.
- Preserve Play/Pause for animated routes.
- Direct drag must update readout immediately and not drift while paused.

## Related Code Files

- Modify: `js/sims/ch2/ch2-trajectory-graph-renderers.js`
- Modify: `js/sims/ch2/ch2-rotation-gear-renderers.js`
- Modify: `js/sims/ch2/ch2-relative-motion-velocity-renderers.js`
- Modify: `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js`
- Modify: `js/sims/ch2/ch2-kinematics-exercises-renderers.js`
- Modify: `js/sims/ch2/ch2-kinematics-behaviors-a.js`
- Modify: `js/sims/ch2/ch2-kinematics-behaviors-b.js`
- Modify if needed: `js/sim-professional-lab.js`

## Implementation Steps

1. Make trajectory/graph renderers mode-aware and DeCuong-like.
2. Guard gear/belt geometry and show no-slip relation clearly.
3. Align relative velocity renderers with behavior state.
4. Polish instant center and plane motion construction.
5. Clamp solver step indexes and labels.

## Todo List

- [x] Polish all Ch2 renderer groups.
- [x] Fix identified state/readout mismatches.
- [x] Run interaction tests for Ch2 representative routes.

## Success Criteria

- 15/15 Ch2 routes pass route-owned direct drag/readout stability.

## Risk Assessment

- Ch2 has highest mismatch risk between scene control keys, behavior state, renderer state, and readout key.

## Security Considerations

- No dynamic HTML injection from labels.

## Next Steps

Proceed to Ch3 dynamics pass.
