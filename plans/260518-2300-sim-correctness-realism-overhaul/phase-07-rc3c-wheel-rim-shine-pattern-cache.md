---
phase: 7
title: "RC3c Wheel Rim Shine And Pattern Cache"
status: completed
priority: P2
effort: "5h"
dependencies: [1, 6]
---

# Phase 07: RC3c Wheel Rim Shine And Pattern Cache

## Overview

Thêm specular arc cho `realisticWheel`, và refactor `concretePattern` (`js/sim-visual-helpers.js:101-112`) thành OffscreenCanvas + LRU cache để tránh tạo pattern mỗi frame. Áp dụng cho ch2 rotation/gear routes và ch3 ground.

## Requirements

- Functional:
  - `P.realisticWheel` thêm specular arc 30° tại top-left (dark alpha 0.55, light 0.8).
  - Pattern cache `Map<material+theme, CanvasPattern>` — clear khi theme toggle.
  - Thêm `wood` material (cho ch3-3-1 ground floor planks).
- Non-functional:
  - Pattern cache hit rate ≥ 95% trên route mount lần thứ 2.
  - Concrete/metal deterministic across reloads (no `Math.random()` runtime).
  - Theme toggle tự động clear cache.

## Architecture

Refer `research/researcher-canvas-realism.md` Sections 2, 4.

```
SimVisualHelpers.getPattern(ctx, material, theme)
   ├─► cache.get(`${material}-${theme}`) → return if exists
   └─► OffscreenCanvas 64×64 → deterministic draw → createPattern → cache.set → return

document.addEventListener for `themechange` event (existing in app.js?) → cache.clear()
```

## Related Code Files

- Modify: `js/sim-visual-helpers.js`
  - Replace `concretePattern` with `getPattern(ctx, material, theme)`.
  - Add `_patternCache = new Map()` module-level.
  - Add `clearPatternCache()` export.
  - Add `wood` material branch.
- Modify: `js/sim-route-renderer-primitives.js` — `realisticWheel` (line 343-393) thêm specular arc step.
- Modify: `js/app.js` (or theme controller) — emit `themechange` event on toggle; if not exists, observe `documentElement[data-theme]` mutation.
- Tests:
  - `tests/sim-correctness-realism.test.js` `@rc3-wheel-specular` — mount ch2-2-2, assert `data-structural-marks` contains `wheelSpecular:` mark.
  - `@rc3-pattern-cache-hit` — eval `window.SimVisualHelpers._patternCache.size`, mount second route, assert size unchanged (cache hit).

## Implementation Steps

1. RED: Wheel specular mark test.
2. RED: Pattern cache hit test.
3. Implement `getPattern` helper with deterministic concrete (using indexed pseudo-random) and metal (gradient + scanlines) and wood.
4. Wire theme toggle event → `clearPatternCache()`.
5. Add specular arc step to `realisticWheel`.
6. Update callsites: `realisticGround` and any `concretePattern` direct callers.
7. Tests GREEN. Visual verify ch2-2-2, ch2-3-2, ch2-3-3 wheels show shine.

## Todo List

- [ ] RED: wheel specular mark test
- [ ] RED: pattern cache hit test
- [ ] Implement deterministic getPattern + cache
- [ ] Add wood material
- [ ] Wire theme toggle event to clear cache
- [ ] Add specular arc to realisticWheel
- [ ] Update callsites
- [ ] Tests GREEN
- [ ] Visual verify ch2-2-2, ch2-3-2, ch2-3-3
- [ ] Refresh visual baseline JSON for wheel routes (ch2-2-2, ch2-2-3, ch2-3-2, ch2-3-3) + commit `reports/baseline-delta-phase-07.md`

## Success Criteria

- [ ] Wheel specular arc visible on all wheel routes
- [ ] `_patternCache` size stable on route remount with same theme
- [ ] Cache cleared on theme toggle
- [ ] Concrete/metal/wood look identical across reloads
- [ ] No regression in earlier @rc invariants

## Risk Assessment

- **Risk:** OffscreenCanvas not in older browsers.
  **Mitigation:** Fall back to `document.createElement('canvas')`; capability check at module init.
- **Risk:** Theme toggle event name unknown, cache stale across themes.
  **Mitigation:** MutationObserver on `<html>[data-theme]` as universal hook.

## Security Considerations
- N/A.

## Next Steps
- Phase 08 animation density may use cached patterns for trail backgrounds.
