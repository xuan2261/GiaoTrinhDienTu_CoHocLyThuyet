# Phase 03 Shared Lab UX Contract And Diagnostics

## Context Links

- [UI UX Research](./research/researcher-02-ui-ux-pedagogy-qa-report.md)
- [Design Guidelines](../../docs/design-guidelines.md)
- [Phase 02](./phase-02-physics-invariant-manifest-and-evaluators.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Complete |
| Goal | Add shared promax lab slots without per-route layout forks |
| Scope | Shared shell, diagnostics metadata, accessibility |

## Key Insights

- Shared-first. Route-specific UI variants are forbidden unless unavoidable.
- Diagnostics must be optional and non-blocking.
- Existing `.sim-lab` already has header/readout/formula/hint hooks.

## Requirements

### Functional

- Add Promax mode metadata to lab root:
  - `data-promax-level`
  - `data-diagnostics-visible`
  - `data-invariant-status`
- Add diagnostic toggles:
  - components.
  - FBD.
  - graph.
  - error band.
- Add invariant status region:
  - pass/warn/fail.
  - no noisy text if route has no invariant.
- Add formula/readout coupling hooks.

### Non-Functional

- Controls min 44px on mobile.
- Keyboard reachable.
- `prefers-reduced-motion` respected.
- No global CSS selectors outside `.sim-lab`.

## Architecture

```text
SimLabUI.createLab()
  -> creates diagnostics toolbar slot
  -> creates invariant status slot
  -> exposes lab.setInvariantStatus()
  -> exposes lab.setDiagnostics()

SimProfessionalLab.mount()
  -> resolves route invariant status when available
  -> passes diagnostics flags to renderer/behavior
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `js/sim-lab-ui.js` |
| Modify | `js/sim-professional-lab.js` |
| Modify | `js/sim-route-renderer-primitives.js` |
| Modify | `css/style.css` scoped under `.sim-lab` |
| Modify/create | `tests/simulation-browser.spec.js` targeted cases |
| Modify/create | `tests/simulation-visual-quality.spec.js` diagnostics cases |

## Implementation Steps

1. Add diagnostics toolbar area after legend, before controls.
2. Add accessible toggle buttons with `aria-pressed`.
3. Add hidden-by-default invariant status card.
4. Add lab methods:
   - `setInvariantStatus(status, summary)`
   - `setDiagnosticMode(key, enabled)`
   - `getDiagnostics()`
5. Add CSS tokens:
   - pass/warn/fail.
   - compact diagnostic button.
   - no layout shift.
6. Add tests for:
   - keyboard tab order.
   - toggle state.
   - reduced motion.
   - mobile overflow.

## Todo List

- [x] Add diagnostics shell.
- [x] Add invariant status shell.
- [x] Add lab API methods.
- [x] Add scoped CSS.
- [x] Add browser tests.
- [x] Add visual tests.

## Verification / Tests

```powershell
node --check js\sim-lab-ui.js
node --check js\sim-professional-lab.js
npm run test:sim:unit
npm run test:sim:browser -- --grep "@promax-shell|@keyboard|@mobile"
npm run test:sim:visual-quality
python tools\audit_simulation_quality.py --all --max-js-lines 220
python tools\smoke_simulation_runtime.py --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
```

Manual checks:

- 375px viewport: no horizontal overflow.
- Keyboard only: toggle diagnostics and drag fallback still reachable.
- Reduced motion: no animated diagnostic decoration.

## Success Criteria

- Shared shell works on all 58 routes without route layout forks.
- Diagnostics toggles do not change canvas bounds.
- Existing release gates still pass.
- No visible English leak in Vietnamese UI.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| UI clutter | Hide advanced diagnostics by default |
| Tests brittle | Use semantic selectors/data attrs |
| Route renderers ignore diagnostics | Pilot routes adopt first, rollout later |

## Security Considerations

- No remote assets.
- No new persistence until challenge mode phase.

## Next Steps

- Phase 04 uses shell/invariant hooks in Ch1 pilot routes.

## Unresolved Questions

- None.
