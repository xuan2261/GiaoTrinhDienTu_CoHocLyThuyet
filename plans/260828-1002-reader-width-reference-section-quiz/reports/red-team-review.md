---
title: "Red-team review"
status: final
created: 2026-08-28
tags: [red-team, plan-review, verification]
---

# Red-team review

## Execution note

Three required four-phase-plan reviewers were dispatched in parallel: Security Adversary, Failure Mode Analyst and Assumption Destroyer. All three failed before reading any plan/source file because the configured `erablue/gpt-5.6-sol` API key is invalid or disabled. No agent finding was accepted or represented as evidence.

The controller ran the Standard-tier fallback using Fact Checker + Contract Verifier against the plan and current source. The user selected **Apply all accepted findings**.

## Findings

| # | Severity | Finding | Evidence | Disposition |
|---|---|---|---|---|
| 1 | High | `const CHAPTER_SECTIONS` relies on cross-script global lexical lookup and is not observable as a stable runtime contract. Emit `window.CHAPTER_SECTIONS` and consume it explicitly. | `index.html:366-373` loads app before quiz; current explicit feature globals use `window.TEXTBOOK_GLOSSARY_TERMS` in `js/glossary.js:37` and `window.SEARCH_INDEX` in `js/search-index.js:1`. | Accept |
| 2 | High | Loading width preference at body end applies saved wide mode after first CSS paint, causing visible reflow. Run the small module in `<head>` before `css/style.css`; defer button binding to DOM readiness. | `index.html:4-15` loads CSS in head; all feature scripts currently load at `index.html:361-378`. | Accept |
| 3 | High | Hiding the width control at `<=900px` removes the requested choice on 769–900px tablets where the 680px lower cap can still leave unused width. Keep compact icon through tablet widths; hide only where available width is already below/near the standard cap. | `css/style.css:437-443` cap lower bound is 680px; `css/style.css:1211-1214` already simplifies topbar at 900px; mobile content padding changes at `1173-1178`. | Accept |
| 4 | Medium | Chapter-reference provenance evolution was underspecified. A required new key under strict schema v1 could silently become a breaking schema change. Define it as an additive schema-v1 source property; current builder always emits it and current validator/freshness tests require/hash-check it. | `tools/validate_content_manifest.py:27-52` rejects unexpected source keys and pins schemaVersion 1; `tools/build_content_manifest.py:84-98` owns source object/hash. | Accept |
| 5 | High | Section preference is chapter-global while attempts are scope-keyed. Cross-tab last-writer preference is acceptable only if attempts for both keys remain intact and no answer loss occurs. Add a two-tab/different-scope contract and state last-writer-wins for preference only. | `js/quiz-state.js:160-179` reads latest store then writes active attempt by key; `js/quiz.js:8-9` keys attempts by chapter/mode/section; current concurrency test covers only the same attempt in `tests/quiz-attempt-persistence.spec.js:20-31`. | Accept |
| 6 | Medium | Deleting unrelated `cau-hoi-on-tap.html` while correcting quiz generator would expand scope without a runtime need. | `tools/update_nav.py:196-197` routes review to `on-tap.html` and quiz to `trac-nghiem.html`; `tools/gen_quiz_pages.py:35-51` separately writes the unused review artifact. | Reject; leave it unchanged and record as separate cleanup if desired. |

## Applied changes

1. Phase 1 uses `window.CHAPTER_SECTIONS`, explicit fallback and cross-tab different-scope tests.
2. Phase 2 loads the focused preference module in head before CSS, binds the control after DOM readiness, keeps compact control through tablet widths and hides only at the no-benefit narrow breakpoint.
3. Phase 3 defines additive manifest schema-v1 provenance with current-state required validation.
4. Phase 4 adds the updated global/provenance/first-paint/tablet/cross-tab checks to freshness and browser gates.

## Whole-plan consistency sweep

- Files reread after application: `plan.md`, all four `phase-*.md` files.
- Decision deltas checked: 5.
- Reconciled stale references: 13; final post-validation sweep recorded in `plan.md`.
- Unresolved contradictions: 0.

## Unresolved questions

None.