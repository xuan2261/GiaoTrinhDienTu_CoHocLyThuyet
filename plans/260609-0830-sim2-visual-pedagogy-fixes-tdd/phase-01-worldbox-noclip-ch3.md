---
phase: 1
title: "worldBox no-clip ch3 (ch3-3-1, ch3-5-4, ch3-2-3)"
status: completed
priority: P1
effort: "2h"
dependencies: []
---

# Phase 1: worldBox no-clip — ch3-3-1, ch3-5-4, ch3-2-3

## Overview
Gộp HIGH-1 (đồ thị clip) + MEDIUM-2 phần ch3 (dead-space). Cả 3 là sim ch3, sửa worldBox + cùng spec `sim2-ch3-mount.spec.js` → 1 phase (red-team H3/merge). Mục tiêu: 0 clip ở cực trị + cân khung.

## Requirements
- Functional: (a) ch3-3-1 toàn đường x(t) (cả lobe âm) nằm trong play-area; (b) ch3-5-4, ch3-2-3 nội dung cân khung, không dải trống lớn; (c) mọi element + nhãn không clip khi slider/drag max.
- Non-functional: physics/binding/readout KHÔNG đổi; không sim nào dùng canvas underlay (verified: chỉ ch2-4-4 dùng) → worldBox đổi an toàn về canvas.

## Architecture
Root cause verified:
- **ch3-3-1** (`ch3-3-1.js:11,26,55`): graph `gy=gy0+(x/2)*gh`, gy0=−3, gh=1.6, x∈[−2,2] → min −4.6 < `minY=−4` clip 0.6.
- **ch3-5-4** (`ch3-5-4.js:11`): worldBox cao 4, nội dung `y∈[−0.3,1.7]` → ~45% trống. Lưu ý F slider max=15, arrow tip x tới `2+15*0.15=4.25`.
- **ch3-2-3** (`ch3-2-3.js:11`): worldBox cao 3.5, nội dung cao ~1.3 → ~40% trống dọc. Cặp lực đối xứng: tip tới `±(1.5+2.4)=±3.9` + nhãn 0.3 = ±4.2 → GIỮ ngang ±5 (đủ). Nhãn A/B ở `y=−0.9 anchor:top` (mọc XUỐNG) → minY phải chừa nhãn.

Fix (giá trị đã sửa theo red-team H1/M):
- ch3-3-1: `minY=−4 → −5` (option A; min −4.6 lọt với margin 0.4). KHÔNG dùng gh1.2/gy0−2.7 (vẫn clip −4.2/−4.3).
- ch3-5-4: co `~[0.3..7.5]×[−0.8..2.2]` (verify lại bằng capture, tip F max lọt).
- ch3-2-3: giữ ngang `[−5..5]`, co dọc `[−1.4..1.0]` (KHÔNG −1.2 — clip nhãn A/B; red-team M).

## Related Code Files
- Modify: `js/sim2/sims/ch3/ch3-3-1.js` (worldBox dòng 11)
- Modify: `js/sim2/sims/ch3/ch3-5-4.js` (worldBox dòng 11)
- Modify: `js/sim2/sims/ch3/ch3-2-3.js` (worldBox dòng 11)
- Modify: `tests/sim2-ch3-mount.spec.js` (thêm no-clip cho 3 route)

## Implementation Steps
1. **(TDD trước)** Thêm test no-clip vào spec ch3:
   - ch3-3-1: pin k/m mặc định (k=4,m=1 → ω=2), tính số frame tới `ωt=π` (≈94 frame), click step ĐÚNG số đó (deterministic, như probe — KHÔNG real-time wait; red-team M), lấy bbox `polyline.sim2-graph`, assert ⊆ `.sim2-root`. Fail trên minY=−4.
   - ch3-5-4, ch3-2-3: set slider tới MAX (+ ch3-2-3 không có drag, ch3-5-4 drag tới biên), assert bbox mọi `arrow`/`poly`/`.sim2-label` ⊆ `.sim2-root`. **Enumerate cả label** (red-team M). KHÔNG fill-ratio số.
2. Sửa worldBox ch3-3-1 → chạy lại no-overlap + no-clip ch3.
3. Sửa worldBox ch3-5-4 → mount.
4. Sửa worldBox ch3-2-3 → mount (chú ý no-overlap A/B + F_AB/F_BA, scale tăng có thể chồng).
5. `test:sim:visual:capture` 3 route, soi: ch3-3-1 đồ thị không cụt; ch3-5-4/ch3-2-3 cân khung.

## Success Criteria
- [ ] No-clip test (gồm label) fail trước, pass sau cho cả 3.
- [ ] ch3-3-1 lobe âm trong khung; 3 route capture cân.
- [ ] `test:sim:ch3-mount` xanh (gồm no-overlap cũ); physics/readout không đổi.

## Risk Assessment
- worldBox shrink → scale tăng → nhãn A/B + F_AB/F_BA chồng (mount no-overlap 1px). Mitigation: chạy lại no-overlap sau shrink; nếu chồng, `overlay.moveLabel` nới offset (KHÔNG đổi readout).
- ch3-2-3 chỉ co dọc, giữ ngang ±5 (cặp lực cần rộng).
- Step-count test phụ thuộc ω: pin slider trước khi tính frame.
