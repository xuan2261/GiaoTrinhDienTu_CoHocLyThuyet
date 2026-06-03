# Phase 03 — VERIFY Visual And Release Gates

## Context Links

- Phase 02: [GREEN Adapter And Wiring](./phase-02-green-adapter-and-wiring.md)
- Visual capture: `tools/sim3-visual/pilot-capture.spec.js`
- QA scripts: `package.json`

## Overview

Priority: P1. Status: Complete.

Validate visual quality and lifecycle after one-route rollout.

## Key Insights

- Visual capture is review evidence, not release gate unless explicitly promoted.
- `test:sim:release` remains the offline release gate.
- Need compare against the existing Sim3 routes to ensure no regression.

## Requirements

Functional:
- Capture `ch2-5-3-sim3.png` under current plan visuals folder.
- Run focused Sim3 contract suite.
- Run Sim3 visual capture suite.
- Run full Sim2 release gate.

Non-functional:
- No page errors in Playwright.
- No blank WebGL canvas.
- No route switching/dispose regression.

## Architecture

Verification command sequence:

```powershell
npm run test:sim3:pilot
npm run test:sim3:visual:capture
npm run test:sim:release
```

Optional manual browser spot check:

```powershell
python -m http.server 8000
```

Open `http://localhost:8000/`, route `ch2-5-3`, switch 3D, drag IC, change `omega`.

## Related Code Files

Modify:
- `tools/sim3-visual/pilot-capture.spec.js` only if Phase 01 did not already update path/case.

Create:
- `plans/260603-2100-sim3-ch2-5-3-single-route-tdd-rollout/visuals/ch2-5-3-sim3.png`

Delete: none.

## Implementation Steps

1. Run `npm run test:sim3:pilot`.
2. Fix any focused lifecycle/state regressions.
3. Run `npm run test:sim3:visual:capture`.
4. Inspect `ch2-5-3-sim3.png` for readable IC, M, radius, velocity arrow.
5. Run `npm run test:sim:release`.
6. If release fails, fix root cause; do not weaken tests.

## Todo List

- [x] Focused Sim3 suite pass.
- [x] Visual capture pass.
- [x] Visual artifact reviewed.
- [x] Full release gate pass.

## Success Criteria

- All verification commands pass.
- New screenshot is nonblank and pedagogically clear.
- Existing five Sim3 screenshots still capture.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Visual looks decorative | Reject and simplify scene; emphasize IC relation. |
| Capture path tied to old plan | Update path during Phase 01/03. |
| Full release catches Sim2 regression | Fix Sim2 wiring, not test. |

## Security Considerations

No security-sensitive behavior.

## Next Steps

Proceed to docs only after gates pass.

## Unresolved Questions

- None.
