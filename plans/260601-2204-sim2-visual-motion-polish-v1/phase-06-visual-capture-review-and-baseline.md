# Phase 06 - Visual Capture Review And Baseline

## Context Links

- Visual pipeline plan: `plans/260531-2122-sim2-visual-quality-eval-pipeline/plan.md`
- Capture tools: `tools/sim2-visual/`
- Visual tests: `tests/sim2-visual-capture-plan.test.js`, `tests/sim2-visual-contact-sheet.test.js`

## Overview

| Item | Value |
|---|---|
| Priority | P1 |
| Status | Complete |
| Goal | Capture 25 route sau rollout, user duyet, roi quyet dinh co chot visual baseline hay khong. |

## Key Insights

- Baseline pixel-diff only useful after human approves current visuals.
- Existing capture produces contact-sheet; use it as review artifact.
- Need also mobile/tablet evidence if final visual nghiệm thu yêu cầu.

## Requirements

Functional:
- Capture full desktop contact-sheet 25/25 after rollout.
- Optionally capture mobile/tablet representative or full 25/25 if needed.
- Produce review report with route-level pass/fail and before/after notes.
- If user approves, add or update visual baseline gate.

Non-functional:
- Visual baseline must not be too brittle.
- Baseline artifacts should be gitignore-aware; avoid committing heavy PNG unless chosen.

## Architecture

```
capture -> contact-sheet -> human review -> findings report
                              |
                              +-> approved baseline? yes/no
```

## Related Code Files

Modify:
- `tools/sim2-visual/capture-sims.spec.js`
- `tools/sim2-visual/build-contact-sheet.js`
- `package.json` if adding dev-only baseline command.
- `.gitignore` if artifact policy changes.
- `tests/sim2-visual-capture-plan.test.js`
- `tests/sim2-visual-contact-sheet.test.js`

Create:
- `plans/260601-2204-sim2-visual-motion-polish-v1/reports/visual-review-after-rollout.md`
- Optional baseline fixture files only after user approval.

Delete:
- None.

## Implementation Steps

1. Run full capture:
   ```powershell
   npm run test:sim:visual:capture
   node tools/sim2-visual/build-contact-sheet.js
   ```
2. Review generated contact-sheet:
   - all routes nonblank.
   - dynamic routes have meaningful t0/mid/end changes.
   - no label overlap/truncation.
   - effects improve clarity, not noise.
3. Add mobile/tablet capture mode if user requires visual nghiệm thu:
   - `375x812` mobile.
   - `768x1024` tablet.
   - keep command dev-only.
4. Write `visual-review-after-rollout.md`:
   - route table.
   - pass/fail.
   - screenshots/contact-sheet paths.
   - unresolved visual decisions.
5. If user approves baseline:
   - choose low-brittle baseline scope: pilot routes + representative Ch1/Ch2/Ch3 first, not all 58 PNG blindly.
   - add command such as `test:sim:visual:baseline` only if stable.
6. Run:
   ```powershell
   npm run test:sim:visual:unit
   npm run test:sim:visual:capture
   ```

## Todo List

- [x] Capture desktop 25/25.
- [x] Build contact-sheet.
- [x] Review visual output.
- [x] Write after-rollout report.
- [x] Decide baseline adoption with user.
- [x] Add baseline command only if approved.

## Success Criteria

- Contact-sheet covers 25/25 routes.
- No high/medium visual defects remain.
- User approves or lists specific fixes.
- Baseline policy documented.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Pixel baseline flaky | Use representative baseline or manual contact-sheet until stable. |
| PNG bloat in repo | Store under plan visuals and ignore heavy raw artifacts unless requested. |
| Mobile defects appear late | Add mobile capture before final docs if visual nghiệm thu demands it. |

## Security Considerations

- Capture is dev-only.
- No external network.

## Next Steps

- Phase 07 docs and release gates.

## Unresolved Questions

- Pixel baseline not adopted in this pass; contact-sheet remains review artifact.
