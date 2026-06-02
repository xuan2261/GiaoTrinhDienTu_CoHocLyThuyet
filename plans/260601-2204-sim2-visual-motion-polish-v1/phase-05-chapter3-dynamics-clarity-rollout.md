# Phase 05 - Chapter 3 Dynamics Clarity Rollout

## Context Links

- Ch3 files: `js/sim2/sims/ch3/`
- Ch3 tests: `tests/sim2-ch3-mount.spec.js`
- Physics regression: `tests/sim2-ch3-physics.test.js`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Complete |
| Goal | Lam ro law/energy/momentum/collision dynamics cho 8 route Ch3 bang cues va motion feedback nhe. |

## Key Insights

- Ch3 routes need cause/effect clarity: force -> acceleration, spring -> energy exchange, impulse -> momentum change, collision -> energy loss.
- Readout flash is high value here because outputs change over time.

## Requirements

Functional:
- Dynamic Ch3 routes show motion state with current marker/ghost/trail where useful.
- Energy/momentum changing readouts flash on meaningful value changes.
- Static-concept routes keep direct force/reaction clarity.
- Collision pilot conventions roll out only where they fit.

Non-functional:
- No physics edits.
- Start-paused remains for animated routes.
- No autoplay side effects.

## Architecture

```
Ch3 state -> visual cue
  Newton: force/accel cause
  Spring: x(t) cursor + equilibrium/limit markers
  Momentum: p(t) current marker
  Work/Energy: distance/work highlight
  Collision: before/after impact cue
```

## Related Code Files

Modify:
- `js/sim2/sims/ch3/ch3-2-2.js`
- `js/sim2/sims/ch3/ch3-2-3.js`
- `js/sim2/sims/ch3/ch3-1-3.js`
- `js/sim2/sims/ch3/ch3-3-1.js`
- `js/sim2/sims/ch3/ch3-5-2.js`
- `js/sim2/sims/ch3/ch3-5-3.js`
- `js/sim2/sims/ch3/ch3-5-4.js`
- plus `ch3-6-2.js` only if pilot review requests adjustment.
- `tests/sim2-ch3-mount.spec.js`
- `tests/sim2-ch3-physics.test.js`
- `tests/sim2-visual-motion-polish.spec.js`

Create:
- None.

Delete:
- None.

## Implementation Steps

1. Add RED tests:
   - animated Ch3 routes remain start-paused.
   - graph routes expose current cursor/marker after play/step.
   - readout changed feedback appears after a step in dynamic routes.
   - reset clears ghost/trail/impact/cursor artifacts.
2. Implement route family cues:
   - `ch3-2-2`: body ghost/current force/accel emphasis, graph cursor.
   - `ch3-2-3`: action/reaction active pairing highlight.
   - `ch3-1-3`: non-inertial force direction cue, keep previous visual-physics fix.
   - `ch3-3-1`: equilibrium line, amplitude/turning point marker, x(t) cursor.
   - `ch3-5-2`: p(t) graph/current marker, impulse highlight.
   - `ch3-5-3`: radius/current angular momentum cue.
   - `ch3-5-4`: work distance highlight and energy readout flash.
3. Run Ch3 gates:
   ```powershell
   npx playwright test tests/sim2-ch3-mount.spec.js --reporter=line
   node tests/sim2-ch3-physics.test.js
   npm run test:sim:visual:capture
   ```

## Todo List

- [x] Add Ch3 RED tests.
- [x] Add graph cursor/current marker cues.
- [x] Add readout feedback to dynamic outputs.
- [x] Add reset cleanup assertions.
- [x] Capture Ch3 review evidence.

## Success Criteria

- Ch3 mount + physics tests PASS.
- Animated routes stay paused until user action.
- Reset clears all visual artifacts.
- Contact-sheet Ch3 routes show clearer motion/cause-effect.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Visual cues imply false physics | Tie cues only to computed state/readouts. |
| Reset leaves stale marker | Explicit reset tests per route family. |
| More DOM/SVG nodes hurt performance | Keep node counts low; reuse nodes, update attrs. |

## Security Considerations

- No new storage/network.
- Keep text labels sanitized via `textContent`.

## Next Steps

- Phase 06 captures full review and prepares baseline decision.

## Unresolved Questions

- None after pilot approval.
