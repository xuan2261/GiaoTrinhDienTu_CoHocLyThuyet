# Brainstorm Sim3 Pilot Two Route Upgrade

---
date: 2026-06-02
type: brainstorm-report
status: approved
scope: sim2-to-sim3-pilot
---

## Summary

User wants simulations to look more premium for classroom teaching, not a full scientific 3D engine rewrite.
User accepts Three.js runtime dependency if it stays offline.
User approved a pilot-first approach with 2 routes before any broader rollout.

Recommended direction: keep `js/sim2/` SVG-first as canonical engine and add a small `js/sim3/` Three.js layer only for selected routes.

## Requirements

| Item | Decision |
|---|---|
| Expected output | Pilot 3D visual mode for 2 existing simulations |
| Pilot routes | `ch2-2-2` fixed-axis rotation, `ch3-6-2` collision with restitution |
| Primary goal | Better classroom visual quality, clearer teaching demo |
| Runtime | Offline static app remains supported |
| Dependency | Three.js allowed if vendored/local, no CDN requirement |
| Physics | Reuse existing Sim2 physics/state; do not recalculate physics inside 3D scene |
| UX | Keep current theory panel, controls, readout, legend; add `2D | 3D` mode where useful |
| Fallback | If WebGL unavailable or init fails, route must keep working in SVG 2D |

## Findings

| Area | Assessment |
|---|---|
| Current Sim2 quality | Release-safe, consistent, good for learning |
| Current limitation | Visual is 2D/2.5D diagram-like, not premium lab-like |
| Full 3D rewrite | Too much cost/risk for classroom visual goal |
| Hybrid 3D capsules | Best cost/value: visible premium impact without breaking tested SVG engine |
| Three.js fit | Good for browser 3D, camera, lighting, simple meshes; needs local vendoring and dispose discipline |
| WebGL risk | Device/browser dependent; fallback 2D required |

## Evaluated Approaches

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| Pro 2.5D only | Lowest risk, keeps SVG tests simple | No true 3D impact | Good fallback, not enough for user goal |
| Hybrid 3D pilot | Premium visual where useful, limited blast radius | Adds dependency and WebGL QA | Recommended |
| Full 25-route 3D rewrite | Consistent 3D identity | Expensive, harder accessibility, many static routes become less clear | Reject for now |

## Recommended Architecture

```text
Existing route
  js/sim2/sims/ch2/ch2-2-2.js
  js/sim2/sims/ch3/ch3-6-2.js
       |
       | shared state / controls / current physics values
       v
Optional 3D adapter
  js/sim3/core/three-shell.js
  js/sim3/sims/ch2-2-2-3d.js
  js/sim3/sims/ch3-6-2-3d.js
       |
       v
Three.js canvas in viewport
```

Core rules:
- `js/sim2/physics/*` remains source of truth.
- `SIM_MAP[pageId] -> factory(container) -> { dispose }` contract unchanged.
- Three renderer, RAF, controls, event listeners, geometries, materials must be disposed.
- 3D layer is optional; route still works without WebGL.
- Do not introduce runtime bundler.

## Pilot Route Concepts

| Route | 3D value |
|---|---|
| `ch2-2-2` | 3D disk/shaft with axis, angular velocity vector, angular acceleration vector, point path, camera orbit |
| `ch3-6-2` | 3D balls/blocks on rail, before/after collision trail, impulse flash/cue, restitution state |

## Acceptance Criteria

- Both pilot routes render a working 3D mode offline.
- Existing 2D SVG mode remains available and stable.
- Controls update 2D/3D state consistently.
- Theory/readout panels remain current Sim2 UI, not duplicated in 3D labels.
- WebGL failure falls back to 2D without breaking route mount.
- `dispose()` cleans Three renderer/resources and no RAF leak after route change.
- `npm run test:sim:mount` remains pass.
- Add pilot-specific Playwright checks for mount/fallback/dispose.
- Add visual capture/baseline for the 2 pilot routes only, not all 25.

## Risks

| Risk | Mitigation |
|---|---|
| 3D distracts from learning | Keep camera constrained, no decorative excess, preserve formula/readout panel |
| WebGL unavailable | Feature detect and fallback to SVG |
| Bundle/offline complexity | Vendor Three.js locally or use a local static module file |
| Test brittleness | Use semantic/mount/fallback checks; screenshot baseline only for pilot |
| Resource leaks | Explicit dispose tests for renderer, listeners, RAF |
| Scope creep | Pilot 2 routes only; no 25-route rollout until visual approval |

## Next Steps

1. Create implementation plan for the approved 2-route Sim3 pilot.
2. Decide local Three.js vendoring method during planning.
3. Build `ch2-2-2` first as simpler 3D pilot, then `ch3-6-2`.
4. Review visual output in contact sheet/screenshot before rollout.

## Unresolved Questions

- None blocking.
