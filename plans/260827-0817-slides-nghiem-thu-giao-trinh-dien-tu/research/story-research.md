# Nghiên cứu mạch kể báo cáo nghiệm thu 15 phút

## Kết luận biên tập

Chọn mạch **nhu cầu đào tạo → giá trị học tập → bằng chứng → giới hạn → quyết nghị có điều kiện**. Hội đồng cần thấy giáo trình giải quyết đúng nhiệm vụ đào tạo trước khi nghe về công nghệ; phần QA phải là bằng chứng kiểm soát chất lượng, không phải màn “khoe test”. Không demo trực tiếp trong 15 phút: dùng 3–4 ảnh chụp tĩnh có chú thích; demo offline chỉ là phương án dự phòng khi Hội đồng yêu cầu.

Thông điệp trục: **“Sản phẩm đã có một ứng viên kỹ thuật tái lập và phần lớn gate kỹ thuật đã đạt; nhóm tác giả xin Hội đồng thông qua có điều kiện về mặt khoa học–sư phạm, không xin xác nhận ứng viên hiện tại là bản phát hành cuối.”**

## Ba cấu trúc khả thi

| Cấu trúc | Mạch | Ưu điểm | Nhược điểm |
|---|---|---|---|
| A. Theo cấu phần sản phẩm | Nội dung → giao diện → quiz → mô phỏng → PDF → QA | Dễ chuẩn bị, dễ gắn ảnh | Dễ thành “tour tính năng”; câu hỏi “giá trị đào tạo là gì?” đến quá muộn |
| B. Theo hành trình học viên | Trước học → học lý thuyết → luyện tập → quan sát mô phỏng → tự kiểm tra | Gần trải nghiệm người dùng; giàu tính sư phạm | Khó đưa 20/24 và quyết nghị vào tự nhiên; dễ bị hiểu là demo bán hàng |
| C. Theo lập luận nghiệm thu | Nhu cầu/phạm vi → giải pháp → bằng chứng → giới hạn → điều kiện đóng → quyết nghị | Đúng logic Hội đồng; trung thực; dẫn thẳng tới quyết định | Cần tiết chế chi tiết kỹ thuật và chuẩn bị câu trả lời sâu ở phụ lục |

**Khuyến nghị: C**, nhưng mượn một đoạn ngắn của B ở giữa để cho thấy một hành trình học cụ thể. Cấu trúc này bảo vệ uy tín tốt nhất khi trạng thái chính thức vẫn là `blocked`.

## Storyline khuyến nghị: 13 slide / đúng 15:00

| # | Thời lượng | Tiêu đề đề xuất | Một câu phải nhớ | Nội dung/visual chính |
|---|---:|---|---|---|
| 1 | 0:35 | **Giáo trình điện tử Cơ học lý thuyết** | Xin thông qua có điều kiện, không xin công nhận bản kỹ thuật hiện tại là bản cuối. | Học viện Hải quân; Khoa KTCS; 3 tác giả; nhãn “Báo cáo Hội đồng khoa học”. |
| 2 | 0:45 | **Bài toán đào tạo** | Giáo trình phục vụ học viên sĩ quan cấp phân đội trình độ đại học và ba mảng Tĩnh học–Động học–Động lực học. | Một sơ đồ 3 chương, không mô tả công nghệ. |
| 3 | 0:55 | **Phạm vi và trách nhiệm tác giả** | Một nguồn nội dung chuẩn, ba tác giả, một phạm vi công bố rõ. | Nguyễn Lê Văn (chủ biên), Đinh Văn Tứ, Bùi Thanh Xuân; `CoHocLyThuyet_Full_New.docx` là nguồn chuẩn. |
| 4 | 1:05 | **Từ giáo trình nguồn đến trải nghiệm học** | Điện tử hóa ở đây là hỗ trợ tìm–học–luyện–quan sát–ghi nhớ, không thay đổi tùy tiện nội dung nguồn. | Hành trình 5 bước; search, quiz, tiến độ, bookmark, notes, glossary, PDF. |
| 5 | 1:05 | **Học được khi không có mạng** | Sản phẩm tĩnh chạy qua `file://`, USB hoặc static server; không cần backend. | Sơ đồ DOCX → pipeline → gói offline; nhấn mạnh dữ liệu học tập lưu cục bộ. |
| 6 | 1:10 | **Tương tác gắn với nội dung** | Quiz và mô phỏng là công cụ học, không phải hiệu ứng trình diễn. | Một màn bài học + quiz + trạng thái học; tránh liệt kê mọi nút. |
| 7 | 1:10 | **Mô phỏng có lớp chính và lớp thử nghiệm** | Sim2 là chuẩn 25 route; Sim3 chỉ là pilot tùy chọn 10 route và luôn fallback về Sim2. | So sánh Sim2/Sim3; gắn nhãn rõ “canonical” và “pilot”. |
| 8 | 1:05 | **Kiểm soát tính toàn vẹn nội dung** | Nội dung, công thức, ảnh, điều hướng và traceability được sinh/kiểm theo pipeline; xác nhận học thuật vẫn do người có vai trò thực hiện. | Chuỗi DOCX → fragment/ảnh/nav/bundle → audit → review; không dùng từ “đã chứng nhận đúng học thuật”. |
| 9 | 1:10 | **Khả năng tiếp cận và chế độ an toàn** | Các hợp đồng tự động về bàn phím, reflow, contrast đã có bằng chứng; review độc lập chưa hoàn tất. | Bảng hai cột “đã kiểm tự động / còn cần người review”; reduced motion và fallback tĩnh. |
| 10 | 1:20 | **Ứng viên kỹ thuật có thể định danh** | Candidate 2026.08.25 gồm 374 tệp, ZIP có SHA-256 cố định; đây là ứng viên, chưa phải bản cuối. | Thẻ artifact + hash; technical smoke `file://` và HTTP; nhãn đỏ nhạt “candidate”. |
| 11 | 1:25 | **Báo cáo trung thực: 20/24, chưa đạt quyết định cuối** | 20 pass, 0 fail, 3 blocked, 1 not-run; vì còn gate mở nên trạng thái tổng thể là blocked. | Donut/stack 20–0–3–1 và bốn dòng gate mở; không dùng tỷ lệ 83,3% như điểm chất lượng. |
| 12 | 1:15 | **Bốn điều kiện để khóa bản cuối** | Không hạ chuẩn: đóng đúng bốn gate, tái tạo báo cáo và hash, rồi mới xác nhận phát hành. | Chủ thể–việc cần làm–bằng chứng đóng: academic currentness; accessibility review; independent smoke; Word round-trip. |
| 13 | 2:00 | **Đề nghị Hội đồng quyết nghị** | Thông qua có điều kiện về khoa học–sư phạm; bản cuối chỉ được xác nhận sau khi đủ bằng chứng. | Hiển thị nguyên văn quyết nghị bên dưới; kết bằng một câu xin ý kiến Hội đồng. |

Tổng: **15:00**. Không chèn demo vào ngân sách này. Nếu được yêu cầu, demo dự phòng tối đa 90 giây: mở gói bằng `file://` → tìm “mô men” → mở một Sim2 → mở PDF; dừng ngay khi đã chứng minh offline. Chuẩn bị ảnh chụp của bốn bước để thay thế nếu máy trình chiếu có sự cố.

## Cách nói chính xác về 20/24

Nên nói nguyên văn: **“Ma trận hiện có 24 gate: 20 pass, không có gate nào được phân loại fail, 3 gate đang blocked và 1 gate chưa chạy; vì quy tắc chấp nhận không cho phép còn blocked hoặc not-run, trạng thái tổng thể vẫn là blocked.”**

- `academic-review-currentness`: blocked vì ledger còn `sourceHash` cũ ở route tác giả; không suy diễn thành toàn bộ nội dung sai, cũng không gọi là đã được thẩm định.
- `accessibility-independent-review`: blocked vì review độc lập chưa hoàn tất; pass tự động không phải chứng nhận WCAG.
- `release-independent-smoke`: blocked vì smoke review độc lập chưa hoàn tất; technical smoke nội bộ không thay thế.
- `word-standalone-roundtrip`: `not-run`; log nêu gate/repository đã thay đổi nên phải chạy lại trên bản hiện hành. Không gọi đây là “Word lỗi” hoặc “đã tương thích Word”.

Không nên nói: “đã đạt 83,3% nên đủ nghiệm thu”, “chỉ còn thủ tục”, “không có lỗi”, “đã đạt WCAG”, “đã tương thích LMS”, hoặc “đã nghiệm thu kỹ thuật”. QTI 3/Common Cartridge mới được kiểm adapter cục bộ; chưa có bằng chứng import vào LMS đích.

## Quyết nghị đề nghị — nguyên văn

> **Hội đồng thống nhất thông qua có điều kiện về mặt khoa học–sư phạm đối với Giáo trình điện tử Cơ học lý thuyết của nhóm tác giả thuộc Khoa Kỹ thuật cơ sở, Học viện Hải quân; giao nhóm tác giả tiếp thu đầy đủ ý kiến Hội đồng và hoàn thiện sản phẩm. Bản ứng viên kỹ thuật ngày 25/8/2026 chưa được xác nhận là bản phát hành cuối. Trước khi trình xác nhận phát hành, nhóm tác giả phải: (1) cập nhật và hoàn tất thẩm định học thuật độc lập trên đúng nguồn hiện hành; (2) hoàn tất đánh giá khả năng tiếp cận độc lập; (3) hoàn tất smoke review độc lập trên gói phát hành đã đóng băng; (4) chạy và lưu bằng chứng Word standalone round-trip trên môi trường nộp thực tế; sau đó tái lập báo cáo 24/24 gate, danh mục tệp và SHA-256 để cơ quan có thẩm quyền xác nhận bản cuối.**

Nếu Hội đồng không có thẩm quyền “thông qua về mặt khoa học–sư phạm”, thay cụm đó bằng đúng thuật ngữ của quyết định thành lập Hội đồng; không mở rộng quyết nghị thành chứng nhận WCAG, pháp lý, LMS hay chấp nhận phát hành cuối.

## Câu hỏi Hội đồng có khả năng đặt ra

1. **Hội đồng đang được đề nghị phê duyệt điều gì?** — Giá trị khoa học–sư phạm và cho phép hoàn thiện có điều kiện; không phải final release của candidate.
2. **Nguồn nào là chuẩn khi website và Word khác nhau?** — DOCX là nguồn chuẩn; website là đầu ra được sinh và audit theo pipeline.
3. **Ba tác giả chịu trách nhiệm thế nào?** — Nêu đúng trang tác giả; chủ biên Nguyễn Lê Văn, biên soạn Đinh Văn Tứ và Bùi Thanh Xuân; phân công chi tiết chỉ nói nếu có hồ sơ chính thức.
4. **Ai bảo đảm công thức và mô phỏng đúng?** — Gate kỹ thuật kiểm nguồn/physics/oracle và traceability; xác nhận học thuật độc lập vẫn là điều kiện mở, không bị thay thế bởi test.
5. **20/24 có đủ để nghiệm thu không?** — Không đủ cho quyết định cuối theo chính policy; đó là lý do xin thông qua có điều kiện.
6. **Ba blocked có phải ba lỗi sản phẩm?** — Là ba gate bằng chứng/review chưa đóng; một gate academic currentness có hash cũ. Chưa có quyền gọi là pass, nhưng cũng không được đổi phân loại thành fail.
7. **Vì sao Word chưa chạy dù đây là giáo trình điện tử?** — DOCX là nguồn chuẩn và là tài liệu nộp; round-trip bảo đảm mở–cập nhật–lưu–mở lại–render trên môi trường thực tế.
8. **Có dùng được khi mất mạng?** — Có bằng chứng technical smoke cho `file://` và HTTP; HTTP smoke ghi 0 yêu cầu ra ngoài trong 76 request.
9. **Sim3 có bắt buộc phần cứng mạnh không?** — Không; Sim2 là chuẩn, Sim3 chỉ pilot và fallback về Sim2 khi WebGL lỗi.
10. **Đã đạt chuẩn accessibility chưa?** — Chỉ được nói gate tự động đã pass; review độc lập còn blocked, không claim WCAG.
11. **Có nhập được Moodle/Canvas không?** — Chưa có bằng chứng import LMS đích; chỉ có adapter QTI 3/Common Cartridge được kiểm cục bộ.
12. **Nếu demo hỏng thì sao?** — Quyết định dựa trên artifact, hash và evidence; demo chỉ dự phòng, ảnh chụp tĩnh đủ cho báo cáo chính.
13. **Sau Hội đồng, điều gì chứng minh đã hoàn tất?** — Bốn gate chuyển pass trên đúng nguồn/candidate, acceptance report 24/24, inventory và SHA-256 được tái lập.

## Chứng cứ repo nên trích ở speaker notes

- Phạm vi, đối tượng, ba chương: `chapters/loi-noi-dau.html:3-9`.
- Ba tác giả và đơn vị: `chapters/tac-gia.html:3-24`.
- Kiến trúc offline, chức năng, 25 Sim2/10 Sim3: `docs/project-overview-pdr.md:5-31`; `README.md:114-118`.
- Candidate 374 tệp, hash và tuyên bố chưa-final: `README.md:122-127`.
- Ma trận 20/0/3/1 và quyết định blocked: `data/acceptance-report.json:3-11,236-255`.
- Tên bốn gate mở: `plans/260820-0924-deep-tdd-remediation-for-electronic-textbook-release-readiness/reports/phase-12-acceptance-report.md:31-45`.
- Nguyên nhân cụ thể của từng blocker: các log tương ứng trong `.../evidence/command-captures/`.
- Technical smoke offline/HTTP và giới hạn của nó: `.../evidence/technical-smoke.md:1-19`.
- Giới hạn claim/LMS: `.../evidence/review-status-and-limitations.md:1-9`; `README.md:102-112`.
