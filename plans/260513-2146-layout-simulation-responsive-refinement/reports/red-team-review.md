# Red Team Review

## Summary

Plan direction is sound but can fail if CSS widening is implemented with broad selectors or brittle negative margins. TDD gates are mandatory before CSS changes.

## Findings

| Severity | Risk | Why it matters | Required mitigation |
|---|---|---|---|
| High | `.content-area` widened globally | Breaks textbook readability | Test reading width before/after |
| High | Desktop wide sim causes horizontal scroll | Bad UX, visual gate failure | Use viewport-bounded `min()` and overflow tests |
| High | Loader class leaks to non-sim pages | Reading pages inherit sim layout | If using class, clear on every `loadPage` |
| Medium | Topbar hides too much | Search/zoom discoverability loss | Define priority; keep search/theme reachable |
| Medium | Tests assert exact width | Flaky across DPR/font/browser | Use ranges/tolerances, not pixel-perfect |
| Medium | Mobile canvas still hard to use | CSS cannot solve small screen physics | Goal is no overflow + touch works, not desktop parity |
| Low | Docs drift | Future changes undo intent | Update `design-guidelines.md` after implementation |

## Required Plan Adjustments

- Phase 02 must happen before Phase 03.
- Phase 03 must not alter simulation logical dimensions.
- Phase 04 should be CSS-first. JS toggle only if proven needed.
- Phase 07 must include screenshot evidence, not only test logs.

## Alternative Considered

Fullscreen simulation mode is not recommended for this plan. It adds state, keyboard/focus, accessibility, and lifecycle complexity without proving basic width refinement first.

## Verdict

Proceed with plan as TDD CSS/layout refactor. Keep implementation narrow.

## Unresolved Questions

- Need final target width after Phase 01 metrics.
