# Giới hạn tuyên bố 4D cho mô phỏng

## Nghĩa sử dụng trong dự án

Trong tài liệu này, **4D** chỉ là một khung mô tả học tập gồm ba thành phần đồng thời:

1. **Biểu diễn không gian 3D** khi Sim3 pilot làm rõ trục, độ sâu, hướng hoặc quan hệ hình học.
2. **Tiến triển theo thời gian/trạng thái** qua tham số, bước mô phỏng, reset hoặc thay đổi trạng thái do người học tạo ra.
3. **Tương tác của người học** qua control, drag handle hoặc chuyển Sim2/Sim3.

Nó **không** có nghĩa là chiều không gian thứ tư, một định dạng tệp mới, hay một khả năng runtime khác. Sim2 SVG-first là mô phỏng canonical; Sim3 là pilot tùy chọn cho 10 route và phải fallback về Sim2 khi WebGL không dùng được.

## Tiêu chí sư phạm

Sim3 chỉ nên được giữ khi chiều sâu làm rõ quan hệ cơ học mà biểu diễn 2D khó phân biệt, trong khi Sim2 vẫn giữ được cùng state, control và readout thiết yếu. Mỗi review phải nêu rõ:

- giới hạn của biểu diễn 2D;
- giá trị 3D cụ thể, không phải chỉ hiệu ứng thị giác;
- nguy cơ tải nhận thức và cách giảm;
- tương đương fallback Sim2;
- quyết định `retain-3d` hoặc `2d-only`.

Metric tự báo cáo trong `window.__SIM3_DEBUG__` chỉ phục vụ chẩn đoán. Nó không phải oracle duy nhất cho correctness vật lý, giá trị sư phạm hoặc accessibility.

## Trạng thái evidence hiện tại

`data/simulation-specifications.json` và `data/sim3-pedagogical-reviews.json` là **technical-review verified** sau khi plan runtime `plans/260713-1524-fix-all-sim2-sim3-defects-deep-tdd` hoàn tất và `phase-11-evidence.json` khóa SHA-256 cho objective/full/soak command records, Sim2/Sim3 capture manifests và run images, contact sheets, strict 35-route interaction probe, selective visual baseline spec cùng năm snapshot đã review. `verified` ở đây chỉ xác nhận source/test/evidence freshness và policy kỹ thuật; reviewer role/unit vẫn là nội bộ, không phải independent review hay institutional approval.

Mọi source, adapter, oracle hoặc executable evidence đổi sẽ làm hash stale và `validate-simulation-drift.js --require-verified` fail cho đến khi chạy lại đúng gate, review artifact và refresh record. Metric trong `window.__SIM3_DEBUG__` vẫn chỉ phục vụ chẩn đoán, không phải correctness/pedagogy oracle duy nhất.

## Drift gate

`tools/sim-validation/validate-simulation-drift.js` kiểm tra exact coverage 25 Sim2/10 Sim3, duplicate/missing/extra/rename, title/chapter parity, root-confined regular-file source hash freshness, route-associated executable-evidence catalogs, adapter identity, document-level review authority, structured independent-oracle policies, concrete capture/run-image integrity, strict probe semantics và visual baseline hashes. Nó không được import vào browser runtime. `--require-verified` chỉ pass khi owning plan/phases 01–11 complete, mọi required Phase 11 artifact còn fresh và mọi record/document ở trạng thái `verified`; nó không tạo academic, accessibility hoặc institutional approval.
