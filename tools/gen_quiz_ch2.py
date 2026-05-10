"""Generate 50 quiz questions for Chapter 2 - Động học"""
import json, sys, os
sys.stdout.reconfigure(encoding='utf-8')

questions = [
  # I. Chuyển động của chất điểm (10 câu)
  {"question":"Véc tơ vận tốc của chất điểm là đạo hàm của:","options":["Gia tốc theo thời gian","Véc tơ vị trí theo thời gian","Lực theo thời gian","Quãng đường theo thời gian"],"correct":1,"section":"I","feedbackCorrect":"✅ v = dr/dt (đạo hàm véc tơ vị trí).","feedbackWrong":"❌ Vận tốc v = dr/dt."},
  {"question":"Gia tốc tiếp tuyến đặc trưng cho:","options":["Sự thay đổi chiều vận tốc","Sự thay đổi độ lớn vận tốc","Độ cong quỹ đạo","Vị trí điểm"],"correct":1,"section":"I","feedbackCorrect":"✅ aτ đặc trưng cho sự thay đổi trị số (độ lớn) vận tốc.","feedbackWrong":"❌ Gia tốc tiếp tuyến = đổi độ lớn vận tốc; pháp tuyến = đổi hướng."},
  {"question":"Gia tốc pháp tuyến hướng về:","options":["Phía trước","Phía sau","Tâm cong quỹ đạo","Tâm vật"],"correct":2,"section":"I","feedbackCorrect":"✅ aₙ hướng về tâm cong, aₙ = v²/ρ.","feedbackWrong":"❌ Gia tốc pháp tuyến luôn hướng về tâm cong của quỹ đạo."},
  {"question":"Trong tọa độ Đề các, vận tốc v = ?","options":["√(ẋ²+ẏ²+ż²)","ẋ+ẏ+ż","ẋ·ẏ·ż","ẍ+ÿ+z̈"],"correct":0,"section":"I","feedbackCorrect":"✅ v = √(vx²+vy²+vz²).","feedbackWrong":"❌ v = √(ẋ² + ẏ² + ż²)."},
  {"question":"Chuyển động thẳng đều có đặc điểm:","options":["v = const, a = 0","v = 0, a ≠ 0","v tăng dần","v giảm dần"],"correct":0,"section":"I","feedbackCorrect":"✅ Thẳng đều: v=const, a=0.","feedbackWrong":"❌ Chuyển động thẳng đều: vận tốc không đổi, gia tốc bằng 0."},
  {"question":"Trong phương pháp tọa độ tự nhiên, hệ trục gồm:","options":["x, y, z","τ (tiếp tuyến), n (pháp tuyến), b (trùng pháp)","r, θ","u, v, w"],"correct":1,"section":"I","feedbackCorrect":"✅ Hệ trục tự nhiên: τ, n, b.","feedbackWrong":"❌ Tọa độ tự nhiên dùng 3 trục: tiếp tuyến τ, pháp tuyến n, trùng pháp b."},
  {"question":"Công thức gia tốc pháp tuyến aₙ = ?","options":["v²/ρ","dv/dt","v·ω","v/t"],"correct":0,"section":"I","feedbackCorrect":"✅ aₙ = v²/ρ (ρ = bán kính cong).","feedbackWrong":"❌ aₙ = v²/ρ với ρ là bán kính cong quỹ đạo."},
  {"question":"Chuyển động tròn đều thì:","options":["aτ = 0, aₙ ≠ 0","aτ ≠ 0, aₙ = 0","aτ = aₙ = 0","aτ ≠ 0, aₙ ≠ 0"],"correct":0,"section":"I","feedbackCorrect":"✅ Tròn đều: v=const → aτ=0, nhưng đổi hướng → aₙ≠0.","feedbackWrong":"❌ Tròn đều: aτ=0 (v không đổi), aₙ=v²/R≠0 (hướng thay đổi)."},
  {"question":"Phương trình chuyển động s = s(t) cho biết:","options":["Quỹ đạo","Vị trí điểm trên quỹ đạo theo thời gian","Vận tốc","Gia tốc"],"correct":1,"section":"I","feedbackCorrect":"✅ s = s(t) xác định vị trí trên quỹ đạo theo t.","feedbackWrong":"❌ PT chuyển động cho biết vị trí (hoành độ cong) theo thời gian."},
  {"question":"Khi chất điểm chuyển động biến đổi đều, s = ?","options":["s₀ + v₀t + at²/2","v₀t","at²","v₀ + at"],"correct":0,"section":"I","feedbackCorrect":"✅ s = s₀ + v₀t + at²/2.","feedbackWrong":"❌ Biến đổi đều: s = s₀ + v₀t + at²/2."},

  # II. Chuyển động cơ bản vật rắn (8 câu)
  {"question":"Chuyển động tịnh tiến của vật rắn: mọi điểm có:","options":["Quỹ đạo giống nhau, vận tốc bằng nhau","Quỹ đạo khác, vận tốc khác","Vận tốc bằng, gia tốc khác","Chỉ vận tốc bằng"],"correct":0,"section":"II","feedbackCorrect":"✅ Tịnh tiến: mọi điểm có cùng quỹ đạo, v, a.","feedbackWrong":"❌ Tịnh tiến: mọi đường nối 2 điểm luôn song song → cùng v, a."},
  {"question":"Vận tốc góc ω của vật quay quanh trục:","options":["ω = dφ/dt","ω = ds/dt","ω = dv/dt","ω = v/r"],"correct":0,"section":"II","feedbackCorrect":"✅ ω = dφ/dt.","feedbackWrong":"❌ Vận tốc góc ω = đạo hàm góc quay theo thời gian."},
  {"question":"Gia tốc góc ε = ?","options":["dω/dt","d²φ/dt²","Cả A và B","v²/r"],"correct":2,"section":"II","feedbackCorrect":"✅ ε = dω/dt = d²φ/dt².","feedbackWrong":"❌ ε = dω/dt = d²φ/dt²."},
  {"question":"Vận tốc điểm M trên vật quay, cách trục r: v = ?","options":["ω × r","ω + r","ω / r","ω² × r"],"correct":0,"section":"II","feedbackCorrect":"✅ v = ω·r.","feedbackWrong":"❌ v = ω × r (vận tốc dài = vận tốc góc × bán kính)."},
  {"question":"Gia tốc tiếp tuyến của điểm trên vật quay: aτ = ?","options":["ε·r","ω²·r","ω·r","v²/r"],"correct":0,"section":"II","feedbackCorrect":"✅ aτ = ε·r.","feedbackWrong":"❌ aτ = ε × r."},
  {"question":"Gia tốc hướng tâm của điểm trên vật quay: aₙ = ?","options":["ε·r","ω²·r","ε²·r","ω/r"],"correct":1,"section":"II","feedbackCorrect":"✅ aₙ = ω²·r = v²/r.","feedbackWrong":"❌ aₙ = ω² × r."},
  {"question":"Khi vật quay đều (ω = const):","options":["ε = 0","ε ≠ 0","ω = 0","v = 0"],"correct":0,"section":"II","feedbackCorrect":"✅ Quay đều: ω=const → ε=dω/dt=0.","feedbackWrong":"❌ Quay đều: ε = 0, chỉ có gia tốc hướng tâm."},
  {"question":"Quay biến đổi đều: φ = ?","options":["φ₀ + ω₀t + εt²/2","ω₀t","εt²","φ₀ + εt"],"correct":0,"section":"II","feedbackCorrect":"✅ φ = φ₀ + ω₀t + εt²/2.","feedbackWrong":"❌ Tương tự s=s₀+v₀t+at²/2, φ = φ₀ + ω₀t + εt²/2."},

  # III. Truyền động (5 câu)
  {"question":"Tỉ số truyền i của bộ truyền bánh răng là:","options":["ω₁/ω₂ = z₂/z₁","ω₁/ω₂ = z₁/z₂","ω₁×ω₂","z₁×z₂"],"correct":0,"section":"III","feedbackCorrect":"✅ i = ω₁/ω₂ = z₂/z₁ (tỉ số nghịch đảo số răng).","feedbackWrong":"❌ i = ω₁/ω₂ = z₂/z₁."},
  {"question":"Truyền động đai: 2 bánh đai quay:","options":["Cùng chiều","Ngược chiều (đai thẳng)","Luôn cùng chiều","Không xác định"],"correct":1,"section":"III","feedbackCorrect":"✅ Đai thẳng: 2 bánh quay ngược chiều; đai chéo: cùng chiều.","feedbackWrong":"❌ Đai thẳng → ngược chiều; đai chéo → cùng chiều."},
  {"question":"Điều kiện ăn khớp đúng của 2 bánh răng:","options":["Cùng mô đun","Cùng số răng","Cùng đường kính","Cùng vật liệu"],"correct":0,"section":"III","feedbackCorrect":"✅ ĐK ăn khớp: cùng mô đun m.","feedbackWrong":"❌ Điều kiện: cùng mô đun m (m = d/z)."},
  {"question":"Trong bộ truyền bánh răng trong, 2 bánh quay:","options":["Ngược chiều","Cùng chiều","Vuông góc","Không xác định"],"correct":1,"section":"III","feedbackCorrect":"✅ Bánh răng ăn khớp trong: 2 bánh quay cùng chiều.","feedbackWrong":"❌ Ăn khớp trong → cùng chiều; ăn khớp ngoài → ngược chiều."},
  {"question":"Vận tốc dài tại điểm ăn khớp của 2 bánh răng:","options":["Khác nhau","Bằng nhau","Không xác định","Bằng 0"],"correct":1,"section":"III","feedbackCorrect":"✅ Tại điểm ăn khớp: v₁ = v₂ (cùng vận tốc dài).","feedbackWrong":"❌ Tại điểm tiếp xúc ăn khớp, vận tốc dài bằng nhau."},

  # IV. Hợp chuyển động điểm (6 câu)
  {"question":"Trong hợp chuyển động, chuyển động tuyệt đối = ?","options":["Chuyển động kéo theo + tương đối","Chuyển động kéo theo","Chuyển động tương đối","Chuyển động quay"],"correct":0,"section":"IV","feedbackCorrect":"✅ CĐ tuyệt đối = CĐ kéo theo + CĐ tương đối.","feedbackWrong":"❌ Định lý: CĐ tuyệt đối = kéo theo + tương đối."},
  {"question":"Công thức hợp vận tốc: va = ?","options":["ve + vr","ve × vr","ve - vr","ve / vr"],"correct":0,"section":"IV","feedbackCorrect":"✅ va = ve + vr (cộng véc tơ).","feedbackWrong":"❌ Vận tốc tuyệt đối = vận tốc kéo theo + vận tốc tương đối."},
  {"question":"Gia tốc Coriolis xuất hiện khi:","options":["Chuyển động kéo theo là tịnh tiến","Vận tốc tương đối = 0","Chuyển động kéo theo là quay VÀ có vận tốc tương đối","Gia tốc kéo theo = 0"],"correct":2,"section":"IV","feedbackCorrect":"✅ Coriolis khi kéo theo là quay + vr ≠ 0.","feedbackWrong":"❌ aC = 2ωe × vr, chỉ xuất hiện khi kéo theo quay VÀ vr ≠ 0."},
  {"question":"Công thức gia tốc Coriolis aC = ?","options":["2ωe × vr","ωe × vr","ωe²·r","2ve × vr"],"correct":0,"section":"IV","feedbackCorrect":"✅ aC = 2ωe × vr.","feedbackWrong":"❌ Gia tốc Coriolis = 2·ωe × vr (tích có hướng)."},
  {"question":"Khi CĐ kéo theo là tịnh tiến thì gia tốc Coriolis:","options":["Rất lớn","Bằng 0","Âm","Bằng ae"],"correct":1,"section":"IV","feedbackCorrect":"✅ Kéo theo tịnh tiến → ωe=0 → aC=0.","feedbackWrong":"❌ Tịnh tiến: ωe=0 → aC = 2×0×vr = 0."},
  {"question":"Quy tắc xác định hướng Coriolis:","options":["Quay vr theo ωe góc 90°","vr × ωe","Ngược hướng vr","Vuông góc ωe"],"correct":0,"section":"IV","feedbackCorrect":"✅ Quay vr theo chiều ωe góc π/2.","feedbackWrong":"❌ Coriolis: quay véc tơ vr theo chiều ωe một góc 90°."},

  # V. Chuyển động song phẳng (8 câu)
  {"question":"Chuyển động song phẳng = ?","options":["Tịnh tiến + quay quanh trục","Chỉ tịnh tiến","Chỉ quay","Tịnh tiến + quay quanh 1 điểm"],"correct":0,"section":"V","feedbackCorrect":"✅ Song phẳng = tịnh tiến (theo cực) + quay quanh cực.","feedbackWrong":"❌ CĐ song phẳng phân tích thành tịnh tiến theo cực + quay quanh cực."},
  {"question":"Tâm vận tốc tức thời (TVTTT) là điểm có:","options":["Vận tốc lớn nhất","Vận tốc bằng 0 tại thời điểm xét","Gia tốc bằng 0","Gia tốc lớn nhất"],"correct":1,"section":"V","feedbackCorrect":"✅ TVTTT: điểm có v=0 tại thời điểm đó.","feedbackWrong":"❌ Tâm vận tốc tức thời: điểm có vận tốc = 0 tại thời điểm xét."},
  {"question":"Vận tốc điểm bất kỳ qua TVTTT P: vM = ?","options":["ω × PM","ω + PM","ω / PM","ω² × PM"],"correct":0,"section":"V","feedbackCorrect":"✅ vM = ω × PM (⊥ PM).","feedbackWrong":"❌ vM = ω·PM, hướng vuông góc với PM."},
  {"question":"Bánh xe lăn không trượt, TVTTT nằm ở:","options":["Tâm bánh","Đỉnh bánh","Điểm tiếp xúc mặt đường","Biên bánh"],"correct":2,"section":"V","feedbackCorrect":"✅ Lăn không trượt: TVTTT tại điểm tiếp xúc.","feedbackWrong":"❌ Lăn không trượt → v tại tiếp xúc = 0 → đó là TVTTT."},
  {"question":"Khi vật tịnh tiến tức thời (ω=0), TVTTT nằm ở:","options":["Tâm vật","Vô cùng","Gốc tọa độ","Không tồn tại"],"correct":1,"section":"V","feedbackCorrect":"✅ ω=0 → TVTTT ở vô cùng → mọi điểm cùng vận tốc.","feedbackWrong":"❌ ω=0: TVTTT lùi ra vô cực, vật tịnh tiến tức thời."},
  {"question":"Công thức vB = vA + vBA, trong đó vBA là:","options":["Vận tốc tương đối B quay quanh A","Vận tốc tuyệt đối B","Vận tốc A","Gia tốc B"],"correct":0,"section":"V","feedbackCorrect":"✅ vBA = ω × AB: vận tốc tương đối, ⊥ AB.","feedbackWrong":"❌ vBA = vận tốc B trong CĐ quay quanh cực A."},
  {"question":"Bậc tự do của CĐ song phẳng là:","options":["1","2","3","6"],"correct":2,"section":"V","feedbackCorrect":"✅ Song phẳng: 3 bậc tự do (xA, yA, φ).","feedbackWrong":"❌ CĐ song phẳng: 3 tham số (2 tọa độ cực + 1 góc quay)."},
  {"question":"Tập hợp các TVTTT lập thành đường gọi là:","options":["Quỹ đạo","Đường lăn (roulette)","Đường tròn","Đường thẳng"],"correct":1,"section":"V","feedbackCorrect":"✅ Tập hợp TVTTT = đường lăn (centrode).","feedbackWrong":"❌ Tập hợp các TVTTT tạo thành đường lăn (centrode/roulette)."},

  # VI. Quay quanh 1 điểm cố định (5 câu)
  {"question":"Vật quay quanh 1 điểm cố định có mấy bậc tự do?","options":["1","2","3","6"],"correct":2,"section":"VI","feedbackCorrect":"✅ Quay quanh 1 điểm: 3 bậc tự do (3 góc Euler).","feedbackWrong":"❌ 3 bậc tự do: nutation, precession, spin (3 góc Euler)."},
  {"question":"3 góc Euler gồm:","options":["φ, ψ, θ (nutation, precession, spin)","x, y, z","r, θ, φ","α, β, γ"],"correct":0,"section":"VI","feedbackCorrect":"✅ 3 góc Euler: φ (tiến động), ψ (tự quay), θ (chương động).","feedbackWrong":"❌ Góc Euler: precession φ, nutation θ, spin ψ."},
  {"question":"Vận tốc góc tức thời ω của vật quay quanh điểm cố định:","options":["Là véc tơ không đổi","Có phương, chiều, độ lớn đều thay đổi","Luôn vuông góc trục cố định","Luôn nằm ngang"],"correct":1,"section":"VI","feedbackCorrect":"✅ ω thay đổi cả phương chiều và độ lớn.","feedbackWrong":"❌ CĐ quay quanh điểm: ω thay đổi phương, chiều, trị số."},
  {"question":"Trục quay tức thời là:","options":["Trục cố định","Trục qua O mang véc tơ ω tại thời điểm t","Trục đối xứng","Trục quán tính"],"correct":1,"section":"VI","feedbackCorrect":"✅ Trục quay tức thời: trục qua O mang ω(t).","feedbackWrong":"❌ Trục quay tức thời: đường thẳng qua O theo phương ω tại t."},
  {"question":"Vận tốc điểm M trên vật: v = ?","options":["ω × OM","ω · OM","ω + OM","OM / ω"],"correct":0,"section":"VI","feedbackCorrect":"✅ v = ω × OM (tích có hướng).","feedbackWrong":"❌ v = ω × OM (tích véc tơ)."},

  # VII. Bài tập (8 câu)
  {"question":"Điểm M CĐ tròn bán kính R=2m, vận tốc góc ω=3 rad/s. Vận tốc v =","options":["6 m/s","5 m/s","1.5 m/s","9 m/s"],"correct":0,"section":"VII","feedbackCorrect":"✅ v = ωR = 3×2 = 6 m/s.","feedbackWrong":"❌ v = ω·R = 3×2 = 6 m/s."},
  {"question":"Vật quay đều n=120 vòng/phút thì ω =","options":["4π rad/s","2π rad/s","120π rad/s","60 rad/s"],"correct":0,"section":"VII","feedbackCorrect":"✅ ω = 2πn/60 = 2π×120/60 = 4π rad/s.","feedbackWrong":"❌ ω = 2πn/60 = 4π ≈ 12.57 rad/s."},
  {"question":"Điểm trên vành bánh xe R=0.5m quay đều ω=10 rad/s. aₙ =","options":["50 m/s²","5 m/s²","25 m/s²","100 m/s²"],"correct":0,"section":"VII","feedbackCorrect":"✅ aₙ = ω²R = 100×0.5 = 50 m/s².","feedbackWrong":"❌ aₙ = ω²·R = 10²×0.5 = 50 m/s²."},
  {"question":"Bộ truyền 2 bánh răng z₁=20, z₂=40. Nếu ω₁=100 rad/s thì ω₂ =","options":["50 rad/s","200 rad/s","100 rad/s","25 rad/s"],"correct":0,"section":"VII","feedbackCorrect":"✅ ω₂ = ω₁·z₁/z₂ = 100×20/40 = 50 rad/s.","feedbackWrong":"❌ ω₁z₁ = ω₂z₂ → ω₂ = 100×20/40 = 50 rad/s."},
  {"question":"Quỹ đạo của điểm trên vành bánh xe lăn không trượt là:","options":["Đường tròn","Đường cycloid","Đường thẳng","Elip"],"correct":1,"section":"VII","feedbackCorrect":"✅ Cycloid (đường cong lăn).","feedbackWrong":"❌ Điểm vành bánh lăn không trượt vẽ đường cycloid."},
  {"question":"s = 3t² + 2t (m). Vận tốc tại t=2s là:","options":["14 m/s","12 m/s","8 m/s","16 m/s"],"correct":0,"section":"VII","feedbackCorrect":"✅ v = ds/dt = 6t+2, v(2) = 14 m/s.","feedbackWrong":"❌ v = 6t+2, tại t=2: v = 14 m/s."},
  {"question":"φ = 2t³ - 3t (rad). Gia tốc góc tại t=1s:","options":["12 rad/s²","6 rad/s²","9 rad/s²","3 rad/s²"],"correct":0,"section":"VII","feedbackCorrect":"✅ ε = d²φ/dt² = 12t, ε(1) = 12 rad/s².","feedbackWrong":"❌ ω = 6t²-3, ε = 12t, ε(1) = 12 rad/s²."},
  {"question":"Cơ cấu tay quay OA=R, con trượt B. Khi OA quay đều, vB là:","options":["Không đổi","Thay đổi theo sin/cos","Luôn bằng 0","Bằng vA"],"correct":1,"section":"VII","feedbackCorrect":"✅ vB thay đổi theo hàm sin/cos (cơ cấu tay quay con trượt).","feedbackWrong":"❌ vB = Rω·sinφ → thay đổi hàm sin."},
]

out = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'quiz-ch2.json')
with open(out, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
print(f"✅ Ch2: {len(questions)} questions → {out}")
