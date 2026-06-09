---
phase: 4
title: "Verify capture + release + probe gate"
status: completed
priority: P1
effort: "1h"
dependencies: [1, 2, 3]
---

# Phase 4: Verify capture + release + probe gate

## Overview
Gate cuối sau P1–P3. Chạy full release + **probe bắt buộc** (red-team H4: probe ngoài release gate, phải chạy riêng để bắt lệch rowIndex) + capture soi mắt. blockedBy P1+P2+P3.

## Requirements
- Functional: 4 finding fixed, xác nhận bằng test + mắt; rowIndex probe không lệch.
- Non-functional: physics 9/9 không đổi; 0 regression mount/probe.

## Architecture
Verify-only, không sửa code sim. Nếu regression → quay lại phase nguồn (rollback dưới).

## Related Code Files
- Modify: none (verify-only)
- Read: capture output `plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals/*.png` (path hardcode trong `capture-sims.spec.js:17` — đúng, không stale; artifact của plan này ghi vào folder pipeline cũ — note: đừng xóa folder đó; red-team M)

## Implementation Steps
1. `npm run test:sim:physics` → 9/9 PASS (không đổi — none of P1-P3 chạm `physics/`).
2. `npm run test:sim:mount` → toàn bộ pass (gồm assert no-clip/arc/nón mới).
3. `npm run test:sim:release` → gate tổng xanh.
4. **`npm run test:sim:probe:unit && npm run test:sim:probe`** (BẮT BUỘC, không optional — red-team H4): xác nhận rowIndex ch1-1-4(2)/ch1-3-6(3)/ch1-5-3(1) không lệch, B 23/23 match, 0 dead mới.
5. `npm run test:sim:visual:capture`, soi 6 route: ch3-3-1 (đồ thị không cụt), ch3-5-4/ch3-2-3 (cân khung), ch1-1-4/ch1-3-6 (arc mô men ĐÚNG CHIỀU — ch1-3-6 CW, ch1-1-4 CCW), ch1-5-3 (nón + R ra/vào theo β).
6. Cập nhật plan.md status + journal.

## Success Criteria
- [ ] physics 9/9; mount + release xanh.
- [ ] **probe xanh**: rowIndex không lệch, 23/23 sign match, 0 dead mới.
- [ ] 6 route capture soi mắt đạt từng finding (chiều mô men đúng vật lý).

## Risk Assessment
- Đổi worldBox/thêm element nhiều route → mount/probe vỡ chéo. Mitigation: full release + probe, không chỉ route lẻ.
- **Rollback (red-team M)**: nếu release/probe đỏ → revert phase theo thứ tự ngược phụ thuộc (P3→P2→P1), re-run release để isolate culprit. Mỗi phase đã chạy chapter-mount trước khi tới đây nên culprit thường lộ sớm.
- Capture lộ regression visual mới → ghi nhận, quay lại phase nguồn, KHÔNG chốt.

## Kết quả verify (2026-06-09)
- `test:sim:physics` → 9/9 PASS (ch1 10/10, ch2 7/7, ch3 8/8; route-coverage PASS — rgba cone fill + Pal token qua hex guard).
- `test:sim:mount` → 110 PASS (gồm 3 no-clip ch3, 2 arc-direction ch1, 1 nón+R ch1-5-3; no-overlap + dispose nguyên).
- `test:sim:probe:unit` → 68 assertion PASS; `test:sim:probe` → 35/35 route PASS (rowIndex không lệch, sign match).
- `test:sim:visual:capture` → 25 PASS. Soi mắt 6 route:
  - ch3-3-1: lobe âm x(t) trong khung (minY −5).
  - ch3-5-4 / ch3-2-3: cân khung, nhãn F_AB/A/B không clip (ch3-2-3 nới ngang ±6 cho nhãn pixel).
  - ch1-1-4: arc CCW (lực lên, x>0). ch1-3-6: arc CW (tải xuống, x>0) — đúng C2.
  - ch1-5-3: nón quanh pháp tuyến, R thẳng đứng trong nón khi β<φ — đúng C1.
- Sai khác plan: ch3-2-3 ngang ±5→±6 (nhãn left-anchor cần pixel-room, dead-space gốc là dọc nên nới ngang không phạm intent); ch1-3-6 maxY 3→3.6 + minY −1.8→−1.2 (label P anchor-bottom ở P=150 chạm 3.45, phải chừa). 0 regression.
