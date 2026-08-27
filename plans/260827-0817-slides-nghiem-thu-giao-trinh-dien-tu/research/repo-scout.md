# Repo scout — deck nghiệm thu Giáo trình điện tử Cơ học lý thuyết

## Kết luận dùng để dựng deck

- Khung phát biểu phù hợp quyết định đã chốt: **đề nghị Hội đồng Khoa học Khoa Kỹ thuật cơ sở nghiệm thu có điều kiện**; đồng thời giữ nhãn kỹ thuật **release blocked / technical candidate**, chưa gọi “final institutional release”.
- Cover phải ghi đủ ba tác giả, đơn vị **Học viện Hải quân**, bối cảnh **Hội đồng Khoa học Khoa Kỹ thuật cơ sở**, địa danh **Khánh Hòa – 2026**.
- Deck 15 phút nên dùng 10–11 slide chính + 3–4 slide backup/demo; số liệu dưới đây đã gắn nguồn, không suy rộng pass kỹ thuật thành nghiệm thu thể chế.

## Tác giả và phạm vi chính thức

Nguồn: `DeCuongChiTietNop.docx` (trang đầu/phần tác giả; SHA-256 bên dưới).

1. **Đại tá, TS Nguyễn Lê Văn** — Chủ biên, CNK Khoa KTCS; Chương 2, 3.
2. **Thiếu tá, ThS Đinh Văn Tứ** — GV BM Cơ khí, Khoa KTCS; Chương 1, mô phỏng bài tập minh họa.
3. **Đại úy, ThS Bùi Thanh Xuân** — GV BM XS-VXL, Khoa KTCS; mô phỏng bài tập minh họa, code giáo trình, ôn tập trắc nghiệm.
- Đối tượng: đào tạo học viên sĩ quan cấp phân đội, trình độ đại học.
- Ba chương: **Tĩnh học – Động học – Động lực học**.

## Số liệu sản phẩm có thể đưa lên slide

| Chỉ số | Số liệu | Nguồn |
|---|---:|---|
| Cấu trúc học liệu | 3 chương, 21 phần, 75 tiểu mục | `DeCuongChiTietNop.docx`; giao diện RC |
| Câu hỏi | 300; 100/chương | `release/2026.08.25-candidate/package/data/quiz-ch{1,2,3}.json` |
| Hình tĩnh | 127 PNG: Ch1 60, Ch2 39, Ch3 28 | `package/release-manifest.json` |
| Ảnh động | 20 GIF: Ch1 6, Ch2 7, Ch3 7 | `assets/gifs/`; `README.md` |
| Sim2 canonical | 25 route: Ch1 10, Ch2 7, Ch3 8 | `js/sim2/sim2-route-manifest.js` |
| Sim3 thí điểm | 10 route: Ch1 2, Ch2 5, Ch3 3; luôn fallback Sim2 | `js/sim3/sim3-route-manifest.js` |
| PDF tích hợp | 139 trang; 4,745,404 byte | `package/CoHocLyThuyet.pdf`; phụ lục DOCX |
| RC staging | 374 tệp; manifest liệt kê 371 runtime files + 3 metadata | `release-summary.json`; `release-manifest.json` |
| Ma trận rà soát | 31 tiêu chí / 10 nhóm; 7 đạt trong phạm vi, 21 đạt có điều kiện, 2 chưa triển khai, 1 hỗn hợp | `DeCuongChiTietNop.docx` |

## Trạng thái nghiệm thu và bằng chứng Option B

- `data/acceptance-report.json`, sinh `2026-08-25T21:14:24Z`: **24 cổng = 20 pass, 0 fail, 3 blocked, 1 not-run; overallStatus=blocked**.
- Blocked: `academic-review-currentness`, `accessibility-independent-review`, `release-independent-smoke`.
- Not-run: `word-standalone-roundtrip`.
- Hai finding runtime phải nói thẳng: tìm kiếm “mô men” fallback về mục lục; route `#ch1-quiz` hiện “đang được cập nhật”.
- `data/lms-targets.json`: status `not-executed`; QTI 3 và Common Cartridge 1.4 chỉ `adapter-validated`, targets/evidence rỗng; SCORM và xAPI/cmi5 `blocked`.
- Option B độc lập: `plans/260820-0639-vit-li-phn-quy-cch-thnh-bo-co-np-chnh-thc/independent-final-review.md` kết luận **PASS**, Critical/High/Medium = 0.
- Option B sau sửa: 35 trang, 5.280 từ so baseline 7.054 (giảm 25,1%), 3 bảng, 6 ảnh, ma trận 42 hàng × 7 cột, 9 SEQ chain + 9 bookmark; OpenXML Office2019 `errorCount: 0`.
- Low còn lại: 65 media relationship kế thừa không dùng, không có broken target; non-blocking.
- Ranh giới bắt buộc: PASS Option B chỉ xác nhận chất lượng DOCX/hồ sơ; **không đóng** ba gate sản phẩm, Word round-trip, LMS/WCAG/4D hay final release.

## Hash và sai lệch cần đưa vào điều kiện phê duyệt

| Hiện vật | SHA-256 / kích thước |
|---|---|
| `DeCuongChiTietNop.docx` | `195caea331843fb6c71d9451e2a4dc8aaff1bc2f2a8989fd3103dc210aa3c02e` |
| Option B contact sheet | `bc864d821a59e920c1754feea32522ade597455b330c783ecc38ca1d245dc3b5` |
| `data/acceptance-report.json` | `cd67fdb364efbe3a9552bc8f446ad5dd86a6922feeea3e12a60beb54b94743e2` |
| Release manifest | `f67bc47e934bdb1258133a0c457e9343aac482a169315501c8338f536678fde2` |
| PDF trong package | `b755b06cf919a979e278f635aa2fedfe249a97342ccd93d2d15875e87ff835d9` |
| Nguồn `CoHocLyThuyet_Full_New.docx` theo manifest | `6396a72512613f867f93332968fc876daccb1d65ed3b6d52efaa74d44bf4b79a` |
| ZIP theo summary/hướng dẫn/acceptance | `6b48834ff3cfaddf29af6c0c83593e74ca4541c085da0bb8b1c36f128212cdbd`, 78,723,361 byte |
| **ZIP hiện có trên đĩa 27/8** | **`b3e4f359da9dcfe483b058ac548561883d59108bb1666fd967d01b6e95702451`, 78,724,247 byte, 375 entries** |

**Blocker mới quan trọng:** bytes ZIP hiện tại không khớp `release-summary.json`, hướng dẫn bên trong ZIP và acceptance evidence. Không trình diễn/trao gói như hash-locked RC cho tới khi release engineering tái tạo hoặc giải trình, cập nhật summary/hướng dẫn/evidence và chạy lại smoke trên đúng hash.

## Visuals nên dùng

Nguồn release-bound tốt nhất: `backups/docx-option-b-20260826/captures/`.

| ID | File / kích thước pixel hiện tại | Dùng ở slide |
|---|---|---|
| IMG-01 | `img-01-trang-chu-desktop-1440x1000.png`, 1024×711 | Hero sản phẩm, dashboard số liệu |
| IMG-02 | `img-02-trang-chu-mobile-390x844.png`, 390×844 | Responsive/mobile |
| IMG-03 | `img-03-hoc-lieu-ch1-2-3-1440x1000.png`, 1024×711 | Học liệu + hình lực |
| IMG-04 | `img-04-mo-men-ch1-1-4-1440x1000.png`, 1024×711 | Demo Sim2; F=50 N, d=4,00 m, M=200,0 N·m |
| IMG-05 | `img-05-tim-kiem-fallback-1440x1000.png`, 1024×711 | Slide “điều kiện còn mở”, không dùng như success claim |
| IMG-06 | `img-06-pdf-viewer-1440x1000.png`, 1024×711 | PDF viewer 139 trang |
| QC | `plans/.../evidence/option-b-contact-sheet-195caea3.png`, 1584×1146 | Backup chứng minh 35 trang/visual QA |

- Bộ IMG-01…06 chụp qua HTTP ngày 26/8/2026; viewport công bố 1440×1000 (IMG-02: 390×844), nhưng file lưu đã downsample còn 1024×711 trừ IMG-02.
- `images/ch1|ch2|ch3/` là kho 127 hình canonical; chọn hình theo route, không dùng ngẫu nhiên hoặc tách khỏi caption/ngữ cảnh.
- `qa-verification/screenshots/`, `screenshots/sim-review-update-*` và các contact sheet Sim cũ là bằng chứng lịch sử; không dùng làm release-bound visual nếu không ghi rõ ngày/route/version.

## Branding và template

- Không có file logo/crest/emblem/branding chính thức trong repository; `index.html` dùng favicon rỗng `data:,`. **Không tự chế logo**; cover dùng wordmark chữ hoặc xin file biểu trưng chính thức từ đơn vị.
- Không có `.pptx/.potx/.ppt/.pot/.odp/.key/.thmx`; deck phải tạo mới.
- Tái dùng visual system ở `docs/design-guidelines.md`: navy `#091a33/#0d2447/#142e56`, gold `#c9963a/#dbb36a`, text `#e8ecf1/#8ea0b8`; Ch1 `#2980b9`, Ch2 `#27ae60`, Ch3 `#8e44ad`; Segoe UI/Tahoma.

## Map slide 15 phút + backup demo

1. Cover (0:30): ba tác giả, hội đồng/đơn vị, Khánh Hòa–2026.
2. Nhu cầu và đối tượng (1:00): chuyển đổi số, sĩ quan cấp phân đội đại học — `DeCuongChiTietNop.docx`.
3. Cấu trúc 3/21/75/300 (1:00): IMG-01 + quiz JSON.
4. Trải nghiệm học liệu (1:30): IMG-03, offline `file://`/HTTP, PDF.
5. Mô phỏng (2:00): 25 Sim2 + 10 Sim3 fallback; IMG-04.
6. Responsive/accessibility (1:00): IMG-02; nói rõ independent review còn blocked.
7. Đóng gói/QA (1:30): 24 cổng và hash provenance.
8. Kết quả 31 tiêu chí (1:30): biểu đồ 7/21/2/1; Option B PASS.
9. Khoảng trống minh bạch (1:30): IMG-05, quiz placeholder, LMS/Word/reviewer gates, ZIP mismatch.
10. Đề nghị nghiệm thu có điều kiện (1:00): 4 gate + sửa 2 runtime finding + khóa lại ZIP hash.
11. Q&A/backup (2:30): live demo từ `release/2026.08.25-candidate/package/index.html`, route `#ch1-1-4`, PDF viewer; nếu live lỗi dùng IMG-01/03/04/06. Tránh demo search/quiz như luồng đã đạt; dùng chúng khi trả lời về điều kiện còn mở.

## Tệp nguồn bắt buộc giữ cạnh deck

- `README.md`; `DeCuongChiTietNop.docx`; `docs/design-guidelines.md`.
- `data/acceptance-report.json`; `data/lms-targets.json`; `data/evidence-registry.json`.
- `release/2026.08.25-candidate/release-summary.json`; `package/release-manifest.json`; `package/SHA256SUMS`; `huong-dan-su-dung.txt`; ZIP candidate.
- `js/sim2/sim2-route-manifest.js`; `js/sim3/sim3-route-manifest.js`; `package/data/quiz-ch{1,2,3}.json`.
- Option B `independent-final-review.md` + `evidence/option-b-contact-sheet-195caea3.png`.
- Sáu capture `backups/docx-option-b-20260826/captures/img-01…img-06`.

## Câu hỏi chưa giải quyết

- Cần file logo/biểu trưng Học viện Hải quân đã được phép sử dụng nếu cover bắt buộc có logo.
- Release engineering phải xác định hash ZIP nào là chuẩn và tái sinh acceptance evidence trước bản trình cuối.
