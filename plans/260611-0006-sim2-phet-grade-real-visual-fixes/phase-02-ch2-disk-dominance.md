---
phase: 2
title: "ch2-2-2 + ch2-4-4 disk-dominance"
status: pending
priority: P1
effort: "2.5h"
dependencies: []
---

# Phase 2: ch2-2-2 + ch2-4-4 disk-dominance (CORE — đòn bẩy đã sửa sau red-team)

## Overview
Vector (v tiếp tuyến / Coriolis) quá nhỏ so với đĩa → vector lẽ ra là tiêu điểm bị đĩa nuốt. Làm vector ĐỌC ĐƯỢC bằng cách **phóng to vector**, KHÔNG thu world-radius (R là physics + feed Sim3).

## DivERGENCE so với bản nháp (red-team CRITICAL — đọc kỹ)
- **KHÔNG co biên rRel** (ch2-4-4.js:40). `radialSpeed` (dòng 41) = đạo hàm của rRel; đổi biên mà không sửa hệ số → readout v_rel + a_cor SAI → vi phạm "không đổi physics". User chốt **giữ nguyên quỹ đạo**.
- **KHÔNG thu world `R`** (ch2-2-2.js:16). `R` dùng cho `vt=ωR` (dòng 38) VÀ `sim3.setState({radius:R})` (dòng 50) → thu R đổi readout v + desync đĩa 3D.
- → Đòn bẩy DUY NHẤT an toàn: **tăng hệ số hiển thị vector** (số nhân viz, không physics).

## Requirements
- Functional: mũi tên v (ch2-2-2) và cụm v_rel/a_cor (ch2-4-4) đủ dài để đọc rõ ở frame có ω/v_rel đáng kể.
- Non-functional: KHÔNG đổi physics (rRel, radialSpeed, R, vt giữ nguyên); KHÔNG đụng Sim3 setState.

## Architecture
- **ch2-2-2** (`js/sim2/sims/ch2/ch2-2-2.js`): vector viz-scale `vt*0.15` (dòng 39). Tăng `0.15→~0.4` (chỉ số nhân hiển thị mũi tên v; KHÔNG đụng R, vt, sim3). Verify ở ω max (ω0=2 + α·t) mũi tên không tràn viewport ±4.6.
- **ch2-4-4** (`js/sim2/sims/ch2/ch2-4-4.js`): vector viz-scale `VS=0.3` (dòng 55). Tăng `VS→~0.55` (phóng cả vrArrow lẫn acArrow tính từ VS). vrArrow dòng 51 hiện KHÔNG dùng VS (dùng radialSpeed thô) — cân nhắc thêm VS cho vrArrow để v_rel cũng to lên đồng bộ với a_cor. GIỮ rRel/radialSpeed.
  - Đĩa r=4 (dòng 22) là biên hệ quy chiếu (visual, KHÔNG physics). Có thể nudge 4→3.6 (vẫn ≥ rRel max 3.5 → hạt không lọt ra ngoài) cho đĩa nhẹ hơn chút. Phụ, lever chính là VS.

## Related Code Files
- Modify: `js/sim2/sims/ch2/ch2-2-2.js` (dòng 39 viz-scale)
- Modify: `js/sim2/sims/ch2/ch2-4-4.js` (dòng 51,55 viz-scale; tùy chọn dòng 22 đĩa 4→3.6)
- Modify (test): `tests/sim2-ch2-mount.spec.js` — invariant tĩnh, KHÔNG ratio động.

## Implementation Steps
1. (TDD) Assertion TĨNH (tránh flake do vector dao động qua 0): mount + step tới frame ω/v_rel cao xác định (vd step 120), đo chiều dài pixel vector ≥ ngưỡng cố định (vd ≥40px). KHÔNG assert tỉ-lệ-với-đĩa động. Chạy → đỏ.
2. ch2-2-2: viz-scale 0.15→0.4. Verify mũi tên v ở ω max ≤ ~40% nửa-khung.
3. ch2-4-4: VS 0.3→0.55; thêm VS vào vrArrow (dòng 51) cho v_rel đồng bộ; tùy chọn đĩa 4→3.6. GIỮ rRel/radialSpeed/canvas trail.
4. Re-capture cả 2 route → soi vector đọc rõ.
5. `npm run test:sim:release` xanh; verify Sim3 ch2-2-2/ch2-4-4 vẫn mount (setState không đổi).

## Success Criteria
- [ ] Test chiều-dài-vector tĩnh đỏ trước, xanh sau.
- [ ] Re-capture: mũi tên v / cụm a_cor đọc rõ ở frame ω cao.
- [ ] Physics port snapshot verified-sticky pass; rRel/radialSpeed/R/vt KHÔNG đổi (grep xác nhận).
- [ ] Canvas trail ch2-4-4 vẫn khớp SVG ≤1px; Sim3 vẫn mount.

## Risk Assessment
- Risk: viz-scale quá lớn → mũi tên tràn viewport. Mitigation: chọn scale sao cho vector dài nhất (tại ω/v_rel max) ≤ ~40% nửa-khung; verify ở biên.
- Risk: vector dao động qua 0 (ch2-4-4 radialSpeed=cos) → test ratio flaky. Mitigation: assert tại frame xác định ω cao + ngưỡng px tuyệt đối (Finding 7).
- Risk: nudge đĩa 4→3.6 làm hạt sát rìa. Mitigation: 3.6 > rRel max 3.5 → hạt vẫn trong; hoặc bỏ nudge, chỉ dựa VS.
