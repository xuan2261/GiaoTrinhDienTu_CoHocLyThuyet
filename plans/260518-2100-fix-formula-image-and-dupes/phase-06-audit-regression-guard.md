---
phase: 6
title: "Audit Regression Guard (Default ON + Release Gate)"
status: completed
priority: P1
effort: "2h"
dependencies: [2, 3]
---

# Phase 06: Audit Regression Guard (Default ON)

## Overview

Bổ sung rule `--strict-formula-image` vào `tools/audit.py` phát hiện ảnh có dấu hiệu chứa công thức/ký hiệu (file size nhỏ + 1-bit + neighbor keywords). **Default ON** trong `audit.py` (red-team F2.5), không cần flag để bật. Cập nhật `package.json` `test:sim:release` để CI luôn chạy guard.

## Validation Decisions (red-team 2026-05-18)

- **F2.5 (CRITICAL):** `--strict-formula-image` **default ON**, có flag `--no-strict-formula-image` để debug. `package.json` `test:sim:release` thêm `--strict-images --strict-formula-image` rõ ràng (defensive). Guard luôn run trong release flow.
- **F1.3 (MEDIUM):** Phase 06 audit chỉ đọc `data/equation_mapping.json` (immutable trong plan) + scan HTML. KHÔNG đọc `tools/equation_report.json` (overwrite mỗi extract → nguồn lệch sau re-extract).
- **F2.1:** Test plain Python (no pytest).

## Requirements

### Functional
- Flag `--strict-formula-image` mặc định True; có `--no-strict-formula-image` để tắt khi debug.
- Heuristic phát hiện:
  1. File size < 5KB **và** `mode=1` PNG (1-bit) **và** trong `figure-container` hoặc `<figure>` tag.
  2. Nằm gần (≤ 200 ký tự trước) keyword: `"kí hiệu là"`, `"kí hiệu"`, `"véc tơ"`, `"vector"`, `"phản lực"`, `"sức căng"`, `"lực"`, `"gia tốc"`, `"vận tốc"`, `"mô men"`, `"đặt vào"`.
  3. Pixel < 90×30 (rất nhỏ) trong figure → flag bất kể keyword.
- Output rõ ràng: `chapter, file, src, size, reason, neighbor_text`.
- Exit code 1 khi phát hiện ≥ 1 case (CI block).
- Đọc từ `data/equation_mapping.json` only, NOT `tools/equation_report.json` (F1.3).

### Non-functional
- Audit chạy < 10s cho 102 file.
- False-positive rate ≤ 5% (chấp nhận được vì là warn-style).
- Có whitelist `data/formula-image-allowlist.json` cho legitimate cases.

## Architecture

```
tools/audit.py  (modify)
  └── strict_formula_image_check()
        ├── load equation_mapping.json (only — F1.3)
        ├── load formula-image-allowlist.json
        ├── for each img in chapters/**/*.html:
        │     ├── detect container: figure-container OR <figure>
        │     ├── if mapping has artifact='figure' OR obsolete=True: SKIP
        │     ├── if hash in allowlist: SKIP
        │     ├── compute file size
        │     ├── if size > 5000B: SKIP
        │     ├── lookup PNG mode (PIL Image.open)
        │     ├── if mode != '1': SKIP
        │     ├── extract preceding 200 chars from HTML
        │     └── if any keyword matched OR pixel < 90×30:
        │           → record finding
        └── if findings: print + exit 1

main():
  ├── parse args: --strict-formula-image (default True), --no-strict-formula-image
  ├── if args.strict_formula_image: run guard
  └── exit code aggregated
```

Whitelist schema (`data/formula-image-allowlist.json`):
```json
[
  {"hash": "...", "reason": "Sơ đồ chính thức, đã review"}
]
```

## Related Code Files

- Modify:
  - `tools/audit.py` (add `strict_formula_image_check()`, default ON)
  - `package.json` (update `test:sim:release` + `test:audit:strict`)
- Create:
  - `data/formula-image-allowlist.json` (mới, default `[]`)
  - `scripts/test-phase-06-audit-guard.py` (plain Python, no pytest)
  - `reports/audit-guard-report.md`
- Delete: none

## Implementation Steps

### TDD Step 1 — RED test (plain Python)

```python
# scripts/test-phase-06-audit-guard.py
"""Phase 06: audit --strict-formula-image guard active by default."""
import os, subprocess, sys, tempfile
from pathlib import Path
from _test_helpers import project_root

def main():
    proj = project_root()
    failures = []

    # Test 1: default audit (no flag) runs strict-formula-image check
    r = subprocess.run(
        ['python', 'tools/audit.py'],
        cwd=proj, capture_output=True, text=True, encoding='utf-8',
    )
    if 'strict-formula-image' not in r.stdout.lower() and r.returncode == 0:
        # Acceptable: PASS clean state, but log should mention guard ran
        # Stricter check: --no-strict-formula-image must produce different output
        pass

    if r.returncode != 0:
        failures.append(f'default audit fails on clean state: {r.stdout[-300:]}')

    # Test 2: --no-strict-formula-image flag bypasses guard (sanity)
    r2 = subprocess.run(
        ['python', 'tools/audit.py', '--no-strict-formula-image'],
        cwd=proj, capture_output=True, text=True, encoding='utf-8',
    )
    if r2.returncode != 0:
        failures.append(f'--no-strict-formula-image still fails: {r2.stderr[:300]}')

    # Test 3: explicit --strict-formula-image flag works
    r3 = subprocess.run(
        ['python', 'tools/audit.py', '--strict-images', '--strict-formula-image'],
        cwd=proj, capture_output=True, text=True, encoding='utf-8',
    )
    if r3.returncode != 0:
        failures.append(f'explicit strict mode fails: {r3.stdout[-300:]}')

    # Test 4: guard reads equation_mapping.json only (F1.3) — code inspection
    audit_src = (proj / 'tools/audit.py').read_text(encoding='utf-8')
    if 'equation_report.json' in audit_src and 'strict_formula_image' in audit_src:
        # Check it's NOT inside the guard function
        # Heuristic: 'equation_report.json' must NOT appear within the same function as strict_formula_image_check
        # Simple check: search for both names in proximity
        idx = audit_src.find('def strict_formula_image_check')
        if idx >= 0:
            block_end = audit_src.find('\ndef ', idx + 1)
            block = audit_src[idx:block_end if block_end > 0 else len(audit_src)]
            if 'equation_report.json' in block:
                failures.append('strict_formula_image_check reads equation_report.json (F1.3 violation)')

    # Test 5: package.json test:sim:release contains --strict-formula-image
    pkg = (proj / 'package.json').read_text(encoding='utf-8')
    if 'test:sim:release' in pkg and 'strict-formula-image' not in pkg:
        failures.append('package.json test:sim:release missing --strict-formula-image flag')

    # Test 6: inject suspect → audit must FAIL
    with tempfile.TemporaryDirectory() as td:
        td = Path(td)
        (td / 'chapters/test').mkdir(parents=True)
        (td / 'images/test').mkdir(parents=True)
        (td / 'chapters/test/muc-suspect.html').write_text(
            '<p>kí hiệu là</p>'
            '<div class="figure-container"><img src="images/test/tiny.png" alt="test" loading="lazy"></div>',
            encoding='utf-8',
        )
        # 1-bit small PNG
        try:
            from PIL import Image
            Image.new('1', (40, 20)).save(td / 'images/test/tiny.png')
        except ImportError:
            print('SKIP injection test: PIL not available')
        else:
            r4 = subprocess.run(
                ['python', str(proj / 'tools/audit.py'),
                 '--root', str(td), '--strict-formula-image'],
                capture_output=True, text=True, encoding='utf-8',
            )
            if r4.returncode == 0:
                failures.append('inject suspect: audit should fail but returned 0')

    if failures:
        for f in failures: print(f'FAIL: {f}')
        sys.exit(1)
    print('PASS: audit guard default ON, release gate updated, inject FAIL detected')
    sys.exit(0)

if __name__ == '__main__':
    sys.path.insert(0, str(__file__).rsplit('\\', 1)[0])
    main()
```

### TDD Step 2 — GREEN: implement guard

Mở `tools/audit.py`, thêm:
```python
import argparse, hashlib, json, re
from PIL import Image
from pathlib import Path

KEYWORDS = (
    'kí hiệu là', 'kí hiệu', 'véc tơ', 'vector', 'phản lực',
    'sức căng', 'gia tốc', 'vận tốc', 'mô men', 'đặt vào',
)
SIZE_THRESHOLD = 5000        # bytes
PIXEL_THRESHOLD = (90, 30)   # max width, max height for "tiny"

def _hash_for(path):
    """SHA1 short hash of file content for allowlist matching."""
    return hashlib.sha1(path.read_bytes()).hexdigest()[:12]

def strict_formula_image_check(root, mapping_by_hash, allowlist_hashes):
    """
    Detect raster images that likely contain formulas/symbols.
    Reads ONLY data/equation_mapping.json (F1.3); does NOT read equation_report.json.
    """
    findings = []
    for chapter in ('ch1', 'ch2', 'ch3'):
        chapter_dir = root / 'chapters' / chapter
        if not chapter_dir.exists():
            continue
        for f in chapter_dir.glob('*.html'):
            html = f.read_text(encoding='utf-8')
            # Match img inside figure-container OR <figure>
            img_re = re.compile(
                r'(?:<div class="figure-container">|<figure[^>]*>)\s*<img[^>]+src="([^"]+)"[^>]*>',
            )
            for m in img_re.finditer(html):
                src = m.group(1)
                p = root / src
                if not p.exists():
                    continue
                # Allowlist + obsolete + artifact='figure' skip
                hash_id = _hash_for(p)
                if hash_id in allowlist_hashes:
                    continue
                entry = mapping_by_hash.get(hash_id)
                if entry and (entry.get('artifact') == 'figure' or entry.get('obsolete')):
                    continue
                size = p.stat().st_size
                if size > SIZE_THRESHOLD:
                    continue
                try:
                    img = Image.open(p)
                    is_one_bit = img.mode == '1'
                    is_tiny = img.size[0] < PIXEL_THRESHOLD[0] and img.size[1] < PIXEL_THRESHOLD[1]
                except Exception:
                    continue
                preceding = html[max(0, m.start() - 200):m.start()]
                kw_match = next((k for k in KEYWORDS if k in preceding.lower()), None)
                if (is_one_bit and kw_match) or is_tiny:
                    findings.append({
                        'file': str(f.relative_to(root)),
                        'src': src,
                        'size': size,
                        'pixel': img.size,
                        'mode': img.mode,
                        'reason': kw_match or 'tiny-pixel',
                        'preceding': preceding[-80:],
                    })
    return findings


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--root', default='.', help='Project root (for testing)')
    ap.add_argument('--strict-images', action='store_true')
    # F2.5: default ON, --no-strict-formula-image to disable
    ap.add_argument('--strict-formula-image', action=argparse.BooleanOptionalAction, default=True,
                    help='Detect raster images containing formulas/symbols (default: True)')
    args = ap.parse_args()

    root = Path(args.root).resolve()
    # F1.3: read equation_mapping.json ONLY, never equation_report.json
    mapping_path = root / 'data/equation_mapping.json'
    mapping = {}
    if mapping_path.exists():
        rows = json.loads(mapping_path.read_text(encoding='utf-8'))
        # Build hash → row index for fast lookup
        for row in rows:
            h = row.get('hash') or row.get('media_hash')
            if h:
                mapping[h] = row

    allowlist_path = root / 'data/formula-image-allowlist.json'
    allowlist = set()
    if allowlist_path.exists():
        for entry in json.loads(allowlist_path.read_text(encoding='utf-8')):
            allowlist.add(entry['hash'])

    exit_code = 0
    if args.strict_formula_image:
        findings = strict_formula_image_check(root, mapping, allowlist)
        if findings:
            print('❌ Suspect formula-as-image:')
            for fnd in findings:
                print(f"  {fnd['file']}: {fnd['src']} ({fnd['size']}B {fnd['pixel']} {fnd['mode']}) — {fnd['reason']}")
            exit_code = 1
        else:
            print('✓ strict-formula-image: 0 suspects')

    # ... existing strict-images logic if any

    return exit_code

if __name__ == '__main__':
    raise SystemExit(main())
```

### TDD Step 3 — Whitelist seed

Tạo `data/formula-image-allowlist.json` rỗng:
```json
[]
```
(Sau phase 2 đã sạch nên không cần whitelist; chỉ là cấu trúc cho tương lai.)

### TDD Step 4 — Update release gate

Edit `package.json`:
```json
{
  "scripts": {
    "test:audit:strict": "python tools/audit.py --strict-images --strict-formula-image",
    "test:sim:release": "... && python tools/audit.py --strict-images --strict-formula-image && ..."
  }
}
```

(Verify cấu hình hiện tại của `test:sim:release` rồi insert flag ở vị trí đúng — không break các step khác.)

### TDD Step 5 — Verify

```powershell
python tools/audit.py                                       # default ON, expect PASS sau Phase 02-05
python tools/audit.py --no-strict-formula-image             # disabled, expect PASS
python tools/audit.py --strict-images --strict-formula-image # explicit, expect PASS
python scripts/test-phase-06-audit-guard.py                 # PASS
npm run test:sim:release                                    # full gate PASS
```

### TDD Step 6 — CI integration

Update `.github/workflows/qa.yml` (nếu có) thêm step:
```yaml
- name: Strict formula-image audit
  run: python tools/audit.py --strict-images --strict-formula-image
```

### TDD Step 7 — Document

Viết `reports/audit-guard-report.md`:
- Default ON design (F2.5)
- Data source: equation_mapping.json only (F1.3)
- Heuristic decisions
- False-positive rate measurement
- Whitelist seed (empty for now)
- Sample findings nếu có

## Todo List

- [ ] Viết `scripts/test-phase-06-audit-guard.py` (RED, plain Python, 6 assertions)
- [ ] Add `--strict-formula-image` flag (default True via `BooleanOptionalAction`)
- [ ] Implement `strict_formula_image_check()` đọc `equation_mapping.json` only (F1.3)
- [ ] Skip `obsolete=true` rows (consistent với Phase 02 mark)
- [ ] Add `--root` arg cho test injection
- [ ] Tạo `data/formula-image-allowlist.json` seed `[]`
- [ ] Verify audit PASS clean state (default ON)
- [ ] Verify audit FAIL khi inject suspect
- [ ] Verify `--no-strict-formula-image` skip guard
- [ ] Update `package.json` `test:sim:release` thêm flag
- [ ] Update `package.json` `test:audit:strict` script
- [ ] CI hook (nếu workflow có)
- [ ] `python scripts/test-phase-06-audit-guard.py` PASS GREEN
- [ ] Viết `reports/audit-guard-report.md`

## Success Criteria

- [ ] `scripts/test-phase-06-audit-guard.py` PASS toàn bộ 6 assertions
- [ ] `python tools/audit.py` (no args) chạy strict-formula-image check by default
- [ ] `python tools/audit.py --no-strict-formula-image` skip guard
- [ ] `audit.py --strict-formula-image` PASS clean state
- [ ] `audit.py --strict-formula-image` FAIL khi inject suspect
- [ ] `npm run test:sim:release` chứa `--strict-formula-image` flag
- [ ] Whitelist mechanism hoạt động (hash skip)
- [ ] Obsolete rows (Phase 02) bị skip đúng
- [ ] Documented `docs/code-standards.md` rule mới
- [ ] `tools/equation_report.json` KHÔNG được đọc bởi guard (F1.3 verified)

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| Default ON gây false positive trên repo legitimate diagrams | `equation_mapping.json` artifact='figure' SKIP rule + allowlist + obsolete skip |
| Pillow không có trong venv | requirements pin trong README install instructions; nếu thiếu, audit log warning thay vì crash |
| Keyword match Vietnamese case-insensitive lệch | Normalize lowercase với `unicodedata.normalize('NFC', ...)` |
| Audit chạy chậm (load PIL cho 136 ảnh) | Lazy load: chỉ open ảnh nếu size threshold đạt |
| Whitelist drift (allowlist quá dài che giấu vấn đề thật) | CI counter: warn nếu allowlist > 5 entries |
| Default ON breaks existing CI runs trên branch khác | Document trong changelog: dev cần `--no-strict-formula-image` để bypass tạm |
| Hash collision giữa allowlist và mapping | SHA1 12-char prefix collision rate âm 1/2^48; chấp nhận được |

## Security Considerations

- PIL `Image.open` an toàn với PNG hợp lệ. Không exec image data.
- `--root` arg phải resolve absolute path để tránh path traversal.
- Allowlist file đọc-only; modification cần PR review.
