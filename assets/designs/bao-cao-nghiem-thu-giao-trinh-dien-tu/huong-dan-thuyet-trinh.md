# HƯỚNG DẪN THUYẾT TRÌNH BÁO CÁO NGHIỆM THU — 15:00

**Học phần:** Cơ học lý thuyết  
**Ứng viên kỹ thuật:** `2026.09.02-candidate`  
**Đề nghị:** Hội đồng xem xét thông qua có điều kiện về mặt khoa học–sư phạm; chưa xác nhận bản phát hành cuối.

## 1. Bộ tài nguyên sử dụng tại phòng họp

| Ưu tiên | Tài nguyên | Đường dẫn | Cách dùng |
|---|---|---|---|
| Chính | PowerPoint 16:9 | `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/bao-cao-nghiem-thu-giao-trinh-dien-tu.pptx` | Presenter View; ghi chú đã nhúng theo slide |
| Dự phòng | Web Slides offline | `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/presentation-slides.html` | `F`: toàn màn hình; `S`: lời thoại; `G`: lưới slide |
| Phát tay | Handout A4 | `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/handout-in-an-hoi-dong.html` | In hoặc xuất PDF trước phiên họp |
| Demo | Candidate package | `release/2026.09.02-candidate/package/index.html` | Mở trực tiếp qua `file://` |

## 2. Nhịp báo cáo 15 phút

```text
00:00–02:05  Nguyễn Lê Văn  S01–S03  Mục tiêu, phạm vi, trách nhiệm
02:05–03:10  Đinh Văn Tứ    S04      Hành trình học
03:10–04:15  Bùi Thanh Xuân S05      Kiến trúc ngoại tuyến
04:15–06:35  Đinh Văn Tứ    S06–S07  Học liệu và ví dụ mô men
06:35–11:55  Bùi Thanh Xuân S08–S11  Demo, QA, candidate, cổng kiểm chứng
11:55–15:00  Nguyễn Lê Văn  S12–S13  Điều kiện đóng và đề nghị Hội đồng
```

## 3. Lời thoại chính theo slide

### Slide 01 — Mở đầu — 0:35

> Kính thưa Hội đồng. Nhóm tác giả báo cáo một học liệu số có thể mở trực tiếp, quan sát hiện tượng cơ học và luyện tập ngoại tuyến. Đề nghị hôm nay là thông qua có điều kiện về mặt khoa học–sư phạm; chưa đề nghị xác nhận bản phát hành cuối.

### Slide 02 — Ba mạch kiến thức — 0:45

> Giáo trình bao phủ 108 route: 45 route Tĩnh học, 29 route Động học, 31 route Động lực học và 3 route bổ trợ. Công nghệ chỉ có giá trị khi giúp học viên nhìn thấy quan hệ cơ học, thao tác tham số và tự kiểm tra kết quả.

### Slide 03 — Nguồn chuẩn và trách nhiệm — 0:45

> Ba tác giả chịu trách nhiệm theo phần công bố trong đề cương; không có vùng nội dung vô chủ. Nguồn chuẩn là DOCX. HTML, PDF, package và dữ liệu kiểm thử đều được sinh, kiểm soát và truy vết về nguồn này.

### Slide 04 — Vòng học khép kín — 1:05

> Hành trình học là trục tổ chức chức năng, không phải danh sách nút. Mỗi vòng học bắt đầu từ một bài cụ thể, cho phép quan sát hoặc thao tác, rồi kết thúc bằng tự kiểm tra và lưu tiến độ trên thiết bị.

### Slide 05 — Kiến trúc ngoại tuyến — 1:05

> Kiến trúc tĩnh giảm phụ thuộc hạ tầng, phù hợp khai thác qua USB hoặc mạng nội bộ. Công cụ phát triển chỉ dùng khi biên soạn và kiểm thử; máy học viên chỉ cần trình duyệt.

### Slide 06 — Học liệu gắn ngữ cảnh — 1:10

> Đây là ảnh chụp thực tế của một bài học đại diện: văn bản, hình, công thức và điều hướng nằm trong cùng ngữ cảnh. Content manifest ghi 1 302 lần xuất hiện công thức; registry ngữ nghĩa hiện có 702 hàng ánh xạ. Hai chỉ số không được dùng thay thế nhau.

### Slide 07 — Ví dụ mô men — 1:10

> Tại route ch1-1-4, học viên kéo điểm đặt lực thay vì chỉ đọc công thức. Ảnh chụp xác nhận F bằng 50 N, d bằng 4,00 m và hệ thống trả M bằng 200 N·m; mũi tên chiều quay và readout cập nhật đồng thời.

### Slide 08 — Demo hệ thống — 1:30

1. **00:00–00:15 — Mở gói:** mở `package/index.html` qua `file://`.
2. **00:15–00:30 — Vào bài:** Chương 1 → I → 4. Mô men.
3. **00:30–01:00 — Thao tác:** giữ `F = 50 N`, kéo điểm đặt lực đến `d = 4,00 m`.
4. **01:00–01:15 — Quan sát:** readout phải hiện `M = 200 N·m`; chiều quay cập nhật.
5. **01:15–01:30 — Đối chiếu:** mở PDF cục bộ rồi quay lại bài.

**Điểm dừng an toàn:** nếu demo trực tiếp gặp lỗi ngoài dự kiến, dùng ba ảnh minh chứng trên slide; không sửa tại chỗ trước Hội đồng.

### Slide 09 — Ranh giới thẩm quyền — 1:05

> Pipeline tạo bằng chứng tái lập về cấu trúc, hành vi và khả năng vận hành đa thiết bị. Ý nghĩa công thức, sai số mô phỏng, khả năng tiếp cận thực tế và giá trị sư phạm vẫn thuộc thẩm quyền reviewer độc lập. Không tuyên bố đã đạt WCAG toàn hệ thống.

### Slide 10 — Hiện vật candidate — 1:20

> Candidate `2026.09.02` gồm 372 tệp, ZIP 78,7 MB, tương đương 75,1 MiB, và đã khóa SHA-256. QTI 3.0 cùng Common Cartridge 1.4 mới có bằng chứng kiểm tra cục bộ; chưa phải bằng chứng nhập vào LMS thực tế.

### Slide 11 — Ma trận kiểm chứng — 1:25

> Có 20 cổng pass trong phạm vi khai báo, 0 fail, 4 blocked và 0 not-run. Không dùng 83,3% như điểm chất lượng. Bốn cổng blocked cần đúng chuyên gia hoặc người dùng độc lập đóng; vì vậy trạng thái tổng thể vẫn blocked.

### Slide 12 — Bốn điều kiện đóng — 1:15

> Bốn điều kiện gồm: quyết định thẩm định học thuật; biên bản tiếp cận độc lập; phiếu smoke thực tế qua file:// và HTTP; đối sánh Word round-trip. Khi đủ hồ sơ, nhóm chạy lại toàn bộ 24 cổng rồi mới trình khóa bản phát hành chính thức.

### Slide 13 — Đề nghị Hội đồng — 1:50

> Kính đề nghị Hội đồng xem xét thông qua có điều kiện về mặt khoa học–sư phạm. Nhóm tác giả cam kết tiếp thu từng ý kiến, chỉ trình bản cuối khi bốn hồ sơ độc lập đầy đủ và toàn bộ 24 cổng được chạy lại.

## 4. Phụ lục dùng khi chất vấn

- **Slide 14:** Sim2 gồm 25 route SVG-first canonical; Sim3 gồm 10 adapter pilot. Sim3 là tùy chọn; lỗi setup/render phải quay về Sim2. Không dùng Sim3 để tuyên bố “4D”.
- **Slide 15:** tên bốn cổng blocked, owner và artifact bắt buộc.
- **Slide 16:** sáu câu hỏi trọng tâm và nguồn kiểm chứng.

## 5. Q&A chính xác, không suy diễn

1. **Nội dung có lệch nguồn không?**  
   DOCX là nguồn chuẩn; manifest và pipeline cung cấp truy vết kỹ thuật. Quyết định học thuật vẫn cần reviewer độc lập.

2. **Mô phỏng chạy trên máy cũ không?**  
   Sim2 SVG-first là đường chạy canonical. Sim3 là pilot tùy chọn và có fallback; không tuyên bố tương thích mọi cấu hình nếu chưa smoke trên thiết bị đó.

3. **Ngân hàng câu hỏi có bao nhiêu?**  
   300 câu: mỗi chương 100 câu. Không nói Chương 2–3 “sẽ bổ sung” nếu nguồn hiện hành đã có đủ 100 câu/chương.

4. **Đã đạt WCAG chưa?**  
   Chưa tuyên bố tuân thủ WCAG toàn hệ thống. Automation đã có; independent accessibility review còn blocked.

5. **Có chạy ngoại tuyến không?**  
   Runtime được đóng gói cục bộ và hỗ trợ `file://`; bằng chứng smoke độc lập trên thiết bị thật vẫn là điều kiện mở.

6. **Bao giờ có bản cuối?**  
   Không đưa mốc thời gian khi chưa có biên bản Hội đồng và lịch reviewer độc lập. Bản cuối chỉ được khóa sau khi đủ bốn hồ sơ và chạy lại 24 cổng.

## 6. Những câu tuyệt đối không sử dụng

- “Hoàn thành 100%.”
- “Đã đạt WCAG 2.2 AA toàn hệ thống.”
- “Đã tương thích Canvas/Moodle/Blackboard.”
- “Sim3 là mô phỏng 4D.”
- “20/24 tương đương điểm chất lượng 83,3%.”
- “Bản candidate đã sẵn sàng phát hành chính thức.”
