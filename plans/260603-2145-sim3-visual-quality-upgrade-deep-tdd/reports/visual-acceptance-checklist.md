# Sim3 Visual Acceptance Checklist

## Shared Criteria

- Six baseline screenshots exist in `visuals/baseline/`.
- Six final screenshots exist in `visuals/final/`.
- Every 3D scene has at least one body/point label and one concept/vector label.
- Label layer is removed on 2D/3D toggle and full dispose.
- Camera composition keeps the main teaching geometry visible without excessive empty space.
- Visual polish remains pedagogical: no remote assets, no runtime dependency, no physics rewrite.

## Route Criteria

| Route | Required visual cues | Status |
|---|---|---|
| `ch2-2-2` | point `M`, angular velocity `ω`, tangential velocity `v` | Pass |
| `ch2-3-2` | gear labels, belt label, direction arrows | Pass |
| `ch2-4-4` | `ω`, `v_rel`, `a_cor`, bead `M`, Coriolis vector plane | Pass |
| `ch2-5-3` | instant center `P`, sample `M`, `v_M`, velocity field arrows | Pass |
| `ch3-5-3` | mass labels `m₁/m₂`, angular momentum `L`, radius context | Pass |
| `ch3-6-2` | before/impact/after labels, ghost states, trail/reset lifecycle | Pass |

## Hard Blockers

- None after implementation.

## Remaining Nice-To-Have

- Future visual pass may tune label collision avoidance globally if more Sim3 routes are added.
