---
phase: 4
title: "RC5 Overlay Text Whitelist Expansion"
status: completed
priority: P1
effort: "3h"
dependencies: [1]
---

# Phase 04: RC5 Overlay Text Whitelist Expansion

## Overview

Khắc phục RC5 — overlay text label bị suppress quá tay. `isShortOverlayLabel` (`js/sim-route-renderer-primitives.js:91-98`) hiện chỉ chấp nhận đơn ký tự, khiến `M_O`, `Rx`, `v_a`, `m₁`, `aₙ` đều rỗng. Cần whitelist hợp lý cho physics labels mà vẫn giữ contract "không có công thức/giá trị động trên canvas" từ plan overlay-cleanup trước.

## Requirements

- Functional:
  - Whitelist mới chấp nhận: subscript ASCII (`F_1`, `M_O`, `R_x`), Unicode subscript (`m₁`, `aₙ`), prime (`F'`, `R''`), greek single (`α`, `β`, `ω`, `θ`, `ε`), vector overline `vec{}` LaTeX-tier OK qua `domMath` không qua `domLabel`.
  - Tiếp tục từ chối: số đo động (`5.3 N`, `1.2 m/s`), full sentences, phương trình `=`/`+`/`-` (giữ contract overlay-cleanup).
- Non-functional:
  - Regex < 200 chars, dễ đọc.
  - Test coverage: 30 chuỗi accept + 20 chuỗi reject.

## Architecture

```
domLabel(text) ─► allowCanvasOverlayText(text)
                    ├─► isShortOverlayLabel(text) → match physics label pattern
                    └─► or allowCanvasFormulaOverlay() === true (debug toggle)
```

Pattern (revised after red-team P0-1 + F8 Vietnamese):

```js
// Use \p{L} Unicode property to cover Vietnamese diacritics + Greek + Latin.
// Allow trailing primes/subscripts (ASCII) AND unicode sub/super FOLLOWING the letter,
// not as a strict alternation. Allow up to 12 chars for short Vietnamese terms.
const OVERLAY_LABEL_PATTERN =
  /^(?:[\p{L}][\p{L}\p{M}\p{N}_'₀-₉⁰²³ⁿ]{0,11}|IC|FBD|RA|RB|R_x|R_y|M_O)$/u;
```

Required behavior (asserted by tests):

| Input | Expected | Reason |
|---|---|---|
| `F` | accept | single Latin |
| `F_1`, `F_x`, `M_O`, `R_a` | accept | ASCII subscript |
| `m₁`, `aₙ`, `vₐ` | accept | unicode subscript after letter |
| `F'`, `R''` | accept | prime mark |
| `α`, `ω`, `θ`, `δ` | accept | Greek single |
| `IC`, `FBD` | accept | physics acronym (special-case) |
| `tĩnh`, `cân` | accept (≤6) | Vietnamese short term |
| `hợp lực` | reject | contains space |
| `đã chọn` | reject | contains space |
| `cân-bằng` (with `-`) | reject | not in char class |
| `M = F·d`, `F + F* = 0` | reject | contains `=`, `+`, space |
| `5.3`, `5x`, `1.2 N` | reject | digit-led / decimal |
| `v(t)` | reject | parenthesis |

Reject all formulas/values stays the contract from prior overlay-cleanup plan.

## Related Code Files

- Modify: `js/sim-route-renderer-primitives.js` — `isShortOverlayLabel` (line 91-98), `allowCanvasOverlayText` (line 96-98).
- Add: `js/sim-route-renderer-primitives.js` — export `OVERLAY_LABEL_PATTERN` for tests.
- Add: documentation comment line above pattern explaining what's allowed/rejected.
- Tests: extend `tests/sim-correctness-realism.test.js` with comprehensive accept/reject matrix.

## Implementation Steps

1. RED: Add test case in `tests/sim-correctness-realism.test.js`:
   ```js
   const accept = [
     'F','F_1','F_x','M_O','R_a','m_1','a_n','m₁','aₙ','vₐ',
     'α','ω','θ','δ','β','ε','ε_d',
     "F'","R''",
     'IC','FBD','R_x','R_y',
     'tĩnh','cân','phương','vận','lực'  // Vietnamese short terms
   ];
   const reject = [
     'F·d','5.3','1.2 N','5x','x = 0','v(t)','speed',
     'M = F·d','F + F* = 0','x²+y²','hợp lực','đã chọn',
     'F⃗' /* combining vector mark not in pattern */,
     '' /* empty */,
     'AVeryLongSymbolNameWayBeyondTwelveChars'
   ];
   accept.forEach(s => assert.ok(P.isShortOverlayLabel(s), `accept ${JSON.stringify(s)}`));
   reject.forEach(s => assert.ok(!P.isShortOverlayLabel(s), `reject ${JSON.stringify(s)}`));
   ```
   Verify pattern at Node-time before Phase 04 GREEN — red-team P0-1 surfaced that the original plan regex did NOT actually match `aₙ`, `vₐ`, `F'`, `R''` (subscript+prime alternation was non-cumulative).
2. Implement new regex pattern. Run unit test → GREEN.
3. Run all 58 routes via Playwright `mountRouteOnce`, collect `data-structural-marks`, count `domLabelSuppressed:` per route. Should drop to 0 for declared scene labels (manual `domLabel` calls in renderer).
4. If specific renderer still emits suppressed labels, decide: rename label OR move to `.sim-formula-panel` if equation-like.
5. Run `@rc5-overlay-suppressed` browser suite → GREEN.
6. Confirm `tests/simulation-visual-quality.spec.js` overlay-cleanup invariants from previous plan still GREEN (no formula leak).

## Todo List

- [ ] RED: 30 accept + 20 reject test
- [ ] Implement new regex
- [ ] Unit test GREEN
- [ ] Audit all 58 routes for `domLabelSuppressed`
- [ ] Rename or relocate any leftover suppressed labels
- [ ] @rc5 browser suite GREEN
- [ ] overlay-cleanup invariants from prior plan still GREEN

## Success Criteria

- [ ] Unit test: 30/30 accept + 20/20 reject pass
- [ ] Browser test: zero `domLabelSuppressed` for any declared label across 58 routes
- [ ] No `=`, `+`, `-`, `·`, digit-led, or whitespace-containing string passes whitelist
- [ ] `npm run test:sim:visual-quality` (overlay cleanup gate) still GREEN

## Risk Assessment

- **Risk:** New whitelist accidentally accepts `5x` or `10F` (digit followed by letter).
  **Mitigation:** Anchor `^[A-Za-zα-ωΑ-Ω]` requires letter prefix.
- **Risk:** Renderer authors abuse whitelist to push values.
  **Mitigation:** Length cap 6; runtime mark `data-overlay-text-len > 6` triggers test failure.

## Security Considerations
- N/A.

## Next Steps
- Phase 06 magnitude arrow may add `F` label with magnitude indicator — must comply with whitelist.
