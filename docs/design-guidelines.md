# Design Guidelines

Giao diện giữ phong cách học thuật, rõ, responsive, với dark navy + gold và accent riêng theo chương.

## Visual system

| Yếu tố | Quy ước |
|---|---|
| Nền | `--bg: #091a33`, `--nav: #0d2447`, `--nav2: #142e56` |
| Accent | `--gold: #c9963a`, `--gold-l: #dbb36a` |
| Text | `--tx: #e8ecf1`, `--tx2: #8ea0b8` |
| Chương | Ch1 `#2980b9`, Ch2 `#27ae60`, Ch3 `#8e44ad` |
| Typography | `Segoe UI, Tahoma, Geneva, Verdana, sans-serif`; body line-height thoáng |
| Motion | Nhẹ, có reduced-motion fallback |

## Layout

- Topbar fixed, sidebar collapsible, content centered với reading width ổn định.
- Không nới toàn bộ content chỉ để chứa simulation.
- `<=900px`: ưu tiên menu/search, ẩn thành phần topbar phụ nếu cần.
- `<=768px`: sidebar overlay, content full-width, simulation panel xếp dọc.
- `<=560px`: controls và readouts không tràn ngang, touch target đủ lớn.
- Figure dùng semantic `<figure><img alt><figcaption></figure>`.
- PDF dialog chiếm viewport nhưng toolbar phải wrap sạch đến 320 px; mọi control có touch target tối thiểu 44 px.

## Sim2 visual language

Sim2 là design/runtime canonical cho 25 route.

| Thành phần | Quy ước |
|---|---|
| Shell | `createSimShell`, SVG + HTML overlay + optional canvas underlay |
| Header | Tên sim, badge section/chapter và reset khi route khai báo metadata |
| Scene | Nền sáng, graph-paper nhẹ; vật thể đặc có thể dùng depth opt-in |
| Geometry | Vector, axis, grid và dashed guide giữ phẳng, ít nhiễu |
| Theory | KaTeX, legend màu, live readout và observation cạnh viewport |
| Controls | Slider có `<output>`, playback start paused, reset/step rõ |
| Interaction | Drag handle và slider đồng bộ hai chiều |
| Accessibility | Reduced motion, contrast rõ, label/readout không chỉ dựa vào màu |

Palette semantic dùng `Sim2Palette` và `--sim-c-*`: đỏ cho lực, lục cho vận tốc, lam cho gia tốc, tím cho mô men, cam cho hợp lực, coral cho handle. Không thêm màu semantic ad hoc.

## Sim3 pilot

Sim3 chỉ là lớp 3D tùy chọn cho 10 route. Nó phải giữ cùng hierarchy, controls và terminology với Sim2; không thay shell toàn cục. Khi WebGL lỗi, hiển thị thông báo tiếng Việt và quay về 2D, không để blank state.

## Component rules

| Component | Quy ước |
|---|---|
| Search | Dropdown rõ, keyboard usable, `Ctrl K` |
| Breadcrumb/sidebar | Active state dễ nhận biết, motion tiết chế |
| Quiz | Answer target dễ bấm, feedback đúng/sai rõ |
| Notes/glossary | Không che hoặc phá nhịp đọc |
| Math | KaTeX/MathML, không dùng raster figure cho công thức |
| Images | `max-width: 100%`, alt/caption cụ thể, filename từ pipeline normalized |
| Ảnh động | Chỉ thay ảnh có trong manifest; giữ alt/caption, PNG fallback và nút trạng thái 44 px |
| PDF viewer | Native full-screen dialog, navy-gold toolbar, trang giấy sáng, focus ring rõ, canvas + selectable text |

## Motion và feedback

- Handle pulse/active, output/readout flash và formula highlight chỉ dùng để giải thích thay đổi.
- Trail chỉ dùng cho route động/field, giới hạn số điểm và tắt hiệu ứng không thiết yếu khi reduced motion.
- Formula/readout không rerender mỗi frame nếu có thể cập nhật theo key.
- Sim2 và Sim3 đều không autoplay mặc định.
- PDF page/zoom render không animation; button transition phải tắt khi `prefers-reduced-motion`.
- GIF minh họa mặc định hoạt động, nhưng dùng PNG khi `prefers-reduced-motion: reduce` nếu người học chưa lưu lựa chọn; nút **Ảnh động** cho phép ghi đè rõ ràng.
- GIF chỉ mô tả chuyển động có ý nghĩa vật lý, không autoplay âm thanh, không dùng làm nền trang và phải tự fallback về PNG khi tải lỗi.

## Legacy

`.sim-lab` canvas shell và bộ 52 route là lịch sử đã gỡ khỏi master, không phải design target hiện tại. Tham chiếu lịch sử chỉ tại tag `archive/52-sims-pre-removal`.

## Do / Don't

| Do | Don't |
|---|---|
| Reuse token và shared Sim2 components | Tạo variant shell riêng cho từng route |
| Giữ hierarchy theo chương | Dùng style ngẫu nhiên giữa route |
| Đặt clarity và physics trước hiệu ứng | Thêm motion/3D chỉ để trang trí |
| Review light/dark và mobile | Chỉ kiểm một viewport |
| Giữ trigger **Xem bản PDF** rõ trên desktop và accessible name trên mobile | Nhét thumbnail/sidebar hoặc công cụ ngoài scope vào viewer |
| Giữ PNG canonical và chỉ phát hành GIF đã duyệt qua manifest | Đổi hàng loạt mọi hình sang GIF hoặc ghi đè ảnh trong `images/` |
