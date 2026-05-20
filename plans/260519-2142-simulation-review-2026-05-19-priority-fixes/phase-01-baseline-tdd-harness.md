---
phase: 1
title: "Baseline TDD Harness And Failing Invariants"
status: pending
priority: P0
effort: "6h"
dependencies: []
---

# Phase 1: Baseline TDD Harness And Failing Invariants

## Overview

Trước khi sửa bất cứ thứ gì, viết các suite kiểm tra **fail trên master HEAD** cho từng nhóm finding. Phase này không sửa code production — chỉ scaffold harness và RED tests sẽ GREEN qua các phase 02–11.

**Folder rename rationale:** `tests/sim-fix-2026-05-19/` collides semantically với existing `tests/phase-01-tdd.test.js` from prior plan 260518-2300. Rename to `tests/sim-review-2026-05-19/` để clarify: "review" = self-review batch capture analysis.

## Requirements

**Functional:**
- Harness đọc capture batch (`screenshots/sim-review-*/capture-manifest.json`) làm fixture
- 8 RED suites tách biệt theo finding (S1..S8 + physics)
- Mỗi suite verify được standalone qua `node tests/<suite>.test.js` hoặc `npx playwright test tests/<spec>.spec.js`
- Visual baseline update tooling shipped trong cùng phase (anti-baseline-laundering)

**Non-functional:**
- Tests chạy offline (file:// hoặc 127.0.0.1:8765 dev server)
- Không phụ thuộc snapshot bằng pixel; dùng structural marks + DOM probe
- Mỗi test có comment trỏ đến phase sẽ green nó

## Architecture

```
tests/
├── sim-review-2026-05-19/
│   ├── physics-invariants.test.js       (Node, RED → GREEN P02)
│   ├── slider-unit-display.spec.js      (Playwright, RED → GREEN P04)
│   ├── readout-unit-audit.spec.js       (Playwright, RED → GREEN P05)
│   ├── empty-panel-hint.spec.js         (Playwright, RED → GREEN P06)
│   ├── label-collision-detector.spec.js (Playwright, RED → GREEN P07)
│   ├── coordinate-pixel-cleanup.spec.js (Playwright, RED → GREEN P08)
│   ├── decuong-shell-overlay.spec.js    (Playwright, RED → GREEN P03)
│   └── route-redesign-checks.spec.js    (Playwright, RED → GREEN P09/P10/P11)
├── sim-review-2026-05-19-fixtures.js    (route lists, expected units — raw spec only)
└── sim-review-2026-05-19-utils.js       (CREATED LATER per rule-of-three; P01 ships fixtures-only)

tools/
└── sim-visual-baseline-update.js        (P01 deliverable: regenerate baseline + diff)
```

**Utils deferred:** Apply rule-of-three. Phase 01 KHÔNG ship `sim-review-2026-05-19-utils.js`. Mỗi RED suite tự inline probes của mình. Khi phase thứ 3 tái sử dụng cùng probe (e.g., `getReadoutText`), extract sang utils trong REFACTOR pass của phase đó.

## Related Code Files

- Create: `tests/sim-review-2026-05-19/physics-invariants.test.js`
- Create: `tests/sim-review-2026-05-19/slider-unit-display.spec.js`
- Create: `tests/sim-review-2026-05-19/readout-unit-audit.spec.js`
- Create: `tests/sim-review-2026-05-19/empty-panel-hint.spec.js`
- Create: `tests/sim-review-2026-05-19/label-collision-detector.spec.js`
- Create: `tests/sim-review-2026-05-19/coordinate-pixel-cleanup.spec.js`
- Create: `tests/sim-review-2026-05-19/decuong-shell-overlay.spec.js`
- Create: `tests/sim-review-2026-05-19/route-redesign-checks.spec.js`
- Create: `tests/sim-review-2026-05-19-fixtures.js`
- Create: `tools/sim-visual-baseline-update.js` (visual-quality regen + side-by-side diff harness)
- Modify: `package.json` thêm:
  - `"test:sim:review-2026-05-19"` aggregate script
  - `"test:sim:visual-quality:update"` script (chạy `tools/sim-visual-baseline-update.js`)
- DEFER: `tests/sim-review-2026-05-19-utils.js` (extract khi phase 3 reuse cùng probe)

## Implementation Steps (TDD)

### RED — viết tests fail trên master
1. **Fixtures**: liệt kê route IDs theo finding với expected unit (`ch1-1-4`: `d` unit `m`). Each suite inlines its own probes (no shared utils until rule-of-three triggers).
2. **physics-invariants.test.js**: 4 invariants Node-level:
   - `ch1-3-2`: `slider.angleDeg === readout.alphaDeg ± 0.1` (drift = 0) — pure math invariant. Slider plumbing fix sẽ green ở P04.
   - `ch1-5-3`: `tan(α) ≤ μ ⇒ slipState !== 'slip'` chỉ áp dụng cho `routeId === 'ch1-5-3'` (narrow scope, không generic state machine).
   - `ch1-3-6`: `MA = R·d` consistency với current scale; cùng test thêm anti-regression cho ch1-4-2 (share `moment` derive trong `ch1-support-spatial-behaviors.js:77`).
   - `ch3-5-2`: `state.deltaP === J` ngay khi mount (no tick required); seed `m=2, J=20` ở mount-time.
3. **slider-unit-display.spec.js**: Playwright mount mỗi route trong S1 list (11 route, EXCLUDE ch1-3-3 — discrete chooser, punted to P05), assert slider control text **không** kết thúc bằng `px`/`deg` mismatch với readout panel unit.
4. **readout-unit-audit.spec.js**: assert mỗi readout card có suffix unit (regex `/(N|m|°|rad|kg|J|kg·m²|N·m|N·s|m\/s|m\/s²|kg·m²\/s)$/`); raw integer cho discrete chooser (ch1-3-3 "Loại liên kết") sẽ fail.
5. **empty-panel-hint.spec.js**: với 11 panel rỗng (ch2-2-2 `QUAN HỆ QUAY`, ch3-2-1 `QUÁN TÍNH`, ...), assert `panel.textContent.trim().length > 0` ở default mount state. Autoplay-then-pause assertion cho ch3-6-2 và ch3-5-4 (energy sim, user-confirmed in scope).
6. **label-collision-detector.spec.js**: dùng canvas mark trace + bounding box overlap; threshold 0 cho 15 route mục tiêu.
7. **coordinate-pixel-cleanup.spec.js**: assert không có readout key chứa raw "px" cho `xG`, `IC_x`, `IC_y`, `x_C`, `Điểm đặt`.
8. **decuong-shell-overlay.spec.js**: assert `.sim-header` visible cho ch2-1-1, ch2-1-4, ch2-7-2 và DOM không có double header.
9. **route-redesign-checks.spec.js**: smoke checks per-route sẽ green sau P09/10/11 (ch3-5-3 panel content, không còn ch3-7-2 — split-plan).
10. Register tests trong `package.json` script + smoke aggregate `test:sim:review-2026-05-19`.

### Step 3.5 — Visual baseline update harness (P01 deliverable)
1. Implement `tools/sim-visual-baseline-update.js`:
   - Re-run capture script targeting routes affected by current phase
   - Diff old vs new baseline JSON entries
   - Emit side-by-side markdown report (anchor route → before/after thumbnail + delta summary)
2. Add `package.json` script: `"test:sim:visual-quality:update": "node tools/sim-visual-baseline-update.js"`.
3. Document usage protocol trong phase reports: visual baseline refresh requires (a) `npm run test:sim:visual-quality:update -- --routes <list>`, (b) commit cả baseline JSON + diff report, (c) human ack trong PR description. **Ad-hoc baseline edit banned.**

### GREEN — confirm fail
- Chạy mỗi suite trên master HEAD, ghi vào `plans/260519-2142-.../reports/red-baseline-2026-05-19.md` số test FAIL/PASS, paste output.
- Mong đợi: ~20+ FAIL tests, 0 PASS pre-fix (trừ smoke parser).

### REFACTOR — không (phase setup)

## Success Criteria

- [ ] 8 test files tạo, parse cleanly với `node --check` / Playwright `--list`
- [ ] `tests/sim-review-2026-05-19-fixtures.js` export route lists per finding (S1..S8)
- [ ] `tools/sim-visual-baseline-update.js` regenerate baseline + emit side-by-side diff report
- [ ] `package.json` có:
  - `"test:sim:review-2026-05-19"` aggregate script
  - `"test:sim:visual-quality:update"` script
- [ ] RED baseline report committed: `reports/red-baseline-2026-05-19.md` ghi rõ failures per suite
- [ ] `npm run test:sim:review-2026-05-19` exit code ≠ 0 (RED state expected)
- [ ] NO `tests/sim-review-2026-05-19-utils.js` shipped (rule-of-three: extract khi phase 3 reuse)
- [ ] Không sửa code production trong phase này

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Test selector phụ thuộc UI cụ thể, dễ vỡ | Dùng data attribute `data-readout-key`, `data-sim-panel` thay vì position selectors |
| Label-collision detector quá strict, có false positive | Tune threshold ở phase 07; phase 01 chỉ scaffold detector function |
| Physics test đụng floating-point | Dùng tolerance ±0.1 cho deg, ±1% cho N/m |
| Folder name collision với prior plan | Rename to `tests/sim-review-2026-05-19/` (review = self-review batch) |

## Verification Gate

Phase 01 đóng khi: tất cả test files commit, RED baseline report committed, visual baseline harness shipped, `npm run test:sim:renderer-contract` PASS (đảm bảo phase setup không phá registry).
