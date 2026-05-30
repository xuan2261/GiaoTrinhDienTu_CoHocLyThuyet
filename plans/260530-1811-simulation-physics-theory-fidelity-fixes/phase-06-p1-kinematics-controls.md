---
phase: 6
title: "P1 Kinematics Controls (ch2-4-4, ch2-3-2)"
status: pending
priority: P1
effort: "0.5d"
dependencies: [1]
---

# Phase 06: P1 Kinematics Controls (ch2-4-4, ch2-3-2)

## Overview
Sửa 2 route Động học: Coriolis hiển thị a_e bịa và điểm không trượt thực; truyền động có slider r1 bị clamp khiến vô tác dụng. Coriolis a_c đã đúng.

## Requirements
- ch2-4-4: bỏ a_e bịa (`hypot(px−280,py−180)·ω²/10`); tính a_e đúng = ω²·r (m/s²) HOẶC ẩn nếu không có chuyển động kéo theo thật; điểm P trượt dọc rãnh để v_r là vận tốc tương đối thật.
- ch2-3-2: dải slider r1 khớp clamp behavior ([0.56,1.6]) để toàn dải có tác dụng; v biên = ωr (không 0 khi quay).
- Đối chiếu: `muc-IV-4.html` (Coriolis, thuyền/sông), `muc-III-2.html` (truyền động).

## Architecture
- ch2-4-4: `ae` bịa nguồn từ `sim-professional-lab.js:184`. VERIFIED: chỉ ch2-4-4 hiển thị readout `ae` (`ch2-kinematics-scenes.js:25`). → Sửa THẲNG tại dòng 184 là rủi ro THẤP (lật ngược risk note cũ); KHÔNG thêm branch route-conditional vào hàm chung (rủi ro cao hơn). Thay bằng transport accel thật ω²·r hoặc bỏ readout.
- ch2-3-2: sửa scene config slider min/max/step (`ch2-kinematics-scenes.js`/`...particle-rotation-transmission-scenes.js`) khớp clamp trong `ch2-kinematics-behaviors-a.js:113,191`.

## Related Code Files
- Modify: `js/sims/ch2/ch2-kinematics-behaviors-b.js` (ch2-4-4), `js/sim-professional-lab.js` (a_e leak — thận trọng, file lớn dùng chung), `js/sims/ch2/ch2-kinematics-behaviors-a.js` + scene config (ch2-3-2), `ch2-rotation-gear-renderers.js`
- Read: `js/sim-physics-kinematics.js`, `muc-IV-4.html`, `muc-III-2.html`
- Evidence: ac OK behaviors-b.js:103-104; ae fake sim-professional-lab.js:184 (ảnh a_e=18); slider behaviors-a.js:113,191 vs scenes.js:159

## Implementation Steps (tests-first)
1. Xác nhận RED: ch2-4-4 (a_e không khớp ω²r), ch2-3-2 (ω2 không đổi khi kéo r1).
2. ch2-3-2: align dải slider với clamp; assert ω2 đổi monotonic toàn dải; v biên=ωr. (rẻ nhất)
3. ch2-4-4: bỏ a_e bịa; nếu giữ readout thì = ω²·r; cho P trượt dọc rãnh để v_r thật. Sửa THẲNG tại `sim-professional-lab.js:184` (chỉ ch2-4-4 dùng `ae`) — rủi ro thấp.
4. Chạy invariants + theory-fidelity → GREEN; `node --check`; chạy `test:sim:browser` để chắc không vỡ route khác.

## Success Criteria
- [ ] ch2-3-2: kéo r1 toàn dải → ω2 thay đổi; v biên=ωr≠0.
- [ ] ch2-4-4: a_e đúng ω²r hoặc bỏ; a_c giữ đúng; có chuyển động tương đối thật.
- [ ] 2 test GREEN; `test:sim:browser` vẫn PASS.

## Risk Assessment
- `ae` chỉ ch2-4-4 hiển thị → sửa thẳng dòng 184 an toàn; chạy `test:sim:browser` sau sửa để xác nhận không route khác đọc `ae`.
- Renderer ch2-4-4/gear đổi canvas → baseline drift, refresh gom ở Phase 10.
