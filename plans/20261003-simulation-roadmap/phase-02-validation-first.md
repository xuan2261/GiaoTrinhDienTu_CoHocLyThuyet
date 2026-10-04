# Đợt 2: kiểm chứng trước khi mở rộng

Tiếp tục theo yêu cầu ngày 03/10/2026, từ mốc U1 `2b87d7ab57171129a490f069a844649830a48bb3`.

## Phạm vi giới hạn
1. Kiểm nguồn toàn bộ core và route cho điều khiển, bản nháp nhập số, nút U1, click/cancel không dịch chuyển và cleanup của 25 Sim2
2. Bổ sung cho bộ thu Q0 các nút U1 và chuỗi thí nghiệm A/B, capture, reset; receipt trước/sau gắn nguồn/run. Các ca browser thực vẫn not-run
3. Kiểm chuyên môn kỹ thuật: công thức, SI, giả thiết và miền mô hình của 25 route bằng oracle độc lập; giữ draft và human approval pending
4. Chỉ một bài U2 nhỏ: trường vận tốc vật rắn với ω âm/0/dương, so chiều, độ lớn và đứng yên; không mở camera, renderer hoặc mô hình động lực khác
5. Tái chạy TDD/regression, rà soát độc lập, refresh hash metadata không đổi trạng thái nghiệm thu; giao delta mới và ma trận phần còn lại

## Điều kiện kết thúc đợt
Kết thúc khi các mục trên có mã/test/report và không còn lỗi P1/P2 xác nhận trong phạm vi. Không thử lại browser đã bị chặn, đổi flags/network/sandbox, chuyển sang máy người dùng/Work/Codex hoặc publish. Q0 và duyệt học thuật thật vẫn là phụ thuộc còn mở, không tự chuyển thành pass.

## Kết quả
- Phạm vi trên đã thực hiện, gồm bốn reset tĩnh U1 còn thiếu và một bài U2 ω có dấu
- Pipeline nâng cấp: 228/228; rà soát độc lập: 275/275; metadata liên quan26/26; các bộ có giao nhau và không cộng dồn coverage
- Q0 producer/plan có mã và test, browser thực vẫn blocked/not-run; chưa có nghiệm thu học thuật của người có trách nhiệm
- Dừng mở thêm tính năng; bước tiếp theo là chạy Q0 trên runtime được phép và duyệt học thuật thật
