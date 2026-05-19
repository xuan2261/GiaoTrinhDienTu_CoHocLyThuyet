---
phase: 1
title: "Baseline TDD Harness And Failing Invariants"
status: completed
priority: P1
effort: "5h"
dependencies: []
---

# Phase 01: Baseline TDD Harness And Failing Invariants

## Overview

Tạo test infrastructure mới để 6 root causes có RED test trước khi sửa code. Test phải fail được trên master HEAD và biến thành GREEN sau từng phase tương ứng.

## Requirements

- Functional:
  - Tạo `tests/sim-correctness-realism.test.js` (Node-based) cho RC1/RC4/RC5 invariants có thể chạy không cần browser.
  - Tạo `tests/sim-handle-anchor-invariants.spec.js` (Playwright) cho RC1/RC2 cần runtime browser thật.
  - Mỗi RC có suite riêng được tag (`@rc1`, `@rc4`, `@rc5`...) để chạy độc lập.
  - Document expected RED → GREEN transition trong từng test.
- Non-functional:
  - Test phải deterministic, chạy được Windows + Mac.
  - Không phá `npm run test:sim:release`. Add new tests vào release pipeline cuối cùng (Phase 09).
  - Tổng thời gian thêm < 30s cho `test:sim:browser` suite.

## Architecture

Hai lớp test:

1. **Static/Node level** (`tests/sim-correctness-realism.test.js`):
   - Phân tích AST/source của `js/sim-professional-lab.js`, `js/sim-route-renderer-primitives.js` để assert pattern invariants.
   - VD: `legacyHandles` không export, `isShortOverlayLabel` regex bao gồm `_`, `²`, `subscript`.

2. **Browser level** (`tests/sim-handle-anchor-invariants.spec.js`):
   - Mount từng route qua existing `simulation-test-utils.js#mountRouteOnce()`.
   - Sau mount, đọc `data-handle-ids`, `data-structural-marks`.
   - Assert handle.get() vs body anchor coords qua `page.evaluate()`.

3. **Tag map** RED expected:
   - `@rc1-handle-anchor` — current FAIL trên ch1-2-3, ch1-2-6, ch1-1-8 (legacy fallback)
   - `@rc4-spring-base` — current FAIL trên ch3-3-1, ch3-3-2
   - `@rc5-overlay-suppressed` — current FAIL: count `domLabelSuppressed` > 0
   - `@rc3-spring-helix` — current FAIL: spring uses zigzag, expects sinusoidal
   - `@rc3-rim-ao` — current FAIL: realisticBody marks lack `rim`/`ao`
   - `@rc3-arrow-length` — current FAIL: arrow lineWidth varies with magnitude (or magnitude not honored)
   - `@rc2-preset-gallery` — current FAIL: ch1 routes have no preset buttons
   - `@rc2-no-autocycle` — anti-regression: must stay GREEN (currently passes by accident — no auto-cycle exists)
   - `@rc2-impulse-flash` — current FAIL: ch3-6-2 collision emits zero arrow marks at contact point
   - `@rc2-impulse-newton3` — current FAIL: depends on impulse-flash existing
   - `@rc2-trail` — current FAIL: ch2-1-1 has no trail buffer
   - `@rc6-theme-parity` — current FAIL: light theme canvas variants < threshold
   - `@a11y-aria-label` — current FAIL: zero `.sim-handle-a11y` overlays
   - `@a11y-keyboard-drag` — current FAIL: keyboard events ignored
   - `@a11y-reduced-motion` — current FAIL: matchMedia not consulted
   - `@a11y-live-region` — current FAIL: no `.sim-aria-live` element

## Related Code Files

- Create: `tests/sim-correctness-realism.test.js`
- Create: `tests/sim-handle-anchor-invariants.spec.js`
- Create: `tests/sim-correctness-realism-fixtures.js` — shared fixture factory: route lists, expected anchor offsets, mount helpers.
- Modify: `tests/simulation-test-utils.js` — export new helper `getStructuralMarks(page, routeId)`, `getHandleAnchorPairs(page, routeId)`.
- Modify: `package.json` — add scripts `test:sim:correctness` (node) and `test:sim:correctness:browser` (playwright).

## Implementation Steps

1. Read `tests/simulation-test-utils.js` and `tests/simulation-browser.spec.js` to mirror existing patterns (route discovery, dev server bootstrap).
2. Write `tests/sim-correctness-realism-fixtures.js`:
   - Export `RC1_ROUTES = ['ch1-2-3','ch1-1-3','ch1-2-1','ch1-2-6','ch1-1-8',...]`
   - Export `RC4_ROUTES = ['ch3-3-1','ch3-3-2','ch1-1-8','ch1-2-1']`
   - Export `EXPECTED_OVERLAY_LABEL_PATTERNS = [/^F_\w+$/, /^[A-Za-z]_[A-Za-z0-9]+$/, /^[a-zA-Z][₀-₉]?$/, ...]`
3. Write `tests/sim-correctness-realism.test.js`:
   - Suite `@rc1-source-code-shape`: parse `js/sim-professional-lab.js`, assert `legacyHandles` not in registered behavior callsite list.
   - Suite `@rc5-whitelist-source`: read `js/sim-route-renderer-primitives.js`, run regex `isShortOverlayLabel` against `EXPECTED_OVERLAY_LABEL_PATTERNS`, assert all return true.
   - Suite `@rc3-primitive-shape`: assert `P.spring` source contains sine-based math (`Math.sin`) not zigzag (`i % 4 === 1`).
4. Write `tests/sim-handle-anchor-invariants.spec.js`:
   - For each route in `RC1_ROUTES`, mount, get `data-handle-ids`, drag each handle to 3 positions, after each move call `getHandleAnchorPairs`, assert distance `≤ 8px`.
   - For each route in `RC4_ROUTES`, capture canvas pixel scan around spring-mass junction, assert continuous ink (no gap > 2px).
   - For each route, assert `data-structural-marks` doesn't contain `domLabelSuppressed:` for declared scene labels.
5. Run all new suites on master HEAD. Confirm ALL fail. Record failing counts in fixtures comment.
6. Add to `package.json`:
   ```json
   "test:sim:correctness": "node --test tests/sim-correctness-realism.test.js",
   "test:sim:correctness:browser": "playwright test tests/sim-handle-anchor-invariants.spec.js"
   ```
7. Create `tests/__snapshots__/sim-correctness-baseline.json` — record `data-structural-marks` and `data-handle-ids` for 10 representative routes as baseline.

## Todo List

- [ ] Read `tests/simulation-test-utils.js` and `tests/simulation-browser.spec.js`
- [ ] Create fixtures file with RC1/RC4/RC5 route lists
- [ ] Create Node-level test suite (3 suites tagged @rc1/@rc3/@rc5)
- [ ] Create browser-level Playwright spec (RC1 + RC4 + RC5 cross-browser invariants)
- [ ] Add npm scripts for correctness tests
- [ ] Run on master, confirm RED across all suites
- [ ] Save baseline snapshot for diff-only invariants
- [ ] Document expected GREEN transition per phase in test file headers

## Success Criteria

- [ ] `npm run test:sim:correctness` reports ≥ 6 failing assertions on master
- [ ] `npm run test:sim:correctness:browser` reports ≥ 30 failing route×invariant combos on master
- [ ] No existing test in `npm run test:sim:release` regresses
- [ ] Baseline snapshot file under 50KB committed
- [ ] CI runtime overhead < 30s
- [ ] All new tests have header comment: `// RED on master HEAD; expected GREEN after Phase NN`

## Risk Assessment

- **Risk:** Source-code regex assertions become brittle when refactor.
  **Mitigation:** Match on stable markers (function names exported via `module.exports`/`window.SimX`), not implementation lines.
- **Risk:** Playwright environment differs between Windows and Mac causing flaky pixel scans.
  **Mitigation:** Use `data-structural-marks` and `data-handle-ids` (DOM), avoid pixel comparisons in this phase.
- **Risk:** `data-structural-marks` empty for some routes due to `resetMarks` not called early enough.
  **Mitigation:** Phase 01 first audits which routes emit marks; routes missing marks documented as Phase 02 prerequisite.

## Test Plan (TDD-first)

| Test | RED on master | GREEN after phase |
|---|---|---|
| `@rc1-handle-anchor` for ch1-2-3 | YES (handle 30px off body) | Phase 02 |
| `@rc4-spring-base` for ch3-3-1 | YES (12px gap) | Phase 03 |
| `@rc5-overlay-suppressed` for ch1-1-4 (`M_O`) | YES (suppressed) | Phase 04 |
| `@rc3-spring-helix` FFT check | YES (zigzag, triangular wave harmonics) | Phase 05 |
| `@rc3-rim-ao` mark presence | YES (no rim mark) | Phase 06 |
| `@rc3-arrow-length` magnitude variance + lineWidth constancy | YES (no magnitude support) | Phase 06 |
| `@rc2-preset-gallery` for ch1-2-3 | YES (no preset buttons) | Phase 08 |
| `@rc2-no-autocycle` anti-regression | passes by accident | Phase 08 (must stay GREEN) |
| `@rc2-impulse-flash` for ch3-6-2 | YES (no contact arrows) | Phase 08 |
| `@rc2-impulse-newton3` invariant | YES | Phase 08 |
| `@rc2-trail` for ch2-1-1 | YES (no trailBuffer state) | Phase 08 |
| `@rc6-theme-parity` light canvas variants | YES (variants < 60) | Phase 08 |
| `@a11y-aria-label` for 58 routes | YES (zero overlays) | Phase 08b |
| `@a11y-keyboard-drag` for ch1-2-3 | YES (keyboard ignored) | Phase 08b |
| `@a11y-reduced-motion` for ch3-3-1 | YES (autoplay ignores matchMedia) | Phase 08b |
| `@a11y-live-region` for ch1-2-3 | YES (no aria-live element) | Phase 08b |

## Security Considerations

- New tests run only locally + CI; no network access.
- Source code parsing: avoid `eval`; use simple regex/AST inspection only.

## Next Steps

- Phase 02 begins after RED baseline confirmed.
- Each subsequent phase MUST keep all earlier phases' tests GREEN.
