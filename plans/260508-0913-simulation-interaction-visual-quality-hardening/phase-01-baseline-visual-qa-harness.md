# Phase 01 - Baseline Visual QA Harness

## Context Links

- [Audit report](../reports/260508-0846-simulation-browser-audit/report.md)
- [Runtime summary](../reports/260508-0846-simulation-browser-audit/all-route-runtime-summary.json)
- [Research 02](./research/researcher-02-visual-qa-gates-report.md)

## Overview

Priority: P1. Status: Complete. Establish reproducible browser probes for the visual issues before changing runtime code.

## Key Insights

- Current tests pass but miss visual quality.
- Need numeric probes, not manual screenshots only.
- Initial gate may run in audit mode; strict mode enabled after fixes.

## Requirements

- Add deterministic browser route sweep for all 58 routes.
- Capture console warnings/errors, edge ink, animation delta, handle anchor data.
- Keep current test suite green.
- Do not change simulation behavior in this phase.

## Architecture

Add focused visual QA file that opens routes through `file://` and static server, reuses existing route discovery pattern, and exports in-memory metrics. Use tags:

- `@visual-audit`: non-strict audit probes
- `@visual-strict`: strict assertions enabled by later phases

## Related Code Files

Modify:
- `package.json` - add `test:sim:visual-quality`
- `tests/simulation-browser.spec.js` - only if shared helper extraction is minimal

Create:
- `tests/simulation-visual-quality.spec.js`

## Implementation Steps

1. Create `tests/simulation-visual-quality.spec.js`.
2. Reuse route discovery from route modules or import helper pattern from existing spec.
3. Implement helper `collectCanvasInkStats(canvas)`.
4. Implement helper `collectRouteVisualMetrics(page, route)`.
5. Add audit test over all 58 routes:
   - route id
   - console warning/error count
   - edge ink counts
   - animation hash delta after 700ms
   - readout contains default `điểm kéo=(190; 255)`
6. Add targeted strict tests but mark with env guard:
   - `SIM_VISUAL_STRICT=1`
   - strict edge gate for known routes after fixes
7. Add `npm run test:sim:visual-quality`.

## Todo List

- [x] Add visual quality spec file.
- [x] Add package script.
- [x] Add audit-mode route sweep.
- [x] Add strict-mode placeholders behind env guard.
- [x] Save no generated screenshots by default.

## Verification & Tests

Run:

```powershell
npm run test:sim:unit
npm run test:sim:browser:baseline
npm run test:sim:visual-quality
```

Expected:
- Existing tests pass.
- Visual quality audit reproduces known issue counts without failing whole suite.
- `SIM_VISUAL_STRICT=1 npx playwright test tests/simulation-visual-quality.spec.js` may fail before later phases; record failures.
- Release gate passed: `npm run test:sim:release`.

## Success Criteria

- A developer can reproduce audit metrics locally.
- No runtime JS changed.
- No browser console errors introduced.

## Risk Assessment

- Risk: flaky animation hash. Mitigation: use tolerant pixel delta and wait after route stable.
- Risk: test file grows too large. Mitigation: keep helpers compact; split only if needed.

## Security Considerations

- No external network.
- Do not write user data or localStorage beyond test context.

## Next Steps

Phase 02 uses this harness to confirm duplicate registrations are gone.
