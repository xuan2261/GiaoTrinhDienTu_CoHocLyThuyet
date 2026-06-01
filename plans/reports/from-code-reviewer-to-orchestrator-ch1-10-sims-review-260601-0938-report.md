# Review 10 sim Chương 1 (tĩnh học) — sim2/sims/ch1

Ngày: 2026-06-01 | Reviewer: code-reviewer | Phạm vi: 10 file ch1-*.js
Cách kiểm: đọc full + `node --check` cả 10 (đều PASS syntax) + đối chiếu physics layer (statics.js, dynamics.js) + palette.js + sim-shell contract.

## Tổng quan
Chất lượng tốt, đồng đều. Tất cả tuân contract `factory(container) → { dispose: shell.dispose }`, drag qua `shell.addHandle` (listener tự cleanup, không có addEventListener trần), không sim nào dùng RAF nên không vướng yêu cầu start-paused. Color-match KaTeX↔legend↔vector nhất quán nội bộ ở mọi file. Guard NaN/div-by-zero có ở chỗ cần (ch1-2-3 góc, physics layer). **0 Critical, 1 Important, phần còn lại Minor/quan sát.**

---

## Per-file

### ch1-1-3 — Véc tơ lực — SẠCH
- Physics đúng: `resolveForceComponents` (fx=Fcosα, fy=Fsinα). Drag↔slider đồng bộ qua `setValue` (không bắn input → không loop, có comment giải thích). Màu F đỏ / Fₓ rose / Fᵧ blue khớp KaTeX (#e03030/#d81b60/#1565c0).

### ch1-1-4 — Mô men lực & cánh tay đòn — SẠCH (1 minor)
- Physics đúng: `computeMoment(F, d, 90)` = d·F·sin90 = F·d. Lực luôn thẳng đứng, cánh tay đòn = |app.x| (khoảng vuông góc) → đúng. Màu/legend khớp.
- **Minor (dòng 52):** KaTeX `M = F·d` lược bỏ sinθ. Đúng vì θ≡90° (lực đứng, đòn ngang), chấp nhận về sư phạm — chỉ lưu ý nếu sau này cho phép đổi phương lực thì công thức sai.

### ch1-1-5 — Thu gọn hệ lực phẳng — SẠCH
- Physics đúng: `reduceToResultant` (Rx,Ry,Mo=Σ(rx·fy−ry·fx)). Drag đổi F (gốc r cố định) → Mo cập nhật đúng. Màu lực đỏ / R cam khớp.

### ch1-1-6 — Ngẫu lực — SẠCH (1 minor)
- Physics đúng: `coupleMoment(F,d)`=F·d, d=2·half, ΣF=0 hiển thị đúng. Drag↔slider d đồng bộ. Màu khớp.
- **Minor (dòng 16):** `F = 50` hardcode, không slider. Mô men ngẫu phụ thuộc cả F lẫn d nhưng chỉ d tương tác. Thiết kế chủ ý (header ghi rõ), chấp nhận theo YAGNI — chỉ lưu ý legend hiển thị "cặp lực F" nhưng F không chỉnh được.

### ch1-2-3 — Hình bình hành lực — SẠCH (1 minor)
- Physics đúng: R=F1+F2, có guard chống NaN khi |F|→0 ở readout góc (dòng 50, `m1>1e-9 && m2>1e-9`). Drag 2 tip cập nhật realtime. KaTeX↔legend↔vector nhất quán.
- **Minor (dòng 22-23, 28-29):** F1/F2 (2 lực độc lập) dùng token `Pal.x`(rose)/`Pal.y`(blue) — vốn dành cho thành phần X/Y. Nhất quán nội bộ (legend+formula cùng màu) nên KHÔNG sai quy ước #3, chỉ là chọn token hơi lệch ngữ nghĩa (palette không có token "force2").

### ch1-1-8 — Phản lực liên kết (dầm 2 gối) — SẠCH
- Physics đúng: `beamReactions` → Ra=P(L−a)/L, Rb=P·a/L. Tải vẽ hướng xuống, phản lực hướng lên. pos clamp [0.3, L−0.3]. Màu P đỏ / Ra,Rb tím (reaction) khớp KaTeX #b10dc9. (Lưu ý nhẹ: chỉ slider P, vị trí chỉ qua drag — khác ch1-3-6 có cả 2 slider; không phải lỗi.)

### ch1-3-2 — Lực căng dây — SẠCH (1 minor)
- Physics đúng (đã verify hình học): dây nghiêng góc α so với phương đứng (dx=3·tanα, dy=3), `T=W/(2cosα)` đúng cho hệ 2 dây đối xứng. Drag↔slider α đồng bộ, inverse `atan2(dx,3)` khớp. cosα không về 0 (α≤75 clamp).
- **Minor (dòng 27-28):** lực căng T tô token `reaction` (tím). Chấp nhận (legend "T (lực căng)" cùng tím) — về vật lý tension không hẳn là phản lực liên kết, nhưng nhất quán nội bộ.

### ch1-3-6 — Phản lực & mô men ngàm (cantilever) — SẠCH (1 minor)
- Physics đúng: tải tập trung → R=P, M=P·a (tính inline). Drag↔slider a + slider P. Màu P đỏ / R tím / M moment khớp KaTeX.
- **Minor (dòng 39):** R, M tính inline, không qua physics layer. Đúng vật lý; `cantileverDistributed` trong statics.js là cho tải **phân bố** (sẽ sai nếu ép dùng), không có hàm point-load → inline là lựa chọn hợp lý. RC1 chấp nhận vì là công thức trivial đúng, không phải pixel-heuristic/hằng bịa. (Không import `P` cũng đúng vì không xài.)
- Quan sát: `lblM` đặt tĩnh, không reposition trong render2 — OK vì nhãn "M" cạnh ngàm không cần di chuyển.

### ch1-5-3 — Nón ma sát mặt nghiêng — **IMPORTANT + minor**
- **Important (dòng 7, 51-52):** Sim KHÔNG import `SimPhysicsDynamics` mà tự viết lại `phiDeg = atan(mu)*180/π` và `slips = betaDeg > phiDeg` inline. Trong khi `js/sim2/physics/dynamics.js` đã có sẵn `staticLimitAngle(mu)` (=atan μ) và `slipCondition(betaDeg, mu)` (trả `{slips, phi}`) — task context ghi rõ 2 hàm này "cho sim ma sát ch1-5-3". Đây là reimplementation song song (AI-slop pattern) + lệch invariant RC1 ("readout phải derive từ shared module"). **Physics output ĐÚNG** (math trùng khớp), nên không phải bug correctness, nhưng nên wire vào module dùng chung để khỏi drift khi công thức ma sát đổi.
  - Fix: `const D = root.SimPhysicsDynamics;` rồi `const phiDeg = D.staticLimitAngle(state.mu)*180/Math.PI;` và `const { slips } = D.slipCondition(state.betaDeg, state.mu);`.
- **Minor (dòng 26, 67):** khối vật tô token `Pal.a` (lam = gia tốc). Vật ma sát tĩnh dùng màu gia tốc hơi lạc nghĩa; nhất quán legend nên không vi phạm cứng, chỉ lưu ý.
- Phần còn lại đúng: drag↔slider β đồng bộ, clamp [3,60], trạng thái TRƯỢT(đỏ)/CÂN BẰNG(lục) hợp lý.

### ch1-6-3 — Trọng tâm hình ghép/khoét — SẠCH (2 minor)
- Physics đúng: `centroidWithHole` trừ diện tích lỗ đúng (cx=(A·x1−A0·x0)/(A−A0)). Lỗ clamp trong tấm. Màu C cam (resultant) / lỗ tím khớp KaTeX #e06a00.
- **Minor (dòng 22):** `fill: '#fff'` hardcode hex cho lỗ khoét — ngoài ngoại lệ cho phép (LaTeX/rgba canvas). Chấp nhận được (trắng = "khoét rỗng" ≈ nền) nhưng có thể đưa thành token nền nếu muốn chuẩn hóa tuyệt đối.
- **Minor (dòng 17):** `hole.r = 1` cố định, không slider; formula hiển thị A₀ nhưng A₀ không đổi được. Tương tác chính là kéo vị trí lỗ → chấp nhận theo YAGNI.

---

## Edge cases đã soi (không thấy lỗi)
- Div-by-zero: ch1-2-3 góc (có guard); ch1-3-2 cosα (clamp α≤75); physics `centroidWithHole`/`beamReactions` có guard nội bộ. OK.
- Loop drag↔slider: tất cả dùng `setValue` (không bắn `input`) hoặc không có slider tương ứng → không vòng lặp. `handle.move` chỉ set attribute, không gọi onDrag. OK.
- Dispose: `return { dispose: shell.dispose }` — `shell.dispose` là closure không dùng `this` nên gọi detached an toàn; gỡ sạch listener+DOM+header. OK.
- Ordering: `handle`/`panel` được tham chiếu trong `render2` nhưng `render2()` đầu tiên luôn gọi SAU khi chúng được khởi tạo; slider `onInput` không bắn lúc tạo control → không crash. Pattern nhất quán 10 file.

## Quan sát chung (không chặn)
- Token màu đôi chỗ chọn hơi lệch ngữ nghĩa (x/y cho lực độc lập ở ch1-2-3; `a` cho khối ở ch1-5-3; `reaction` cho tension ch1-3-2) — nhưng đều nhất quán legend↔vector↔KaTeX nên đạt quy ước #3.
- Không file nào vượt cap dòng (max ~96 dòng).

## Metrics
- Syntax (`node --check`): 10/10 PASS
- Contract `{dispose}`: 10/10 đúng
- Listener cleanup: 10/10 qua shell (0 addEventListener trần)
- Physics sai/NaN/div-0: 0
- Color-match vi phạm cứng: 0

## Unresolved questions
1. ch1-5-3: có chủ ý inline math thay vì gọi `SimPhysicsDynamics.staticLimitAngle/slipCondition` không? Nếu module dynamics.js là nguồn chân lý bắt buộc (RC1) thì nên refactor; nếu chấp nhận inline-trivial thì hạ xuống Minor.
2. ch1-1-6 (F) và ch1-6-3 (hole.r) hardcode — có nằm trong kế hoạch bổ sung slider sau không, hay cố định là quyết định cuối?

---
**Status:** DONE_WITH_CONCERNS
**Summary:** 10 sim ch1 sạch về contract/dispose/color-match/physics-correctness, syntax 10/10 pass. Một concern Important duy nhất: ch1-5-3 viết lại công thức nón ma sát inline thay vì dùng `SimPhysicsDynamics` đã có sẵn (đúng output nhưng lệch invariant RC1).
**Counts:** Critical 0 · Important 1 · Minor 8
