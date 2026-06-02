# Red Team Scope Risk Review

---
date: 2026-06-02
type: red-team
scope: sim3-pilot-plan
---

## Summary

Plan is viable only if 3D stays optional and route-local. Full engine rewrite or global shell rewrite would be scope creep.

## Findings

| Severity | Risk | Recommendation |
|---|---|---|
| High | Three.js import path may fail under `file://` if module layout is wrong. | Phase 02 must verify local load through Playwright fixture before route work. |
| High | Resource leak from WebGL renderer/OrbitControls. | Phase 03 must include disposal tests before pilots. |
| Medium | 3D mode can distract from formula/readout learning. | Keep panel/readout outside 3D; constrain camera; no decorative excess. |
| Medium | Changing `ch3-6-2` frame loop may regress collision physics/step behavior. | Adapter reads existing state; do not duplicate collision solver. |
| Medium | Adding screenshot baseline for all 25 routes would be brittle. | Baseline only 2 pilot routes. |
| Low | Existing `sim2-pro-visual-ux` plan frontmatter says pending. | Do not block; content phases are done and docs reflect current Sim2. |

## Plan Adjustments Applied

- Sequential phases only.
- Explicit Phase 01 RED contract.
- Explicit WebGL fallback and dispose gates.
- No 25-route rollout.

## Unresolved Questions

- None.
