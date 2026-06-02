# Phase 06 Visual QA, Docs, And Release Gates

## Context Links

- [Selective baseline spec](../../tools/sim2-visual/selective-baseline.spec.js)
- [Visual capture spec](../../tools/sim2-visual/capture-sims.spec.js)
- [README](../../README.md)
- [System Architecture](../../docs/system-architecture.md)
- [Design Guidelines](../../docs/design-guidelines.md)
- [Project Changelog](../../docs/project-changelog.md)

## Overview

Priority: P1  
Status: Pending  
Goal: verify pilot quality, document Sim3 architecture, and keep release gates honest.

## Key Insights

- Screenshot baseline should cover pilot routes only.
- Visual approval matters because target is classroom teaching quality.
- Docs must make clear Sim3 is optional pilot, not new canonical engine.

## Requirements

Functional:
- Add focused visual capture/baseline for `ch2-2-2` 3D and `ch3-6-2` 3D.
- Existing `test:sim:release` stays meaningful.
- Update docs for offline dependency and fallback.

Non-functional:
- Do not add all-25 visual baseline.
- Keep docs concise.

## Architecture

Visual QA options:

```text
tools/sim3-visual/pilot-baseline.spec.js
  -> fixtures mount route
  -> switch 3D
  -> deterministic step count
  -> screenshot #host
```

Docs:
- README: brief Sim3 pilot note and commands.
- system architecture: optional Sim3 layer.
- design guidelines: 3D visual rules.
- changelog: added pilot and verification results.

## Related Code Files

Modify:
- `package.json`
- `README.md`
- `docs/system-architecture.md`
- `docs/design-guidelines.md`
- `docs/project-changelog.md`
- optionally `docs/project-roadmap.md`

Create:
- `tools/sim3-visual/pilot-baseline.spec.js`
- `tools/sim3-visual/playwright.sim3-baseline.config.cjs` if separate config needed

Delete:
- None

## Implementation Steps

1. Add dev-only command:
   - `test:sim3:pilot`
   - optionally `test:sim3:visual:baseline`.
2. Add pilot visual baseline for 2 routes only.
3. Run verification matrix:
   - `npm run test:sim:physics`
   - `npm run test:sim:mount`
   - focused Sim3 pilot tests
   - visual baseline/capture
4. Update docs.
5. Record results in changelog.
6. Prepare user review note with screenshots/contact sheet path.

## Todo List

- [ ] Add Sim3 pilot visual test command.
- [ ] Add 2-route screenshot baseline.
- [ ] Run full relevant gates.
- [ ] Update docs and changelog.
- [ ] Produce completion report.

## Success Criteria

- All relevant tests pass.
- Docs explain Sim3 pilot/fallback/offline dependency.
- User has visual artifacts to review.
- No unrelated generated content churn.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Visual baseline brittle | Only 2 routes, fixed host size/theme, deterministic steps |
| Docs overstate rollout | Use "pilot" language |
| Release gate slowdown | Keep 3D visual baseline dev-only unless approved |

## Security Considerations

- Document no CDN/remote asset requirement.
- Audit no secrets/env changes.

## Next Steps

After user visual approval, create a separate rollout brainstorm/plan for more routes.
