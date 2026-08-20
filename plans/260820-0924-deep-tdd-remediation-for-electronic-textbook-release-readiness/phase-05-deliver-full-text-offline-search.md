---
title: "Phase 5: Cung cấp tìm kiếm toàn văn offline"
status: pending
priority: P0
effort: "5-7 ngày"
dependencies: [phase-02]
---

# Phase 5: Cung cấp tìm kiếm toàn văn offline

## Overview

Thay search nhãn navigation bằng index toàn văn build-time, zero runtime dependency, hỗ trợ tiếng Việt có/không dấu, ranking, snippet và anchor ổn định khi chạy `file://`.

## Requirements

- Index title, heading, body, glossary, figcaption và simulation labels từ route manifest.
- Exact/phrase/folded match; title > heading > metadata > body; deterministic tie-break.
- Snippet dùng text gốc, escape tuyệt đối, highlight không XSS.
- Result mở đúng route và scroll đúng anchor sau render; fallback nav-only phải báo rõ.
- Combobox/listbox/status semantics, Arrow/Enter/Escape và focus restore.
- Budget ban đầu: raw index <=2 MiB, parsed <=4 MiB, p95 query <=50 ms desktop; đo rồi ratify.

## Architecture

`tools/build_search_index.py` đọc Phase-2 manifest/PAGE_MAP/fragments, phát sinh `data/search-index.json` và `js/search-index.js`. `js/search.js` xử lý normalize/score/snippet/UI; `js/app.js` delegate; `js/loader.js` nhận optional anchor sau render.

## Related Code Files

- Modify: `index.html`, `js/app.js`, `js/loader.js`, `css/style.css`, `package.json`.
- Create: `tools/build_search_index.py`, `js/search.js`, `data/search-index.json`, `js/search-index.js`.
- Tests: `tests/test_search_index_build.py`, `tests/search-runtime.spec.js`, `tests/search-performance.test.js`.
- Generated-only: `chapters/**`, `js/pages.js`.

## Tests Before

1. Search cụm thân bài “vô cùng bé”; xác nhận không có kết quả dù text tồn tại.
2. Query không dấu tương ứng; xác nhận current lowercase-only behavior.
3. Record keyboard behavior và thiếu listbox/status semantics.
4. Prove `file://` cannot fetch a JSON index at runtime; require bundled JS artifact.

## Implementation Steps

1. **RED:** build tests cho body term, folding, deterministic output, unique anchors, full route coverage.
2. **RED:** browser tests cho body query, title ranking, phrase, snippet, anchor, no-result, corrupted index fallback.
3. Implement Unicode normalization NFKD + combining-mark removal while preserving original display text.
4. Generate stable anchors from source route + heading ordinal/slug at the generation boundary; never hand-edit generated chapters.
5. Implement scorer, page diversity cap, safe snippet/mark renderer and version/hash compatibility check.
6. Add accessible state machine: closed/loading/results/no-results/error; active descendant and focus restore.
7. **GREEN:** make full-text tests pass on `file://`; keep SDB nav fallback only with visible degraded message.
8. **Refactor:** isolate pure tokenizer/scorer; no DOM reads inside ranking core.

## Tests After

- `python -m unittest tests/test_search_index_build.py`.
- `npx playwright test tests/search-runtime.spec.js`.
- `node --test tests/search-performance.test.js`.
- Existing app/navigation/file-protocol regression suites.

## Todo

- [ ] Freeze index schema/version/hash contract.
- [ ] Add stable anchor generation.
- [ ] Build deterministic Vietnamese index.
- [ ] Implement accessible search UI and fallback.
- [ ] Measure and approve size/latency budgets.

## Success Criteria

- Body, heading and title queries return correct ranked results with safe snippets.
- Accented and folded Vietnamese queries resolve equivalently where intended.
- Exact result anchor is visible/focused after navigation.
- Missing/stale index never crashes app and never silently claims full-text.
- All functionality works offline without external requests.

## Risk Assessment

- Stale index: bind to content-manifest hash and fail release parity.
- Anchor drift: generate IDs from the same source/ordering contract as index.
- Large bundle: field compaction and measured budget; do not add dependency before evidence.
- XSS: escape source text first, then insert controlled `<mark>` spans.

## Next Steps

Phase 8 audits the final search semantics; Phase 10 always builds the index before packaging.