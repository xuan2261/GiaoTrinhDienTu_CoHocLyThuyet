# Prompt bàn giao: hoàn thiện báo cáo DOCX và slides PPTX

Repository: https://github.com/xuan2261/GiaoTrinhDienTu_CoHocLyThuyet

Bản prompt này thay thế toàn bộ prompt cũ trong cuộc trao đổi. Đã đối chiếu với checkout cục bộ tại commit `36e9289`. Đây là mốc tham chiếu, không phải yêu cầu máy khác phải dùng đúng commit đó. Khi thực hiện, đọc lại phiên bản repo thực sự có trên máy.

Dùng với Claude Opus có trong tài khoản hoặc môi trường của bạn. Tên “Opus 5.5” là lựa chọn người dùng mong muốn; tài liệu này không xác nhận tên model, quyền truy cập, khả năng tạo file hoặc bộ công cụ của nhà cung cấp.

## 1. Những thông tin đã sửa so với prompt cũ

| Điểm cần sửa | Thông tin và cách xử lý đúng |
|---|---|
| Gọi 24 là tổng số ca kiểm thử | Đây là **24 cổng QA**. Một cổng có thể chạy nhiều bộ lệnh và nhiều ca kiểm thử. Không chuyển số cổng thành điểm chất lượng hoặc tỷ lệ hoàn thiện sản phẩm. |
| Nhầm phiên bản với ngày kiểm tra | Candidate trong `data/release-candidate.json` là `2026.09.02-candidate`. Báo cáo acceptance được sinh lúc `2026-09-25T13:56:04Z`; các mốc quan sát trong đó gồm 21/09 và 25/09. Không gọi candidate là bản ngày 21/09. |
| Cố định số liệu như chân lý vĩnh viễn | Bản đã đọc ghi `11 pass`, `9 fail`, `4 blocked`, `0 notRun`, `overallStatus=fail`, quyết định `rejected`. Máy khác phải đọc lại dữ liệu hiện hành, không chép đè trạng thái mới bằng các số này. |
| Tự phân loại 9 fail thành lỗi WebGL, sai số tích phân hoặc lỗi mobile | Cả chín log tương ứng đã đọc trên máy nguồn đều có lỗi Playwright không tìm thấy executable Chromium. Đây không phải chứng minh rằng kiểm tra vật lý hoặc chức năng đã chạy và phát hiện sai. Nếu clone không có log, phải nói không đủ bằng chứng để tự xác minh nguyên nhân. |
| Hứa nghiệm thu chính thức khi “đủ căn cứ” | Mục đích phiên báo cáo hiện hành là ghi nhận việc xây dựng hiện vật và xin góp ý. Không đề nghị chấp thuận học thuật, nghiệm thu cuối cùng hoặc phát hành. |
| Áp đặt Nghị định 30 như chuẩn học thuật mặc định | Không mặc định mọi báo cáo khoa học thuộc thể thức văn bản hành chính. Giữ mẫu của đơn vị nếu có; nếu chưa có, dùng quy cách nhất quán và không tự tuyên bố tuân thủ pháp lý. |
| Công thức Coriolis thiếu điều kiện và trị tuyệt đối | Dùng tích có hướng tổng quát. Công thức độ lớn rút gọn cần hai vectơ vuông góc và độ lớn vận tốc không âm. Đây chỉ là một thành phần gia tốc. |
| Bắt buộc “Δt → 0, bỏ qua mọi lực ngoài” cho va chạm | Điều kiện phù hợp là tổng xung lực ngoài theo phương đang xét không đáng kể trong khoảng va chạm. Không cần giả thiết toán học Δt tiến tới 0; lực ngoài có thể tồn tại. |
| Thay ca Tĩnh học bằng bài đòn bẩy không có trong lựa chọn hiện hành | Ba ca của deck hiện là trọng tâm diện tích `ch1-6-3`, Coriolis `ch2-4-4`, va chạm thẳng `ch3-6-2`. Demo mô men `ch1-1-4` là nội dung riêng. |
| Lịch slide cũ tự mâu thuẫn với 13 chính + 6 phụ lục | Bản sửa giữ đủ 19 slide, với slide 14–19 là phụ lục. Nội dung phát hành kỹ thuật nằm tại slide 17–18. |
| Cho rằng repo link hoặc hai file đính kèm là đủ cho mọi công cụ | Phải kiểm tra quyền đọc repo, ghi file, chạy lệnh và kết xuất Office. Log, ZIP và script trong `backups/` có thể bị Git bỏ qua; không được giả định chúng đi theo clone. |

## 2. Cách dùng trên máy khác

### Khi dùng Claude Code hoặc agent trong IDE

1. Chép file Markdown này sang máy đích.
2. Clone repository nếu chưa có. Nếu đã có checkout, kiểm tra thay đổi cục bộ trước; không reset hoặc pull đè công việc đang làm.
3. Mở thư mục repo bằng công cụ có model bạn muốn dùng.
4. Dán **toàn bộ khối prompt ở Mục 3**, hoặc yêu cầu agent đọc file này và thực hiện Mục 3.
5. Cấp quyền thao tác file và chạy lệnh trong repo theo chính sách công cụ. Prompt không tự cấp các quyền đó.

Lệnh khởi tạo cho thư mục mới:

```bash
git clone https://github.com/xuan2261/GiaoTrinhDienTu_CoHocLyThuyet.git
cd GiaoTrinhDienTu_CoHocLyThuyet
```

Không cần đường dẫn Windows của máy nguồn. Không phụ thuộc việc cài các skill/plugin xuất hiện trong cuộc hội thoại trước.

### Khi dùng giao diện chat

Nếu phiên chat có công cụ đọc repo và tạo file, dùng cùng prompt. Nếu không, tải lên bản ZIP của repo hoặc một gói có đủ tài liệu, generator, dữ liệu và assets được liệt kê trong prompt. Chỉ tải DOCX và một file JavaScript thường không đủ để đối chiếu số liệu hoặc dựng lại PPTX.

Không gửi `.git/`, `node_modules/`, môi trường Python, token, mật khẩu hoặc hồ sơ riêng tư không liên quan. Các log cần thiết chỉ gửi sau khi kiểm tra thông tin nhạy cảm. Nếu phiên chat không thể tạo/kết xuất file, yêu cầu nó nêu rõ giới hạn; không coi một đoạn mã hoặc dàn ý là file DOCX/PPTX đã hoàn thiện.

## 3. Prompt đầy đủ để sao chép

Sao chép nội dung bên trong khối dưới đây, không cần kèm phần nhận xét bên ngoài.

```text
Bạn là trợ lý biên tập kỹ thuật có chuyên môn Cơ học lý thuyết, thiết kế học liệu và chế bản Word/PowerPoint. Hãy trực tiếp rà soát, chỉnh sửa, hoàn thiện và kiểm tra hai tài liệu của repository:
https://github.com/xuan2261/GiaoTrinhDienTu_CoHocLyThuyet

Làm việc bằng tiếng Việt. Mục tiêu là sản phẩm khoa học, dễ hiểu, nhiều hình có giá trị giải thích, sơ đồ khối và luồng xử lý rõ ràng; không phải chỉ cung cấp lời khuyên hoặc đổi màu giao diện.

A. HỢP ĐỒNG THỰC HIỆN

Đầu ra:
1. BaoCao_KhoaHoc_GiaoTrinhDienTu_CoHocLyThuyet.docx.
2. assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/bao-cao-nghiem-thu-giao-trinh-dien-tu.pptx.
3. PDF tương ứng của cả hai tài liệu sau khi kết xuất và kiểm tra thực tế.
4. Đồng bộ các tài nguyên có sẵn phụ thuộc deck: web slides, handout, hướng dẫn thuyết trình, hướng dẫn vận hành và ảnh tổng quan.
5. Các sửa đổi generator/asset cần thiết để tái tạo được tài liệu, cùng bản ghi ngắn về thay đổi, nguồn và kết quả kiểm tra.

Ràng buộc:
- Giữ tính đúng cơ học, nguồn dữ liệu, tên tác giả và phạm vi thẩm quyền của báo cáo.
- Cải thiện trực quan mà không biến minh họa thành bằng chứng nghiệm thu.
- Dùng generator và quy ước sẵn có. Không sửa tay duy nhất trên file xuất rồi bỏ quên mã nguồn tạo tài liệu.
- Bảo toàn thay đổi cục bộ của người dùng. Không tự commit, push, deploy, force-push hoặc xóa tài liệu gốc.
- Không thực hiện thao tác bên ngoài repo ngoài các cài đặt cần thiết đã được môi trường cho phép.

Ngoài phạm vi:
- Không viết lại giáo trình nguồn CoHocLyThuyet_Full_New.docx.
- Không sửa hệ thống web, mô hình vật lý hoặc nền tảng kiểm thử để làm đẹp báo cáo. Nếu phát hiện lỗi, ghi rõ bằng chứng và tác động; hỏi trước khi mở rộng sang sửa phần mềm.
- Không tạo chữ ký học thuật, biên bản hội đồng, kết quả thực nghiệm người học, tỷ lệ cải thiện, thời hạn hoặc cam kết trách nhiệm không có căn cứ.
- Không biến phiên báo cáo góp ý thành đề nghị phát hành chính thức.

Tiêu chí hoàn thành:
- Hai file chính mở được bằng ứng dụng tương thích; PDF đã được kết xuất thật, không chỉ đổi đuôi.
- Số liệu, trạng thái, nguồn và kết luận giữa Word, PowerPoint và các bản phụ trợ nhất quán.
- Công thức đúng và có giả thiết; ảnh có chú thích, sơ đồ có hướng đọc và nhãn nhánh.
- Đã xem trực quan toàn bộ trang Word đã kết xuất và toàn bộ slide; đã xử lý chồng lấn, tràn chữ, mất dấu tiếng Việt, vỡ bảng, chú thích rời hình và công thức lỗi.
- Lệnh build/test liên quan đã chạy và có kết quả thật. Không báo pass khi chưa chạy hoặc khi công cụ bị chặn.
- Nếu môi trường thiếu khả năng tạo hoặc kết xuất file, hoàn thành phần có thể làm và báo đúng phần chưa kiểm chứng. Không gọi là hoàn tất nếu còn thiếu đầu ra bắt buộc.

B. ĐỌC REPO VÀ XÁC LẬP NGUỒN TRƯỚC KHI SỬA

1. Kiểm tra branch, commit, trạng thái checkout và hướng dẫn cục bộ như AGENTS.md/CLAUDE.md nếu có. Không reset hoặc tự ghi đè thay đổi chưa commit. Ghi lại revision thực sự được sử dụng.
2. Đọc README.md và các phần liên quan của tài liệu dự án; tìm file theo cấu trúc thật, không đoán đường dẫn.
3. Đọc hai tài liệu hiện hành và generator:
   - tools/generate_scientific_report_docx.py.
   - tools/presentation/acceptance-deck-content.js.
   - tools/presentation/build-acceptance-deck.js.
   - tools/presentation/acceptance-deck-theme.js.
   - tools/presentation/acceptance-deck-special-slides.js.
   - tools/presentation/build-acceptance-web.js.
   - tools/presentation/normalize-pptx-package.py.
   - tools/presentation/capture-live-simulation-evidence.js.
4. Đối chiếu nguồn chuyên môn và dữ liệu:
   - CoHocLyThuyet_Full_New.docx; CoHocLyThuyet.pdf; DeCuongChiTietNop.docx.
   - data/content-manifest.json; data/equation_mapping.json.
   - data/simulation-specifications.json; data/sim3-pedagogical-reviews.json.
   - data/quiz-ch1.json, data/quiz-ch2.json, data/quiz-ch3.json.
   - data/learning-outcomes.json; data/academic_signoffs.json.
   - data/acceptance-report.json; data/evidence-registry.json.
   - data/release-candidate.json và summaryPath được file này chỉ tới.
   - Các bản đồ liên kết nội dung, mô phỏng và câu hỏi với chuẩn đầu ra, nếu tồn tại trong checkout.
5. Xem assets trong assets/designs/bao-cao-nghiem-thu-giao-trinh-dien-tu/assets/ và các ảnh/registry được generator tham chiếu. Các bản HTML trong plans/reports có thể là bản lịch sử; không mặc định dùng chúng thay bản xuất hiện hành ở assets/designs.
6. Đọc các test liên quan, đặc biệt tests/presentation-deck-contract.test.js và tests/test_scientific_report.py; xem chúng kiểm tra điều gì trước khi chạy hoặc sửa.

Không đọc toàn bộ repo một cách máy móc. Tập trung đường dẫn tác động đến hai tài liệu và giải quyết nghi vấn bằng nguồn cụ thể.

Tạo bảng ngắn “tuyên bố → nguồn → mốc bằng chứng → phạm vi kết luận”. Nếu hai nguồn mâu thuẫn, ghi nhận chênh lệch và tìm nguồn có thẩm quyền cho đúng loại tuyên bố. Không mặc định file mới nhất về ngày sửa là đúng nhất.

C. HIỆN TRẠNG THAM CHIẾU VÀ QUY TẮC TRUNG THỰC

Những dữ kiện sau đã được ghi nhận tại checkout tham chiếu 36e9289. Đây không phải giá trị phải ép repo khớp theo; hãy đọc lại và thay bằng dữ liệu mới có bằng chứng khi thực hiện:

- Candidate: 2026.09.02-candidate.
- acceptance-report generatedAt: 2026-09-25T13:56:04Z.
- Quan sát các cổng gồm mốc nền 2026-09-21 và cập nhật 2026-09-25. Không tuyên bố toàn bộ cổng cùng chạy lại ngày 25/09.
- 24 cổng QA: 11 pass, 9 fail, 4 blocked, 0 notRun.
- overallStatus=fail; releaseDecision.decision=rejected.
- data/academic_signoffs.json không có records tại mốc tham chiếu. Chuẩn đầu ra đang được trình bày là sơ bộ; kiểm tra lại từng trạng thái trong file hiện hành.
- Đề nghị của deck là ghi nhận việc xây dựng hiện vật và cho ý kiến hoàn thiện, KHÔNG đề nghị chấp thuận học thuật, nghiệm thu cuối cùng hoặc phát hành.

Chín log fail trên máy nguồn đều có thông báo Playwright thiếu executable Chromium. Khi trình bày:
- Giữ nguyên trạng thái fail đã ghi nhận; không tự chuyển sang pass vì cho rằng chỉ là lỗi môi trường.
- Không suy diễn thành chín lỗi cơ học, chín lỗi WebGL, sai tích phân số hoặc lỗi điện thoại.
- Phân biệt kiểm thử không khởi động được với assertion chuyên môn đã chạy và thất bại. Các bước trước lỗi khởi động có thể đã chạy; không nói mọi bước đều chưa chạy.
- Đọc log thực tế qua đường dẫn trong registry/acceptance. Nếu clone không có log, nói rõ “chưa thể kiểm tra lại nguyên nhân từ nhật ký trên máy này”. Không dùng lời kể của prompt làm bằng chứng mới.

Bốn cổng blocked tham chiếu:
academic-review-currentness;
accessibility-independent-review;
release-independent-smoke;
word-standalone-roundtrip.
Hãy diễn giải đúng hồ sơ và thẩm quyền còn thiếu từ định nghĩa từng cổng; không gộp tất cả thành “lỗi phần mềm”.

Các giới hạn bắt buộc:
- 24 cổng không phải 24 ca kiểm thử và không phải điểm đánh giá chất lượng giáo dục.
- Số mục/trang, tham chiếu công thức, công thức duy nhất, hình, mô phỏng và câu hỏi là các đại lượng khác nhau. Định nghĩa cách đếm từ nguồn; không gọi mọi route là một bài học.
- Không tuyên bố đã đạt WCAG, CDIO/ABET hoặc nhập LMS thành công chỉ vì có script kiểm tra hay gói QTI/Common Cartridge.
- Tách snapshot mô tả sản phẩm cũ với kiểm thử tài liệu trong phiên hiện tại. Chạy lại test xuất slide không đổi kết luận phát hành của candidate.
- Giữ ảnh minh họa nguyên lý, ảnh chụp runtime, kiểm thử kỹ thuật, thẩm định chuyên gia và nghiên cứu người học thành các loại bằng chứng riêng.
- QR mở bản web trình diễn; không khẳng định nó đồng nhất với candidate nếu chưa đối chiếu phiên bản/hash.
- Không tự đặt tên cơ quan, học hàm, tác giả, chữ ký hoặc chức danh của Hội đồng.

D. KIỂM TRA ĐỘ CHÍNH XÁC CƠ HỌC

Duy trì ba ca có thật trong deck, trừ khi nguồn hiện hành đã thay đổi có chủ đích:

1. Trọng tâm diện tích, route ch1-6-3:
   x̄ = Σ(Aᵢxᵢ)/ΣAᵢ; ȳ = Σ(Aᵢyᵢ)/ΣAᵢ.
   Dùng diện tích âm cho lỗ khoét và hệ tọa độ nhất quán. Tổng diện tích phải hợp lệ. Phân biệt trọng tâm diện tích với trọng tâm khối lượng khi mật độ hoặc chiều dày không đều. Không khẳng định trọng tâm luôn nằm trong phần vật liệu của hình không lồi/có lỗ.

2. Thành phần gia tốc Coriolis, route ch2-4-4:
   Dạng vectơ: a⃗_C = 2(ω⃗ × v⃗_rel).
   Độ lớn tổng quát: |a⃗_C| = 2|ω⃗||v⃗_rel| sin α, với α là góc giữa hai vectơ.
   Khi ω⃗ ⟂ v⃗_rel trong mô hình phẳng: |a⃗_C| = 2|ω⃗||v⃗_rel|.
   Nếu dùng ω thay |ω⃗| trong công thức độ lớn, phải định nghĩa ω là độ lớn không âm. Kiểm tra hướng bằng quy tắc tích có hướng, trường hợp vectơ bằng 0 và đơn vị m/s². Không gọi đây là toàn bộ gia tốc.

3. Va chạm thẳng một chiều, route ch3-6-2:
   m₁u₁ + m₂u₂ = m₁v₁ + m₂v₂ khi tổng xung lực ngoài theo phương xét không đáng kể trong khoảng va chạm.
   Với mô hình thụ động đang xét, 0 ≤ e ≤ 1. Định nghĩa vận tốc có dấu, chiều trục và hệ số phục hồi trước khi dùng e = (v₂ − v₁)/(u₁ − u₂). Không dùng biểu thức tỉ số khi mẫu bằng 0.
   Không áp đặt Δt → 0 hoặc loại bỏ mọi lực ngoài để hợp thức hóa bảo toàn động lượng. Không nói động năng luôn bảo toàn; phân biệt e=1, e=0 và trường hợp trung gian.

4. Demo mô men, route ch1-1-4, là nội dung riêng:
   M_O = ±F d⊥, với d⊥ là khoảng cách vuông góc từ O tới giá lực. Demo hiện có giữ θ=90°, F=50 N và d⊥=4,00 m; giá trị +200 N·m đi kèm quy ước chiều dương và hình học tương ứng.
   Kiểm tra giao diện thật trước khi hướng dẫn thao tác. Không yêu cầu kéo thanh trượt hoặc đổi góc/chiều nếu mô phỏng không hỗ trợ.

Sửa ký hiệu hoặc diễn giải trong báo cáo/slide theo chứng cứ. Nếu mô hình phần mềm khác mô tả, không che giấu khác biệt bằng một hình minh họa đẹp.

E. HOÀN THIỆN BÁO CÁO WORD

Ưu tiên sửa tools/generate_scientific_report_docx.py rồi sinh lại DOCX bằng python-docx và cơ chế OMML hiện có; không tạo generator thứ hai chỉ vì quen công cụ khác.

Tổ chức mạch lập luận:
- Tóm tắt, mục tiêu, câu hỏi đánh giá, phạm vi và phương pháp.
- Nguồn giáo trình, phạm vi số hóa và cấu trúc học liệu.
- Tổ chức tự học và khả năng hỗ trợ dạy–học dự kiến.
- Kiến trúc và luồng xử lý theo triển khai thực tế.
- Ba ca đối chiếu khoa học, giả thiết và giới hạn.
- Kết quả kỹ thuật theo snapshot, thẩm quyền và giới hạn bằng chứng.
- Nội dung cần hoàn thiện, kết luận đúng phạm vi, phụ lục và tài liệu tham khảo.
Giữ phần hiện có đã đúng; không chép lại cả giáo trình hoặc thêm chương chỉ để làm báo cáo dài hơn.

Định dạng:
- Ưu tiên mẫu được đơn vị cung cấp, nếu có. Chưa có mẫu thì giữ nền hiện hành A4, Times New Roman, lề trên/dưới 2 cm, trái 3 cm, phải 2 cm và hệ thống style nhất quán.
- Các thông số đó là lựa chọn trình bày hiện hành, không tự chứng minh tuân thủ Nghị định 30/2020/NĐ-CP. Chỉ viện dẫn quy định pháp lý sau khi xác minh văn bản chính thức và phạm vi áp dụng.
- Heading phân cấp, mục lục và số trang chính xác; cập nhật field trước bàn giao nếu công cụ hỗ trợ.
- Dùng bảng Word chỉnh sửa được, lặp tiêu đề bảng nhiều trang; tránh tách một hàng, tiêu đề hoặc chú thích khỏi nội dung liên quan.
- Công thức quan trọng dùng OMML hoặc phương án Office chỉnh sửa được. Kiểm tra chỉ số, dấu vectơ, trị tuyệt đối, đơn vị và font sau khi kết xuất.
- Giữ quy ước đánh số hình/bảng nhất quán với tài liệu, cập nhật mọi tham chiếu khi đổi số.

Hình và sơ đồ phải trả lời một câu hỏi cụ thể:
- Nguồn nội dung đi qua các bước trích xuất/chuẩn hóa/đóng gói nào?
- Người học đi qua vòng định hướng → học nội dung → quan sát/thao tác → tự kiểm tra → điều chỉnh ra sao?
- Bằng chứng nào hỗ trợ tuyên bố nào? Thẩm quyền nào còn thiếu?
- Trong từng ca cơ học, đầu vào, giả thiết, phương trình và đại lượng cần đối chiếu là gì?

Không tự thêm khảo sát đầu vào, chấm điểm đạt/chưa đạt chính thức hoặc nhánh tự điều hướng nếu hệ thống chưa có chức năng đó. Nếu trình bày hướng phát triển, gắn nhãn đề xuất, tách khỏi phần đã xây dựng.

Ma trận truy vết nên có: yêu cầu/chuẩn đầu ra và trạng thái phê duyệt; nội dung hoặc tính năng; nguồn/route; bằng chứng và thời điểm; giới hạn kết luận. Cột ý kiến Hội đồng chỉ điền khi có biên bản thật, không tự tạo đánh giá.

F. HOÀN THIỆN POWERPOINT

Giữ cấu trúc hiện hành 19 slide: 13 slide chính trong 12 phút, 6 phụ lục dùng trong 3 phút hỏi–đáp/chuyển cảnh. Không trình bày tất cả phụ lục trong 3 phút như nội dung bắt buộc. Nếu repo mới có cấu trúc đã được người dùng duyệt khác, nêu khác biệt và xác nhận trước khi thay đổi phạm vi phiên họp.

Bản đồ 19 slide tham chiếu:
01. Kết quả xây dựng giáo trình điện tử; ảnh giao diện và ba mạch kiến thức.
02. Nhu cầu dạy–học và cách thiết kế đáp ứng; không mặc định cách học truyền thống luôn thụ động.
03. Phạm vi đã xây dựng cho Tĩnh học, Động học, Động lực học; đếm đúng đơn vị.
04. Vòng học có phản hồi; đường Điều chỉnh quay lại Học nội dung.
05. Trải nghiệm hiện vật qua QR, kèm giới hạn về đồng nhất với candidate.
06. Trọng tâm diện tích: sơ đồ nguyên lý, công thức, ảnh runtime và điểm đối chiếu.
07. Coriolis: hướng vectơ, điều kiện công thức độ lớn, ảnh runtime và giới hạn.
08. Va chạm một chiều: trước/sau, vận tốc có dấu, động lượng và giả thiết.
09. Demo mô men 90 giây; đầu vào → thao tác có thật → đọc kết quả → đối chiếu nguồn.
10. Sơ đồ truy vết nguồn tới căn cứ Hội đồng có thể kiểm tra.
11. Kết quả đã có và giới hạn chưa được xác nhận.
12. Bốn nhóm xin góp ý; gắn với chuẩn đầu ra và câu hỏi đại diện thật.
13. Đề nghị ghi nhận việc xây dựng hiện vật và cho ý kiến hoàn thiện, không đề nghị phát hành.
14. Phụ lục: bốn chuẩn đầu ra dự kiến, điều kiện/tiêu chí và trạng thái phê duyệt.
15. Phụ lục: phạm vi của ba ca đối chiếu, không suy rộng ngoài mẫu.
16. Phụ lục: hồ sơ học thuật; luồng đề xuất thẩm định → đủ căn cứ? Có/Chưa → ghi nhận có thẩm quyền hoặc bổ sung/chỉnh sửa. Không gắn kết quả đã hoàn tất cho luồng đề xuất.
17. Phụ lục: trạng thái kỹ thuật và phát hành theo snapshot, mốc bằng chứng và candidate.
18. Phụ lục: chi tiết cổng fail/blocked, căn cứ nguyên nhân và điều kiện xử lý.
19. Phụ lục: hỏi đáp đúng phạm vi, không thay chữ ký hoặc quyết định độc lập.

Thiết kế:
- Khổ 16:9, 13.333 × 7.5 inch. Tận dụng theme hiện có; không ép đổi toàn bộ bộ nhận diện nếu chưa có lý do.
- Mỗi slide có một thông điệp chính. Chuyển phần giải thích dài sang speaker notes/handout, nhưng giữ trên slide giả thiết và cảnh báo cần thiết để không hiểu sai.
- Ưu tiên tiêu đề 28–36 pt, thân bài 18–22 pt, nhãn sơ đồ 16–18 pt. Nguồn có thể nhỏ hơn nhưng vẫn đọc được ở kích thước trình chiếu. Không dùng tự thu nhỏ chữ để che lỗi bố cục.
- Nếu nội dung quá dày, rút gọn câu và đưa chi tiết vào notes/phụ lục sẵn có. Không âm thầm bỏ yêu cầu hoặc đổi số slide đã thống nhất.
- Dùng hình khối và connector PowerPoint chỉnh sửa được cho sơ đồ khối, luồng học và nhánh quyết định. Gắn nhãn Có/Chưa hoặc điều kiện cụ thể, tránh mũi tên xuyên chữ và nhánh không có đích.
- Đặt công thức/chú thích gần hình liên quan. Ảnh runtime cần giữ route, tham số và giá trị cần đọc; không cắt bỏ cảnh báo để ảnh trông đẹp hơn.
- Hình nguyên lý phải ghi là minh họa; ảnh runtime phải ghi nguồn và bối cảnh nếu đã xác minh. Không dùng AI vẽ ảnh giao diện rồi gọi đó là ảnh sản phẩm thật.
- Chỉ dùng chuyển cảnh/animation nhẹ khi hỗ trợ dẫn dắt. Không tự chạy, không nhấp nháy và phải có bản tĩnh PDF thể hiện đủ ý. Với web, tôn trọng reduced-motion và điều hướng bàn phím.
- Speaker notes có lời dẫn ngắn, thời lượng, nguồn và giới hạn kết luận. Giữ phân công người nói hiện có trừ khi có yêu cầu khác.

Ưu tiên chỉnh các file trong tools/presentation/ rồi sinh lại PPTX và bản phụ trợ. Không raster hóa toàn bộ slide thành một ảnh nếu có thể giữ chữ và sơ đồ chỉnh sửa được.

G. TRIỂN KHAI VÀ KIỂM TRA

1. Tóm tắt phát hiện thật, chỗ cần sửa và phương án bố cục trước khi chỉnh. Nếu mục tiêu đã rõ, tiếp tục thực hiện; không dừng chỉ để hỏi người dùng có muốn bắt đầu không. Chỉ hỏi khi quyết định làm đổi mục tiêu, thẩm quyền, tác giả, mẫu bắt buộc hoặc cấu trúc phiên họp.
2. Làm theo từng nhóm thay đổi có thể kiểm tra: nội dung/nguồn → DOCX → PPTX → các bản phụ trợ → xuất và kiểm tra.
3. Xác minh công cụ trên máy đích: Node, Python, dependency trong repo, font, trình duyệt và ứng dụng chuyển Office sang PDF. Windows có Office có thể dùng Word/PowerPoint; nếu dùng LibreOffice hoặc phương án khác, phải xem lại sai khác kết xuất. Không giả định máy nào cũng có COM, Edge hoặc Chrome tại một đường dẫn cố định.
4. Các lệnh đã có ở bản tham chiếu, phải đọc lại entry point trước khi chạy:
   - python tools/generate_scientific_report_docx.py --output BaoCao_KhoaHoc_GiaoTrinhDienTu_CoHocLyThuyet.docx
   - npm run build:presentation
   - node --test tests/presentation-deck-contract.test.js
   - python -m unittest tests.test_scientific_report
   Cài dependency đúng manifest/import thực tế. Không bịa tên script test. Không tự chạy toàn bộ pipeline release để sửa một tài liệu.
5. Không tự chạy lại lệnh sinh acceptance hoặc sửa registry làm thay đổi snapshot của sản phẩm. Nếu cần bằng chứng mới cho một kết luận, nêu phạm vi cần chạy và ghi bằng chứng mới tách khỏi lịch sử.
6. Sau khi sửa generator, sinh lại tài liệu. Cập nhật mục lục/field nếu có; kết xuất Word và PowerPoint thành PDF. Render toàn bộ trang/slide thành ảnh tổng quan rồi đọc kỹ các trang có bảng, công thức và sơ đồ.
7. Mở file đầu ra thật để kiểm tra: mất chữ, overflow, thứ tự đọc, ảnh mờ, font thay thế, trang trắng, công thức lỗi và liên kết gãy. Test pass không thay cho kiểm tra hình ảnh.
8. Kiểm tra web slides ngoại tuyến: ảnh tải đủ; chuyển slide bằng nút/phím; về tổng quan; khổ hẹp; in đủ nội dung. Kiểm tra handout giữ nội dung cần đối chiếu.
9. Nếu test thất bại, phân biệt lỗi nội dung, lỗi generator và thiếu môi trường. Không sửa expectation, xóa test hoặc gắn nhãn pass chỉ để vượt kiểm tra. Chỉ cập nhật test khi hợp đồng đầu ra thực sự thay đổi có chủ đích, kèm lý do và kiểm tra tương đương.
10. Nếu cần đổi tài nguyên ảnh, kiểm tra các nơi dùng và hash/registry liên quan trước. Không thay ảnh bằng chứng rồi giữ nguyên provenance cũ.

Lưu ý khả chuyển:
- Các file .log, .zip và thư mục backups/ có thể bị .gitignore loại khỏi repository. Không giả định chúng tồn tại chỉ vì đã xuất hiện trong báo cáo.
- Nếu thiếu bằng chứng, tiếp tục biên tập phần có thể kiểm tra, giữ trạng thái chưa xác minh và liệt kê chính xác tài nguyên cần cung cấp.
- Không bảo đảm hoàn tất kết xuất chỉ từ khả năng của model. Báo rõ công cụ nào đã thực sự dùng.
- Không tạo ảnh QA tạm ở thư mục gốc; dùng thư mục tạm phù hợp. Không xóa assets đang dùng.

H. BÀN GIAO

Kết thúc bằng:
1. Link/đường dẫn hai file DOCX và PPTX đã sửa, cùng hai PDF thực tế đã xuất.
2. Link ảnh tổng quan và tài nguyên web/handout/hướng dẫn đã đồng bộ.
3. Tóm tắt thay đổi theo nội dung khoa học, hình/sơ đồ, bố cục và khả năng đọc.
4. Bảng xác minh: lệnh hoặc thao tác; phạm vi; kết quả thật; phần chưa kiểm tra.
5. Revision nguồn và mốc snapshot sử dụng, phân biệt với ngày tạo tài liệu.
6. Những hạn chế còn lại và tài nguyên thiếu nếu có. Không gọi ảnh minh họa là kiểm chứng học thuật.

Nếu được tạo gói ZIP bàn giao, chỉ gom file đầu ra và assets cần mở ngoại tuyến, không kèm thư mục phụ thuộc, thông tin bí mật hoặc file tạm. Kiểm tra mở gói sau khi giải nén. Không tự công bố gói hoặc push lên GitHub.

Hãy bắt đầu bằng việc kiểm tra môi trường và đọc nguồn hiện hành. Đích đến là các tài liệu đã được sửa và xem kiểm tra thực tế, không phải chỉ một bản kế hoạch hay đoạn mã chưa chạy.
```

## 4. Ghi chú triển khai prompt

- Prompt ưu tiên nguồn theo loại tuyên bố, phân biệt dữ kiện lịch sử với kết quả mới và có tiêu chí hoàn thành quan sát được.
- Bố cục theo các mục A–H giúp Claude xử lý từng giai đoạn mà không cần lịch sử hội thoại. Không yêu cầu model công khai chuỗi suy nghĩ nội bộ; cần kết luận ngắn, bằng chứng và lựa chọn có lý do.
- Nếu dùng API, giữ thông số mặc định phù hợp với model đang được nhà cung cấp hỗ trợ. Nếu API cho phép và không xung đột chế độ suy luận, có thể dùng temperature thấp cho biên tập dựa trên dữ liệu. Không có temperature hoặc giới hạn đầu ra nào bảo đảm tính đúng.
- Không đặt giới hạn đầu ra quá thấp khiến lời hướng dẫn/mã bị cắt; ưu tiên ghi sản phẩm thành file. Tên model không thay thế quyền truy cập file hoặc công cụ kết xuất.
- Người dùng chỉ cần thay yêu cầu mẫu của đơn vị hoặc thời lượng khi thực sự muốn đổi chúng. Không phải sửa lại toàn bộ prompt cho từng hệ điều hành.

## 5. Checklist đánh giá prompt khi dùng

| Tình huống | Hành vi đúng cần quan sát |
|---|---|
| Máy đích đọc được checkout khác mốc tham chiếu | Ghi revision mới, đọc lại dữ liệu, không áp đặt 11/9/4 nếu bằng chứng hợp lệ đã thay đổi. |
| Clone thiếu chín log hoặc file ZIP bị bỏ qua | Nêu tên bằng chứng thiếu và giới hạn xác minh; không tự suy luận lỗi vật lý, không chuyển fail sang pass. |
| Công thức Coriolis tổng quát hoặc va chạm có xung lực ngoài | Nêu điều kiện áp dụng, sửa diễn giải theo nguồn; không dùng công thức rút gọn vô điều kiện. |
| Slide đẹp nhưng sai thẩm quyền hoặc lệch số lượng | Giữ 13 chính + 6 phụ lục và đề nghị góp ý; không biến luồng đề xuất thành chứng nhận đã có. |
| Build/test pass nhưng thiếu Office/font hoặc kết xuất bị lỗi | Báo chính xác phần chưa kiểm tra, xem bản render bằng công cụ thay thế nếu có; không tuyên bố PDF/DOCX hoàn thiện chỉ từ test. |

Checklist này là tiêu chí đánh giá sử dụng, không phải tuyên bố đã chạy prompt trên Opus. Phiên soạn tài liệu này đã đối chiếu đường dẫn, nội dung tham chiếu, CLI và cấu trúc slide trong checkout cục bộ; chưa thực thi một phiên Opus trên máy khác.
