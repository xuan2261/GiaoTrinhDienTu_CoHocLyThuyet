---
title: "Research Synthesis - Canvas Overlay Cleanup"
type: research
created: 2026-05-14
status: done
---

# Research Synthesis - Canvas Overlay Cleanup

## Options

| Option | Description | Pros | Cons | Verdict |
|---|---|---|---|---|
| CSS hide `.sim-overlay-formula` | `display:none` for formula overlay | Fast, one line | Hides symptom only; renderer still writes stale UI; tests may miss semantic loss | Reject |
| Delete all `P.domMath` calls manually | Edit 135 call sites | Explicit cleanup | High risk, slow, easy to miss, no global contract | Reject as first step |
| Shared primitive guard + migration | Guard `domMath` then migrate formula/value to inspector | Triệt để, testable, low first-step blast radius | Needs careful readout/formula parity | Choose |
| Keep overlay but restyle less visible | Move top-right, opacity down | Preserves old behavior | Still violates user request; canvas remains noisy | Reject |

## Recommended Architecture

Use a shared contract:

- `P.domMath(...)`: disabled for learner UI by default.
- `P.domLabel(...)`: allowed for short semantic labels like `A`, `B`, `F`, `v`, `α`, `I`.
- `P.domPanel(...)`: allowed only for non-equation diagram annotations, with strict tests.
- `scene.formula` + `lab.setFormula(...)`: canonical route formula output.
- `scene.readouts` + `derived(...)`: canonical dynamic numeric output.

## Classification Rules

| Overlay content | Target |
|---|---|
| Static equation: `\sum F=0`, `F=ma`, `v=\dot{x}` | `.sim-formula-panel` |
| Dynamic value: `R=351.1N`, `x=1.23`, `omega=2.00` | `.sim-readout-card` |
| Coordinate or point label: `A`, `B`, `O`, `IC`, `F1` | `P.domLabel` or canvas label |
| Solver/checker step formula | Right inspector formula/hint/readout, or compact non-KaTeX scene label if diagram-critical |
| Diagnostic Promax formula/readout | Keep hidden metadata; do not show learner UI |

## Test Strategy

- Failing-first browser tests scan 58 routes for forbidden overlay formulas.
- Readout parity tests ensure migrated dynamic values are visible in cards.
- Formula panel tests ensure at least route-level formula exists where scene declares it.
- Visual quality tests ensure canvas remains nonblank after formula removal.

## Risk Notes

- Removing all overlay math may reduce pedagogical context on some solver scenes. Mitigation: migrate context into right inspector and add concise diagram labels.
- `data-structural-marks` currently records `domMath`; tests relying on marks must be updated to check visual identity without requiring `domMath`.
- Code standard currently says formula via `primitives.domMath`; docs must be updated after implementation.

## Unresolved Questions

- None.
