# Red Team Review

## Summary

Plan is necessary, but biggest risk is trying to "beautify" 58 routes before fixing contracts. The plan must enforce order: QA harness -> duplicate cleanup -> interaction contract -> route-family repairs -> polish.

## Findings

| Severity | Risk | Mitigation |
|---|---|---|
| Critical | New handles can break assessment checkpoints that expect `primary`/`P`/`b1` | Keep `assessmentState()` route-owned; add tests for representative positive paths |
| High | Edge-ink gate may flag intentional frame/border strokes | Gate only scene canvas area or tolerate known frame strokes; use route screenshot review for initial threshold |
| High | Ch2 duplicate cleanup can accidentally remove canonical final renderers | Verify renderer identity before/after with `npm run test:sim:renderer-contract` |
| Medium | Adding visual tests to huge browser spec makes maintenance worse | Create focused `tests/simulation-visual-quality.spec.js` |
| Medium | Animation gate can force passive motion on Ch1 static concept diagrams | Ch1 may pass through construction/drag delta, not passive animation |
| Medium | Clamping arrows can distort physics meaning | Clamp endpoint for rendering only; keep true vector value in readout |

## Required Plan Adjustments

- Do not introduce external physics engine.
- Do not use screenshots as only oracle; add numeric browser probes.
- Keep file sizes under control by adding focused QA files and splitting route-family updates if needed.
- Make duplicate registrations fail once cleanup completes.

## Unresolved Questions

- Whether Ch1 should auto-animate construction remains product decision, not blocker.

