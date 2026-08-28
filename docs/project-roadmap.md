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
| Reproducible release package | Done technically: candidate ZIP, 374 files, SHA-256 `6b48834ff3cfaddf29af6c0c83593e74ca4541c085da0bb8b1c36f128212cdbd`; final acceptance remains gated |
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
6. Final acceptance chỉ chuyển khỏi blocked sau independent academic/accessibility/candidate-smoke evidence và Word round-trip pass.

## Backlog

| Hạng mục | Mục đích |
|---|---|
| Tinh gọn backup/legacy khi có quyết định phát hành | Giảm kích thước và tránh nhầm source of truth |
| Visual polish theo route có nhu cầu thật | Nâng clarity mà không tách shared shell |
| Chuẩn hóa checklist package tiếp theo | Dễ bàn giao offline/static |

Không có quyết định kỹ thuật mở. Bốn prerequisite bên ngoài cho final acceptance được ghi rõ trong Phase 12 report.
