## Follow-Up Review Summary

### Scope
- Reviewed only previous findings in:
  - `js/sim3/core/three-shell.js`
  - `js/sim3/core/mode-toggle.js`
  - `js/sim3/core/three-dispose.js`
  - `tests/sim3-pilot-fallback-dispose.spec.js`

### Previous Findings Status

Resolved:
- High: renderer constructor failure now catches setup errors and falls back without page error.
- Medium: Sim3 shell now exposes `start()`/`stop()`, and mode toggle calls them on 3D/2D switch.
- Medium: dispose now calls `renderer.forceContextLoss()` when available.
- Low: renderer constructor throw negative test added.

Partially resolved:
- Hidden 3D work in 2D mode: Sim3 RAF is stopped, but `mode-toggle.setState()` still forwards every Sim2 state update to the hidden Sim3 instance regardless of `mode`. If Sim2 playback keeps running after switching back to 2D, hidden WebGL still renders once per Sim2 frame through `shell.setState()`.

### Remaining Issue

- [js/sim3/core/mode-toggle.js:84] `setState(state) { lastState = state; if (sim3 && sim3.setState) sim3.setState(state); }` ignores current `mode`. This preserves hidden render work after 2D switch whenever Sim2 continues producing frames.
  Fix: keep `lastState = state`, but only forward to Sim3 when `mode === '3d'`; `show3d()` already replays `lastState`.

### Unresolved Questions
- None.
