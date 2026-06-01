# Phase 00 - Baseline And TDD Harness

## Context Links

- Plan: [plan.md](./plan.md)
- Visual findings: `plans/reports/visual-review-260601-0822-sim2-25-quality-report.md`
- Capture pipeline: `tools/sim2-visual/`
- Existing gates: `tests/sim2-ui-components.spec.js`, `tests/sim2-ui-coverage.spec.js`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Goal | Tao RED tests va baseline artifact truoc khi them visual/motion polish. |

## Key Insights

- Test hien co khoa structure, mount, dispose, physics. Chua khoa effects: readout flash, handle pulse, trail fade, ghost frame, reduced-motion.
- Visual pipeline da co capture 25 route; dung lam artifact review, khong dung lam blocker pixel baseline o phase dau.

## Requirements

Functional:
- Them tests cho shared effect APIs truoc khi code.
- Tao capture baseline truoc/sau de so sanh human review.
- Phan loai route pilot va rollout theo manifest, khong hardcode count.

Non-functional:
- No runtime deps.
- Tests deterministic; khong dua vao wall-clock neu co the dung CSS class/state.
- Keep tests focused, khong pixel brittle.

## Architecture

```
tests -> core API contract -> route pilot -> capture artifacts
      -> contact-sheet review -> rollout gates
```

## Related Code Files

Modify:
- `tests/sim2-ui-components.spec.js` - add RED cases for shared effects.
- `tests/sim2-ui-coverage.spec.js` - add coverage for route-level effect hooks once implemented.
- `tools/sim2-visual/capture-sims.spec.js` - ensure before/after capture labels if needed.

Create:
- `tests/sim2-visual-motion-polish.spec.js` - focused Playwright tests for effects and reduced-motion.
- Optional `plans/260601-2204-sim2-visual-motion-polish-v1/reports/baseline-capture-notes.md`.

Delete:
- None.

## Implementation Steps

1. Run current baseline:
   ```powershell
   npm run test:sim:physics
   npm run test:sim:mount
   npm run test:sim:visual:capture
   ```
2. Add RED tests for:
   - `Sim2Controls` exposes transient feedback class or event after slider input.
   - `Sim2Panel.setReadout()` can mark changed rows with temporary `.sim2-readout-changed`.
   - `Sim2Shell.addHandle()` supports `hintPulse`/visible active class and respects dispose.
   - `Sim2CanvasUnderlay.drawTrail()` supports fade by sample age without breaking old call signature.
   - `prefers-reduced-motion` disables non-essential pulse/flash/trail animation.
3. Add pilot route assertions:
   - `ch1-1-3`: handle visual state exists.
   - `ch2-4-4`: trail/guide layers visible after step.
   - `ch3-6-2`: collision route has before/after trail distinction and no autoplay.
4. Confirm tests fail for missing features.
5. Save baseline notes with commands and artifact paths.

## Todo List

- [ ] Run baseline gates and record result.
- [ ] Add RED shared component tests.
- [ ] Add RED pilot route tests.
- [ ] Add reduced-motion test.
- [ ] Save baseline capture notes.

## Success Criteria

- New tests fail for expected missing polish only.
- Existing release gates still pass before implementation.
- Baseline artifacts available under existing visual plan or this plan reports.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Brittle animation tests | Assert DOM/classes/state, not exact pixels. |
| Capture artifacts mistaken for runtime bugs | Use app CSS/theme in capture, note fixture context. |
| Test suite too slow | Keep new tests focused on 3 pilot routes and shared APIs. |

## Security Considerations

- No user data, no network, no new storage.
- Avoid `innerHTML` for labels/status; continue `textContent`/KaTeX guarded render.

## Next Steps

- Phase 01 implements shared primitives until RED tests turn GREEN.

## Unresolved Questions

- None.
