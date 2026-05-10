# Runtime QA Report

## Executive Summary
- **Issue:** Phase 8 browser QA còn thiếu; rerun phát hiện KaTeX font 404.
- **Impact:** Công thức LaTeX vẫn render, nhưng browser console có lỗi asset, chưa đạt gate "no console errors".
- **Root cause:** `lib/katex/katex.min.css` dùng `url(lib/katex/fonts/...)`; khi CSS nằm trong `lib/katex/`, browser resolve thành `lib/katex/lib/katex/fonts/...`.
- **Fix:** Đổi font URL sang `url(fonts/...)`; thêm favicon data URL để tránh `favicon.ico` 404.
- **Status:** Runtime QA pass sau fix; Phase 10 release package vẫn chưa thực hiện.

## Evidence

### Automated Gates

Commands pass ngày 2026-05-06:

```powershell
python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict --katex
python -m compileall -q tools
node --check js\app.js
node --check js\loader.js
node --check js\pages.js
node --check js\quiz.js
node --check js\progress.js
node --check js\glossary.js
node --check js\notes.js
node --check js\simulations.js
python tools\audit.py
python tools\audit.py --strict-equations
```

Key output:

```text
Rows: 702
Unique hashes: 702
Reviewed: 702
KaTeX checked: 53
OK

STRICT EQUATION PUBLISH
No equation image fallbacks and mapping is fully reviewed
```

### Browser QA

Method:
- Local server: `python -m http.server 8765 --bind 127.0.0.1`
- Browser: Puppeteer via `ck:chrome-devtools`
- Modes: `http://127.0.0.1:8765/index.html#<route>` and direct `file://.../index.html#<route>`
- Viewports: desktop `1366x900`, mobile `390x844`

Routes checked:
- `ch1-1-4`
- `ch1-5-3`
- `ch2-2-2`
- `ch2-7-1`
- `ch3-5-2`
- `ch3-6-3`

Result after fix:

| Mode / viewport | Checked | OK | math-tex | KaTeX render | MathML | fallback | severe overflow |
|---|---:|---:|---:|---:|---:|---:|---:|
| http / desktop | 6 | 6 | 18 | 18 | 240 | 0 | 0 |
| http / mobile | 6 | 6 | 18 | 18 | 240 | 0 | 0 |
| file / desktop | 6 | 6 | 18 | 18 | 240 | 0 | 0 |
| file / mobile | 6 | 6 | 18 | 18 | 240 | 0 | 0 |

Console/page/network errors after fix: `0`.

## Findings

1. Semantic equation publish meets strict criteria: `702/702` unique rows reviewed; no `math-img-inline` or `math-img-block` remains in `chapters/` or `js/pages.js`.
2. Browser runtime initially failed because local KaTeX CSS font path was wrong. Fixed in `lib/katex/katex.min.css`.
3. `index.html` had no favicon declaration, causing browser default `favicon.ico` 404 during QA. Fixed with an empty data favicon.
4. Normal `<img>` warnings in `audit.py` are figure images, not equation fallbacks.

## Remaining

- Phase 10 release package and rollback checklist still pending.
