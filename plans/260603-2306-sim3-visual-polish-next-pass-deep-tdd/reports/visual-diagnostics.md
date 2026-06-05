---
title: "Sim3 Visual Diagnostics"
status: completed
created: 2026-06-03
---

# Sim3 Visual Diagnostics

## Baseline Summary

| Route | Score | Issue | Target |
|---|---:|---|---|
| `ch2-2-2` | 7/10 | Disk too dominant; tangent cue crowded. | Disk radius reduced; tangent vector safe-margin target `>=32px`. |
| `ch2-3-2` | 7.5/10 | Mechanism informative but cluttered. | Supports muted; belt/gears primary. |
| `ch2-4-4` | 6.5/10 | Sparse; labels clustered; weak Coriolis frame cue. | Rotating-frame cue present; vector separation debug > `0.1`; label overlap `0`. |
| `ch2-5-3` | 7/10 | Velocity vector dominates; construction arrows unclear. | Velocity scale factor `<0.3`; construction opacity `<0.6`. |
| `ch3-5-3` | 7/10 | Flat; radius label rough. | Radius cue marked `dimension`; orbit secondary. |
| `ch3-6-2` | 7/10 | Capture too pre-impact. | Final capture phase is `after`. |

## Planned RED Assertions

- `.sim3-label` overlap count is `0` in representative 3D routes.
- Route debug payload exposes `visualMetrics` for composition/hierarchy.
- `ch3-6-2` capture asserts `phaseCue === "after"`.
- Capture output path points to this plan's `visuals/final/`.

## Unresolved Issues

None.
