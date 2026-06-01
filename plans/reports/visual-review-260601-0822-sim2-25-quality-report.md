# Review visual thực tế 25 mô phỏng (sim2) — 2026-06-01

**Cách làm:** chụp lại 25 sim runtime thật (`npm run test:sim:visual:capture` → 58 PNG, toàn card + app CSS), đọc pixel từng ảnh ở trạng thái live/end. 0 console error / 0 pageerror khi mount cả 25.

## Kết luận tổng

**Physics + cấu trúc trình bày: ĐÚNG & ĐỦ 25/25.** Mọi sim có: công thức KaTeX tô màu khớp vector, legend chấm-màu, readout sống đúng số, control/playback. Nhãn KHÔNG chồng. Vector đúng hướng & đúng màu quy ước (đỏ=lực, lục=v, lam=a, tím=mô men/ràng buộc, cam=hợp lực). Depth chỉ áp cho vật thể đặc (khối/bi/đĩa/dầm), vector/trục/nét đứt giữ phẳng — đúng quy tắc Hybrid đã chốt.

Không tìm thấy lỗi render thật. Chỉ có 1 capture-artifact + 2 điểm polish nhỏ.

## Findings

### A1 — Tiêu đề card mờ ở cả 25 ảnh — CAPTURE ARTIFACT (không phải lỗi sim)
- **Hiện tượng:** tên sim (`.sim2-card-title`) hiện xám rất nhạt, gần chìm vào nền trắng.
- **Root cause (verified by CSS):** title dùng `color: var(--tx)`. Fixture không khai `data-theme` → áp `:root` = token **dark** (`--tx:#e8ecf1`, gần trắng — `css/style.css:10-17`). Capture lại ép `#host` nền trắng (`capture-sims.spec.js:69`). ⇒ chữ gần-trắng trên nền trắng.
- **Vì sao KHÔNG phải lỗi runtime:** app thật `index.html` mặc định `data-theme="dark"`, card nằm trên `.sim-mount{background:var(--nav2)}` = `#142e56` (dark) → title `#e8ecf1` tương phản cao, đọc rõ. Theme light cũng đọc rõ (`--tx:#1a1a2e` trên nền sáng). Tổ hợp "token dark + nền ép trắng" chỉ xảy ra trong harness.
- **Ảnh hưởng:** chỉ làm sai diện mạo ẢNH eval, không ảnh hưởng người học. Phụ: nút reset header (dùng `var(--nav2)`) cũng render màu dark trong ảnh — cùng nguyên nhân.
- **Mức:** thấp (chỉ là độ trung thực của pipeline). Confidence ~90%.

### A2 — ch2-1-3 vòng mật tiếp bị cắt mép dưới viewport
- Vòng tròn mật tiếp (tím) ở shot live tràn xuống dưới khung play-area → mất ~1/5 cung dưới.
- Không sai vật lý (tâm + bán kính đúng theo readout R), chỉ là framing: worldBox chưa chừa biên cho vòng lớn nhất khi điểm chạy tới vị trí bán kính cong cực đại.
- **Mức:** thấp–trung. Là sim TĨNH (kéo điểm) nên co/đệm worldBox an toàn, không lo clip quỹ đạo động.

### A3 — ch2-2-2 / ch2-4-4 đĩa tím to & bão hòa cao (gu thị giác)
- Đĩa quay (tím chương 3-palette… thực ra ch2 dùng tím cho vật quay) gần kín khung, độ bão hòa mạnh, hơi "nặng" mắt so với phần còn lại của bộ.
- Không phải defect (gradient+depth đúng quy tắc vật thể đặc). Chỉ là cân nhắc giảm bán kính ~10% hoặc hạ saturation cho nhẹ.
- **Mức:** thấp (chủ quan, chờ user duyệt mắt).

### A4 — ch3-1-3 nền toa xe (điểm tồn từ session trước)
- Trước nhạt gần như vô hình; nay là khối xám trung tính đặc, viền rõ. Trông ổn, trung tính, không chìm.
- **Trạng thái:** coi như đã giải quyết, chỉ cần user xác nhận gu.

## Đề xuất (chờ user duyệt — CHƯA sửa gì)

1. **A1 (artifact):** sửa harness — thêm `data-theme="light"` (hoặc set token light) lên `<html>` fixture trong `capture-sims.spec.js` để ảnh eval khớp runtime. KHÔNG động vào sim/CSS. Sau đó chụp lại để con số "diện mạo" đáng tin 100%.
2. **A2 (clip):** thêm đệm worldBox cho ch2-1-3 (chỉ sim này, sim tĩnh) để chứa trọn vòng mật tiếp lớn nhất.
3. **A3 (gu):** tùy chọn — giảm kích thước/saturation đĩa ch2-2-2, ch2-4-4.

## ĐÃ XỬ LÝ (2026-06-01, user duyệt A1+A2+A3, A4 giữ nguyên)

- **A1 ✓** `capture-sims.spec.js`: set `documentElement data-theme=light` trước mount (dev-only, không sửa fixture chia sẻ). Ảnh chụp lại: tiêu đề card đậm, đọc rõ; slider track đúng màu. Khớp runtime.
- **A2 ✓** `ch2-1-3.js`: worldBox `minY:-4 → -5.5`. Vòng mật tiếp nằm trọn viewport, hết cắt mép.
- **A3 ✓** `ch2-2-2.js` (`±4→±4.6`) + `ch2-4-4.js` (`±5→±5.6`): đĩa còn ~65–71% khung, nhẹ mắt; giữ depth gradient. Chỉnh qua worldBox (không đổi hex → an toàn guard palette).
- **Verify:** `test:sim:release` xanh (88 mount + physics + content + quiz); chụp lại 25/25, 0 console error; soi mắt 4 ảnh xác nhận.

## Unresolved questions
- A3/A4 là quyết định gu — cần user soi mắt contact-sheet rồi chốt giữ/sửa.
- A1: có muốn sửa harness rồi chụp lại để đóng dấu "25/25 sạch" trên ảnh trung thực không?
