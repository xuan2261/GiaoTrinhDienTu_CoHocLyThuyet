# Phase 01 — RED Contract Tests

## Context Links

- Plan: [Sim3 ch2-5-3 Single Route TDD Rollout](./plan.md)
- Scout: [Scout Report](./reports/scout-report.md)
- Current tests: `tests/sim3-pilot-fallback-dispose.spec.js`
- Ch2 fixture: `tests/fixtures/sim2-ch2.html`

## Overview

Priority: P1. Status: Complete.

Add failing tests before any adapter exists. Tests define route behavior and lifecycle contract for `ch2-5-3`.

## Key Insights

- `ch2-5-3` is static field + IC drag + `omega` slider.
- There is no playback button for this route; tests must not rely on `.sim2-step`.
- Current Sim3 contract tests already cover fallback and dispose patterns.

## Requirements

Functional:
- Add a test that expects `ch2-5-3` to expose Sim3 toggle.
- Click 3D and assert exactly one visible `.sim3-canvas`.
- Assert debug state includes `omega`, `ic`, `sample`, `radius`, `vM`.
- Change `omega` slider and assert debug state updates.
- Move IC via route state path if possible; otherwise update through existing drag helper pattern in Playwright.
- Toggle 2D→3D repeatedly; assert no duplicate canvas.
- Dispose; assert toggle, host, canvas removed.

Non-functional:
- No page errors.
- No flaky timing; use deterministic state and debug hooks.

## Architecture

Test drives this state contract:

```js
{
  omega: Number,
  ic: { x, y },
  sample: { x, y },
  radius: Number,
  vM: { vx, vy, mag },
  updatedAt: Number
}
```

## Related Code Files

Modify:
- `tests/sim3-pilot-fallback-dispose.spec.js`
- `tests/fixtures/sim2-ch2.html`
- `tools/sim3-visual/pilot-capture.spec.js`

Create: none.
Delete: none.

## Implementation Steps

1. Add `<script src="../../js/sim3/sims/ch2-5-3-3d.js"></script>` to Ch2 fixture before Sim2 Ch2 route scripts.
2. Add failing Playwright test for `ch2-5-3` in Sim3 contract suite.
3. Extend visual capture cases with `ch2-5-3`.
4. Update visual output path to current plan `visuals/` or make path constant point to current plan.
5. Run `npm run test:sim3:pilot`; expect RED for missing adapter/wiring.

## Todo List

- [x] Fixture loads future adapter script.
- [x] RED route contract test added.
- [x] Visual capture case added.
- [x] RED run recorded.

## Success Criteria

- Test fails because `ch2-5-3` lacks Sim3 adapter/wiring, not because fixture/test syntax is broken.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Test tries to use playback that route lacks | Test only slider/drag/toggle/dispose. |
| IC drag is flaky | Prefer direct input/state through DOM where possible; use bounding box only if necessary. |

## Security Considerations

No data/security surface. Browser-only offline test.

## Next Steps

Proceed to Phase 02 only after RED is valid.

## Unresolved Questions

- None.
