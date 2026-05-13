# Promax Simulation Pilot

Date: 2026-05-13

## Changes

- Added pilot invariant manifest/evaluators for 6 mechanics routes.
- Added shared Promax shell status, diagnostics toggles, formula summary, and challenge feedback.
- Added route-owned mini graph summaries for `ch2-1-2`, `ch3-3-1`, and `ch3-6-2`.
- Added focused diagnostic overlays for Ch2 graph/IC and Ch3 energy/collision residuals.
- Added TDD coverage for invariant math, challenge mode, formula/graph helpers, and pilot shell browser behavior.
- The remaining 52 Promax routes stay classified only in the rollout matrix; no mass rewrite is in scope for this pilot.
- Hardened invariant evaluators after debug review: missing observables fail and `ch3-6-2` uses 2D collision momentum/restitution.
- Updated QA scripts so Promax unit tests run in `test:sim:unit` and Promax shell browser tests run in `test:sim:browser`.

## Decisions

- Keep challenge mode local/session-only. No `localStorage`.
- Keep remaining 52-route rollout as matrix/report, not mass code change.
- Keep remaining 52-route rollout as a separate follow-up plan, not hidden scope in this pilot.

## Verification

- `npm run test:sim:unit` PASS.
- `npm run test:sim:quality` PASS.
- `npx playwright test tests/promax-pilot-shell.spec.js` PASS, 9 tests.
- Runtime/manifest/renderer smoke gates PASS.
- `npm run test:sim:browser` PASS, 173 tests.
- `npm run test:sim:release` PASS.

## Unresolved Questions

- Có muốn challenge progress persistence later? Current answer: no.
