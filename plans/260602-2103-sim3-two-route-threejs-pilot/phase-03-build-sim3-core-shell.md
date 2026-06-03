# Phase 03 Build Sim3 Core Shell

## Context Links

- [Sim2 shell](../../js/sim2/core/sim-shell.js)
- [Sim2 controls](../../js/sim2/core/controls.js)
- [Sim2 panel](../../js/sim2/core/panel.js)
- [Phase 01 tests](./phase-01-red-sim3-contract-and-fallback-tests.md)

## Overview

Priority: P1  
Status: Done  
Goal: implement shared Sim3 shell with WebGL detection, constrained camera, scene lifecycle, and disposal.

## Key Insights

- Sim3 should not replace Sim2 shell.
- Sim3 should be attachable to route containers/viewport host.
- Resource cleanup is the hard part.

## Requirements

Functional:
- Create/destroy Three renderer.
- Detect WebGL availability.
- Support fallback callback.
- Provide constrained camera controls.
- Provide update hook for route state.

Non-functional:
- Small file, focused responsibility.
- No physics logic.
- No route-specific meshes in core.

## Architecture

Proposed API:

```js
const sim3 = window.Sim3Shell.create({
  host,
  width,
  height,
  label: 'Quay quanh trục cố định 3D',
  onFallback(reason) {},
  setup({ THREE, scene, camera, renderer }) {},
  update(state) {}
});

sim3.setState(state);
sim3.dispose();
```

Mode adapter helper:

```js
window.Sim3Mode.attach({
  container,
  shell2dRoot,
  create3d,
  onModeChange
});
```

## Related Code Files

Create:
- `js/sim3/core/three-shell.js`
- `js/sim3/core/mode-toggle.js`
- `js/sim3/core/three-dispose.js`

Modify:
- `index.html`
- `tests/fixtures/sim2-ch2.html`
- `tests/fixtures/sim2-ch3.html`
- `tests/sim3-pilot-fallback-dispose.spec.js`

Delete:
- None

## Implementation Steps

1. Implement `three-dispose.js`:
   - traverse scene.
   - dispose geometries.
   - dispose material(s), textures if present.
   - dispose controls.
   - dispose renderer and remove canvas.
2. Implement WebGL availability:
   - honor `window.__SIM3_FORCE_WEBGL_FAIL`.
   - attempt canvas `webgl2` then `webgl`.
3. Implement `three-shell.js`:
   - create scene/camera/renderer.
   - add basic lights.
   - create constrained camera controls.
   - start RAF only when 3D mode active.
   - expose `setState`, `resize`, `dispose`.
4. Implement `mode-toggle.js`:
   - accessible buttons with `aria-pressed`.
   - hide/show 2D/3D viewport.
   - fallback message in Vietnamese.
5. Keep CSS scoped under `.sim3-*`.
6. Run Phase 01 tests; shell-level tests should turn GREEN except route-specific scene expectations.

## Todo List

- [x] Add Sim3 shell API.
- [x] Add mode toggle.
- [x] Add disposal helper.
- [x] Add scoped CSS.
- [x] Make fallback tests pass.

## Success Criteria

- Forced fallback returns to SVG 2D without error.
- Dispose removes all `.sim3-*` DOM.
- No running 3D RAF after dispose.
- No changes to `js/sim2/physics/*`.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Core grows too large | Split shell/mode/dispose files |
| RAF leaks | Tests track DOM cleanup and animation stop |
| Camera too free | Lock pan/zoom limits and default angle |

## Security Considerations

- No untrusted input.
- No network resources.

## Next Steps

Implement first route adapter in Phase 04.
