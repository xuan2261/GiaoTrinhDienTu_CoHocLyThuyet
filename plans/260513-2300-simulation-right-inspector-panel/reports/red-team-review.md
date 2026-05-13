---
type: red-team
date: 2026-05-13
topic: simulation-right-inspector-panel
status: complete
---

# Red Team Review

## Summary

Plan is feasible. Main danger is layout overreach: forcing side panel where width is insufficient, or creating brittle CSS against current direct-child DOM order.

## Findings

| Severity | Risk | Why It Matters | Mitigation |
|---|---|---|---|
| High | Horizontal overflow at tablet widths | Current widened container can exceed main area if grid math wrong | Gate at 1366/1024/768/390 and assert document scroll width |
| High | Canvas compressed or distorted | Physics coordinates assume `760x440`; user reads geometry visually | Preserve aspect ratio and no logical size change |
| Medium | Inspector too long for routes with many controls | User may miss formula/hint | Order inspector: readouts, controls, formula, hint; no hidden panels |
| Medium | CSS direct-child grid brittle | DOM currently created by `SimCore` then rearranged by `SimLabUI` | Test expected direct children; fallback wrapper only if necessary |
| Medium | A11y order confusing | Visual side panel differs from reading order | Keep DOM order scene then controls/readouts; live status remains |
| Low | Existing tests query old positions | Tests mostly query visibility/classes, not position | Add explicit layout assertions; keep class names unchanged |

## Required Plan Adjustments

- Include failing-first tests before CSS.
- Include a rollback rule: remove grid rules returns previous stacked layout.
- Include no route renderer/behavior edits.
- Include docs sync because layout contract changes.

## Verdict

Proceed with CSS-first shared shell layout. Do not add fullscreen. Do not create per-route variants.

## Unresolved Questions

- None.
