# Phase 10 Release QA Docs And Handoff

## Context Links

- [Plan](./plan.md)
- [Phase 09](./phase-09-rollout-matrix-for-remaining-routes.md)
- [README](../../README.md)
- [Project Changelog](../../docs/project-changelog.md)
- [Project Roadmap](../../docs/project-roadmap.md)

## Overview

| Field | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Goal | Release-quality verification, docs sync, implementation handoff |
| Scope | Pilot implementation plus rollout docs |

## Key Insights

- Final gate must include existing release suite plus new promax tests.
- Docs must state pilot scope honestly.
- Do not claim all 58 are promax-upgraded if only pilot is complete.

## Requirements

### Functional

- Run full release gate.
- Run new promax tests.
- Update docs:
  - architecture notes.
  - roadmap.
  - changelog.
  - design guidelines if shell changed.
- Write final report:
  - what changed.
  - pilot evidence.
  - remaining rollout plan.
  - known risks.

### Non-Functional

- No broken links.
- No AI references in commit messages if later committed.
- Reports concise, unresolved questions at end.

## Architecture

```text
Implementation output
  -> tests
  -> docs sync
  -> final report
  -> cook handoff / next plan
```

## Related Code Files

| Action | File |
|---|---|
| Modify | `README.md` if QA commands change |
| Modify | `docs/system-architecture.md` |
| Modify | `docs/design-guidelines.md` |
| Modify | `docs/project-roadmap.md` |
| Modify | `docs/project-changelog.md` |
| Create | `plans/.../reports/final-promax-pilot-report.md` |
| Create | `docs/journals/{date}-promax-simulation-pilot.md` |

## Implementation Steps

1. Run final test suite.
2. Fix any failed tests in relevant prior phase scope.
3. Update docs with actual changes only.
4. Add final report:
   - pilot route list.
   - tests run.
   - before/after matrix summary.
   - rollout recommendation.
5. Ask code-reviewer in implementation workflow after code exists.
6. Prepare handoff command for next rollout.

## Todo List

- [ ] Run full release gate.
- [ ] Run all promax-specific tests.
- [ ] Update architecture/design docs.
- [ ] Update roadmap/changelog.
- [ ] Write final report.
- [ ] List unresolved questions.

## Verification / Tests

```powershell
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:semantic
npm run test:sim:browser
npm run test:sim:visual-quality
npm run test:sim:release
python tools\audit.py
python tools\audit.py --strict-equations
python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict --katex
```

Promax-specific final gate:

```powershell
node tests\simulation-invariants.test.js
node tests\promax-challenge-mode.test.js
node tests\promax-formula-graph.test.js
playwright test tests\promax-pilot-ch1.spec.js tests\promax-pilot-ch2.spec.js tests\promax-pilot-ch3.spec.js
playwright test tests\promax-challenge-mode.spec.js tests\promax-formula-graph.spec.js
```

Manual release checks:

- `file://` opens and mounts pilot routes.
- Static server opens and mounts pilot routes.
- Dark/light screenshots for 6 pilot routes.
- 375px and landscape smoke.

## Success Criteria

- Existing release gate passes.
- New promax tests pass.
- Docs reflect real pilot scope.
- Final report clearly states remaining work.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Final gate too slow | Still required for release; use targeted tests during earlier phases |
| Docs overclaim | State pilot-only results |
| Equation audit unrelated failure | Fix or document blocker, do not ignore |

## Security Considerations

- Do not commit secrets.
- No new network dependency.
- No private user data.

## Next Steps

- If pilot accepted, create follow-up rollout plan for remaining routes by family.

## Unresolved Questions

- None blocking. User decides whether to continue to full 58-route rollout.
