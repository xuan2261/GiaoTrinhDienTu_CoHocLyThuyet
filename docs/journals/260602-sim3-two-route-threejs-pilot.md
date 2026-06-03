# Sim3 Two-Route Three.js Pilot

Hoàn tất pilot 3D tùy chọn cho `ch2-2-2` và `ch3-6-2`. Sim2 SVG-first vẫn là default/canonical; Sim3 chỉ bật qua toggle `2D | 3D`, dùng Three.js vendored offline tại `lib/three/three.umd.min.js`, fallback về 2D khi WebGL/renderer fail.

Điểm review đáng chú ý: `webglAvailable()` ban đầu tạo probe WebGL context nhưng chưa release. Đã release bằng `WEBGL_lose_context` nếu browser hỗ trợ để giảm rủi ro context exhaustion khi mount/dispose lặp lại.

Visual polish follow-up: `ch2-2-2` default capture làm vector `v tiếp tuyến` hơi chìm. Đã tăng độ dày/đầu mũi tên, nâng vector khỏi mặt đĩa và định hướng theo tiếp tuyến thật trong mặt phẳng đĩa. Không đổi physics.

Verification:
- `npm run test:sim3:pilot`: PASS, 6/6.
- `npm run test:sim3:visual:capture`: PASS, 2/2.
- Manual long browser session: PASS.
- `npm run test:sim:release`: PASS.
- Tester gate trước đó: `test:sim:physics` PASS, `test:sim:mount` PASS 104/104.

Artifacts:
- `plans/260602-2103-sim3-two-route-threejs-pilot/visuals/ch2-2-2-sim3.png`
- `plans/260602-2103-sim3-two-route-threejs-pilot/visuals/ch3-6-2-sim3.png`

Unresolved questions: none.
