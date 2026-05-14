---
type: validation-report
created: 2026-05-14
---

# Validation Report

## Locked Decisions

- Readout cards are output/status first, not control mirror.
- Controls appear in readouts only by explicit route declaration.
- Generic `mode`, `alpha`, `time` are policy-controlled.
- Equal values are allowed when they express physics conservation/symmetry.
- This plan changes data policy and scene metadata, not visual layout.

## Acceptance Tests

| Gate | Command |
|---|---|
| JS syntax | `npm run test:sim:unit` |
| Readout targeted browser | `npx playwright test tests/simulation-browser.spec.js --grep "readout dedup"` |
| 58-route mount | `npm run test:sim:browser:route-mount` |
| Browser regression | `npm run test:sim:browser` |
| Visual overflow/readability | `npm run test:sim:visual-quality` |
| Scene/renderer contracts | `npm run test:sim:semantic` |
| Runtime lifecycle | `npm run test:sim:disposal` |
| Full release if scope touches engine broadly | `npm run test:sim:release` |

## Per-Phase Validation Rule

Every phase must include:

- Fresh command output.
- Readout snapshot before/after for affected routes.
- Statement of intentional equalities kept.
- No syntax errors.

## Unresolved Questions

- None.
