---
title: "Red Team Review"
type: red-team
created: 2026-05-07
---

# Red Team Review

## Summary

Plan is necessary. Main risk: developers may create 58 renderer wrappers that still call the same generic draw path. Gates must inspect function identity and body, not just route metadata.

## Findings

| Risk | Severity | Mitigation |
|---|---:|---|
| Renderer wrappers hide shared implementation | P0 | Static gate checks unique function references and normalized body hash; browser masked canvas gate. |
| File size explosion | P1 | Group renderers by topic; split before 200 lines; low-level helpers shared only. |
| Browser hash brittle across fonts/platforms | P1 | Use masked structural hash and semantic DOM/debug ids, not full screenshot pixels only. |
| Assessment breaks due state key changes | P1 | Keep assessment state compatibility; add Phase 10 positive/negative tests. |
| Route-specific implementation becomes copy-paste noise | P1 | Require renderer design notes per group; body hash gate catches clones. |
| Release gate misses new strict tests | P0 | `test:sim:release` explicitly runs renderer contract and semantic browser suite. |
| Performance regression from many scripts | P2 | Static no-bundler load acceptable; keep modules small; smoke browser load time representative. |
| Old family renderer remains active fallback | P0 | Fail if final renderer selector falls back to `family` for any registered route. |

## Required Plan Changes

- Add a baseline phase that intentionally fails current code with new strict gates.
- Add architecture phase before route migration.
- Make final gate reject metadata-only uniqueness.
- Include docs sync because standards currently describe old scene template layer.

## Unresolved Questions

None.

