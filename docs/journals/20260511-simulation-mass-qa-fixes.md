# Mass QA and Optimization Fixes for V2 Simulations

**Date**: 2026-05-11 10:00
**Severity**: High
**Component**: Simulation Routes (V2) & Mass Conversion Audit
**Status**: Resolved

## What Happened

While executing the batch simulation conversion V2 plan, the mass conversion audit tests were failing for a significant number of routes (up to 72 initially). Several fundamental issues in the simulation mounting, UI layer, routing, and testing utilities caused the verification to fail.

## The Brutal Truth

The mass conversion assumed identical behaviors across all routes without thoroughly verifying whether the foundational layers were correctly rendering the V2 components. We had tests running that checked for classes that were incorrectly applied or timed out due to missing page definitions, making the test harness an unreliable indicator of simulation health until these were resolved.

## Technical Details

1. **SVG Class Application Error**: Dozens of `ch*` simulation files failed immediately upon initialization because they set the class name of the SVG using `svg.className = 'sim-svg-v2';`. On `SVGElement`, `className` returns an `SVGAnimatedString` which only has a getter.
2. **Missing Page Hashes (Timeouts)**: The `simulation-test-utils.js` sequentially navigates to hashes like `#ch1-1-3b`. However, `ch1-1-3b` was not explicitly listed in `PAGE_MAP`, which resulted in `js/loader.js` rendering a 404 block and aborting simulation mounting, leading to Playwright timeouts.
3. **Double Injection Block**: Some pages like `muc-VII-4.html` (for `ch3-7-4`) already contained a `<div class="sim-container">` placeholder. The `loader.js` mistakenly skipped injecting simulations entirely if it found an existing container.
4. **Missing Checkbox UI**: `ch1-2-2.js` called `ui.addCheckbox`, which was never implemented in `SimUI` (`js/sim-ui-v2.js`).
5. **Overly Strict Test Sanity Check**: `mass-conversion-audit.spec.js` mandated `.sim-readout-v2` existence, but many simulations used `.sim-ui-panel-v2` instead. It also lacked tolerance for math parse warnings.

## What We Tried

- Isolated testing to dump console errors for broken routes.
- Executed regex replacements over all 80 simulation route scripts to replace `.className` assignment with `.setAttribute('class', ...)`.
- Re-implemented the page fallback loading logic in `js/loader.js`.

## Root Cause Analysis

- A misunderstanding of how the DOM API handles properties for SVG vs HTML elements (`className` vs `setAttribute`).
- The V2 simulation test utility was misaligned with how `loader.js` actually renders simulation fragments, assuming a 1-to-1 hash-to-route mapping that didn't apply to nested variants like `b` and `c`.
- V2 UI component API didn't have full parity with the legacy app elements used by specific interactive routes (`addCheckbox`).

## Lessons Learned

- **Test the Test Harness**: When mass auditing 80+ files, make sure the test runner accurately reflects how the user actually interacts with the files in production.
- **SVG Elements != HTML Elements**: Standard DOM properties don't always behave the same way on SVG elements. `setAttribute` is the safest way to assign attributes globally.
- Always check the HTML fragments for legacy integration points (like hardcoded `.sim-container` tags) instead of assuming a clean slate.

## Next Steps

- Proceed to commit the fixes to `master`.
- Run final disposal and memory leak tests (`test:sim:disposal`) to ensure the fixed architecture releases SVG contexts successfully across all routes.