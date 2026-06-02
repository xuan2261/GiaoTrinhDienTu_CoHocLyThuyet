# Phase 02 - Pilot Three Routes

## Context Links

- Shared primitives: [Shared Visual Motion Primitives](./phase-01-shared-visual-motion-primitives.md)
- Pilot routes:
  - `js/sim2/sims/ch1/ch1-1-3.js`
  - `js/sim2/sims/ch2/ch2-4-4.js`
  - `js/sim2/sims/ch3/ch3-6-2.js`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Complete |
| Goal | Pilot visual polish tren 1 static force, 1 complex kinematics, 1 collision dynamics route de user duyet. |

## Key Insights

- `ch1-1-3`: best pilot for handle + vector/component highlight.
- `ch2-4-4`: complex Coriolis route; needs vector decomposition clarity.
- `ch3-6-2`: dynamic trail + impact moment; best for motion polish.

## Requirements

Functional:
- `ch1-1-3`: handle pulse, guide line, vector/formula/readout feedback when F/alpha changes.
- `ch2-4-4`: trail fade, clear relative path, `v_rel` and `a_cor` emphasis at current point.
- `ch3-6-2`: before/after collision trail distinction, impact cue, energy loss readout flash.
- Capture before/after images for user approval.

Non-functional:
- No physics formula changes.
- No route-specific shell layout variant.
- Keep start-paused for dynamic routes.

## Architecture

```
pilot routes use shared primitives only
  ch1 -> handle/vector feedback
  ch2 -> fade trail + guide vectors
  ch3 -> fade trail + impact cue + readout flash
```

## Related Code Files

Modify:
- `js/sim2/sims/ch1/ch1-1-3.js`
- `js/sim2/sims/ch2/ch2-4-4.js`
- `js/sim2/sims/ch3/ch3-6-2.js`
- `tests/sim2-ch1-integration.spec.js`
- `tests/sim2-ch2-mount.spec.js`
- `tests/sim2-ch3-mount.spec.js`
- `tests/sim2-visual-motion-polish.spec.js`

Create:
- Optional `plans/260601-2204-sim2-visual-motion-polish-v1/reports/pilot-review.md`.

Delete:
- None.

## Implementation Steps

1. Write/finish RED tests:
   - `ch1-1-3` has pulsing handle at mount; active class while drag.
   - slider `F` update causes readout/output changed class.
   - `ch2-4-4` canvas trail draws fade alpha after stepping.
   - `ch3-6-2` impact route sets visible impact/energy cue after collision step sequence.
2. Implement `ch1-1-3`:
   - pass `hintPulse:true` to main handle.
   - use readout `key` fields.
   - add temporary guide line or existing component line highlight on drag/slider.
3. Implement `ch2-4-4`:
   - call `canvas.drawTrail(...,{fade:true})`.
   - mark Coriolis vector/relative velocity with stable classes for tests.
   - keep vector colors from `Sim2Palette`.
4. Implement `ch3-6-2`:
   - split trail styling before/after collision or use fade plus impact marker.
   - flash `T mất` readout when value changes after impact.
   - ensure reset clears impact marker/trails.
5. Run pilot tests and capture:
   ```powershell
   npx playwright test tests/sim2-visual-motion-polish.spec.js --reporter=line
   npx playwright test tests/sim2-ch1-integration.spec.js -g "ch1-1-3" --reporter=line
   npx playwright test tests/sim2-ch2-mount.spec.js -g "ch2-4-4" --reporter=line
   npx playwright test tests/sim2-ch3-mount.spec.js -g "ch3-6-2" --reporter=line
   npm run test:sim:visual:capture
   ```
6. Create pilot review report with screenshots/contact-sheet links.
7. Stop for user approval before Phases 03-05.

## Todo List

- [x] Add RED pilot tests.
- [x] Polish `ch1-1-3`.
- [x] Polish `ch2-4-4`.
- [x] Polish `ch3-6-2`.
- [x] Capture and write pilot review.
- [x] Get user approval before rollout.

## Success Criteria

- Pilot tests PASS.
- Existing route behavior unchanged except visual feedback.
- User approves visual direction.
- No console/page errors in capture.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Coriolis route becomes visually busy | Keep only 1-2 emphasized vectors; legend unchanged. |
| Impact marker misleads physics | Cue labels state visual event only; readout remains source of truth. |
| User dislikes effects | Pilot gate before rollout. |

## Security Considerations

- No new input surfaces.
- No persistence.

## Next Steps

- Approved pilot unlocks rollout Phases 03-05.

## Unresolved Questions

- None.
