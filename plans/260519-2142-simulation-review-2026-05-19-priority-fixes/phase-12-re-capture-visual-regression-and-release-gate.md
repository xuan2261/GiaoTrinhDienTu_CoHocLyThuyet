---
phase: 12
title: "Re-capture Visual Regression And Release Gate"
status: pending
priority: P1
effort: "4h"
dependencies: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
---

# Phase 12: Re-capture Visual Regression And Release Gate

## Overview

Phase đóng plan: re-run capture toàn bộ 58 route, so với baseline batch `2026-05-19T13-00`, đảm bảo:
- 58/58 OK (không route nào break trong các phase trước)
- Tất cả findings S1..S8 đã giải quyết
- `npm run test:sim:release` GREEN end-to-end (chained với new aggregate)
- Plan archive + journal entry

## Requirements

**Functional:**
- Capture batch mới có format giống batch cũ (full + sim-only + index.html)
- Diff report tự động: per-route, status (improved / unchanged / regressed)
- Release gate suite PASS — bao gồm new aggregate `test:sim:review-2026-05-19`

**Non-functional:**
- Capture script chạy < 5 phút trên dev local
- Diff report human-readable (markdown table + thumbnail comparison)

## Architecture

```
tools/
├── capture-all-58-simulations-screenshots.js (Phase 0 đã có)
├── sim-visual-baseline-update.js (Phase 01 mới)
└── compare-sim-capture-batches-and-generate-diff-report.js (Phase 12 mới)

screenshots/
├── sim-review-2026-05-19T13-00/  (baseline RED)
└── sim-review-<after-plan>/       (post-fix)
   └── analysis/
      └── post-plan-diff-report.md
```

**package.json release gate chain (red-team M5 / M8 fix):**
```diff
- "test:sim:release": "npm run test:sim:unit && npm run test:sim:quality && npm run test:sim:browser && npm run test:sim:visual-quality && ..."
+ "test:sim:release": "npm run test:sim:unit && npm run test:sim:quality && npm run test:sim:browser && npm run test:sim:visual-quality && npm run test:sim:review-2026-05-19 && ..."
```

## Related Code Files

- Create: `tools/compare-sim-capture-batches-and-generate-diff-report.js`
- Modify: `tools/capture-all-58-simulations-screenshots.js` (thêm flag `--baseline <path>`)
- Modify: `package.json:24` — chain `test:sim:release` → `test:sim:review-2026-05-19` aggregate
- Run: `npm run test:sim:release` (post-modify, just gate)

## Implementation Steps

### Step 1: Re-capture
1. Đảm bảo dev server textbook chạy `127.0.0.1:8765`.
2. Run `node tools/capture-all-58-simulations-screenshots.js`.
3. Kiểm tra 58/58 OK; nếu fail, identify route + go back to relevant phase.

### Step 2: Diff report
1. Implement `compare-sim-capture-batches-and-generate-diff-report.js`:
   - Read cả hai manifest JSON
   - Per-route: compare canvasInfo, errors, status
   - Generate markdown table + thumbnail diff (side-by-side)
2. Save vào `screenshots/sim-review-<post>/analysis/post-plan-diff-report.md`.

### Step 3: Update package.json release chain
1. Đọc `package.json:24` `test:sim:release` definition hiện tại.
2. Insert `&& npm run test:sim:review-2026-05-19` vào chain TRƯỚC final audits.
3. Verify chain order: unit → quality → browser → visual-quality → **review-2026-05-19** → semantic → renderer-contract → audits.

### Step 4: Release gate
1. Run `npm run test:sim:release` — **MUST GREEN** (gate now includes new aggregate).
2. Run `npm run test:sim:review-2026-05-19` — **MUST GREEN** (all 8 RED suites GREEN từ phase 01).
3. Run `npm run test:sim:visual-quality` — baseline diff acceptable.
4. Run `npm run test:sim:semantic` — 58-route contract intact.
5. Run `npm run test:sim:renderer-contract` — 58-route registry bất biến.

### Step 5: Plan close
1. Run `/ck:plan archive` → write journal + archive plan.
2. Update `docs/project-changelog.md` với summary (red-team Tier 1 fixes applied + 11 phase shipped).
3. Update `docs/development-roadmap.md` mark phase complete.
4. Tạo split-plan stub cho ch3-7-2 graded-exercise input-check (cùng ch1-7-2, ch2-7-2): `plans/2606XX-...-graded-exercise-input-check-ch1-2-3-7-2/`.

## Success Criteria

- [ ] Capture batch mới 58/58 OK
- [ ] Diff report cho thấy per-route improvement, không route nào regress
- [ ] **`package.json:24`** `test:sim:release` chain ĐÃ include `test:sim:review-2026-05-19`
- [ ] `npm run test:sim:release` PASS (single command, end-to-end gate)
- [ ] `npm run test:sim:review-2026-05-19` PASS standalone
- [ ] `tests/sim-review-2026-05-19/*` 8 suite GREEN
- [ ] `docs/project-changelog.md` cập nhật
- [ ] `docs/development-roadmap.md` cập nhật
- [ ] Plan archive + journal entry committed
- [ ] Split-plan stub cho ch3-7-2 graded-exercise feature created

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Capture batch mới reveal regression chưa thấy ở từng phase | Diff report identify cụ thể route, fix iteratively trước khi đóng phase; per-phase visual-baseline-update protocol đã enforce trong P01 → khả năng leak thấp |
| `test:sim:release` fail khi tích hợp | Triage: nếu lỗi do baseline drift nội tại, refresh baseline cho route đó với approval |
| Plan archive bị quên steps trong workflow | Theo rule docs-management `/ck:plan archive`, journal-writer agent verify |
| Chain order trong package.json sai | Run `npm run test:sim:release --dry-run` để verify chain order trước khi commit |

## Verification Gate

Phase 12 đóng khi: tất cả release gate suites PASS, `test:sim:release` chain include new aggregate, diff report committed, plan archived, journal entry written, ch3-7-2 split-plan stub created.
