# Phase 08 - Localization Docs Release Validation

## Context Links

- [Docs standards](../../docs/code-standards.md)
- [Architecture](../../docs/system-architecture.md)
- [Design guidelines](../../docs/design-guidelines.md)

## Overview

Priority: P1. Status: Complete. Clean localized UI/copy, update docs, and run full release validation.

## Key Insights

- Some visible formulas/copy still use English or ASCII placeholders: `verify theorems`, `const`, `status: OK`.
- Docs must reflect route-owned handle contract and visual QA gate.
- Final phase must include tester and code-review handoff during implementation.

## Requirements

- Visible simulation UI stays Vietnamese, with technical English only when conventional.
- Docs reflect new interaction architecture.
- Changelog records user-facing quality fix.
- Full release QA passes.

## Architecture

Docs to update after code is final:

- `docs/code-standards.md`
- `docs/system-architecture.md`
- `docs/design-guidelines.md`
- `docs/project-changelog.md`
- `docs/project-roadmap.md` if milestone status changes

## Related Code Files

Modify:
- `js/sims/ch2/*`
- `js/sims/ch3/*`
- `docs/code-standards.md`
- `docs/system-architecture.md`
- `docs/design-guidelines.md`
- `docs/project-changelog.md`
- `docs/project-roadmap.md`
- `README.md` only if QA commands change

## Implementation Steps

1. Search visible simulation copy for English leaks:
   - `verify theorems`
   - `status`
   - `const`
   - `Thang`
   - `Work`, `Energy`, `Impulse`, `Momentum` if visible.
2. Replace with Vietnamese academic terms:
   - `kiểm tra định lý`
   - `trạng thái`
   - `hằng số` or `không đổi`
   - `Thẳng`
   - keep symbols like `v`, `a`, `F`, `L`, `I`, `ω`.
3. Update docs with route-owned handle contract.
4. Update changelog and roadmap.
5. Run complete validation.
6. During implementation workflow, delegate final `tester` and `code-reviewer` passes per project rules.

## Todo List

- [x] Clean visible copy.
- [x] Update docs.
- [x] Update changelog/roadmap.
- [x] Run full release QA.
- [x] Record residual risks.

## Verification & Tests

Run:

```powershell
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:semantic
npm run test:sim:visual-quality
npm run test:sim:browser
python -m compileall -q tools
python tools\audit.py
python tools\audit.py --strict-equations
python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict --katex
python tools\smoke_simulation_routes.py --require-p1
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --malformed-assessment-storage
npm run test:sim:release
```

Expected:
- All commands pass.
- No visible English leak in simulation DOM UI except technical symbols.
- Docs and changelog match actual implementation.
- Release gate passed: `npm run test:sim:release`.

## Success Criteria

- Release candidate is browser-tested, localized, documented.
- User complaint items from audit are closed or explicitly listed as residual.

## Risk Assessment

- Risk: full release QA catches unrelated equation/content issue. Mitigation: do not bypass; fix or report blocker.

## Security Considerations

- Do not commit secrets.
- No new external dependencies.

## Next Steps

After completion, unblock or archive `260507-1855-simulation-visual-ux-upgrade` depending on remaining polish scope.
