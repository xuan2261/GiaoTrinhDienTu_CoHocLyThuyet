# Phase 04 - Chapter 2 Motion Clarity Rollout

## Context Links

- Ch2 files: `js/sim2/sims/ch2/`
- Ch2 tests: `tests/sim2-ch2-mount.spec.js`
- Visual issue history: `docs/project-changelog.md` 2026-06-01 transmission and visual-physics fixes.

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Goal | Lam ro motion/trajectory/relative vectors cho 7 route Ch2, giu physics verified. |

## Key Insights

- Ch2 contains the most visually dense routes: trajectory, rotation, transmission, Coriolis, instant center.
- `ch2-3-2` already fixed to show gear + belt/pulley; do not regress semantic SVG hooks.
- Some Ch2 routes are static-concept; do not force playback if teaching instant state.

## Requirements

Functional:
- Animated Ch2 routes use fade trails/ghost frames where helpful.
- Rotation routes show current angle/marker clearly.
- Relative motion routes emphasize current point and vector decomposition.
- `ch2-3-2` keeps both gear mesh and belt/pulley visual.

Non-functional:
- No changes to formulas in `physics/kinematics.js`.
- Keep canvas underlay aligned with SVG <=1px.
- Reduced-motion disables non-essential effects.

## Architecture

```
Ch2 dynamic routes
  -> fade trail/current marker
  -> vector decomposition guide
  -> readout feedback
  -> capture frame validation
```

## Related Code Files

Modify:
- `js/sim2/sims/ch2/ch2-1-1.js`
- `js/sim2/sims/ch2/ch2-1-3.js`
- `js/sim2/sims/ch2/ch2-2-2.js`
- `js/sim2/sims/ch2/ch2-3-2.js`
- `js/sim2/sims/ch2/ch2-5-2.js`
- `js/sim2/sims/ch2/ch2-5-3.js`
- plus `ch2-4-4.js` only if pilot review requests adjustment.
- `tests/sim2-ch2-mount.spec.js`
- `tests/sim2-visual-physics-regression.test.js`
- `tests/sim2-visual-motion-polish.spec.js`

Create:
- None.

Delete:
- None.

## Implementation Steps

1. Add RED tests per Ch2 family:
   - trajectory route has fade trail after stepping.
   - rotation route has current marker/angle cue.
   - transmission route still has `.sim2-transmission-gear`, `.sim2-transmission-belt`, `.sim2-transmission-pulley`.
   - IC routes keep velocity vectors perpendicular to radius guides.
2. Apply fade trail and current marker:
   - `ch2-1-1`: projectile trail fade; current point stronger.
   - `ch2-2-2`: angular marker/ghost radial position.
   - `ch2-4-4`: already pilot; propagate conventions if approved.
3. Apply guide clarity:
   - `ch2-1-3`: osculating circle framing/marker; avoid clip.
   - `ch2-5-2`, `ch2-5-3`: IC radius guide and perpendicular velocity cue.
4. Keep `ch2-3-2` wording/legend consistent with both gear and belt modes/visual.
5. Run Ch2 + physics visual regression:
   ```powershell
   npx playwright test tests/sim2-ch2-mount.spec.js --reporter=line
   node tests/sim2-visual-physics-regression.test.js
   npm run test:sim:visual:capture
   ```

## Todo List

- [ ] Add Ch2 RED tests.
- [ ] Add fade trail/current marker to animated Ch2 routes.
- [ ] Add IC/radius/perpendicular guide clarity.
- [ ] Preserve `ch2-3-2` semantic hooks.
- [ ] Capture Ch2 review evidence.

## Success Criteria

- Ch2 mount tests PASS.
- Visual-physics regression PASS.
- Dynamic route frames show meaningful change in capture.
- `ch2-3-2` remains dual gear/belt visual.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Dense Coriolis/IC visuals become cluttered | Use opacity/dash; keep one highlighted current point. |
| Transmission route regression | Keep semantic hook tests and screenshot review. |
| Canvas trail expensive | Cap trail length; keep line segments simple. |

## Security Considerations

- No new data or unsafe DOM.

## Next Steps

- Phase 05 rollout Ch3 dynamics clarity.

## Unresolved Questions

- None after pilot approval.
