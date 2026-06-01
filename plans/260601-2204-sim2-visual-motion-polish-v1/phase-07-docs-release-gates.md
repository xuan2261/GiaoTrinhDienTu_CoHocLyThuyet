# Phase 07 - Docs Release Gates

## Context Links

- README: `README.md`
- Docs: `docs/design-guidelines.md`, `docs/system-architecture.md`, `docs/code-standards.md`, `docs/project-roadmap.md`, `docs/project-changelog.md`
- Release gate: `npm run test:sim:release`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Pending |
| Goal | Dong bo docs va chay release gates sau khi polish v1 duoc duyet. |

## Key Insights

- Docs currently describe sim2 architecture and existing visual language; v1 adds motion/feedback conventions.
- Changelog must record meaningful visual/UX behavior changes.
- Do not over-update docs with implementation noise.

## Requirements

Functional:
- Update docs only for behavior/conventions that changed.
- Record changelog and roadmap status.
- Run full release verification.

Non-functional:
- Keep docs concise.
- No AI references.
- Preserve existing offline/runtime constraints.

## Architecture

```
implemented polish -> docs sync -> release gates -> plan status updates
```

## Related Code Files

Modify:
- `README.md` - update sim2 commands/feature summary if needed.
- `docs/design-guidelines.md` - document motion/feedback rules.
- `docs/system-architecture.md` - mention shared visual feedback primitives if architecture-significant.
- `docs/code-standards.md` - update sim2 current standards, avoid stale 52-route legacy confusion if touched.
- `docs/project-roadmap.md` - add polish v1 status.
- `docs/project-changelog.md` - add dated entry.
- `plans/260601-2204-sim2-visual-motion-polish-v1/plan.md` - mark completed only after verify.

Create:
- `docs/journals/260601-sim2-visual-motion-polish-v1.md` after completion.

Delete:
- None.

## Implementation Steps

1. Update documentation:
   - design motion rules: subtle, reduced-motion, readout flash, handle pulse.
   - architecture notes only if core API behavior changed.
   - changelog with Added/Changed/Verified.
2. Run final commands:
   ```powershell
   npm run test:sim:physics
   npm run test:sim:mount
   npm run test:sim:visual:unit
   npm run test:sim:visual:capture
   npm run test:content
   npm run test:quiz
   npm run test:sim:release
   ```
3. Optional publish strict:
   ```powershell
   npm run test:audit:strict
   ```
4. Review git diff for accidental generated/heavy artifacts.
5. Update plan phase statuses and write journal.

## Todo List

- [ ] Update design guidelines.
- [ ] Update architecture/README if behavior changed.
- [ ] Update changelog and roadmap.
- [ ] Run final gates.
- [ ] Write journal.
- [ ] Mark plan complete after all gates pass.

## Success Criteria

- All release gates PASS.
- Docs match implementation.
- No confidential/heavy unintended artifacts staged.
- Plan can be handed to commit/review flow.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Docs drift from actual behavior | Update docs after code/tests, not before. |
| Heavy PNG artifacts enter git | Check `.gitignore` and `git status --short`. |
| Stale legacy 52-route docs confuse sim2 | Only update touched sections; note canonical 25 route engine. |

## Security Considerations

- No secrets.
- Do not commit local server URLs or machine-specific paths except plan references.

## Next Steps

- Handoff to `/ck:code-review` or commit pipeline after implementation.

## Unresolved Questions

- None.
