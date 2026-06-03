---
type: scout-report
created: 2026-06-03
scope: sim3-ch2-5-3-single-route
---

# Scout Report

## Summary

Plan target: add optional Sim3 layer for `ch2-5-3` only. No implementation in this session.

## Findings

| Area | Finding |
|---|---|
| Project type | Static HTML/CSS/JS textbook. No runtime bundler. `package.json` only dev QA. |
| Sim2 route | `js/sim2/sims/ch2/ch2-5-3.js` renders velocity field on rigid body, canvas underlay, one `omega` slider, draggable IC, no playback. |
| Physics source | `SimPhysicsKinematics.instantCenterVelocity(omega, rx, ry)` is canonical. Sim3 must consume Sim2 state only. |
| Existing Sim3 routes | 5 optional routes: `ch2-2-2`, `ch2-3-2`, `ch2-4-4`, `ch3-5-3`, `ch3-6-2`. |
| Sim3 core | `Sim3Mode.attach`, `Sim3Shell.create`, `Sim3Primitives`; fallback/dispose/start-stop already hardened. |
| Test fixture | `tests/fixtures/sim2-ch2.html` loads Sim3 Ch2 adapters then all 7 Ch2 Sim2 routes. |
| Current tests | `tests/sim3-pilot-fallback-dispose.spec.js` is focused Sim3 contract suite. |
| Visual capture | `tools/sim3-visual/pilot-capture.spec.js` writes to previous plan visuals path and lists 5 cases. |
| Runtime loading | `index.html` loads Sim3 adapters before Sim2 Ch2 route files. Need add new adapter script before `ch2-5-3.js`. |

## Constraints

- Keep Sim2 default/canonical.
- Add no CDN, no bundler, no ESM migration.
- Do not duplicate physics in `js/sim3/`.
- Do not full-rollout 25 routes.
- Keep route file sizes under code standard target.

## Unresolved Questions

- None.
