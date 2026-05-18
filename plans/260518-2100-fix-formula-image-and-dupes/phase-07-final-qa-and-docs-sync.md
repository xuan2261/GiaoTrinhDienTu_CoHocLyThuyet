---
phase: 7
title: "Final QA + Docs Sync (Playwright Smoke + Tag Retry)"
status: completed
priority: P1
effort: "2-3h"
dependencies: [2, 3, 4, 5, 6]
---

# Phase 07: Final QA + Docs Sync

## Overview

Phase chốt: chạy full release gate (browser + visual + disposal + audit), bundle lần cuối, sync docs (`project-changelog`, `code-standards`, `roadmap`), tag release. Manual browser smoke 9×3 đã được **convert sang Playwright spec** (red-team F2.2). Tag git có **collision check + suffix retry** (red-team F2.3). Đây là gate CUỐI — fail tại đây nghĩa là phase trước có vấn đề và phải re-loop.

## Validation Decisions (red-team 2026-05-18)

- **F2.2 (HIGH):** Manual browser smoke 9 file × 3 browsers = 27 interactions không scalable → convert thành Playwright spec `tests/visual/test_phase_07_smoke.spec.js`. Auto-run trong CI/local.
- **F2.3 (LOW):** Tag git có check collision (`git tag -l v-2026-05-18-formula-fix`); nếu tồn tại, suffix `-r{HHMMSS}` để tránh collision khi retry.
- **F2.5 (CRITICAL):** Release gate `npm run test:sim:release` đã chứa `--strict-formula-image` (Phase 06 update).
- **F2.1:** Test plain Python (no pytest).

## Requirements

### Functional
- `npm run test:sim:release` PASS toàn bộ (đã chứa `--strict-formula-image` flag).
- 7 plain Python phase test scripts (`scripts/test-phase-XX-*.py`) PASS.
- `npx playwright test tests/visual/test_phase_07_smoke.spec.js` PASS (9 targets × 3 browsers = 27 tests).
- `python tools/audit.py --strict-images --strict-formula-image` PASS.
- `python tools/bundle_pages.py` không lỗi.
- `docs/project-changelog.md` thêm entry 2026-05-18 mô tả từng phase.
- `docs/code-standards.md` thêm rule:
  - Không chèn raster image cho công thức trong DOCX (phải dùng MathType OLE).
  - Audit guard `--strict-formula-image` mặc định ON.
  - Alt text policy: không dùng generic "Hình minh hoạ chương X".
  - Figure HTML: `<figure><img alt><figcaption></figure>` (không dùng `<div class="figure-container">`).
- `docs/development-roadmap.md` chuyển trạng thái phase tương ứng.

### Non-functional
- Toàn bộ release gate < 15 phút.
- Tag git: `v-2026-05-18-formula-fix` (annotated, có retry suffix nếu collision — F2.3).
- PR (nếu workflow GitHub) có description đầy đủ.

## Architecture

```
Phase 07 Pipeline
  ├── Pre-flight: git status clean (verify no uncommitted)
  ├── Bundle:    python tools/bundle_pages.py
  ├── Audit:     python tools/audit.py --strict-images --strict-formula-image (default ON)
  ├── Phase tests: 7 × python scripts/test-phase-XX-*.py
  ├── Smoke browser:
  │     ├── npm run test:sim:browser
  │     └── npx playwright test tests/visual/test_phase_07_smoke.spec.js  (9 × 3 = 27 tests)
  ├── Release gate: npm run test:sim:release
  ├── Docs sync:
  │     ├── docs/project-changelog.md (append entry)
  │     ├── docs/code-standards.md (append rules)
  │     └── docs/development-roadmap.md (status update)
  ├── Final summary in reports/release-gate-2026-05-18.md
  └── Tag: scripts/git-tag-with-retry.ps1 v-2026-05-18-formula-fix (collision retry F2.3)
```

## Related Code Files

- Modify:
  - `docs/project-changelog.md`
  - `docs/code-standards.md`
  - `docs/development-roadmap.md`
- Create:
  - `scripts/test-phase-07-release.py` (plain Python, no pytest)
  - `tests/visual/test_phase_07_smoke.spec.js` (Playwright — converts manual browser smoke F2.2)
  - `scripts/git-tag-with-retry.ps1` (collision check + suffix — F2.3)
  - `reports/release-gate-2026-05-18.md`
- Delete: none

## Implementation Steps

### TDD Step 1 — Pre-flight check

```powershell
git status                                # phải clean (ngoại trừ docs sẽ update)
git fetch && git pull --ff-only
```

### TDD Step 2 — RED test plain Python (must already be GREEN by now)

```python
# scripts/test-phase-07-release.py
"""Phase 07: full release gate verification."""
import subprocess, sys
from _test_helpers import project_root

def main():
    proj = project_root()
    failures = []

    # Test 1: audit full strict (default ON via Phase 06)
    r = subprocess.run(
        ['python', 'tools/audit.py', '--strict-images', '--strict-formula-image'],
        cwd=proj, capture_output=True, text=True, encoding='utf-8',
    )
    if r.returncode != 0:
        failures.append(f'audit strict FAIL: {r.stdout[-300:]}')

    # Test 2: 0 critical formula-as-image
    r = subprocess.run(
        ['python', 'scripts/audit-all-formula-as-image.py'],
        cwd=proj, capture_output=True, text=True, encoding='utf-8',
    )
    if 'mapped_no_render: 0' not in r.stdout and 'Critical mapped-no-render: 0' not in r.stdout:
        failures.append(f'critical formula-image NOT zero: {r.stdout[:500]}')

    # Test 3: 0 duplicate pairs
    r = subprocess.run(
        ['python', 'scripts/detect-duplicate-math-broad.py'],
        cwd=proj, capture_output=True, text=True, encoding='utf-8',
    )
    if 'Grand total duplicates: 0' not in r.stdout:
        failures.append(f'duplicate pairs remain: {r.stdout[:500]}')

    # Test 4: bundle pages.js doesn't reference 8 deleted images
    subprocess.run(['python', 'tools/bundle_pages.py'], cwd=proj, check=True,
                   capture_output=True)
    pages_js = (proj / 'js/pages.js').read_text(encoding='utf-8')
    deleted = ['hinh-037.png', 'hinh-039.png', 'hinh-136.png',
               'hinh-240.png', 'hinh-241.png', 'hinh-266.png',
               'hinh-283.png', 'hinh-289.png']
    for needle in deleted:
        if needle in pages_js:
            failures.append(f'pages.js still references deleted {needle}')

    # Test 5: all phase tests still pass
    for phase in (1, 2, 3, 4, 5, 6):
        script = proj / f'scripts/test-phase-{phase:02d}-' \
                 + {1: 'baseline', 2: 'critical-images', 3: 'no-duplicates',
                    4: 'render-font', 5: 'alt-text', 6: 'audit-guard'}[phase] + '.py'
        if not script.exists():
            failures.append(f'missing phase test: {script.name}')
            continue
        r = subprocess.run(['python', str(script)], cwd=proj,
                           capture_output=True, text=True, encoding='utf-8')
        if r.returncode != 0:
            failures.append(f'{script.name} fails: {r.stdout[-200:]}')

    if failures:
        for f in failures: print(f'FAIL: {f}')
        sys.exit(1)
    print('PASS: all phase tests + audit + bundle + dedupe verified')
    sys.exit(0)

if __name__ == '__main__':
    sys.path.insert(0, str(__file__).rsplit('\\', 1)[0])
    main()
```

Chạy → expect PASS (do phase 1-6 đã fix).

### TDD Step 3 — Bundle + audit

```powershell
python tools/bundle_pages.py
python tools/audit.py --strict-images --strict-formula-image
python scripts/test-phase-07-release.py
```

### TDD Step 4 — Browser release gate

```powershell
npm run test:sim:browser
npm run test:sim:visual-quality
npm run test:sim:disposal
npm run test:sim:release   # đã chứa --strict-formula-image (F2.5)
```

Capture log → save trong `reports/release-gate-2026-05-18.md`.

### TDD Step 5 — Playwright smoke spec (F2.2 — replace manual smoke)

`tests/visual/test_phase_07_smoke.spec.js`:
```javascript
const { test, expect, devices } = require('@playwright/test');

const TARGETS = [
  { url: '/index.html', name: 'home' },
  { url: '/chapters/ch1/muc-III-2.html', name: 'ch1-vec-T' },
  { url: '/chapters/ch1/muc-III-3.html', name: 'ch1-vec-R' },
  { url: '/chapters/ch1/muc-IV-3.html', name: 'ch1-iv-3' },
  { url: '/chapters/ch2/muc-V-3.html', name: 'ch2-v-3' },
  { url: '/chapters/ch2/muc-II-2.html', name: 'ch2-mixed' },
  { url: '/chapters/ch3/muc-V-4.html', name: 'ch3-vec-v' },
  { url: '/chapters/ch3/muc-VII-1.html', name: 'ch3-vec-N' },
  { url: '/chapters/ch3/muc-VII-2.html', name: 'ch3-vec-F' },
];

const DELETED_IMAGES = [
  'hinh-037.png', 'hinh-039.png', 'hinh-136.png',
  'hinh-240.png', 'hinh-241.png', 'hinh-266.png',
  'hinh-283.png', 'hinh-289.png',
];

const BROWSERS = ['chromium', 'firefox', 'webkit'];  // 3 engines = Chrome + Firefox + Safari

for (const { url, name } of TARGETS) {
  test(`smoke ${name} (${url})`, async ({ page, browserName }) => {
    await page.goto(`http://localhost:8000${url}`);
    await page.waitForSelector('body');

    // Assert 1: no deleted raster images present
    for (const deleted of DELETED_IMAGES) {
      const present = await page.evaluate((src) => {
        return !!document.querySelector(`img[src*="${src}"]`);
      }, deleted);
      expect(present, `${deleted} should NOT appear in ${url}`).toBe(false);
    }

    // Assert 2: KaTeX rendered (presence of .katex or MathML)
    const hasMath = await page.evaluate(() => {
      return !!(document.querySelector('.katex') ||
                document.querySelector('math') ||
                document.querySelector('.math-tex'));
    });
    if (url !== '/index.html') {  // home may not have math
      expect(hasMath, `${url} should have math rendering`).toBe(true);
    }

    // Assert 3: no generic alt text "Hình minh họa chương X"
    const genericAlts = await page.evaluate(() => {
      const re = /^Hình minh họa chương [123]$/;
      return Array.from(document.querySelectorAll('img'))
        .filter(img => re.test((img.alt || '').trim()))
        .map(img => img.src);
    });
    expect(genericAlts, `${url} has generic alt`).toEqual([]);

    // Assert 4: figures use <figure> tag (not <div class="figure-container">)
    const oldDivs = await page.locator('div.figure-container').count();
    expect(oldDivs, `${url} still has <div class="figure-container">`).toBe(0);

    // Assert 5: visual snapshot
    await expect(page).toHaveScreenshot(`${browserName}-${name}.png`, {
      maxDiffPixels: 200,
    });
  });
}
```

`playwright.config.js` đã có 3 projects (chromium/firefox/webkit), 9 targets × 3 = 27 tests run automatically.

```powershell
npx playwright test tests/visual/test_phase_07_smoke.spec.js
```

### TDD Step 6 — Docs sync

Edit `docs/project-changelog.md`:
```markdown
## 2026-05-18 — Formula-as-Image, Duplicate Render & Alt-Text Hardening

### Added
- Audit rule `--strict-formula-image` (default ON) phát hiện ảnh raster có dấu hiệu chứa công thức.
- File `data/image_alt_overrides.json` cho manual alt-text + figcaption override.
- File `data/formula-image-allowlist.json` whitelist legitimate raster figures.
- Plain Python test scripts `scripts/test-phase-XX-*.py` cho 7 phase TDD (no pytest dependency).
- Playwright visual smoke spec `tests/visual/test_phase_07_smoke.spec.js` (9 targets × 3 browsers).
- CSS `assets/css/equations.css` đồng bộ font giữa MathML và KaTeX + `<figure>/<figcaption>` styling.
- `tools/extract_docx.py --auto-fix-known-issues` post-processor (default ON) cho re-extract idempotent.

### Fixed
- 8 ảnh raster công thức (`hinh-037`, `hinh-039`, `hinh-136`, `hinh-240`, `hinh-241`, `hinh-266`, `hinh-283`, `hinh-289`) chuyển sang MathML/KaTeX.
- 40 cặp duplicate render (MathML + KaTeX cạnh nhau) loại bỏ phần KaTeX trùng (root cause fix trong `extract_docx.py`).
- 134 alt text generic "Hình minh hoạ chương X" thay bằng mô tả thực.
- 136/136 figures missing `<figcaption>` → add từ caption DOCX.

### Changed
- `<div class="figure-container">` → `<figure>` (HTML5 semantic).
- `tools/extract_docx.py:render_image_segment` — đọc `image_alt_overrides.json` + caption auto + figure tag output.
- `tools/audit.py` — thêm guard formula-as-image (default ON).
- KaTeX render config: `output: 'htmlAndMathml'` cho screen reader access.
- 8 rows trong `equation_mapping.json` được mark `obsolete=true`.
- `package.json test:sim:release` thêm `--strict-formula-image` flag.
```

Edit `docs/code-standards.md`: thêm section "Equation rendering rules" + "Image alt text + figcaption rules".

Edit `docs/development-roadmap.md`: chuyển trạng thái phase tương ứng.

### TDD Step 7 — Tag với collision retry (F2.3)

`scripts/git-tag-with-retry.ps1`:
```powershell
# Tag with collision detection and timestamp suffix retry
param(
    [Parameter(Mandatory=$true)][string]$BaseTag,
    [string]$Message
)
$tag = $BaseTag
$existing = git tag -l $tag
if ($existing) {
    $suffix = Get-Date -Format 'HHmmss'
    $tag = "${BaseTag}-r${suffix}"
    Write-Host "Base tag exists, retry with: $tag"
}
git tag -a $tag -m $Message
Write-Host "Created tag: $tag"
return $tag
```

Use:
```powershell
git add chapters/ tools/ data/ scripts/ tests/ docs/ js/pages.js assets/ plans/ index.html package.json
git commit -m "fix: khử 8 formula-as-image, 40 duplicate render, 134 alt text + figcaption + audit guard default ON"
$tagName = & .\scripts\git-tag-with-retry.ps1 -BaseTag "v-2026-05-18-formula-fix" -Message "Formula-as-image + duplicate + alt-text comprehensive fix"
git push origin master
git push origin $tagName
```

### TDD Step 8 — Report cuối

Viết `reports/release-gate-2026-05-18.md`:
- Test summary table (tests PASS/FAIL counts mỗi suite)
- Audit output snippet
- Playwright smoke log (27 tests)
- `npm run test:sim:release` log
- Final tag git (có suffix nếu retry)
- Open issues nếu có
- Verify auto-fix post-processor active (Phase 02 F1.1)

## Todo List

- [ ] Viết `scripts/test-phase-07-release.py` (plain Python, RED → GREEN)
- [ ] Pre-flight git status clean
- [ ] `python tools/bundle_pages.py`
- [ ] `python tools/audit.py --strict-images --strict-formula-image` PASS
- [ ] Chạy 6 phase test scripts: PASS toàn bộ
- [ ] Viết `tests/visual/test_phase_07_smoke.spec.js` (5 assertion groups × 9 targets × 3 browsers = 135 assertions)
- [ ] `npx playwright test tests/visual/test_phase_07_smoke.spec.js` PASS
- [ ] `npm run test:sim:browser`
- [ ] `npm run test:sim:visual-quality`
- [ ] `npm run test:sim:disposal`
- [ ] `npm run test:sim:release` PASS (chứa --strict-formula-image)
- [ ] Update `docs/project-changelog.md`
- [ ] Update `docs/code-standards.md`
- [ ] Update `docs/development-roadmap.md`
- [ ] Viết `scripts/git-tag-with-retry.ps1`
- [ ] Commit + tag với retry logic (F2.3)
- [ ] Push lên remote
- [ ] Viết `reports/release-gate-2026-05-18.md`

## Success Criteria

- [ ] `scripts/test-phase-07-release.py` PASS (5 test groups)
- [ ] `npm run test:sim:release` PASS (173 browser + visual + disposal + strict-formula-image)
- [ ] All 6 phase test scripts PASS
- [ ] Playwright smoke 9 × 3 = 27 tests PASS (5 assertions/test = 135 total)
- [ ] Audit strict PASS (default ON guard verified)
- [ ] Re-extract DOCX (auto-fix post-processor) → HTML clean
- [ ] Docs sync 3 files
- [ ] Tag git `v-2026-05-18-formula-fix` (hoặc retry suffix) đẩy lên remote
- [ ] `reports/release-gate-2026-05-18.md` đầy đủ với 27-test breakdown

## Risk Assessment

| Rủi ro | Mitigation |
|---|---|
| Release gate fail vì phase trước chưa kín | Rollback và fix phase tương ứng; KHÔNG ép pass |
| Browser test fail trên `file://` (CDN) | Đã có local KaTeX; verify CSS load order trong `index.html` |
| Visual diff khác baseline do font fallback chain | Phase 4 đã set baseline; nếu đổi máy/OS, regenerate baseline có chú thích |
| Tag git xung đột (retry case) | Collision check + suffix `-r{HHMMSS}` (F2.3) |
| Push thất bại do branch protection | PR thay vì direct push, follow workflow GitHub |
| Playwright smoke flaky 1/27 | Retry x2 trong CI; `maxDiffPixels: 200`; nếu 1 browser fail (vd. webkit), document và retest |
| `localhost:8000` server không sẵn khi chạy Playwright | Pre-step: `python -m http.server 8000` background; verify port; auto-shutdown after spec |
| Auto-fix post-processor (F1.1) crash trong release | Audit-guard catch lại; verify trong test 7 |

## Security Considerations

- Tag annotated (`-a`) để có metadata ai release.
- Không commit secrets (`.env`, credentials).
- `git push --tags` không kèm `--force`.
- PowerShell tag retry script không exec arbitrary code, chỉ string interpolation cho tag name.

## Rollback Plan

Nếu sau release phát hiện lỗi nghiêm trọng:
```powershell
git revert <tag-or-commit>
python tools/bundle_pages.py
python tools/audit.py --strict-images --strict-formula-image
$revertTag = & .\scripts\git-tag-with-retry.ps1 -BaseTag "v-2026-05-18-formula-fix-revert" -Message "Rollback formula fix"
git push origin master
git push origin $revertTag
```
Hoặc nếu chỉ 1 phase lỗi: `git revert <phase-commit>` riêng.
