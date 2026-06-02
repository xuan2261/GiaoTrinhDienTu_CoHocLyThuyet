# Phase 03 - Chapter 1 Static Affordance Rollout

## Context Links

- Pilot approval: [Pilot Three Routes](./phase-02-pilot-three-routes.md)
- Ch1 files: `js/sim2/sims/ch1/`
- Ch1 tests: `tests/sim2-ch1-mount.spec.js`, `tests/sim2-ch1-integration.spec.js`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Complete |
| Goal | Rollout affordance tinh hoc: handle, guide, readout/formula feedback, framing nhe cho 10 route Ch1. |

## Key Insights

- Ch1 is static/interactive. No time animation; polish must explain force/moment/equilibrium state.
- Effects should be triggered by drag/slider, not autoplay.

## Requirements

Functional:
- Every draggable Ch1 route has visible handle affordance and active state.
- Force/moment/support vectors highlight when related input changes.
- Readout changed flash for key output values.
- Geometry guide lines visible where they teach: moment arm, support line, friction cone, centroid reference.

Non-functional:
- No playback added to static routes.
- No noisy decorative motion.
- Keep labels non-overlapping.

## Architecture

```
Ch1 route state -> shared handle feedback -> geometry guide -> panel/readout flash
```

## Related Code Files

Modify:
- `js/sim2/sims/ch1/ch1-1-4.js`
- `js/sim2/sims/ch1/ch1-1-5.js`
- `js/sim2/sims/ch1/ch1-1-6.js`
- `js/sim2/sims/ch1/ch1-1-8.js`
- `js/sim2/sims/ch1/ch1-2-3.js`
- `js/sim2/sims/ch1/ch1-3-2.js`
- `js/sim2/sims/ch1/ch1-3-6.js`
- `js/sim2/sims/ch1/ch1-5-3.js`
- `js/sim2/sims/ch1/ch1-6-3.js`
- plus `ch1-1-3.js` only if pilot review requests adjustment.
- `tests/sim2-ch1-mount.spec.js`
- `tests/sim2-ch1-integration.spec.js`
- `tests/sim2-ui-coverage.spec.js`

Create:
- None.

Delete:
- None.

## Implementation Steps

1. Add RED route matrix tests:
   - all Ch1 routes have at least one `.sim2-handle` or explicit static control feedback.
   - handle routes show active state during drag.
   - changed readout class appears after slider/drag for one representative per route family.
2. Apply shared options:
   - `hintPulse:true` for primary handles only.
   - readout rows get stable `key`.
   - semantic classes on important vectors: force, resultant, reaction, moment, centroid.
3. Add guide lines where high value:
   - `ch1-1-4`: moment arm.
   - `ch1-1-6`: couple distance.
   - `ch1-1-8`: support reaction line.
   - `ch1-5-3`: friction cone/normal-tangent cue.
   - `ch1-6-3`: centroid reference axes.
4. Review worldBox/framing only if current visual clips/dead-space hurts readability; do not auto-fit.
5. Run Ch1 tests:
   ```powershell
   npx playwright test tests/sim2-ch1-mount.spec.js tests/sim2-ch1-integration.spec.js --reporter=line
   npm run test:sim:visual:capture
   ```

## Todo List

- [x] Add Ch1 RED matrix tests.
- [x] Add stable readout keys for Ch1.
- [x] Add handle affordance to Ch1 route primary handles.
- [x] Add guide lines to high-value routes.
- [x] Capture Ch1 review evidence.

## Success Criteria

- Ch1 mount/integration tests PASS.
- 10/10 Ch1 routes keep no label overlap.
- No new playback on static routes.
- Contact-sheet Ch1 section visibly clearer, not more cluttered.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Too many guide lines | Only route-specific guides tied to formula/readout. |
| WorldBox tweak breaks tests | Change one route at a time; run mount after each family. |
| Static route starts animating | Tests assert no playback where absent today. |

## Security Considerations

- No persistence, no user data.

## Next Steps

- Phase 04 rollout Ch2 dynamic/kinematics motion clarity.

## Unresolved Questions

- None after pilot approval.
