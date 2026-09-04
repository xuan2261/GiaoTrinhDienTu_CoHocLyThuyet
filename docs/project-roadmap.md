# Project Roadmap

Cập nhật release-readiness ngày 2026-08-22.

## Đã hoàn tất

| Hạng mục | Trạng thái |
|---|---|
| Static reader và offline bundle | Done |
| DOCX extract, nav, bundle và audit pipeline | Done |
| Semantic math mapping 702 row và strict gates | Done |
| Quiz, progress, bookmark, notes, glossary | Done |
| Sim2 rebuild + deep remediation | Done, 25 route SVG-first canonical; fixed-step, responsive/DPR, keyboard, lifecycle và independent physics oracles |
| Sim3 pilot + deep remediation | Done, 10 route tùy chọn; hệ tay phải, demand rendering, GPU disposal và safe Sim2 fallback |
| Legacy simulation cleanup | Done, `.sim-lab` 52 route chỉ còn ở tag lịch sử |
| Content cleanup | Done, Chương 3 VII-4/VII-5/VII-6 removed |
| Image cleanup | Done, tên asset chuẩn hóa và asset thừa được loại |
| Placeholder guard | Done, extractor bỏ `(.)`, `test:content` khóa hồi quy |
| Reproducible release package | Done technically: candidate `2026.08.29`, 372 files, SHA-256 `f38996d8614f73dc7355124606c99bf983d01171e00dd0adc0f373a7b762ee0e`; final acceptance remains gated |
| PDF viewer nội tuyến | Done, PDF.js 6.2.108 local; `file://`/HTTP, lifecycle và download có gate |
| Chế độ đọc rộng (Standard / Wide) | Done, toggle trên topbar, lưu `contentWidth`, responsive và không reflow tràn màn hình |
| Bảng tra cứu ký hiệu chương | Done, dữ liệu `chapter-reference.json` có truy vết route, render tự động ở đầu Chương 1–3 |
| Menu quiz theo từng phần I–VII | Done, chọn phạm vi từng phần, đếm câu hỏi động, lưu attempt độc lập theo phần trong store v2 |

## Mốc chính

| Mốc | Kết quả |
|---|---|
| P0 Reader | Shell, routing và offline load |
| P1 DOCX sync | Fragment, images, nav và bundle tái tạo được |
| P2 Semantic math | Mapping reviewed và strict equation publish |
| P3 Simulation canonical | Sim2 25 route, physics/core/route separation, release gate |
| P4 Optional 3D | Sim3 pilot 10 route với WebGL fallback |
| P5 Content stabilization | Route bài tập thừa bị gỡ, filename ảnh normalized, placeholder bị chặn |
| P6 Release 20260701 | Package folder và RAR được tạo |
| P7 PDF reader | Dialog nội tuyến lazy-load, canvas + text layer, không đổi lesson state |
| P8 Release readiness remediation | 20/24 canonical gates pass; frozen candidate verified; final acceptance blocked by academic signoff, independent accessibility/smoke review and Word round-trip |
| P9 LMS derivative pilots | QTI 3 and Common Cartridge 1.4 adapters/packages validated locally; no target LMS import claim |
| P10 Simulation deep TDD | 25 Sim2 + 10 Sim3 contracts closed; objective/full visual/three-run soak pass; technical evidence hash-bound |
| P11 Reader enhancements | Chế độ đọc rộng, tra cứu ký hiệu đầu chương và quiz theo từng phần I–VII hoàn thiện theo TDD |
## Ưu tiên bảo trì

1. Giữ DOCX là nguồn chuẩn và chạy đầy đủ extract, nav, bundle, audit khi nội dung đổi.
2. Giữ manifest Sim2 là nguồn count 25 route; Sim3 không thay đổi default path. Mọi thay đổi simulation phải chạy `test:sim:release`, `test:sim:release:full`, `test:sim:release:soak` và refresh hash-bound evidence trước `validate-simulation-drift.js --require-verified`.
3. Chạy `python tools/run_qa_gates.py --all`, `npm run test:acceptance` và build Phase 12 evidence bundle trước release tiếp theo.
4. Khi source PDF/PDF.js đổi, rebuild deterministic và chạy `test:pdf:release`; ship đủ `CoHocLyThuyet.pdf` + `lib/pdfjs/`.
5. Regenerate từ `data/release-policy.json`; không sửa trực tiếp package đã tạo.
6. Final acceptance chuyển trạng thái sau khi Hội đồng Thẩm định chuyên môn độc lập ký duyệt hồ sơ (dự kiến đầu tháng 09/2026) cùng các bằng chứng nghiệm thu độc lập.
7. Giữ nguyên cấu hình mô phỏng: 25 route Sim2 canonical (2D SVG-first) + 10 route Sim3 pilot (3D WebGL); chưa mở rộng thêm 3D để tối ưu hiệu năng và tránh tăng tải nhận thức.

## Backlog & TODO

| Hạng mục | Mục đích | Trạng thái |
|---|---|---|
| Nghiệm thu Hội đồng chuyên môn độc lập | Ký duyệt biên bản và hoàn tất hồ sơ `data/academic_signoffs.json` | Kế hoạch: Đầu tháng 09/2026 |
| Mô-đun thu thập phản hồi / đánh giá người dùng | Xuất dữ liệu đánh giá, phản hồi học tập dạng tệp JSON cục bộ để gửi giảng viên | TODO (chưa cần thiết hiện tại) |
| Tinh gọn backup/legacy khi có quyết định phát hành | Giảm kích thước và tránh nhầm source of truth | Backlog |
| Visual polish theo route có nhu cầu thật | Nâng clarity mà không tách shared shell | Backlog |
| Chuẩn hóa checklist package tiếp theo | Dễ bàn giao offline/static | Backlog |
Không có quyết định kỹ thuật mở. Bốn prerequisite bên ngoài cho final acceptance được ghi rõ trong Phase 12 report.
