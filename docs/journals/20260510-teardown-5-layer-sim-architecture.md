# Teardown of the 5-Layer Simulation Architecture

**Date**: 2026-05-10 12:00
**Severity**: High
**Component**: Simulation Engine (`js/physics`, `js/render`, `js/sims`)
**Status**: Resolved (Decision Made)

## What Happened
Sau khi hoàn thành Phase 01-07 của "Simulation Redesign", người dùng đã đánh giá lại toàn bộ 58 bài lab và quyết định đập đi xây lại 100%. Kiến trúc 5-layer (Physics, Scene, Render, Interaction, Animation) bị từ chối hoàn toàn do quá phức tạp, không đạt độ chính xác vật lý như kỳ vọng và UI/UX không đủ sắc nét, đồng bộ.

## The Brutal Truth
Thực tế phũ phàng là việc tự viết 1 Physics Engine (Euler/Verlet/RK4 integrators) và tự lo phần Render/Interaction bằng Canvas đã dẫn đến 1 hệ thống over-engineered, nhiều bug vật lý (xuyên vật thể, giật lag) và cực kỳ khó style. Việc tạo ra 5 layer để giải quyết bài toán mô phỏng 2D cơ bản của sách giáo khoa là đi ngược lại nguyên tắc KISS. Chúng ta đã lãng phí thời gian build lại bánh xe thay vì dùng đồ có sẵn.

## Technical Details
- Tự build `RigidBody`, `PhysicsWorld` nhưng xử lý collision và constraints (Spring/Weld) không hoàn hảo.
- Canvas rendering rất khó để apply CSS global theme (navy/gold). Mọi thông số màu sắc, stroke width phải hardcode vào JavaScript.
- Việc thiếu hỗ trợ Chart (đồ thị realtime) khiến phần Động lực học bị yếu.

## What We Tried
Chúng ta đã cố gắng chuẩn hóa bằng các pattern như Registry-backed routes, Shared visual primitives, nhưng core physics và rendering vẫn là bottleneck.

## Root Cause Analysis
- **Sai lầm kiến trúc**: Chọn Canvas thay vì SVG/DOM cho 1 ứng dụng ít vật thể (dưới 20 body) cần style CSS mạnh.
- **Sai lầm công nghệ**: Tự viết Physics Engine thay vì dùng 1 thư viện chuẩn công nghiệp (Matter.js).

## Lessons Learned
- YAGNI và KISS: Đừng tự viết Physics Engine trừ khi làm Game Engine chuyên dụng. 
- DOM/SVG rendering kết hợp với thư viện vật lý headless là combo tuyệt vời nhất cho giáo dục tương tác vì tận dụng được 100% sức mạnh của CSS/HTML5 Native.

## Next Steps
Đã lập plan chi tiết tại `plans/20260510-simulation-rewrite-v2/plan.md`. Bắt đầu thực thi Phase 1 (Xóa code cũ, setup `matter.js` và `chart.js`) trong session tiếp theo.
