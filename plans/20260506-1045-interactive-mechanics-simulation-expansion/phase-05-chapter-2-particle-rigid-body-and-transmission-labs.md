# Phase 05 Chapter 2 Particle Rigid Body And Transmission Labs

## Context Links

- [Coverage Matrix](./research/simulation-coverage-matrix.md)
- [Phase 02](./phase-02-simulation-runtime-foundation.md)

## Overview

Priority: P1. Status: Complete. Add/extend Ch2 I-III labs: particle motion, Cartesian/natural coordinates, translation, rotation, gear/belt/pulley transmission.

## Key Insights

- Ch2 needs graphs tied to motion.
- Existing particle/natural/rotation/gear sims should be preserved and enriched.
- `x(t), v(t), a(t)` visual is core for retention.

## Requirements

| Route Group | Required Interactions |
|---|---|
| `ch2-1-*` | vector path, Cartesian graph, natural coordinate components, motion presets |
| `ch2-2-*` | translation vs fixed-axis rotation |
| `ch2-3-*` | gear, belt, pulley, ratio, direction |

## Architecture

Add Ch2 sims to `SimKinematics`. Use shared plot helper from `SimCore`:

`sampleFunction(t)` -> `path plot` + `time graph` + `instant vectors`.

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-kinematics.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\sim-core.js` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\js\simulations.js` |

## Implementation Steps

1. Extend `ch2-1-1` with position/velocity/acceleration overlays.
2. Add Cartesian equation lab for `ch2-1-2`.
3. Extend natural coordinate lab for `ch2-1-3`: `aτ`, `an`, curvature.
4. Add preset gallery for `ch2-1-4`: straight uniform, uniformly accelerated, circular, projectile.
5. Add translation lab for `ch2-2-1`.
6. Extend fixed-axis rotation lab for `ch2-2-2`: `φ`, `ω`, `ε`, point velocity/acceleration.
7. Add transmission concept lab for `ch2-3-1`.
8. Extend gear lab for `ch2-3-2`: gear train, belt, pulley, sign/direction.

## Todo List

- [x] Add graph helper in `SimCore`.
- [x] Add `ch2-1-2` Cartesian plot.
- [x] Add `ch2-1-4` motion presets.
- [ ] Add `ch2-2-1` translation lab.
- [x] Extend `ch2-3-2` with belt/pulley.

## Completion Notes

- P1 route coverage complete. `ch2-2-1` is P2 and remains backlog.

## Tests And Verification

```powershell
node --check js\sim-core.js
node --check js\sim-kinematics.js
node --check js\simulations.js
python tools\audit.py
```

Manual verify:

- `ch2-1-2`: derivative relationships display correctly for simple linear/quadratic preset.
- `ch2-1-3`: `an = v²/ρ` increases with speed.
- `ch2-2-2`: point farther from axis has higher speed.
- `ch2-3-2`: gear ratio and rotation direction are correct.

## Success Criteria

- Ch2 I-III P1 routes have interactive coverage.
- Motion graph helper reusable for later phases.
- Existing Ch2 simulations preserved.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Graph helper too complex | Keep simple axes/polyline, no chart library |
| Derivative formulas inconsistent | Use known presets with tested expected values |

## Security Considerations

No network. No sensitive state.

## Next Steps

Proceed to Ch2 hợp chuyển động, song phẳng, fixed-point rotation, bài tập.
