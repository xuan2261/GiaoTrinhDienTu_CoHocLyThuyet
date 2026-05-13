# Phase 08 Mini Graph And Formula Readout Layer

## Context Links

- [UI UX Research](./research/researcher-02-ui-ux-pedagogy-qa-report.md)
- [Phase 07](./phase-07-pedagogy-challenge-mode.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Goal | Add compact visual explanation tools without heavy dependency |
| Scope | Pilot routes first |

## Key Insights

- Graphs are valuable only where data is time-series or residual-over-time.
- Formula substitution is higher priority than charts for most routes.
- Avoid Chart.js unless custom Canvas graph cannot meet requirements.

## Requirements

### Functional

- Add shared formula substitution renderer:
  - formula template.
  - current values.
  - result.
- Add mini graph component:
  - route-owned data buffer.
  - pause/resume.
  - accessible text summary.
  - reduced-motion behavior.
- Use on:
  - `ch2-1-2`: `x/v/a` graph.
  - `ch3-3-1`: energy graph.
  - `ch3-6-2`: momentum before/after compact comparison.

### Non-Functional

- No mandatory external chart library.
- Keep graph readable at mobile width.
- Provide text/table fallback for graph values.

## Architecture

```text
js/sim-promax-readouts.js
  -> format formula substitution
  -> expose accessible summary

js/sim-promax-mini-graph.js
  -> small Canvas/SVG graph helpers
  -> no heavy dependency

route behavior
  -> data samples
  -> graph/readout API
```

## Related Code Files

| Action | File |
|---|---|
| Create | `js/sim-promax-readouts.js` |
| Create | `js/sim-promax-mini-graph.js` |
| Modify | `js/sim-lab-ui.js` |
| Modify | `js/sim-professional-lab.js` |
| Modify | Pilot route renderers/behaviors |
| Modify/create | `tests/promax-formula-graph.test.js` |
| Modify/create | `tests/promax-formula-graph.spec.js` |

## Implementation Steps

1. Define formula substitution schema:
   - `template`.
   - `values`.
   - `result`.
   - `unit`.
2. Add helper to render KaTeX-safe formula line.
3. Add mini graph helper:
   - line.
   - residual band.
   - before/after bar.
4. Integrate into 3 high-value pilot routes.
5. Add text summary for screen readers.
6. Add tests for:
   - formula no overflow.
   - graph nonblank.
   - reduced motion pauses streaming.
   - values match readouts.

## Todo List

- [ ] Create formula readout helper.
- [ ] Create mini graph helper.
- [ ] Integrate `ch2-1-2`.
- [ ] Integrate `ch3-3-1`.
- [ ] Integrate `ch3-6-2`.
- [ ] Add visual/a11y tests.

## Verification / Tests

```powershell
node --check js\sim-promax-readouts.js
node --check js\sim-promax-mini-graph.js
node tests\promax-formula-graph.test.js
playwright test tests\promax-formula-graph.spec.js
npm run test:sim:visual-quality
npm run test:sim:browser
python tools\audit_simulation_quality.py --all --max-js-lines 220
```

Manual checks:

- 375px formula wraps without horizontal scroll.
- Graph remains legible in dark/light.
- Values in graph match readout.
- Reduced motion freezes/limits streaming.

## Success Criteria

- Formula substitution works on pilot routes.
- Mini graph used only where meaningful.
- No heavy dependency added.
- Tests prove graph/readout consistency.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Graph scope explodes | Limit to 3 routes in this phase |
| KaTeX formula overflow | Add wrapping tests and CSS constraints |
| Canvas graph inaccessible | Provide text summary/table fallback |

## Security Considerations

- No remote chart library.
- No user data.

## Next Steps

- Phase 09 converts pilot results into rollout matrix for remaining routes.

## Unresolved Questions

- If custom graph is inadequate, decide whether a local chart library is worth it. Default: no.
