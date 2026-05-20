---
phase: 3
title: "P0 DeCuong Shell Mount Fix — ch2-1-1 ch2-1-4 ch2-7-2"
status: pending
priority: P0
effort: "4h"
dependencies: [1]
---

# Phase 3: P0 DeCuong Shell Mount Fix

## Overview

3 route trong CH2 (`ch2-1-1`, `ch2-1-4`, `ch2-7-2`) hiển thị header DeCuong shell ("chương/mục… Ctrl K", icon font + theme + bookmark) **chồng** lên `.sim-header`, làm mất tag `Mô phỏng chX-Y-Z` và badge interaction. Các route khác mount đúng (verified `js/loader.js:81/84/106` — 3 target routes share same loader pattern as working ch2-1-3).

Bug có khả năng cao là per-route fragment HTML hoặc alias map entry, KHÔNG phải generic loader logic. SCOUT trước khi MODIFY.

## Requirements

**Functional:**
- 3 route hiển thị `.sim-header` với title và badge
- Không có double header (DeCuong + sim header cùng lúc)
- Các route ch2 còn lại không bị regress

**Non-functional:**
- Không refactor loader (Read-only đến khi root cause confirmed)
- Giữ behavior khi user navigate từ DeCuong shell sang sim route (back/forward)

## Architecture

```
URL hash → loader.js (line 427-449) reads SIM_ROUTE_ALIAS_MAP + SIM_MAP
        → loadFragment(html via chapters/ch2/muc-X-Y.html)
        → window.SIM_MAP[simRouteId](mountPoint)
                              ↑
                              └─ Phase 03 SCOUT trước khi Modify
```

**Real loader pattern (grep-verified `js/loader.js:427-449`):**
```js
const simRouteId = SIM_ROUTE_ALIAS_MAP[pageId] || pageId;
if (window.SIM_MAP && window.SIM_MAP[simRouteId]) {
  mountPoint = container.querySelector('#sim-' + simRouteId) || ...;
  mounted = window.SIM_MAP[simRouteId](mountPoint);
}
```

KHÔNG có `loader.routes` table (red-team M1 verified). Hypothesis cũ "diff loader.routes" là strawman.

**Real hypotheses (cần scout trước khi commit Modify):**
- Hypothesis A: `chapters/ch2/muc-I-1.html`, `muc-I-4.html`, `muc-VII-2.html` fragment HTML chứa double `.sim-header` element hoặc layout khác sibling `chapters/ch2/muc-I-3.html` (working route ch2-1-3).
- Hypothesis B: `SIM_ROUTE_ALIAS_MAP` thiếu entry cho ch2-1-1/ch2-1-4/ch2-7-2 → `simRouteId` rơi về `pageId` raw, mount sai container.
- Hypothesis C: Mount-order race với DeCuong shell init listener.

## Related Code Files

- **Scout (Read-only initially):**
  - `js/loader.js:81,84,106,427-449` (3 target routes share same loader pattern as ch2-1-3 — verified)
  - `js/SIM_ROUTE_MANIFEST.js` (alias map + sim map registration)
  - `chapters/ch2/muc-I-3.html` (working sibling — diff baseline)
- **Candidate Modify targets (only after root cause confirmed):**
  - `chapters/ch2/muc-I-1.html` (ch2-1-1 fragment)
  - `chapters/ch2/muc-I-4.html` (ch2-1-4 fragment)
  - `chapters/ch2/muc-VII-2.html` (ch2-7-2 fragment)
  - `js/loader.js` (only if root cause is mount sequence, NOT fragment HTML)
- Modify: `tests/sim-review-2026-05-19/decuong-shell-overlay.spec.js` (RED → GREEN)

**`js/loader.js` Read-only constraint:** loader pattern grep-verified working cho ch2-1-3 và 55+ route khác. Bug khả năng cao là per-route fragment HTML, KHÔNG generic loader logic. Modify loader.js là last-resort.

## Implementation Steps (TDD)

### Step 1 — Scout (mandatory before Modify)
1. **Diff fragment HTML:**
   ```bash
   diff chapters/ch2/muc-I-3.html chapters/ch2/muc-I-1.html
   diff chapters/ch2/muc-I-3.html chapters/ch2/muc-I-4.html
   diff chapters/ch2/muc-I-3.html chapters/ch2/muc-VII-2.html
   ```
   Look for: `<header>` duplicates, `.sim-header` placement, layout class differences.
2. **Inspect SIM_ROUTE_ALIAS_MAP entries:**
   ```bash
   grep -n "ch2-1-1\|ch2-1-4\|ch2-7-2" js/SIM_ROUTE_MANIFEST.js
   ```
3. **DOM snapshot trên live mount:** mount ch2-1-1 manually qua dev server, capture DOM tree, so sánh với ch2-1-3.
4. Document scout findings vào `reports/phase-03-decuong-scout-2026-05-20.md` với file:line citations.

### Step 2 — RED
- `decuong-shell-overlay.spec.js` từ Phase 01 đã viết — confirm fail.

### Step 3 — GREEN (apply minimal fix based on scout)
- **Nếu Hypothesis A confirmed:** sửa fragment HTML cụ thể (remove duplicate header / fix layout class).
- **Nếu Hypothesis B confirmed:** thêm alias entries vào `SIM_ROUTE_MANIFEST`.
- **Nếu Hypothesis C (mount-order race):** sửa `js/loader.js` mount sequence.

### Step 4 — REFACTOR
- Nếu phát hiện 3 fragment có cùng pattern lỗi, có thể extract template helper, NHƯNG default là minimal fix.

## Success Criteria

- [ ] Scout report `reports/phase-03-decuong-scout-2026-05-20.md` documents root cause với file:line citations
- [ ] `tests/sim-review-2026-05-19/decuong-shell-overlay.spec.js` PASS cho 3 route
- [ ] Capture re-run cho 3 route: `.sim-header` visible, không có DeCuong header overlap
- [ ] Diff total < 30 lines (proof of minimal fix; loader.js touched ONLY nếu Hypothesis C confirmed)
- [ ] Các route ch2 khác (ch2-1-2, ch2-1-3, ch2-2-x...) `npm run test:sim:browser:route-mount` không regress
- [ ] Visual baseline cho 3 route refresh qua `npm run test:sim:visual-quality:update -- --routes ch2-1-1,ch2-1-4,ch2-7-2`

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Modify loader.js phá 55 route khác | Mark loader.js Read-only đến khi Hypothesis A/B disproved; per-route fragment fix là default |
| Scout không identify root cause sau 1h | Time-box Step 1 = 90 phút; nếu không tìm được, escalate user với 3 hypothesis + DOM snapshot |
| Fix fragment HTML phá DeCuong navigate-back | Test back/forward sau fix, add Playwright case |

## Verification Gate

Phase 03 đóng khi: scout report committed, 3 route mount đúng, spec PASS, không regress route khác, screenshot mới commit.
