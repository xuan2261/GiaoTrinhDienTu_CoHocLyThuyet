---
title: "Codebase evidence and recommendations"
status: final
created: 2026-08-28
tags: [research, frontend, quiz, content-pipeline, accessibility]
---

# Codebase evidence and recommendations

## Summary

The three requested changes fit the existing static offline architecture. Quiz section filtering already exists below the UI; full-width reading is a small persisted shell preference; chapter references require the only new curated academic data contract. No backend, framework, router, or database is justified.

Three requested researcher jobs were dispatched in one parallel wave but all failed before reading the repository because the configured `erablue/gpt-5.6-terra` API key is invalid or disabled. The controller therefore completed the evidence pass directly from current source, generated artifacts, tests, manifests, and unfinished plan files. No researcher claim is included.

## Scope challenge

- Existing code: `js/quiz-state.js` already filters by `section`; quiz banks already tag every item `I`–`VII`; `js/quiz.js` already includes section in attempt IDs and active-attempt keys; `js/app.js` already persists theme/font preferences; `tools/extract_docx.py` owns chapter indexes.
- Requested scope: optional full-width content, one chapter-local symbol/abbreviation table after the chapter introduction/contents, and a small section-scope quiz menu.
- Complexity: four implementation phases; no new service/class; one small preference module and one small chapter-reference helper/data contract; generated artifacts updated only through generators.
- Selected scope: HOLD. Deliver all three requests; reject unrelated framework, telemetry, LMS, simulation, PDF, or broad glossary redesign.

## Verified current behavior

| Area | Evidence | Consequence |
|---|---|---|
| Reading width | `css/style.css:437-443` sets `max-width: clamp(680px, 55vw, 900px)` | A `data-content-width="wide"` override can remove only the cap while keeping default behavior. |
| Preference pattern | `js/app.js:248-272` and `303-322` persist `theme` and `fontZoom` | New preference should use the same button/`aria-pressed`/localStorage pattern, isolated in a small module because `js/app.js` is already 418 lines. |
| Quiz section data | `data/quiz-ch1.json`, `quiz-ch2.json`, `quiz-ch3.json` use `section` on all 300 items | No bank migration or QTI/LMS change is needed. |
| Quiz filtering | `js/quiz-state.js:48-51` filters by `options.section`; `67-75` writes section into attempts | UI can activate an existing contract. |
| Quiz persistence key | `js/quiz.js:8-9`, `151-172` distinguish `chapter|mode|section` | Attempts for different sections can coexist. Persisting the currently selected section is an additive store field, not an attempt-schema rewrite. |
| Wrong scoped counts | `js/quiz.js:117-124` labels All from `bank.items.length` and Random as fixed 10 | Section VI of Ch1 has 5 questions and Section IV of Ch3 has 9; labels must use selected-scope count. |
| Section titles | `tools/update_nav.py:59-85`, `153-173` already derives Roman IDs/titles from generated section pages | Generate a structured `CHAPTER_SECTIONS` catalog from this source; do not duplicate titles in quiz banks. |
| Quiz page generator drift | `tools/gen_quiz_pages.py:30` writes `on-tap-trac-nghiem.html`; `tools/update_nav.py:197` and `js/loader.js` route to `trac-nghiem.html` | Fix generator ownership and remove the obsolete quiz-page output in the same cutover. |
| Chapter index ownership | `tools/extract_docx.py:970-997`, `1115-1143` generates each chapter index and DOCX manifest | Never hand-edit `chapters/ch*/index.html`; reference tables must be rendered from curated input by the extractor/helper. |
| Existing glossary | `js/glossary.js:7-37` contains global term definitions | Keep glossary separate; symbol tables are stable chapter references, not hover-term behavior. |
| Academic boundary | `data/academic_review_ledger.json:1517-1543` contains current symbol-related equation records with missing logical output/stale artifact/pending academic status | Automated symbol scraping cannot establish meaning or completeness. Curate entries and keep external acceptance claims blocked until review. |
| Manifest provenance | `tools/build_content_manifest.py:84-98` and `tools/validate_content_manifest.py:40-52` strictly define source hashes | Add schema-v1 `source.chapterReference` as an additive property; current builder always emits it and current validator/freshness gates require/recompute it. |
| Offline bundle | `tools/bundle_pages.py:19-66` bundles HTML fragments and quiz JSON into `js/pages.js` | Pre-render reference tables and rebuild bundle; no runtime fetch for reference data. |
| Search | `tools/build_search_index.py:11-13`, `104-164` indexes visible `th`/`td` and binds to content-manifest hash | Rebuild both search artifacts and run performance/runtime tests after tables are generated. |

## Quiz distributions confirmed

| Chapter | Section counts |
|---|---|
| Ch1 | I 12; II 9; III 9; IV 18; V 32; VI 5; VII 15 |
| Ch2 | I 15; II 11; III 10; IV 14; V 24; VI 11; VII 15 |
| Ch3 | I 10; II 27; III 11; IV 9; V 14; VI 14; VII 15 |

The scope menu should include every section with at least one question, including VII. Random mode displays `min(10, scopedCount)`.

## Recommended contracts

### Full-width preference

- Storage key: `contentWidth`; accepted values `standard|wide`; invalid/missing values normalize to `standard`.
- DOM state: `document.documentElement.dataset.contentWidth`, applied by a small head-loaded module before CSS first paint.
- Control: native button `#contentWidthBtn`, `aria-pressed`, state-dependent Vietnamese label/title.
- Layout: remove only `.content-area` max-width in wide mode; retain responsive gutters and child media/simulation caps.
- Responsive control: icon-only through tablet widths; hide only at `<=560px`, where available content width is already below/near the standard cap.

### Quiz scope

- Generated catalog: `window.CHAPTER_SECTIONS = { ch1: [{id:'I', routeId:'ch1-1', title:'...'}], ... }` emitted by `tools/update_nav.py` from the same chapter scan that owns BC/PAGE_ORDER.
- Control: labelled native `<select class="quiz-scope">`; values `all|I|...|VII`; options built only for sections present in the loaded bank.
- State: additive `selectedSections` map in `chlyt_quiz_attempts`; old stores sanitize to an empty map. Preference is last-writer-wins across tabs; attempts remain keyed and preserved by chapter/mode/section.
- Counts: All and Random labels computed from the selected subset.
- Fallback: if generated catalog is unavailable, use `Phần {Roman}` labels and keep the quiz answerable.

### Chapter reference data

- Curated authoring input: `data/chapter-reference.json`, schema version 1.
- Entry fields: stable `id`, `kind` (`symbol|abbreviation|unit`), exactly one of `tex|label`, non-empty `meaning`, optional `unit`, non-empty `sourceRoutes` resolving within the same chapter.
- No raw HTML fields. Escape text during build; KaTeX/MathML enhancement remains the existing loader responsibility.
- Render: visible-by-default `<details open>` after `.ov-sec`, semantic heading/table, grouped rows, route links using `href="#route-id"`, scrollable owned region on narrow screens.
- Provenance: content manifest source records logical path/hash for the curated input. Generated HTML remains derived output.
- Review: automation proves schema, routes, determinism, escaping, output parity, and freshness only. It cannot prove academic completeness/correctness.

## Existing tests and missing coverage

| Surface | Existing protection | Missing test to write first |
|---|---|---|
| Quiz render | `tests/quiz-browser-render.spec.js`: 3 chapter loop, 11 assertions | Scope options/titles/counts; scoped all/random counts; fallback catalog. |
| Quiz persistence | `tests/quiz-attempt-persistence.spec.js`: 4 tests, 11 assertions | Reload selected section; switch sections without overwriting attempts; reset only current scope. |
| Quiz state | `tests/quiz-state-migration.test.js`: 25 assertions | `selectedSections` sanitization and section-specific attempts below 10 items. |
| Quiz keyboard | `tests/quiz-keyboard-a11y.spec.js`: 1 flow, 10 assertions | Labelled select keyboard change and focus continuity. |
| Shell semantics | `tests/accessibility-landmarks.spec.js`: 4 tests, 28 assertions | Width button accessible state/name. |
| Reflow | `tests/accessibility-zoom-reflow.spec.js`: 5 tests, 9 assertions | Wide-mode desktop/sidebar geometry and narrow no-overflow. |
| Manifest | `tests/content-manifest-schema.test.js`: 13 assertions; route parity: 9 | Curated input hash/provenance mutation failure. |
| Search | `tests/search-runtime.spec.js`: 6 tests, 22 assertions | Generated reference terms remain searchable without stale index or page overflow. |
| Chapter reference | None | Pure data/schema/render tests plus file:// browser semantics/navigation/reflow. |

## Cross-plan assessment

- `plans/260820-0924-deep-tdd-remediation-for-electronic-textbook-release-readiness/` overlaps assessment, accessibility and manifest domains, but its implemented source outcomes already exist while its plan status is stale `pending`. This plan consumes current schema-v2 quiz, manifest and accessibility contracts; it is not blocked by the stale plan.
- `plans/260522-0946-fix-duplicate-image-captions-docx-html-pipeline/` owns a separate figure post-processor. Chapter-reference rendering does not change caption logic or files owned by its RED/GREEN phases. Generated chapter/bundle regeneration is serializable, not a blocking dependency.
- `plans/260820-0639-vit-li-phn-quy-cch-thnh-bo-co-np-chnh-thc/` edits a separate submission DOCX boundary and has no shared source files.
- Result: `blockedBy: []`, `blocks: []`. Record overlaps as coordination notes, not false dependency edges.

## Rejected alternatives

1. Always-full-width default: harms prose readability and contradicts current design guidance.
2. Seven quiz chips: consumes horizontal space and worsens 320px/400% reflow; native select is simpler.
3. Duplicate section titles in quiz JSON: creates drift against navigation.
4. Runtime fetch for chapter references: unnecessary and breaks file:// parity unless bundled again.
5. Automatic MathML/DOCX symbol extraction as final content: cannot resolve symbol meaning/scope and current academic ledger already shows missing logical outputs.
6. Raw HTML in chapter-reference JSON: creates avoidable injection and rendering ambiguity.
7. New frontend framework/settings service: no benefit for three small static-reader enhancements.

## Unresolved questions

None for technical planning. Default decisions: true available-width mode with gutters; include Section VII; curated structured reference data with existing academic review boundary.