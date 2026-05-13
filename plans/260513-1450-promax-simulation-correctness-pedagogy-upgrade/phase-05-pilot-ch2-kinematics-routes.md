# Phase 05 Pilot Ch2 Kinematics Routes

## Context Links

- [Phase 04](./phase-04-pilot-ch1-statics-routes.md)
- [Physics Research](./research/researcher-01-physics-correctness-report.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Goal | Upgrade Ch2 pilot routes for derivative/instant-center correctness |
| Routes | `ch2-1-2`, `ch2-5-2` |

## Key Insights

- `ch2-1-2` validates graph and derivative chain.
- `ch2-5-2` validates geometric kinematics and instantaneous center.
- These define rules for other graph/plane-motion routes.

## Requirements

### Functional

- `ch2-1-2`:
  - One canonical function for `x(t)`.
  - Derive `v(t)` and `a(t)` from same chain.
  - Cursor drag updates graph and readouts.
  - Diagnostic shows tangent slope and acceleration relation.
- `ch2-5-2`:
  - IC handle updates velocity vectors.
  - Velocity perpendicular to radius from IC.
  - Formula/readout uses `v = omega * r`.
  - Diagnostic shows radius lines and tangent arrows.

### Non-Functional

- No animated graph flashing.
- Pause/resume for graph routes.
- Reduced motion freezes nonessential animation.

## Architecture

```text
ch2 route state
  -> SimPhysicsKinematics helper
  -> invariant evaluator
  -> graph/IC renderer
  -> readout/formula panels
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `js/sims/ch2/ch2-trajectory-graph-renderers.js` |
| Modify | `js/sims/ch2/ch2-kinematics-behaviors-a.js` |
| Modify | `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js` |
| Modify | `js/sims/ch2/ch2-kinematics-behaviors-b.js` or current IC behavior file |
| Modify | `js/sims/ch2/*-scenes.js` readouts if needed |
| Modify/create | `tests/promax-pilot-ch2.spec.js` |

## Implementation Steps

1. Audit current `ch2-1-2` graph formula and cursor state.
2. Move derivative chain into shared evaluator/helper if duplicated.
3. Add graph diagnostic:
   - current point.
   - tangent line.
   - `x/v/a` linked marker.
4. Audit current `ch2-5-2` IC geometry.
5. Make IC invariant evaluator run after drag/slider.
6. Add visual state for pass/warn/fail.
7. Add Playwright tests for drag changing semantic readout.

## Todo List

- [ ] Upgrade `ch2-1-2` canonical derivative chain.
- [ ] Add graph diagnostics.
- [ ] Upgrade `ch2-5-2` IC invariant.
- [ ] Add IC diagnostics.
- [ ] Add unit and browser tests.
- [ ] Record matrix updates.

## Verification / Tests

```powershell
node tests\simulation-invariants.test.js --route ch2-1-2
node tests\simulation-invariants.test.js --route ch2-5-2
npm run test:sim:unit
playwright test tests\promax-pilot-ch2.spec.js
playwright test tests\simulation-interaction-engine.spec.js --grep "ch2-1-2|ch2-5-2|keyboard|reset"
npm run test:sim:visual-quality
python tools\smoke_simulation_renderer_contract.py --strict --require-routes 58
python tools\audit_simulation_quality.py --all --max-js-lines 220
```

Manual checks:

- Drag graph cursor: `x`, `v`, `a` update coherently.
- Move IC: velocity arrows remain perpendicular to IC radius.
- Mobile and landscape still usable.

## Success Criteria

- Both Ch2 pilot routes pass invariant tests.
- Graph/readout/formula come from one state chain.
- No visual overflow or interaction regression.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Numeric derivative noise | Use analytic formula where route has known function |
| IC route too visually dense | Diagnostics off by default |
| Animation test flake | Pause route before semantic assertion |

## Security Considerations

- No network or storage change.

## Next Steps

- Phase 06 applies dynamic invariant strategy to Ch3.

## Unresolved Questions

- None.
