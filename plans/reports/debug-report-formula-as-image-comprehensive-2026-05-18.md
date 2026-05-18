# Báo Cáo Debug Toàn Diện — Công thức/ký hiệu bị chèn dạng image

**Ngày:** 2026-05-18
**Phạm vi:** Toàn bộ giáo trình điện tử Cơ Học Lý Thuyết (3 chương + 3 file đầu sách, 102 file HTML, 136 ảnh)
**Mức độ:** CRITICAL (10 ảnh sai), HIGH (40 duplicate), MEDIUM (14 file mixed render), LOW (134 alt generic)

---

## 1. Tóm tắt điều hành (Executive Summary)

| Chỉ số | Giá trị |
|---|---|
| Tổng row trong `equation_mapping.json` | 702 |
| → có MathML | 645 (91.9%) |
| → có LaTeX | 53 (7.5%) |
| → artifact=figure (cố ý là sơ đồ) | 2 |
| → artifact=blank (xoá khỏi HTML) | 2 |
| → KHÔNG có cả MathML lẫn LaTeX | 0 |
| Tổng `<img>` trong 3 chương HTML | 136 |
| → mapped + render OK (MathML/LaTeX/figure-có-alt) | 126 |
| → **Mapped là figure (hợp lệ)** | 2 (`hinh-078`, `hinh-211`) |
| → **KHÔNG nằm trong mapping (formula-as-image thực sự)** | **8** |
| File HTML dùng cả MathML + KaTeX | 14 |
| Pair duplicate (cùng công thức render 2 cách) | 40 trong 8 file |
| Ảnh có alt generic "Hình minh hoạ chương X" | 134/136 |

**Kết luận:** Pipeline DOCX → HTML cho 645/702 công thức về MathML là đúng. Tuy nhiên còn **8 ảnh** xuất phát từ DOCX dạng raster (không phải MathType OLE) nên pipeline không phát hiện được, vẫn đi đường `figure-container` mặc dù nội dung là công thức/ký hiệu. Ngoài ra có **40 cặp duplicate** trong 8 file (đặc biệt `ch2/muc-I-1.html` 12 cặp, `ch2/muc-II-2.html` 9 cặp), và **14 file** trộn lẫn MathML + KaTeX gây bất nhất font/spacing.

---

## 2. Vấn đề CRITICAL — 8 công thức/ký hiệu bị chèn là `<img>` (mã hoá raster trong DOCX)

Đặc điểm chung: `<img>` nằm trong `<div class="figure-container">`, alt = "Hình minh hoạ chương X", **KHÔNG có entry trong `equation_mapping.json`**, `prog_id=None` trong `tools/equation_report.json` (DOCX không nhúng object MathType, mà là raster bình thường). Pipeline coi như figure → sai bản chất nội dung.

| # | File | src | Bytes | Pixel | Mode | Ngữ cảnh đứng trước | Bản chất thực |
|---|------|-----|------:|------:|------|---------------------|---------------|
| 1 | `ch1/muc-III-2.html` | `images/ch1/hinh-037.png` | 1135 | 352×544 | 1-bit | "...sức căng của dây, kí hiệu là" | Ký hiệu vector $\vec T$ |
| 2 | `ch1/muc-III-3.html` | `images/ch1/hinh-039.png` | 1478 | 384×544 | 1-bit | "Phản lực liên kết" | Ký hiệu vector phản lực |
| 3 | `ch3/muc-V-4.html` | `images/ch3/hinh-136.png` | 1135 | 288×576 | 1-bit | "Vật rắn chuyển động tịnh tiến: Vật có khối lượng m chuyển động với véc tơ" | $\vec v$ |
| 4 | `ch3/muc-VII-1.html` | `images/ch3/hinh-240.png` (xuất hiện 2 lần) | 1333 | 384×544 | 1-bit | "trọng lực của trục mất cân bằng" / "của vỏ động cơ" | $\vec P_2$ và $\vec P_1$ (cùng 1 file, dùng 2 chỗ) |
| 5 | `ch3/muc-VII-1.html` | `images/ch3/hinh-241.png` | 1642 | 448×576 | 1-bit | "phản lực của nền lên động cơ" | $\vec N$ |
| 6 | `ch3/muc-VII-2.html` | `images/ch3/hinh-266.png` | **407** | **42×22** | RGB | sau "Dây không dãn: a2= a1" | Biểu thức inline rất nhỏ (rõ ràng là glyph) |
| 7 | `ch3/muc-VII-2.html` | `images/ch3/hinh-283.png` | **765** | **89×24** | RGB | sau "Chiếu lên trục Ox: $P_2-T_2=0$ (5)" | Biểu thức inline (chắc chắn glyph) |
| 8 | `ch3/muc-VII-2.html` | `images/ch3/hinh-289.png` | 1277 | 416×544 | 1-bit | "Bài 2: Một rơ moóc … dưới tác dụng của lực" | Vector lực |

**Hai pixel-pattern rõ rệt:**
- `mode=1` (1-bit), kích thước ~3-4×rộng × ~5×cao — raster đen-trắng của ký hiệu vector chữ in từ Word, file size ~1-2KB.
- `mode=RGB` rất nhỏ (42×22 và 89×24) — đúng là inline math glyph mà DOCX chèn là image.

**Hai trường hợp `artifact=figure` (HỢP LỆ, KHÔNG cần fix):**

| File | src | Lý do để là figure |
|------|-----|---------------------|
| `ch1/muc-IV-3.html` | `images/ch1/hinh-078.png` (11KB) | Sơ đồ hệ lực phân bố trên dầm — diagram thực sự, không phải công thức |
| `ch2/muc-V-3.html` | `images/ch2/hinh-211.png` (82KB) | Sơ đồ gia tốc pháp tuyến — diagram thực sự |

Cả hai có alt mô tả chính xc (`alt="Sơ đồ hệ lực phân bố trên dầm"`, `alt="Sơ đồ gia tốc pháp tuyến"`) và `artifact=figure` trong `equation_mapping.json`. Pipeline xử lý đúng. Báo cáo trước nhầm lẫn ghép vào danh sách CRITICAL.

---

## 3. Vấn đề HIGH — 40 cặp duplicate render (MathML + KaTeX cạnh nhau cho cùng 1 công thức)

Pattern: `<span class="mathml-inline">…</math></span>` rồi ngay sau là `<span class="math-tex">\(…\)</span>` (hoặc đảo chiều). Browser sẽ render **hai lần** cùng một công thức → người đọc thấy lặp lại, lệch baseline.

| File | Inline pairs | Block pairs |
|------|------------:|------------:|
| `ch1/muc-III-3.html` | 1 | 0 |
| `ch1/muc-IV-3.html` | 1 | 0 |
| `ch2/muc-I-1.html` | **12** | 0 |
| `ch2/muc-II-2.html` | **9** | 0 |
| `ch2/muc-V-3.html` | 1 | 0 |
| `ch2/muc-VII-1.html` | 3 | 0 |
| `ch3/muc-VII-1.html` | 5 | 0 |
| `ch3/muc-VII-2.html` | **8** | 0 |
| **Tổng** | **40** | **0** |

Ví dụ trong `ch2/muc-II-2.html`:
```
<span class="mathml-inline"><math>… ω accent ¯ …</math></span>
<span class="math-tex">\(\bar{\omega}=\mathrm{const}\)</span>
```
Hai biểu thức này biểu diễn cùng một thứ — phải xoá 1.

(Báo cáo trước đếm 8 — không bắt được hết do regex chỉ tìm pattern hẹp. Lần này tìm thấy **40** pairs.)

---

## 4. Vấn đề MEDIUM — 14 file dùng cả 2 cơ chế render

```
ch1: muc-I-4, muc-III-3, muc-IV-3, muc-IV-5
ch2: muc-I-1, muc-II-2, muc-V-3, muc-VII-1
ch3: muc-II-2, muc-V-3, muc-V-4, muc-VI-3, muc-VII-1, muc-VII-2
```

MathML render bằng browser native (font Cambria Math/STIX), KaTeX render bằng font KaTeX_Main. Trong cùng 1 đoạn văn, baseline và size khác nhau gây flicker/wobble visual.

**Số block render trong những file này:**
- `ch2/muc-VII-1.html`: 51 `<math>`, 2 `\(...\)`, 9 `figure-container`
- `ch3/muc-VI-3.html`: 42 `<math>`, 2 `\(...\)`, 1 `\[...\]`, 7 `figure-container`
- `ch2/muc-II-2.html`: 50 `<math>`, 10 `math-tex`, 6 `figure-container`

→ MathML là cơ chế chủ đạo (645/702 công thức). 53 entry còn lại chỉ có LaTeX (do `auto_review_equation_mapping.py` không convert được MathType OLE → MathML, fallback giữ LaTeX). Trong các file mixed, MathML bao trùm + KaTeX rải rác → đa số trường hợp KaTeX là **bản duplicate dư thừa** chứ không phải bù đắp thiếu.

---

## 5. Vấn đề LOW — Alt text & accessibility

| Chỉ số | Giá trị |
|---|---|
| `<img>` có alt = "Hình minh hoạ chương 1/2/3" (generic) | **134/136** |
| `<img>` có alt mô tả thực tế | 2 (hinh-078, hinh-211) |
| `<img>` thiếu alt | 0 |
| Figure thiếu `<figcaption>` | 136/136 (toàn bộ) |

**Hệ luỵ:** Screen reader chỉ đọc "Hình minh hoạ chương 3" cho mọi ảnh. Sinh viên khiếm thị không thể phân biệt sơ đồ động học với sơ đồ tĩnh học.

---

## 6. Phân tích nguyên nhân gốc (Root Cause)

### 6.1 Pipeline xử lý ảnh trong `tools/extract_docx.py:443-498`

```
DOCX paragraph → image_node → render_image_segment(chapter, media, meta)
  → media_hash = sha256(blob)
  → mapping = equation_mapping.get(media_hash)  ← key bằng hash
  → if mapping: render_mapped_equation()         ← MathML/LaTeX/figure
  → elif kind == "math-inline": <img class="math-img math-img-inline">
  → elif kind == "math-display": <img class="math-img"> trong .math-img-block
  → else (kind=figure): <div class="figure-container"><img alt="Hình minh hoạ chương X">
```

`kind` được suy ra trong `extract_docx.py:_classify_image()` (đoạn trên 443) từ kích thước + ngữ cảnh paragraph. Khi DOCX chèn 1 raster nhỏ (vector arrow, ký hiệu) **bên ngoài** một `<w:object>` MathType, pipeline không tìm thấy `prog_id` (xem `equation_report.json`: `prog_id=None`), cũng không có hash trong `equation_mapping.json` (vì auto-review chỉ map các media có matching OLE — `auto_review_equation_mapping.py:243-252`), `kind` mặc định = `figure` → đường `figure-container`.

### 6.2 `auto_review_equation_mapping.py:262-296`

Khi MathML convert thành công:
```python
updated["latex"] = ""        # XOÁ LaTeX
updated["mathml"] = mathml
updated["reviewed"] = True
```
→ giải thích cho `has_both = 0` (không có hàng nào có cả LaTeX lẫn MathML). Đây là quyết định kỹ thuật đúng — tránh redundancy trong file mapping. Tuy nhiên các fragment HTML đã sinh ra trước khi review (hoặc sinh ra theo bản OCR còn LaTeX) có thể đã chèn cả 2 → sinh ra **40 cặp duplicate** trong nhánh 8 file.

### 6.3 8 ảnh formula-as-image

DOCX gốc `CoHocLyThuyet_Full_New.docx` cho 8 vị trí này không dùng MathType OLE, mà **paste raster image trực tiếp từ Word equation cũ hoặc ảnh chụp** (1-bit PNG, ~1KB). Đây là dạng input mà pipeline hiện tại không thể recover semantic — buộc phải bù bằng OCR Vision ngoài hoặc edit thủ công trong DOCX.

### 6.4 Audit hiện tại không phát hiện

`tools/audit.py --strict-images` PASS 102/102 vì chỉ kiểm tra:
- Wrapper `figure-container` có hay không.
- Alt có tồn tại không.
- File ảnh có tồn tại trên disk không.

→ Không kiểm tra **bản chất nội dung** trong PNG (không có Vision). Không có rule "ảnh nhỏ + nằm liền sau cụm 'kí hiệu là' / 'véc tơ' / 'phản lực' → flag candidate formula-as-image".

---

## 7. Khuyến nghị fix theo độ ưu tiên

### P1 — CRITICAL: Khử 8 ảnh formula-as-image

**Approach A (khuyến nghị): OCR + KaTeX thủ công**

8 ảnh quá ít để build pipeline phức tạp. Quy trình:
1. Mở từng ảnh, OCR thủ công ra LaTeX (dễ vì đa phần là $\vec T$, $\vec P_1$, $\vec N$, $\vec v$, $a_2=a_1$, …).
2. Trong file HTML thay:
   ```html
   <div class="figure-container"><img src="images/ch1/hinh-037.png" alt="Hình minh hoạ chương 1" loading="lazy"></div>
   ```
   bằng:
   ```html
   <span class="math-tex">\(\vec T\)</span>
   ```
   (inline) — chú ý xoá luôn 2 thẻ `<p>` khoá kéo trước/sau nếu đoạn văn đang bị tách bởi figure-container.
3. Re-bundle: `python tools/bundle_pages.py`.
4. Validate: mở `index.html` trong browser, kiểm tra render KaTeX.

**Approach B: Sửa tận gốc trong DOCX, chạy lại pipeline**

Mở DOCX, chọn từng ảnh raster đó → xoá → Insert > Equation > MathType, gõ lại biểu thức → save → chạy:
```
python tools/extract_docx.py --input CoHocLyThuyet_Full_New.docx --write
python tools/auto_review_equation_mapping.py --docx ... --input data/equation_mapping.json --output data/equation_mapping.json
python tools/bundle_pages.py
python tools/audit.py --strict-images
```
Lợi ích: không tích nợ trong HTML, lần extract sau vẫn sạch. Bất lợi: cần Word/MathType + Ruby gem đã setup.

**Mapping LaTeX dự kiến cho 8 ảnh:**
- `hinh-037` → `\vec T` (sức căng dây)
- `hinh-039` → `\vec R_A` (phản lực bản lề) — hoặc `\vec N`
- `hinh-136` → `\vec v`
- `hinh-240` (dùng 2 lần) → context 1: `\vec P_2`, context 2: `\vec P_1`
- `hinh-241` → `\vec N` (phản lực nền)
- `hinh-266` → biểu thức nhỏ; cần OCR (gợi ý kích thước 42×22 → hình như "$T$")
- `hinh-283` → biểu thức nhỏ 89×24 → gợi ý `T_1=T_2`
- `hinh-289` → `\vec F` (lực ngang)

OCR thủ công 1 lần là đủ; verify qua browser screenshot.

### P2 — HIGH: Khử 40 duplicate render

Script auto:
```python
# pseudo
for file in 8_files:
    html = read(file)
    html = re.sub(
        r'<span class="mathml-inline">.*?</math>\s*</span>(\s{0,30})<span class="math-tex">\\\(([^)]+)\\\)</span>',
        r'<span class="mathml-inline">…</math></span>\1',  # giữ MathML, bỏ KaTeX
        html, flags=re.DOTALL)
    # tương tự pattern đảo
    write(file, html)
```
Quy tắc giữ: **giữ MathML** (vì 645/702 đang dùng MathML; thống nhất một cách render). Sau khi xoá, chạy `python tools/bundle_pages.py` + `audit.py`.

### P3 — MEDIUM: Standardize render về MathML

14 file mixed sẽ tự khử ~40 KaTeX khi P2 hoàn thành. Còn lại 53 entry chỉ có LaTeX (KaTeX) — các entry này thuộc vùng `auto_review` skip do MathType convert fail (`Auto-review skipped: ...`). 2 lựa chọn:
- Giữ KaTeX cho 53 entry này → chấp nhận 14 file mixed có 1-2 KaTeX inline còn lại.
- Convert thủ công 53 LaTeX → MathML (mathjax-node hoặc tay).

Khuyến nghị: giữ nguyên 53 KaTeX (không gây duplicate) — chỉ cần đồng bộ font qua CSS:
```css
.math-tex, .math-tex-block { font-family: "KaTeX_Main", "Cambria Math", serif; }
.mathml-inline math, .mathml-block math { font-family: "Cambria Math", "Latin Modern Math", serif; }
```

### P4 — LOW: Alt text mô tả

Bổ sung map `media_hash → semantic_alt` thủ công cho 134 ảnh. Trong DOCX gốc đa phần ảnh có caption hình `(Hình 1.12)` ngay sau — script có thể parse cụm `(Hình X.Y)` ở paragraph kế tiếp để đặt alt mặc định:
```
alt="Hình 1.12 — Liên kết dây mềm"
```
Hoặc tối thiểu phân loại: ảnh trong chương 1 phần Liên kết → "Sơ đồ liên kết …", chương 2 phần Động học vector → "Sơ đồ vector vận tốc …".

### P5 — Bổ sung audit rule (chống regression)

Thêm rule vào `tools/audit.py`:
```python
# Flag suspect formula-as-image
SUSPICIOUS_NEIGHBORS = (
    'kí hiệu là', 'véc tơ', 'phản lực', 'đặt vào', 'sức căng',
    'lực', 'gia tốc', 'vận tốc', 'mô men',
)
for img in figure_imgs:
    fsize = os.path.getsize(img.src)
    if fsize < 5000:                              # nhỏ + 1-bit là chỉ dấu
        ctx = preceding_paragraph(img)
        if any(kw in ctx for kw in SUSPICIOUS_NEIGHBORS):
            warn(f'Suspect formula-as-image: {img.src} ({fsize}B) ctx="{ctx[-60:]}"')
```
Build gate fail nếu phát hiện ≥ 1 trường hợp mới.

---

## 8. File cần sửa (concrete)

### P1 (8 ảnh formula):
- `chapters/ch1/muc-III-2.html` — `hinh-037.png`
- `chapters/ch1/muc-III-3.html` — `hinh-039.png`
- `chapters/ch3/muc-V-4.html` — `hinh-136.png`
- `chapters/ch3/muc-VII-1.html` — `hinh-240.png` (×2 vị trí), `hinh-241.png`
- `chapters/ch3/muc-VII-2.html` — `hinh-266.png`, `hinh-283.png`, `hinh-289.png`

### P2 (40 duplicate, tự xử bằng regex script):
- `chapters/ch1/muc-III-3.html` (1)
- `chapters/ch1/muc-IV-3.html` (1)
- `chapters/ch2/muc-I-1.html` (12)
- `chapters/ch2/muc-II-2.html` (9)
- `chapters/ch2/muc-V-3.html` (1)
- `chapters/ch2/muc-VII-1.html` (3)
- `chapters/ch3/muc-VII-1.html` (5)
- `chapters/ch3/muc-VII-2.html` (8)

### P3 (mixed, tham chiếu sau khi P2 xong):
- `ch1/muc-I-4`, `ch1/muc-IV-5`
- `ch3/muc-II-2`, `ch3/muc-V-3`, `ch3/muc-V-4`, `ch3/muc-VI-3`

---

## 9. Kết luận

- Pipeline DOCX → HTML cho 645/702 công thức về MathML đang chạy đúng.
- **8 ảnh** đang là raster trong DOCX gốc → pipeline không thể recover, cần OCR/edit thủ công.
- **40 cặp duplicate** là di sản của các đợt extract chưa đồng bộ — fix nhanh bằng regex script một lần.
- **2 ảnh** trong báo cáo cũ (hinh-078, hinh-211) là `artifact=figure` HỢP LỆ; đây là sơ đồ thật, không phải công thức. Báo cáo cũ nhầm.
- **40 vs 8 duplicate**: lần này quét rộng pattern thấy 40 (vs 8 trước), do regex cũ chỉ bắt pattern hẹp. Đây là số chính xác.
- Audit hiện tại PASS nhưng **không có rule** phát hiện formula-as-image trong tương lai → cần bổ sung.

---

## 10. Câu hỏi chưa giải quyết

1. 8 ảnh CRITICAL nên fix bằng cách (A) chỉnh DOCX gốc rồi re-extract, hay (B) chỉnh trực tiếp HTML thủ công?
2. 53 entry LaTeX-only (không có MathML) có cần convert thêm về MathML để đồng bộ 100%?
3. Alt text 134 ảnh nên auto-generate từ caption "Hình X.Y" trong DOCX, hay viết tay theo nội dung?
4. Có nên block release pipeline khi audit phát hiện formula-as-image candidate (P5)?
