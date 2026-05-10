"""Generate 50 quiz questions for Chapter 3 - Động lực học"""
import json, sys, os
sys.stdout.reconfigure(encoding='utf-8')

questions = [
  # I. Mở đầu (4 câu)
  {"question":"Động lực học nghiên cứu:","options":["Chuyển động không quan tâm lực","Mối quan hệ giữa lực và chuyển động","Chỉ trạng thái cân bằng","Chỉ biến dạng"],"correct":1,"section":"I","feedbackCorrect":"✅ Động lực học = quan hệ lực → chuyển động.","feedbackWrong":"❌ Động lực học: nghiên cứu mqh giữa lực tác dụng và chuyển động."},
  {"question":"Khối lượng m đặc trưng cho:","options":["Kích thước","Mức quán tính của vật","Trọng lượng","Thể tích"],"correct":1,"section":"I","feedbackCorrect":"✅ m = đại lượng đặc trưng mức quán tính.","feedbackWrong":"❌ Khối lượng đặc trưng cho mức quán tính (sức ì) của vật."},
  {"question":"Hệ quy chiếu quán tính là:","options":["HQC gắn với Trái Đất","HQC đứng yên hoặc chuyển động thẳng đều","HQC quay đều","Bất kỳ HQC nào"],"correct":1,"section":"I","feedbackCorrect":"✅ HQC quán tính: đứng yên hoặc chuyển động thẳng đều.","feedbackWrong":"❌ HQC quán tính = đứng yên hoặc tịnh tiến thẳng đều."},
  {"question":"Bài toán cơ bản thứ nhất của động lực học:","options":["Biết lực → tìm chuyển động","Biết chuyển động → tìm lực","Tìm cân bằng","Tìm biến dạng"],"correct":0,"section":"I","feedbackCorrect":"✅ Bài toán 1: biết lực → tìm quy luật chuyển động.","feedbackWrong":"❌ BT1: biết lực → tìm CĐ. BT2: biết CĐ → tìm lực."},

  # II. Các định luật cơ bản (8 câu)
  {"question":"Định luật quán tính (ĐL 1 Newton): chất điểm không chịu lực sẽ:","options":["Dừng lại","Đứng yên hoặc CĐ thẳng đều","Quay đều","Dao động"],"correct":1,"section":"II","feedbackCorrect":"✅ ĐL1: không lực → đứng yên hoặc thẳng đều.","feedbackWrong":"❌ ĐL quán tính: F=0 → v=const (đứng yên hoặc thẳng đều)."},
  {"question":"Định luật 2 Newton: F = ?","options":["m·v","m·a","m·ω","m·g"],"correct":1,"section":"II","feedbackCorrect":"✅ F = m·a (phương trình cơ bản).","feedbackWrong":"❌ F = m·a (lực = khối lượng × gia tốc)."},
  {"question":"Định luật 3 Newton phát biểu:","options":["F tác dụng = - F phản tác dụng","F = m·a","F = 0 → v = const","Mọi vật hút nhau"],"correct":0,"section":"II","feedbackCorrect":"✅ ĐL3: F₁₂ = -F₂₁ (tác dụng = -phản tác dụng).","feedbackWrong":"❌ ĐL3: lực tác dụng và phản tác dụng bằng nhau, ngược chiều."},
  {"question":"Phương trình vi phân CĐ chất điểm trong hệ Đề các:","options":["m·ẍ=Fx, m·ÿ=Fy, m·z̈=Fz","F=m·a","m·v=F·t","P=m·g"],"correct":0,"section":"II","feedbackCorrect":"✅ Chiếu F=ma lên 3 trục: mẍ=ΣFx, mÿ=ΣFy, mz̈=ΣFz.","feedbackWrong":"❌ PT vi phân CĐ: mẍ=ΣFx, mÿ=ΣFy, mz̈=ΣFz."},
  {"question":"Phương trình vi phân CĐ tự nhiên theo τ: m·(dv/dt) = ?","options":["ΣFτ","ΣFn","ΣF","0"],"correct":0,"section":"II","feedbackCorrect":"✅ m·dv/dt = ΣFτ (thành phần tiếp tuyến).","feedbackWrong":"❌ Theo τ: m·dv/dt=ΣFτ; theo n: m·v²/ρ=ΣFn."},
  {"question":"Lực quán tính trong HQC phi quán tính là:","options":["Lực thực","Lực ảo để áp dụng ĐL2 trong HQC phi quán tính","Trọng lực","Lực ma sát"],"correct":1,"section":"II","feedbackCorrect":"✅ Lực quán tính = lực ảo, Fqt = -m·ae.","feedbackWrong":"❌ Lực quán tính không phải lực thực, chỉ dùng trong HQC phi quán tính."},
  {"question":"Nguyên lý D'Alembert: F + Fqt = ?","options":["m·a","0","m·v","F"],"correct":1,"section":"II","feedbackCorrect":"✅ F + Fqt = 0 (cân bằng động).","feedbackWrong":"❌ D'Alembert: ΣF + Fqt = 0 → biến bài toán ĐLH thành bài toán tĩnh."},
  {"question":"Lực quán tính ly tâm xuất hiện khi:","options":["Vật CĐ thẳng","Vật quay quanh trục","Vật đứng yên","Vật rơi tự do"],"correct":1,"section":"II","feedbackCorrect":"✅ Ly tâm khi vật quay: Flt = m·ω²·r (hướng ra ngoài).","feedbackWrong":"❌ Lực quán tính ly tâm: Flt = mω²r, xuất hiện khi quay."},

  # III. Động lượng và xung lượng (6 câu)
  {"question":"Động lượng của chất điểm p = ?","options":["m·v","m·a","F·t","m·g"],"correct":0,"section":"III","feedbackCorrect":"✅ p = m·v.","feedbackWrong":"❌ Động lượng p = m·v (véc tơ)."},
  {"question":"Xung lượng của lực trong khoảng (t₁, t₂) S = ?","options":["∫F dt","F·v","m·a","F/t"],"correct":0,"section":"III","feedbackCorrect":"✅ S = ∫F dt (tích phân lực theo thời gian).","feedbackWrong":"❌ Xung lượng S = ∫F·dt từ t₁ đến t₂."},
  {"question":"Định lý biến thiên động lượng: dp/dt = ?","options":["ΣF","m·g","0","v"],"correct":0,"section":"III","feedbackCorrect":"✅ dp/dt = ΣF (đạo hàm động lượng = tổng lực).","feedbackWrong":"❌ dp/dt = ΣF → dạng vi phân ĐL2 Newton."},
  {"question":"Khi ΣF = 0, động lượng hệ:","options":["Thay đổi","Được bảo toàn","Bằng 0","Tăng dần"],"correct":1,"section":"III","feedbackCorrect":"✅ ΣF=0 → p = const (bảo toàn động lượng).","feedbackWrong":"❌ Khi tổng ngoại lực = 0 → bảo toàn động lượng."},
  {"question":"Động lượng hệ chất điểm bằng:","options":["Tổng động lượng các chất điểm","Tổng khối lượng","Tổng lực","Tổng vận tốc"],"correct":0,"section":"III","feedbackCorrect":"✅ p_hệ = Σ(mi·vi) = M·vC.","feedbackWrong":"❌ p = Σ(mi·vi) hoặc = M·vC (M=tổng khối lượng, vC=vận tốc khối tâm)."},
  {"question":"Va chạm mềm (không đàn hồi): sau va chạm 2 vật:","options":["Bật ra","Dính vào nhau, chuyển động cùng vận tốc","Đứng yên","Quay"],"correct":1,"section":"III","feedbackCorrect":"✅ Va chạm mềm: 2 vật dính, cùng v sau va chạm.","feedbackWrong":"❌ Va chạm mềm: m₁v₁+m₂v₂ = (m₁+m₂)v'."},

  # IV. Mô men động lượng (5 câu)
  {"question":"Mô men động lượng của chất điểm đối với O: LO = ?","options":["r × (m·v)","m × r","v × F","F × r"],"correct":0,"section":"IV","feedbackCorrect":"✅ LO = r × (mv) = r × p.","feedbackWrong":"❌ LO = r × p = r × (mv)."},
  {"question":"Định lý mô men động lượng: dLO/dt = ?","options":["ΣmO(Fi)","ΣFi","m·a","0"],"correct":0,"section":"IV","feedbackCorrect":"✅ dLO/dt = ΣmO(Fi) (đạo hàm = tổng mô men lực).","feedbackWrong":"❌ dLO/dt = ΣmO(F) → biến thiên mô men động lượng = tổng mô men lực."},
  {"question":"Khi ΣmO = 0, mô men động lượng đối với O:","options":["Tăng","Giảm","Bảo toàn","Bằng lực"],"correct":2,"section":"IV","feedbackCorrect":"✅ ΣmO=0 → LO = const (bảo toàn mô men ĐL).","feedbackWrong":"❌ Tổng mô men = 0 → bảo toàn mô men động lượng."},
  {"question":"Mô men quán tính của chất điểm đối với trục z: Jz = ?","options":["m·r²","m·r","m·v","m/r²"],"correct":0,"section":"IV","feedbackCorrect":"✅ Jz = m·r² (r = khoảng cách đến trục z).","feedbackWrong":"❌ Jz = mr² với r = khoảng cách từ chất điểm đến trục."},
  {"question":"Mô men quán tính thanh đồng chất dài L, khối lượng m quay quanh trục giữa:","options":["mL²/12","mL²/3","mL²/2","mL²"],"correct":0,"section":"IV","feedbackCorrect":"✅ J = mL²/12 (trục giữa thanh).","feedbackWrong":"❌ Quay quanh giữa: J = mL²/12. Quanh đầu: J = mL²/3."},

  # V. Các định lý tổng quát (10 câu)
  {"question":"Định lý chuyển động khối tâm: M·aC = ?","options":["ΣFi (ngoại lực)","ΣFi (nội lực)","0","M·g"],"correct":0,"section":"V","feedbackCorrect":"✅ M·aC = ΣFe (chỉ ngoại lực ảnh hưởng khối tâm).","feedbackWrong":"❌ M·aC = ΣFe → nội lực không ảnh hưởng CĐ khối tâm."},
  {"question":"Nội lực trong hệ:","options":["Ảnh hưởng CĐ khối tâm","Không ảnh hưởng CĐ khối tâm","Luôn bằng 0","Bằng ngoại lực"],"correct":1,"section":"V","feedbackCorrect":"✅ Nội lực tự triệt tiêu → không ảnh hưởng khối tâm.","feedbackWrong":"❌ ΣFi nội = 0 → không ảnh hưởng chuyển động khối tâm."},
  {"question":"Định lý động năng: dT = ?","options":["ΣdAi (tổng công nguyên tố)","ΣFi","m·v","F·s"],"correct":0,"section":"V","feedbackCorrect":"✅ dT = ΣδA → vi phân động năng = tổng công nguyên tố.","feedbackWrong":"❌ Định lý ĐN: dT = ΣδAi."},
  {"question":"Động năng chất điểm T = ?","options":["mv²/2","mv","mv²","m²v/2"],"correct":0,"section":"V","feedbackCorrect":"✅ T = mv²/2.","feedbackWrong":"❌ T = ½mv²."},
  {"question":"Động năng vật rắn quay quanh trục cố định T = ?","options":["Jω²/2","Jω","mω²/2","mv²/2"],"correct":0,"section":"V","feedbackCorrect":"✅ T = Jω²/2.","feedbackWrong":"❌ T = ½Jω² (J = mô men quán tính, ω = vận tốc góc)."},
  {"question":"Công của lực F khi di chuyển ds: dA = ?","options":["F · ds (tích vô hướng)","F × ds","F + ds","F / ds"],"correct":0,"section":"V","feedbackCorrect":"✅ dA = F·ds = F·cosα·ds.","feedbackWrong":"❌ dA = F·ds·cosα (tích vô hướng)."},
  {"question":"Công của lực trọng trường khi vật hạ độ cao h:","options":["mgh","mg/h","mh","mg²h"],"correct":0,"section":"V","feedbackCorrect":"✅ A = mgh (h = độ cao hạ xuống).","feedbackWrong":"❌ Trọng lực: A = P·h = mgh."},
  {"question":"Công của mô men M khi vật quay góc φ: A = ?","options":["M·φ","M/φ","M·ω","M+φ"],"correct":0,"section":"V","feedbackCorrect":"✅ A = M·φ.","feedbackWrong":"❌ Công = Mô men × góc quay."},
  {"question":"Lực thế (bảo toàn) có đặc điểm:","options":["Công phụ thuộc quỹ đạo","Công chỉ phụ thuộc vị trí đầu-cuối","Luôn bằng 0","Luôn dương"],"correct":1,"section":"V","feedbackCorrect":"✅ Lực thế: công không phụ thuộc đường đi, chỉ phụ thuộc vị trí.","feedbackWrong":"❌ Lực thế: A chỉ phụ thuộc vị trí đầu và cuối."},
  {"question":"Định luật bảo toàn cơ năng E = T + V = const khi:","options":["Có lực ma sát","Hệ chỉ chịu lực thế","Lực ngoài ≠ 0","Vật đứng yên"],"correct":1,"section":"V","feedbackCorrect":"✅ Bảo toàn cơ năng khi chỉ có lực thế tác dụng.","feedbackWrong":"❌ E = T + V = const khi chỉ có lực thế (bảo toàn)."},

  # VI. Nguyên lý D'Alembert (7 câu)
  {"question":"Nguyên lý D'Alembert biến bài toán ĐLH thành:","options":["Bài toán tĩnh học","Bài toán động học","Bài toán mô men","Bài toán năng lượng"],"correct":0,"section":"VI","feedbackCorrect":"✅ D'Alembert: thêm lực quán tính → bài toán tĩnh.","feedbackWrong":"❌ D'Alembert: ΣF + Fqt = 0 → cân bằng tĩnh (cân bằng động)."},
  {"question":"Lực quán tính d'Alembert Fqt = ?","options":["-m·a","m·a","m·v","m·g"],"correct":0,"section":"VI","feedbackCorrect":"✅ Fqt = -m·a (ngược chiều gia tốc).","feedbackWrong":"❌ Fqt = -ma (ngược chiều gia tốc)."},
  {"question":"Phương trình D'Alembert cho hệ: ΣFe + ΣFi + ΣFqt = ?","options":["ΣF","0","m·a","ΣFe"],"correct":1,"section":"VI","feedbackCorrect":"✅ ΣFe + ΣFqt = 0 (nội lực tự triệt tiêu).","feedbackWrong":"❌ D'Alembert cho hệ: Σ(ngoại lực) + Σ(lực quán tính) = 0."},
  {"question":"Mô men quán tính vật rắn quay: tải quán tính Mqt = ?","options":["-J·ε","-m·a","J·ω","m·v"],"correct":0,"section":"VI","feedbackCorrect":"✅ Mqt = -J·ε (mô men lực quán tính).","feedbackWrong":"❌ Mô men quán tính: Mqt = -Jε."},
  {"question":"Áp dụng D'Alembert, áp lực lên trục quay gồm:","options":["Chỉ trọng lực","Trọng lực + lực quán tính ly tâm + lực quán tính tiếp tuyến","Chỉ lực quán tính","Chỉ phản lực"],"correct":1,"section":"VI","feedbackCorrect":"✅ Áp lực trục = P + Flt + Fτ (quán tính).","feedbackWrong":"❌ Áp lực trục: tổng hợp P + lực quán tính ly tâm + tiếp tuyến."},
  {"question":"Khi vật quay đều quanh trục, lực quán tính tiếp tuyến:","options":["Rất lớn","Bằng 0","Bằng Flt","Bằng P"],"correct":1,"section":"VI","feedbackCorrect":"✅ Quay đều: ε=0 → Fτ=m·ε·r=0.","feedbackWrong":"❌ Quay đều: ε=0 → lực quán tính tiếp tuyến = 0."},
  {"question":"Cân bằng động trục quay: trục cân bằng khi:","options":["Véc tơ chính lực quán tính = 0 và mô men chính = 0","Chỉ cần R=0","Chỉ cần M=0","ω = 0"],"correct":0,"section":"VI","feedbackCorrect":"✅ Cân bằng động: R_qt=0 VÀ M_qt=0 (cả véc tơ chính lẫn mô men chính).","feedbackWrong":"❌ Cân bằng động trục quay cần cả R=0 và M=0."},

  # VII. Bài tập tính toán (10 câu)
  {"question":"Vật m=2kg, a=3m/s². Lực tác dụng F =","options":["6 N","5 N","1 N","9 N"],"correct":0,"section":"VII","feedbackCorrect":"✅ F=ma=2×3=6N.","feedbackWrong":"❌ F=ma=2×3=6N."},
  {"question":"Vật m=5kg rơi tự do (g=10m/s²). Sau 3s, v =","options":["30 m/s","15 m/s","50 m/s","10 m/s"],"correct":0,"section":"VII","feedbackCorrect":"✅ v=gt=10×3=30 m/s.","feedbackWrong":"❌ v=g·t=10×3=30 m/s."},
  {"question":"Viên đạn m₁=10g, v₁=500m/s bắn vào bao cát m₂=5kg đứng yên. Vận tốc bao cát sau va chạm:","options":["≈1 m/s","≈10 m/s","≈50 m/s","≈100 m/s"],"correct":0,"section":"VII","feedbackCorrect":"✅ m₁v₁=(m₁+m₂)v' → v'=0.01×500/5.01≈1 m/s.","feedbackWrong":"❌ BTĐL: 0.01×500=5.01×v' → v'≈1 m/s."},
  {"question":"Động năng vật m=4kg, v=5m/s: T =","options":["50 J","20 J","100 J","10 J"],"correct":0,"section":"VII","feedbackCorrect":"✅ T=mv²/2=4×25/2=50J.","feedbackWrong":"❌ T=½mv²=½×4×25=50J."},
  {"question":"Vật m=10kg rơi tự do từ h=20m (g=10). Vận tốc chạm đất:","options":["20 m/s","10 m/s","40 m/s","14 m/s"],"correct":0,"section":"VII","feedbackCorrect":"✅ v=√(2gh)=√(400)=20 m/s.","feedbackWrong":"❌ BTCN: mgh=mv²/2 → v=√(2gh)=20 m/s."},
  {"question":"Bánh đà J=2kg·m², ω=10rad/s. Động năng quay T =","options":["100 J","20 J","200 J","50 J"],"correct":0,"section":"VII","feedbackCorrect":"✅ T=Jω²/2=2×100/2=100J.","feedbackWrong":"❌ T=½Jω²=½×2×100=100J."},
  {"question":"Lực F=50N tác dụng lên vật di chuyển s=4m cùng hướng. Công A =","options":["200 J","12.5 J","100 J","250 J"],"correct":0,"section":"VII","feedbackCorrect":"✅ A=Fs=50×4=200J.","feedbackWrong":"❌ A=F·s·cos0°=200J."},
  {"question":"Mô men M=20Nm quay vật góc φ=5rad. Công A =","options":["100 J","4 J","25 J","200 J"],"correct":0,"section":"VII","feedbackCorrect":"✅ A=Mφ=20×5=100J.","feedbackWrong":"❌ A=M·φ=20×5=100J."},
  {"question":"Vật m=1kg trên lò xo k=100N/m, biến dạng x=0.1m. Thế năng đàn hồi V =","options":["0.5 J","1 J","10 J","5 J"],"correct":0,"section":"VII","feedbackCorrect":"✅ V=kx²/2=100×0.01/2=0.5J.","feedbackWrong":"❌ V=½kx²=½×100×0.01=0.5J."},
  {"question":"Thanh OA=0.5m, m=2kg quay quanh O. J_O =","options":["mL²/3 = 1/6 kg·m²","mL²/12","mL²","mL²/2"],"correct":0,"section":"VII","feedbackCorrect":"✅ JO=mL²/3=2×0.25/3≈0.167 kg·m².","feedbackWrong":"❌ Thanh quay quanh đầu: J=mL²/3."},
]

out = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'quiz-ch3.json')
with open(out, 'w', encoding='utf-8') as f:
    json.dump(questions, f, ensure_ascii=False, indent=2)
print(f"✅ Ch3: {len(questions)} questions → {out}")
