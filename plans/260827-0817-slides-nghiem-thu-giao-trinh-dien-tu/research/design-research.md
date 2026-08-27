# Nghiên cứu art direction — slide nghiệm thu giáo trình điện tử

## Phạm vi và bằng chứng quan sát
- Mục đích: deck 16:9 phục vụ hội đồng khoa học của Khoa Kỹ thuật cơ sở, Học viện Hải quân; giọng điệu học thuật, kiểm chứng được, không quảng bá.
- `docs/design-guidelines.md` khóa ngôn ngữ navy–gold, nền tối `#091A33`, các lớp navy `#0D2447`/`#142E56`, gold `#C9963A`/`#DBB36A`, motion nhẹ và reduced-motion.
- Contact sheet `plans/260820-0639-vit-li-phn-quy-cch-thnh-bo-co-np-chnh-thc/evidence/option-b-contact-sheet-195caea3.png` cho thấy hai loại bằng chứng thật: trang báo cáo trắng, dày chữ và capture ứng viên nền navy. Deck phải nối hai thế giới này, không biến thành brochure.
- Sim2 `.../628374fb-f0b9-4c4a-bf98-1a4511926ef6/ch2-3-2__end.png` dùng graph-paper sáng, công thức/readout cạnh mô hình và màu đại lượng có nghĩa; nên đưa capture thật thay vì dựng lại minh họa giả.
- Sim3 `.../11cc011a-a152-4d31-9d2c-12bd1ffa75b3/ch1-1-5-sim3.png` có canvas trắng thưa, vật thể 3D và thẻ công thức; chỉ dùng khi chiều sâu giải thích vật lý.
- Figure thật `release/2026.08.25-candidate/package/images/ch1/hinh-100.png` có nhãn/vec-tơ nhiều màu; không recolor, không cắt mất nhãn. Không tìm thấy asset logo/crest/emblem trong repo: tuyệt đối không tự dựng dấu hiệu nhận diện.

## So sánh ba hướng
| Hướng | Cấu trúc | Điểm mạnh | Rủi ro | Kết luận |
|---|---|---|---|---|
| A. Hồ sơ Hải quân | Navy sâu cho bìa/chia chương; nền giấy sáng cho bằng chứng; gold chỉ làm rule/locator | Trang trọng, bám UI thật, chiếu phòng họp rõ, chuyển mạch “luận điểm → bằng chứng” mạnh | Dùng quá nhiều navy sẽ nặng; gold dễ bị lạm dụng | **Chọn** |
| B. Kỷ yếu khoa học | 90% nền trắng, navy cho đầu trang/bảng, Georgia như tạp chí | Dễ đọc, gần báo cáo nghiệm thu, in PDF tốt | Ít khác biệt với tài liệu Word; capture navy bị rời hệ | Phương án dự phòng khi ưu tiên in |
| C. Bảng điều khiển kỹ thuật | Nền navy toàn bộ, module số liệu và capture dạng console | Gần candidate UI; hữu ích cho slide kiến trúc/QA | Dễ thành dashboard, chữ nhỏ, “tech demo”, tương phản gold bị phô | Chỉ dùng một archetype kỹ thuật |

## Khuyến nghị: A — “Hồ sơ Hải quân”
- Tỷ lệ nền toàn deck: 65–75% paper/white, 25–35% navy; navy dành cho bìa, divider, kết luận và rail tiêu đề.
- Nguyên tắc hình thức: kỷ luật tài liệu; đường thẳng, khoảng trắng, số mục rõ; không dùng họa tiết quân sự để tạo “khí chất”.
- Mỗi slide trả lời một câu hỏi hội đồng; tiêu đề là kết luận kiểm chứng được, không phải slogan.

## Token màu
| Token | Hex | Dùng |
|---|---|---|
| `navy-950` | `#07182F` | Bìa/divider, chữ chính trên nền sáng |
| `navy-900` | `#091A33` | Nền institutional canonical |
| `navy-800` | `#0D2447` | Rail, header bảng, panel kỹ thuật |
| `navy-700` | `#15355F` | Selected state/đường chính |
| `paper-50` | `#F7F5EF` | Nền nội dung ấm, tránh trắng chói |
| `white` | `#FFFFFF` | Card bằng chứng, chữ trên navy |
| `ink-800` | `#243247` | Body trên paper |
| `slate-600` | `#5B6B80` | Chú thích/metadata trên paper |
| `gold-600` | `#C9963A` | Rule, số mục, keyline; chữ chỉ trên navy |
| `gold-400` | `#DBB36A` | Điểm nhấn trên navy, không dùng làm body |
| `line-200` | `#D7DEE8` | Grid/border |
| `success` | `#137A3D` | Đạt, luôn kèm chữ/biểu tượng |
| `warning` | `#9A5B00` | Cần theo dõi, luôn kèm chữ |
| `danger` | `#B42318` | Không đạt/rủi ro, luôn kèm chữ |
- Cặp kiểm tra: white/navy-950 `17.79:1`; paper/navy-950 `16.31:1`; gold-600/navy-950 `6.70:1`; ink-800/paper `11.87:1`; slate-600/paper `4.99:1`.
- Gold trên white chỉ `~3:1`: không dùng cho chữ nhỏ, trục, số liệu hoặc series chính.
- Màu cơ học giữ canonical: lực `#E03030`, vận tốc `#159C3A`, gia tốc `#0074D9`, hợp lực `#E06A00`, phản lực `#B10DC9`, mô men `#7C3AED`, trục `#64748B`, lưới `#CBD5E1`.

## Typography
- Font duy nhất: `Georgia` cho display/heading; `Arial` cho body, bảng, nhãn, số; không tải font ngoài.
- Scale trên canvas 720 × 405 pt: cover `Georgia 34/39`; divider `30/35`; slide title `24/29`; subhead `Arial 16/20, 700`; body `Arial 15/21`; table/chart `12/16`; caption/source `10.5/14`; metric `Arial 34–44/1.0, 700`.
- Không xuống dưới 10.5 pt; bảng dày phải tách slide hoặc đưa phụ lục, không ép chữ.
- Tiêu đề tối đa 2 dòng; body tối đa 6 dòng mỗi block; câu đầy đủ, sentence case; không viết hoa toàn bộ trừ mã ngắn.
- Số dùng tabular figures nếu PowerPoint hỗ trợ; dấu thập phân, đơn vị và ký hiệu vật lý nhất quán với nguồn.

## Grid và nhịp
- Canvas `720 × 405 pt` (16:9); safe area trái/phải `36 pt`, trên `30 pt`, dưới `30 pt`.
- Grid 12 cột trong vùng rộng `648 pt`; gutter `12 pt`; mỗi cột `43 pt`; baseline `6 pt`.
- Vùng dọc chuẩn: title band `54 pt`, content `267 pt`, footer `18 pt`; khoảng title–content `12 pt`.
- Bố cục ưu tiên `7/5` cho luận điểm + bằng chứng hoặc `5/7` cho capture + diễn giải; full-bleed chỉ ở divider.
- Footer: mã mục bên trái, nguồn/candidate ID giữa, số slide bên phải; không đặt tên học viện giả dạng wordmark.
- Border `1 pt`; rule nhấn `2 pt`; corner radius tối đa `4 pt`; không shadow trừ ảnh cần tách khỏi paper (`0 2 8`, 12% navy).

## Archetype slide
1. **Bìa:** navy-950, title Georgia, rule gold 2 pt, tên đơn vị dạng text; không logo nếu chưa có file chính thức.
2. **Chương/section:** số mục lớn, một câu hỏi nghiệm thu, tối đa ba tiêu chí; không ảnh nền.
3. **Tóm tắt quyết định:** 3–5 kết luận, trạng thái chữ + shape; một hàng “giới hạn hiện tại”.
4. **Bằng chứng ứng viên:** capture thật chiếm 7 cột; rail 5 cột ghi phát hiện, ID nguồn, trạng thái review; callout đánh số 1–3.
5. **Kiến trúc/quy trình:** sơ đồ trái→phải, tối đa 5 node chính; đường trực giao, không icon trang trí.
6. **Số liệu/QA:** một chart hoặc một ma trận; headline là kết quả, dưới có mẫu số/phạm vi/thời điểm.
7. **Rủi ro và giới hạn:** bảng `Vấn đề–Bằng chứng–Tác động–Xử lý`; không tô đỏ cả hàng.
8. **Kết luận/đề nghị hội đồng:** quyết định cần lấy, điều kiện đi kèm, đầu mối/tài liệu tham chiếu; không CTA marketing.

## Data visualization
- Một biểu đồ = một câu hỏi; ghi rõ mẫu số, đơn vị, kỳ đo và trạng thái `đã chạy/chưa chạy/bị chặn`.
- Bar luôn có baseline 0; line chỉ dùng khi có trục thời gian; dot plot ưu tiên cho so sánh ít hạng mục; không pie/donut, gauge, 3D chart.
- Tối đa 5 series; direct label thay legend khi có thể; grid `#D7DEE8` 0.75 pt; axis/label `#243247`.
- Navy là series chính; slate là đối chứng; gold chỉ highlight một điểm; success/warning/danger dành cho trạng thái, không thay màu đại lượng cơ học.
- Không chỉ mã hóa bằng màu: thêm nhãn, ký hiệu, hatch hoặc shape; mọi tỷ lệ phải hiện cả tử/mẫu, ví dụ `25/25`.
- Không suy diễn “đạt nghiệm thu” từ gate kỹ thuật; dùng đúng mức bằng chứng: provisional, review pending, blocked hoặc confirmed.

## Xử lý ảnh và capture
- Chỉ dùng capture/figure thật từ repo hoặc phiên chạy có provenance; ghi path/ID và ngày candidate trong caption.
- Giữ màu UI và tỷ lệ ảnh gốc; crop theo vùng nhiệm vụ, không giả browser/device frame, không ghép màn hình không tồn tại.
- Capture đặt trên white, keyline navy 1 pt; zoom vùng nhỏ bằng inset nối đường thẳng, không kính lúp/spotlight glow.
- Figure cơ học không cắt trục, mũi tên, contact point, công thức hoặc nhãn; không recolor để “đồng bộ thương hiệu”.
- Ảnh độ phân giải thấp: hiển thị 1:1 hoặc nhỏ hơn; không upscale bằng AI, không sharpen quá mức.
- Không dùng ảnh tàu chiến, quân phục, mỏ neo, radar, cờ, sóng biển hoặc texture kim loại chỉ để trang trí.

## Motion và accessibility
- Mặc định không transition; nếu cần điều hướng section, chỉ `Fade 0.20–0.30 s` toàn slide. Không object fly-in, morph, parallax, autoplay GIF/video.
- Với nội dung tuần tự, dùng slide duplicate tĩnh; cung cấp bản reduced-motion/PDF có cùng thông tin.
- Reading order: title → luận điểm → bằng chứng → caption/source → footer; thiết lập language `vi-VN`, alt text và speaker notes cho figure/chart.
- Kiểm ở projector giả lập và grayscale: tương phản text ≥ `4.5:1`, text lớn/shape thiết yếu ≥ `3:1`; không dựa vào màu.
- Kiểm 100% và chế độ trình chiếu: không tràn/cắt, công thức đọc được, nhãn chart ≥12 pt, caption ≥10.5 pt.
- Bảng/diagram phải hiểu được ở khoảng cách phòng họp; chi tiết vượt ngưỡng chuyển sang phụ lục, không thu nhỏ.

## Anti-AI-slop gate
- Cấm gradient xanh–tím, glow/neon, glassmorphism, blob, mesh, particle, pseudo-HUD, nền mạch điện và icon 3D.
- Cấm invented logo/crest/seal, monogram “HVHQ”, huy hiệu, ribbon và biểu trưng quân sự tự tạo.
- Cấm stock/synthetic người, ảnh “lãnh đạo bắt tay”, tàu chiến/đại dương trang trí và ảnh AI minh họa cơ học.
- Cấm bố cục card đồng đều 3×2 vô cớ, pill ở mọi nơi, emoji, icon lẫn style, đường cong trang trí và quote mark khổng lồ.
- Cấm headline kiểu quảng cáo: “đột phá”, “cách mạng”, “đẳng cấp”, “trải nghiệm vượt trội”, “tương lai giáo dục”.
- Mỗi chi tiết phải có vai trò: hierarchy, định vị, trạng thái, quan hệ hoặc bằng chứng; nếu bỏ không mất nghĩa thì bỏ.
- Gate cuối: mọi con số có nguồn; mọi capture có provenance; mọi kết luận phân biệt kỹ thuật với chấp thuận học thuật; không tài sản nhận diện nào ngoài repo/tài liệu chính thức.
