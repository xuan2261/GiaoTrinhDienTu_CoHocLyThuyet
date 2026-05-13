# Bo cuc layout hien tai cua giao trinh dien tu

Thong tin nay tong hop tu `README.md`, `index.html`, `css/style.css`, `docs/design-guidelines.md`, va `docs/system-architecture.md`.

## Tong quan

Giao trinh hien tai la mot ebook shell tinh bang `HTML/CSS/JS`, chay duoc truc tiep qua `file://`. Layout chinh la **2 vung noi dung + topbar fixed**:

```text
+------------------------------------------------+
| Topbar fixed: 52px                              |
+----------------+-------------------------------+
| Sidebar fixed  | Main content                   |
| 250-320px      | centered content-area          |
| accordion nav  | max 680-900px thuong           |
+----------------+-------------------------------+
```

## Cac vung hien thi chinh

| Vung | Kich thuoc / hanh vi |
|---|---|
| `topbar` | Fixed top, cao `52px`, full width. Chua menu, brand, search, theme, font zoom, breadcrumb |
| `sidebar` | Fixed left, top bat dau sau topbar, rong `--sw: clamp(250px, 18vw, 320px)` |
| `main` | `margin-left: var(--sw)`, `margin-top: 52px`, cao toi thieu `calc(100vh - 52px)` |
| `content-area` | Canh giua, `max-width: clamp(680px, 55vw, 900px)`, padding `1.5rem 2rem 3rem` |
| `progress-bar` | Fixed duoi topbar, di theo vung main/sidebar |
| `footer` | Cuoi main content |
| `notes-panel` | Floating panel goc phai, rong `320px`, max-height `70vh` |

## Noi dung bai hoc

- Noi dung chuong/muc duoc inject vao `#content-area`.
- Moi muc thuong nam trong `.l3-content`: card nen `var(--nav)`, border, bo goc `8px`, border-left vang.
- Paragraph co `line-height: 1.7`, phu hop doc tai lieu hoc thuat.
- Anh minh hoa dung `.figure-container`; anh co `max-width: 100%`.
- Cong thuc dung `.mathml-block`, `.math-tex-block`, `.math-img-block`; cac block nay co `overflow-x` de tranh tran ngang.

## Layout trang chu

Trang chu duoc dat truc tiep trong `index.html`, gom:

- `.hh`: hero title giao trinh.
- `.sg`: stats grid 4 cot tren desktop.
- `.cg`: chapter chips cho 3 chuong.

Kich thuoc/lien quan:

| Thanh phan | Kich thuoc / hanh vi |
|---|---|
| `.hh h1` | Khoang `2.2rem` desktop, xuong `1.3rem` tren mobile nho |
| `.sg` | `grid-template-columns: repeat(4, 1fr)` |
| `.sc` | Stats card, padding `.8rem`, bo goc `8px` |
| `.cg` | Flex wrap, canh giua |

## Sidebar

Sidebar la menu dieu huong chinh:

- Fixed left, scroll doc rieng.
- Co `nav-btn`, `sub-menu`, `l2`, `l3-menu`, `l3`.
- Ho tro collapse bang class `.closed`.
- Tren mobile, sidebar chuyen sang off-canvas va co overlay.

Kich thuoc:

| Thanh phan | Kich thuoc |
|---|---|
| Sidebar width mac dinh | `clamp(250px, 18vw, 320px)` |
| Sidebar width `>=2000px` | `clamp(280px, 16vw, 360px)` |
| Sidebar width `>=2560px` | `clamp(300px, 14vw, 400px)` |
| Sidebar width `<=1400px` | `clamp(230px, 20vw, 280px)` |

## Topbar

Topbar la thanh co dinh o tren cung:

- Cao `52px`.
- Chua nut menu, brand, search box, theme toggle, font zoom, breadcrumb.
- Search co dropdown ket qua `.sr`, max-height `260px`.
- Breadcrumb `.bc` co `max-width: 350px`, overflow ellipsis.

## Simulation layout

Mo phong hien dung shell `.sim-lab` chung cho 58 routes:

```text
.sim-container.sim-lab
+- .sim-header: title + route chip + status
+- .sim-lab-scene: canvas 760x440, aspect-ratio 760/440
|  +- canvas + overlay labels/formulas
+- .sim-lab-toolbar: legend / route tools
+- .sim-controls: sliders, buttons, reset/play
+- .sim-readout-grid: cards thong so
+- .sim-formula-panel
+- .sim-lab-hint
```

Kich thuoc quan trong:

| Thanh phan | Kich thuoc |
|---|---|
| Canvas logical size | `760 x 440` px |
| Canvas aspect ratio | `760 / 440 ~= 1.73` |
| Scene viewport | `width: max-content`, `max-width: 100%`, scale theo CSS |
| `.sim-readout-grid` | `repeat(auto-fit, minmax(130px, 1fr))` |
| Slider group | `min-width: 150px`, `flex: 1 1 150px` |
| Sim buttons/tools | min-height `44px` trong shell moi |
| Mobile `<=560px` | controls full-width, readout 2 cot |
| Mobile `<=380px` | readout 1 cot |

## Responsive behavior

| Breakpoint | Hanh vi |
|---|---|
| `<=768px` | Sidebar chuyen sang off-canvas, main full-width, content padding `1rem` |
| `<=480px` | Breadcrumb an, topbar thu nho, content padding `.6rem .5rem 2rem`, stats grid 2 cot |
| `<=560px` cho simulation | Controls/sliders/buttons gan nhu full-width, readout 2 cot |
| `<=380px` cho simulation | Readout 1 cot |
| `>=2000px` | Sidebar tang `280-360px`, content max `750-960px` |
| `>=2560px` | Sidebar tang `300-400px`, content max `800-1080px` |

## Danh gia kien truc layout

Layout hien tai phu hop voi giao trinh doc dai:

- Sidebar fixed giup dieu huong nhanh giua chuong/muc.
- `content-area` hep vua phai, tot cho nhịp doc text hoc thuat.
- Topbar thap `52px`, khong chiem nhieu viewport.
- Simulation shell dung chung, giup dong nhat giua 58 routes.

Diem can luu y:

- Simulation dang nam trong `content-area` max 900px, nen du cho canvas `760 x 440` nhung co the chat neu them nhieu control/do thi.
- Neu nang cap simulation, nen noi rieng `.sim-container` thay vi noi toan bo `content-area`.
- Khong nen tao layout rieng cho tung route simulation; nen giu shared shell.

## Khuyen nghi

1. Giu `topbar` cao `52px`.
2. Giu sidebar clamp theo viewport.
3. Giu text content max-width khoang `900px`.
4. Neu can cai thien mo phong, can nhac wrapper rieng cho `.sim-container`, vi du `min(1120px, 100%)`.
5. Truoc khi thay doi layout, nen chup screenshot/test cac viewport `1366px`, `768px`, `390px` de kiem overlap/overflow.

## Cau hoi chua ro

Khong co.
