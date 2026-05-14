---
type: red-team-review
created: 2026-05-14
---

# Red Team Review

## Findings

| Severity | Risk | Why It Matters | Mitigation |
|---|---|---|---|
| High | Removing control cards hides key values | Some routes rely on inspector readout to show slider value | Per-route opt-in; do not globally remove without tests |
| High | `time` removal breaks animation QA assumptions | Browser tests may expect readout changes during play | Keep `appendTime` true only for animated/time routes with objective need |
| High | Alias dedup by value can remove valid conservation equalities | `p trước=p sau` is a teaching point | Use semantic duplicate rules, not naive equal-value removal |
| Medium | `ch2-1-3` numeric reseed can desync renderer formula | Renderer may assume current seed geometry | Verify via canvas/readout browser test and formula relation |
| Medium | Scene catalog changes can alter scene signatures | Scene identity tests may fail intentionally | Update expected behavior through tests only if semantic change intended |
| Medium | File size limit | `sim-professional-lab.js` already large risk | Keep engine patch small; if new helper grows, create focused test helper not runtime module |

## Required Hard Gates

- Duplicate tests must fail before implementation.
- All 58 routes must still mount.
- Browser direct-drag/readout stability must remain passing.
- Visual-quality overflow must remain passing.
- No broad renderer rewrite.

## Rejected Approaches

- Naive dedup by equal displayed value.
- Removing all controls from readouts globally in one patch.
- Per-route CSS hiding cards.
- Changing compact card layout again.

## Unresolved Questions

- None.
