# Brainstorm — Nâng cấp 25 mô phỏng SVG-first: pro · trực quan · sinh động · gắn lý thuyết

- Ngày: 2026-05-31
- Phạm vi: nâng cấp diện mạo + trải nghiệm + tính sư phạm cho **25 sim hiện có** tại `js/sim2/` (KHÔNG dựng lại)
- Trạng thái: design đã trình, user duyệt qua các câu hỏi chốt; chưa code

## 1. Vấn đề & yêu cầu

25 sim đã dựng xong trên engine SVG-first (physics verified-sticky), nhưng tầng trình bày còn thô:

- Sim animation hardcode tham số (Coriolis `omega/vRel`, va chạm `e/m₁/m₂`, ODE…) — comment ghi "slider đổi…" nhưng KHÔNG có slider/play/pause/reset.
- Màu hex rải rác inline mỗi sim (`#2a7`, `#e57`, `#c30`…), không token thống nhất, không legend giải nghĩa màu vector.
- Chưa gắn lý thuyết: không công thức điều hành (dù KaTeX có sẵn), không chú thích khái niệm, không gợi ý "quan sát gì".
- Card/nhãn/header tối giản; drag handle affordance yếu.

### Yêu cầu chốt (user)
- Ưu tiên: **cả 4 mặt** — Tương tác · Gắn lý thuyết · Thẩm mỹ visual · Affordance UX.
- Mức tương tác: **đầy đủ cho mọi sim** (slider tham số chính + play/pause/reset), **cho phép control bespoke** ở ~3-5 sim mà tham số là hình học (slider gượng).
- Phong cách: tin đề xuất của tôi (chuẩn sim giáo dục: rõ, ít nhiễu, tương phản tốt).
- Triển khai: **pilot trước** — `ch1-1-3` (tĩnh) + `ch3-6-2` (động) — rồi nhân ra 25.

### Ràng buộc bất biến (non-negotiable)
- Chạy offline `file://`, **0 dependency mới**.
- **Không đụng physics đã verify** (`js/sim2/physics/*`).
- Giữ mount contract `window.SIM_MAP[pageId] → factory(container) → { dispose }`.
- Giữ route-id cũ (`ch1-1-3`…) — hợp đồng tích hợp duy nhất với `loader.js`.
- `dispose()` phải vẫn gỡ sạch listener + RAF + DOM (test:sim:mount khóa điều này).

## 2. Các hướng đã cân nhắc

| Hướng | Được | Mất | Chọn |
|---|---|---|---|
| **A. Mở rộng shell chung** | Nhất quán, sim chỉ *khai báo* control/lý thuyết qua helper (đúng style `addHandle`/`onFrame`); 25 sim cùng hưởng (DRY); pilot nhanh | Phải thiết kế API đủ tổng quát | ✅ |
| B. Mỗi sim tự dựng UI | Tự do tối đa | Phá DRY, 25× công, lệch nhau | ✗ |
| C. Rewrite declarative/config | Sạch nhất lâu dài | Rewrite lớn, rủi ro đứt dây physics đã verify | ✗ |

## 3. Giải pháp khuyến nghị

### 3.1 Bố cục mới
- Card = header (tên + badge §mục) · viewport · panel lý thuyết (cạnh khi rộng, xếp dưới + thu gọn khi hẹp) · control bar (dưới cùng).
- **Readout gộp vào panel lý thuyết**: công thức tĩnh (KaTeX) ở trên + giá trị sống cập nhật mỗi frame ở dưới → "công thức này, số đang thế này".
- **Legend màu** + **dòng "Quan sát"** ngay dưới viewport.
- **Control bar tách RIÊNG viewport** → `pointer-events` slider không đụng drag SVG.

### 3.2 Bảng màu token (CSS `--sim-c-*` + JS `Sim2Palette`)

| Ý nghĩa | Màu | Dùng |
|---|---|---|
| Vector chính | teal `#0d9488` | F, R |
| Thành phần X | rose `#e11d48` | Fₓ, vₓ |
| Thành phần Y | blue `#2563eb` | Fᵧ, vᵧ |
| Vận tốc | green `#16a34a` | v |
| Gia tốc | orange `#ea580c` | a, aₜ, aₙ |
| Mô men/xoắn | violet `#7c3aed` | M, ω, α |
| Coriolis | amber `#d97706` | a_cor |
| Phản lực/ràng buộc | slate `#475569` | N, T, ngàm |
| Handle kéo | coral `#ff7043` | điểm kéo |
| Trục/lưới | `#cbd5e1` / `#e2e8f0` | nền |

Readout dùng `font-variant-numeric: tabular-nums` (số không nhảy bề rộng).

### 3.3 Component chung cần thêm
1. `core/controls.js` — `Sim2Controls`: hàng slider + nút ▶/⏸/↺; mỗi slider `{id,label,min,max,step,value,unit,onInput}`; auto-register cleanup vào shell.
2. `core/panel.js` — panel lý thuyết: công thức KaTeX (tái dùng guard `window.katex`) + readout sống + legend chips + dòng quan sát.
3. `core/sim-shell.js` — mở rộng: compose header+viewport+panel+control bar; tính lại `screenBox` khi có panel cạnh (worldBox giữ nguyên); responsive stack khi hẹp; gọi `overlay.reflow()` sau đổi layout.
4. `core/palette.js` (hoặc hằng trong shell) — `Sim2Palette` cho SVG stroke tham chiếu.
5. `css/style.css` — token màu + `.sim2-controls/.sim2-theory/.sim2-legend/.sim2-observe` + affordance (`cursor:grab` + halo handle hover).

Mỗi sim chỉ thêm ~10-15 dòng *khai báo*; **không đụng physics**.

### 3.4 Pilot (phủ hết component mới)
- **`ch1-1-3`** (Véc tơ lực, tĩnh): drag + slider F,α + panel lý thuyết + legend + readout-gộp + affordance.
- **`ch3-6-2`** (Va chạm e, động): play/pause/reset + slider e,m₁,m₂ + đồng bộ canvas↔SVG + story "kéo e: đàn hồi↔mềm"; payoff sư phạm cao (bảo toàn p, mất T đúng phần).

## 4. Rủi ro & lưu ý (brutal honesty)

1. **"Slider mọi sim" — ~3-5 sim hình-học sẽ gượng** (trọng tâm ghép/khoét §1.6.3, đổi loại gối §1.1.8). User đã duyệt: **cho phép control bespoke** (nút chọn loại gối, kéo đỉnh hình) thay vì ép slider — vẫn đạt "tương tác đầy đủ" nhưng đúng ngữ cảnh.
2. **Test harness phải mở rộng**: `test:sim:mount` thêm assert (controls tồn tại + dispose vẫn sạch listener slider). Không phá case cũ.
3. **Viewport co lại khi có panel cạnh**: tính lại `screenBox` trong shell; dùng `reflow()` định vị lại nhãn. World→screen contract giữ nguyên (test transform round-trip không đổi).
4. **Công nhân ra 25 vẫn per-sim** (~25 edit nhỏ, cơ học nhờ tầng chung) — không zero. Estimate trung thực.
5. **KaTeX có thể vắng** (offline fallback): panel lý thuyết phải degrade về text khi `window.katex` undefined (đã có tiền lệ trong `overlay.readoutCard`).

## 5. Success metrics / tiêu chí done
- Pilot 2 sim đạt look&feel user duyệt; component chung tái dùng được.
- `npm run test:sim:release` xanh (physics + mount + content + quiz) — không hồi quy.
- `dispose()` gỡ sạch (kể cả listener slider) — assert trong test:sim:mount.
- 25 sim dùng chung token màu + có legend + panel lý thuyết + control phù hợp ngữ cảnh.
- Chạy được offline `file://`, 0 dependency mới.

## 6. Bước kế tiếp & phụ thuộc
1. Plan (đề nghị `--tdd` vì sửa code đã verify + có test coverage cần giữ): thiết kế API 3 module core + CSS token, viết/ mở rộng test trước, rồi pilot 2 sim.
2. User duyệt pilot → nhân ra 25 theo chương (Ch1 → Ch2 → Ch3), mỗi chương 1 mốc duyệt.
3. Cập nhật `docs/` (design-guidelines, codebase-summary) + README mục Mô phỏng.

## Câu hỏi chưa giải quyết
- Pilot xong, nếu nhóm sim hình-học cần >1 kiểu control bespoke (nút vs kéo đỉnh), có cần chuẩn hóa thành 1-2 mẫu dùng lại hay để mỗi sim tự do? (đề nghị chốt sau pilot)
- Panel lý thuyết: hiển thị mặc định mở hay thu gọn ở khung hẹp/nhúng? (đề nghị: mở ở rộng, thu gọn ở hẹp — xác nhận khi pilot)
