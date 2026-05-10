---
title: "Validation Report"
type: validation
created: 2026-05-07
---

# Validation Report

## Summary

Critical decisions locked. Implementation should proceed with strict route renderer uniqueness.

## Decisions

| Question | Decision |
|---|---|
| How strict is route-specific? | Completely distinct route renderer function for each of 58 routes. |
| Are shared helpers allowed? | Yes, only low-level primitives/math helpers; not final renderer functions. |
| Can existing lab shell remain? | Yes. `SimLabUI`, lifecycle, storage, and `SIM_MAP` stay. |
| Should `family` remain? | Can remain metadata/grouping, but cannot be final render dispatch. |
| Must controls/interactions be unique too? | Not always unique by count, but must be concept-specific and validated. |
| Need new bundler/framework? | No. Keep static script loading and `file://`. |
| Can generated files be edited? | No. Do not manually edit `js/pages.js` or `chapters/`. |

## Validation Gates Required

- Static renderer contract gate.
- Static scene catalog + route manifest gate.
- Browser masked visual structure gate.
- Route-specific interaction tests by group.
- Full release gate including strict renderer checks.

## Unresolved Questions

None.

