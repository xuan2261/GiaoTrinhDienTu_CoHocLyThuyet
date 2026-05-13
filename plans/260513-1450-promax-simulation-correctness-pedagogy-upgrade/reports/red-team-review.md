# Red Team Review

## Summary

Plan risk is scope creep. Promax can easily become another full rebuild. Guardrails must force shared-first, pilot-first, invariant-first.

## Findings

| Severity | Risk | Mitigation |
|---|---|---|
| High | Trying to upgrade all 58 routes before proving pilot | Pilot 6 routes only before rollout |
| High | Duplicated route formulas | Put invariant/evaluator helpers in shared modules |
| High | Visual polish hides physics bugs | Physics tests required before UI polish completion |
| Medium | Graph layer becomes heavy dependency | Use existing Canvas primitives first; no Chart.js unless proved needed |
| Medium | Accessibility regression from custom controls | Keep native inputs/buttons and keyboard tests |
| Medium | Old stale plans confuse execution | New plan states dependency policy clearly |
| Low | Too many files in `index.html` | Group shared promax modules carefully |

## Required Plan Changes

- Add phase 01 baseline quality matrix before code.
- Add invariant manifest phase before pilot routes.
- Add final rollout decision gate after pilot, not automatic 58-route rewrite.
- Add per-phase commands.

## Verdict

Proceed if plan remains pilot-first and does not promise full 58-route polish before invariant proof.

## Unresolved Questions

- None.
