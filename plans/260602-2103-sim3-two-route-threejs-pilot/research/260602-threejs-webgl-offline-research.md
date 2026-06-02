# Three.js WebGL Offline Research

---
date: 2026-06-02
type: research
scope: sim3-pilot
---

## Summary

Three.js is suitable for a small browser 3D layer. Use local static files, not CDN. WebGL must be feature-detected and treated as optional.

## Findings

| Topic | Finding | Planning impact |
|---|---|---|
| Three.js install | Official docs support module imports and import maps. | Prefer local import map or local module bundle. |
| Addons | `OrbitControls` is an addon import, not part of the core global. | Vendor addon path too. |
| WebGL | MDN documents WebGL as a canvas/browser API using GPU acceleration. | Use fallback if context creation fails. |
| Offline app | Current project has no runtime bundler. | Avoid npm build requirement for users. |
| Resource cleanup | Three scenes create renderer/context/geometries/materials. | Centralize dispose in `three-shell.js`. |

## Sources

- Three.js installation docs: https://threejs.org/manual/en/installation.html
- Three.js OrbitControls docs: https://threejs.org/docs/#examples/en/controls/OrbitControls
- MDN WebGL API: https://developer.mozilla.org/docs/Web/API/WebGL_API

## Recommendation

Vendor minimal Three.js files under `lib/three/` or generate a checked-in local bundle. The implementation phase should choose the lowest-maintenance option that works under `file://` and tests.

## Unresolved Questions

- None blocking. Exact vendoring method decided in Phase 02 after testing `file://` fixture load.
