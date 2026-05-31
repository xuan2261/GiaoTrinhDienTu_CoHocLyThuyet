# Brainstorm — Gỡ 52 mô phỏng, dựng lại 25 trên engine SVG-first mới

**Ngày:** 2026-05-31 · **Trạng thái:** Đã chốt, chờ duyệt → /ck:plan
**Nguồn:** tiếp nối `deXuatMoiNgay31Th5.txt` (2 phiên brainstorm trước)

---

## 1. Problem statement

Bộ 52 mô phỏng hiện tại: physics đã verify đúng (commit 6783b08) NHƯNG dàn trải, trùng lặp, defect visual/UX (nhãn chồng, readout lệch). User quyết: **gỡ sạch khỏi master**, **làm lại ~25 cái "ít mà tinh"** trên **engine mới hoàn toàn**, **build lần lượt theo chương**.

### Yêu cầu cụ thể (5 điểm HARD-GATE)

| # | Hạng mục | Cụ thể |
|---|---|---|
| 1 | **Expected output** | (a) 52 sim cũ gỡ khỏi master (giữ git tag archive); (b) 25 sim mới chạy trên engine SVG-first; (c) build theo thứ tự chương 1→2→3 |
| 2 | **Acceptance** | app chạy `file://` offline · 0 console error mọi route · test content/quiz xanh · mỗi sim physics đúng (port công thức đã verify, test Node) · **nhãn không bao giờ chồng** (DOM-based) |
| 3 | **Scope boundary** | Vòng này = chỉ design (brainstorm). Build = vòng sau. Trong build: đúng 25 sim. NGOÀI: hệ lực 3D §1.4, các loại gối lẻ, ma sát nghỉ/trượt/lăn rời, preset motion, thuận/ngược §3.4, va chạm xiên rời (gộp #25) |
| 4 | **Constraints** | `file://` offline · KHÔNG lib game-physics (matter.js sai chuẩn — xem §5) · route-id theo số mục · giữ hợp đồng mount `SIM_MAP[pageId]` · physics test được trong Node (không cần DOM) |
| 5 | **Touchpoints** | `index.html` (script tags 315–376) · `js/loader.js` (mount logic) · `js/sim-*.js` + `js/sims/` · `tests/*sim*` · `tools/*sim*` · `docs/` |

---

## 2. Quyết định đã chốt (qua 2 phiên + phiên này)

| Quyết định | Lựa chọn |
|---|---|
| Mức gỡ | **Tag + xóa sạch khỏi master** (`archive/52-sims-pre-removal`) |
| Lý do gỡ | Dàn trải/trùng lặp + visual/UX chưa đạt |
| Số lượng bộ mới | **~25** (10 tĩnh + 7 động học + 8 động lực) |
| Engine | **Xây mới** — kiến trúc SVG-first 3 tầng (§4) |
| Thứ tự build | **Lần lượt theo chương** 1→2→3 |
| Render layer | **SVG/DOM-first**, canvas underlay tùy chọn 3–4 sim |
| Route-id | **Theo số mục** (§1.1.3→`ch1-1-3`…) — giữ hợp đồng mount |
| Danh sách 25 | **Nguyên trạng** (§3) |

---

## 3. Danh sách 25 mô phỏng (đúng thứ tự build)

### Chương 1 — Tĩnh học (10) · route `ch1-*`
| # | Mô phỏng | Đề mục | Route-id |
|---|---|---|---|
| 1 | Véc tơ lực: điểm đặt, phương chiều, độ lớn | §1.1.3 | ch1-1-3 |
| 2 | Mô men lực & cánh tay đòn | §1.1.4 | ch1-1-4 |
| 3 | Thu gọn hệ lực phẳng → hợp lực + mô men | §1.1.5 | ch1-1-5 |
| 4 | Ngẫu lực & mô men ngẫu lực | §1.1.6 | ch1-1-6 |
| 5 | Hình bình hành lực (2 lực đồng quy) | §1.2.3 | ch1-2-3 |
| 6 | Phản lực liên kết + dựng FBD (gộp đổi loại gối) | §1.1.8/§1.2.6 | ch1-1-8 |
| 7 | Lực căng dây (ràng buộc 1 chiều) | §1.3.2 | ch1-3-2 |
| 8 | Phản lực & mô men ngàm khi tải đổi vị trí | §1.3.6 | ch1-3-6 |
| 9 | Nón ma sát trên mặt nghiêng | §1.5.3 | ch1-5-3 |
| 10 | Trọng tâm hình ghép / khoét | §1.6.3 | ch1-6-3 |

### Chương 2 — Động học (7) · route `ch2-*`
| # | Mô phỏng | Đề mục | Route-id |
|---|---|---|---|
| 11 | Quỹ đạo chất điểm + véc tơ v, a | §2.1.1 | ch2-1-1 |
| 12 | Tọa độ tự nhiên: tiếp/pháp tuyến + bán kính cong | §2.1.3 | ch2-1-3 |
| 13 | Quay quanh trục cố định (ω, α) | §2.2.2 | ch2-2-2 |
| 14 | Truyền động bánh răng – đai – puli | §2.3.2 | ch2-3-2 |
| 15 | Hợp chuyển động & gia tốc Coriolis | §2.4.4 | ch2-4-4 |
| 16 | Tâm vận tốc tức thời (IC) | §2.5.2 | ch2-5-2 |
| 17 | Phân bố vận tốc điểm trên vật rắn phẳng | §2.5.3 | ch2-5-3 |

### Chương 3 — Động lực học (8) · route `ch3-*`
| # | Mô phỏng | Đề mục | Route-id |
|---|---|---|---|
| 18 | Định luật II Newton F = m·a | §3.2.2 | ch3-2-2 |
| 19 | Định luật III: lực & phản lực | §3.2.3 | ch3-2-3 |
| 20 | Hệ quy chiếu quán tính vs phi quán tính | §3.1.3 | ch3-1-3 |
| 21 | Giải phương trình vi phân chuyển động (ODE) | §3.3.1 | ch3-3-1 |
| 22 | Định lý động lượng & xung lượng | §3.5.2 | ch3-5-2 |
| 23 | Bảo toàn mô men động lượng | §3.5.3 | ch3-5-3 |
| 24 | Định lý động năng (công–năng lượng) | §3.5.4 | ch3-5-4 |
| 25 | Va chạm với hệ số phục hồi e | §3.6.2 | ch3-6-2 |

**Cố ý KHÔNG làm (YAGNI):** hệ lực 3D §1.4 · gối lẻ §1.3.1/3/4/7 (gộp #6) · ma sát rời §1.5.2/§1.5.4 (giữ nón ma sát) · preset motion §2.1.4 · hợp CĐ setup §2.4.1-3 (giữ Coriolis) · Newton I §3.2.1 · FBD động §3.2.5 · ODE cơ hệ §3.3.2 · thuận/ngược §3.4 · định lý khối tâm §3.5.1 · va chạm xiên §3.6.3 (gộp #25).

---

## 4. Engine mới — kiến trúc 3 tầng (SVG-first)

```
┌─────────────────────────────────────────────┐
│ TƯƠNG TÁC: drag-handle = phần tử SVG,         │
│ pointer events DOM (không hit-test canvas)    │
├─────────────────────────────────────────────┤
│ RENDER (mặc định): SVG/DOM                    │
│   vector = <line>+marker · nhãn = <text>      │
│   readout = HTML overlay                      │
│   ↑ tất cả đặt qua 1 transform world→screen   │
├─────────────────────────────────────────────┤
│ CANVAS UNDERLAY (tùy chọn, 3–4 sim):          │
│   trail/field dày · cùng transform · sau SVG  │
├─────────────────────────────────────────────┤
│ PHYSICS: JS thuần, dạng đóng + RK4            │
│   (state, params) → derived · TEST TRONG NODE │
└─────────────────────────────────────────────┘
```

**Nguyên tắc cốt lõi:**
1. **1 phép biến đổi `world→screen` dùng chung** (scale + translate + flip-y) cho mọi tầng → canvas & SVG luôn khớp toạ độ.
2. **Nhãn LUÔN là DOM** → defect "nhãn chồng/readout lệch" của bộ cũ thành **bất khả về cấu trúc**, không phải "sửa cẩn thận".
3. **Physics tách rời render** → test rẻ trong Node (bảo toàn năng lượng/động lượng, so dạng đóng), tái dùng được.
4. **Canvas underlay chỉ bật** cho: #11 (vết quỹ đạo), #15 (Coriolis), #17 (trường vận tốc), #25 (vết va chạm). ~21 sim còn lại = SVG thuần, 0 đồng bộ.

**"Xây mới" hiểu đúng:** tầng **render + tương tác viết mới sạch**; tầng **physics PORT công thức đã verify** từ `sim-physics-*.js` (commit 6783b08) — tính đúng gắn vào *công thức*, không vào engine render. Cắt rủi ro re-verify, vẫn tôn trọng quyết định xây mới.

**Hợp đồng tích hợp duy nhất phải giữ:** `window.SIM_MAP[pageId] → sim factory`. `loader.js initSimulations()` giữ nguyên cơ chế, chỉ trỏ engine mới. 25 route-id mới ghi vào SIM_MAP.

---

## 5. Đã loại — căn cứ nghiên cứu

**matter.js / lib game-physics → LOẠI cho tầng physics.** Issue chính thức:
- #256: mất năng lượng dù đàn hồi hoàn toàn không ma sát → không bảo toàn năng lượng.
- #13: restitution=1.0 KHÔNG cho va chạm đàn hồi 100% → hệ số e sai chuẩn.
- #332: chỉ timestep 1/60s tính đúng → tích phân số không ổn định.

→ Game-physics là "trông hợp lý" không phải "đúng số". Môn Cơ Học Lý Thuyết cần đúng tuyệt đối → tự tính dạng đóng + RK4.

**Canvas 2D thuần → LOẠI làm mặc định.** Immediate-mode buộc tự tính toạ độ nhãn pixel bằng tay = đúng gốc defect cũ. Chỉ dùng làm underlay cho lớp vẽ dày.

---

## 6. Chiến lược gỡ 52 sim cũ (6 bước, mỗi bước verify được)

1. `git tag archive/52-sims-pre-removal` (+push) — chốt điểm quay đầu.
2. Gỡ mount: cắt script tags `index.html` + rút logic sim khỏi `loader.js` → app content-only. **Verify:** load route, 0 console error.
3. Xóa `js/sim-*.js` + `js/sims/` + `js/simulations.js`.
4. Xóa `tests/*sim*` + `tools/*sim*` + cắt npm `test:sim:*`.
5. Cập nhật README/docs + prune memory sim cũ.
6. **Verify cuối:** app mở offline, mọi route hiện nội dung, test còn lại (quiz, content, equation) xanh.

**Thuận lợi:** chapters HTML không nhúng markup sim (inject bằng JS) → gỡ không sửa từng file chương, text/quiz giữ nguyên.

---

## 7. Phân pha đề xuất cho /ck:plan

| Pha | Nội dung | Verify |
|---|---|---|
| **P0** | Tag + gỡ sạch 52 sim cũ (§6) | App content-only, 0 error, test còn lại xanh |
| **P1** | Scaffold engine: physics kernel + RK4 + transform world→screen + SVG render core + tích hợp SIM_MAP + harness test Node | 1 sim "hello" mount được, test Node chạy |
| **P2** | Chương 1 — 10 sim (#1–10) | Mỗi sim: physics Node test + mount + nhãn không chồng |
| **P3** | Chương 2 — 7 sim (#11–17), bật canvas underlay #11/#15/#17 | nt + đồng bộ canvas↔SVG đúng |
| **P4** | Chương 3 — 8 sim (#18–25), underlay #25 | nt |
| **P5** | Dọn/viết lại test harness cho 25 route + cập nhật docs | `test:sim:*` mới xanh, docs khớp |

---

## 8. Rủi ro & giảm thiểu

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Re-verify physics 25 cái tốn kém | Cao | Port công thức đã verify + test Node per-sim (bảo toàn E/p, so dạng đóng) |
| SVG chậm khi trail dày | TB | Canvas underlay cho 3–4 sim đó; SVG thuần phần còn lại |
| Đồng bộ toạ độ canvas↔SVG | TB | 1 hàm transform dùng chung, chỉ chạm 3–4 sim |
| Test harness cũ khóa "52 route" → CI đỏ khi gỡ | Cao | P0 dọn test đồng thời; P5 dựng harness 25 route mới |
| Mất id mapping page→sim | TB | Giữ quy ước id theo số mục; SIM_MAP cập nhật 25 id |

---

## 9. Success metrics

- 0 console error trên mọi route (offline `file://`).
- Mỗi sim: physics Node test pass (bảo toàn E/động lượng, khớp dạng đóng đã biết).
- Nhãn không chồng — kiểm bằng test bounding-box DOM.
- Mỗi sim minh hoạ điều hình tĩnh không làm được (tiêu chí "đặc sắc").
- 25/25 mount qua SIM_MAP, dispose sạch khi đổi route.

---

## 10. Unresolved questions

1. **Physics kernel** — port nguyên `sim-physics-*.js` cũ thành module Node-testable, hay viết lại theo công thức (giữ kết quả)? (khuyến nghị: port để giữ verified).
2. **Readout overlay** — HTML tuyệt đối định vị, hay `<foreignObject>` trong SVG? (ảnh hưởng cách đồng bộ — chốt ở P1).
3. **Test browser** — giữ Playwright cho 25 route, hay rút gọn còn Node physics + smoke mount? (cân chi phí bảo trì).
4. Có cần **archive thành nhánh** thay vì chỉ tag không? (tag đủ cho quay đầu; nhánh nếu muốn tiếp tục bảo trì bộ cũ song song).
