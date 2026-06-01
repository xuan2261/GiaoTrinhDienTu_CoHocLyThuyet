# Review 7 sim động học (chương 2) — sim2 engine

Date: 2026-06-01 09:38 | Reviewer: code-reviewer | Scope: js/sim2/sims/ch2/*.js (7 file)
Context tầng chung (sim-shell, svg-render, canvas-underlay, palette, kinematics) đã đọc, KHÔNG review.

## Tổng quan
- Contract `{dispose}`: cả 7 file return `{ dispose: shell.dispose }`, dùng shell helper (addHandle/addControls/setTheory/onFrame), KHÔNG có addEventListener trần. Dispose sạch listener+RAF+DOM. SẠCH toàn bộ.
- Start-paused: 4 sim động (1-1, 2-2, 3-2, 4-4) đều `onFrame(frame); shell.stop();` + `playback.playing:false`. ✓
- radiusOfCurvature=Infinity: chỉ ch2-1-3 dùng, trên ellipse R hữu hạn mọi nơi (1.56–6.4) → KHÔNG có Infinity vào render. Chia cho speed=0 cũng không xảy ra (ellipse |v|≠0). ✓ Sạch mối lo NaN.
- Trail cap: ch2-4-4 cap 400 (shift) ✓. ch2-1-1 clear khi t>tFlight ✓. Không phình vô hạn.
- Màu khớp legend: lục=v, lam=a, hổ phách=Coriolis (4-4), tím=ω/mô men. ✓ toàn bộ.
- KHÔNG có Critical (không crash, không leak, không NaN vào DOM ở dùng thường, contract đủ).

---

## ch2-1-1.js (quỹ đạo + v,a)
**Minor** — L31,75-78: quỹ đạo có thể vượt đỉnh worldBox (maxY=12) khi v₀/α lớn. v₀=20,α=80 → cao cực đại ≈19.8 m > 12 → điểm + vết bị cắt trên. Default (14,55→6.7m) ổn. Đề xuất: hạ trần slider α (vd max 70) hoặc nới maxY, hoặc clamp tip.
Còn lại sạch: vi phân số cho v,a đúng (parabola bậc 2 → aᵧ≈-g), tFlight đúng, trail clear ở mốc bay, slider→reset()→trail=[].

## ch2-1-3.js (tiếp/pháp tuyến + R cong)
**Minor** — L50-53: vòng mật tiếp tính tâm tại R đầy đủ (`p+n*R`) nhưng chỉ cap BÁN KÍNH VẼ `Math.min(R,12)`. Ở đỉnh trục nhỏ ellipse R=6.4, tâm xa → cung dưới có thể lọt ngoài minY=-5.5 khi kéo tới biên. Default tParam=0.7 ổn (comment đã nêu). Cap 12 là dead-code (R max 6.4). Inherent, không gấp.
Đã verify: hướng pháp tuyến n=(-uy,ux) trỏ đúng vào tâm cong (kiểm tại (a,0): tâm=(2.44,0)=a-b²/a ✓). Drag map atan2(y/b,x/a) đúng. SẠCH về physics.

## ch2-2-2.js (quay trục cố định ω,α)
**Minor** — L30-42: không cap t; ω(t)=ω₀+αt tăng vô hạn → v tiếp tuyến (vt=ωR, scale 0.15) phình ra ngoài box ±4.6 sau chạy lâu (α=0.5, t≈60s → vt=90, mũi 13.5 đv). Đúng cơ học (α const) nhưng lệch khung. Đề xuất: cap |v| vẽ hoặc nhắc reset.
Còn lại sạch: φ,ω đúng công thức; v⊥spoke đúng dấu (-sinφ,cosφ).

## ch2-3-2.js (bánh răng–đai–puli)
**Minor** — L39,55,63: dấu tỉ số truyền. Hình quay NGƯỢC chiều (ω₂=-ω₁r₁/r₂) đúng, nhưng readout/công thức `i=r₁/r₂=ω₂/ω₁` bỏ dấu âm — thực ω₂/ω₁=-r₁/r₂. Pedagogy nên thể hiện chiều ngược. Magnitude đúng, no-slip v=ω₁r₁=ω₂r₂ đúng, tâm cách r₁+r₂ (ăn khớp tiếp xúc) đúng.
Còn lại sạch: cập nhật hình học (C2, hub2, gear r) khi đổi bán kính ổn.

## ch2-4-4.js (hợp chuyển động & Coriolis)
**Important** — L39,49-56: mũi v_rel vẽ CỐ ĐỊNH hướng ra ngoài, độ lớn = params.vRel. Nhưng chuyển động thực `rRel=2+1.5·sin(0.5·vRel·t)` → vận tốc tương đối radial = `0.75·vRel·cos(...)` ĐỔI DẤU (lúc vào, lúc ra) và biến thiên. → nửa chu kỳ hạt đi VÀO TÂM nhưng mũi v_rel vẫn trỏ RA; a_cor (=2ω×v_rel) vẽ ngược chiều thực tế. Dạy sai hướng Coriolis ~50% thời gian. Đề xuất: lấy v_rel = đạo hàm rRel theo t (radial có dấu) thay vì hằng số, để v_rel/a_cor khớp vết tuyệt đối.
Sạch phần khác: công thức coriolisAccelerationVec/Acceleration đúng (=2ω×v); trail cap 400+shift; slider clear absTrail; màu hổ phách đúng.

## ch2-5-2.js (tâm vận tốc tức thời IC)
**Important** — L39,72: clamp kéo A.x∈[-4.5,1.5] nhưng ràng buộc thanh dài Llen=5, Bx=2 đòi A.x≥Bx-Llen=-3. Với A.x<-3: dx>5 → `dyy=sqrt(max(0,L²-dx²))=0`, B ghim (2,0), nhưng |AB|=2-A.x>5 → THANH BỊ KÉO GIÃN, hình sai + IC suy biến (A.x,0). Đề xuất: clamp min A.x=-3 (thay -4.5). Default A.x=-2 → B=(2,3),|AB|=5 ✓.
Verify khác: locateInstantCenter cho IC=(A.x,B.y) khớp giao 2 pháp tuyến vẽ ✓; static interactive không onFrame (đúng quy ước static-scene); nhánh '∞' (ic null) là dead-code vì va⊥vb luôn cắt (harmless).

## ch2-5-3.js (phân bố vận tốc trên vật rắn)
**SẠCH.** instantCenterVelocity v=ω×r đúng; field grid clear+vẽ lại mỗi render2 (không tích vết); slider/drag→render2; IC clamp khớp range field [-4,4]×[-3,3]; static (no RAF) đúng quy ước; canvas cùng tf; màu khớp legend. (Minor không tính: field arrow chồng nhau ở ω cao/điểm xa — chỉ rối thị giác.)

---

## Recommended Actions (ưu tiên)
1. ch2-4-4: cho v_rel arrow = vận tốc radial có dấu (đồng bộ rRel) để Coriolis không dạy sai chiều. **(Important)**
2. ch2-5-2: clamp A.x min = -3 tránh thanh giãn/IC suy biến. **(Important)**
3. ch2-3-2: thêm dấu vào i (ω₂/ω₁=-r₁/r₂) hoặc chú thích chiều ngược. (Minor)
4. ch2-1-1: chặn quỹ đạo vượt khung (giảm trần α hoặc nới maxY). (Minor)
5. ch2-2-2: cap độ dài mũi v khi chạy lâu. (Minor)

## Metrics
- Files: 7 | Critical: 0 | Important: 2 | Minor: 4 (1-1, 1-3, 2-2, 3-2) | Clean: ch2-5-3
- Contract/dispose: 7/7 đạt. Start-paused: 4/4 sim động đạt. Màu legend: 7/7 khớp.

## Unresolved Questions
- ch2-4-4: rRel oscillation là hiệu ứng minh hoạ cố ý hay nên là chuyển động radial đều? Quyết định ảnh hưởng cách sửa v_rel.
- ch2-5-2: thanh là "ladder" (A sàn, B tường x=2) — đúng ý đồ bài §5.2? Nếu B đáng lẽ trượt tự do thì mô hình khác.
