# Phase 07 Release Verification And Review

## Context Links

- [README QA commands](../../README.md)
- [Code standards validation](../../docs/code-standards.md)
- [Simulation visual quality test](../../tests/simulation-visual-quality.spec.js)
- [Simulation browser test](../../tests/simulation-browser.spec.js)

## Overview

Priority: P1. Status: Complete. Final gate: ensure CSS/layout changes do not regress 58-route simulation runtime, reading layout, or docs.

## Key Insights

- This is a layout refactor, so visual/browser gates matter more than unit physics tests, but release gate should still include smoke and audit.
- Code review should focus on CSS selector scope and unintended global effects.

## Requirements

- Functional: final UX matches decision B.
- Non-functional: no test failures ignored.
- Documentation: final docs/changelog synced.

## Architecture

Validation matrix:

| Area | Gate |
|---|---|
| JS syntax if touched | `node --check` |
| Simulation runtime | Python smoke |
| Responsive/browser | Playwright responsive tests |
| Visual all-route | `npm run test:sim:visual-quality` |
| Docs/content audit | `python tools\audit.py` |

## Related Code Files

Modify:

- None unless review finds issues.

Create:

- `plans/260513-2146-layout-simulation-responsive-refinement/reports/final-verification-report.md`
- `plans/260513-2146-layout-simulation-responsive-refinement/reports/code-review-report.md`

Delete:

- None.

## Implementation Steps

1. Run targeted tests:
   - Responsive browser tests.
   - Touch test.
   - Visual-quality all routes.
2. Run smoke/audit:
   - Runtime smoke.
   - Content audit.
3. Capture final screenshots:
   - Home.
   - Long text.
   - Math-heavy.
   - Ch1/Ch2/Ch3 simulation.
4. Review diff:
   - Check no accidental route logic changes.
   - Check no generated file edited manually.
   - Check CSS selectors scoped correctly.
5. Write final verification report.

## Todo List

- [x] Run targeted Playwright tests.
- [x] Run Python smoke/audit.
- [x] Capture final screenshots.
- [x] Review CSS scope.
- [x] Write final verification report.
- [x] Address any failures before closing.

## Tests

Minimum final commands:

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "@responsive"
npx playwright test tests/simulation-interaction-engine.spec.js --grep "@touch"
npm run test:sim:visual-quality
python tools\smoke_simulation_runtime.py --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
python tools\audit.py
```

If `js/app.js` or `js/loader.js` touched:

```powershell
node --check js\app.js
node --check js\loader.js
npm run test:sim:unit
```

Recommended full confidence:

```powershell
npm run test:sim:browser
npm run test:sim:release
```

## Success Criteria

- All required tests pass.
- No horizontal page overflow at required viewports.
- Text pages unchanged in max width/readability.
- Simulation pages visibly wider on desktop/tablet.
- Topbar non-overlap verified.
- Docs synced.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Full release gate slow | Run targeted gates first; run release before final close |
| Visual changes accepted without evidence | Require screenshots before/after |
| CSS selector leaks | Diff review and targeted reading page test |

## Security Considerations

No security logic change. Ensure no screenshots or reports include secrets.

## Next Steps

After pass, mark plan complete and update roadmap/changelog if project manager flow requires.
