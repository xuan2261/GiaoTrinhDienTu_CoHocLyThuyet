---
title: "Phase 10 - Release Package And Rollback"
status: in-progress
priority: P2
effort: 3h
---

# Phase 10 - Release Package And Rollback

## Context Links

- `docs/deployment-guide.md`
- `README.md`
- `backups/`
- `index.html`
- `reports/release-checklist.md`

## Overview

Prepare final static release and rollback instructions after strict semantic math publish.

## Key Insights

- Product is offline-first and can run via `file://`.
- OCR venv/model cache must not be part of release package.
- `backups/` and `Old/` policy remains unresolved in roadmap.

## Requirements

Functional:
- Produce release checklist.
- Define package include/exclude list.
- Define rollback path to pre-OCR backup.

Non-functional:
- Keep package portable.
- No local venv/model cache in release.
- No confidential files.

## Architecture

```text
validated static repo -> release checklist -> package folder/zip -> smoke test -> rollback doc
```

## Related Code Files

Modify:
- Optional `docs/deployment-guide.md`
- Optional `README.md` if run commands changed.

Create:
- Optional `plans/.../reports/release-checklist.md`

Delete:
- None.

## Implementation Steps

1. Define package include:
   - `index.html`
   - `css/`
   - `js/`
   - `chapters/`
   - `images/`
   - `lib/`
   - `data/quiz-ch*.json`
   - `data/equation_mapping.json`
   - docs needed for maintainer release
2. Define exclude:
   - `.venv-ocr/`
   - model caches
   - temporary sample JSON
   - old reviewed backups unless maintainer package
3. Smoke test package copy:
   ```powershell
   python -m http.server 8000
   ```
4. Open `index.html` by `file://`.
5. Verify sample formula pages.
6. Rollback plan:
   - restore backup from Phase 01.
   - rerun normal audit.

## Todo List

- [x] Create release checklist.
- [x] Confirm package include/exclude.
- [ ] Smoke test package copy.
- [x] Verify no OCR venv/cache included in checklist/profile.
- [x] Document rollback.
- [ ] Final sign-off.

## Success Criteria

- Release package opens offline.
- Strict semantic math still present in package.
- No development-only OCR artifacts included.
- Rollback steps documented and tested enough.

## Test And Validation

```powershell
python tools\audit.py
python tools\audit.py --strict-equations
```

Manual:
- Open `index.html` from package.
- Navigate 3 sample pages per chapter.
- Confirm formulas render.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Package includes huge model cache | Explicit exclude list |
| Missing local KaTeX assets | Check `lib/katex` in package |
| Broken `file://` because bundle missing | Include `js/pages.js`, test direct open |

## Security Considerations

- Do not ship `.venv-ocr`, caches, temporary files, secrets.
- Do not publish backups if they contain local-only data.

## Next Steps

Release sign-off or archive plan after completion.
