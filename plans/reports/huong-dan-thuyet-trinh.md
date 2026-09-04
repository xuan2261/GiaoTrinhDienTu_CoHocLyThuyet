# HƯỚNG DẪN THUYẾT TRÌNH BÁO CÁO NGHIỆM THU (15 PHÚT)
## HỘI ĐỒNG KHOA HỌC KHOA KỸ THUẬT CƠ SỞ — HỌC VIỆN HẢI QUÂN
**Học phần:** Cơ học lý thuyết  
**Sản phẩm:** Giáo trình điện tử (Phiên bản `2026.09.02-candidate`)  
**Mục tiêu:** Đề nghị Hội đồng thông qua có điều kiện về mặt khoa học — sư phạm

---

## I. BỘ TÀI NGUYÊN BÀN GIAO VÀ PHƯƠNG ÁN DỰ PHÒNG

| Phương án | Loại tệp | Đường dẫn | Cách sử dụng |
|---|---|---|---|
| **Chính (PowerPoint)** | `.pptx` | `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/bao-cao-nghiem-thu-giao-trinh-dien-tu.pptx` | Trình chiếu bằng Microsoft PowerPoint 2016+ trên máy chiếu |
| **Dự phòng (Web Slides)** | `.html` | `plans/reports/presentation-slides.html` | Mở trực tiếp bằng trình duyệt (Edge/Chrome), bấm `F` toàn màn hình, `S` bật lời thoại |
| **Dự phòng (PDF)** | `.pdf` | `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/bao-cao-nghiem-thu-giao-trinh-dien-tu.pdf` | Trình chiếu PDF khi máy chiếu hoặc máy tính Hội đồng lỗi font |
| **Giáo trình Demo** | `.html` | `release/2026.09.02-candidate/package/index.html` | Mở offline trực tiếp qua `file://` để thao tác mẫu |

---

## II. PHÂN CÔNG BÁO CÁO VÀ TIMING 15:00 (13 SLIDE CHÍNH)

```
00:00 ─── [Đ/t Nguyễn Lê Văn: S1-S3] ─── 02:15 ─── [Th/t Đinh Văn Tứ: S4, S6-S8] ─── 06:45 ─── [Đ/u Bùi Thanh Xuân: S5, S9-S11] ─── 10:40 ─── [Đ/t Nguyễn Lê Văn: S12-S13] ─── 15:00
```

### 1. Đại tá, TS Nguyễn Lê Văn — Chủ biên (0:00 – 2:15)
* **Slide 01 (0:35) | Bìa & Đề xuất mở đầu:**
  > *"Kính thưa Hội đồng Khoa học Khoa Kỹ thuật cơ sở, thưa toàn thể các đồng chí. Thay mặt nhóm tác giả, tôi xin báo cáo kết quả nghiên cứu và xây dựng Giáo trình điện tử môn học Cơ học lý thuyết. Mục tiêu của buổi báo cáo hôm nay là đề nghị Hội đồng xem xét, đánh giá và **thông qua có điều kiện về mặt khoa học — sư phạm**; chúng tôi không xin xác nhận bản ứng viên hiện tại là bản phát hành cuối cùng."*
* **Slide 02 (0:45) | Bài toán đào tạo & Cấu trúc 3 chương:**
  > *"Giáo trình điện tử được xây dựng nhằm mục đích cao nhất là hỗ trợ học viên sĩ quan cấp phân đội tự học và nâng cao chất lượng tiếp thu học phần Cơ học lý thuyết, chứ không phải trình diễn công nghệ đơn thuần. Cấu trúc gồm 3 chương với 108 routes: Chương 1 Tĩnh học (42 routes), Chương 2 Động học (35 routes), Chương 3 Động lực học (29 routes), bám sát 100% đề cương môn học đã được phê duyệt."*
* **Slide 03 (0:55) | Nguồn chuẩn DOCX & Trách nhiệm 3 tác giả:**
  > *"Một nguyên tắc bất biến của dự án là: Toàn bộ nội dung khoa học lấy nguồn chuẩn duy nhất từ tệp DOCX do 3 tác giả biên soạn. Bản thân tôi chịu trách nhiệm nội dung Chương 2, Chương 3 và chủ biên; đồng chí Thiếu tá Đinh Văn Tứ phụ trách Chương 1 và kịch bản mô phỏng sư phạm; đồng chí Đại úy Bùi Thanh Xuân phụ trách lập trình mô phỏng, pipeline kỹ thuật và ngân hàng trắc nghiệm."*

---

### 2. Thiếu tá, ThS Đinh Văn Tứ — Tác giả (2:15 – 3:20 & 4:25 – 6:45)
* **Slide 04 (1:05) | Hành trình học 5 bước:**
  > *"Kính thưa Hội đồng, học liệu điện tử được thiết kế xoay quanh hành trình học 5 bước khép kín của học viên: (1) Tìm kiếm nhanh bài học qua tổ hợp phím Ctrl+K và mục lục co giãn; (2) Học lý thuyết với 1 302 công thức KaTeX chuẩn mực; (3) Quan sát trực quan qua mô phỏng; (4) Luyện tập trắc nghiệm củng cố; và (5) Ghi nhớ thông qua thanh tiến trình đọc và đánh dấu trang."*
* **Slide 06 (1:10) | Học liệu trực quan gắn ngữ cảnh:**
  > *"Mọi tương tác chỉ có ý nghĩa khi gắn liền ngữ cảnh bài học. Giáo trình tích hợp 127 hình ảnh PNG chuẩn hóa, 20 ảnh động GIF mô tả chuyển động cơ học tuần hoàn, các câu hỏi trắc nghiệm kiểm tra tức thì có giải thích đáp án và toàn bộ công thức vector đều được hiển thị rõ ràng, không bị tràn trên thiết bị di động."*
* **Slide 07 (1:10) | Kiến trúc mô phỏng Sim2 & Sim3:**
  > *"Về mô phỏng: Sim2 chạy trên nền tảng SVG-first là mô phỏng chính thức cho 25 kịch bản cơ học, hỗ trợ tương tác kéo thả chuột và bàn phím với quy ước màu ngữ nghĩa thống nhất (Đỏ là lực, Lục là vận tốc, Lam là gia tốc, Tím là mô men). Lớp Sim3 3D dựa trên Three.js là thí điểm cho 10 kịch bản không gian và luôn có cơ chế tự động chuyển về Sim2 khi trình duyệt không hỗ trợ 3D."*
* **Slide 08 (1:05) | Kiểm soát toàn vẹn pipeline vs Thẩm định học thuật:**
  > *"Chúng tôi phân định rất rạch ròi: Hệ thống máy móc và pipeline QA tự động chịu trách nhiệm kiểm tra cấu trúc, liên kết, mã hash và cú pháp. Còn tính đúng đắn khoa học, chuẩn mực thuật ngữ quân sự và giá trị sư phạm bắt buộc phải do Hội đồng Khoa học và các giảng viên chuyên môn thẩm định, nghiệm thu."*

---

### 3. Đại úy, ThS Bùi Thanh Xuân — Tác giả (3:20 – 4:25 & 6:45 – 10:40)
* **Slide 05 (1:05) | Kiến trúc vận hành ngoại tuyến (Offline 100%):**
  > *"Về mặt kỹ thuật, giáo trình được đóng gói hoàn toàn tĩnh (static package) với 372 tệp, dung lượng 75.1 MB. Giáo trình chạy 100% ngoại tuyến qua giao thức file:// trên máy tính cá nhân hoặc qua USB, không cần kết nối mạng Internet, không cần cài đặt Node.js hay Python tại máy học viên, bảo đảm tính bảo mật và sẵn sàng trên mọi trang thiết bị của Quân đội."*
* **Slide 09 (1:05) | Khả năng tiếp cận (Accessibility):**
  > *"Hệ thống đáp ứng hoàn hảo trên mọi kích thước màn hình từ 320px đến 1440px. Kiểm thử tự động bằng axe-core đạt chuẩn WCAG 2.2 AA, hỗ trợ đầy đủ phím Tab/Enter/Arrow và chế độ giảm chuyển động. Tuy nhiên, chúng tôi bảo lưu trạng thái chờ chuyên gia độc lập đánh giá bằng thiết bị đọc màn hình trước khi tuyên bố chứng nhận chính thức."*
* **Slide 10 (1:20) | Hiện trạng Candidate 2026.09.02 đã khóa hash:**
  > *"Gói phát hành ứng viên mã hiệu 2026.09.02-candidate đã được xây dựng tất định, đồng bộ hash SHA-256 xác thực `3defec13...`. Các gói dẫn xuất tích hợp hệ thống quản lý học tập như QTI 3.0 (10 câu hỏi pilot) và Common Cartridge 1.4 cũng đã được tạo lập đồng bộ và vượt qua các bài kiểm thử cấu trúc."*
* **Slide 11 (1:25) | Ma trận kiểm chứng 20/24 Pass, 4 Blocked:**
  > *"Trong tổng số 24 cổng kiểm chứng chất lượng: 20 cổng kỹ thuật tự động đều đạt (PASS 100%). Còn 4 cổng đang ở trạng thái BLOCKED gồm: Thẩm định học thuật, Đánh giá tiếp cận độc lập, Thử nghiệm smoke test độc lập, và Đánh giá vòng lặp Word. Nhóm tác giả không dùng tỷ lệ 83,3% để báo cáo hoàn thành, mà giữ trạng thái tổng thể là BLOCKED theo đúng chính sách chất lượng."*

---

### 4. Đại tá, TS Nguyễn Lê Văn — Chủ biên (10:40 – 15:00)
* **Slide 12 (1:15) | Bốn điều kiện đóng trước bản phát hành cuối:**
  > *"Để hoàn tất giáo trình trước khi đưa vào giảng dạy chính thức, nhóm tác giả xác định rõ 4 điều kiện đóng: (1) Tiếp thu kết luận của Hội đồng Khoa học Bộ môn; (2) Hoàn thành biên bản thử nghiệm độc lập với giảng viên và học viên; (3) Nhận đánh giá tiếp cận ngoài; và (4) Kiểm chứng độ chuẩn xác của tài liệu Word xuất ngược. Nhóm cam kết không tự ý đổi trạng thái khi chưa đủ biên bản."*
* **Slide 13 (2:05) | Đề nghị Hội đồng thông qua có điều kiện:**
  > *"Kính thưa Hội đồng Khoa học, trên cơ sở các kết quả nghiên cứu và minh chứng kỹ thuật đã đạt được, nhóm tác giả trân trọng kính đề nghị Hội đồng: **Thống nhất thông qua có điều kiện về mặt khoa học — sư phạm đối với Giáo trình điện tử Cơ học lý thuyết**; giao nhóm tác giả hoàn thiện các nội dung theo góp ý của Hội đồng và hoàn tất 4 thủ tục độc lập để trình thủ trưởng phê duyệt ban hành chính thức. Xin trân trọng cảm ơn Hội đồng!"*

---

## III. KỊCH BẢN 3 SLIDE PHỤ LỤC / DỰ PHÒNG (DÙNG KHI HỘI ĐỒNG CHẤT VẤN)

* **Slide 14 (Backup) | Demo trực tiếp 90 giây:**
  1. Mở tệp `package/index.html` trực tiếp bằng trình duyệt.
  2. Chọn Chương 1 $\rightarrow$ Mục I $\rightarrow$ Bài 4 Mô men lực (`#ch1-1-4`).
  3. Kéo thanh trượt điều chỉnh lực $F = 50\text{ N}$, cánh tay đòn $d = 1.2\text{ m}$, chỉ vào vector mô men $\vec{M}$ tự cập nhật.
  4. Bấm nút "Xem bản PDF" hiển thị tài liệu gốc toàn màn hình.
  5. Dừng và chuyển về slide chính phục vụ trả lời.

* **Slide 15 (Backup) | Chi tiết 4 cổng mở & Biên bản cần nộp:**
  * Giải trình rõ: Cổng blocked là do yêu cầu độc lập khách quan của con người, không phải lỗi hệ thống (code/runtime).

* **Slide 16 (Backup) | Q&A Playbook cho 6 câu hỏi thường gặp:**
  1. **Câu 1:** *"Nội dung có bị sai lệch so với giáo trình in không?"*  
     $\rightarrow$ **Trả lời:** Nguồn chuẩn là DOCX gốc, pipeline tự động trích xuất bảo đảm toàn vẹn 100%, có đối sánh công thức và hình ảnh tự động.
  2. **Câu 2:** *"Mô phỏng có chạy được trên máy tính đời cũ không?"*  
     $\rightarrow$ **Trả lời:** Sim2 chạy hoàn toàn bằng Canvas 2D và SVG thuần túy, mượt mà trên mọi máy tính văn phòng thông thường.
  3. **Câu 3:** *"Tại sao trắc nghiệm Chương 2 và 3 chưa nhiều bằng Chương 1?"*  
     $\rightarrow$ **Trả lời:** Nhóm tác giả tập trung xây dựng mẫu chuẩn 100 câu phân loại 8 phạm vi ở Chương 1; ngân hàng câu hỏi Chương 2 và 3 sẽ được bổ sung đầy đủ trong giai đoạn hoàn thiện sau nghiệm thu.
  4. **Câu 4:** *"Bảo mật dữ liệu học viên như thế nào?"*  
     $\rightarrow$ **Trả lời:** Dữ liệu làm bài và ghi chú lưu tại `localStorage` của chính trình duyệt học viên, không truyền ra ngoài mạng.
  5. **Câu 5:** *"Có cần kết nối Internet để tra cứu không?"*  
     $\rightarrow$ **Trả lời:** Không. Toàn bộ font chữ, thư viện KaTeX, pdf.js đều được đóng gói sẵn trong tệp ZIP 75.1 MB.
  6. **Câu 6:** *"Sau khi Hội đồng thông qua, bao lâu sẽ có bản phát hành cuối?"*  
     $\rightarrow$ **Trả lời:** Dự kiến trong vòng 2–3 tuần sau khi nhận biên bản góp ý của Hội đồng, nhóm sẽ hoàn tất 4 thủ tục và bàn giao gói phát hành chính thức.

---
*Tài liệu đã được kiểm chứng và khóa cấu trúc theo phiên bản `2026.09.02-candidate`.*
