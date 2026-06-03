## Code Review Summary

### Scope
- Files: js/sim3/core/*, js/sim3/sims/*, pilot Sim2 adapters, fixtures, visual capture, package/index/css
- LOC: ~310 scoped implementation/test lines reviewed
- Focus: recent Sim3 two-route pilot
- Scout findings: WebGL constructor failure path untested; hidden 3D RAF after 2D switch; dispose releases DOM but not WebGL context explicitly

### Overall Assessment
Sim2 `SIM_MAP` contract remains unchanged and the 3D layer is optional for only `ch2-2-2` and `ch3-6-2`. State flow uses existing Sim2 draw/reset/frame paths. Main production risk is fallback robustness around real WebGL/renderer allocation failures, not covered by forced precheck tests.

### Critical Issues
- None.

### High Priority
- [js/sim3/core/three-shell.js:38] `new THREE.WebGLRenderer(...)` is outside `try/catch`; if context allocation or renderer construction throws after `webglAvailable()` passes, the click handler bubbles a page error and does not fall back to 2D.
  Fix: wrap renderer/scene/setup creation in `try/catch`, call `cfg.onFallback('renderer-create-failed')`, remove host/canvas, and return `null`. Add a test monkey-patching `window.THREE.WebGLRenderer` to throw.

### Medium Priority
- [js/sim3/core/three-shell.js:82] Sim3 starts a RAF immediately and [js/sim3/core/mode-toggle.js:42] hides the host when switching back to 2D without stopping that RAF. Hidden WebGL keeps rendering in 2D mode.
  Fix: expose `start()`/`stop()` on `Sim3Shell`; start on `show3d()`, stop on `show2d()`, and keep dispose canceling RAF.
- [js/sim3/core/three-dispose.js:29] `renderer.dispose()` is called, but the WebGL context is not explicitly released. Repeated route open/dispose after using 3D can retain browser WebGL contexts until GC.
  Fix: call `renderer.forceContextLoss()` when available before/after `renderer.dispose()`, then remove the canvas.

### Low Priority
- [tests/sim3-pilot-fallback-dispose.spec.js:82] Fallback tests force only the precheck branch (`__SIM3_FORCE_WEBGL_FAIL`); missing `THREE` and renderer-constructor failure are not tested.
  Fix: add one fixture/test with `delete window.THREE` before clicking 3D, and one with `THREE.WebGLRenderer` throwing.

### Edge Cases Found by Scout
- WebGL availability can pass while renderer allocation still fails.
- 3D mode can become hidden while its RAF continues.
- DOM cleanup tests do not prove GPU context release.

### Positive Observations
- `SIM_MAP` route keys stay the existing 25 Sim2 routes; no Sim3 route registration added.
- `ch2-2-2` and `ch3-6-2` pass state into 3D from existing Sim2 draw/reset paths; no duplicated physics solver found.
- Three.js runtime load is local via `lib/three/three.umd.min.js`; no Sim3 CDN or bundler dependency found.

### Recommended Actions
1. Add `try/catch` fallback around `WebGLRenderer` and route `setup`.
2. Add Sim3 `start/stop` lifecycle and stop hidden 3D RAF in 2D mode.
3. Explicitly release WebGL context in dispose.
4. Add negative tests for missing `THREE` and renderer constructor failure.

### Metrics
- Type Coverage: N/A, plain JS
- Test Coverage: targeted pilot and mount suites reported passing; negative renderer-failure path missing
- Linting Issues: 0 reported by controller syntax checks

### Unresolved Questions
- Should Sim3 intentionally render continuously while paused for future camera controls, or should it render only on Sim2 state changes until controls exist?
