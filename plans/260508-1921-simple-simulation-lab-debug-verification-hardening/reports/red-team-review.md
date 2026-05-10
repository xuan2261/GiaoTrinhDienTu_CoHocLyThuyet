---
title: "Red Team Review - Simple Lab Debug Verification"
type: red-team-review
created: 2026-05-08
---

# Red Team Review

## Summary

Plan is necessary because automated green tests can still miss user-visible interaction drift. Main risk: turning the browser evidence into a one-off manual check instead of a repeatable gate.

## Findings

| Severity | Risk | Impact | Mitigation |
|---|---|---|---|
| High | Agent-browser screenshots prove only sampled routes | Broken route outside samples can slip | Pair manual samples with all-route direct-drag Playwright |
| High | Updating tests to match changed UI can mask regression | False green release | Every test update must map to Plan 260508 requirement |
| Medium | `agent-browser` daemon/session can hang | Incomplete manual QA | Reset session, use screenshots + Playwright fallback |
| Medium | Readout values can change due animation, not drag | False interaction proof | Pause animation before drag where possible |
| Medium | Visual plan starts before debug evidence captured | Future regressions hard to attribute | Keep this plan as blocker until evidence/docs done |
| Low | Docs drift with pass counts | Confusing release status | Record exact command/date in validation report |

## Hard Requirements Before Completion

- Fresh command output, not inherited from older run.
- Evidence screenshots under this or source plan report folder.
- Each phase documents its own verification command.
- No unresolved correctness concern hidden under `DONE_WITH_CONCERNS`.

## Unresolved Questions

None.
