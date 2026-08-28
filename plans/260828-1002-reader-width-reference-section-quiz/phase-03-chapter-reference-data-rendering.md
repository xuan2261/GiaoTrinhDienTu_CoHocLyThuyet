---
phase: 3
title: "Dữ liệu và render bảng ký hiệu theo chương"
status: completed
priority: P1
effort: ""
dependencies: []
---

# Phase 3: Dữ liệu và render bảng ký hiệu theo chương

## Overview

Tạo một curated supplemental academic contract cho ký hiệu/chữ viết tắt/đơn vị, validate truy vết route và render bảng semantic vào chapter index qua extractor. Không tự động suy diễn ý nghĩa từ MathML và không sửa HTML generated bằng tay.

## Context Links

- [Codebase evidence](./reports/codebase-evidence-and-recommendations.md)
- `tools/extract_docx.py:970-997`, `1115-1143`: chapter index generation.
- `tools/build_content_manifest.py:38-99`: source/content hash build.
- `tools/validate_content_manifest.py:27-52`, `97-128`: exact provenance validation.
- `tools/build_search_index.py:11-13`, `104-164`: visible table-cell indexing.
- `data/academic_review_ledger.json:1517-1543`: current pending/missing logical-output boundary.

## Requirements

- Functional:
  - Ch1–Ch3 each have real curated entries grouped as `symbol|abbreviation|unit`.
  - Every entry has stable ID, meaning and same-chapter `sourceRoutes`; exactly one display field `tex|label`.
  - Extractor inserts one visible-by-default reference section after `.ov-sec`.
  - Table has heading, summary count, semantic column headers, units and first-use links.
  - Re-running extract is deterministic and does not duplicate the table.
  - Content manifest schema v1 gains an additive `source.chapterReference` provenance object; current builder always emits it, current validator/freshness tests require and recompute its hash, and input mutation/stale output fails.
- Non-functional:
  - No raw HTML fields; all text escaped; KaTeX/MathML rendering uses current loader.
  - File:// requires no runtime fetch of reference JSON.
  - Narrow layout uses an owned scroll region without page-level horizontal overflow.
  - Automation validates structure/provenance only; it must not claim academic completeness or acceptance.
  - Existing DOCX source/figure/equation contracts and post-extract fixers stay intact.

## Architecture

```text
CoHocLyThuyet_Full_New.docx ----\
                                 -> tools/extract_docx.py
data/chapter-reference.json ----/       |
  -> tools/chapter_reference.py         v
     validate + render             chapters/ch*/index.html
                                         |
                            bundle/content manifest/search
```

Data contract:

```json
{
  "schemaVersion": 1,
  "chapters": {
    "ch1": {
      "entries": [{
        "id": "ch1-force-vector",
        "kind": "symbol",
        "tex": "\\\\vec{F}",
        "meaning": "Véc tơ lực",
        "unit": "N",
        "sourceRoutes": ["ch1-1-3"]
      }]
    }
  }
}
```

Validation rules:

- Exact top/chapter/entry keys; unknown fields fail.
- Stable ID pattern `^ch[123]-[a-z0-9-]+$`, globally unique.
- `kind` allowlist; exactly one non-empty `tex|label`.
- `meaning` non-empty; `unit` optional text; no raw HTML property.
- `sourceRoutes` non-empty, unique, resolved by current chapter structure, and every route belongs to the same chapter.
- Entries preserve curated file order; renderer groups without semantic re-sorting that could hide author intent.
- Content-manifest schemaVersion remains 1 because the provenance property is additive; schema declares it, while repository-current validation requires it. Do not silently accept a current manifest missing the property.

## File Inventory

Repository root: `C:/Work/GiaoTrinhDienTu_CoHocLyThuyet`.

| Action | Path | Current size/evidence | Test impact |
|---|---|---|---|
| Create | `data/chapter-reference.json` | none | New curated schema/content input |
| Create | `tools/chapter_reference.py` | none | Pure load/validate/render helper |
| Modify | `tools/extract_docx.py` | 1261 lines; render seam 970-997/1121 | Import helper, load once, pass per chapter |
| Modify | `tools/build_content_manifest.py` | 114 lines | Add curated input provenance hash |
| Modify | `tools/validate_content_manifest.py` | 185 lines; exact-key validator | Validate source object/hash |
| Modify | `data/schemas/content-manifest.schema.json` | 58 lines | Declare chapter-reference provenance |
| Modify | `css/style.css` | 2546 lines | Reference details/table/scroll/focus/light-dark rules |
| Create | `tests/test_chapter_reference.py` | none | Schema/routes/escaping/determinism pure tests |
| Modify | `tests/content-manifest-schema.test.js` | 13 assertions | Provenance shape/hash |
| Modify | `tests/content-manifest-route-parity.test.js` | 9 assertions | Mutation/stale hash failure |
| Create | `tests/chapter-reference-content.test.js` | none | Real data IDs/routes/chapter coverage/no placeholders |
| Modify | `package.json` | content/manifest scripts | Add focused reference contract gate |
| Generate | `chapters/ch{1,2,3}/index.html` | extractor-owned | Rendered table output |
| Generate later | `tools/docx_site_manifest.json`, `data/content-manifest.json`, `js/pages.js`, search outputs | current provenance/bundle chain | Phase 4 |

## Function and Interface Checklist

- [X] `load_chapter_reference(path)` parses UTF-8 JSON and reports path/context on failure.
- [X] `validate_chapter_reference(data, route_catalog)` enforces exact schema, uniqueness and same-chapter routes.
- [X] `render_chapter_reference(chapter_id, entries)` is deterministic, escapes text/attributes and emits no raw author HTML.
- [X] `render_chapter_index(..., chapter_reference)` inserts after the completed `.ov-sec`, not inside intro or list.
- [X] Extractor dry-run validates curated input even when it does not write.
- [X] Missing chapter/reference file fails early; no silent empty table.
- [X] Content manifest schema v1 declares `source.chapterReference: {logicalPath, sha256}`; builder always emits it and current validator requires/recomputes it.
- [X] Search/index builders consume rendered output without new special case.
- [X] Route links use `href="#route-id"` so existing hashchange loader handles them without inline onclick.

## Dependency Map

- Authoring inputs: DOCX narrative + one curated JSON metadata file.
- Generation owner: extractor + pure helper.
- Provenance owner: content manifest builder/validator/schema.
- Runtime consumers: only generated chapter HTML, existing KaTeX loader and hash router.
- Review consumer: existing academic ledger/signoff workflow; no new parallel acceptance system.
- Phase dependency: none; Phase 4 regenerates/bundles/indexes and runs browser/release gates.

## Test Scenario Matrix

| Priority | Scenario | Expected proof |
|---|---|---|
| Critical | Valid Ch1–Ch3 curated data | All IDs unique; each chapter non-empty; every source route resolves |
| Critical | Raw HTML in label/meaning | Rendered as text, never executable markup |
| Critical | Cross-chapter/missing route | Validation fails with entry ID and route |
| Critical | Mutate curated file after manifest build | `validate_content_manifest.py` fails hash mismatch |
| High | Both/neither `tex` and `label` | Schema validation fails |
| High | Duplicate ID/route/entry | Deterministic validation failure |
| High | Extract twice | Byte-identical chapter indexes, exactly one reference block |
| High | Narrow 320px table | Owned region scrolls; document does not overflow |
| High | Hash link from first-use cell | Existing router loads correct section and updates breadcrumb |
| Medium | Search for abbreviation/meaning | Search index points to chapter route with fresh manifest hash |
| Medium | KaTeX unavailable | Plain TeX source remains readable enough; no blank row/runtime crash |

## Tests Before

1. Add RED pure Python tests for schema exactness, source-route resolution, escaping, deterministic order and chapter coverage.
2. Add RED content test that rejects placeholder/example meanings and missing chapters in real curated data.
3. Extend content-manifest tests with RED provenance shape/hash/mutation expectations.
4. Define exact generated HTML fixture before renderer implementation: one heading, details summary, table headers, grouped rows and hash links.

## Refactor

1. Keep data/schema/render functions in `tools/chapter_reference.py`; extractor only orchestrates.
2. Reuse existing `html.escape`/logical route conventions; no HTML parser/dependency.
3. Load and validate once per extractor run; pass chapter slice to renderer.
4. Extend existing manifest source object rather than create a second manifest or ship authoring JSON at runtime.
5. Keep review status in existing academic workflow; source data stores facts and source routes, not fabricated approval.

## Implementation Steps

1. Write RED data/render/provenance tests.
2. Define and populate real Ch1–Ch3 entries from current chapter content; no TODO/example rows in committed data.
3. Implement strict helper loader/validator/renderer and route catalog adapter.
4. Integrate helper at chapter-index render seam after `.ov-sec`.
5. Add reference table CSS using current navy/paper/gold tokens, focus-visible and scroll containment.
6. Extend content manifest source/schema/validator with curated input provenance.
7. Run extractor dry-run, focused unit tests and one write generation; inspect only generator output, never hand-patch it.
8. Record academic review state honestly; do not make `test:academic-acceptance` pass without evidence.

## Tests After

- Add mutation cases for same visual label with different vector/scalar TeX and special Vietnamese characters.
- Add one first-route navigation browser assertion in Phase 4 after bundle regeneration.
- Add a deterministic hash assertion that fails if entry order/render output drifts without source change.

## Regression Gate

```powershell
python -m unittest tests.test_chapter_reference tests.test_extract_docx_image_determinism
node --test tests/chapter-reference-content.test.js tests/content-manifest-schema.test.js tests/content-manifest-route-parity.test.js
python tools\extract_docx.py --input CoHocLyThuyet_Full_New.docx --write
python tools\build_content_manifest.py
python tools\validate_content_manifest.py
```

Phase 3 ends green for curated source → generated chapter index → manifest provenance. Phase 4 then rebuilds nav, offline bundle and search artifacts and proves whole-pipeline freshness.

## Todo

- [X] Write RED schema/render/provenance tests.
- [X] Curate real reference entries for all three chapters.
- [X] Implement pure helper and extractor integration.
- [X] Add semantic/responsive table styles.
- [X] Bind curated source hash into content manifest.
- [X] Run deterministic extraction and focused gates.

## Success Criteria

- [X] All three chapter indexes contain exactly one generated reference table after contents.
- [X] Every row is real, route-traceable, escaped and schema-valid.
- [X] Input mutation invalidates provenance; repeated build is deterministic.
- [X] No runtime fetch/new dependency/raw HTML or manual generated-file edit.
- [X] Academic automation/reporting does not overclaim review completeness.

## Risk Assessment

| Risk/assumption | Observable break signal | Pre-decided response |
|---|---|---|
| Curated JSON becomes an undocumented second source | Chapter output changes but `source.chapterReference` is absent/stale | Keep schema-v1 property additive, but require it in current builder/validator/freshness gates and document authoring boundary |
| Auto-derived symbol meaning is tempting/inaccurate | Entry lacks explicit meaning/source route or conflicts with text | Fail schema/content review; require manual curation, never infer final meaning |
| Extractor coupling grows | Reference-specific validation/render code appears throughout 1261-line file | Keep one import/load/pass/render seam; move logic to focused helper |
| Table causes page/search bloat | Search performance/entry-count gate regresses materially | Keep only stable chapter-wide entries; do not index hidden duplicate markup |
| Academic ledger goes stale | `academic_review.py --strict-current` reports changed hashes/pending | Preserve pending status and route through canonical review; never edit acceptance to green |

## Security Considerations

- No raw HTML or script/event fields in data.
- Escape labels, meanings, units, IDs and route attributes.
- Route IDs validated against generated catalog and same-chapter prefix.
- KaTeX remains local with existing trust behavior; no network asset or author-provided URL.

## Next Steps

Phase 4 performs full regeneration, bundle/search freshness, browser semantics/reflow and documentation synchronization.
