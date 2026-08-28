---
phase: 1
title: "Menu quiz theo từng phần"
status: completed
priority: P1
effort: ""
dependencies: []
---

# Phase 1: Menu quiz theo từng phần

## Overview

Kích hoạt contract `section` đã có bằng một native scope selector, đồng bộ tên phần từ chapter navigation, giữ attempt độc lập theo phạm vi và sửa generator quiz page đang ghi sai filename.

## Context Links

- [Codebase evidence](./reports/codebase-evidence-and-recommendations.md)
- `js/quiz-state.js:48-51`, `67-89`: lọc section và restore attempt.
- `js/quiz.js:99-172`: UI mode, count hiện tại và persistence.
- `tools/update_nav.py:59-85`, `153-173`: nguồn section title.
- `tools/gen_quiz_pages.py:8-32`: generator hiện ghi `on-tap-trac-nghiem.html`.

## Requirements

- Functional:
  - `<select>` có nhãn “Phạm vi ôn tập”, option Toàn chương và mọi section có câu hỏi.
  - Tên/route lấy từ generated `window.CHAPTER_SECTIONS`; question count lấy từ bank, không hardcode.
  - All hiển thị toàn bộ câu trong scope; Random hiển thị `min(10, scopedCount)`.
  - Chuyển scope không ghi đè attempt scope khác; reload khôi phục mode, scope, order và answer. Giữa nhiều tab, preference scope là last-writer-wins nhưng attempts/answers của từng key phải được giữ.
  - Reset chỉ thay attempt key hiện tại.
  - Generator ghi `trac-nghiem.html`; output `on-tap-trac-nghiem.html` được xóa chỉ sau canonical write thành công.
- Non-functional:
  - File:// không fetch section metadata.
  - Native keyboard/screen-reader semantics; focus không mất khi đổi mode/scope.
  - Store v2 cũ đọc được; corrupt/unknown `selectedSections` bị loại.
  - Không đổi 300 quiz items, QTI/Common Cartridge hoặc learning-outcome joins.

## Architecture

```text
generated chapter pages
  -> tools/update_nav.py scan_chapters()
  -> window.CHAPTER_SECTIONS in js/app.js

quiz bank section fields + window.CHAPTER_SECTIONS
  -> js/quiz.js scope selector/counts
  -> js/quiz-state.js selectedSections + existing attempt key
  -> DOM cards / localStorage chlyt_quiz_attempts
```

Contract dự kiến:

```js
window.CHAPTER_SECTIONS = {
  ch1: [{ id: 'I', routeId: 'ch1-1', title: 'KHÁI NIỆM CƠ BẢN' }]
};

// store v2 additive field; old stores default to {}
selectedSections: { ch1: 'VI' }
```

Không bump attempt schema: `section` đã là field v2. `selectedSections` là preference additive được sanitize, không thay answer/history records.

## File Inventory

Repository root: `C:/Work/GiaoTrinhDienTu_CoHocLyThuyet`.

| Action | Path | Current size/evidence | Test impact |
|---|---|---|---|
| Modify | `tools/update_nav.py` | 279 lines; owns BC/PAGE_ORDER/PAGE_MAP | Add catalog generation/parity test |
| Modify | `js/app.js` | 418 lines; generated maps at top | Generated data block only; no new logic |
| Modify | `js/quiz-state.js` | 192 lines; 25 existing unit assertions | Add selected-section sanitize/persist tests |
| Modify | `js/quiz.js` | 176 lines; only runtime quiz renderer | Add scope UI, dynamic count, focus path |
| Modify | `tools/gen_quiz_pages.py` | 54 lines; writes wrong quiz filename at line 30 | Make import-safe/root-aware; generator test |
| Modify | `css/style.css` | Quiz mode at `1093-1124` | Add compact labelled select responsive styles |
| Modify | `package.json` | `test:quiz`, `test:quiz:browser` | Include generator/catalog tests |
| Modify | `tests/quiz-state-migration.test.js` | 25 assertions | Add backward-compatible store/scope cases |
| Modify | `tests/quiz-browser-render.spec.js` | 3 chapter loop, 11 assertions | Add 21 option labels/counts/all/random |
| Modify | `tests/quiz-attempt-persistence.spec.js` | 4 tests, 11 assertions | Add reload/scope isolation/reset |
| Modify | `tests/quiz-keyboard-a11y.spec.js` | 1 flow, 10 assertions | Add select label/keyboard/focus |
| Create | `tests/quiz-section-catalog.test.js` | none | Catalog ↔ BC/banks/route parity |
| Create | `tests/test_quiz_page_generation.py` | none | Canonical filename, idempotency, stale cleanup |
| Generate | `chapters/ch{1,2,3}/trac-nghiem.html` | Runtime PAGE_MAP targets | Must come from generator |
| Delete | `chapters/ch{1,2,3}/on-tap-trac-nghiem.html` | Unreachable duplicate output | Guard absence after generation |
| Generate later | `js/pages.js` | Offline bundle | Phase 4 only |

## Function and Interface Checklist

- [X] `gen_chapter_sections(chapters)` emits one explicit `window.CHAPTER_SECTIONS` assignment with stable order and escaped JS strings.
- [X] `update_app()` inserts/replaces one generated `window.CHAPTER_SECTIONS` block idempotently.
- [X] `emptyStore()` includes `selectedSections: {}`.
- [X] `sanitizeStore()` accepts only `ch1|ch2|ch3` keys and `I`–`VII` values.
- [X] `tryCommitAttempt()` persists selected mode and selected section in the same atomic store write.
- [X] `renderQuiz()` resolves saved scope only for canonical `quiz-${chapter}` containers; review/fixture callers remain backward compatible.
- [X] `renderExisting()` calculates scoped items once and derives both button labels from that set.
- [X] Scope change calls `renderQuiz(containerId, chapter, mode, section, ..., true)` and restores focus to the select or first unanswered choice.
- [X] Missing catalog degrades to `Phần {Roman}` labels; empty/invalid scope never creates a blank non-answerable page.
- [X] `gen_quiz_pages.py` exposes `main()`/root argument and never writes at import.

## Dependency Map

- Inputs: current chapter section pages; quiz banks schema v2.
- Runtime consumers: `js/quiz.js`; classic script global environment loaded through `index.html`.
- Persistence consumer: only `js/quiz-state.js` and `js/quiz.js`.
- Generated consumers: `tools/bundle_pages.py`, content manifest, search index in Phase 4.
- Phase dependency: none; Phase 4 consumes all outputs.

## Test Scenario Matrix

| Priority | Scenario | Expected proof |
|---|---|---|
| Critical | Ch1 scope VI → All | Exactly 5 cards; labels `Tất cả (5)` and `Random (5)` |
| Critical | Ch3 scope IV → Random | Exactly 9 cards, not a misleading fixed 10 |
| Critical | Switch I → II → I after answer | I answer/order restored; II state separate |
| Critical | Reload canonical quiz route | Saved mode and scope restored from v2 additive field |
| Critical | Hai tab chọn/làm hai scope khác nhau | Preference cuối cùng thắng; cả hai active-attempt keys và answers vẫn tồn tại |
| High | Old v2 store without `selectedSections` | Reads safely as `{}`; no migration write until state changes |
| High | Malformed section values/store | Sanitized; quiz defaults to all and remains answerable |
| High | Catalog/bank mismatch | Empty sections hidden; bank section without catalog gets Roman fallback |
| High | Keyboard select + mode + answer | Native keys work; focus remains deterministic; live score correct |
| Medium | Three generators run twice | Byte-identical canonical pages; obsolete output absent |
| Medium | Review container caller | Existing `quiz-review-ch*` invocation remains functional |

## Tests Before

1. Extend `tests/quiz-state-migration.test.js` with RED assertions for section selection, scoped count below 10, sanitization and one-write persistence.
2. Extend browser tests with RED expectations for labelled select, section labels/counts, saved scope reload, scope-isolated reset, two-tab different-scope preservation and keyboard operation.
3. Add `tests/quiz-section-catalog.test.js` that fails until `window.CHAPTER_SECTIONS` is generated and matches BC/quiz sections.
4. Add Python generator test using a temp root; assert current script writes wrong filename/import side effects before refactor.

## Refactor

1. Generate catalog from `scan_chapters()`; do not parse breadcrumb strings at runtime.
2. Add `selectedSections` through existing store read/sanitize/commit path; no second localStorage key.
3. Extract small quiz helpers inside `js/quiz.js`: section counts/catalog resolution/scope control. Keep public `window.renderQuiz` signature backward compatible.
4. Refactor quiz page generator to a deterministic function + CLI and canonical filename cleanup.
5. Add scoped styles beside `.quiz-mode`; reuse tokens/target sizes.

## Implementation Steps

1. Write RED unit/browser/generator/catalog tests.
2. Implement and generate `window.CHAPTER_SECTIONS`; verify all 21 section records and route IDs.
3. Add store preference field and strict sanitization; preserve activeAttempts/history shape.
4. Render scope selector before mode buttons; compute counts from selected subset.
5. Implement section-change, mode-change and reset focus/persistence flows.
6. Refactor generator, regenerate three canonical quiz fragments, then remove three stale outputs.
7. Run phase gates; inspect failing assertions rather than weakening counts or accessibility checks.

## Tests After

- Add catalog fallback and corrupt-store cases discovered during GREEN.
- Add one cross-chapter assertion proving saved `ch1` scope cannot affect `ch2`.
- Add one cross-tab assertion proving last-writer preference does not drop attempts/answers for another scope.
- Add one mutation case proving generator/catalog test fails when a section title or runtime filename drifts.

## Regression Gate

```powershell
python -m unittest tests.test_quiz_page_generation
node --test tests/quiz-section-catalog.test.js tests/quiz-state-migration.test.js tests/quiz-bank-schema.test.js
playwright test tests/quiz-browser-render.spec.js tests/quiz-attempt-persistence.spec.js tests/quiz-keyboard-a11y.spec.js
```

## Todo

- [X] Write RED catalog/store/generator/browser tests.
- [X] Generate section catalog from navigation source.
- [X] Persist and sanitize selected section.
- [X] Render accessible scope menu and dynamic counts.
- [X] Fix canonical quiz-page generation and stale outputs.
- [X] Pass unit, file:// browser and keyboard gates.

## Success Criteria

- [X] Ch1–Ch3 each expose Toàn chương plus seven section options with correct titles/counts.
- [X] Section scopes with fewer than 10 questions never claim/render 10.
- [X] Reload/switch/reset preserve isolation and answerability.
- [X] Store v2 data remains backward compatible and atomic.
- [X] Generator owns the three runtime quiz fragments; obsolete quiz filenames are absent.
- [X] No inline handler is introduced in the dynamically rendered controls.

## Risk Assessment

| Risk/assumption | Observable break signal | Pre-decided response |
|---|---|---|
| Generated `window.CHAPTER_SECTIONS` missing/stale | Browser fallback labels appear; catalog parity test fails | Fix `update_nav.py` generation/order and rebuild; never parse BC strings as a second source |
| Additive store field rejected by sanitizer | Reload returns whole chapter despite saved scope | Update one canonical sanitizer/empty-store contract; do not add a second key |
| Generator stale cleanup deletes before canonical write | Missing `trac-nghiem.html` after failure | Write/validate canonical file first; unlink old path only after success |
| Focus jumps on every re-render | Keyboard test lands on body/topbar | Pass explicit focus request per action and test active element |

## Security Considerations

- Catalog/title text is generator-controlled and serialized with JSON escaping.
- Section values are allowlisted before persistence/filtering.
- No `innerHTML` from quiz bank metadata; existing `element().textContent` pattern remains.

## Next Steps

Phase 4 regenerates `js/pages.js`, content manifest and search index after Phases 1–3 are green.
