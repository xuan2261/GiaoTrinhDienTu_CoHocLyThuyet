---
phase: 4
title: "Route State Wiring"
status: completed
priority: P1
effort: "6h"
dependencies: [3]
---

# Phase 04: Route State Wiring

## Overview

Wire the four Sim2 routes to their Sim3 adapters while preserving Sim2 default behavior and disposal contract.

## Requirements

- Functional: active 3D mode follows Sim2 controls/drag state in real time.
- Non-functional: route still runs when Sim3 core or adapter global is unavailable.

## Architecture

Each Sim2 route creates optional `sim3` after panel/controls/shell exist:

```js
const sim3 = root.Sim3Mode && root.Sim3ChXXX ? root.Sim3Mode.attach({...}) : null;
```

`render2()` calls `sim3.setState(stateSnapshot)` after updating Sim2 view. Route dispose calls both `sim3.dispose()` and `shell.dispose()`.

## Related Code Files

- Modify: `js/sim2/sims/ch1/ch1-5-3.js`
- Modify: `js/sim2/sims/ch3/ch3-1-3.js`
- Modify: `js/sim2/sims/ch2/ch2-1-3.js`
- Modify: `js/sim2/sims/ch1/ch1-1-5.js`

## Implementation Steps

1. Add optional `Sim3Mode.attach` to `ch1-5-3`; pass `betaDeg`, `mu`, `phiDeg`, `slips`.
2. Add optional `Sim3Mode.attach` to `ch3-1-3`; pass `aFrame`, `theta`, `thetaDeg`, `fIner`, bob/pivot coordinates.
3. Add optional `Sim3Mode.attach` to `ch2-1-3`; pass ellipse params, point, tangent, normal, radius.
4. Add optional `Sim3Mode.attach` to `ch1-1-5`; pass forces, resultant, moment.
5. Change return object to dispose both Sim3 and Sim2 safely.

## Success Criteria

- [x] Sim2 route behavior unchanged in 2D mode.
- [x] Missing Sim3 globals do not throw.
- [x] 3D state updates after sliders for `ch1-5-3` and `ch3-1-3`.
- [x] 3D state updates after drag handles for `ch2-1-3` and `ch1-1-5`.
- [x] Repeated 2D/3D toggles remain clean.

## Risk Assessment

Risk: temporal dead zone if `render2()` references `sim3` before initialization. Mitigation: declare `let sim3 = null` before first render, attach after controls/handles, then call `render2()`.
