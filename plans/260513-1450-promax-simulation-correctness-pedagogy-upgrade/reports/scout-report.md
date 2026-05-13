# Scout Report

## Summary

Project is static `HTML/CSS/JS`, offline-first, no runtime bundler. Active simulation stack is shared `SimProfessionalLab` with 58 canonical route contracts. Plan should extend current architecture, not replace it.

## Relevant Files

| File | Role |
|---|---|
| `README.md` | Runtime, QA commands, 58-route context |
| `docs/system-architecture.md` | Active simulation layers and runtime contract |
| `docs/design-guidelines.md` | Academic visual direction and `.sim-lab` rules |
| `docs/code-standards.md` | File size, no generated edits, validation gates |
| `js/sim-professional-lab.js` | Lab orchestration, derived/readouts, mount |
| `js/sim-lab-ui.js` | Shared shell, formula/hint/readout DOM |
| `js/sim-interactions.js` | Pointer/touch/keyboard handles |
| `js/sim-physics-statics.js` | Statics formulas |
| `js/sim-physics-kinematics.js` | Kinematics formulas |
| `js/sim-physics-dynamics.js` | Dynamics formulas |
| `js/sim-route-manifest.js` | 58-route objectives |
| `js/sims/ch*/` | Route scenes, renderers, behaviors |
| `tests/` | Unit/browser/visual/semantic QA |
| `tools/audit_simulation_quality.py` | JS quality/file-size gate |

## Existing Plan Relationships

| Plan | Status | Meaning for new plan |
|---|---|---|
| `260512-0845-decuong-simulation-full-rebuild` | complete | Baseline to build on |
| `20260506-1828-professional-interactive-simulation-labs` | completed | Older architecture baseline |
| `260509-1820-decuong-style-58-simulation-ux-rebuild` | in-progress but stale | Do not depend. Mention as superseded/stale |
| `20260510-0516-route-specific-simulation-rebuild` | pending but stale blockers | Do not depend. Avoid reviving |

## Constraints

- Must run by `file://`.
- No framework/bundler.
- No manual edit of `js/pages.js`.
- New JS files should stay under 220 lines.
- Preserve 58 route ids and registry contracts.
- Tests must include phase-specific verification.

## Unresolved Questions

- None.
