# Báo cáo đánh giá visual + chất lượng thực tế — 25 sim SVG-first

- Ngày: 2026-05-31 · Plan: `260531-2122-sim2-visual-quality-eval-pipeline`
- Pipeline: Playwright chụp ảnh thật (`.sim2-root`) → Claude soi lỗi thô (Read PNG) → contact-sheet → user duyệt mắt.
- **CHỈ đánh giá, KHÔNG sửa sim.** Cờ Claude là gợi ý giảm tải; **user là trọng tài cuối.**
- Xem lưới ảnh: `../visuals/contact-sheet.html` (mở browser, offline). Ảnh gốc: `../visuals/<route>__<label>.png`.

## Tổng quan

| Chỉ số | Giá trị |
|---|---|
| Route phủ ảnh | 25/25 (100%) |
| Tổng ảnh | 58 (17 sim tĩnh × 2 + 8 sim động × 3) |
| Phân loại runtime | 17 tĩnh · 8 động (detect `.sim2-playback`, không hardcode) |
| Cờ Claude `high` (nặng) | 0 |
| Cờ Claude `low` (nhẹ) | 1 (ch2-3-2 — nuance nội dung, không phải lỗi render) |
| Cờ `ok` (đạt) | 24 |

**Kết luận thô (Claude):** không ảnh trắng/đen, véc tơ đúng hướng/độ dài hợp lý, nhãn không tràn khung, sim động tua frame thật (step deterministic — t0≠end ở mọi route động, 0 wrap-around). **Không phát hiện lỗi render trên cả 25 route.** Một ghi chú nội dung (không phải lỗi) ở ch2-3-2.

## Sim động — xác nhận animation chạy thật (t0 → end)

| Route | §mục | Quan sát t0 → end | Mức | Nguồn |
|---|---|---|---|---|
| ch2-1-1 | 1.1 | Gốc (v↑) → parabola đầy + v tiếp tuyến + a hướng tâm (ném xiên đúng) | đạt | Claude |
| ch2-2-2 | 2.2 | Bán kính quay tiến góc; chỉ dấu ω | đạt | Claude |
| ch2-3-2 | 3.2 | 2 bánh răng ăn khớp Z₁/Z₂ tiếp xúc, nan hoa quay **ngược chiều** (ω₂=-ω₁·r₁/r₂) | đạt¹ | Claude |
| ch2-4-4 | 4.4 | v_rel + a_cor vuông góc + quỹ đạo xoắn trong HQC quay | đạt | Claude |
| ch3-2-2 | 2.2 | Khối m + lực F + nhãn v(t); khối tiến | đạt | Claude |
| ch3-3-1 | 3.1 | Lò xo-khối m + đồ thị x(t) dao động dựng dần | đạt | Claude |
| ch3-5-3 | 5.3 | Thanh 2 đầu quay quanh O | đạt | Claude |
| ch3-6-2 | 6.2 | m₁/m₂ tách rời → dồn giữa + vết trail (va chạm) | đạt | Claude |

> ¹ ch2-3-2: ban đầu nghi "thiếu dây đai" từ ảnh, nhưng **verify source** (`js/sim2/sims/ch2/ch2-3-2.js:19,38`) cho thấy đây là mô hình **bánh răng ăn khớp** (2 đường tròn tiếp xúc `C2=C1+r₁+r₂`, quay ngược chiều `ω₂=-ω₁·r₁/r₂`) — KHÔNG vẽ đai là chủ ý đúng. Không phải lỗi render.

## Sim tĩnh — init + live

| Route | §mục | Quan sát | Mức | Nguồn |
|---|---|---|---|---|
| ch1-1-3 | 1.3 | Véc tơ F từ O, mũi tên + nhãn + đường gióng | đạt | Claude |
| ch1-1-4 | 1.4 | Pivot O, F vuông góc, cánh tay đòn d | đạt | Claude |
| ch1-1-5 | 1.5 | F1/F2 + hợp lực R từ gốc | đạt | Claude |
| ch1-1-6 | 1.6 | Cặp F/F' ngược chiều, d dashed | đạt | Claude |
| ch1-2-3 | 2.3 | F1/F2/R + cạnh dashed hình bình hành | đạt | Claude |
| ch1-1-8 | 1.8 | Dầm A-B, 2 gối, P↓, R_A/R_B↑ | đạt | Claude |
| ch1-3-2 | 3.2 | T₁/T₂ + trọng lượng W↓ | đạt | Claude |
| ch1-3-6 | 3.6 | Ngàm + R↑ + M + P↓ | đạt | Claude |
| ch1-5-3 | 5.3 | Mặt nghiêng β + khối + trạng thái CÂN BẰNG | đạt | Claude |
| ch1-6-3 | 6.3 | Hình + lỗ khoét, trọng tâm C dời đúng phía | đạt | Claude |
| ch2-1-3 | 1.3 | Ellipse + đường tròn mật tiếp + τ/n vuông góc | đạt | Claude |
| ch2-5-2 | 5.2 | Trường véc tơ vận tốc xoay quanh P(IC) + M | đạt | Claude |
| ch2-5-3 | 5.3 | P(IC) + A-B, v_A/v_B vuông góc bán kính từ IC | đạt | Claude |
| ch3-2-3 | 2.3 | A/B với F_BA, F_AB ngược chiều cùng độ lớn | đạt | Claude |
| ch3-1-3 | 1.3 | Toa gia tốc a + lực quán tính F*qt | đạt | Claude |
| ch3-5-2 | 5.2 | Khối + F + đồ thị p(t) tăng theo thời gian | đạt | Claude |
| ch3-5-4 | 5.4 | Khối + F + quãng đường d (công W=F·d) | đạt | Claude |

## Danh sách lỗi cần xử lý (phiên sửa sau — ngoài plan này)

**Claude không phát hiện lỗi render nào trên 25 route.** Một ghi chú nội dung (mức nhẹ, không bắt buộc sửa):

| # | Route | §mục | Ghi chú | Mức | Ảnh kèm | Nguồn |
|---|---|---|---|---|---|---|
| 1 | ch2-3-2 | 3.2 | Render đúng (bánh răng ăn khớp). Tiêu đề/observe nhắc "đai/puli" nhưng sim chỉ minh hoạ ca ăn khớp — user cân nhắc có cần bổ sung ca truyền đai (cùng chiều) riêng hay chỉnh wording | nhẹ (nội dung) | `ch2-3-2__t0.png`, `ch2-3-2__end.png` | Claude |

> Phần "do user duyệt mắt bổ sung" để trống — chờ user soi `contact-sheet.html` và đánh dấu. Lỗi user phát hiện sẽ thêm vào bảng này với cột Nguồn = **user**.

## Phương pháp & độ tin cậy

- Claude soi ở mức **thô** (canvas trắng/đen, hướng véc tơ, nhãn tràn, sim động đứng yên). KHÔNG kết luận đúng/sai sư phạm tinh vi.
- Ảnh chụp đúng vùng `.sim2-root` (không cả viewport). Sim động tua bằng nút step `⏭` deterministic (`dt=1/60`), mốc mặc định N1=60/N2=120.
- Lỗi tinh vi (tỉ lệ, thẩm mỹ, đúng sư phạm) → **vai trò user ở bước duyệt mắt**.

## Bước tiếp theo

1. User mở `../visuals/contact-sheet.html` duyệt mắt → bổ sung lỗi vào bảng (Nguồn=user).
2. Phiên sau (ngoài plan này): `/ck:plan` sửa lỗi theo báo cáo. Ưu tiên xác nhận/ vẽ rõ dây đai ch2-3-2.
3. Sau khi sửa xong cân nhắc chốt baseline `toHaveScreenshot` để bắt hồi quy visual tự động.

## Lệnh chạy lại pipeline

```
npm run test:sim:visual:capture          # chụp 25 route → visuals/*.png + capture-manifest.json
node tools/sim2-visual/build-contact-sheet.js   # → visuals/contact-sheet.html (merge claude-triage.json nếu có)
```

## Câu hỏi mở

- ch2-3-2: render đã verify đúng (bánh răng ăn khớp). Câu hỏi nội dung cho user: có muốn bổ sung minh hoạ ca **truyền đai** (puli, quay cùng chiều) tách biệt với ca ăn khớp, hay chỉ chỉnh wording tiêu đề/observe? — quyết định sư phạm, không phải lỗi kỹ thuật.
