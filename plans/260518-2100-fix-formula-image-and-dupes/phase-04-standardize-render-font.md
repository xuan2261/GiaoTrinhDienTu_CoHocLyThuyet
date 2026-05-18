---
phase: 4
title: "Standardize Render Font + KaTeX htmlAndMathml Output"
status: completed
priority: P2
effort: "2-3h"
dependencies: [1, 3]
---

# Phase 04: Standardize Render Font + KaTeX htmlAndMathml Output

## Overview

Đồng bộ font-family, baseline, line-height giữa `<math>` (MathML native) và `.math-tex` (KaTeX). 53 row LaTeX-only vẫn dùng KaTeX. Đồng thời **verify/configure KaTeX render với `output: 'htmlAndMathml'`** để screen reader đọc được MathML semantic (red-team F3.2 — KaTeX HTML-only mode `aria-hidden="true"` khiến screen reader bỏ qua hoàn toàn).

## Validation Decisions (red-team 2026-05-18)

- **F3.2 (MEDIUM):** Verify `index.html` đang dùng `renderMathInElement(..., {output: 'htmlAndMathml'})`. Nếu chưa, add. Đảm bảo 53 KaTeX render có MathML accessible cho screen reader.
- **F2.1:** Test plain Python (no pytest).

## Requirements

### Functional
- File CSS có rule chung tag `math` và `.math-tex` cùng `font-family`, `vertical-align`, `font-size` consistent.
- Các 14 file mixed render (sau khi phase 3 khử duplicate) hiện diện đúng cả 2 cơ chế nhưng không bị lệch baseline.
- KaTeX local font hoạt động trên `file://`.
- Visual diff với baseline: 0 pixel diff vùng text bình thường, ≤ 2px diff vùng công thức (do font khác nhau).

### Non-functional
- CSS phải nhỏ, dùng `font-feature-settings` thay vì replicate KaTeX font hoàn toàn.
- Không phá render cho các file chỉ dùng MathML hoặc chỉ dùng KaTeX.
- Hỗ trợ dark/light theme (đã có biến `--text-color`).

## Architecture

```
assets/css/equations.css  (mới hoặc append vào file đang có)
  ├── math, math[display="inline"]      → font-family, font-size, baseline
  ├── math[display="block"]              → display: block; margin: 0.5em 0
  ├── .mathml-inline                     → display: inline-block; vertical-align: middle
  ├── .mathml-block                      → display: block; text-align: center
  ├── .math-tex                          → align với mathml-inline
  └── .math-tex-block                    → align với mathml-block
```

Lựa chọn font-family: ưu tiên fallback chain
```
"Latin Modern Math", "Cambria Math", "STIX Two Math", "KaTeX_Main", serif
```
KaTeX_Main font nằm trong `assets/katex/fonts/` (đã có local). Khi browser fallback, .math-tex sẽ tự dùng KaTeX_Main, math sẽ dùng Cambria/STIX. Ép `font-feature-settings: "ss04"` cho cả 2 để khớp italic shape (math-italic).

## Related Code Files

- Modify:
  - `assets/css/equations.css` (tạo mới nếu chưa có hoặc append vào `style.css`)
  - `index.html` (verify thứ tự CSS — equations.css load sau katex.min.css; add `output: 'htmlAndMathml'` vào KaTeX config nếu chưa có)
- Create:
  - `scripts/test-phase-04-render-font.py` (plain Python static check)
  - `tests/visual/test_math_visual_baseline.spec.js` (Playwright visual test)
  - `tests/visual/baseline/` (snapshot dir, mới)
  - `reports/visual-diff-baseline.md`
- Delete: none

## Implementation Steps

### TDD Step 1 — RED test: CSS rules + KaTeX output config (plain Python)

```python
# scripts/test-phase-04-render-font.py
"""Phase 04: CSS rules consistent + KaTeX renders htmlAndMathml (F3.2)."""
import sys
from _test_helpers import project_root

REQUIRED_CSS = [
    'math', '.math-tex', '.math-tex-block',
    '.mathml-inline', '.mathml-block',
    'Cambria Math', 'KaTeX_Main',
]

def main():
    proj = project_root()
    failures = []

    # Test 1: CSS rules present
    css_candidates = [proj / 'assets/css/equations.css', proj / 'assets/style.css']
    css = ''
    for c in css_candidates:
        if c.exists():
            css = c.read_text(encoding='utf-8')
            break
    for rule in REQUIRED_CSS:
        if rule not in css:
            failures.append(f'CSS missing rule: {rule!r}')

    # Test 2: CSS file under 80 lines (KISS)
    if css.count('\n') > 80:
        failures.append(f'equations CSS over 80 lines: {css.count(chr(10))}')

    # Test 3: F3.2 — KaTeX output 'htmlAndMathml' for screen reader access
    index_html = (proj / 'index.html').read_text(encoding='utf-8')
    if 'renderMathInElement' in index_html:
        # Must contain output: 'htmlAndMathml' (or "htmlAndMathml")
        if 'htmlAndMathml' not in index_html:
            failures.append("index.html: KaTeX renderMathInElement missing output: 'htmlAndMathml' (F3.2 — screen reader gap)")

    if failures:
        for f in failures: print(f'FAIL: {f}')
        sys.exit(1)
    print('PASS: CSS rules consistent + KaTeX output: htmlAndMathml')
    sys.exit(0)

if __name__ == '__main__':
    sys.path.insert(0, str(__file__).rsplit('\\', 1)[0])
    main()
```

Chạy → RED.

### TDD Step 2 — GREEN: viết CSS

```css
/* assets/css/equations.css */
math,
.math-tex,
.math-tex-block,
.mathml-inline math,
.mathml-block math {
  font-family: "Latin Modern Math", "Cambria Math", "STIX Two Math",
               "KaTeX_Main", "Times New Roman", serif;
  font-feature-settings: "lnum", "tnum";
  font-size: 1em;
  line-height: 1.5;
  color: var(--text-color, #1a1a1a);
}

math[display="inline"],
.mathml-inline,
.math-tex {
  display: inline-block;
  vertical-align: middle;
}

math[display="block"],
.mathml-block,
.math-tex-block {
  display: block;
  text-align: center;
  margin: 0.7em 0;
}

/* F3.4: figure tag styling (Phase 05 đổi từ div.figure-container) */
figure {
  display: block;
  margin: 1em 0;
  text-align: center;
}
figure img {
  max-width: 100%;
  height: auto;
}
figure figcaption {
  font-style: italic;
  color: var(--caption-color, #555);
  font-size: 0.9em;
  margin-top: 0.3em;
}

/* Dark theme harmony */
[data-theme="dark"] math,
[data-theme="dark"] .math-tex,
[data-theme="dark"] figure figcaption {
  color: var(--text-color-dark, #f0f0f0);
}
```

Verify CSS load thứ tự (KaTeX trước, equations.css sau) trong `index.html`.

### TDD Step 3 — KaTeX htmlAndMathml output (F3.2)

Edit `index.html`, locate KaTeX `renderMathInElement` call, ensure config:
```javascript
renderMathInElement(document.body, {
  delimiters: [
    {left: '\\(', right: '\\)', display: false},
    {left: '\\[', right: '\\]', display: true},
  ],
  output: 'htmlAndMathml',  // F3.2: dual rendering for screen reader access
  trust: false,
  throwOnError: false,
});
```

### TDD Step 4 — Visual baseline (Playwright)

```javascript
// tests/visual/test_math_visual_baseline.spec.js
const { test, expect } = require('@playwright/test');
const TARGETS = [
  '/chapters/ch2/muc-I-1.html',
  '/chapters/ch2/muc-II-2.html',
  '/chapters/ch3/muc-VII-2.html',
];
for (const url of TARGETS) {
  test(`baseline math render ${url}`, async ({ page }) => {
    await page.goto(`http://localhost:8000${url}`);
    await page.waitForSelector('math, .math-tex');
    expect(await page.screenshot()).toMatchSnapshot();
  });
}
```

Chạy 1 lần để sinh baseline, 1 lần để verify diff = 0.

### TDD Step 5 — Run audit + bundle

```powershell
python tools/audit.py --strict-images
python tools/bundle_pages.py
python scripts/test-phase-04-render-font.py
npx playwright test tests/visual/test_math_visual_baseline.spec.js
```

### TDD Step 6 — Documentation

Viết `reports/visual-diff-baseline.md`:
- Screenshot trước/sau cho 3 file mixed
- Pixel diff (Playwright) report
- Decision đã chọn font fallback chain
- F3.2: KaTeX htmlAndMathml output verified

## Todo List

- [ ] Tạo `assets/css/equations.css`
- [ ] Add `<figure>/<figcaption>` styling rule (chuẩn bị cho Phase 05 — F3.4)
- [ ] Verify `index.html` load CSS đúng order
- [ ] **Verify/add** `output: 'htmlAndMathml'` trong KaTeX config (F3.2)
- [ ] Viết `scripts/test-phase-04-render-font.py` (RED, plain Python)
- [ ] Implement CSS (GREEN)
- [ ] Setup `playwright` snapshot dir
- [ ] Sinh baseline screenshot 3 file mixed
- [ ] Visual diff verify 0 unexpected change
- [ ] Bundle + audit PASS
- [ ] Browser smoke `file://` (verify screen reader sees MathML từ KaTeX)
- [ ] Viết `reports/visual-diff-baseline.md`

## Success Criteria

- [ ] `scripts/test-phase-04-render-font.py` PASS toàn bộ
- [ ] CSS rule có cả MathML và KaTeX với font-family chung
- [ ] CSS có rule cho `<figure>` và `<figcaption>` (Phase 05 deps)
- [ ] `index.html` KaTeX config có `output: 'htmlAndMathml'` (F3.2)
- [ ] Playwright snapshot test PASS (0 diff baseline)
- [ ] Trên dark theme và light theme, công thức không bị mất chữ
- [ ] CSS file < 80 dòng (KISS, dù thêm figure rule)
- [ ] Browser smoke `file://` PASS — verify screen reader có thể đọc KaTeX content qua MathML output

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| Font Latin Modern Math không có trên hệ điều hành user | Fallback chain có Cambria Math (Windows default) và KaTeX_Main (local) |
| `font-size: 1em` làm công thức bị nhỏ trên mobile | Dùng `clamp(0.95em, 1em, 1.1em)` nếu cần; verify visual |
| Dark theme `var(--text-color)` không tồn tại | Default fallback `#1a1a1a` đã có |
| Playwright snapshot quá nhạy | Tăng `maxDiffPixels: 200` nếu cần |
| CSS conflict với simulation labs | Test trên route simulation; CSS scope tới `.l3-content` nếu cần |
| KaTeX `output: 'htmlAndMathml'` tăng DOM size double | Chấp nhận trade-off; SR access > performance margin nhỏ |
| `<figure>` styling override chỉ áp dụng sau Phase 05 | CSS rule không hại nếu chưa có `<figure>` element; defensive |

## Security Considerations

Không có rủi ro security. Chỉ visual styling. KaTeX `trust: false` đã ngăn LaTeX commands nguy hiểm.
