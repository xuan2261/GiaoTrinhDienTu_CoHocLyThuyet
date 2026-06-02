# Phase 01 RED: Sim3 Contract And Fallback Tests

## Context Links

- [Brainstorm report](../reports/260602-2057-brainstorm-sim3-pilot-two-route-upgrade.md)
- [Sim2 Ch2 fixture](../../tests/fixtures/sim2-ch2.html)
- [Sim2 Ch3 fixture](../../tests/fixtures/sim2-ch3.html)
- [Ch2 mount tests](../../tests/sim2-ch2-mount.spec.js)
- [Ch3 mount tests](../../tests/sim2-ch3-mount.spec.js)

## Overview

Priority: P1  
Status: Pending  
Goal: write failing tests before any implementation. Lock the new Sim3 contract, offline load, fallback, and dispose behavior.

## Key Insights

- TDD matters here because Three.js adds WebGL lifecycle risk.
- Tests should assert user-visible/semantic behavior, not pixel-perfect 3D details.
- Current fixtures do not load `css/style.css`; pilot tests may need CSS injection or fixture update.

## Requirements

Functional:
- Tests expect `ch2-2-2` and `ch3-6-2` can expose a `2D | 3D` mode.
- Tests expect 2D still works when 3D unavailable.
- Tests expect WebGL failure does not throw page errors.
- Tests expect `dispose()` removes 3D canvas and stops 3D RAF/listeners.

Non-functional:
- Tests run via Playwright under `file://`.
- No dependency on external network.
- No brittle all-route screenshot gate.

## Architecture

Test-first target API:

```js
window.Sim3Shell
window.Sim3Adapters
```

Route-level expected DOM:

```html
<div class="sim3-mode-toggle" role="group">
  <button data-mode="2d">2D</button>
  <button data-mode="3d">3D</button>
</div>
<canvas class="sim3-canvas"></canvas>
```

Fallback expected DOM:

```html
<div class="sim3-fallback" hidden>3D không khả dụng, đang dùng 2D.</div>
```

## Related Code Files

Modify:
- `tests/fixtures/sim2-ch2.html`
- `tests/fixtures/sim2-ch3.html`
- `tests/sim2-ch2-mount.spec.js`
- `tests/sim2-ch3-mount.spec.js`

Create:
- `tests/sim3-pilot-fallback-dispose.spec.js`

Delete:
- None

## Implementation Steps

1. Add failing Playwright test for `ch2-2-2`:
   - Mount route.
   - Assert default 2D still visible.
   - Click `3D`.
   - Assert `.sim3-canvas` visible or fallback visible.
   - Change `ω0` / `α`; assert 3D adapter reports updated state via debug hook.
   - Dispose; assert `.sim3-canvas`, `.sim3-mode-toggle`, `.sim3-fallback` removed.
2. Add failing Playwright test for `ch3-6-2`:
   - Mount route.
   - Click `3D`.
   - Step/play route.
   - Assert collision phase readout remains Sim2-owned.
   - Dispose cleanly.
3. Add forced fallback test:
   - Before mount, stub WebGL creation to fail or set `window.__SIM3_FORCE_WEBGL_FAIL = true`.
   - Assert no console error/pageerror.
   - Assert SVG route still works.
4. Add tests to existing Ch2/Ch3 suites only if route-specific coverage is cleaner there; otherwise keep in new `sim3-pilot-fallback-dispose.spec.js`.
5. Confirm RED: new tests fail because Sim3 is not implemented.

## Todo List

- [ ] Add pilot contract tests.
- [ ] Add WebGL failure tests.
- [ ] Add dispose cleanup tests.
- [ ] Run focused Playwright command and record RED.

## Success Criteria

- Focused Sim3 tests fail for missing implementation, not syntax/import errors.
- Existing Sim2 mount tests still pass before implementation.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Tests overfit DOM names | Use stable class names only for contract elements |
| Forced WebGL failure brittle | Prefer explicit `window.__SIM3_FORCE_WEBGL_FAIL` hook |
| Fixture drift | Keep fixture changes minimal and chapter-scoped |

## Security Considerations

- No network calls.
- Do not load CDN in tests.

## Next Steps

Proceed to Phase 02 only after RED is confirmed.
