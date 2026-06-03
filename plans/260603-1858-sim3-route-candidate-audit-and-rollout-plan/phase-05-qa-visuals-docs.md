# Phase 05 QA, Visuals, Docs

## Context Links

- `package.json`
- `tests/sim3-pilot-fallback-dispose.spec.js`
- `tools/sim3-visual/`
- `README.md`
- `docs/system-architecture.md`
- `docs/project-changelog.md`

## Overview

Priority: P1
Status: Complete
Effort: 6h
Goal: verify the 3-route batch without expanding Sim3 beyond controlled scope.

## Key Insights

- Sim3 QA must prove optional route behavior, fallback, and cleanup.
- Visual capture is review evidence, not release gate unless explicitly approved.
- Docs must say Sim3 is still pilot/optional, now 5 routes.

## Requirements

- Add focused visual capture for 3 new routes.
- Keep full 25-route 3D rollout out of scope.
- Keep `test:sim:release` meaningful and passing.
- Manual browser QA must exercise route switching and 2D/3D toggles.
- Run tests against final simplified code only.
- Do not ignore failed tests; fix or document blocker before finish.

## Architecture

- Focused Playwright tests: Sim3 contract/fallback/dispose/state sync.
- Visual capture: all 5 Sim3 routes, stored under this plan `visuals/`.
- Docs: README + architecture/changelog only; avoid large docs churn.

## Related Code Files

Modify:
- `package.json`
- `tools/sim3-visual/pilot-capture.spec.js` or create batch-specific capture spec
- `README.md`
- `docs/system-architecture.md`
- `docs/project-changelog.md`

Create:
- batch visual artifacts under `plans/260603-1858-sim3-route-candidate-audit-and-rollout-plan/visuals/`.
- optional manual QA script/report.

Delete:
- None.

## Implementation Steps

1. RED/VERIFY: ensure `npm run test:sim3:pilot` covers all 5 optional routes and fallback failures.
2. Run `npm run test:sim3:pilot`.
3. Run `npm run test:sim3:visual:capture` and save artifacts for all 5 routes.
4. Run `npm run test:sim:release`.
5. Manual browser QA: `ch2-2-2`, `ch3-6-2`, `ch2-3-2`, `ch2-4-4`, `ch3-5-3`; switch 2D/3D, resize, route away/back.
6. Update README Sim3 pilot section to list 5 routes and gate commands.
7. Update `docs/system-architecture.md` and `docs/project-changelog.md`.
8. Add concise QA report if manual findings need traceability.

## Todo List

- [x] Add visual capture coverage.
- [x] Run focused tests.
- [x] Run release gate.
- [x] Run manual browser QA.
- [x] Update docs.

## Success Criteria

- All 5 Sim3 optional routes work/fallback/dispose.
- Visual artifacts are available for review.
- No regression in Sim2 default routes.
- Docs match actual route list and commands.
- No generated/runtime bundle assumptions changed.

## Risk Assessment

- Visual capture can become brittle. Keep dev-only and focused.
- Full release gate may reveal unrelated content/quiz failure. Triage honestly; do not mask.
- Docs may overstate rollout. Use "optional pilot" wording.

## Security Considerations

Do not add remote CDN/model/texture dependencies.

## Next Steps

After batch approval, decide whether to add stretch `ch2-5-3` or pause Sim3 rollout.
