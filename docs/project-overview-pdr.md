# Project Overview & PDR

Cập nhật theo HEAD `455870b`, ngày 2026-07-01.

## Tổng quan

Giáo trình điện tử Cơ Học Lý Thuyết là ứng dụng static `HTML/CSS/JS`, chạy qua `file://` hoặc static hosting, không cần backend. `CoHocLyThuyet_Full_New.docx` là nguồn chuẩn cho text, outline và hình ảnh.

## Mục tiêu và phạm vi

| Mục tiêu | Yêu cầu |
|---|---|
| Offline-first | Reader, nội dung, KaTeX và mô phỏng hoạt động không cần mạng |
| Học tương tác | Search, quiz, progress, bookmark, notes, glossary và simulation |
| Đồng bộ tái lập | DOCX sinh fragment, ảnh, nav, bundle và audit output |
| Dễ bảo trì | Runtime tĩnh; npm chỉ dùng cho QA dev-only |
| Đọc PDF nội tuyến | Nút topbar mở bản PDF local trong dialog, cùng hành vi qua `file://` và HTTP |

Phạm vi gồm ba chương Tĩnh học, Động học, Động lực học. Không gồm backend, tài khoản, cloud sync, CMS hoặc analytics server-side.

## Yêu cầu chính

- Điều hướng, breadcrumb và page order phải khớp nội dung được sinh.
- Quiz hỗ trợ all/random và lưu điểm cục bộ.
- Progress, bookmark và notes giữ qua `localStorage`.
- Sim2 SVG-first là runtime canonical 25 route; Sim3 là pilot tùy chọn 10 route và fallback về Sim2 khi WebGL lỗi.
- Pipeline phải không xuất placeholder `(.)`, phải chuẩn hóa tên ảnh, và audit phải phát hiện content/equation/image regression.
- PDF viewer phải lazy-load toàn bộ asset local, giữ nguyên route/DOM/scroll/simulation/state bài học và không chạy PDF JavaScript.

## Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| Reader shell và offline bundle | Hoàn tất |
| DOCX sync và semantic math | Có pipeline và strict gates |
| Quiz/progress/notes/glossary | Hoàn tất |
| Sim2 | 25 route canonical trong `js/sim2/` |
| Sim3 | 10 route pilot tùy chọn trong `js/sim3/` |
| PDF viewer | Hoàn tất: PDF.js 6.2.108 local, canvas + text layer, `file://`/HTTP parity |
| Cleanup nội dung | Chương 3 VII-4/VII-5/VII-6 đã bỏ; ảnh đã chuẩn hóa tên; `(.)` bị extractor và content test chặn |
| Release | Có folder và `.rar` `GiaoTrinhDienTu_CoHocLyThuyet_release_20260812` trong `release/`; bản `20260701` giữ nguyên làm lịch sử |

Bộ `.sim-lab` 52 route chỉ là lịch sử tại tag `archive/52-sims-pre-removal`, không phải runtime hiện tại.

## Tiêu chí chấp nhận

1. `index.html` mở được bằng `file://` và static server.
2. Nav, fragment, quiz và state client-side hoạt động đúng.
3. PDF viewer mở từ **Xem bản PDF**, chuyển/nhập trang, zoom/vừa chiều rộng, tải đúng source PDF và đóng bằng nút/Escape/Browser Back.
4. `npm run test:pdf:release` và các gate content/quiz/simulation liên quan phải pass khi chốt thay đổi tương ứng.
5. `python tools\audit.py`, cùng strict image/equation gates khi publish, không báo lỗi thật.
6. Generated files chỉ được cập nhật qua pipeline.

## Rủi ro và kiểm soát

| Rủi ro | Kiểm soát |
|---|---|
| Fragment lệch DOCX | Regenerate rồi chạy nav, bundle và audit |
| Route cũ quay lại | `test:content` và manifest/runtime coverage |
| Placeholder hoặc ảnh sai tên quay lại | Extractor normalization và content/audit tests |
| Rò lifecycle simulation | Mount/dispose Playwright coverage |
| PDF runtime/data lệch source hoặc bị thiếu khi ship | Deterministic builder, SHA/provenance, vendor/transport/browser gates |
| Sửa tay generated output | Giữ DOCX và scripts là nguồn sự thật |
