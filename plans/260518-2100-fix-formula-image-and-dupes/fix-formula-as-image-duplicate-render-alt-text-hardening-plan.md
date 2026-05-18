---
title: "Fix Formula-as-Image, Duplicate Render & Alt-Text Hardening"
description: "Fix 8 ảnh formula-as-image, khử 40 duplicate MathML+KaTeX, đồng bộ render font, viết alt text mô tả, thêm audit guard, regenerate static textbook."
status: completed
priority: P1
effort: 16-22h
issue:
branch: feat/fix-formula-as-image
tags: [docs, equations, html, audit, accessibility, qa, tdd]
blockedBy: []
blocks: []
related: [20260505-2044-local-math-ocr-semantic-math-strict-publish, 20260506-1829-audit-image-strict-gate]
created: 2026-05-18
---

# Fix Formula-as-Image, Duplicate Render & Alt-Text Hardening

## Overview

Triển khai các khuyến nghị từ báo cáo `plans/reports/debug-report-formula-as-image-comprehensive-2026-05-18.md`. Sửa 8 ảnh raster đang chứa công thức/ký hiệu, khử 40 cặp render trùng MathML+KaTeX, đồng bộ font-family giữa hai cơ chế render, bổ sung alt text mô tả cho 134 ảnh, thêm audit rule chống regression, sau cùng regenerate static textbook và full release gate. Mỗi phase TDD strict: viết test trước (red), implement (green), refactor, verify.

## Validation Decisions (sau /ck:plan validate 2026-05-18)

| Câu hỏi | Quyết định |
|---|---|
| Approach 8 ảnh + 40 duplicate | **Hybrid A + pipeline fix** — Phase 02 dùng HTML edit; Phase 03 vừa regex HTML hiện tại, vừa fix root cause trong `extract_docx.py` |
| OCR 3 ảnh inline-glyph nhỏ | **Done qua Vision** — OCR result lưu trong `reports/ocr-tiny-glyph-verification-2026-05-18.md` |
| Phát hiện sau OCR | `hinh-266` ($a_2=a_1$) và `hinh-283` ($P_2-T_2=0$) là **duplicate raster của text đã có**; xoá hoàn toàn, không thay equation mới |
| Scope 7 phase | **Giữ đủ 7 phase** (16-22h) |
| Test framework | **Plain Python script asserts + Playwright spec** — tránh pytest dependency mới (xem F2.1 red-team) |
| Mapping 8 ảnh chính thức | 6 replace ($\vec T$, $\vec R$, $\vec v$, $\vec P_2$, $\vec P_1$, $\vec N$, $\vec F$) + 2 delete (hinh-266, hinh-283) |

## Red-Team Decisions (sau /ck:plan red-team 2026-05-18)

Báo cáo: `reports/red-team-review-2026-05-18.md`. 14 findings, 2 CRITICAL + 4 HIGH đã được resolve.

| Finding | Severity | Quyết định |
|---|---|---|
| F1.1 — DOCX còn 8 raster, re-extract regen | CRITICAL | **Auto-fix post-processor**: thêm flag `--auto-fix-known-issues` (mặc định ON) vào `tools/extract_docx.py`. Sau khi sinh HTML, pipeline tự chạy `replace-eight-formula-images.py --apply --idempotent` + `apply-alt-and-figcaption.py --apply --idempotent`. Re-extract idempotent, CI không false-positive. |
| F1.2 — Phase 03 Front A/B race | HIGH | **Đảo Front B trước**: fix root cause `extract_docx.py` đầu tiên. Front A trở thành verify (re-extract trên DOCX hiện tại tự sinh HTML không duplicate). |
| F2.1 + F2.2 — pytest dependency + manual smoke | HIGH | **Plain Python + Playwright**: bỏ pytest + lxml, dùng `scripts/test-phase-XX.py` plain asserts (như `audit-all-formula-as-image.py`). Manual browser smoke 9×3 → Playwright spec `tests/visual/test_phase_07_smoke.spec.js`. |
| F2.5 — strict-formula-image không tự ON | CRITICAL | **Default ON + update release gate**: trong `tools/audit.py`, `--strict-formula-image` mặc định True. `package.json` `test:sim:release` thêm `--strict-images --strict-formula-image`. |
| F3.1 — Caption regex chưa enumerate | HIGH | **Đo trước Phase 05**: Phase 01 thêm `scripts/measure-caption-coverage.py` để đếm match `Hình X.Y` trong DOCX. Nếu < 70%, mở rộng regex trước. |
| F3.4 — figcaption thiếu | MEDIUM | **Mở rộng Phase 05**: vừa update alt vừa add `<figcaption>` từ caption DOCX. HTML đổi `<div class="figure-container">` → `<figure>...</figure>`. |
| F1.3 — Phase 06 data source | MEDIUM | Phase 06 chỉ đọc `equation_mapping.json` + scan HTML; KHÔNG đụng `equation_report.json`. |
| F2.3 — Tag collision retry | LOW | Phase 07 check `git tag -l` trước; nếu tồn tại, suffix timestamp `-r{HHMMSS}`. |
| F2.4 — validate_equation_mapping orphan rows | MEDIUM | Phase 02 sau replace, mark 8 rows trong mapping `obsolete=true` (giữ row, không xoá để audit trail). |
| F2.6 — `.bak` race | LOW | Backup naming `*.bak.{timestamp}` trong tất cả script. |
| F3.2 — KaTeX câm screen reader | MEDIUM | Phase 04 verify `index.html` có `renderMathInElement(..., {output: 'htmlAndMathml'})`; nếu không có, thêm. |
| F3.3 — Vietnamese SR | LOW | Documented trong `docs/code-standards.md` (ngoài scope). |
| F1.4 — Bundle cache assumption | MEDIUM | Phase 01 thêm 1 step verify `tools/bundle_pages.py` không có cache layer. |

## Mục tiêu định lượng

| Hạng mục | Hiện tại | Sau khi fix |
|---|---:|---:|
| Ảnh formula-as-image (mapped+context flagged) | 8 | 0 |
| Cặp duplicate render MathML+KaTeX | 40 | 0 |
| File mixed render thiếu CSS đồng bộ | 14 | 0 (qua CSS chung) |
| Ảnh có alt mô tả thực (thay generic) | 2/136 | 136/136 |
| Audit rule "suspect formula-as-image" | 0 | 1 |
| Strict release gate `npm run test:sim:release` | PASS | PASS |
| Browser visual regression | n/a | 0 diff |

## Cross-Plan Dependencies

| Relationship | Plan | Status | Reason |
|---|---|---|---|
| Related (refines) | [Local Math OCR Semantic Math Strict Publish](../20260505-2044-local-math-ocr-semantic-math-strict-publish/plan.md) | in-progress | Bổ sung 8 ảnh DOCX-raster mà pipeline OCR chưa cover; thêm guard cho `audit.py --strict-images`. |
| Related (extends) | [Audit Image Strict Gate](../20260506-1829-audit-image-strict-gate/plan.md) | (existing) | Mở rộng strict gate với rule formula-as-image suspect detector. |

## Research & Reports

| File | Vai trò |
|---|---|
| [Debug Report 2026-05-18](../reports/debug-report-formula-as-image-comprehensive-2026-05-18.md) | Báo cáo nguồn — danh sách 8 ảnh + 40 duplicate + 134 alt + root cause |
| [Audit JSON](../reports/formula-as-image-comprehensive-audit.json) | Dữ liệu thô per-image |
| [Equation Report](../../tools/equation_report.json) | DOCX classification per image (`prog_id`, `kind`, `text_context`) |

Bổ sung sẽ viết khi triển khai:
- `reports/docx-raster-survey.md` — phase 2: đánh dấu chính xác vị trí 8 ảnh trong DOCX gốc
- `reports/duplicate-deduper-report.md` — phase 3: trước/sau, số pair còn lại
- `reports/alt-text-coverage.md` — phase 5: alt-text mới cho 134 ảnh
- `reports/visual-diff-baseline.md` — phase 4: snapshot baseline browser
- `reports/release-gate-2026-05-18.md` — phase 7: release log

## Phases

| # | Name | File | Status | Priority |
|---:|---|---|---|---|
| 01 | Baseline & TDD Test Infrastructure | [phase-01-baseline-tdd-infrastructure.md](phase-01-baseline-tdd-infrastructure.md) | completed | P1 |
| 02 | Fix 8 Critical Formula-as-Image | [phase-02-fix-eight-critical-formula-images.md](phase-02-fix-eight-critical-formula-images.md) | completed | P1 |
| 03 | Deduplicate 40 Render Pairs | [phase-03-deduplicate-render-pairs.md](phase-03-deduplicate-render-pairs.md) | completed | P1 |
| 04 | Standardize Render Font + Mixed Files | [phase-04-standardize-render-font.md](phase-04-standardize-render-font.md) | completed | P2 |
| 05 | Alt Text Overhaul 134 Images | [phase-05-alt-text-overhaul.md](phase-05-alt-text-overhaul.md) | completed | P2 |
| 06 | Audit Regression Guard | [phase-06-audit-regression-guard.md](phase-06-audit-regression-guard.md) | completed | P1 |
| 07 | Final QA + Docs Sync | [phase-07-final-qa-and-docs-sync.md](phase-07-final-qa-and-docs-sync.md) | completed | P1 |

Dependencies:
```
01 ──┬─→ 03(Front B) ──→ 03(Front A verify) ──┐
     ├─→ 02 ─────────────────────────────────┐ │
     ├─→ 04 ──┐                              │ │
     │        └─→ 05 ───────────────────────┐│ │
     └────────────────────────────────────┐ ││ │
                                          ▼ ▼▼ ▼
                                          06 ──→ 07
```
- Phase 03 đổi thứ tự: **Front B (pipeline fix) làm trước**, sau đó Front A trở thành verify trên HTML hiện tại (re-extract DOCX để check). Bảo vệ khỏi race re-extract giữa Front A và Front B.
- **Phase 05 deps [1, 2, 4]**: Phase 02 patterns hardcode `<div class="figure-container">` để replace 8 raster — Phase 05 migrate `<div class="figure-container">` → `<figure>` cho TOÀN BỘ HTML, phải chạy SAU Phase 02 commit. Phase 04 chuẩn bị CSS `<figure>/<figcaption>` styling.
- 02/04 độc lập (sau Phase 01), có thể chạy song song.
- 06 cần 02+03 đã pass (rule audit dựa trên trạng thái sạch).
- 07 cần tất cả ở trên xong.
- **Phase 02** kết hợp với **F1.1 auto-fix**: `tools/extract_docx.py` thêm post-processor tự gọi `replace-eight-formula-images.py` + `apply-alt-and-figcaption.py` mỗi lần re-extract → re-extract idempotent.
- **Phase 05** dùng direct HTML patch (script update alt + add figcaption + migrate figure tag), không re-extract; pipeline modification chỉ là future-proof qua `image_alt_overrides.json` + caption parser được pipeline đọc.

## Constraints & Decisions

1. **Approach cho 8 ảnh CRITICAL:** **Hybrid A + Auto-fix pipeline** (red-team F1.1). Phase 02 chỉnh HTML qua `replace-eight-formula-images.py`. `tools/extract_docx.py` thêm flag `--auto-fix-known-issues` (mặc định ON) tự chạy script này sau mỗi lần extract → re-extract idempotent.
2. **Đồng bộ render:** giữ MathML cho 645 row, KaTeX cho 53 row LaTeX-only. KHÔNG ép LaTeX → MathML cho 53 row đó. CSS chịu trách nhiệm đồng bộ visual. Phase 04 verify KaTeX render với `output: 'htmlAndMathml'` (red-team F3.2) để screen reader đọc được.
3. **Alt text + figcaption:** parser auto từ caption "Hình X.Y" trong DOCX là default (Phase 01 đo coverage trước — red-team F3.1); fallback theo pattern keyword; manual override qua `data/image_alt_overrides.json`. Phase 05 mở rộng scope: vừa update alt vừa add `<figcaption>` từ caption DOCX, đổi `<div class="figure-container">` → `<figure>` (red-team F3.4).
4. **Audit guard:** rule mới `--strict-formula-image` mặc định ON trong `tools/audit.py`. `package.json` `test:sim:release` thêm flag này (red-team F2.5). Có flag `--no-strict-formula-image` để debug.
5. **TDD:** **Plain Python script asserts + Playwright spec** (red-team F2.1). Không thêm pytest dependency. Mỗi phase có `scripts/test-phase-XX.py` (exit 0 = pass) và Phase 07 có `tests/visual/test_phase_07_smoke.spec.js` Playwright (red-team F2.2).
6. **Backwards-compatibility:** không thay đổi schema `equation_mapping.json`, chỉ extend cờ `alt` cho row figure-artifact + cờ `obsolete=true` cho 8 row đã thay (red-team F2.4) + thêm file `image_alt_overrides.json` mới.
7. **Backup convention:** all script dùng `*.bak.{YYYYMMDDHHMMSS}` để tránh race khi chạy nhiều lần (red-team F2.6).

## Risk Matrix

| Rủi ro | Xác suất | Impact | Mitigation |
|---|---|---|---|
| Auto-fix post-processor (F1.1) không chạy được vì lỗi import | Thấp | Trung bình | Flag `--no-auto-fix` để bypass; pipeline log warning thay vì crash |
| Front B fix pipeline làm mất MathML cho 645 entry hợp lệ | Thấp | Cao | Test re-extract verify số block MathML không giảm; rollback git nếu lệch |
| Regex script khử duplicate ăn nhầm equation đơn lẻ | Thấp | Cao | Pre-test golden file diffing, dry-run `--check`, anchor regex chặt với `</math>\s*</span>` |
| Caption coverage < 70% (F3.1 đo trước) | Trung bình | Trung bình | Phase 01 đo coverage; nếu thấp, mở rộng regex hoặc tăng tỷ lệ manual override trong Phase 05 |
| `<figure>/<figcaption>` đổi cấu trúc làm vỡ CSS layout | Thấp | Trung bình | Phase 04 update CSS song song; visual diff baseline trước/sau |
| Auto-generate alt từ caption sai vì DOCX caption không gần ảnh | Trung bình | Thấp | Override file, manual review batch sau khi script chạy |
| Bundle `pages.js` lệch encoding | Thấp | Cao | Re-run `bundle_pages.py` + `audit.py` strict, snapshot diff |
| Visual regression sau CSS change | Thấp | Trung bình | Phase 4 dùng Playwright screenshot baseline → diff sau |
| Browser test fail trên `file://` (CDN KaTeX block) | Trung bình | Trung bình | Đã có fallback local KaTeX; phase 7 verify lại |
| Playwright spec phase 07 fail flaky 1/27 case | Trung bình | Trung bình | Retry x2 trong CI; visual maxDiffPixels: 200 |

## Success Criteria (Plan-level)

- [ ] `python scripts/audit-all-formula-as-image.py` báo 0 formula-as-image candidate.
- [ ] `python scripts/detect-duplicate-math-broad.py` báo 0 duplicate pairs.
- [ ] `python tools/audit.py` (no args) PASS với `--strict-formula-image` mặc định ON.
- [ ] `npm run test:sim:release` PASS (173 browser tests + visual quality + disposal + strict-formula-image).
- [ ] `python scripts/test-phase-XX.py` PASS cho mọi phase 01-07 (plain Python asserts, không pytest).
- [ ] `npx playwright test tests/visual/test_phase_07_smoke.spec.js` PASS (9 file × 3 browsers).
- [ ] Re-extract pipeline (`python tools/extract_docx.py --input ... --write`) sinh HTML không có 8 raster + không có 40 duplicate (Front B + auto-fix verify).
- [ ] `docs/project-changelog.md` có entry 2026-05-18 mô tả công việc.
- [ ] Browser smoke `index.html` mở `file://` không có ảnh raster ở đoạn liên quan 8 mục đã liệt kê.
- [ ] 134 ảnh có alt khác mặc định "Hình minh hoạ chương X" + có `<figcaption>` từ caption DOCX.

## Workflow

```bash
# Sau khi mỗi phase done, chạy:
python scripts/test-phase-XX.py
python tools/audit.py --strict-images
python tools/bundle_pages.py
# Phase 4+5 thêm:
npx playwright test tests/visual/
# Phase 7:
npm run test:sim:release
npx playwright test tests/visual/test_phase_07_smoke.spec.js
```

## Đơn nguyên test

```
scripts/                                      # Plain Python asserts (no pytest)
├── test-phase-01-baseline.py                 # snapshot inventory
├── test-phase-02-critical-images.py          # 8 ảnh không còn dạng <img> trong figure-container
├── test-phase-03-no-duplicates.py            # 0 duplicate pair
├── test-phase-03-pipeline-no-regen.py        # re-extract sinh 0 duplicate
├── test-phase-04-render-font.py              # CSS class hiện diện đúng
├── test-phase-05-alt-text.py                 # 0 generic + 100% có figcaption
├── test-phase-06-audit-guard.py              # gate fail khi inject suspect
└── test-phase-07-release.py                  # smoke release

tests/visual/                                 # Playwright (browser regression)
├── test_math_visual_baseline.spec.js         # Phase 04 baseline
└── test_phase_07_smoke.spec.js               # Phase 07 9 file × 3 browsers
```

## Boundary Reminder

Plan này KHÔNG đụng tới simulation engine, chỉ tập trung textbook content. Không sửa:
- `js/sim-*.js`, `js/sims/*`
- `tests/promax-pilot-shell.spec.js` và các test simulation
- `data/equation_mapping.json` rows đã reviewed (chỉ extend `alt` field)
- Cấu trúc `js/loader.js`, `js/pages.js` ngoài việc bundle lại

Phạm vi sửa khoá vào: `chapters/**/*.html`, `tools/audit.py` (default `--strict-formula-image` ON), `tools/extract_docx.py` (alt parsing + auto-fix post-processor + Front B duplicate fix), `data/image_alt_overrides.json` (mới), `data/equation_mapping.json` (mark obsolete cho 8 row), `data/formula-image-allowlist.json` (mới), `assets/css/equations.css` (font sync + figure styling), `tests/visual/**` (Playwright spec), `scripts/*.py` (plain asserts + replace + dedupe + caption parser), `package.json` (release gate update), `index.html` (KaTeX htmlAndMathml output).

## Definition of Done

Plan completed khi tất cả phase status = completed VÀ
- 7 báo cáo phase đầy đủ trong `reports/`
- 1 báo cáo release gate
- `docs/project-changelog.md` updated
- `docs/code-standards.md` thêm rule mới (audit guard, alt text policy)
- Tag git `v-2026-05-18-formula-fix`
