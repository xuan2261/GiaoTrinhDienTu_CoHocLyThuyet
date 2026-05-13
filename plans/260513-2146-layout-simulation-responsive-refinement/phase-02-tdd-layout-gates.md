# Phase 02 TDD Layout Gates

## Context Links

- [Phase 01](./phase-01-baseline-responsive-audit.md)
- [Simulation browser test](../../tests/simulation-browser.spec.js)
- [Simulation test utils](../../tests/simulation-test-utils.js)
- [Brainstorm report](../reports/brainstorm-260513-2146-layout-simulation-responsive.md)

## Overview

Priority: P1. Status: Complete. Add focused tests before implementation. Tests must lock reading width, simulation wide behavior, topbar non-overlap, and no page horizontal scroll.

## Key Insights

- Existing tests check overflow but not target layout intent.
- Do not add broad visual snapshot tests that create noisy failures.
- Keep tests deterministic and numeric.

## Requirements

- Functional: tests express desired layout contract.
- Non-functional: tests must be focused, fast enough for local QA.
- Backward compatibility: existing simulation route tests unchanged.

## Architecture

Add Playwright checks to existing test files unless a new spec is cleaner. Prefer reusing `tests/simulation-test-utils.js` helpers.

Proposed assertions:

```js
const widths = await page.evaluate(() => ({
  pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  content: document.querySelector('.content-area')?.getBoundingClientRect().width || 0,
  sim: document.querySelector('.sim-container.sim-lab')?.getBoundingClientRect().width || 0,
}));
expect(widths.pageOverflow).toBeLessThanOrEqual(1);
expect(widths.content).toBeLessThanOrEqual(940);
expect(widths.sim).toBeGreaterThan(widths.content);
```

Only apply `sim > content` on desktop/tablet where viewport can support it; on mobile require no overflow.

## Related Code Files

Modify:

- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-browser.spec.js`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\tests\simulation-test-utils.js` if helper extraction is needed.

Create:

- Avoid new spec unless existing files become messy. If needed: `tests/layout-responsive.spec.js`.

Delete:

- None.

## Implementation Steps

1. Add helper to measure:
   - Page overflow.
   - Content width.
   - Simulation container width.
   - Topbar child overlap.
2. Add tests for viewports:
   - `1366x768`.
   - `768x812`.
   - `390x844`.
3. Add reading page contract:
   - Content max width remains near current target.
   - Long text page no page-level horizontal overflow.
4. Add simulation page contract:
   - Desktop/tablet simulation container gets more horizontal room than text content where possible.
   - Mobile simulation remains within viewport.
5. Add topbar contract:
   - No visible child boxes overlap.
   - Search remains usable or intentionally compact.

## Todo List

- [x] Add layout metric helper.
- [x] Add reading width test.
- [x] Add simulation width/no-overflow test.
- [x] Add topbar non-overlap test.
- [x] Confirm tests fail or capture current gap where appropriate.

## Tests

Run:

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "@responsive"
npm run test:sim:visual-quality
```

If new spec is created:

```powershell
npx playwright test tests/layout-responsive.spec.js
```

## Success Criteria

- New tests define the desired behavior.
- Failures are actionable, not flaky.
- Existing all-route route-mount tests remain unaffected.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Desktop assertion too strict | Gate only on min viewport where width target is feasible |
| Font rendering changes cause false overlap | Use bounding rect overlap with tolerance |
| Test requires code not yet implemented | Expected in TDD; document expected fail before Phase 03 |

## Security Considerations

No security impact. Tests run local static content only.

## Next Steps

Implement scoped simulation width in Phase 03 until tests pass.
