# 🧠 Brainstorm: Hoàn Thiện Giáo Trình Điện Tử Cơ Học Lý Thuyết

## Phân Tích Hiện Trạng

### Cái đã có ✅
- **1 file HTML monolithic** (~157KB, 3626 dòng) — SPA với 90+ page div
- Sidebar 3 cấp, search (Ctrl+K), dark/light mode, font zoom, breadcrumb
- Quiz engine (15 câu trắc nghiệm, 3 chương × 5 câu)
- 2 simulation tương tác (beam reaction, particle motion) bằng Canvas 2D
- Page navigation (prev/next), responsive design
- **Hầu hết nội dung là placeholder** `(Nội dung chi tiết sẽ được cập nhật)`

### File DOCX full
- ~4.7MB, chứa **đầy đủ nội dung** 3 chương + hình ảnh
- Cần extract text + hình ảnh → chuyển thành HTML

### Vấn đề hiện tại 🔴
| Vấn đề | Mô tả |
|---------|-------|
| **Monolithic** | 1 file HTML chứa mọi thứ, sẽ cực kỳ nặng (có thể 2-5MB+) khi có full nội dung |
| **Không scale** | Thêm nội dung = file lớn hơn = load chậm hơn |
| **Công thức toán** | Chưa có giải pháp render LaTeX/MathML |
| **Hình ảnh** | Đang là ảnh tĩnh trong DOCX, chưa interactive |
| **Bảo trì khó** | Sửa 1 mục phải mở file 3000+ dòng |

---

## 3 Phương Án Đề Xuất

### Phương án A: Multi-Page Static HTML (⭐ ĐỀ XUẤT)

```
GiaoTrinhDienTu_CoHocLyThuyet/
├── index.html                 # Trang chủ + shell (sidebar, topbar)
├── css/
│   └── style.css              # CSS dùng chung
├── js/
│   ├── app.js                 # Core: navigation, theme, search
│   ├── quiz.js                # Quiz engine
│   └── simulations.js         # Interactive simulations
├── chapters/
│   ├── loi-noi-dau.html       # Fragment HTML (chỉ phần content)
│   ├── ch1/
│   │   ├── index.html         # Chapter overview 
│   │   ├── muc-1.html         # I. Các khái niệm cơ bản
│   │   ├── muc-1-1.html       # 1. Vật rắn tuyệt đối
│   │   ├── muc-1-2.html       # 2. Trạng thái cân bằng
│   │   ├── ...
│   │   ├── on-tap.html        # Câu hỏi ôn tập
│   │   └── trac-nghiem.html   # Trắc nghiệm
│   ├── ch2/
│   │   └── ...
│   └── ch3/
│       └── ...
├── images/
│   ├── ch1/                   # Hình ảnh theo chương
│   ├── ch2/
│   └── ch3/
├── simulations/               # Interactive demos  
│   ├── beam-reaction.js
│   ├── particle-motion.js
│   └── ...thêm nhiều sim mới
└── lib/
    └── katex/                 # KaTeX cho công thức toán
```

**Cơ chế hoạt động:**
- `index.html` = shell (sidebar + topbar + content area)
- Click mục → `fetch('chapters/ch1/muc-1-1.html')` → inject vào content area
- **Vẫn là SPA** nhưng nội dung load-on-demand (lazy loading)
- Mỗi file fragment chỉ chứa phần `<div class="content-area">...</div>`

| Ưu điểm | Nhược điểm |
|----------|------------|
| ✅ Load nhanh (chỉ tải trang đang xem) | ⚠️ Cần chỉnh lại JS navigation |
| ✅ Dễ bảo trì (sửa 1 file nhỏ) | ⚠️ Cần build script để extract từ DOCX |
| ✅ Không cần build tool/framework | |
| ✅ Có thể deploy ở bất kỳ đâu (USB, LAN) | |
| ✅ Offline-friendly | |

---

### Phương án B: Vite + Vanilla JS SPA (Modern Build)

- Dùng Vite để bundle, hot-reload khi dev
- Import HTML fragments as modules
- Tự động optimize images, CSS minify

| Ưu điểm | Nhược điểm |
|----------|------------|
| ✅ Dev experience tốt (HMR) | ❌ Cần `npm install`, Node.js |
| ✅ Code splitting tự động | ❌ Phức tạp hơn cho đội ngũ bảo trì |
| ✅ Tree-shaking | ❌ Phải build trước khi deploy |

---

### Phương án C: Giữ nguyên 1 file HTML (Cải thiện)

- Thêm lazy-render: chỉ render page khi click (thay vì render tất cả)
- Nén hình ảnh thành base64 inline hoặc dùng thư mục `images/`
- File sẽ rất lớn (3-5MB+)

| Ưu điểm | Nhược điểm |
|----------|------------|
| ✅ Đơn giản, 1 file | ❌ File quá nặng, load chậm |
| ✅ Dễ chia sẻ | ❌ Khó bảo trì |
| | ❌ Browser lag khi parse DOM lớn |

---

## Đề Xuất Chi Tiết (Phương Án A)

### 1. Công Thức Toán Học — KaTeX

```html
<!-- Inline -->
<span class="math">F = ma</span>

<!-- Block -->
<div class="math-block">
  \vec{R} = \sum_{i=1}^{n} \vec{F_i}
</div>
```

- Dùng **KaTeX** (nhẹ hơn MathJax 10x, render nhanh)
- Auto-render: scan page sau khi load, tìm class `.math` → render
- Hoàn toàn offline (bundle KaTeX fonts + JS vào thư mục `lib/`)

### 2. Hình Ảnh Tương Tác

| Loại hình | Công nghệ | Ví dụ cụ thể |
|-----------|-----------|---------------|
| **SVG tương tác** | Inline SVG + JS events | Sơ đồ liên kết (click để xem phản lực) |
| **Canvas 2D animation** | HTML5 Canvas | Chuyển động chất điểm, quay vật rắn |
| **Pan/Zoom hình tĩnh** | CSS transform + drag events | Hình vẽ phức tạp từ giáo trình |
| **Three.js 3D** | WebGL | Hệ lực không gian 3D, gối cầu |
| **Step-by-step** | Carousel/Stepper | Giải bài tập từng bước |

**Kế hoạch cụ thể cho từng chương:**

#### Chương 1 — Tĩnh học
- 🔬 **Sim: Hình bình hành lực** → Kéo 2 vector, thấy hợp lực real-time
- 🔬 **Sim: Phản lực liên kết** → Kéo lực lên dầm, xem phản lực tại gối (đã có!)
- 🔬 **Sim: Ngẫu lực** → Xoay cặp lực, thấy moment thay đổi
- 🖼️ **Interactive: Các loại liên kết** → Click vào loại liên kết → hiện giải thích + SVG
- 🧊 **3D: Hệ lực không gian** → Three.js scene xoay/zoom

#### Chương 2 — Động học
- 🔬 **Sim: Chyển động chất điểm** → Animation quỹ đạo + vector v, a (đã có!)
- 🔬 **Sim: Chuyển động quay** → Bánh xe quay, hiện ω, ε, v tiếp tuyến
- 🔬 **Sim: Chuyển động song phẳng** → Cơ cấu 4 khớp, tâm vận tốc tức thời
- 🔬 **Sim: Hợp chuyển động** → Thuyền qua sông (v tương đối + v kéo theo)
- 🧊 **3D: Quay quanh điểm cố định** → Con quay hồi chuyển (gyroscope)

#### Chương 3 — Động lực học
- 🔬 **Sim: F = ma** → Đẩy vật trên mặt phẳng, thay đổi m và F
- 🔬 **Sim: Va chạm** → 2 bi va nhau, thay đổi hệ số phục hồi k
- 🔬 **Sim: Bảo toàn động lượng** → Va chạm đàn hồi/hoàn toàn mềm
- 🔬 **Sim: Định lý động năng** → Vật trượt trên mặt phẳng nghiêng
- 🧊 **3D: Con lắc compound** → Three.js pendulum với moment of inertia

### 3. Pipeline Chuyển DOCX → HTML

```
CoHocLyThuyet_Full.docx
        │
        ▼
   [Python Script]
   mammoth / python-docx
        │
        ├── Extract text → Markdown/HTML
        ├── Extract images → images/ch1/, ch2/, ch3/
        └── Convert formulas → KaTeX syntax
        │
        ▼
   [Post-processing]
   ├── Split by headings → individual .html fragments
   ├── Add interactive markers ({% sim:beam-reaction %})
   ├── Add quiz data (JSON)
   └── Optimize images (WebP, responsive sizes)
        │
        ▼
   chapters/ch1/muc-1-1.html  (ready to serve)
```

### 4. Tính Năng Bổ Sung Đề Xuất

| Tính năng | Mô tả | Độ ưu tiên |
|-----------|--------|------------|
| **Tiến trình học** | LocalStorage lưu % đã đọc, đánh dấu hoàn thành | 🟢 Cao |
| **Ghi chú sinh viên** | Highlight text + note cá nhân (localStorage) | 🟡 Trung bình |
| **In/Export PDF** | Print-friendly CSS cho từng chương | 🟢 Cao |
| **Glossary/Từ điển** | Hover thuật ngữ → tooltip giải thích | 🟡 Trung bình |
| **Bookmark** | Đánh dấu trang yêu thích | 🟢 Cao |
| **Nhiều câu TN hơn** | 20-30 câu/chương thay vì 5 | 🟢 Cao |
| **Bài tập step-by-step** | Giải bài tập với gợi ý từng bước | 🟡 Trung bình |

---

## Estimate Khối Lượng Công Việc

| Hạng mục | Ước tính |
|----------|----------|
| Tái cấu trúc project (tách file, modular) | 1-2 ngày |
| Pipeline DOCX → HTML + extract hình ảnh | 1-2 ngày |
| Tích hợp KaTeX cho công thức | 0.5 ngày |
| Tạo 10-15 interactive simulations | 3-5 ngày |
| Tạo 2-3 demo Three.js 3D | 2-3 ngày |
| Mở rộng quiz (60+ câu) | 1-2 ngày |
| UI polish + testing | 1-2 ngày |
| **Tổng cộng** | **~10-17 ngày** |

---

## Câu Hỏi Cần Xác Nhận

1. **Deploy ở đâu?** File tĩnh trên USB/CD? LAN nội bộ? Hay web server?
   - Nếu USB → Phương án A (static files, không cần server)
   - Nếu web → Có thể dùng GitHub Pages hoặc bất kỳ host nào
   
2. **Hình ảnh trong DOCX** — Có muốn giữ nguyên hay vẽ lại dạng SVG/interactive?

3. **Mức độ tương tác mong muốn?** 
   - Chỉ pan/zoom hình? 
   - Interactive simulation như đã có?
   - Full 3D (Three.js)?

4. **Bao nhiêu câu trắc nghiệm/chương** cần tăng lên?

5. **Thứ tự ưu tiên:** Làm xong nội dung text trước hay simulation trước?
