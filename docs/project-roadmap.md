# Project Roadmap

Cập nhật theo HEAD `455870b`, ngày 2026-07-01.

## Đã hoàn tất

| Hạng mục | Trạng thái |
|---|---|
| Static reader và offline bundle | Done |
| DOCX extract, nav, bundle và audit pipeline | Done |
| Semantic math mapping 702 row và strict gates | Done |
| Quiz, progress, bookmark, notes, glossary | Done |
| Sim2 rebuild | Done, 25 route SVG-first canonical |
| Sim3 pilot | Done, 10 route tùy chọn; Sim2 mặc định |
| Legacy simulation cleanup | Done, `.sim-lab` 52 route chỉ còn ở tag lịch sử |
| Content cleanup | Done, Chương 3 VII-4/VII-5/VII-6 removed |
| Image cleanup | Done, tên asset chuẩn hóa và asset thừa được loại |
| Placeholder guard | Done, extractor bỏ `(.)`, `test:content` khóa hồi quy |
| Release package | Done, folder và `.rar` `20260701` trong `release/` |
| PDF viewer nội tuyến | Done, PDF.js 6.2.108 local; `file://`/HTTP, lifecycle và download có gate |

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

## Ưu tiên bảo trì

1. Giữ DOCX là nguồn chuẩn và chạy đầy đủ extract, nav, bundle, audit khi nội dung đổi.
2. Giữ manifest Sim2 là nguồn count 25 route; Sim3 không thay đổi default path.
3. Chạy content, quiz, simulation và strict publish gates phù hợp trước release tiếp theo.
4. Khi source PDF/PDF.js đổi, rebuild deterministic và chạy `test:pdf:release`; ship đủ `CoHocLyThuyet.pdf` + `lib/pdfjs/`.
5. Chỉ tạo release package mới từ output đã kiểm tra, không sửa trực tiếp package ngày 2026-07-01.

## Backlog

| Hạng mục | Mục đích |
|---|---|
| Tinh gọn backup/legacy khi có quyết định phát hành | Giảm kích thước và tránh nhầm source of truth |
| Visual polish theo route có nhu cầu thật | Nâng clarity mà không tách shared shell |
| Chuẩn hóa checklist package tiếp theo | Dễ bàn giao offline/static |

Không có quyết định chính sách phát hành còn mở được ghi nhận trong roadmap này.
