# Brainstorm Report: 100% Simulation System Rewrite

**Date:** 2026-05-10
**Status:** Approved

## Problem Statement & Requirements
Hệ thống mô phỏng hiện tại (5 layers: Physics, Scene, Render, Interaction, Animation) gặp các vấn đề nghiêm trọng:
- Độ chính xác vật lý kém, giật lag.
- Code quá phức tạp, khó maintain và thêm mới bài tập.
- UI/UX rời rạc, tương tác không mượt mà, thiếu đồng bộ giữa các bài (Consistency).
- Thiếu các công cụ biểu diễn dữ liệu trực quan như đồ thị realtime.

**Yêu cầu:** Đập đi xây lại 100% (xóa sạch hệ thống cũ), sử dụng kiến trúc mới hoàn thiện, đẹp, dễ control, chính xác vật lý và hỗ trợ đồ thị realtime.

## Evaluated Approaches
1. **Matter.js + Canvas (Rejected):** Hiệu năng cao nhưng rất khó để style đồng bộ bằng CSS, UI control dễ bị lệch tông với tổng thể trang web.
2. **Matter.js Headless + SVG/DOM + HTML5 Native Controls (Selected):** Tách biệt hoàn toàn Logic Vật lý (Matter.js) và Render (SVG/DOM). Sử dụng CSS để style mọi thứ. Dùng Native HTML5 cho thanh trượt và Chart.js cho đồ thị. 

## Final Recommended Solution
- **Core Architecture**: Xóa toàn bộ file cũ (`js/physics`, `js/render`, `js/scene`...). Viết lại 1 Core Wrapper duy nhất.
- **Physics Engine**: Sử dụng thư viện **Matter.js** chạy ẩn (headless) để đảm bảo độ chính xác vật lý chuẩn mực.
- **Rendering**: Đồng bộ tọa độ từ Matter.js sang các thẻ **SVG/DOM** thông qua `requestAnimationFrame`. Điều này giúp hình ảnh vector sắc nét 100% trên mọi màn hình và style cực kỳ dễ dàng qua file CSS chung.
- **UI & Controls**: Sử dụng **Native HTML5** (`<input type="range">`, `<button>`) kết hợp CSS variables để tạo các panel điều khiển cực đẹp, nhất quán và minimalist.
- **Data Visualization**: Tích hợp **Chart.js** để vẽ đồ thị realtime (vận tốc, gia tốc, lực) đồng bộ với nhịp chạy của engine vật lý.
- **Offline-First**: Toàn bộ script (matter.js, chart.js) sẽ được lưu local trong thư mục `lib/`.

## Implementation Considerations & Risks
- **Rủi ro**: Khối lượng công việc lớn do phải migrate lại 58 bài mô phỏng.
- **Giải pháp**: Xây dựng Core Framework cực kỳ vững chắc và linh hoạt trước. Sau đó làm 3 bài Pilot (1 Tĩnh học, 1 Động học, 1 Động lực học) để chuẩn hóa template trước khi nhân bản ra 58 bài.
- **Rủi ro**: Map hệ tọa độ của Matter.js (Top-Left) sang hệ tọa độ Toán học (Center/Bottom-Left).
- **Giải pháp**: Viết 1 layer Camera/Transform nhỏ trong Core Wrapper để tự động đảo trục Y.

## Success Metrics
- Xóa bỏ 100% code tự chế vật lý cũ.
- Tương tác mượt mà, vật lý chính xác, không xuyên vật thể, không giật lag.
- UI Control và Biểu đồ thống nhất về Palette màu (có thể đổi Dark/Light mode dễ dàng vì dùng CSS hoàn toàn).
- Codebase cực kỳ gọn, mỗi bài mô phỏng chỉ cần < 100 dòng code logic (khai báo vật thể + setup biểu đồ).

## Next Steps & Dependencies
1. Setup môi trường: Xóa code cũ, tải `matter.js` và `chart.js` về `lib/`.
2. Core Layer: Xây dựng `js/sim-engine-v2.js` (Matter + SVG Renderer).
3. UI Layer: Tạo hệ thống CSS cho slider và panel điều khiển.
4. Pilot: Viết lại 3 bài mô phỏng mẫu.
