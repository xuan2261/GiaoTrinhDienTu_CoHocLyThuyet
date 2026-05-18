---
phase: 5
title: "Alt Text + Figcaption Overhaul (Figure Tag Migration)"
status: completed
priority: P2
effort: "4-5h"
dependencies: [1, 2, 4]
---

# Phase 05: Alt Text + Figcaption Overhaul (Figure Tag Migration)

## Overview

Phase này thực hiện 2 việc song song trên 134 ảnh:
1. **Alt text:** thay 134 alt generic "Hình minh hoạ chương X" bằng alt mô tả thực.
2. **Figcaption (red-team F3.4):** add `<figcaption>` từ caption DOCX, đổi `<div class="figure-container">` → `<figure>...</figure>` cho accessibility chuẩn HTML5.

Cả 2 dùng caption parser DOCX (đã đo coverage trong Phase 01 — F3.1) + override file. Direct HTML patch để release ngay; pipeline modification để future-proof.

## Validation Decisions (red-team 2026-05-18)

- **F3.4 (MEDIUM):** Mở rộng scope từ "alt only" → "alt + figcaption + figure tag". HTML chuẩn `<figure><img alt><figcaption></figure>` thay vì `<div class="figure-container"><img alt></div>`.
- **F3.1 (HIGH):** Phase 01 đã đo coverage với regex variants. Phase 05 dùng cùng regex. Nếu coverage < 70% sau Phase 01, mở rộng regex variants TRƯỚC khi commit Phase 05.
- **F2.1:** Test plain Python (no pytest).

## Requirements

### Functional
- 0/136 ảnh có alt = "Hình minh hoạ chương 1/2/3" sau phase.
- ≥ 90% ảnh có alt từ caption DOCX (auto, dựa trên Phase 01 coverage measurement).
- ≤ 10% ảnh fallback keyword hoặc manual override.
- 100% ảnh có `<figcaption>` (từ caption DOCX hoặc manual override).
- 100% ảnh dùng `<figure>` thay vì `<div class="figure-container">`.
- File `data/image_alt_overrides.json` (JSON array) hoạt động như single source of truth.
- `tools/extract_docx.py` đọc override + caption khi sinh HTML.

### Non-functional
- Alt ≤ 120 ký tự, không HTML, không markdown.
- Figcaption ≤ 200 ký tự (cho phép dài hơn alt vì chấp nhận formula reference like "Hình 1.12 — Liên kết dây mềm").
- Hỗ trợ tiếng Việt có dấu (UTF-8).
- Không break lại pipeline DOCX hiện tại.
- Migration `<div class="figure-container">` → `<figure>` áp dụng cho TOÀN BỘ 136 figure (không chỉ 134 missing alt).

## Architecture

```
DOCX paragraph
  ├── chứa <w:drawing>image
  ├── lookup paragraph kế tiếp (offset 1, 2)
  │     ├── match regex variants:
  │     │     - r'^Hình\s+(\d+)\.(\d+)\s*[\-:.]?\s*(.+?)$'
  │     │     - r'^Hinh\s+(\d+)\.(\d+)\s*[\-:.]?\s*(.+?)$'
  │     │     - r'^Figure\s+(\d+)\.(\d+)\s*[\-:.]?\s*(.+?)$'
  │     │       → caption = "Hình 1.12 — Liên kết dây mềm"
  │     │       → alt     = "Liên kết dây mềm" (caption[3] only, ≤ 120)
  │     └── fallback: paragraph có "Sơ đồ", "Hệ", "Liên kết" first ~80 chars
  ├── nếu vẫn không match: alt = generic "Hình minh hoạ chương X", figcaption = "" (warn)
  └── override final: data/image_alt_overrides.json[media_hash]
        → both alt và figcaption có thể override
```

Schema `image_alt_overrides.json`:
```json
[
  {"hash": "be6d94fd8dc7", "alt": "Vector phản lực dây mềm tại điểm buộc", "figcaption": "Hình 1.12 — Liên kết dây mềm"},
  {"hash": "3b96b1a040b2", "alt": "Vector vận tốc của vật rắn chuyển động tịnh tiến", "figcaption": "Hình 1.13 — Vận tốc tịnh tiến"}
]
```

HTML target structure:
```html
<figure>
  <img src="images/ch1/hinh-012.png" alt="Liên kết dây mềm" loading="lazy">
  <figcaption>Hình 1.12 — Liên kết dây mềm</figcaption>
</figure>
```

## Related Code Files

- Modify:
  - `tools/extract_docx.py` (function `render_image_segment` — output `<figure><figcaption>`, lookup caption + override)
  - `chapters/**/*.html` (qua direct HTML patch script)
  - `assets/css/equations.css` (Phase 04 đã có `<figure>/<figcaption>` styling)
- Create:
  - `data/image_alt_overrides.json` (mới, schema chuẩn)
  - `scripts/parse-docx-figure-captions.py` (one-off để generate suggested alt + caption → user review)
  - `scripts/apply-alt-and-figcaption.py` (apply override + caption to existing HTML, idempotent với `--idempotent` cho auto-fix post-processor)
  - `scripts/test-phase-05-alt-text.py` (plain Python, no pytest)
  - `reports/alt-text-coverage.md`
- Delete: none

## Implementation Steps

### TDD Step 1 — RED test (plain Python)

```python
# scripts/test-phase-05-alt-text.py
"""Phase 05: alt text + figcaption + figure tag migration."""
import json, re, sys
from _test_helpers import project_root, chapter_files, iter_imgs

GENERIC = re.compile(r'^Hình minh họa chương [123]$')

def main():
    proj = project_root()
    failures = []

    # Test 1: no generic alt remaining
    offenders = []
    for f in chapter_files():
        html = f.read_text(encoding='utf-8')
        for img in iter_imgs(html):
            if GENERIC.match((img.alt or '').strip()):
                offenders.append((str(f.relative_to(proj)), img.src))
    if offenders:
        failures.append(f'{len(offenders)} generic alts: first 5 = {offenders[:5]}')

    # Test 2: alt under 120 chars
    long_alts = []
    for f in chapter_files():
        for img in iter_imgs(f.read_text(encoding='utf-8')):
            if img.alt and len(img.alt) > 120:
                long_alts.append((str(f), img.src, len(img.alt)))
    if long_alts:
        failures.append(f'{len(long_alts)} alts > 120 chars')

    # Test 3: 100% figures use <figure> tag (not <div class="figure-container">)
    div_containers = 0
    for f in chapter_files():
        html = f.read_text(encoding='utf-8')
        div_containers += html.count('<div class="figure-container">')
    if div_containers > 0:
        failures.append(f'{div_containers} <div class="figure-container"> still present (must be <figure>)')

    # Test 4: 100% <figure> have <figcaption>
    figures_without_caption = 0
    for f in chapter_files():
        html = f.read_text(encoding='utf-8')
        # naive: count <figure>...<figcaption> match
        figures = re.findall(r'<figure[^>]*>.*?</figure>', html, re.DOTALL)
        for fig in figures:
            if '<figcaption' not in fig:
                figures_without_caption += 1
    if figures_without_caption > 0:
        failures.append(f'{figures_without_caption} <figure> tags missing <figcaption>')

    # Test 5: image_alt_overrides.json schema valid
    overrides_path = proj / 'data/image_alt_overrides.json'
    if overrides_path.exists():
        data = json.loads(overrides_path.read_text(encoding='utf-8'))
        if not isinstance(data, list):
            failures.append('image_alt_overrides.json must be array')
        for row in data:
            if 'hash' not in row or 'alt' not in row:
                failures.append(f'override row missing required keys: {row}')
            if len(row.get('alt', '')) > 120:
                failures.append(f'override alt > 120: {row.get("hash")}')

    # Test 6: figcaption ≤ 200 chars
    long_captions = 0
    for f in chapter_files():
        html = f.read_text(encoding='utf-8')
        for cap in re.findall(r'<figcaption[^>]*>(.+?)</figcaption>', html, re.DOTALL):
            text = re.sub(r'<[^>]+>', '', cap).strip()
            if len(text) > 200:
                long_captions += 1
    if long_captions:
        failures.append(f'{long_captions} figcaptions > 200 chars')

    if failures:
        for f in failures: print(f'FAIL: {f}')
        sys.exit(1)
    print('PASS: 0 generic alts, 100% <figure>+<figcaption>, schema valid')
    sys.exit(0)

if __name__ == '__main__':
    sys.path.insert(0, str(__file__).rsplit('\\', 1)[0])
    main()
```

Chạy → RED (test 1 fail vì 134 ảnh, test 3 fail vì 136 div, test 4 fail vì 0 figcaption).

### TDD Step 2 — Caption parser

Tạo `scripts/parse-docx-figure-captions.py`:
```python
"""Extract 'Hình X.Y — caption' near each image; emit suggested alt + figcaption overrides."""
# Walks word/document.xml, for each w:drawing finds following paragraph
# Outputs CSV: media_hash, suggested_alt, suggested_figcaption, ctx, regex_variant_matched
import csv, hashlib, re, sys, zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
DOCX = ROOT / 'CoHocLyThuyet_Full_New.docx'
OUT_CSV = ROOT / 'plans/260518-2100-fix-formula-image-and-dupes/reports/alt-text-suggested.csv'
NS = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}

CAPTION_VARIANTS = [
    ('hinh',   re.compile(r'^Hình\s+(\d+)\.(\d+)\s*[\-:.]?\s*(.+?)$', re.IGNORECASE)),
    ('hinh_no_dau', re.compile(r'^Hinh\s+(\d+)\.(\d+)\s*[\-:.]?\s*(.+?)$', re.IGNORECASE)),
    ('figure', re.compile(r'^Figure\s+(\d+)\.(\d+)\s*[\-:.]?\s*(.+?)$', re.IGNORECASE)),
]

def main():
    with zipfile.ZipFile(DOCX) as z:
        xml_bytes = z.read('word/document.xml')
        # Extract media hashes too for cross-reference
        media_files = [n for n in z.namelist() if n.startswith('word/media/')]
        media_hashes = {}
        for m in media_files:
            h = hashlib.sha1(z.read(m)).hexdigest()[:12]
            media_hashes[m.split('/')[-1]] = h

    doc = ET.fromstring(xml_bytes)
    paragraphs = []
    for p in doc.iter(f'{{{NS["w"]}}}p'):
        runs = p.iter(f'{{{NS["w"]}}}t')
        text = ''.join(r.text or '' for r in runs).strip()
        # Extract drawing/blip rels for image identification
        blips = p.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}blip')
        rids = [b.get('{http://schemas.openxmlformats.org/officeDocument/2006/relationships}embed') for b in blips]
        paragraphs.append({'text': text, 'rids': rids})

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with OUT_CSV.open('w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f)
        w.writerow(['paragraph_idx', 'rid', 'suggested_alt', 'suggested_figcaption', 'variant', 'next_para_text'])
        for i, p in enumerate(paragraphs):
            if not p['rids']:
                continue
            for rid in p['rids']:
                # Look at next 1-2 paragraphs for caption
                matched = None
                for off in (1, 2):
                    if i + off < len(paragraphs):
                        nt = paragraphs[i + off]['text']
                        for variant, pat in CAPTION_VARIANTS:
                            m = pat.match(nt)
                            if m:
                                figcaption = nt
                                alt = m.group(3).strip()[:120]
                                matched = (variant, alt, figcaption, nt)
                                break
                        if matched:
                            break
                if matched:
                    variant, alt, figcaption, next_text = matched
                    w.writerow([i, rid, alt, figcaption, variant, next_text])
                else:
                    w.writerow([i, rid, '', '', 'NO_MATCH', paragraphs[i+1]['text'] if i+1 < len(paragraphs) else ''])

    print(f'Wrote {OUT_CSV}')
    print('Review CSV, then transform → data/image_alt_overrides.json')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
```

Chạy 1 lần để sinh `reports/alt-text-suggested.csv`. User review, transform thành `data/image_alt_overrides.json`.

### TDD Step 3 — Apply script (direct HTML patch)

`scripts/apply-alt-and-figcaption.py`:
```python
"""Apply alt + figcaption from overrides to existing HTML; migrate <div class="figure-container"> → <figure>."""
import argparse, datetime, hashlib, json, re, shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OVERRIDES = ROOT / 'data/image_alt_overrides.json'

# Pattern: capture <div class="figure-container"><img ...></div>
DIV_FIGURE_RE = re.compile(
    r'<div class="figure-container">\s*<img\s+([^>]+?)\s*/?>\s*</div>',
)

def parse_attrs(attr_str):
    return dict(re.findall(r'(\w+)="([^"]*)"', attr_str))

def main():
    p = argparse.ArgumentParser()
    p.add_argument('--check', action='store_true')
    p.add_argument('--apply', action='store_true')
    p.add_argument('--backup', action='store_true')
    p.add_argument('--idempotent', action='store_true')
    args = p.parse_args()
    if not (args.check or args.apply):
        args.check = True

    overrides = {}
    if OVERRIDES.exists():
        for row in json.loads(OVERRIDES.read_text(encoding='utf-8')):
            overrides[row['hash']] = row

    ts = datetime.datetime.now().strftime('%Y%m%d%H%M%S')
    files_changed = 0
    for html_path in (ROOT / 'chapters').rglob('*.html'):
        original = html_path.read_text(encoding='utf-8')
        new = original
        for m in DIV_FIGURE_RE.finditer(original):
            attrs = parse_attrs(m.group(1))
            src = attrs.get('src', '')
            img_path = ROOT / src
            if not img_path.exists():
                continue
            h = hashlib.sha1(img_path.read_bytes()).hexdigest()[:12]
            override = overrides.get(h, {})
            alt = override.get('alt', attrs.get('alt', ''))
            figcaption = override.get('figcaption', '')

            new_attrs = ' '.join(f'{k}="{v}"' for k, v in {**attrs, 'alt': alt}.items())
            replacement = f'<figure>\n  <img {new_attrs} loading="lazy">\n'
            if figcaption:
                replacement += f'  <figcaption>{figcaption}</figcaption>\n'
            replacement += '</figure>'
            new = new.replace(m.group(0), replacement, 1)

        if new != original:
            files_changed += 1
            if args.apply:
                if args.backup:
                    shutil.copy2(html_path, f'{html_path}.bak.{ts}')
                html_path.write_text(new, encoding='utf-8')
                print(f'WRITE {html_path.relative_to(ROOT)}')
            else:
                print(f'WOULD CHANGE {html_path.relative_to(ROOT)}')

    if args.idempotent and files_changed == 0:
        print('IDEMPOTENT: no changes needed (already migrated)')
        return 0
    print(f'\n{"Changed" if args.apply else "Would change"} {files_changed} files')
    return 0

if __name__ == '__main__':
    raise SystemExit(main())
```

### TDD Step 4 — Manual review batch

Mở `reports/alt-text-suggested.csv`, fill missing/poor alts. Update `data/image_alt_overrides.json` (≥ 90% ảnh).

### TDD Step 5 — Apply

```powershell
python scripts/apply-alt-and-figcaption.py --check
python scripts/apply-alt-and-figcaption.py --apply --backup
python tools/bundle_pages.py
python tools/audit.py --strict-images
python scripts/test-phase-05-alt-text.py
```

### TDD Step 6 — Pipeline future-proof (optional, integrate auto-fix)

Modify `tools/extract_docx.py:render_image_segment` để future re-extract dùng override + caption parser:
```python
override = self.alt_overrides.get(media_hash, {})
caption = self.caption_lookup.get(media_name, '')
alt_text = override.get('alt') or caption.split('—')[-1].strip()[:120] or f"Hình minh họa chương {chapter}"
figcaption_text = override.get('figcaption') or caption
alt = html.escape(alt_text)
figcap_html = f'<figcaption>{html.escape(figcaption_text)}</figcaption>' if figcaption_text else ''
return {"kind": "block", "html": f'<figure><img src="{rel}" alt="{alt}" loading="lazy">{figcap_html}</figure>'}
```

Initialize `self.alt_overrides` từ `data/image_alt_overrides.json` + `self.caption_lookup` từ caption parser trong `__init__`.

Auto-fix post-processor (Phase 02 F1.1) sẽ tự gọi `apply-alt-and-figcaption.py --apply --idempotent` nếu Phase 05 chưa được integrate vào pipeline trực tiếp.

### TDD Step 7 — Document

Viết `reports/alt-text-coverage.md`:
- Số ảnh có alt từ caption: X/134
- Số ảnh override manual: Y
- Số ảnh fallback: Z (must = 0)
- Số ảnh có figcaption: 136/136
- Sample 10 ảnh trước/sau (HTML diff: `<div class="figure-container">` → `<figure>+<figcaption>`)

## Todo List

- [ ] Confirm Phase 01 caption coverage measurement ≥ 70% (F3.1)
- [ ] Viết `scripts/test-phase-05-alt-text.py` (RED, plain Python, 6 test groups)
- [ ] Viết `scripts/parse-docx-figure-captions.py`
- [ ] Chạy parser, review CSV output trong `reports/alt-text-suggested.csv`
- [ ] Tạo `data/image_alt_overrides.json` ban đầu (≥ 90% ảnh có alt + figcaption)
- [ ] Viết `scripts/apply-alt-and-figcaption.py`
- [ ] Chạy `--check` mode trên toàn bộ HTML
- [ ] Chạy `--apply --backup`
- [ ] Verify: 0 div.figure-container, 136/136 figure có figcaption
- [ ] Bundle + audit PASS
- [ ] `python scripts/test-phase-05-alt-text.py` PASS GREEN
- [ ] Manual fill các trường hợp còn thiếu (override append)
- [ ] Re-apply nếu cần
- [ ] (Optional) Modify `tools/extract_docx.py` để pipeline future-proof
- [ ] Browser screen reader smoke (NVDA hoặc Narrator) — verify đọc đúng tiếng Việt
- [ ] Cleanup `*.bak.*` files
- [ ] Viết `reports/alt-text-coverage.md`

## Success Criteria

- [ ] `scripts/test-phase-05-alt-text.py` PASS toàn bộ 6 assertion groups
- [ ] 0 ảnh dùng alt "Hình minh hoạ chương 1/2/3"
- [ ] 100% ảnh có alt mô tả thực
- [ ] Alt ≤ 120 ký tự
- [ ] 0 `<div class="figure-container">` remaining
- [ ] 136/136 `<figure>` có `<figcaption>`
- [ ] Figcaption ≤ 200 ký tự
- [ ] `image_alt_overrides.json` schema hợp lệ
- [ ] Re-extract pipeline (nếu integrate) không break
- [ ] Browser screen reader đọc đúng tiếng Việt + có MathML output (Phase 04 F3.2)

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| Phase 01 coverage < 70% | Đã actionable, expand regex variants TRƯỚC khi viết override file |
| Caption regex bỏ sót case Word | 3 variants đã enumerate (Hình/Hinh/Figure); fallback paragraph keyword |
| `<figure>` rule CSS chưa exist khi Phase 05 chạy | Phase 04 đã add CSS song song; nếu chạy parallel, verify dependency 4 → 5 |
| `<div class="figure-container">` migration làm vỡ existing CSS rule khác | Grep CSS for `.figure-container`; nếu có rule cụ thể, migrate sang `figure` class |
| Tiếng Việt encode lệch | Force UTF-8 BOM-less, `chcp 65001` PowerShell, test với chữ có dấu |
| Override JSON viết sai schema | Test validate schema (test 5) |
| Re-extract overwrite ảnh đã ổn | Backup `chapters/` trước, diff `git status` sau; auto-fix post-processor xử lý |

## Security Considerations

Alt text + figcaption từ user input (override) phải `html.escape()` để tránh XSS injection. Áp dụng cả trong `apply-alt-and-figcaption.py` và pipeline `extract_docx.py`.
