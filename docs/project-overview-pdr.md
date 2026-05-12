# Project Overview & PDR

Cập nhật: 2026-05-06.

## Tổng quan

Đây là giáo trình điện tử tĩnh cho môn Cơ Học Lý Thuyết, triển khai bằng `HTML/CSS/JS` và thiết kế để chạy trực tiếp trên browser mà không cần backend. Nội dung gốc và thứ tự hiển thị được lấy từ `CoHocLyThuyet_Full_New.docx`.

## Mục tiêu sản phẩm

| Mục tiêu | Mô tả |
|---|---|
| Offline-first | Mở được bằng `file://` hoặc copy qua USB |
| Học tương tác | Có search, quiz, progress, bookmark, notes, glossary, simulations |
| Đồng bộ DOCX | Có pipeline để xuất fragment, ảnh, nav, bundle, audit từ DOCX |
| Dễ bảo trì | Script rõ vai trò, không cần package manager phức tạp |

## Phạm vi

| Trong phạm vi | Ngoài phạm vi |
|---|---|
| 3 chương: Tĩnh học, Động học, Động lực học | Backend, user account, sync cloud |
| Fragment HTML sinh từ DOCX | CMS hoặc editor WYSIWYG trực tuyến |
| Quiz JSON, progress, notes, glossary | Analytics server-side |
| Mô phỏng canvas trong `js/simulations.js` | 3D engine hoặc WebGL nặng |

## Người dùng chính

| Vai trò | Nhu cầu |
|---|---|
| Học viên | Đọc bài, làm quiz, lưu tiến trình, ghi chú |
| Giảng viên | Kiểm tra outline, nội dung, câu hỏi ôn tập |
| Maintainer | Chạy lại extract, update nav, bundle, audit |

## Yêu cầu chức năng

| ID | Yêu cầu |
|---|---|
| FR-01 | Mở được toàn bộ nội dung khi không có internet |
| FR-02 | Điều hướng đúng theo route map và page order |
| FR-03 | Search hoạt động trên sidebar và trang hệ thống |
| FR-04 | Quiz hỗ trợ all/random mode và lưu điểm cục bộ |
| FR-05 | Progress, bookmark, notes phải giữ qua lần mở sau |
| FR-06 | Glossary tooltip và simulations phải gắn theo DOM fragment hiện tại |
| FR-07 | Pipeline DOCX phải sinh được fragment, ảnh, manifest, bundle, audit report |

## Yêu cầu phi chức năng

| ID | Yêu cầu |
|---|---|
| NFR-01 | Chạy ổn trên static hosting và `file://` |
| NFR-02 | Không phụ thuộc backend runtime |
| NFR-03 | Tái tạo được nội dung từ DOCX nguồn chuẩn |
| NFR-04 | Audit phải fail rõ khi có lỗi content hoặc equation fallback sai |
| NFR-05 | Mỗi file docs nên ngắn, dễ đọc, dễ sửa |

## Tiêu chí chấp nhận

| Tiêu chí | Dấu hiệu đạt |
|---|---|
| Đọc được | `index.html` mở ra và load được trang home |
| Điều hướng được | Sidebar, breadcrumb, page nav khớp route |
| Tương tác được | Quiz, progress, notes, glossary, simulations chạy |
| Đồng bộ được | `extract_docx.py`, `update_nav.py`, `bundle_pages.py` hoàn tất |
| Audit được | `python tools\audit.py` không báo lỗi thật |

## Ràng buộc

| Ràng buộc | Hệ quả |
|---|---|
| Không có package manager | Dùng script có sẵn, không thêm workflow cài đặt thừa |
| DOCX là source of truth | Sửa nội dung phải đi qua pipeline, không sửa tay fragment đã sinh |
| Bản offline cần bundle | `js/pages.js` phải được regenerate khi fragment thay đổi |
| Semantic math strict | Mapping publish phải pass strict trước khi regenerate release |

## Trạng thái hiện tại

| Hạng mục | Trạng thái |
|---|---|
| Shell đọc nội dung | Xong |
| DOCX sync pipeline | Có sẵn |
| Offline bundle | Có sẵn |
| Quiz/progress/notes/glossary/simulations | Có sẵn |
| Current simulation runtime | Active `.sim-lab` canvas + scene/renderer/behavior registries; Ch1 pilot parallelogram là reference-only |
| QA harness | Có sẵn: dev-only Playwright baseline + Python manifest/quality/runtime gates |

| Semantic math strict publish | Automated strict pass; browser QA 100% |

## Rủi ro chính

| Rủi ro | Tác động | Giảm thiểu |
|---|---|---|
| Fragment lệch DOCX | Nội dung sai hoặc thiếu | Chạy `extract_docx.py` và `audit.py` sau mỗi lần sync |
| Equation fallback còn ảnh | Bản publish không đạt strict | Chạy strict audit sau khi merge mapping |
| Generated files bị sửa tay | Lệch nguồn sự thật | Gắn rõ file sinh tự động và không edit trực tiếp |
| LocalStorage đổi key | Mất progress/notes | Giữ ổn định key hiện tại |

## Câu hỏi chưa rõ

| Câu hỏi | Ảnh hưởng |
|---|---|
| Browser QA representative pages cần mức sâu nào trước release | Ảnh hưởng thời gian chốt release |
| `backups/` và `Old/` có tiếp tục nằm trong repo phát hành hay chỉ phục vụ lưu trữ nội bộ | Ảnh hưởng kích thước repo và snapshot công cụ |
