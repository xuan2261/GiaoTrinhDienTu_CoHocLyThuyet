---
phase: 7
title: "Harden Sim3 Core Runtime"
status: completed
priority: P1
dependencies: [6]
effort: "3-4 days"
---

# Phase 7: Harden Sim3 Core Runtime

## Overview

Make Sim3 demand-rendered, responsive, DPR-aware, safely disposable, accessible, and resilient to adapter/setup/update/render/resize failures. Preserve functional Sim2 fallback for every failure path.

## Requirements

- No continuous RAF unless adapter explicitly requests it.
- Resize visible host automatically; DPR capped at 2.
- Catch and classify create/setup/setState/reset/render/resize failures.
- Any failure disposes partial resources, restores 2D, and announces Vietnamese status once.
- Actual geometry/material/texture/renderer/context/observer resources dispose exactly once.

## Architecture

`Sim3Shell.create(cfg)` gains:

```js
{ continuous: false, pixelRatioCap: 2, onFallback(reason, error) }
```

`setState()` performs update + one render. `start()` is valid only for explicit continuous scenes. Label management moves to a focused `three-label-layer.js` module so `three-shell.js` can own renderer/camera/lifecycle under the project file-size guideline.

## File Inventory

| Action | File | Change | Test impact |
|---|---|---|---|
| Create | `js/sim3/core/three-label-layer.js` | Projected DOM label lifecycle | Unit/browser |
| Create | `tests/sim3-core-runtime.spec.js` | RAF, resize, DPR, fallback, a11y | New core gate |
| Create/modify | `tests/simulation-lifecycle.spec.js` | Resource spies and repeated toggle/navigation | Shared final gate |
| Modify | `three-shell.js` | Demand render, observer, DPR, failure path | All adapters |
| Modify | `three-dispose.js` | Complete idempotent GPU cleanup | Lifecycle |
| Modify | `mode-toggle.js` | Exception-safe fallback and accessible status | All routes |
| Modify | `three-primitives.js`, `visual-kit.js` | Compatibility with demand rendering | Core tests |
| Modify | `css/style.css` | 44 px targets/focus/fallback semantics | Accessibility |
| Modify | `index.html`, fixtures | Label-layer script order | Production/browser |
| Modify | `tests/sim3-pilot-fallback-dispose.spec.js` | Route-complete fallback and resource assertions | Existing gate |

## Function and Interface Checklist

- [x] `continuous` defaults false; no idle RAF.
- [x] `setState` and resize each render exactly once.
- [x] `ResizeObserver` observes visible host; window fallback removable.
- [x] `renderer.setPixelRatio(min(devicePixelRatio,2))`.
- [x] Host sizing does not reuse stale fixed inline width after layout change.
- [x] Fallback callback fires at most once with stable reason and original error.
- [x] Mode toggle catches `create3d`, `setState`, `reset`, and shell failures.
- [x] Fallback restores button state, visible 2D, focus, and usable controls.
- [x] Canvas has route-specific label/role; projected labels are `aria-hidden`.
- [x] Disposal cancels RAF, observer/listener, render lists, geometry, material, all textures, renderer, context, DOM.
- [x] Double dispose is safe.

## Dependency Map

- Uses coordinate/script foundation from phase 6.
- Blocks all adapter migration phases.
- Responsive/fallback/lifecycle utilities feed phase 11 production and release gates.

## Test Scenario Matrix

| Area | Scenarios | Acceptance |
|---|---|---|
| RAF | idle, explicit continuous, stop/start, dispose | Correct owned callback count |
| Resize | 360/1024 cycle, hidden/visible, observer unavailable | Aspect/backing size update |
| DPR | 1, 1.5, 2, 3 | Capped backing resolution |
| Failures | THREE missing, WebGL unavailable, renderer/setup/create/update/reset/render/resize throw | Safe 2D once |
| Disposal | textures in arbitrary material fields, shared resources, double dispose | Exactly once/no leak |
| Accessibility | keyboard toggle, pressed state, fallback status/focus | Named/announced/usable |
| Repetition | 20 2D/3D toggles + navigation | One canvas/label layer, zero residue |

## Tests Before

1. Instrument RAF/cancel and prove current idle loop.
2. Add narrow/DPR RED assertions.
3. Inject failures at every boundary.
4. Spy on allocated GPU resources and context loss.
5. Add fallback `role=status`, `aria-live`, focus, and 44 px target RED tests.

## Refactor

1. Extract label layer.
2. Convert shell to demand rendering.
3. Add observer/DPR lifecycle.
4. Centralize one reentrant failure/disposal path.
5. Harden mode toggle and accessibility.
6. Complete disposal traversal without double-disposing shared resources.

## Tests After

- Dispose during frame/render/resize callback.
- Recreate 3D after fallback.
- Update while hidden and toggle back.
- Context-loss and renderer-constructor paths.
- No unhandled console/page errors.

## Implementation Steps

1. Add RED core runtime suite.
2. Extract labels without behavior change.
3. Implement demand render and lifecycle instrumentation.
4. Add responsive/DPR support.
5. Harden fallback and accessibility.
6. Complete resource disposal.
7. Run all ten current adapter compatibility tests and repeated-toggle soak.

## Regression Gate

```powershell
npx playwright test tests/sim3-core-runtime.spec.js tests/simulation-lifecycle.spec.js
npm run test:sim3:pilot
npm run test:sim:mount
npm run test:sim:release
```

## Success Criteria

- [x] Static paused Sim3 consumes no continuous RAF.
- [x] Resize/DPR/fallback/accessibility matrices pass.
- [x] Resource spies show zero owned callbacks and complete GPU disposal.
- [x] 10/10 adapters still mount through existing pilot tests.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Demand rendering misses visible update | `setState`/resize render synchronously; test every adapter |
| DPR increases GPU memory | Cap at 2 and dispose backing resources |
| Catching errors hides programming defect | Preserve reason + original error; warn contextually while falling back |
| Shared texture disposed twice | Track resources by identity |

## Verification Evidence

- Initial RED run: 5 core-runtime failures and 2 lifecycle passes exposed idle RAF, missing observer/DPR, uncaught update/create failures, missing label module, and incomplete disposal.
- `npm run test:sim3:core`: 12 passed, including DPR 1/1.5/2/3, callback-time disposal, removable window fallback, original-error classification, 20 toggle cycles, cross-route cleanup, and narrow/wide framing for the two changed adapters.
- `npm run test:sim3:pilot`: coordinate gate, 12 core/lifecycle tests, and 20 adapter browser tests passed on the final reviewed code.
- `npm run test:sim:release`: 26 route-physics, 129 mount, 6 app, 3 content, and 2 quiz checks passed.
- Browser smoke at DPR 1.25 verified a 520×261 responsive route-specific canvas, hidden projected labels, safe margins, and generic Vietnamese fallback restoring visible 2D, pressed state, focus, and zero canvas residue.
- Independent fallback review found no blocking runtime defect and one P2 framing coverage gap; narrow/wide Ch1 and Ch3 projection assertions now close that gap.

## Security and Performance

No new network access. Demand rendering removes idle CPU/GPU use. Error messages must not expose local absolute paths in learner UI.

## Next Steps

Phases 8-10 migrate all adapters in physically coherent route batches.
