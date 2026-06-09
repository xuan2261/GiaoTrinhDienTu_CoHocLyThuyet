---
phase: 2
title: "Dead-space + arc mô men ch1 (ch1-1-4, ch1-3-6)"
status: completed
priority: P2
effort: "2.5h"
dependencies: []
---

# Phase 2: Dead-space + mũi tên cong mô men — ch1-1-4, ch1-3-6

## Overview
Gộp MEDIUM-2 phần ch1 (dead-space) + LOW-4 (arc mô men chỉ chiều quay). Cùng 2 file ch1 → 1 phase. Co worldBox cho cân + thêm cung mũi tên chỉ chiều quay M (chuẩn PhET). **Chiều arc phải đúng vật lý** (red-team C2).

## Requirements
- Functional: (a) nội dung cân khung, không clip khi slider/drag max; (b) M hiển thị bằng cung tròn + đầu mũi tên chỉ ĐÚNG chiều quay (CW/CCW), độ lớn cung scale theo |M|, màu `Pal.moment`.
- Non-functional: physics không đổi; **KHÔNG thêm/đổi readout row** (red-team H4) — chiều mô men đi vào ARC, không vào readout; arc vẽ inline `el('path')`, không thêm helper core (red-team H6).

## Architecture
Root cause verified:
- **ch1-1-4** (`ch1-1-4.js:11,21,34,59`): worldBox cao 5.3, nội dung `y∈[0..F*VIS]`, F max=100 → tip y tới `100*0.03=3.0` + nhãn 0.3 = 3.3 (KHÔNG phải 1.5 ở F=50). Co maxY phải tính từ **F=100** (red-team M3). M=`computeMoment(F,d,90)`, d=|app.x| ≥0 → luôn ≥0 (CCW, force lên, x>0) — ch1-1-4 may mắn ĐÚNG chiều.
- **ch1-3-6** (`ch1-3-6.js:11,39,40,61`): worldBox cao 4.8, nội dung `y∈[−0.8..P*VIS]`, P max=150 → tip `150*0.018=2.7`+0.3. M=`P*a` luôn DƯƠNG, **nhưng tải hướng XUỐNG ở x>0** → mô men vật lý = `pos*(−load)` < 0 = **CW**. Dấu M ngược chiều thật (red-team C2).

Fix:
1. Co worldBox sát nội dung, tính từ slider MAX + margin (KHÔNG từ default).
2. **Arc mô men — chiều lấy từ tích có hướng, KHÔNG từ |M|** (red-team C2):
   - Tính `tau = rx*fy − ry*fx` với r = vector từ tâm quay tới điểm đặt, f = vector lực thật (gồm dấu hướng). `tau>0` → CCW, `tau<0` → CW.
   - ch1-1-4: r=(app.x,0), f=(0,+F) → tau=app.x*F >0 → CCW. ch1-3-6: r=(pos,0), f=(0,−load) → tau=−pos*load <0 → CW.
   - Có thể dùng `dynamics.js` `torqueFromForce`/`statics.js momentFromVectors` (verify tên + sign convention trước khi gọi).
3. Vẽ cung: `render.el('path',{d:'M..A..', class:'sim2-moment-arc', stroke:Pal.moment, fill:'none'})` quanh tâm quay, bán kính nhỏ cố định, góc quét ~270°, đầu mũi tên ở cuối theo chiều tau. Cập nhật trong `render2`.

## Related Code Files
- Modify: `js/sim2/sims/ch1/ch1-1-4.js` (worldBox + arc inline)
- Modify: `js/sim2/sims/ch1/ch1-3-6.js` (worldBox + arc inline)
- Read (verify sign): `js/sim2/physics/statics.js`, `js/sim2/physics/dynamics.js`
- Modify: `tests/sim2-ch1-mount.spec.js` (no-clip + arc tồn tại + chiều đúng)
- Read (đừng vỡ): `tools/sim-probe/probe-targets.js` (ch1-1-4 rowIndex 2=M, ch1-3-6 rowIndex 3=M — KHÔNG đổi)

## Implementation Steps
1. **(TDD trước)** Test:
   - no-clip 2 route khi slider max (+ drag ch1-1-4) — enumerate cả label.
   - arc tồn tại (`path.sim2-moment-arc`) mỗi route; |M| đổi → bán kính/góc quét cung đổi.
   - **chiều đúng**: ch1-3-6 arc CW (sweep-flag/hướng đầu mũi tên ứng tau<0); ch1-1-4 CCW. Assert hướng, KHÔNG chỉ tồn tại.
   - Test fail trên code hiện tại (chưa có arc).
2. Verify sign convention trong physics trước khi tính tau.
3. ch1-1-4: co worldBox (maxY từ F=100) + vẽ arc CCW quanh O.
4. ch1-3-6: co worldBox + vẽ arc CW quanh ngàm.
5. Chạy mount ch1 sau mỗi route (no-overlap + start state). Capture soi `__live.png`.

## Success Criteria
- [ ] no-clip + arc-tồn-tại + chiều-đúng fail trước, pass sau.
- [ ] ch1-3-6 arc CW (tải xuống), ch1-1-4 arc CCW; capture xác nhận khớp vật lý.
- [ ] readout row KHÔNG đổi (probe-targets index giữ nguyên); `test:sim:ch1-mount` + coverage hex xanh.

## Risk Assessment
- **Arc sai chiều = dạy sai** (C2). Mitigation: chiều từ tích có hướng + test assert hướng + soi mắt.
- worldBox shrink → nhãn chồng. Mitigation: chạy no-overlap sau shrink.
- Thêm readout row làm lệch probe (H4). Mitigation: chiều/độ lớn mô men CHỈ vào arc/legend, tuyệt đối không thêm row.
- arc dùng `el('path')` inline — KHÔNG đụng `ensureDefs`/core (H6).
