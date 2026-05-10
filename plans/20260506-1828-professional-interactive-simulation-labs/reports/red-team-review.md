---
type: report
topic: red-team-professional-simulation-labs
created: 2026-05-06
---

# Red Team Review

## Findings

| Severity | Objection | Impact | Mitigation |
|---|---|---|---|
| High | Upgrade all 58 routes can sprawl | Long delivery, inconsistent quality | Shared lab definition + route rubric + phase gates |
| High | More script files can break load order | `file://` blank sims | Script order smoke + registry completeness test |
| High | Visual polish can hide wrong physics | Bad teaching | Pure formula tests + worked examples per route family |
| High | Assessment state migration can corrupt old data | Lost learner progress | New versioned key, no mutation of old keys, malformed storage test |
| High | Direct drag on mobile is easy to get wrong | Poor UX | Pointer abstraction + 375/768 viewport drag tests |
| Medium | Dev-only Playwright adds setup cost | New dependency surface | Keep runtime dependency-free, document install, fallback smoke still exists |
| Medium | File-size rule can be violated again | Maintenance debt returns | Phase gate checks files over 220 lines, require split |
| Medium | All routes may feel over-controlled | Cognitive overload | Controls fallback only; scene-first interaction |

## Required Plan Adjustments

- Add Phase 1 QA harness before refactor.
- Add manifest schema for route objective, interaction, assessment, tests.
- Add per-route professional rubric.
- Split architecture before content upgrade.
- Keep browser QA persistent, not ad hoc.
- Final phase must update docs and release checklist.

## Go/No-Go Gates

| Gate | No-Go if |
|---|---|
| Phase 2 | Any of 58 current route fails to mount |
| Shared UI | Mobile layout clips controls or canvas |
| Assessment | Any route lacks objective/checkpoints |
| Direct interaction | Route has only sliders with no on-scene interaction |
| Final | `file://` full route browser smoke fails |

## Unresolved Questions

- None.
