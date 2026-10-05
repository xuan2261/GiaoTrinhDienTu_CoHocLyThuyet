# Đính chính nội dung web ngày 02/10/2026

Bản sửa này phát triển từ commit `36e92895a69a82f9744c544cd166fc06e7e45c3c`, nhánh `repair/audit-20261002`. Nó sửa các nhóm phát hiện trong báo cáo kiểm toán; không phải hồ sơ chứng nhận học thuật.

## Nguồn và quyền tác giả nội dung

- `CoHocLyThuyet_Full_New.docx` và `CoHocLyThuyet.pdf` giữ nguyên bytes gốc. Một số lỗi diễn giải đã xác nhận có trong OOXML; với công thức MathType/OLE, bản hiển thị gốc và bước giải mã chưa được phân định đầy đủ
- Các sửa công thức, lời giải và câu hỏi được ghi thành đính chính của bản web. `data/content-errata-20261002.json` chứa 27 fragment, 107 hunk trước/sau, SHA-256 đầu vào/đầu ra và ID phát hiện liên quan
- Ngân hàng 300 câu hỏi schema v2 là nguồn hiện hành cho quiz. Ba công cụ `gen_quiz_ch*.py` nay kiểm tra nguồn này và chỉ xuất bản sao sang đường dẫn khác; không khôi phục bộ 50 câu cũ
- Symbol font trong DOCX không phải mã Unicode trực tiếp. Bộ giải mã đã sửa `00A3`/`F0A3` thành ≤; các glyph Symbol thực sự có trong nguồn cũng được ánh xạ. 42 mã riêng F0xx ở 11 fragment web được đổi sang chữ Hy Lạp/toán tử tương ứng; không đổi các chữ ASCII mơ hồ
- Nhãn kết luận trong text box DOCX của Chương 2 từng bị mất. Bản web đã phục hồi kết luận đúng với điều kiện áp dụng. Chuyển đổi toàn bộ hình/text box vẫn cần kiểm tra sau khi có đầy đủ bộ biến đổi nguồn

## Quy trình an toàn

1. Kiểm tra SHA-256 và đường dẫn DOCX thực sự khớp nguồn được ràng buộc trước khi xóa/tái sinh đầu ra
2. Chạy bộ chiết xuất và các bước hậu xử lý. Lỗi hậu xử lý làm dừng, không được âm thầm tiếp tục đóng gói
3. Áp dụng đính chính bằng `python tools/apply_content_errata.py --apply`. Mọi fragment được kiểm tra trước bất kỳ ghi nào. Đầu vào khác baseline đã biết phải dừng để rà soát/rebase; không tự thay thế văn bản gần giống
4. Chạy `python tools/bundle_pages.py`, `python tools/build_content_manifest.py`, `python tools/build_search_index.py`
5. Chạy `python tools/run_audit_regressions.py`, rồi `python tools/refresh_quality_metadata.py --write --include-academic`. Lệnh metadata không tạo chữ ký nghiệm thu hay chứng nhận chạy trình duyệt
6. Chạy các cổng kiểm thử thực sự và lưu bằng chứng của đúng bản nguồn. Không đổi ngày/hash của ảnh và log cũ để tạo bằng chứng mới

Đã kiểm tra replay trên toàn bộ 27 fragment đúng commit baseline: đầu ra khớp từng byte với bản sửa; chạy lần hai không đổi fragment nào. Đây không phải tuyên bố đã tái sinh thành công từ DOCX. Chiết xuất đầy đủ đang dừng trước khi ghi vì thiếu `OMML2MML.XSL` cho 17 đối tượng OMML; kiểm thử đổi WMF còn lỗi delegate ImageMagick/LibreOffice.

## Chưa được nghiệm thu

- Hình ảnh thực tế của bản sửa trong trình duyệt, WebGL/GPU, layout nhãn, screen reader và các thiết bị hẹp
- Bản DOCX/PDF chuẩn đã cập nhật đính chính và đối chiếu lại mọi công thức/hình
- Ký duyệt học thuật, accessibility và release độc lập. Metadata hiện hành cố ý giữ trạng thái pending/draft
- Gói release tháng 09 và các báo cáo/trình chiếu dựa trên gói đó là hồ sơ lịch sử; không xem là release của nhánh sửa này

Không push, tạo PR hay triển khai từ nhánh này khi chưa có quyết định công bố và nghiệm thu tương ứng.
