# Validation Report

## Confirmed Decisions

| Question | Decision |
|---|---|
| Scope | All current 58 simulation routes. |
| Granularity | Every route/tiểu mục in current simulation scope must have its own simulation scene. |
| Runtime | Keep static `HTML/CSS/JS`, `file://`, no bundler. |
| Shell | Keep professional lab shell; fix scene content underneath. |
| Tests | Add uniqueness gates and keep existing release gates. |

## Assumptions

- "58 route" means current `SIM_MAP` simulation routes, not all 78 content route ideas in the older coverage matrix.
- P2/P3 non-SIM_MAP ideas remain out of scope unless user separately asks.
- Route-specific scene can use shared templates if initial layout, controls/readouts, formula, and learning objective are unique.

## Validation Result

Plan can proceed without more user input.

Unresolved questions: none.
