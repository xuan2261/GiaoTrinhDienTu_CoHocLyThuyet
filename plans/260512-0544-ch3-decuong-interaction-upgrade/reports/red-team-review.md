# Ch3 Red Team Review

## Findings

| Risk | Severity | Why It Matters | Mitigation |
|---|---|---|---|
| Bulk legacy Ch3 file becomes active | Critical | Duplicate route IDs and file-size violation | Keep as reference or archive; never active silently |
| Energy/momentum math wrong | High | Ch3 credibility depends on conservation/readouts | Add representative physics invariants |
| Animation nondeterminism | High | Flaky tests and confusing UX | Pause on drag, deterministic reset, bounded tick |
| Collision visual hides before/after state | Medium | Learner cannot inspect relation | Show pre/post vectors/readouts |
| Overloaded canvas labels | Medium | Dense Ch3 routes become unreadable | Move detail to readout cards/panels |

## Required Plan Adjustments

- Include explicit legacy/bulk reconciliation phase.
- Include energy/momentum/collision tests, not only route mount.
- Final Ch3 phase should run full release gate because Ch3 often touches shared animation code.

## Verdict

Plan acceptable if it refuses bulk route activation and treats physics invariants as acceptance criteria.

## Unresolved Questions

Không có.
