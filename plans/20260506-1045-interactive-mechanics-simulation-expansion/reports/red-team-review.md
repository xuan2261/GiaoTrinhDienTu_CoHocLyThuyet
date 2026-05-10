---
type: report
topic: red-team-review
created: 2026-05-06
---

# Red Team Review

## Findings

| Severity | Objection | Impact | Required Mitigation |
|---|---|---|---|
| High | Scope is huge: 45-55 new interactions | Long delivery, high regression risk | Sequential phases, P1 first, route smoke gates |
| High | Current `js/simulations.js` too large | More edits make maintenance worse | Phase 2 refactor before expansion |
| High | Wrong physics formulas worse than no sim | Teaches wrong concepts | Worked-example validation per sim, formula comments sparingly |
| High | Mobile controls can become unusable | Bad learner experience | Touch smoke at 375/768 widths per phase |
| Medium | Too many visual effects can distract | Lower learning value | Controls minimal, no decorative motion |
| Medium | New localStorage can break old state | Lost progress/notes risk | Namespaced key, schema version, no old key mutation |
| Medium | `file://` can break script loading | Release blocker | No dynamic import, no fetch-only dependencies |
| Medium | Print styles hide controls | Acceptable, but content should not look broken | Ensure static canvas summary/placeholder prints okay |

## Plan Changes From Review

- Added blocker on existing release plan.
- Added Phase 2 runtime foundation before content expansion.
- Added route-level verification gates in every phase.
- Added Phase 9 shared activity/checker layer instead of ad hoc scoring.
- Added strict no-framework/no-network decision.

## Go/No-Go Gates

| Gate | No-Go if |
|---|---|
| Phase 2 | Registry breaks any existing 18 sims |
| Ch1/Ch2/Ch3 phases | Any new route has console error or blank canvas |
| Phase 9 | Activity state corrupts quiz/progress/notes keys |
| Phase 10 | `file://` smoke fails |

## Unresolved Questions

- Whether to implement all P2/P3 interactions in first release or keep P1-only milestone.
