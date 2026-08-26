# Báo cáo trạng thái kỹ thuật cho Option B

Ngày khóa: 2026-08-26  
Nguồn: repository, `data/acceptance-report.json`, `data/lms-targets.json`, candidate `2026.08.25` và kiểm tra runtime qua HTTP.

## Candidate và acceptance

- Candidate: `release/2026.08.25-candidate/`.
- Inventory: 374 tệp.
- ZIP SHA-256: `6b48834ff3cfaddf29af6c0c83593e74ca4541c085da0bb8b1c36f128212cdbd`.
- Acceptance: 24 gate; 20 pass, 0 fail, 3 blocked, 1 not-run.
- Blocked: `academic-review-currentness`, `accessibility-independent-review`, `release-independent-smoke`.
- Not-run: `word-standalone-roundtrip`.
- Release decision: blocked; không có tuyên bố final release hoặc LMS certification.

## Năng lực đã có bằng chứng kỹ thuật

- Ứng dụng tĩnh HTML/CSS/JavaScript; vận hành `file://` và HTTP.
- Candidate inventory/manifest/SHA256SUMS.
- PDF 139 trang mở trong trình đọc tích hợp.
- 25 route Sim2; Sim3 là thí điểm có fallback về Sim2.
- Quiz data, progress, notes và localStorage có trong gói/mã nguồn.
- QA registry có owner, command, timeout, failure class và evidence class.
- QTI 3 và Common Cartridge 1.4 ở mức `adapter-validated` cục bộ.

## Giới hạn LMS

- `qti3.targets` và `commonCartridge.targets` rỗng.
- `executionEvidence` rỗng; kiểm gói cục bộ không phải bằng chứng import LMS.
- SCORM và xAPI/cmi5 blocked trước khi có LMS/LRS target, profile, privacy model và runtime evidence.
- Không được dùng cụm “tương thích LMS” hoặc “đã tích hợp LMS”.

## Quan sát runtime ngày 26/8/2026

Môi trường: candidate qua HTTP, Chromium, viewport 1440 × 1000 và 390 × 844.

- Trang chủ desktop/mobile hiển thị ổn ở hai viewport đại diện.
- Route `#ch1-2-3` hiển thị học liệu Chương 1.
- Route `#ch1-1-4` hiển thị mô phỏng mô men: `F=50 N`, `d=4,00 m`, `M=200,0 N·m`.
- Trình đọc PDF mở trang 1/139.
- Tìm “mô men” hiển thị thông báo fallback sang mục lục; full-text runtime chưa được chứng minh trên candidate.
- Route `#ch1-quiz` hiển thị “Câu hỏi trắc nghiệm đang được cập nhật”; luồng làm bài candidate chưa được chứng minh dù data/tests tồn tại.

## Quyết định dùng trong báo cáo

- Không sửa acceptance evidence hoặc gate status bằng tay.
- Giữ `TC 3.3` ở “Đạt có điều kiện”; search fallback là điều kiện đóng.
- Hạ kỹ thuật `TC 6.1` xuống “Đạt có điều kiện” do placeholder runtime.
- Nâng kỹ thuật `TC 6.3` lên “Đạt có điều kiện” do QTI 3 adapter/package local; vẫn cần LMS import evidence.
- Phân bố ma trận kỹ thuật: 7 đạt trong phạm vi, 21 đạt có điều kiện, 2 chưa triển khai, 1 hỗn hợp 3D/4D.
- Các thay đổi này là rà soát kỹ thuật; chủ trì phải xác nhận, không phải phê duyệt thể chế.

## Kết quả DOCX

- Boundary mới: 5.246 từ, giảm 25,6% so với 7.054 từ.
- 3 bảng, 6 ảnh candidate có route/viewport/date/hash.
- Ma trận: 7 cột, 10 hàng nhóm, 31 hàng dữ liệu; đủ 31 mã duy nhất và B1–B12.
- Prefix qua `paraId 606D2659` và final `sectPr` giữ nguyên.
- Outline nhận diện `QC_Title/QC_Muc/QC_TieuMuc`; `updateFields=true` cho Word cập nhật TOC.
- Word round-trip và independent final review vẫn mở.