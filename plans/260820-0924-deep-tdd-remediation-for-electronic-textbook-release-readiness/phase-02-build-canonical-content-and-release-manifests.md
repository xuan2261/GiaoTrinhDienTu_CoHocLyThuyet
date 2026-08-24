---
title: "Phase 2: Xây manifest nội dung và phát hành chuẩn"
status: completed
priority: P0
effort: "4-6 ngày"
dependencies: [phase-01]
---

# Phase 2: Xây manifest nội dung và phát hành chuẩn

## Overview

Tách rõ manifest cấu trúc do máy sinh, metadata/evidence do con người quản lý và manifest release. Khóa portability, determinism và parity giữa DOCX, chapter fragments, PAGE_MAP/PAGE_ORDER/BC, `js/pages.js`, PDF và ship set.

## Requirements

- Generated manifest không chứa absolute path; ghi logical source name, SHA-256, generator/version và route/content hashes.
- Curated learning/evidence data không bị `tools/extract_docx.py` ghi đè.
- Bundle phải fail nếu PAGE_MAP thiếu file; không còn silent omission.
- Release manifest liệt kê artifact, provenance, license/notices, hash và evidence refs.
- Giữ `js/pages.js` generated-only và runtime `file://` tương thích.

## Architecture

`DOCX -> extract structural snapshot -> update_nav -> bundle -> build content manifest -> validate parity`. Curated manifests join bằng stable IDs. Phase 10 mới đóng package; Phase 2 định nghĩa schema/builders/validators.

## Related Code Files

- Modify: `tools/extract_docx.py`, `tools/update_nav.py`, `tools/bundle_pages.py`, `package.json`.
- Generated: `tools/docx_site_manifest.json`, `data/content-manifest.json`, `js/pages.js`.
- Create: `tools/build_content_manifest.py`, `tools/validate_content_manifest.py`, `data/schemas/content-manifest.schema.json`, `data/schemas/release-manifest.schema.json`.
- Tests: `tests/content-manifest-schema.test.js`, `tests/content-manifest-route-parity.test.js`, `tests/release-manifest-contract.test.js`.
- Reuse: `tools/pdf-viewer/build-assets.mjs`, `lib/pdfjs/provenance.json`.

## Data Contract

`content-manifest.json`: schemaVersion, source `{logicalPath,sha256}`, generator, routes `{routeId,title,sourceHeadingPath,chapterFile,bundleKey,contentHash,figureRefs,equationRefs,quiz/sim flags}`. Release schema: releaseVersion, normalized `buildEpoch`/`SOURCE_DATE_EPOCH`, commit/source hashes, included files+hashes, provenance/notices/evidence refs; Phase 10 owns the builder and validator implementation.

## Tests Before

1. Assert current manifest contains a machine-specific absolute path.
2. Mutate a fixture PAGE_MAP to a missing fragment and prove current bundler silently skips it.
3. Show current release has no top-level manifest/VERSION/SHA256SUMS/notices.
4. Record current PAGE_MAP/PAGES/chapter counts and hash inputs.

## Implementation Steps

1. **RED:** schema test rejects absolute paths, duplicate routes, missing generator/source hashes.
2. **RED:** parity tests delete/rename/add route and prove both missing and orphan files fail.
3. Extract manifest serialization from `tools/extract_docx.py`; normalize logical paths and deterministic ordering.
4. Implement content builder joining DOCX outline, PAGE_MAP, PAGE_ORDER, BC, chapter files, PAGES and quiz/sim references.
5. Make `tools/bundle_pages.py` fail on required missing file; allow exclusions only through explicit policy entries.
6. **GREEN:** generate portable deterministic manifest twice and compare byte/hash equality for identical inputs.
7. Define and fixture-test the release manifest schema only; Phase 10 owns `tools/build_release_manifest.py`, `tools/validate_release_manifest.py` and package inventory implementation.
8. **Refactor:** centralize path normalization/hash/file inventory helpers; no second route parser convention.

## Tests After

- `python tools/validate_content_manifest.py`.
- `node --test tests/content-manifest-schema.test.js tests/content-manifest-route-parity.test.js`.
- Determinism test in two clean temp directories with different absolute checkout paths.
- Existing `npm run test:content`, `npm run test:quiz`, `npm run test:pdf:release` focused prerequisites.

## Todo

- [x] Freeze generated versus curated ownership.
- [x] Remove absolute source paths.
- [x] Add route/bundle/tree parity validator.
- [x] Add release manifest schema and checksum contract.
- [x] Document generator order and generated-file ownership.

## Success Criteria

- 100% canonical routes resolve to exactly one fragment and one PAGES entry.
- Zero orphan/missing generated content files under the declared policy.
- Same inputs produce the same normalized manifest independent of checkout path.
- Release schema can describe the full ship set and link PDF provenance without duplicating it.

## Risk Assessment

- Risk: route parsing duplicated across Python/JS. Mitigation: one generated manifest is the interchange contract.
- Risk: intentional route exclusions appear orphaned. Mitigation: explicit exclusion reason/version in manifest.
- Risk: timestamps break determinism. Mitigation: exclude wall-clock fields from content hash or inject build epoch.

## Next Steps

Phase 3 uses stable manifest IDs for RTM/LO joins; Phase 5 builds search from the same route/content contract.