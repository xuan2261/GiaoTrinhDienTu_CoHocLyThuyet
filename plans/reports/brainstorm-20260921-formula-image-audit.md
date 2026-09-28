# Brainstorm — audit công thức và hình ảnh báo cáo / slide

## Problem
- Một công thức trong báo cáo dùng ký tự vector kết hợp (`a⃗C = 2ω⃗ × v⃗rel`) nhưng DOCX hiện không có OMML; khi Word/WPS thay font, mũi tên có thể tách hoặc mất.
- Slide khoa học đang đặt 3 ảnh kiểm chứng trong một hàng; nguồn 960 px bị thu nhỏ nên chữ điều khiển/readout khó đọc.
- Bản slide, báo cáo, PDF, Web Slides và Handout phải tiếp tục sinh từ nguồn, không sửa thủ công từng bản.

## Các phương án

### A — Sửa trực tiếp các file đã xuất
- Ưu: nhanh.
- Nhược: mất tính tái lập, lần build sau ghi đè lỗi; không chọn.

### B — Sửa source-first, giữ nguyên số slide
- Chuyển công thức sang OMML/plain-safe text; tăng kích thước ảnh.
- Ưu: ít thay đổi hợp đồng.
- Nhược: ba ảnh vẫn phải chia sẻ một slide; độ đọc vẫn bị giới hạn.

### C — Source-first + chụp lại bằng chứng thực tế + tách ca kiểm chứng thành slide riêng (chọn)
- Chụp lại 3 route đại diện từ runtime hiện hành ở viewport lớn, không thay evidence baseline cũ.
- Dùng ảnh live mới cho báo cáo và deck; mỗi ca kiểm chứng có một slide hình lớn, công thức an toàn và giới hạn kết luận.
- Deck chính tăng từ 11 lên 13 slide, tổng deck từ 17 lên 19; giữ tổng thời lượng nội dung 12:00 bằng cách chia 1:30 thành 3 × 0:30.
- Cập nhật contract tests, guide, Web Slides, Handout và PDF đồng bộ từ generator.
- Ưu: giải quyết đúng nguyên nhân hình quá bé, bảo toàn reproducibility, không làm thay đổi snapshot evidence độc lập.
- Rủi ro: số slide thay đổi; cần cập nhật mọi tham chiếu S01–S19.

## Workflow GATE
1. Brainstorm → khóa phương án C và tiêu chí thành công.
2. Audit baseline → xác định công thức lỗi, kích thước ảnh, nguồn capture và contract hiện tại.
3. Capture live → chạy runtime/fixture, bắt 3 ảnh mới, kiểm tra console/page errors và kích thước.
4. Implement source → OMML cho công thức báo cáo; display-safe formulas; renderer slide đơn ảnh; provenance paths.
5. Regenerate → DOCX → PDF, PPTX → PDF/thumbnail, Web Slides, Handout, guides.
6. Verify → equation suite, strict audit, report tests, presentation tests, officecli validate/issues, page/slide counts, visual inspection.
7. Handover → báo cáo thay đổi, bằng chứng, blocker thật, và roadmap nâng cấp.

## Success metrics
- Không còn vector formula dùng ký tự combining trong phần report mới; có OMML trong `word/document.xml`.
- Ba ảnh live có kích thước tối thiểu 1.280 px chiều rộng, được dùng ở 15,0–15,7 cm trong DOCX và chiếm phần lớn diện tích slide riêng.
- Deck: 19 slide = 13 main + 6 backup; main timing vẫn 12:00; mọi artifact sinh lại từ generator.
- `tests/test_scientific_report.py`, `tests/presentation-deck-contract.test.js`, equation audit và officecli validation pass.
