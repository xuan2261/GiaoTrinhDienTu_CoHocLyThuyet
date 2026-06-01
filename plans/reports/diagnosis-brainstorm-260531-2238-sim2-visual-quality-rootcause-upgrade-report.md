# Chẩn đoán + đề xuất nâng cấp visual 25 sim SVG-first

- Ngày: 2026-05-31 22:38
- Lệnh: `/ck-debug` (review/debug chất lượng visual) + `/ck:brainstorm` (đề xuất nâng cấp)
- Phạm vi: chẩn đoán **tại sao trông "đơn giản / không chuyên nghiệp"** + đề xuất; tham chiếu `DeCuong_CoHocLyThuyet.html` (user chỉ)
- Trạng thái: đã sửa 2 bug QA tooling (dev-only) để THẤY pixel thật; visual upgrade **chờ user duyệt — chưa code**

---

## 0. TL;DR (đính chính nhận định cũ)

Hai brainstorm report sáng nay (1657, 2122) + `claude-triage.json` đã **lỗi thời / sai**:
- Report 1657 ghi "chưa code" upgrade pilot → **SAI**: `setTheory()`+`addControls()` ĐÃ vào cả **25/25 sim** (verify `grep` + đọc source `ch1-1-3.js:58,71`). Pilot pro đã nhân ra hết.
- Triage cũ chấm "24/25 ok" → **dựa trên ảnh hỏng**. Pipeline capture có **2 bug** khiến ảnh không phản ánh diện mạo thật. Sau khi sửa, pixel thật lộ ra vấn đề khác hẳn.

Phân tầng đúng:
| Tầng | Trạng thái thật (verified) |
|---|---|
| Physics (công thức, vector hướng/độ lớn) | ✅ ĐÚNG (test verified-sticky + đọc pixel 7 sim) |
| Cấu trúc (panel + công thức tô màu + legend + readout + control) | ✅ CÓ ĐỦ (25/25) |
| **Polish thị giác** | ❌ **đây mới là thứ user than** — xem mục 2 |

---

## 1. Root cause #1 + #2 — pipeline QA "nói dối" (đã sửa)

**NO FIXES WITHOUT ROOT CAUSE** — đã truy 2 nguyên nhân khiến trước đó "chưa ai thấy pixel thật":

### Bug A — chụp nhầm vùng (`capture-sims.spec.js`)
- Chụp `#host .sim2-root` = **chỉ vùng SVG**. Panel ở `.sim2-stage` (cha), control gắn thẳng `container` (`sim-shell.js:57,203,219`).
- ⇒ Ảnh **cắt mất panel+legend+control**, ra file 1.9–4.5KB; cặp `init/live` byte-giống-hệt → tưởng "bấm ▶ không đổi".
- ⇒ Triage chỉ thấy viewport trần → chấm "ok", **bỏ sót đúng tầng trình bày user chê**.
- **Fix:** chụp toàn `#host` + nới host 960px trước mount.

### Bug B — fixture thiếu app CSS
- `tests/fixtures/sim2-ch{1,2,3}.html` chỉ nạp `katex.css`, KHÔNG nạp `css/style.css`.
- ⇒ Rule `.sim2-legend/swatch/stage/theory` (dòng 1869–1943) vắng → legend mất chấm màu, dính liền (`FF_xF_y`, `m₁m₂`); panel xếp DƯỚI thay vì cạnh.
- **Fix:** `page.addStyleTag({path: 'css/style.css'})` khi capture (dev-only, KHÔNG sửa fixture chia sẻ với mount-test).

Sau 2 fix: 58 ảnh 11–36KB, dynamic t0/mid/end khác nhau → pixel thật đáng tin. Contact-sheet đã build lại.

---

## 2. Root cause #3 — polish thị giác thật sự "đơn giản" (CHƯA sửa, chờ duyệt)

Đọc pixel thật 7 sim đại diện (ch1-1-3, ch1-1-8, ch2-1-1, ch2-2-2, ch2-4-4, ch3-5-4, ch3-6-2). Panel/công thức/legend/readout giờ ĐẸP & đúng chuẩn PhET. Nhưng **vùng vẽ** lộ rõ vì sao trông "amateur":

| # | Vấn đề | Bằng chứng pixel | Mức |
|---|---|---|---|
| V1 | **worldBox lệch nội dung → cảnh dồn nửa trên, nửa dưới CHẾT trống** | ch3-6-2 (2 bi ở 1/3 trên, dưới trống), ch3-5-4 (khối+trục dồn trên), ch1-1-8 (dầm giữa, trống lớn) | Cao |
| V2 | **Hình thể phẳng, mảnh, không chiều sâu** | khối ch3-5-4 = ô viền mảnh; bi ch3-6-2 = tròn phẳng; không gradient/đổ bóng | Cao |
| V3 | **Thiếu "chrome" thẻ** — không header (tên sim + badge §mục + icon), không nền vùng vẽ phân biệt | mọi sim mở thẳng vào SVG trần, khác hẳn DeCuong | Trung |
| V4 | **Lưới/nền vùng vẽ trơ** — chỉ 2 trục mảnh, nền trắng phẳng | so DeCuong có nền card + viền + tiêu đề | Trung |
| V5 | **5 sim chỉ 1 slider, control bar lệch trái, khoảng phải trống** | ch3-5-4, ch1-1-8 (1 slider P) | Thấp |

> **Đối chiếu `DeCuong_CoHocLyThuyet.html` (user chỉ — style cũ giàu hơn):** header `🔬 + badge "Tương tác/Animation"` + nút `🔄 Đặt lại`; card readout màu theo vai trò (f1 đỏ / f2 lam / result / angle); badge hero gradient theo chương (lam/lục/tím); canvas 760×440; dòng hint `💡`. → sim2 hiện **sạch nhưng tối giản hơn DeCuong** đúng như user cảm nhận.

---

## 3. Đề xuất nâng cấp (gộp DeCuong + PhET conventions)

Giữ nguyên ràng buộc: offline `file://`, **0 dependency**, KHÔNG đụng `physics/*`, giữ mount contract + `dispose()` sạch. Mọi nâng cấp ở **tầng chung** (`core/*` + `css/style.css`) → 25 sim cùng hưởng (DRY), per-sim chỉ chỉnh worldBox.

**Ưu tiên 1 — lấp dead-space + chiều sâu (giải V1, V2):**
1. Chuẩn `worldBox` ôm nội dung từng sim (loại trống thừa) — hoặc auto-fit `worldBox` theo bbox phần tử.
2. `svg-render`: thêm tùy chọn **gradient fill + soft drop-shadow** cho khối/bi/dầm; stroke dày + bo góc. Token hóa, dùng chung.
3. Nền vùng vẽ: **lưới mờ** (grid) thay vì 2 trục trơ → cảm giác "phòng thí nghiệm" + dễ ước lượng.

**Ưu tiên 2 — chrome thẻ chuẩn (giải V3, V4):**
4. `sim-shell`: header bar = tên sim + **badge §mục theo chương** (gradient lam/lục/tím như DeCuong) + nút ↺ luôn hiện.
5. Vùng vẽ có nền + viền bo + đổ bóng nhẹ (đã có `.sim2-root`, nâng cấp token).

**Ưu tiên 3 — vi chỉnh PhET (researcher report):**
6. `tabular-nums` + `min-width` mọi readout (chống nhảy số) — kiểm đã có chưa.
7. `prefers-reduced-motion`: init → start paused, tắt auto-advance.
8. Min vector stub 6px (vector gần 0 không biến mất).
9. 5 sim 1-slider: cân nhắc thêm tham số phụ HOẶC căn giữa control bar (giải V5).

**Cách triển khai:** pilot lại **2 sim** (1 tĩnh dead-space nặng `ch3-5-4` + 1 động `ch3-6-2`) cho user duyệt look mới → nhân ra 25 theo chương. Mở rộng `test:sim:mount` (header/grid tồn tại, dispose vẫn sạch). Chạy `test:sim:release` chốt không hồi quy.

---

## 4. Việc đã làm vs chờ duyệt

- ✅ **Đã làm (dev-only, reversible):** sửa 2 bug capture pipeline → chụp lại 58 ảnh thật → contact-sheet cập nhật. Không đụng runtime/physics.
- ⏸ **Chờ user duyệt:** toàn bộ mục 3 (visual upgrade). Theo yêu cầu chốt trước đó "chỉ lập danh sách lỗi, chưa sửa".

Xem ảnh: `plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals/contact-sheet.html` (25 route, 58 ảnh).

---

## Câu hỏi chưa giải quyết
1. **Mức "promax" tới đâu?** Bám sát DeCuong (gradient/card màu/icon 🔬💡) hay tinh giản chuẩn PhET (phẳng-sạch, ít nhiễu)? 2 triết lý hơi ngược nhau — cần user chọn hướng chủ đạo.
2. **worldBox:** chuẩn hóa tay từng sim (chắc, ~25 chỉnh nhỏ) hay viết auto-fit-bbox dùng chung (1 lần, rủi ro lệch vài sim cạnh đặc biệt)?
3. **Pilot 2 sim trước hay làm thẳng tầng chung rồi review cả 25?**
