---
phase: 9
title: "P2 Remaining WEAK Polish"
status: pending
priority: P2
effort: "1.5d"
dependencies: [7, 8]
---

# Phase 09: P2 Remaining WEAK Polish

## Overview
Sửa các WEAK P2 còn lại sau khi physics (02-06) và cross-cut (07-08) xong: véc tơ trang trí, control nửa-vời, default-state mâu thuẫn, nhãn chồng. 3 feature-add (va chạm xiên, hệ quy chiếu động, vật chuyển động đồng bộ) đã cắt về BACKLOG.

## Requirements (theo route)
- ch1-2-1: balanceError dùng cả độ lớn F1,F2 (không chỉ |dy|).
- ch1-2-6: Rx/Ry và moment từ ΣM=0 thật (bỏ `(p.x−476)·F/60`).
- ch1-6-2: trọng tâm luôn từ ΣSx/ΣS; bỏ kéo-G-đặt-tự-do (đổi thành kéo hình con).
- ch1-6-3: hình vẽ lỗ khoét khớp %; guard mẫu số→0.
- ch2-1-2: đường cong x/v/a PHẢI phản ứng theo control (bỏ hardcode 54·sin/cos cố định). [Phần "thêm vật chuyển động đồng bộ" → BACKLOG, là redesign.]
- ch2-5-1: cực A tịnh tiến thật (không quay thuần).
- ch3-5-1: a_CM ∥ ΣF_ext; khối do lực sinh.
- ch3-5-2: bỏ số hạng `0.25·F·t` phi vật lý trong renderer; pAfter=pBefore+J.
- ch3-4-2: đồng bộ tần số behavior↔renderer (cùng ω).
- ch3-2-1: sửa default-state F=0 cho khớp "F=0→v=const" (per-chapter audit đánh GOOD nhưng BỎ SÓT default-state mâu thuẫn; chốt theo master report RC4 — physics công thức vốn đúng, chỉ sửa giá trị mặc định).
- ch3-2-3: CHỈ sửa nhãn chồng "FABFBA" (cosmetic). PHYSICS ĐÚNG — verified: m1=5,m2=1 nên a1=10,a2=−50 là Newton III chuẩn (lực bằng nhau, gia tốc tỉ lệ nghịch khối lượng); master RC4 nhầm khi giả định m1=m2. KHÔNG đổi công thức.

### Cắt về BACKLOG (feature-add, không phải fix — quyết định user)
- ch3-6-3 va chạm xiên 2D: 1D head-on đã ĐÚNG + bảo toàn p (verified). Xiên = tính năng 2D mới (input góc + restitution 2D + renderer mới). → BACKLOG.
- ch2-4-1 hệ quy chiếu động: tam giác v_a=v_e+v_r đã đúng; thêm khung động = tính năng mới. → BACKLOG.
- ch2-1-2 "thêm vật chuyển động đồng bộ đồ thị": redesign, không phải fix. → BACKLOG (chỉ giữ fix đường cong phản ứng control ở trên).

## Architecture
- Mỗi sửa nhỏ, độc lập; ưu tiên nhóm theo file để giảm số lần đụng.
- Dùng shared physics module cho mọi readout (nhất quán RC1).

## Related Code Files
- Modify: behaviors/renderers Ch1/Ch2/Ch3 tương ứng (xem evidence từng route trong 3 báo cáo chương)
- Read: theory HTML mục tương ứng, shared physics modules

## Implementation Steps (tests-first)
1. Xác nhận RED cho từng route trong scope phase (loại các mục đã cắt backlog).
2. Sửa theo nhóm file, mỗi route assert lại bằng test tương ứng.
3. ch3-2-1: đổi default F=0 (scene config); ch3-2-3: chỉ giãn nhãn chống chồng "FABFBA", giữ nguyên công thức.
4. Chạy invariants + theory-fidelity cho nhóm → GREEN; `node --check`.

## Success Criteria
- [ ] Mỗi route trong scope (đã loại backlog) hết verdict WEAK theo tiêu chí audit.
- [ ] ch3-2-1 default-state nhất quán nhãn-khái niệm (F=0→v=const).
- [ ] ch3-2-3 hết nhãn chồng; công thức Newton III giữ nguyên (không sửa physics).
- [ ] ch2-1-2 đường cong phản ứng theo control.
- [ ] 3 mục feature-add (ch3-6-3 xiên, ch2-4-1 frame, ch2-1-2 moving object) ghi rõ BACKLOG, không làm dở trong plan này.
- [ ] Test các route GREEN.

## Risk Assessment
- 3 feature-add đã cắt backlog rõ ràng (quyết định user) → không làm dở.
- Nhiều route đụng cùng file đã sửa ở phase trước → chạy lại test phase trước để chống hồi quy. Baseline drift refresh gom ở Phase 10.
