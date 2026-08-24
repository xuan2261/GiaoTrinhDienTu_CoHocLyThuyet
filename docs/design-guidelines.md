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
| Focus/status | `--focus-ring`, `--focus-halo`, `--success`, `--danger`; theme-specific contrast, `:focus-visible` only |

## Layout

- Topbar fixed, sidebar collapsible, content centered với reading width ổn định.
- Không nới toàn bộ content chỉ để chứa simulation; logical viewport giữ tỉ lệ, CSS scale trong card và theory panel chuyển từ cạnh sang dưới.
- `<=900px`: ưu tiên menu/search, ẩn thành phần topbar phụ nếu cần; sim không được tạo horizontal overflow.
- `<=768px`: sidebar overlay, content full-width, simulation panel xếp dọc; label/readout phải nằm trong viewport/card.
- `<=560px`: controls và readouts wrap, không tràn ngang, touch target tối thiểu 44 px; slider vẫn có output đọc được.
- Figure dùng semantic `<figure><img alt><figcaption></figure>`.
- PDF dialog chiếm viewport nhưng toolbar phải wrap sạch đến 320 px; mọi control có touch target tối thiểu 44 px.
- `<=560px`: topbar thành hai hàng (controls + search), `--th` đồng bộ sidebar/main/progress để focus và content không bị che.

## Sim2 visual language

Sim2 là design/runtime canonical cho 25 route.

| Thành phần | Quy ước |
|---|---|
| Shell | `createSimShell`, SVG + HTML overlay + optional canvas underlay |
| Header | Tên sim, badge section/chapter và reset khi route khai báo metadata |
| Scene | Nền sáng, graph-paper nhẹ; vật thể đặc có thể dùng depth opt-in; logical viewport không đổi khi resize |
| Geometry | Vector, axis, grid và dashed guide giữ phẳng, ít nhiễu; arrow/tangent/contact phải đúng hướng và điểm đặt |
| Theory | KaTeX, legend màu, live readout và observation cạnh viewport; công thức không rerender mỗi frame nếu chỉ số thay đổi |
| Controls | Slider có `<label>` + `<output>`, playback start paused, reset/step rõ; target tối thiểu 44 px ở narrow layout |
| Interaction | Drag handle và slider đồng bộ hai chiều; Arrow/Home/End cho cùng domain và clamp với pointer |
| Accessibility | Reduced motion, focus-visible, contrast rõ, label/readout nêu đại lượng–dấu–đơn vị và không chỉ dựa vào màu |

- Vector phải dùng màu semantic đúng vai trò, mũi tên đúng chiều, nhãn nằm gần vector nhưng không che contact/trajectory; readout cùng màu chỉ là hỗ trợ, không thay nội dung chữ.
- Canonical SVG handle có pointer drag và bàn phím; resize/DPR không đổi world state hoặc vị trí logic của handle.

Palette semantic dùng `Sim2Palette` và `--sim-c-*`: đỏ cho lực, lục cho vận tốc, lam cho gia tốc, tím cho mô men, cam cho hợp lực, coral cho handle. Không thêm màu semantic ad hoc.

## Sim3 pilot

Sim3 chỉ là lớp 3D tùy chọn cho 10 route. Nó giữ cùng hierarchy, controls, state và terminology với Sim2; chiều sâu chỉ được giữ khi làm rõ axis/plane/contact, không dùng như trang trí. Camera/label phải giữ vector, dấu và readout đọc được ở 360/520/900/1024 px và DPR 1/2. Khi thiếu Three.js/WebGL hoặc setup/update/render/resize lỗi, hiển thị status tiếng Việt và quay về Sim2 2D dùng được, không để blank state.

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
| Shell | Một `main`, skip link giữ route hiện tại, landmark có nhãn, sidebar disclosure công bố `aria-expanded` |
| Media pilot | Academic utilitarian, one causal visual per objective, static fallback visible before enhancement, native 44 px controls, no remote fonts/assets |

## Motion và feedback

- Handle pulse/active, output/readout flash và formula highlight chỉ dùng để giải thích thay đổi.
- Trail chỉ dùng cho route động/field, giới hạn số điểm và tắt hiệu ứng không thiết yếu khi reduced motion.
- Formula/readout không rerender mỗi frame nếu có thể cập nhật theo key.
- Sim2 và Sim3 đều không autoplay mặc định.
- PDF page/zoom render không animation; button transition phải tắt khi `prefers-reduced-motion`.
- GIF minh họa mặc định hoạt động, nhưng dùng PNG khi `prefers-reduced-motion: reduce` nếu người học chưa lưu lựa chọn; nút **Ảnh động** cho phép ghi đè rõ ràng.
- GIF chỉ mô tả chuyển động có ý nghĩa vật lý, không autoplay âm thanh, không dùng làm nền trang và phải tự fallback về PNG khi tải lỗi.
- Phase 8 automation chỉ kiểm observable contracts và deterministic token pairs; screen reader, 200%/400% browser zoom, text spacing và visualization equivalence vẫn là manual review.
- Bốn prototype Chương 1 dùng cùng token navy/paper/gold, Georgia cho heading và Segoe UI cho body; không thêm CDN hoặc font tải mạng.
- Loader chỉ chuyển từ static sang interactive sau khi asset hoặc Sim2 mount thành công. Biểu đồ và interaction không animate; pilot GIF bắt đầu bằng poster và chỉ được yêu cầu sau thao tác **Dùng ảnh động**, còn reduced motion giữ phương án tĩnh.

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
