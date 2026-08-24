---
title: "Phase 7: Ổn định bằng chứng mô phỏng và review sư phạm"
status: completed
priority: P0
effort: "8-12 ngày + thời gian review"
dependencies: [phase-03]
---

# Phase 7: Ổn định bằng chứng mô phỏng và review sư phạm

## Overview

Tạo 25 Simulation Specifications, 10 Sim3 pedagogical reviews, định nghĩa 4D và drift gate. Không sửa physics/clock/geometry/lifecycle tại đây; các defect đó thuộc plan `260713-1524`.

## External Precondition

Các phase runtime 1-10 của `260713-1524-fix-all-sim2-sim3-defects-deep-tdd` phải hoàn tất; objective/visual/release evidence của phase 11 phải sẵn để tham chiếu. Nếu chưa, Phase 7 chỉ author draft specs, không đánh dấu `verified`.

## Requirements

- Exactly 25 Sim2 spec records resolve to manifest, factory, physics oracle, mount/capture/test refs.
- Exactly 10 Sim3 review records: concept, 2D limitation, 3D value, cognitive risk, fallback equivalence, retain/remove decision và reviewer role/unit.
- 4D = 3D spatial representation + time/state evolution + learner interaction; không phải file format/fourth spatial dimension.
- Missing/extra/duplicate/renamed/stale refs fail drift validation.
- Self-reported debug metrics không là oracle duy nhất.

## Architecture

Curated `data/simulation-specifications.json` và `data/sim3-pedagogical-reviews.json` join structural runtime manifests. `tools/sim-validation/validate-simulation-drift.js` kiểm tra coverage và executable refs; không import vào browser runtime.

## Related Code Files

- Consume: `js/sim2/sim2-route-manifest.js`, `js/sim2/registry.js`, `js/sim2/physics/**`, `js/sim3/sims/*.js`.
- Reuse: `tests/sim2-route-coverage.test.js`, `tests/sim2-visual-capture-plan.test.js`, `tests/sim3-pilot-fallback-dispose.spec.js`.
- Create: manifests trên, `docs/simulation-4d.md`, drift validator và `tests/simulation-*-contract.test.js`.

## Tests Before

1. Run the future drift validator against empty/incomplete fixtures and require failure for missing 25 Sim2 specs and 10 Sim3 reviews; repository absence is discovery evidence only.
2. Mutation fixtures: missing/duplicate route, stale test path, title/chapter drift, unknown Sim3 adapter.
3. Confirm upstream sim gates status; validator must block `verified` evidence if the owning plan is incomplete.

## Implementation Steps

1. **RED:** contract tests require 25/10 exact join coverage and complete mandatory fields.
2. Define Sim2 schema: LO, phenomenon, assumptions, formulas, units/ranges, invariants/boundaries/sample oracles, controls/reset/a11y/text alt, test/capture/manual evidence.
3. Author specs from current code/theory and independent oracles; route-by-route review.
4. Define Sim3 pedagogy schema and review each adapter; record retain-3D or 2D-only decision.
5. Review và ghi nhận `docs/simulation-4d.md`; remove any unsupported 4D claim from acceptance/report language.
6. Implement drift validator and evidence freshness checks.
7. **GREEN:** all curated refs resolve after upstream runtime plan passes.
8. **Refactor:** shared schema/readers; never add metadata fields to runtime factories unless runtime needs them.

## Tests After

- `node --test tests/simulation-specification-contract.test.js tests/sim3-pedagogical-review-contract.test.js tests/simulation-drift-validation.test.js`.
- Upstream `npm run test:sim:release`, `npm run test:sim3:pilot`, strict visual/release gates.
- Three consecutive retry-free upstream release runs before `verified` status.

## Todo

- [x] Confirm upstream sim plan completion/evidence.
- [x] Author 25 Sim2 **draft** specifications; keep runtime evidence unverified pending upstream precondition.
- [x] Record 10 Sim3 **internal technical-review draft** decisions; no independent/institutional approval claim.
- [x] Record the limited 4D definition and current blocker.
- [x] Add structural drift validator, source freshness checks, and mutation-first contract tests.

## Success Criteria

- 25/25 complete Sim2 specs and 10/10 reviewed Sim3 decisions.
- Zero manifest/spec/test/capture drift.
- Every physics claim has independent oracle or recorded manual evidence.
- 4D language is precise and does not claim a non-existent product feature.
- No runtime/generated DOCX change is introduced by this phase.

## Risk Assessment

- Spec mirrors buggy code: require theory/source references and independent oracles.
- Upstream plan unfinished: keep status draft/blocked, never mark verified.
- Visual novelty outweighs pedagogy: explicit cognitive-load and fallback review.

## Next Steps

Phase 8 audits accessible controls/text alternatives; Phase 9 uses reviewed LO gaps only.