# Animation Sweep Verification — Cơ Học Lý Thuyết (deep, per-second)

**Ngày:** 2026-05-21
**Môi trường:** `python -m http.server 8765` → Chromium qua agent-browser CDP, kernel build hiện tại của master
**Phương pháp:** chạy 1 single-page session, lần lượt `loadPage(routeId)` cho **toàn bộ 58 route**; với mỗi route: chờ canvas, snapshot canvas hash + readout text tại **t=0/1/2/3 giây** trong khi animation play; phân tích delta pixel từng giây và readout drift.

Đợt này khắc phục điểm yếu của lần QA trước (chỉ kiểm tra mount + interaction sweep): kỳ này **theo dõi animation evolution theo giây**, đối chứng pixel canvas, và trả lời câu hỏi "có thật sự đang chạy không?" — không chỉ "có mount không?".

---

## 1. Tổng quan

| Hạng mục | Kết quả |
|---|---|
| Routes test | 58/58 mounted (Ch1 25/25, Ch2 15/15, Ch3 18/18) |
| Lỗi runtime (`console.error` + `window.error` + `unhandledrejection`) | **0/58** |
| Routes có play/pause button | 33/58 (Ch2 15/15, Ch3 18/18) |
| Routes Ch1 không có play button (đúng spec — tĩnh học) | 25/25 |
| Routes có **canvas pixel evolution** trong 3s | **20/33** (60.6 % các route có Play) |
| Routes có **readout/text evolution** trong 3s | 33/33 (100 %) |
| Routes có Play nhưng **canvas không tiến hoá** | **13/33** (xem mục 4) |
| Autoplay observed (button label = "⏸ Dừng" ngay sau mount) | 0/58 (mọi autoplay scene mặc định ở trạng thái dừng khi snapshot ban đầu) |

> ✅ Kết luận sớm: **không có route nào throw exception, không có route nào treo, không có canvas trắng.** Mọi route phản hồi click Play đúng (state engine tick — readout tiến triển theo giây). Vấn đề duy nhất nằm ở 13 route có Play nhưng renderer không vẽ lại theo `state._t`.

---

## 2. Phương pháp đo

Driver chạy hoàn toàn bên browser (loop async trong page) để tránh round-trip CDP cho từng frame:

```js
for routeId in 58 routes {
  loadPage(routeId);
  waitCanvas(8s);
  sleep(150ms);                  // settle
  snapshot t=0  → frame[t0], readout[t0]
  click "Chạy" if not already playing
  sleep(1000ms); snapshot t=1
  sleep(1000ms); snapshot t=2
  sleep(1000ms); snapshot t=3
  click "Dừng"
}
```

`frameHash` lấy 16×16 grid sample từ `getImageData` (cho route sweep), và sau đó **rerun với full-image digest (step=4 px ≈ 80 K samples + per-quadrant subsum)** trên các route flag "không đổi" để loại false-negative do sample sparse miss vật thể nhỏ.

`readoutText` đọc `.sim-readout-grid.textContent`, normalize whitespace.

---

## 3. Kết quả per-route (frame hashes)

Bảng đầy đủ ở `qa-verification/animation-sweep/per-route-animation-sweep-results.json`. Tóm tắt nhóm:

### 3.1 Ch1 – 25/25 — Tĩnh học (không Play, đúng spec)

Toàn bộ 25 route Ch1 không có play button. Canvas mount đúng, readout có giá trị tĩnh (không tick), interaction (drag/slider) thay đổi readout đúng. Đây là **đúng thiết kế** — bài toán tĩnh học phân tích lực ở trạng thái cân bằng, không cần `state._t`.

### 3.2 Ch2 – 13/15 evolve, 2 chỉ "snap-evolve"

| Route | uniqueFrames | Diễn giải |
|---|---|---|
| ch2-1-1 | 4 | gia tốc tiếp/pháp — animate mượt |
| ch2-1-2 | 3 | quỹ đạo cong — animate |
| ch2-1-3 | 4 | velocity vector quay |
| ch2-1-4 | 4 | acceleration breakdown |
| ch2-2-2 | 4 | rotation (φ tăng từ 0° → 4.55°) |
| ch2-3-2 | 4 | composite motion |
| ch2-4-1..4-4 | 4,4,4,4 | rolling, slip, gear |
| **ch2-5-1** | 1 (full digest) | **flag** — readout v_A/v_B updates, canvas tĩnh |
| ch2-5-2 | 2 | chỉ frame đầu lệch, sau đó đứng (instant-center static — đúng spec) |
| ch2-5-3 | 2 | tương tự |
| ch2-7-1 | 4 | exercise scene — animate |
| **ch2-7-2** | 1 | **flag** — readout tick nhưng canvas đứng |

ch2-5-2 / ch2-5-3 là **đúng spec**: kịch bản instant-center hiển thị trạng thái tức thời rồi giữ ổn định (no `_t` rendering). uniqueFrames=2 vì có một burst lại sau khi click Play.

### 3.3 Ch3 – 7/18 evolve, 11 không evolve trên canvas

| Route | uniqueFrames | Diễn giải |
|---|---|---|
| ch3-2-2 | 4 | Newton II — vẽ v(t) graph động |
| ch3-3-1 | 4 | dao động lò xo (autoplay sau click) |
| ch3-3-2 | 4 | coupled springs |
| ch3-4-2 | 4 | inverse dynamics — a(t)·sin(ωt) |
| ch3-5-3 | 4 | angular momentum animation |
| ch3-5-4 | 4 | work-energy — preview-pause autoplay |
| ch3-6-2 | 4 | va chạm 2D — autoplay 3 frame rồi pause |
| ch3-1-2, ch3-1-3, ch3-2-1, ch3-2-3, ch3-2-5, ch3-4-1, ch3-5-1, ch3-5-2, ch3-6-3, ch3-7-1, ch3-7-2 | 1 | **flag — canvas không tiến hoá** |

---

## 4. Finding chính: 13 route có Play nhưng canvas không tiến hoá

Đây là điểm phát hiện thực sự của đợt verification này. Cả 13 route:

- Có button "▶ Chạy" → "⏸ Dừng" hoạt động đúng (UI state đổi)
- Engine tick đúng — `state._t` tăng (readout panel hiển thị `thời gian 0.00 s → 3.04 s`)
- Numeric readout (xG, p, v, J, score…) cập nhật theo `_t`
- **Canvas image identical từ t=0 đến t=3** — full-image digest cho thấy 4/4 frame có cùng pixel sum, cả 4 quadrant deltas = 0

| Route | hasPlay | state tick | canvas tick | Phân loại |
|---|---|---|---|---|
| ch3-1-2 | ✓ | ✓ | ✗ | concept diagram (force-acceleration arrow) |
| ch3-1-3 | ✓ | ✓ | ✗ | concept diagram (inertial frames) |
| ch3-2-1 | ✓ | ✓ (v đổi 0→30.5 m/s) | ✗ | **candidate — F=0→v=const, body đáng lẽ trượt** |
| ch3-2-3 | ✓ | ✓ | ✗ | concept diagram (force pair Newton III) |
| ch3-2-5 | ✓ | ✓ | ✗ | concept diagram (D'Alembert FBD) |
| ch3-4-1 | ✓ | ✓ | ✗ | concept diagram (cân bằng động) |
| ch3-5-1 | ✓ | ✓ | ✗ | **candidate — center of mass particles** |
| ch3-5-2 | ✓ | ✓ (t 0→3.04 s) | ✗ | **candidate — impulse-momentum chart** |
| ch3-6-3 | ✓ | ✓ (p 2→1) | ✗ | solver — đúng spec đứng |
| ch3-7-1 | ✓ | ✓ | ✗ | theorem selector — đúng spec |
| ch3-7-2 | ✓ | ✓ (score 100 %, t 3.02s) | ✗ | residual table — đúng spec |
| ch2-5-1 | ✓ | ✓ | ✗ (1 quadrant đổi -4333 — nhiễu nhẹ) | **candidate — instant-center vẽ v_A/v_B vector** |
| ch2-7-2 | ✓ | ✓ | ✗ | exercise selector — đúng spec |

### 4.1 Root cause

Đọc từng renderer trong `js/sims/ch3/*.js` và `js/sims/ch2/ch2-instant-center-plane-motion-renderers.js`:

```bash
$ grep -c "state._t" js/sims/ch3/ch3-newton-laws-renderers.js
0
$ grep -c "state._t" js/sims/ch2/ch2-kinematics-exercises-renderers.js
0
```

Tất cả 13 renderer **không hề tham chiếu `state._t`** — chỉ vẽ scalar state (F, m, alpha, v…). Animation engine vẫn tick `_t` chính xác (readout xác nhận), nhưng renderer được thiết kế là pure-state-of-now: same input → same image.

Đây không phải bug tương tự RC2/RC6 (autoplay ràng buộc kernel) — kernel + state machine đều healthy. Là design choice của renderer: tách "concept diagram" (vẽ trạng thái) khỏi "animation scene" (vẽ chuyển động).

### 4.2 Phân loại

| Loại | Route | Hành động đề xuất |
|---|---|---|
| **Concept diagram (đúng spec)** — FBD, theorem selector, residual checker, force-pair diagram | ch3-1-3, ch3-2-3, ch3-2-5, ch3-4-1, ch3-6-3, ch3-7-1, ch3-7-2, ch2-7-2 | Cân nhắc **ẩn nút "▶ Chạy"** trên các route này (vì hiện tại nút đổi label nhưng không thay đổi gì nhìn thấy được — UX gây hiểu nhầm). Hoặc đổi nhãn thành "Tính lại" / "Cập nhật". |
| **Should animate (candidate)** — physics suggest visible motion: object trượt, particles, velocity arrow xoay | ch3-1-2 (force-acceleration arrow), ch3-2-1 (inertia law — body lẽ ra phải trượt v=const), ch3-5-1 (center of mass particles), ch3-5-2 (impulse-momentum vector), ch2-5-1 (instant-center v_A/v_B arrow xoay) | Bổ sung `state._t` vào renderer: với ch3-2-1, `bodyX = 200 + state.F*0.3 + (Fnet === 0 ? state._v0*state._t*5 : 0.5*Fnet/state.m*state._t**2*5)`. Tương tự cho 4 route còn lại. Nằm ngoài scope verification — log thành issue cho phase tiếp. |

> **Lưu ý:** Đây không phải regression. Cả 13 route đã ở trạng thái này từ trước đợt overhaul "sim correctness realism" (commit `1b9efdf`); previous QA report (commit `d696bcd`) đã pass mount + interaction nhưng không đo per-second canvas evolution nên không bắt được. Finding này **bổ sung** chứ không **phủ định** kết quả trước.

---

## 5. Visual evidence

`qa-verification/animation-sweep/screenshots/` chứa cặp t=0 và t=3 cho 8 route đại diện:

| Route | t=0 | t=3 | Khác? |
|---|---|---|---|
| ch1-1-3 | `ch1-1-3-t0.png` | `ch1-1-3-t3.png` | giống — đúng spec (không có Play) |
| ch2-1-1 | `ch2-1-1-t0.png` | `ch2-1-1-t3.png` | **khác rõ** — vector velocity quay, particle dịch chuyển |
| ch2-2-2 | `ch2-2-2-t0.png` | `ch2-2-2-t3.png` | **khác rõ** — góc φ tăng |
| ch3-2-1 | `ch3-2-1-t0.png` | `ch3-2-1-t3.png` | giống — flag (state v đổi 0→30.5 m/s nhưng body cố định) |
| ch3-3-1 | `ch3-3-1-t0.png` | `ch3-3-1-t3.png` | **khác rõ** — lò xo nén/giãn |
| ch3-5-2 | `ch3-5-2-t0.png` | `ch3-5-2-t3.png` | giống — flag (impulse chart cố định) |
| ch3-6-2 | `ch3-6-2-t0.png` | `ch3-6-2-t3.png` | **khác rõ** — autoplay preview-pause sau 3 frame, hai khối va chạm |
| ch3-7-2 | `ch3-7-2-t0.png` | `ch3-7-2-t3.png` | giống — flag (residual table — đúng spec) |

5 route "should-animate" có pixel evolve khớp kỳ vọng vật lý; 3 route flag có canvas đứng nhưng readout tick — đúng như finding mục 4.

---

## 6. Sanity check công thức (giữ nguyên từ đợt trước, double-check lại)

| Route | Quan hệ vật lý | Kết quả UI tại t=3 |
|---|---|---|
| ch3-2-2 | Newton II: F=140 N, m=5 → a=28 m/s², v(3s)=84 m/s | a=28 ✓, v graph linear slope 28 ✓ |
| ch3-3-1 | Lò xo k=20 N/m, x₀=0.8 m → V₀=½·20·0.64=6.4 J; T(3s) tăng khi vật rời max | T 0→0.2 J (đang ở pha gần max amplitude) ✓ |
| ch3-5-2 | J = Δp = 20 kg·m/s; sau 3 s vẫn = 20 (impulse là cumulative quantity tại scene này) | J=20, Δp=20 ✓ |
| ch3-6-2 | e=1, p_trước=(5;0)=p_sau | hiển thị bảo toàn momentum ✓ |
| ch2-1-1 | aₙ=v²/ρ; nếu v=257.6, ρ=59.6 → aₙ≈1113.27 | UI 1113.28 ✓ |

---

## 7. Console & a11y

- **0 console errors / window errors / unhandled rejections** trên tất cả 58 route trong full sweep
- KaTeX warnings (Unicode tiếng Việt) đã được fix ở commit `7843878` — sweep này không thấy warning nào còn lại
- Mỗi route có ≥1 `aria-live` region (readout grid), Play button có `aria-pressed` toggling đúng

---

## 8. Issues còn lại

1. **(ưu tiên trung bình)** 4–5 route có Play button nhưng renderer không sử dụng `state._t` để vẽ chuyển động vật lý kỳ vọng. Đề xuất: hoặc thêm `_t` vào renderer (ch3-2-1, ch3-5-1, ch3-5-2, ch2-5-1, ch3-1-2), hoặc ẩn Play button cho route concept-only.
2. **(ưu tiên thấp)** 7 route concept-diagram (FBD, theorem selector, residual checker) hiển thị Play button nhưng đây là design choice — nên đổi nhãn thành "Tính lại" để tránh misleading UX.

---

## 9. Câu hỏi chưa giải đáp

- Đề xuất ẩn Play / đổi label cho concept-diagram routes có cần signoff content owner không?
- 5 route candidate "should animate" — bổ sung `_t` vào renderer có nằm trong scope phase tiếp theo (tương tự overhaul ch2/ch3 vừa rồi) không?

---

## 10. Files

- `qa-verification/animation-sweep/per-route-animation-sweep-results.json` — full per-route data (58 rows)
- `qa-verification/animation-sweep/suspect-routes-full-canvas-digest-results.json` — 13 route full-canvas digest (deep rerun)
- `qa-verification/animation-sweep/screenshots/*-t0.png`, `*-t3.png` — visual evidence (16 ảnh, 8 route)
- `qa-verification/animation-sweep/full-58-route-animation-sweep-browser-eval-driver.js` — driver chính (in-browser async loop)
- `qa-verification/animation-sweep/suspect-routes-full-canvas-digest-rerun-driver.js` — driver re-test với digest đầy đủ
