---
type: report
topic: validation-professional-simulation-labs
created: 2026-05-06
---

# Validation Report

## User Decisions

| Question | Answer |
|---|---|
| Priority: pro visual or pedagogy/assessment? | Both |
| Scope: subset or all routes? | Upgrade all 58 current routes |
| Script file count? | More files accepted for maintainability |

## Plan Defaults

| Decision | Default |
|---|---|
| Runtime dependencies | None |
| Dev QA dependencies | Playwright acceptable if documented |
| Architecture | Shared kernels + topic/route modules |
| Content source | No hand-edit generated fragments |
| Assessment storage | New versioned key; old keys untouched |
| Route target | Current 58 `SIM_MAP` routes only |

## Acceptance Rubric

Each upgraded route must have:

- Clear learning objective.
- On-scene direct interaction or direct challenge interaction.
- Slider/control fallback if precision needed.
- Visual state readable at desktop, tablet, mobile.
- Formula/result panel tied to current state.
- Reset/default state.
- At least 2 assessment checkpoints.
- Browser smoke evidence.

## Unresolved Questions

- None.
