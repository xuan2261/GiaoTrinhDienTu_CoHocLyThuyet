# Hướng dẫn thuyết trình — Giáo trình điện tử Cơ học lý thuyết

**Đơn vị:** Học viện Hải quân  
**Ngày báo cáo:** 05/10/2026  
**Tác giả:** TS Nguyễn Lê Văn — Chủ biên; ThS Đinh Văn Tứ — Biên soạn; ThS Bùi Thanh Xuân — Biên soạn  
**Kho mã:** https://github.com/xuan2261/GiaoTrinhDienTu_CoHocLyThuyet

## Cách dùng bộ báo cáo

- Mở bao-cao-hoi-dong-nang-cao.pptx để chỉnh sửa các đối tượng và đọc Speaker Notes.
- Mở presentation-slides.html bằng trình duyệt, kể cả qua file://. Ảnh đã nhúng trong tệp, không cần truy cập mạng.
- Dùng phím mũi tên, Home/End hoặc nút Trước/Tiếp. Phím N hoặc nút Ghi chú mở phần thuyết minh; URL #slide-N mở trực tiếp trang N.
- In presentation-slides.html để lấy đủ 34 trang 16:9. In handout-in-an-hoi-dong.html theo A4 dọc, 100%, không thêm header/footer trình duyệt để lấy 12 tờ, tối đa 3 slide mỗi tờ.
- Không sửa riêng số liệu trên slide. Cập nhật nguồn có thẩm quyền và dựng lại từ advanced-deck-content.js cùng advanced-deck-theme.js.

## Lưu ý biên tập

- Bộ mới gồm 1 trang QR mở đầu và 33 chủ đề theo tài liệu. Hai trang dự phòng nằm ở slide 33–34.
- Không sử dụng tỷ lệ minh họa 73%, điểm 8,2/10 hay tuyên bố QA 8/8 đạt như kết quả đã đo.
- QA được trích từ sổ ngày 2026-09-25: 11 pass, 9 fail, 4 blocked; không phải lần kiểm tra sản phẩm mới.
- 10 bản 3D bổ sung cho 25 vị trí 2D, không phải 35 bài độc lập. Thẩm định nguồn mô phỏng hiện tại còn pending.
- Các mốc roadmap, KPI, lợi ích và xác suất rủi ro là đề xuất, không phải cam kết được phê duyệt hoặc kết quả nghiên cứu người học.
- Dùng Arial để tránh thay font trên máy trình chiếu. Không dựng biểu trưng giả khi chưa có logo chính thức.

## Checklist trước báo cáo

- [ ] Chốt phiên bản kho mã và gói candidate được trích; phân biệt hồ sơ lịch sử với nguồn hiện tại.
- [ ] Đối chiếu QA với đúng snapshot; giữ nguyên fail, blocked và trạng thái revalidation pending nếu chưa có bằng chứng mới.
- [ ] Đối chiếu hash ZIP với hồ sơ; không dùng hash như chứng nhận học thuật hay hiệu quả học tập.
- [ ] Kiểm tên đơn vị, tác giả, ngày và quyền sử dụng hình; không dùng biểu trưng tự dựng.
- [ ] Mở PPTX trên máy trình chiếu, kiểm Arial, dấu tiếng Việt, bảng, hình và Speaker Notes của đủ 34 slide.
- [ ] Mở HTML ngoại tuyến; thử Trước/Tiếp, mũi tên, Home/End, ghi chú và liên kết #slide-34.
- [ ] Xem trước bản in đủ 34 trang 16:9 và handout đủ 12 tờ A4; bật đồ họa nền, tắt header/footer trình duyệt.
- [ ] Chuẩn bị các nguồn và bằng chứng để tra cứu; ảnh lịch sử không được dùng xác nhận mã mới.
- [ ] Quét QR ở slide 1; tập phần báo cáo chính theo phân bổ ở slide 4; dành 5–10 phút hỏi–đáp và chỉ mở slide 33–34 khi cần.
- [ ] Ghi nhận câu hỏi thiếu dữ liệu để kiểm chứng sau; không trả lời bằng tỷ lệ, điểm số hoặc hiệu quả chưa đo.

## Thuyết minh và nguồn của toàn bộ 34 slide

### Slide 1 — Trải nghiệm giáo trình trực tuyến

**Phần:** Truy cập trực tuyến

**Dẫn nhập:** Quét QR bằng điện thoại để mở phiên bản web.

Kính mời hội đồng quét mã QR để mở giáo trình trực tuyến tại https://xuan2261.github.io/GiaoTrinhDienTu\_CoHocLyThuyet/

Có thể dùng camera điện thoại hoặc ứng dụng quét QR. Trang QR được đặt trước phần báo cáo để người nghe truy cập học liệu trong lúc theo dõi.

**Thông điệp chính:** Kết nối Internet để truy cập web; giữ bản ngoại tuyến khi cần.

**Nguồn đầy đủ:**

- https://xuan2261.github.io/GiaoTrinhDienTu\_CoHocLyThuyet/
- assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/qr-code-online-textbook.png

### Slide 2 — GIÁO TRÌNH ĐIỆN TỬ CƠ HỌC LÝ THUYẾT

**Phần:** Mở đầu

**Dẫn nhập:** Kiến trúc · Chất lượng · Tác động

Kính thưa hội đồng, báo cáo này đánh giá giáo trình điện tử Cơ học lý thuyết được xây dựng phục vụ đào tạo tại Học viện Hải quân. Nội dung tập trung vào ba trục: kiến trúc triển khai, chất lượng có bằng chứng và giá trị giáo dục cần tiếp tục kiểm chứng.

Luận điểm xuyên suốt là sản phẩm có hiện vật kỹ thuật và quy trình kiểm tra, nhưng chưa được đồng nhất với chấp nhận học thuật. Những số liệu trong báo cáo được gắn với nguồn cụ thể; phần kế hoạch được phân biệt với kết quả đã đạt.

**Thông điệp chính:** Báo cáo hiện trạng, bằng chứng và lộ trình hoàn thiện — không thay quyết định nghiệm thu.

**Nguồn đầy đủ:**

- NghienCuuLamSlideMoi.txt
- data/acceptance-report.json
- chapters/tac-gia.html

### Slide 3 — Tóm tắt điều hành

**Phần:** Mở đầu

**Dẫn nhập:** Bốn con số phạm vi; ba kết luận để hội đồng ra quyết định.

Bốn con số gồm 372 tệp trong gói ứng viên, 25 vị trí mô phỏng 2D, 10 bản 3D bổ sung và tám nhóm kiểm tra để tổ chức trình bày. Tám nhóm không phải tám cổng đã đạt: Sổ 2026-09-25: 11 pass / 9 fail / 4 blocked.

Ba kết luận là có cơ sở kỹ thuật cho triển khai ngoại tuyến, chưa đủ điều kiện chấp nhận học thuật chính thức và có khả năng tái sử dụng quy trình cho môn khác. Giá trị chuyển giao vẫn cần thí điểm; không suy ra hiệu quả học tập hoặc chi phí bằng không.

**Thông điệp chính:** Phạm vi không phải chất lượng; chạy được không đồng nghĩa đã được nghiệm thu.

**Nguồn đầy đủ:**

- release/2026.09.02-candidate/release-summary.json
- js/sim2/sim2-route-manifest.js
- js/sim3/sim3-route-manifest.js
- data/acceptance-report.json

### Slide 4 — Lộ trình báo cáo — 25 phút

**Phần:** Mở đầu

**Dẫn nhập:** 1 trang QR · 30 slide nội dung · 1 trang hỏi–đáp · 2 trang dự phòng.

Báo cáo chính được phân bổ theo sáu khối với tổng thời gian mục tiêu 25 phút. Mở đầu và kết luận được lồng vào các khối thay vì cộng thêm ngoài ngân sách thời gian.

Trang QR mở đầu là slide 1. Sau slide 31 là trang hỏi–đáp. Hai trang 33 và 34 là dự phòng: chi tiết vòng đời tải bài và danh mục đầy đủ mô phỏng.

**Thông điệp chính:** Dành thêm 5–10 phút cho Q&A; phụ lục chỉ mở khi cần đào sâu.

**Nguồn đầy đủ:**

- NghienCuuLamSlideMoi.txt

### Slide 5 — Vì sao ngoại tuyến là quan trọng?

**Phần:** Mở đầu

**Dẫn nhập:** Thiết kế cho điều kiện kết nối bị hạn chế, không dựa vào tỷ lệ khảo sát giả định.

Trong môi trường kết nối hạn chế, bài học không nên phụ thuộc vào việc truy cập dịch vụ từ xa ở mỗi phiên học. Kiến trúc tài nguyên cục bộ của dự án hướng tới tình huống này; gói có thể được phân phối qua USB hoặc máy chủ tĩnh.

Tỷ lệ 73% trong tài liệu chỉ là minh họa, nên không được dùng làm bằng chứng về đơn vị. Tương tự, chưa có căn cứ trong phiên biên tập này để khẳng định 100% tính năng đã vượt qua thử nghiệm trên mọi thiết bị. Cần khảo sát và chạy thử độc lập trước khi mở rộng.

**Thông điệp chính:** Offline-first là lựa chọn theo bối cảnh sử dụng; phải thử trên thiết bị thực.

**Nguồn đầy đủ:**

- README.md
- docs/deployment-guide.md
- NghienCuuLamSlideMoi.txt

### Slide 6 — Phương pháp đánh giá

**Phần:** Phương pháp luận

**Dẫn nhập:** Bốn bước phân biệt thiết kế, thực thi, bằng chứng và chuẩn đối chiếu.

Bước một xác định hệ thống được thiết kế như thế nào từ mã và tài liệu. Bước hai quan sát nó chạy trong các điều kiện thực tế. Bước ba kiểm tra đầu ra, dấu thời gian và hash của bằng chứng để tránh lấy ảnh bản cũ chứng minh cho mã mới.

Bước bốn dùng chuẩn ngành làm khung đối chiếu, không phải chứng nhận tự động. Báo cáo này sử dụng hồ sơ kiểm tra đã lưu; việc dựng và kiểm bộ slide không phải lần chạy lại toàn bộ QA của sản phẩm. Nguồn mô phỏng mới vẫn có trạng thái revalidation pending.

**Thông điệp chính:** Chỉ kết luận trong phạm vi đã kiểm tra và đúng phiên bản nguồn.

**Nguồn đầy đủ:**

- README.md
- data/evidence-registry.json
- data/acceptance-report.json
- data/simulation-current-revalidation.json

### Slide 7 — Sáu tiêu chí đánh giá

**Phần:** Phương pháp luận

**Dẫn nhập:** Dùng bằng chứng và trạng thái thay cho điểm số chưa được thẩm định.

Sáu tiêu chí giữ nguyên ý định đánh giá của tài liệu: kiến trúc, tính năng, chất lượng, tiếp cận, phát hành và chuyển giao. Mỗi tiêu chí được nối với hiện vật hoặc trạng thái kiểm tra thay vì một thang điểm có vẻ chính xác nhưng chưa có quy trình chấm.

Các điểm 8, 9, 10 và tổng 8,2 trong bản đề xuất chưa phải kết quả khảo sát hoặc đánh giá độc lập. Đặc biệt không thể chấm QA tuyệt đối khi sổ hiện có fail và blocked. Hội đồng có thể phê duyệt rubric và tổ chức đánh giá riêng sau báo cáo này.

**Thông điệp chính:** Không dùng 8,2/10 làm kết luận độc lập khi chưa có rubric và người chấm.

**Nguồn đầy đủ:**

- data/acceptance-report.json
- data/presentation-specification.json
- docs/system-architecture.md

### Slide 8 — Nguồn dữ liệu và bằng chứng

**Phần:** Phương pháp luận

**Dẫn nhập:** Tám tuyến tra cứu, mỗi tuyến có chức năng riêng.

Các nguồn được chia theo chức năng để người nghe có thể kiểm lại tuyên bố. Mã nguồn chỉ ra cơ chế; manifest chỉ ra phạm vi; hồ sơ thực thi mới cho biết kết quả trên một phiên bản và môi trường cụ thể.

Lịch sử Git giúp nhận diện thay đổi, không tự chứng minh chất lượng. Tương tự, tồn tại tests hoặc thư mục evidence chưa đủ: phải kiểm kết quả, hash và ràng buộc với gói đang báo cáo. Các ảnh giao diện dùng trong bộ này được ghi rõ là minh họa lịch sử.

**Thông điệp chính:** Định nghĩa một phép kiểm tra không chứng minh phép kiểm tra đó đã pass.

**Nguồn đầy đủ:**

- README.md
- data/evidence-registry.json
- data/acceptance-report.json

### Slide 9 — Tổng quan dự án

**Phần:** Tổng quan

**Dẫn nhập:** Một giáo trình tĩnh cho ba chương Cơ học lý thuyết.

Sản phẩm là giáo trình điện tử tĩnh với ba chương. Nguồn narrative chuẩn là CoHocLyThuyet\_Full\_New.docx; một số bảng tra cứu và dữ liệu kiểm tra được quản lý riêng dưới data. Runtime phát hành không cần npm hoặc một backend phục vụ từng người học.

Các khác biệt đáng chú ý là tài nguyên ngoại tuyến, quy trình tạo nội dung, mô phỏng và khả năng truy vết. Không gọi đây là hệ thống không có dependency: KaTeX, Three.js và PDF.js là thư viện đóng gói cục bộ. Việc tác giả sửa DOCX không loại bỏ vai trò của kỹ thuật trong tái tạo và kiểm tra.

**Thông điệp chính:** Không cần backend cho đọc học liệu; bảo trì và QA vẫn cần đầu mối kỹ thuật.

**Nguồn đầy đủ:**

- README.md
- CoHocLyThuyet\_Full\_New.docx
- data/presentation-specification.json

### Slide 10 — Phạm vi: giáo trình, không phải LMS

**Phần:** Tổng quan

**Dẫn nhập:** Ranh giới rõ để tránh kỳ vọng sai về tài khoản, sổ điểm và đồng bộ.

Bảng này tách những hiện vật có trong dự án khỏi khả năng mà một LMS thường cung cấp. Giáo trình có hỗ trợ tự học, nhưng không có danh tính người học hoặc cơ chế đồng bộ tập trung trong phạm vi hiện tại.

Có các bản dẫn xuất QTI 3 và Common Cartridge 1.4 ở mức pilot. Điều đó không có nghĩa SCORM, xAPI hay cmi5 đã được triển khai, cũng không chứng minh liên thông trên LMS thật. Giới hạn này cần được duy trì trong hồ sơ bàn giao và khuyến nghị sử dụng.

**Thông điệp chính:** Gói ZIP không phải LMS; dữ liệu tự học cục bộ không phải sổ điểm chính thức.

**Nguồn đầy đủ:**

- README.md
- data/presentation-specification.json
- data/lms-targets.json

### Slide 11 — Kiến trúc năm lớp

**Phần:** Tổng quan

**Dẫn nhập:** Phân tách giao diện, tải bài, runtime, nội dung và dữ liệu.

Năm lớp ở đây là cách trình bày kiến trúc để hội đồng thấy các trách nhiệm chính. Shell điều khiển giao diện; loader tải bài; runtime quản lý mô phỏng, PDF và quiz; content chứa học liệu; data giữ các cấu trúc và hồ sơ kiểm chứng.

Phân lớp tạo điều kiện bảo trì nhưng các lớp vẫn có hợp đồng liên kết. Thay engine mô phỏng hoặc schema có thể ảnh hưởng loader và nội dung. Vì vậy phải kiểm các điểm mount, dispose, route và dữ liệu thay vì tuyên bố có thể thay độc lập tuyệt đối.

**Thông điệp chính:** Phân lớp giúp xác định nơi sửa và nơi kiểm; không đảm bảo thay engine không có tác động.

**Nguồn đầy đủ:**

- docs/system-architecture.md
- js/loader.js
- README.md

### Slide 12 — Offline-first: cơ chế và phép chứng minh

**Phần:** Kiến trúc và tính năng

**Dẫn nhập:** Tài nguyên đóng gói cục bộ; kết luận phải gắn với máy và gói đã thử.

Gói standalone có tài nguyên nội dung và thư viện cục bộ. Cơ chế này tránh yêu cầu gọi CDN trong quá trình đọc và cho phép mở bằng file:// hoặc máy chủ tĩnh. Hồ sơ technical-smoke của candidate là bằng chứng có giới hạn theo thời điểm và gói.

Không suy từ cơ chế sang cam kết mọi tính năng chạy trên mọi trình duyệt. Cần kiểm đường dẫn tương đối, localStorage, PDF, mô phỏng và fallback trên máy trình chiếu. Gate smoke độc lập vẫn bị chặn trong hồ sơ; báo cáo giữ trạng thái đó.

**Thông điệp chính:** Ngoại tuyến là đặc tính thiết kế; 100% tính năng cần bộ bằng chứng đầy đủ.

**Nguồn đầy đủ:**

- README.md
- release/2026.09.02-candidate/technical-smoke.md
- data/acceptance-report.json

### Slide 13 — Sim2 và Sim3: chiến lược hai tầng

**Phần:** Kiến trúc và tính năng

**Dẫn nhập:** 10 bản 3D tăng cường trải nghiệm trên những vị trí 2D đã có.

Sim2 là lớp cơ sở trên 25 vị trí. Mười vị trí trong số đó có tùy chọn Sim3; đây là hai cách biểu diễn cùng chủ đề chứ không phải 35 bài khác nhau. Lựa chọn 3D cần giá trị sư phạm rõ và phương án dự phòng khi không có WebGL.

README mô tả fixed-step 1/60 giây và demand rendering của Sim3. Đây là thông tin thiết kế, không phải kết quả đo 60fps trên thiết bị. Nguồn mô phỏng được cập nhật trên GitHub gần đây và trạng thái kiểm lại hiện pending, nên ảnh và pass lịch sử không được dùng xác nhận mã mới.

**Thông điệp chính:** Không cộng 25 + 10 thành 35 bài; bước thời gian 1/60 s không phải đo FPS.

**Nguồn đầy đủ:**

- js/sim2/sim2-route-manifest.js
- js/sim3/sim3-route-manifest.js
- data/simulation-current-revalidation.json
- README.md

### Slide 14 — Sáu tính năng học tập tương tác

**Phần:** Kiến trúc và tính năng

**Dẫn nhập:** Hỗ trợ tự học; không đồng nhất với quản lý đào tạo có danh tính.

Sáu tính năng tạo vòng tự học: tìm bài, tương tác, làm câu hỏi và ghi nhận tiến độ. Tìm kiếm dùng chỉ mục văn bản cục bộ; quiz có chọn phạm vi và khôi phục lượt làm; tiến độ, bookmark, ghi chú sử dụng bộ nhớ trình duyệt.

Điểm số quiz và lượt đọc chưa chứng minh chuẩn đầu ra đã đạt. Dữ liệu localStorage không tự đồng bộ giữa máy, có thể mất khi xóa dữ liệu hoặc đổi hồ sơ trình duyệt. Đơn vị triển khai cần hướng dẫn riêng về lưu giữ và chuyển dữ liệu cá nhân.

**Thông điệp chính:** Dữ liệu thuộc trình duyệt; phải giải thích rủi ro mất hoặc không chuyển theo USB.

**Nguồn đầy đủ:**

- README.md
- js/quiz-state.js
- js/progress.js
- js/notes.js
- js/glossary.js

### Slide 15 — PDF nội tuyến: giữ ngữ cảnh học

**Phần:** Kiến trúc và tính năng

**Dẫn nhập:** Dialog chuyên dụng thay vì chuyển người học ra khỏi bài.

Trình đọc PDF được mở nội tuyến và nạp tài nguyên khi người dùng cần. Thiết kế cho phép chuyển trang, nhập trang, zoom, tải xuống và đóng bằng Escape hoặc Browser Back trong khi giữ ngữ cảnh bài.

Ảnh trên slide là ảnh đã có trong kho, không phải lần kiểm thử mới. Gate PDF-release đang fail trong sổ lịch sử; vì vậy các thao tác được mô tả như phạm vi thiết kế, không nâng thành cam kết kiểm thử toàn bộ đã pass. Tìm kiếm, thumbnail và annotation PDF chưa nằm trong hiện vật.

**Thông điệp chính:** Mở PDF cần kiểm cả hiển thị lẫn trạng thái khi đóng dialog.

**Nguồn đầy đủ:**

- README.md
- js/pdf-viewer.js
- data/acceptance-report.json
- assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/img-06-pdf-viewer-1440x1000.png

### Slide 16 — GIF với phương án dự phòng

**Phần:** Kiến trúc và tính năng

**Dẫn nhập:** Progressive enhancement: ảnh động khi phù hợp, ảnh tĩnh khi cần.

Manifest quản lý 20 GIF được chọn cho các hình cơ học. Nút ảnh động cho phép đổi giữa GIF và PNG; prefers-reduced-motion định hướng sử dụng ảnh tĩnh. Cơ chế dự phòng hướng đến việc không làm người học mất hình minh họa khi ảnh động lỗi.

Đây là quan sát thiết kế và số lượng trong gói. Gate gif-release vẫn fail trong hồ sơ đã lưu, nên cần kiểm lại tài nguyên, tình huống lỗi và thao tác người dùng trên bản đích. Không nhầm GIF với video hoặc học liệu âm thanh.

**Thông điệp chính:** Có fallback không đồng nghĩa mọi ảnh đã qua kiểm tra phát hành.

**Nguồn đầy đủ:**

- js/gif-figures.js
- README.md
- data/acceptance-report.json

### Slide 17 — Khả năng tiếp cận: nói đúng giới hạn

**Phần:** Kiến trúc và tính năng

**Dẫn nhập:** Kiểm tự động là một phần; đánh giá thủ công độc lập là phần riêng.

Dự án có các cơ chế hướng tới khả năng tiếp cận và các phép kiểm tự động. Các phép kiểm có thể phát hiện một phần vấn đề, nhưng không đánh giá hết ngữ nghĩa công thức, thao tác với mô phỏng hoặc trải nghiệm trình đọc màn hình.

Hồ sơ lưu gate phase-08-accessibility là fail và gate review độc lập là blocked. Không dùng ngôn ngữ chứng nhận WCAG 2.2 AA. Muốn kết luận mức đáp ứng cần đối chiếu từng tiêu chí áp dụng, kiểm thủ công và lưu bằng chứng đúng bản nguồn.

**Thông điệp chính:** Có test không phải pass; pass tự động không thay đối chiếu WCAG đầy đủ.

**Nguồn đầy đủ:**

- data/accessibility-baseline.json
- data/acceptance-report.json
- data/presentation-specification.json

### Slide 18 — QA: tám nhóm, 24 cổng thực tế

**Phần:** Chất lượng và bằng chứng

**Dẫn nhập:** Khung nhóm để trình bày; không phải bảng tám cổng đã đạt.

Tám nhóm này giúp hội đồng hiểu các loại rủi ro được bao phủ. Sổ QA thực tế có 24 cổng. Không thể thay trạng thái của sổ bằng cách gộp thành tám hàng hoặc bằng sửa lời thuyết minh.

Sổ 2026-09-25: 11 pass / 9 fail / 4 blocked. Các lần soak ba lượt liên tiếp và revalidation nguồn mới là yêu cầu cần có bằng chứng. Approval cuối phải đi qua các điều kiện học thuật, tiếp cận và chạy thử độc lập, không được suy ra từ việc công cụ build xuất được ZIP.

**Thông điệp chính:** Sổ 2026-09-25: 11 pass / 9 fail / 4 blocked. Soak: yêu cầu ba lần liên tiếp, không tự coi đã hoàn tất.

**Nguồn đầy đủ:**

- package.json
- data/qa-gates.json
- data/acceptance-report.json

### Slide 19 — Academic review: chuỗi truy vết

**Phần:** Chất lượng và bằng chứng

**Dẫn nhập:** Yêu cầu → mục tiêu học tập → học liệu → kiểm chứng → ký duyệt.

Chuỗi truy vết nối căn cứ đào tạo và mục tiêu với nội dung, quiz, mô phỏng và bằng chứng. Ledger giúp ghi lại nội dung cần review và tình trạng, chứ bản thân kích thước tệp không phản ánh chất lượng học thuật.

Ledger đo được 836233 byte và sổ academic\_signoffs có 0 bản ghi. Gate học thuật vẫn bị chặn. Cần review độc lập, đúng thẩm quyền và đúng phiên bản; không được tự ghi nhận đạt chuẩn đầu ra bằng tồn tại metadata LO.

**Thông điệp chính:** Ledger 836.233 byte; 0 bản ký trong sổ — dữ liệu không thay phê duyệt.

**Nguồn đầy đủ:**

- data/academic\_review\_ledger.json
- data/academic\_signoffs.json
- data/learning-outcomes.json
- data/acceptance-report.json

### Slide 20 — Release: tái tạo và xác minh

**Phần:** Chất lượng và bằng chứng

**Dẫn nhập:** Gói ứng viên lịch sử phải được phân biệt với mã nguồn đang thay đổi.

Gói ứng viên là 2026.09.02-candidate, ZIP 78739543 byte. SHA-256 đầy đủ: 3defec1306bab10288faed66e45f19d8aa2befc2b66ecb1b6f2066df186f005a. Hash đã được tính trực tiếp khi chuẩn bị báo cáo và khớp sổ ứng viên.

Xác minh hash chỉ xác nhận tệp đúng như hồ sơ. Tái tạo cùng byte cần chạy build với điều kiện cố định; phiên này không thay bằng chứng reproducibility lịch sử. Candidate không phải final acceptance, và mã nguồn hiện tại đã có thay đổi cần kiểm lại riêng.

**Thông điệp chính:** Hash xác nhận đúng byte của gói, không xác nhận học thuật hoặc mã mới đã đạt.

**Nguồn đầy đủ:**

- data/release-candidate.json
- release/2026.09.02-candidate/release-summary.json
- data/acceptance-report.json

### Slide 21 — Tuyên bố nào, bằng chứng đó

**Phần:** Chất lượng và bằng chứng

**Dẫn nhập:** Không dùng đường dẫn giả hoặc số đếm suy diễn.

Slide này là bản đồ kiểm chứng cho các con số chính. Số tệp lấy từ staging.fileCount của summary, không lấy bằng ls ở thư mục chứa nhiều bản gói. Danh mục mô phỏng nằm ở hai manifest JavaScript thực tế, không phải routes.json.

Hash gói candidate là 3defec1306bab10288faed66e45f19d8aa2befc2b66ecb1b6f2066df186f005a. Kết quả QA được gắn với snapshot 2026-09-25T13:56:04Z. Khi dữ liệu được cập nhật, dựng lại báo cáo từ nguồn thay vì sửa số riêng trên slide. Không dùng hash hay ảnh gói cũ để đóng finding của nguồn mới.

**Thông điệp chính:** Lưu toàn bộ đường dẫn và hash trong Notes để hội đồng truy lại.

**Nguồn đầy đủ:**

- release/2026.09.02-candidate/release-summary.json
- data/release-candidate.json
- js/sim2/sim2-route-manifest.js
- js/sim3/sim3-route-manifest.js
- data/acceptance-report.json
- data/simulation-current-revalidation.json

### Slide 22 — So sánh theo điều kiện triển khai

**Phần:** So sánh và đánh giá

**Dẫn nhập:** Các giải pháp phục vụ mục đích khác nhau; không có lựa chọn tốt nhất tuyệt đối.

Bảng so sánh tập trung vào điều kiện sử dụng và phạm vi, không chấm điểm sản phẩm khác. Moodle có thể triển khai tại chỗ hoặc trong LAN và ứng dụng có tính năng offline có điều kiện. Google Classroom trên iOS/Android cho đọc thông báo, bài và sửa tài liệu đã tải trước theo tài liệu chính thức.

Giáo trình này không cần dịch vụ tập trung khi đọc gói, nhưng không thay chức năng LMS về tài khoản và sổ điểm. Cả bản giấy lẫn phần mềm đều có chi phí biên soạn, bảo trì và phân phối; không dùng zero-cost. Tài liệu Moodle được tìm thấy qua nguồn chính thức nhưng truy cập trực tiếp bị chặn, nên không mở rộng kết luận về từng chức năng offline.

**Thông điệp chính:** Lợi thế là phân phối cục bộ; không tuyên bố đối thủ không có offline hoặc QA.

**Nguồn đầy đủ:**

- README.md
- https://docs.moodle.org/en/Moodle\_app\_offline\_features
- https://support.google.com/edu/classroom/answer/11015503?hl=en

### Slide 23 — Mười điểm mạnh, ba nhóm

**Phần:** So sánh và đánh giá

**Dẫn nhập:** Điểm mạnh thiết kế được phân biệt với kết quả thẩm định.

Bốn điểm kỹ thuật là tài nguyên cục bộ, phân lớp trách nhiệm, pipeline nội dung và hai tầng mô phỏng. Ba điểm tổ chức chất lượng là khung QA, liên kết truy vết và ledger review. Ba điểm người dùng là cơ chế tiếp cận, giữ ngữ cảnh PDF và fallback GIF.

Không gọi QA cấp công nghiệp như một chứng nhận hoặc mặc định chất lượng tuyệt đối. Những điểm mạnh là cơ chế quan sát được giúp quản lý rủi ro; vẫn phải kiểm lại thực thi và xem bằng chứng chấp nhận. Khả năng chuyển giao cần thử trên học phần khác.

**Thông điệp chính:** Các cơ chế tạo nền tảng kiểm soát chất lượng, không thay kết quả kiểm tra.

**Nguồn đầy đủ:**

- README.md
- docs/system-architecture.md
- data/academic\_review\_ledger.json
- data/qa-gates.json

### Slide 24 — Hạn chế theo mức ảnh hưởng

**Phần:** So sánh và đánh giá

**Dẫn nhập:** Ưu tiên đề xuất: chấp nhận học thuật và tính đúng của bản nguồn trước mở rộng.

Hai hạn chế ưu tiên cao là thiếu chấp nhận học thuật chính thức và thiếu bằng chứng chạy liên thông LMS thật. Bốn điểm trung bình gồm phụ thuộc nguồn DOCX, QA cần bộ công cụ dev, phạm vi Sim3 pilot và PDF chưa search/thumbnail/annotation.

Hai điểm còn lại là bundle pages.js 1411022 byte và các mục bài tập Chương 3 VII-4 đến VII-6 đã loại khỏi phạm vi. Phân hạng này là đề xuất biên tập, chưa phải đánh giá rủi ro được đơn vị phê duyệt. Nguồn mô phỏng mới còn cần kiểm lại nên không được sử dụng như bản đạt đầy đủ.

**Thông điệp chính:** Nguồn mô phỏng mới còn pending; mức ảnh hưởng là đánh giá đề xuất.

**Nguồn đầy đủ:**

- data/acceptance-report.json
- data/lms-targets.json
- data/simulation-current-revalidation.json
- README.md
- js/pages.js

### Slide 25 — Năm rủi ro và cách xử lý

**Phần:** So sánh và đánh giá

**Dẫn nhập:** Ước lượng định tính để ưu tiên; chưa có dữ liệu xác suất.

Năm rủi ro gồm lệch nội dung sau sửa DOCX, thiếu WebGL, học thuật lỗi thời, thời gian tải bundle và mất dữ liệu cục bộ. Biện pháp đã có về thiết kế như fallback và pipeline cần kiểm thực thi; biện pháp mới như backup phải được ghi là đề xuất.

Chưa có thống kê xác suất nên không trình bày Cao/Trung bình/Thấp như số liệu đo. Tối ưu bundle phải dựa vào thời gian mở và mức sử dụng bộ nhớ trên máy đích. Không tuyên bố đã có export/import JSON khi chưa có bằng chứng về giao diện và phạm vi dữ liệu đó.

**Thông điệp chính:** Biện pháp dự kiến không phải tính năng đã có; không tự nhận export/import JSON.

**Nguồn đầy đủ:**

- README.md
- data/academic\_review\_ledger.json
- data/simulation-current-revalidation.json

### Slide 26 — Tác động giáo dục cần kiểm chứng

**Phần:** Tác động và khuyến nghị

**Dẫn nhập:** Giá trị kỳ vọng đối với ba nhóm, không phải hiệu quả đã đo.

Đối với học viên, giá trị kỳ vọng là tiếp cận học liệu trong điều kiện hạn chế kết nối và quan sát những đại lượng cơ học khó thấy trong trang giấy. Đối với giảng viên, nguồn DOCX và truy vết hỗ trợ cập nhật, nhưng tái tạo và QA vẫn cần phối hợp kỹ thuật.

Đối với nhà trường, khả năng phân phối cục bộ và tái sử dụng quy trình là hướng đáng thí điểm. Chưa có số liệu trước–sau, nhóm đối chứng hoặc tổng chi phí sở hữu để kết luận tăng chất lượng đào tạo hay tiết kiệm tiền. Cần kế hoạch đo lường riêng, bảo đảm quyền riêng tư người học.

**Thông điệp chính:** Cần nghiên cứu người học để kết luận hiệu quả, chi phí và khả năng nhân rộng.

**Nguồn đầy đủ:**

- data/presentation-specification.json
- data/learning-outcomes.json
- README.md

### Slide 27 — Sáu bài học có thể chuyển giao

**Phần:** Tác động và khuyến nghị

**Dẫn nhập:** Nguyên tắc thực hành, không phải kết luận tổng quát từ thử nghiệm giáo dục.

Sáu bài học là lựa chọn thiết kế rút ra từ hiện vật: giữ chất lượng trong kiến trúc ngoại tuyến, tự động hóa tái tạo, tạo truy vết sớm, có điều kiện tiếp cận rõ, quản lý phiên bản và trung thực về trạng thái.

Đây là kinh nghiệm tổ chức dự án, không chứng minh mọi giáo trình phải dùng cùng công nghệ. Khi chuyển sang môn khác phải rà soát nguồn, cấu trúc, mô hình đặc thù và quyền sử dụng tài nguyên; pipeline không đảm bảo thay nội dung là dùng được ngay.

**Thông điệp chính:** Nhân rộng quy trình kiểm chứng trước khi nhân rộng số lượng tính năng.

**Nguồn đầy đủ:**

- README.md
- docs/docx-sync-pipeline.md
- data/acceptance-report.json

### Slide 28 — Roadmap đề xuất: ba giai đoạn

**Phần:** Tác động và khuyến nghị

**Dẫn nhập:** Mốc tương đối từ khi kế hoạch được đơn vị phê duyệt.

Giai đoạn ngắn hạn tập trung sửa các finding, kiểm nguồn mô phỏng hiện tại và hoàn thiện review độc lập, bao gồm học thuật, tiếp cận, smoke và Word round-trip. Cần thống nhất người chịu trách nhiệm và điều kiện kết thúc trước khi bắt đầu.

Trung hạn thí điểm liên thông trên hai nền tảng đích và lựa chọn chỗ mở rộng Sim3 theo nhu cầu sư phạm. Dài hạn gồm đo hiệu năng, nâng trải nghiệm PDF và thử chuyển giao. Những mốc này là đề xuất, không phải tiến độ đã được cấp nguồn lực hoặc phê duyệt.

**Thông điệp chính:** Ưu tiên đóng điều kiện chấp nhận; không mở rộng 3D chỉ để tăng số lượng.

**Nguồn đầy đủ:**

- data/acceptance-report.json
- data/simulation-current-revalidation.json
- data/lms-targets.json
- NghienCuuLamSlideMoi.txt

### Slide 29 — KPI: baseline và mục tiêu đề xuất

**Phần:** Tác động và khuyến nghị

**Dẫn nhập:** Mỗi mục tiêu cần định nghĩa cách đo, người xác nhận và bản nguồn.

Baseline QA lấy từ snapshot 2026-09-25T13:56:04Z; không phải kết quả chạy lại nguồn mới. Mục tiêu 24/24 chỉ có giá trị khi đủ ràng buộc bằng chứng và điều kiện review, không phải đơn giản sửa trạng thái trong JSON.

Chỉ số mở rộng mô phỏng không đặt 40+ bài vì 3D là bản tăng cường của 2D; trước hết giữ tính đúng rồi mới mở rộng. Các mục tiêu về hai LMS và ba học phần là đề xuất để thảo luận nguồn lực. Tác động học tập cần một chỉ số nghiên cứu riêng, không thay bằng đếm tài nguyên.

**Thông điệp chính:** Mục tiêu không phải cam kết; 25 vị trí và 10 bản 3D không cộng thành 35 bài.

**Nguồn đầy đủ:**

- data/acceptance-report.json
- data/academic\_signoffs.json
- data/lms-targets.json
- js/sim2/sim2-route-manifest.js
- js/sim3/sim3-route-manifest.js

### Slide 30 — Năm khuyến nghị cho hội đồng

**Phần:** Tác động và khuyến nghị

**Dẫn nhập:** Đề nghị thống nhất ưu tiên và điều kiện chuyển bước.

Khuyến nghị thứ nhất và thứ hai là hoàn thiện review độc lập về học thuật và khả năng tiếp cận. Khuyến nghị thứ ba yêu cầu minh chứng thực tế trên LMS đích thay vì chỉ có tệp chuẩn. Thứ tư là chuyển giao qua thí điểm, không sao chép kỳ vọng giữa các môn.

Khuyến nghị cuối giữ nguyên nguyên tắc trung thực về giới hạn. Sửa hồ sơ hoặc dựng slide không đóng được gate fail hay blocked. Đề nghị hội đồng ghi nhận hiện vật và thống nhất lộ trình hoàn thiện; quyền chấp nhận cuối cùng thuộc quy trình riêng của đơn vị.

**Thông điệp chính:** Đề nghị tiếp tục hoàn thiện có điều kiện, chưa đề nghị nghiệm thu cuối cùng.

**Nguồn đầy đủ:**

- data/acceptance-report.json
- data/presentation-specification.json
- NghienCuuLamSlideMoi.txt

### Slide 31 — Kết luận: ba luận điểm

**Phần:** Kết thúc

**Dẫn nhập:** Có hiện vật kỹ thuật; cần review độc lập; có hướng chuyển giao.

Ba luận điểm khép lại báo cáo: kiến trúc và gói phát hành cho thấy có cơ sở kỹ thuật, hồ sơ hiện tại chưa đủ chấp nhận học thuật, và quy trình có thể là nền tảng chuyển giao sau thí điểm.

Kết luận không phải chứng nhận mọi tính năng ngoại tuyến đã pass hoặc hiệu quả giáo dục đã được chứng minh. Hành động thiết thực là kiểm bản nguồn hiện tại, sửa finding và tổ chức review độc lập để tạo bằng chứng mà hội đồng có thể kiểm lại.

**Thông điệp chính:** Tiếp tục đầu tư vào bằng chứng và thẩm định trước khi mở rộng phạm vi.

**Nguồn đầy đủ:**

- data/acceptance-report.json
- data/simulation-current-revalidation.json
- data/release-candidate.json

### Slide 32 — CẢM ƠN HỘI ĐỒNG Q & A

**Phần:** Kết thúc

**Dẫn nhập:** Trao đổi về bằng chứng, phạm vi sử dụng và ưu tiên hoàn thiện.

Cảm ơn hội đồng đã lắng nghe. Tôi xin nhận các câu hỏi về căn cứ kỹ thuật, phạm vi học thuật và cách ưu tiên đầu tư. Những câu hỏi cần số liệu khảo sát hoặc kiểm chứng mới sẽ được ghi lại thay vì trả lời bằng ước lượng chưa có nguồn.

Hai trang dự phòng tiếp theo trình bày vòng đời loader và danh mục tất cả vị trí mô phỏng. Có thể mở chúng khi cần làm rõ kiến trúc hoặc phạm vi; không trình bày như bằng chứng runtime đã pass ở bản nguồn mới.

**Thông điệp chính:** Sẵn sàng đối chiếu nguồn; không suy đoán thay bằng chứng còn thiếu.

**Nguồn đầy đủ:**

- README.md
- NghienCuuLamSlideMoi.txt

### Slide 33 — Chi tiết kiến trúc và vòng đời bài

**Phần:** Dự phòng cho Q&A

**Dẫn nhập:** PAGE\_MAP, fragment, render toán, mount và dispose.

Loader đóng vai trò điều phối nội dung và runtime. Từ route, nó tìm fragment hoặc nội dung bundle rồi cập nhật bài. Công thức được render và mô phỏng được mount theo base route. Hợp đồng SIM\_MAP trả về factory với dispose là điểm cần kiểm khi điều hướng.

Khi đổi bài phải giải phóng listener, observer, RAF và DOM thuộc mô phỏng. PDF giữ route là một đường trạng thái riêng cần kiểm để không dispose nhầm. Đây là giải thích mã thiết kế; nguồn mới cần bằng chứng revalidation về vòng đời và fallback, không được coi các capture cũ là xác nhận.

**Thông điệp chính:** Vòng đời phải chống listener, RAF và DOM còn sót khi đổi route.

**Nguồn đầy đủ:**

- js/loader.js
- js/pages.js
- README.md
- data/simulation-current-revalidation.json

### Slide 34 — Danh mục đầy đủ mô phỏng

**Phần:** Dự phòng cho Q&A

**Dẫn nhập:** 25 vị trí Sim2 · ký hiệu 3D đánh dấu 10 bản tăng cường trên cùng bài.

Phụ lục liệt kê đầy đủ 25 vị trí cơ sở theo ba chương: 10 Tĩnh học, 7 Động học và 8 Động lực học. Ký hiệu 3D chỉ những vị trí có bản Three.js thử nghiệm; tất cả vẫn thuộc tập bài 2D.

Mười vị trí có Sim3: ch1-1-5 — Thu gọn hệ lực phẳng → R + Mo; ch1-5-3 — Nón ma sát trên mặt nghiêng; ch2-1-3 — Tiếp/pháp tuyến + bán kính cong; ch2-2-2 — Quay quanh trục cố định (ω, α); ch2-3-2 — Truyền động bánh răng–đai–puli; ch2-4-4 — Hợp chuyển động & Coriolis; ch2-5-3 — Phân bố vận tốc điểm trên vật rắn; ch3-1-3 — HQC quán tính vs phi quán tính; ch3-5-3 — Bảo toàn mô men động lượng; ch3-6-2 — Va chạm với hệ số phục hồi e. Phạm vi được đọc trực tiếp từ manifest; chất lượng mô hình, giả thiết và tính đúng phải xem đặc tả và evidence đúng bản nguồn.

**Thông điệp chính:** Bản 3D nằm trong tập 25 vị trí; danh mục không chứng minh đạt chất lượng mô hình.

**Nguồn đầy đủ:**

- js/sim2/sim2-route-manifest.js
- js/sim3/sim3-route-manifest.js
- data/simulation-specifications.json

## 10 câu hỏi dự kiến và trả lời có căn cứ

Các trả lời dưới đây lấy nguyên nội dung ghi chú từ module báo cáo, không tạo một bộ số liệu song song.

### 1. Vì sao chọn ngoại tuyến và cần chứng minh điều gì trên máy đích?

Gói standalone có tài nguyên nội dung và thư viện cục bộ. Cơ chế này tránh yêu cầu gọi CDN trong quá trình đọc và cho phép mở bằng file:// hoặc máy chủ tĩnh. Hồ sơ technical-smoke của candidate là bằng chứng có giới hạn theo thời điểm và gói.

Không suy từ cơ chế sang cam kết mọi tính năng chạy trên mọi trình duyệt. Cần kiểm đường dẫn tương đối, localStorage, PDF, mô phỏng và fallback trên máy trình chiếu. Gate smoke độc lập vẫn bị chặn trong hồ sơ; báo cáo giữ trạng thái đó.

**Đối chiếu:** Slide 12 — Offline-first: cơ chế và phép chứng minh.

- README.md
- release/2026.09.02-candidate/technical-smoke.md
- data/acceptance-report.json

### 2. Có 25 hay 35 bài mô phỏng? Các bản 3D có vai trò gì?

Sim2 là lớp cơ sở trên 25 vị trí. Mười vị trí trong số đó có tùy chọn Sim3; đây là hai cách biểu diễn cùng chủ đề chứ không phải 35 bài khác nhau. Lựa chọn 3D cần giá trị sư phạm rõ và phương án dự phòng khi không có WebGL.

README mô tả fixed-step 1/60 giây và demand rendering của Sim3. Đây là thông tin thiết kế, không phải kết quả đo 60fps trên thiết bị. Nguồn mô phỏng được cập nhật trên GitHub gần đây và trạng thái kiểm lại hiện pending, nên ảnh và pass lịch sử không được dùng xác nhận mã mới.

**Đối chiếu:** Slide 13 — Sim2 và Sim3: chiến lược hai tầng.

- js/sim2/sim2-route-manifest.js
- js/sim3/sim3-route-manifest.js
- data/simulation-current-revalidation.json
- README.md

### 3. Giáo trình có thay thế LMS và sổ điểm chính thức không?

Bảng này tách những hiện vật có trong dự án khỏi khả năng mà một LMS thường cung cấp. Giáo trình có hỗ trợ tự học, nhưng không có danh tính người học hoặc cơ chế đồng bộ tập trung trong phạm vi hiện tại.

Có các bản dẫn xuất QTI 3 và Common Cartridge 1.4 ở mức pilot. Điều đó không có nghĩa SCORM, xAPI hay cmi5 đã được triển khai, cũng không chứng minh liên thông trên LMS thật. Giới hạn này cần được duy trì trong hồ sơ bàn giao và khuyến nghị sử dụng.

**Đối chiếu:** Slide 10 — Phạm vi: giáo trình, không phải LMS.

- README.md
- data/presentation-specification.json
- data/lms-targets.json

### 4. Tám nhóm QA có nghĩa tám cổng đã đạt hay không?

Tám nhóm này giúp hội đồng hiểu các loại rủi ro được bao phủ. Sổ QA thực tế có 24 cổng. Không thể thay trạng thái của sổ bằng cách gộp thành tám hàng hoặc bằng sửa lời thuyết minh.

Sổ 2026-09-25: 11 pass / 9 fail / 4 blocked. Các lần soak ba lượt liên tiếp và revalidation nguồn mới là yêu cầu cần có bằng chứng. Approval cuối phải đi qua các điều kiện học thuật, tiếp cận và chạy thử độc lập, không được suy ra từ việc công cụ build xuất được ZIP.

**Đối chiếu:** Slide 18 — QA: tám nhóm, 24 cổng thực tế.

- package.json
- data/qa-gates.json
- data/acceptance-report.json

### 5. Ledger và số bản ký có đủ chứng minh đã nghiệm thu học thuật không?

Chuỗi truy vết nối căn cứ đào tạo và mục tiêu với nội dung, quiz, mô phỏng và bằng chứng. Ledger giúp ghi lại nội dung cần review và tình trạng, chứ bản thân kích thước tệp không phản ánh chất lượng học thuật.

Ledger đo được 836233 byte và sổ academic\_signoffs có 0 bản ghi. Gate học thuật vẫn bị chặn. Cần review độc lập, đúng thẩm quyền và đúng phiên bản; không được tự ghi nhận đạt chuẩn đầu ra bằng tồn tại metadata LO.

**Đối chiếu:** Slide 19 — Academic review: chuỗi truy vết.

- data/academic\_review\_ledger.json
- data/academic\_signoffs.json
- data/learning-outcomes.json
- data/acceptance-report.json

### 6. SHA-256 của gói chứng minh điều gì và không chứng minh điều gì?

Gói ứng viên là 2026.09.02-candidate, ZIP 78739543 byte. SHA-256 đầy đủ: 3defec1306bab10288faed66e45f19d8aa2befc2b66ecb1b6f2066df186f005a. Hash đã được tính trực tiếp khi chuẩn bị báo cáo và khớp sổ ứng viên.

Xác minh hash chỉ xác nhận tệp đúng như hồ sơ. Tái tạo cùng byte cần chạy build với điều kiện cố định; phiên này không thay bằng chứng reproducibility lịch sử. Candidate không phải final acceptance, và mã nguồn hiện tại đã có thay đổi cần kiểm lại riêng.

**Đối chiếu:** Slide 20 — Release: tái tạo và xác minh.

- data/release-candidate.json
- release/2026.09.02-candidate/release-summary.json
- data/acceptance-report.json

### 7. Có thể tuyên bố đáp ứng hoặc được chứng nhận WCAG 2.2 AA chưa?

Dự án có các cơ chế hướng tới khả năng tiếp cận và các phép kiểm tự động. Các phép kiểm có thể phát hiện một phần vấn đề, nhưng không đánh giá hết ngữ nghĩa công thức, thao tác với mô phỏng hoặc trải nghiệm trình đọc màn hình.

Hồ sơ lưu gate phase-08-accessibility là fail và gate review độc lập là blocked. Không dùng ngôn ngữ chứng nhận WCAG 2.2 AA. Muốn kết luận mức đáp ứng cần đối chiếu từng tiêu chí áp dụng, kiểm thủ công và lưu bằng chứng đúng bản nguồn.

**Đối chiếu:** Slide 17 — Khả năng tiếp cận: nói đúng giới hạn.

- data/accessibility-baseline.json
- data/acceptance-report.json
- data/presentation-specification.json

### 8. Moodle và Google Classroom có khả năng ngoại tuyến không?

Bảng so sánh tập trung vào điều kiện sử dụng và phạm vi, không chấm điểm sản phẩm khác. Moodle có thể triển khai tại chỗ hoặc trong LAN và ứng dụng có tính năng offline có điều kiện. Google Classroom trên iOS/Android cho đọc thông báo, bài và sửa tài liệu đã tải trước theo tài liệu chính thức.

Giáo trình này không cần dịch vụ tập trung khi đọc gói, nhưng không thay chức năng LMS về tài khoản và sổ điểm. Cả bản giấy lẫn phần mềm đều có chi phí biên soạn, bảo trì và phân phối; không dùng zero-cost. Tài liệu Moodle được tìm thấy qua nguồn chính thức nhưng truy cập trực tiếp bị chặn, nên không mở rộng kết luận về từng chức năng offline.

**Đối chiếu:** Slide 22 — So sánh theo điều kiện triển khai.

- README.md
- https://docs.moodle.org/en/Moodle\_app\_offline\_features
- https://support.google.com/edu/classroom/answer/11015503?hl=en

### 9. Đã chứng minh tác động học tập hoặc tiết kiệm chi phí chưa?

Đối với học viên, giá trị kỳ vọng là tiếp cận học liệu trong điều kiện hạn chế kết nối và quan sát những đại lượng cơ học khó thấy trong trang giấy. Đối với giảng viên, nguồn DOCX và truy vết hỗ trợ cập nhật, nhưng tái tạo và QA vẫn cần phối hợp kỹ thuật.

Đối với nhà trường, khả năng phân phối cục bộ và tái sử dụng quy trình là hướng đáng thí điểm. Chưa có số liệu trước–sau, nhóm đối chứng hoặc tổng chi phí sở hữu để kết luận tăng chất lượng đào tạo hay tiết kiệm tiền. Cần kế hoạch đo lường riêng, bảo đảm quyền riêng tư người học.

**Đối chiếu:** Slide 26 — Tác động giáo dục cần kiểm chứng.

- data/presentation-specification.json
- data/learning-outcomes.json
- README.md

### 10. Hội đồng được đề nghị quyết định gì trong lần báo cáo này?

Khuyến nghị thứ nhất và thứ hai là hoàn thiện review độc lập về học thuật và khả năng tiếp cận. Khuyến nghị thứ ba yêu cầu minh chứng thực tế trên LMS đích thay vì chỉ có tệp chuẩn. Thứ tư là chuyển giao qua thí điểm, không sao chép kỳ vọng giữa các môn.

Khuyến nghị cuối giữ nguyên nguyên tắc trung thực về giới hạn. Sửa hồ sơ hoặc dựng slide không đóng được gate fail hay blocked. Đề nghị hội đồng ghi nhận hiện vật và thống nhất lộ trình hoàn thiện; quyền chấp nhận cuối cùng thuộc quy trình riêng của đơn vị.

**Đối chiếu:** Slide 30 — Năm khuyến nghị cho hội đồng.

- data/acceptance-report.json
- data/presentation-specification.json
- NghienCuuLamSlideMoi.txt

