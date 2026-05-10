# Release Checklist And Rollback

Date: 2026-05-07

## Scope

Static textbook release after semantic math strict publish and strict image gate cleanup.

## Release Package Profiles

### Student/offline package

Include:

- `index.html`
- `css/`
- `js/`
- `chapters/`
- `images/`
- `lib/`
- `data/quiz-ch1.json`, `data/quiz-ch2.json`, `data/quiz-ch3.json`
- `data/equation_mapping.json`
- `README.md`
- `docs/deployment-guide.md`

Exclude:

- `.venv-ocr/`, `.venv-ocr-pix2text/`
- `node_modules/`
- `backups/`, `Old/`
- `plans/`
- `tests/`, `test-results/`
- OCR/review intermediate data: `data/equation_mapping.ocr*.json`, `data/equation_mapping.template.json`, `data/equation_mapping.reviewed.json`, `data/equation_manual_reviews.json`, `data/equation_mapping.auto-review-failures.json`
- Dev/review artifacts: `equation-review.html`, `equation-review-sample.html`, `audit_gallery.html`, `repomix-output.xml`
- Dev-only package files: `package.json`, `package-lock.json`

### Maintainer package

Include everything in student package plus:

- `tools/`
- `docs/`
- `plans/`
- `tests/`
- `package.json`, `package-lock.json`
- `CoHocLyThuyet_Full_New.docx`

Still exclude:

- `.venv-ocr/`, `.venv-ocr-pix2text/`
- `node_modules/`
- `test-results/`
- `backups/` unless an explicit archive/restore bundle is requested

## Current Size Risks

Largest local-only directories:

| Path | Approx size | Release action |
|---|---:|---|
| `.venv-ocr-pix2text/` | 2333 MB | Exclude |
| `.venv-ocr/` | 1778 MB | Exclude |
| `backups/` | 135 MB | Exclude from student package |
| `node_modules/` | 13 MB | Exclude unless maintainer installs QA locally |

## Package Smoke Checklist

Before final handoff:

1. Copy student profile into a clean folder outside repo.
2. Open `index.html` directly via `file://`.
3. Run `python -m http.server 8000` from package folder and open `http://localhost:8000/`.
4. Visit representative pages: `ch1-1-4`, `ch1-5-3`, `ch2-2-2`, `ch2-7-1`, `ch3-5-2`, `ch3-6-3`.
5. Confirm search, sidebar, quiz, notes, KaTeX/MathML, images, and one simulation route.
6. Run package-level checks if tools are included:
   ```powershell
   python tools\audit.py
   python tools\audit.py --strict-images
   python tools\audit.py --strict-equations
   ```

## Rollback

Rollback source:

- Preferred pre-strict publish backup: `backups/20260505-214149-pre-local-ocr-strict-publish/`
- Earlier DOCX sync backup if needed: `backups/20260505-150438-pre-docx-sync/`

Rollback steps:

1. Stop any local server using the release folder.
2. Restore the backup copy to a separate directory first; do not overwrite current working tree directly.
3. Run:
   ```powershell
   python tools\audit.py
   ```
4. If restoring semantic math work, rerun the DOCX pipeline from the chosen source baseline:
   ```powershell
   python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx --write
   python tools\update_nav.py
   python tools\bundle_pages.py
   python tools\audit.py
   ```
5. Compare `index.html`, `chapters/`, `images/`, `js/pages.js`, and `data/equation_mapping.json` before replacing the production package.

## Current Validation Evidence

- `python tools\audit.py`: pass, 99 files, 0 warnings, 0 errors.
- `python tools\audit.py --strict-images`: pass, all local images satisfy publish image gate.
- `python tools\audit.py --strict-equations`: pass, no equation image fallbacks and mapping fully reviewed.
- `python tools\validate_equation_mapping.py --input data\equation_mapping.json --strict --katex`: pass, 702 reviewed rows.

## Remaining Before Final Sign-Off

- Build an actual clean package folder/zip when target distribution path is known.
- Smoke test that package folder via both `file://` and `http://`.
- Decide whether maintainer package should include `CoHocLyThuyet_Full_New.docx`.

Unresolved questions:

- Final release destination/package name chưa xác định.
