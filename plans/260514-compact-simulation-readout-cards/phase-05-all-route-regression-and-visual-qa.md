# Phase 05 - All-Route Regression And Visual QA

## Context Links

- [Plan](./plan.md)
- `package.json`
- `tests/simulation-browser.spec.js`
- `tests/simulation-visual-quality.spec.js`
- `tests/simulation-interaction-engine.spec.js`

## Overview

Priority: P2. Status: Complete. Proved compact readout CSS did not break 58-route simulation behavior, right inspector, overflow, or theme readability.

## Key Insights

- CSS change affects all 58 routes.
- Even CSS-only changes can break tests that depend on geometry/visibility.
- Route sync tests must remain clean because readout DOM hooks stay same.

## Requirements

- Run targeted tests first, then broad browser/visual tests.
- Include unit syntax gate because repo requires compile checks after code changes.
- Do not ignore failed tests.

## Architecture

No further implementation expected unless tests expose CSS regression.

## Related Code Files

| Action | File |
|---|---|
| Read | `package.json` |
| Read/possibly modify if needed | `tests/simulation-browser.spec.js` |
| Read/possibly modify if needed | `tests/simulation-visual-quality.spec.js` |
| Read | `tests/simulation-interaction-engine.spec.js` |

## Implementation Steps

1. Run targeted compact/right-inspector Playwright.
2. Run JS/unit simulation gate.
3. Run browser suite.
4. Run visual-quality suite.
5. If browser/visual fails, identify if failure is true regression or brittle assertion.
6. Fix true CSS regression; avoid weakening tests.
7. Save QA report in plan reports.

## Todo List

- [x] Run targeted compact/right-inspector test.
- [x] Run `npm run test:sim:unit`.
- [x] Run `npm run test:sim:browser`.
- [x] Run `npm run test:sim:visual-quality`.
- [x] Save QA report with commands/status.

## Success Criteria

- Targeted and broad gates pass.
- No route sync/readout drift regression.
- No dark/light readability regression.
- QA evidence saved.

## Risk Assessment

- Risk: full `test:sim:browser` takes time.
- Mitigation: targeted first; broad gates before final handoff.

## Security Considerations

- None.

## Tests

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "compact readout|right inspector"
npm run test:sim:unit
npm run test:sim:browser
npm run test:sim:visual-quality
```

Optional final gate if CSS change unexpectedly touches many layout assumptions:

```powershell
npm run test:sim:release
```

## Next Steps

- Phase 06 updates docs/changelog and handoff.

## Unresolved Questions

- None.
