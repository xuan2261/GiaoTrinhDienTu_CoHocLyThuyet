---
title: "Phase 06 - Docs và release verification"
status: planned
priority: P1
dependsOn: [phase-05-update-browser-unit-tests.md]
---

# Phase 06 - Docs và release verification

## Context Links

- `README.md`
- `docs/codebase-summary.md`
- `docs/code-standards.md`
- `docs/system-architecture.md`
- `docs/project-roadmap.md`
- `docs/project-changelog.md`

## Overview

Update docs to state that Section VII checker routes were deleted from simulation contracts and that canonical simulation coverage is now 52 routes.

## Requirements

- README QA commands use 52 routes.
- System architecture no longer states checker math for `ch2-7-*` or `ch3-7-2` is canonical simulation behavior.
- Codebase summary removes transitional "58 canonical / 52 mountable" wording.
- Roadmap/changelog record the deletion as a completed bugfix/refactor after implementation.
- Full release gate passes.

## Architecture

Docs should describe the steady state:

- Section VII pages: textbook content only.
- Simulation subsystem: 52 canonical active routes.
- QA gates: manifest/scene/renderer/runtime all require 52.

Historical changelog entries may keep old facts by date. Add a new current entry rather than rewriting history.

## Related Code Files

Modify:

- `README.md`
- `docs/codebase-summary.md`
- `docs/code-standards.md`
- `docs/system-architecture.md`
- `docs/project-roadmap.md`
- `docs/project-changelog.md`

Read:

- `docs/project-overview-pdr.md`
- `docs/deployment-guide.md` if QA commands are duplicated there

## Implementation Steps

1. Update README structure table and QA simulation section from 58 to 52.
2. Update system architecture route count and remove VII checker canonical notes.
3. Update code standards QA commands and route-contract language.
4. Update codebase summary with the new route model.
5. Update roadmap status for simulation contracts and Section VII cleanup.
6. Add changelog entry with affected route ids and verification commands.
7. Run full verification gate and record results in changelog.

## Todo List

- [ ] README current route model updated.
- [ ] System architecture updated.
- [ ] Code standards updated.
- [ ] Codebase summary updated.
- [ ] Roadmap and changelog updated.
- [ ] Full release gate run and results recorded.

## Verification / Tests

```powershell
rg "58 canonical|canonical 58|58/58|require-routes 58|expect-runtime-routes 58|ch2-7-\\*|ch3-7-2" README.md docs package.json tools tests
python tools\smoke_simulation_manifest.py --require-routes 52 --require-objectives --require-direct
python tools\smoke_simulation_scene_catalog.py --strict --require-routes 52
python tools\smoke_simulation_renderer_contract.py --strict --require-routes 52
python tools\smoke_simulation_runtime.py --expect-runtime-routes 52 --check-mount-rollback --check-listener-cleanup
npm run test:sim:release
python tools\audit.py
python -m compileall -q tools
```

Allowed grep hits: historical changelog/journal entries and this plan.

## Success Criteria

- Docs, scripts, tests, and runtime all agree on 52 canonical simulation routes.
- Release gate passes.
- Section VII content-only behavior remains documented and tested.

## Risk Assessment

- Docs may contain historical 58 references. Do not rewrite old dated entries unless they are in current-state sections.

## Security Considerations

No security impact.

## Next Steps

After this phase, implementation is ready for code review and commit.
