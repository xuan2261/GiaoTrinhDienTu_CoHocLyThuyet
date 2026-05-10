---
phase: 6
title: "Integrated QA & Regression"
status: completed
priority: P1
effort: "4h"
dependencies: [3, 4, 5]
---

# Phase 6: Integrated QA & Regression

## Overview
Final verification of all 58 routes to ensure the visual overhaul didn't break functionality and that performance remains acceptable.

## Requirements
- All 58 simulations must mount without errors.
- Visual regression check against Phase 00 baselines.
- Performance benchmark (target 60fps on standard hardware).

## Architecture
- **Playwright Suite**: Use `tests/simulation-visual-quality.spec.js`.
- **Audit Tool**: Update `tools/audit_simulation_quality.py` to check for realistic primitive usage.

## Related Code Files
- Modify: `tests/simulation-visual-quality.spec.js`
- Modify: `tools/audit_simulation_quality.py`

## Implementation Steps
1. **Visual Regression**: Run `npm run test:sim:visual-quality` and compare screenshots.
2. **Performance Audit**: Manually test high-complexity routes (Ch3 collisions, Ch2 gears) to ensure no frame drops.
3. **Cross-Browser Check**: Verify gradients and rounded corners in both Chromium and Firefox.
4. **Assessment Integrity**: Ensure the "Realistic" rendering doesn't change the hit-areas or coordinate systems used for student assessments.

## Success Criteria
- [x] 0 console errors/warnings across all 58 routes.
- [x] Visual diff shows clear improvement in material quality and shading.
- [x] 83/83 Playwright tests passed across all 58 routes.
- [x] Assessment pass rate remains at 100% for existing test cases.

## Risk Assessment
- **False Failures**: Tiny anti-aliasing changes in gradients might trigger visual diff failures. Mitigation: Use perceptual hash with high tolerance for color-only changes.
- **Device Fragmentation**: Shadows might look different on different GPUs. Mitigation: Use standard Canvas shadows, avoid complex GLSL shaders for now.
