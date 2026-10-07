# Hướng dẫn thuyết trình báo cáo kết quả — 15:00

**Học phần:** Cơ học lý thuyết  
**Mục đích phiên trình bày:** Báo cáo hiện vật ở mức ứng viên đã được xây dựng, cho Hội đồng xem hiện vật và xin góp ý để tiếp tục hoàn thiện.
**Đề nghị cuối phiên:** Hội đồng ghi nhận việc đã xây dựng hiện vật và cho ý kiến góp ý. Không đề nghị chấp thuận học thuật, nghiệm thu cuối cùng hoặc phát hành.

## 1. Tài nguyên dùng trong phòng họp

| Vai trò | Tài nguyên | Đường dẫn | Cách dùng |
|---|---|---|---|
| Chính | PowerPoint 16:9 | `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/bao-cao-nghiem-thu-giao-trinh-dien-tu.pptx` | Dùng Presenter View và ghi chú theo từng slide |
| Dự phòng | PDF slide | `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/bao-cao-nghiem-thu-giao-trinh-dien-tu.pdf` | Mở khi PowerPoint không dùng được |
| Dự phòng | Web Slides offline | `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/presentation-slides.html` | Mở trong trình duyệt |
| Phát tay | Handout A4 | `assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/handout-in-an-hoi-dong.html` | In hoặc xuất PDF trước phiên họp |
| Tham khảo | Báo cáo khoa học đã chỉnh sửa | `BaoCao_KhoaHoc_GiaoTrinhDienTu_CoHocLyThuyet_DaChinhSua.pdf` | Tra cứu mục 1.3–1.5, 2.5–2.8 và 3.1–3.3 |
| Dự phòng | Gói cục bộ | `release/2026.09.02-candidate/package/index.html` | Chỉ mở qua `file://` khi cần thay cho bản web để trình diễn |

### Cách dẫn người xem qua sơ đồ

- Slide 01 đặt ảnh giao diện cạnh ba hình nguyên lý để định hướng phạm vi học phần. Ba hình không phải kết quả thẩm định.
- Slide 04 đọc theo mũi tên của vòng học. Nhấn đường quay về nội dung sau phản hồi, thay vì đọc từng ô như danh sách.
- Slide 10 phân biệt workflow tổ chức công việc với pipeline biến đổi kỹ thuật. Nêu người chịu trách nhiệm, đầu ra và bước duyệt; không đọc các bước như thành tích đã hoàn tất.
- Slide 15 phân biệt phần có thể quan sát với kết luận cần thẩm định độc lập. Không suy rộng ba ca thành toàn bộ học liệu.

Cách đặt lời giải thích gần hình tham khảo nguyên tắc contiguity trong [Kumaraguru và cộng sự, mục 3.1](https://www.cs.cmu.edu/~jasonh/publications/acm-tois-teaching-johnny-not-to-fall-for-phish-final.pdf). Nghiên cứu này thuộc đào tạo an toàn thông tin; chỉ dùng làm căn cứ thiết kế trình bày, không chứng minh hiệu quả học tập của giáo trình Cơ học lý thuyết.

### Trình chiếu bằng trình duyệt

Mở `presentation-slides.html`, chọn **Bắt đầu trình chiếu**. Dùng nút **Trước**, **Tiếp** hoặc phím mũi tên trái/phải để chuyển slide. **Home** mở slide đầu, **End** mở slide cuối, **Esc** trở về tổng quan. Trình chiếu không tự chuyển trang. Khi in từ trình duyệt, toàn bộ 23 slide vẫn được đưa vào bản in, kể cả khi đang xem một slide. Dùng PDF đã xuất từ PowerPoint nếu cần bố cục 16:9 cố định.

## 2. Nhịp trình bày

- **13 slide chính:** 12:00.
- **Phụ lục Slide 14–23 và hỏi–đáp:** 3:00; chỉ mở trang liên quan, không đọc hết mười trang.
- **Tổng thời lượng:** 15:00.

```text
00:00–00:45  Nguyễn Lê Văn   S01  Kết quả xây dựng Giáo trình điện tử Cơ học lý thuyết
00:45–01:40  Nguyễn Lê Văn   S02  Từ kiến thức trừu tượng đến thao tác tự học
01:40–02:35  Nguyễn Lê Văn   S03  Một học liệu số cho ba mạch kiến thức
02:35–03:35  Nguyễn Lê Văn   S04  Vòng học hỗ trợ tự học
03:35–04:20  Nguyễn Lê Văn   S05  Trải nghiệm hiện vật
04:20–05:00  Đinh Văn Tứ     S06  Ca đối chiếu khoa học 1 · Trọng tâm diện tích
05:00–05:40  Đinh Văn Tứ     S07  Ca đối chiếu khoa học 2 · Gia tốc Coriolis
05:40–06:20  Đinh Văn Tứ     S08  Ca đối chiếu khoa học 3 · Va chạm thẳng một chiều
06:20–07:50  Bùi Thanh Xuân  S09  Minh họa thao tác · Mô men của lực
07:50–08:45  Bùi Thanh Xuân  S10  Từ nguồn chuẩn đến gói có thể kiểm tra
08:45–09:45  Bùi Thanh Xuân  S11  Kết quả đã có và giới hạn còn lại
09:45–10:45  Bùi Thanh Xuân  S12  Bốn nội dung xin ý kiến góp ý
10:45–12:00  Nguyễn Lê Văn   S13  Đề nghị ghi nhận việc xây dựng hiện vật
12:00–15:00  Cả nhóm         Hỏi–đáp; mở Slide 14–23 khi cần
```

## 3. Lời thoại chính theo slide

### Slide 01 — Kết quả xây dựng Giáo trình điện tử Cơ học lý thuyết — 0:45

> Kính thưa Hội đồng, nhóm xin báo cáo hiện vật Giáo trình điện tử Cơ học lý thuyết đã được xây dựng ở mức ứng viên. Hiện vật có bài học, hình minh họa, mô phỏng và câu hỏi tự kiểm tra. Trong 12 phút, nhóm trình bày phạm vi đã xây dựng, ba ca đối chiếu khoa học và một thao tác trực tiếp.

### Slide 02 — Từ kiến thức trừu tượng đến thao tác tự học — 0:55

> Sản phẩm hướng tới những khó khăn quen thuộc: công thức trừu tượng, hình tĩnh khó quan sát, ít cơ hội tự thao tác và thiếu phản hồi ngay khi tự học. Vì vậy, nhóm thiết kế bài học để người học có thể đọc, quan sát, thao tác và tự kiểm tra trong cùng một nơi.

### Slide 03 — Một học liệu số cho ba mạch kiến thức — 0:55

> Hiện vật gồm 108 mục/trang hiển thị trong manifest: 45 mục/trang tĩnh học, 29 mục/trang động học, 31 mục/trang động lực học và 3 mục/trang hỗ trợ. Con số 108 không phải là 108 mục nội dung học tập. Phạm vi đã xây dựng là học liệu số cho ba mạch kiến thức; hiệu quả với người học cần được đánh giá riêng.

### Slide 04 — Vòng học hỗ trợ tự học — 1:00

> Thiết kế hướng tới vòng: chọn bài, học lý thuyết, quan sát hình hoặc mô phỏng, tự thao tác, làm câu hỏi tự kiểm tra và xem lại nội dung. Đây là ý đồ thiết kế để nối kiến thức với quan sát và phản hồi. Nhóm không khẳng định luồng này đã vận hành trọn vẹn từ đầu đến cuối, cũng không khẳng định hiệu quả với người học.

### Slide 05 — Trải nghiệm hiện vật — 0:45

> Hội đồng có thể quét QR để mở bản web để trình diễn và xem một bài học, hình minh họa, mô phỏng cùng câu hỏi tự kiểm tra. Bản web chưa được chứng minh là giống hệt gói ứng viên `2026.09.02-candidate`; vì vậy việc trình diễn không thay thế kiểm tra gói ứng viên. Nếu không mở được bản web, gói cục bộ chỉ là phương án dự phòng. Trải nghiệm này chỉ để xem hiện vật.

### Slide 06 — Ca đối chiếu khoa học 1 · Trọng tâm diện tích — 0:40

> Đây là ca đối chiếu khoa học thứ nhất và chưa được thẩm định độc lập. Với đúng hình đang trình bày, nhóm đối chiếu bằng tính đối xứng, giới hạn tọa độ và phép tính diện tích có dấu: phần khoét có diện tích âm trong tổng diện tích và tổng mô men. Không dùng quy tắc rằng trọng tâm phải nằm trong phần vật liệu hoặc trong đường bao hình học.

### Slide 07 — Ca đối chiếu khoa học 2 · Gia tốc Coriolis — 0:40

> Đây là ca đối chiếu khoa học thứ hai và chưa được thẩm định độc lập. Sơ đồ phẳng có ω vuông góc vrel, nên độ lớn thành phần Coriolis là 2ω|vrel|. Trường hợp tổng quát phải nhân thêm sin của góc giữa hai vectơ. Gia tốc Coriolis chỉ là một thành phần, không phải toàn bộ gia tốc của điểm.

### Slide 08 — Ca đối chiếu khoa học 3 · Va chạm thẳng một chiều — 0:40

> Đây là ca đối chiếu khoa học thứ ba và chưa được thẩm định độc lập. Ca xét va chạm thẳng một chiều thụ động, với xung lực ngoài theo phương va chạm không đáng kể và hệ số đàn hồi `0 ≤ e ≤ 1`. Phương trình tổng động lượng là `m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂`. Chỉ dùng phương trình này với các điều kiện vừa nêu.

### Slide 09 — Minh họa thao tác · Mô men của lực — 1:30

1. **00:00–00:15:** Mở gói cục bộ qua `file://`.
2. **00:15–00:30:** Chọn Chương 1, Mục 4: *Mô men của lực*.
3. **00:30–01:00:** Điểm `O` và phương lực cố định. Giữ `F = 50 N`, kéo điểm đặt lực đến `d⊥ = 4,00 m`.
4. **01:00–01:15:** Đối chiếu `M = +200 N·m` theo quy ước ngược chiều kim đồng hồ là dương.
5. **01:15–01:30:** Mở PDF cục bộ, đối chiếu công thức rồi quay lại bài. Minh họa này không thay đổi `θ` và không đổi dấu mô men.

> Nếu phần minh họa gián đoạn, chuyển sang ảnh đã chuẩn bị trên Slide 09. Nêu rõ đó là phần minh họa bị gián đoạn và không suy diễn thêm từ sự cố.

### Slide 10 — Từ nguồn chuẩn đến gói có thể kiểm tra — 0:55

> Workflow xác định ai biên soạn, ai duyệt chuyên môn, ai tích hợp và ai quyết định bàn giao. Pipeline là chuỗi kỹ thuật từ nguồn Word sang nội dung web, chỉ mục và gói ứng viên. Câu hỏi, GIF và mô phỏng được biên soạn riêng; không phải mọi học liệu tự sinh từ Word. Mỗi bước có đầu ra để kiểm và truy vết. Chỉ tạo được ZIP chưa có nghĩa đã nghiệm thu. Các phụ lục 20–23 giải thích cách làm từng loại học liệu và giới hạn hiện tại.

### Slide 11 — Kết quả đã có và giới hạn còn lại — 1:00

> Nhóm đã xây dựng hiện vật ở mức ứng viên, gồm học liệu số, minh họa, mô phỏng và câu hỏi tự kiểm tra cho ba mạch kiến thức. Không khẳng định hiện vật đã vận hành đầy đủ hoặc đã được kết nối đầy đủ. Ba ca đối chiếu khoa học là ví dụ để so sánh, chưa được thẩm định độc lập và không dùng để kết luận học thuật. Hiện chưa có chữ ký học thuật độc lập; bốn kết quả học tập mới ở mức sơ bộ; hiệu quả với người học cần được đánh giá thêm. Tình trạng phát hành chỉ trình bày tại phụ lục Slide 17–18.

### Slide 12 — Bốn nội dung xin ý kiến góp ý — 1:00

> Nhóm xin Hội đồng góp ý về bốn nội dung: một, độ đúng và độ rõ của các ví dụ cơ học; hai, cách tổ chức vòng tự học; ba, điều kiện–tiêu chí của bốn kết quả học tập sơ bộ tại Slide 14 và ba câu hỏi đại diện đang hiển thị; bốn, những nội dung cần ưu tiên chỉnh sửa trong học liệu. Ba câu hỏi chỉ là mẫu để góp ý, không chứng minh mức đạt chuẩn đầu ra.

### Slide 13 — Đề nghị ghi nhận việc xây dựng hiện vật — 1:15

> Nhóm kính đề nghị Hội đồng ghi nhận việc đã xây dựng hiện vật và cho ý kiến góp ý để hoàn thiện sản phẩm. Nhóm không đề nghị Hội đồng chấp thuận học thuật, nghiệm thu cuối cùng hoặc quyết định phát hành. Ý kiến về nội dung khoa học, cách dạy–học, kết quả học tập và mức ưu tiên chỉnh sửa sẽ là cơ sở cho bước tiếp theo.

> **Dự thảo biên bản:** Hội đồng ghi nhận nhóm tác giả đã xây dựng hiện vật giáo trình điện tử ở mức ứng viên và đề nghị tiếp thu ý kiến để hoàn thiện; phiên họp này không kết luận chấp thuận học thuật, nghiệm thu cuối cùng hoặc phát hành.

## 4. Phụ lục dùng khi hỏi–đáp

### Slide 14 — Bốn kết quả học tập ở mức sơ bộ

> Hiện có **0 chữ ký**. Bốn kết quả học tập đều ở mức sơ bộ; từng kết quả có điều kiện và tiêu chí dự kiến để Hội đồng góp ý. Không có ngoại lệ đánh giá được khai báo.

### Slide 15 — Lưu ý cho ba ca đối chiếu khoa học

> Ba ca này chưa được thẩm định độc lập. Hình dùng tại slide là **ảnh chụp khi mô phỏng đang chạy**. Với trọng tâm, kiểm tra theo đối xứng, giới hạn tọa độ và diện tích có dấu; với Coriolis, chỉ xét một thành phần gia tốc; với va chạm, chỉ dùng phương trình động lượng khi xung lực ngoài theo phương va chạm không đáng kể và `0 ≤ e ≤ 1`.

### Slide 16 — Ý kiến học thuật độc lập còn cần bổ sung

> Chưa có chữ ký học thuật độc lập. Mọi kết luận học thuật chỉ cập nhật khi có chứng cứ được ủy quyền.

### Slide 17 — Tình trạng phát hành kỹ thuật

> Không suy ra tình trạng phát hành từ bản web để trình diễn hoặc gói cục bộ. Snapshot nền của 24 cổng là ngày `2026-09-21`; bằng chứng mô phỏng được làm mới ngày `2026-09-25`, không đồng nghĩa toàn bộ cổng đã chạy lại. Chín trạng thái “không đạt” trong snapshot đều dừng vì Playwright không tìm thấy Chromium; đây không phải bằng chứng các kiểm tra vật lý hoặc chức năng đã thất bại. Gói có derivative QTI 3 và Common Cartridge 1.4, nhưng chưa có bằng chứng nhập thành công vào LMS.

### Slide 18 — Các thẩm định và kiểm tra độc lập chưa thể thực hiện

> Nêu đủ chín phép kiểm tra dừng do môi trường thiếu Chromium và bốn nội dung độc lập chưa thể thực hiện. Với bộ kiểm tra vật lý mô phỏng, phải nói rõ bước trình duyệt không khởi động; không nói các phép kiểm tra vật lý đã thất bại. Bốn nội dung bị chặn gồm thẩm định học thuật, đánh giá khả năng tiếp cận độc lập, chạy thử ứng viên trên thiết bị thật và đối sánh vòng lặp Word.

### Slide 19 — Trả lời ngắn theo hiện trạng

> Kết luận học thuật chỉ được cập nhật khi có chứng cứ được ủy quyền. Quyết định phát hành chỉ được cập nhật sau khi chạy lại đủ 24 kiểm tra và không còn kết quả nào là “không đạt”, “chưa thể thực hiện” hoặc “chưa chạy”.

Chỉ Slide 17–18 trình bày tình trạng phát hành.

### Slide 20 — Mô phỏng 2D, 3D và thời gian

> Bắt đầu từ bài toán, giả thiết và phương trình; nối trạng thái tính toán với hình, điều khiển và số đo. Có 25 vị trí 2D; 10 vị trí trong số đó có bản 3D thử nghiệm, không cộng thành 35 bài. Three.js/WebGL dựng hình học từ trạng thái; khi lỗi cần trở về 2D. Chỉ dùng 3D+t khi thực sự có diễn biến thời gian; thay đổi tham số tĩnh học không tự thành 4D. Kiểm dấu, đơn vị, nghiệm chuẩn và biên trước khi kết luận.

### Slide 21 — GIF, video và âm thanh

> 20 GIF được dựng bằng mã Python từ hình học và quan hệ cơ học, có PNG thay thế. GIF không phải video. Không thấy tệp video/âm thanh trong danh mục gói ứng viên theo các đuôi đã kiểm kê; không suy rộng kết luận ra mọi nguồn. Quy trình video/âm thanh là phương án bổ sung: kịch bản, ghi hình/thu âm, dựng, phụ đề/bản chép lời, duyệt rồi mã hóa và thử ngoại tuyến. MP4/H.264 + AAC là đề xuất, không phải hiện vật đã có.

### Slide 22 — Đóng gói và liên thông

> Sản phẩm chính là web tĩnh, thư viện cục bộ, ZIP có phiên bản, danh mục và SHA-256. ZIP không đồng nghĩa SCORM. QTI 3 mới kiểm câu một lựa chọn, tối đa 10 mục; Common Cartridge 1.4 ở phạm vi nội dung web tĩnh. Kiểm adapter không chứng minh nhập, chạy hay lưu điểm trên LMS đích. SCORM và xAPI/cmi5 chưa triển khai; chỉ chọn khi đơn vị xác định hệ thống đích và yêu cầu theo dõi.

### Slide 23 — Tìm kiếm và đánh giá người học

> Chỉ mục cục bộ hỗ trợ tiếng Việt có dấu/không dấu, không mặc nhiên tìm công thức theo ngữ nghĩa hoặc trong PDF. 300 câu hỏi phục vụ tự kiểm tra và phản hồi; kết quả lưu trên trình duyệt, chưa phải sổ điểm có danh tính. Đánh giá chính thức cần ma trận mục tiêu, quy tắc chấm, rubric, danh tính và hệ thống lưu kết quả được duyệt. Số trang đã đọc không chứng minh nắm vững kiến thức.

**Đối chiếu hồ sơ:** Báo cáo chỉnh sửa mục 1.3–1.5, 2.5–2.8, 3.1–3.3; đề cương chỉnh sửa QC.1–QC.9. Không dùng phụ lục lịch sử RC2026.08.25 làm trạng thái hiện hành.

## 5. Trả lời ngắn, đúng phạm vi

1. **Đã có chữ ký học thuật độc lập chưa?**<br>
   Chưa. Hiện có 0 chữ ký học thuật độc lập.

2. **Bốn kết quả học tập có phải là bản cuối không?**<br>
   Chưa. Chúng đang ở mức sơ bộ; không có ngoại lệ đánh giá nào được tuyên bố.

3. **Ca đối chiếu trọng tâm có lưu ý gì?**<br>
   Với đúng hình này, đối chiếu bằng đối xứng, giới hạn tọa độ và diện tích có dấu; không áp dụng quy tắc rằng trọng tâm phải nằm trong phần vật liệu hoặc đường bao hình học.

4. **Gia tốc Coriolis có phải toàn bộ gia tốc không?**<br>
   Không. Đây chỉ là một thành phần của gia tốc.

5. **Khi nào ca va chạm một chiều dùng bảo toàn tổng động lượng?**<br>
   Khi va chạm thụ động, xung lực ngoài theo phương va chạm không đáng kể và `0 ≤ e ≤ 1`; khi đó `m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂`.

6. **Phần minh họa mô men dùng các giá trị nào?**<br>
   Điểm `O` cố định, `θ = 90°`; giữ `F = 50 N`, kéo điểm đặt lực đến `d⊥ = 4,00 m`, đọc `M = +200 N·m`, rồi đối chiếu PDF cục bộ. Quy ước ngược chiều kim đồng hồ là dương; phần minh họa không đổi `θ` hoặc dấu.

7. **QR mở gì và có thay thế kiểm tra gói ứng viên không?**<br>
   QR mở bản web để trình diễn. Bản web chưa được chứng minh giống hệt gói ứng viên `2026.09.02-candidate` và không thay thế kiểm tra gói ứng viên; gói cục bộ chỉ là phương án dự phòng.

8. **Khi nào cập nhật quyết định phát hành?**<br>
   Sau khi chạy lại đủ 24 kiểm tra và không còn “không đạt”, “chưa thể thực hiện” hoặc “chưa chạy”.

## 6. Cách diễn đạt cần tránh

- “Đã có chữ ký học thuật độc lập.”
- “Bốn kết quả học tập đã là bản cuối.”
- “Ba ca đối chiếu đã được thẩm định độc lập.”
- “Phần minh họa trực tiếp chứng minh hiệu quả học tập.”
- “Mô phỏng thay thế hoàn toàn việc học với giảng viên.”
- “Bản web để trình diễn giống hệt gói ứng viên hoặc thay thế kiểm tra gói ứng viên.”
- “Tình trạng phát hành được kết luận từ phần trình diễn.”