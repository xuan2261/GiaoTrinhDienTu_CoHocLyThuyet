Đã kiểm tra README.md, index.html, css/style.css:23, docs/design-guidelines.md:68, docs/system-architecture.md:31. Hiện tại layout là ebook shell tĩnh 2 vùng chính + topbar fixed.

  Architecture Analysis

  Layout tổng thể:

  ┌──────────────────────────────────────────────┐
  │ Topbar fixed: 52px                            │
  ├───────────────┬──────────────────────────────┤
  │ Sidebar fixed │ Main content                  │
  │ 250-320px     │ centered content-area         │
  │ accordion nav │ max 680-900px thường          │
  └───────────────┴──────────────────────────────┘

  Các vùng chính:

  | Vùng | Kích thước / hành vi |
  |---|---|
  | topbar | Fixed top, cao 52px, full width. Chứa menu, brand, search, theme, font zoom, breadcrumb |
  | sidebar | Fixed left, top bắt đầu sau topbar, rộng --sw: clamp(250px, 18vw, 320px) |
  | main | margin-left: var(--sw), margin-top: 52px, cao tối thiểu calc(100vh - 52px) |
  | content-area | Canh giữa, max-width: clamp(680px, 55vw, 900px), padding 1.5rem 2rem 3rem |
  | progress-bar | Fixed dưới topbar, đi theo vùng main/sidebar |
  | footer | Cuối main content |
  | notes-panel | Floating panel góc phải, rộng 320px, max-height 70vh |

  Vùng nội dung bài học:

  - Nội dung chương/mục được inject vào #content-area.
  - Mỗi mục thường nằm trong .l3-content: card nền var(--nav), border, bo góc 8px, border-left vàng.
  - Paragraph có line-height: 1.7, text học thuật, ảnh max-width: 100%.
  - Math block dùng .mathml-block, .math-tex-block, .math-img-block, có overflow-x để tránh tràn ngang.

  Simulation Layout

  Mô phỏng hiện dùng shell .sim-lab chung cho 58 routes:

  .sim-container.sim-lab
  ├─ .sim-header: title + route chip + status
  ├─ .sim-lab-scene: canvas 760×440, aspect-ratio 760/440
  │  └─ canvas + overlay labels/formulas
  ├─ .sim-lab-toolbar: legend / route tools
  ├─ .sim-controls: sliders, buttons, reset/play
  ├─ .sim-readout-grid: cards thông số
  ├─ .sim-formula-panel
  └─ .sim-lab-hint

  Kích thước quan trọng:

  | Thành phần | Kích thước |
  |---|---|
  | Canvas logical size | 760 × 440 px |
  | Canvas aspect ratio | 760 / 440 ≈ 1.73 |
  | Scene viewport | width: max-content, max-width: 100%, scale theo CSS |
  | .sim-readout-grid | repeat(auto-fit, minmax(130px, 1fr)) |
  | Slider group | min-width: 150px, flex: 1 1 150px |
  | Sim buttons/tools | min-height hiện tại 44px ở shell mới |
  | Mobile <=560px | controls full-width, readout 2 cột |
  | <=768px | Sidebar chuyển sang off-canvas, main full-width, content padding 1rem |
  | <=480px | Breadcrumb ẩn, topbar thu nhỏ, content padding .6rem .5rem 2rem, stats grid 2 cột |
  | <=560px cho simulation | Controls/sliders/buttons gần như full-width, readout 2 cột |
  | <=380px cho simulation | Readout 1 cột |
  | >=2000px | Sidebar tăng 280-360px, content max 750-960px |
  | >=2560px | Sidebar tăng 300-400px, content max 800-1080px |

  Design Recommendations

  Hiện tại layout hợp với giáo trình đọc dài: sidebar cố định + content hẹp là đúng. Điểm yếu là simulation bị nhét trong content-area max 900px, nên canvas 760×440 vừa đủ desktop nhưng hơi chật nếu muốn lab
  nhiều bảng điều khiển hoặc đồ thị.

  Nếu nâng cấp UI, nên giữ:

  - Topbar 52px, vì đủ thấp để không ăn viewport.
  - Sidebar clamp, vì ổn giữa laptop và desktop.
  - Content text max 900px, vì hợp nhịp đọc tài liệu.
  - Simulation shell dùng chung, không tạo layout riêng từng route.

  Nên cân nhắc tách reading page và simulation page density:

  - Text/math/figure giữ max-width: 900px.
  - Simulation hiện đã dùng wrapper scoped rộng hơn: desktop khoảng 1061px ở viewport 1366, tablet khoảng 740px ở viewport 768, nhưng chỉ cho .sim-container, không phá toàn bộ content.
  - Mobile nhỏ giữ simulation contained trong content để tránh horizontal scroll.

  Technology Guidance

  Không cần đổi framework. Repo đang là static HTML/CSS/JS, chạy file://, phù hợp mục tiêu offline/USB. Layout hiện tại dùng CSS variables, clamp, fixed layout, media queries đủ tốt.

  Nếu chỉnh layout sau này, nên chỉnh ở css/style.css và giữ contract từ docs/design-guidelines.md:64: content đọc hẹp, simulation scoped wide, topbar compact không overlap.

  Next Actions

  1. Nếu chỉ cần tài liệu mô tả: có thể bổ sung sơ đồ layout vào docs/design-guidelines.md.
  2. Nếu cần cải thiện trải nghiệm mô phỏng: đo screenshot desktop/mobile rồi quyết định có nới riêng .sim-container không.
  3. Nếu cần audit UI thật: chạy Playwright screenshot ở các viewport 1366, 768, 390 để kiểm overlap/overflow.
