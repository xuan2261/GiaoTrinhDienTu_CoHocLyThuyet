---
title: "Phase 6: Nâng cấp đánh giá và lưu tiến trình"
status: pending
priority: P0
effort: "6-8 ngày"
dependencies: [phase-03]
---

# Phase 6: Nâng cấp đánh giá và lưu tiến trình

## Overview

Migrate quiz bank/runtime sang schema v2 tương thích v1: stable IDs, LO/difficulty/type/source metadata, deterministic selection, attempt lifecycle, restore/history và semantic keyboard controls.

## Requirements

- Ba bank 100 câu giữ nguyên nội dung/correctness trừ thay đổi được review.
- Mỗi item có ID ổn định, chapter/section, LO refs, difficulty, type, sourceRef, explanation/feedback.
- Random mode dùng seed; restore cùng attempt không đổi câu/thứ tự.
- State versioned, tolerant với corrupt/legacy `quizScores`, bounded history và quota failure.
- Option là native control hoặc radio semantics; feedback/score có live status.
- Không coupling LMS; Phase 11 chỉ consume canonical assessment export.

## Architecture

`loadQuizData -> normalize v1/v2 -> select(seed) -> attempt state machine -> render semantic controls -> persist namespace chlyt_quiz_attempts`. Generated `QUIZ_DATA` vẫn do `tools/bundle_pages.py` phát sinh.

## Related Code Files

- Modify: `data/quiz-ch1.json`, `data/quiz-ch2.json`, `data/quiz-ch3.json`, `js/quiz.js`, `css/style.css`, `package.json`.
- Generated: `js/pages.js`; regenerate only.
- Tests: extend `tests/quiz-bank-schema.test.js`, `tests/quiz-browser-render.spec.js`; create `tests/quiz-state-migration.test.js`, `tests/quiz-attempt-persistence.spec.js`, `tests/quiz-keyboard-a11y.spec.js`.

## State Contract

Attempt: `attemptId`, schemaVersion, chapter/mode/section, seed, questionIds/order, answersByQuestionId, started/completed timestamps, elapsed, correct/wrong/percent/passPolicyRef, status. History cap and retention policy must be explicit; no learner PII.

## Tests Before

1. Prove same random mode reload can yield different 10 questions.
2. Prove current state stores aggregate only and cannot restore selected answers.
3. Prove corrupt `quizScores`/localStorage failure paths.
4. Tab to `.q-opt`; confirm click-only DIV and no live feedback semantics.

## Implementation Steps

1. **RED:** v2 schema/stable-ID/LO-ref/duplicate tests while preserving explicit v1 fixture support.
2. **RED:** seeded selection, lifecycle, corrupt storage, quota and migration tests.
3. Define canonical item/envelope schema; migrate banks with reviewer-visible diff.
4. Implement normalization and deterministic PRNG/selection; do not use `Math.random()` for resumable attempts.
5. Implement versioned storage, lazy migration, bounded history, atomic write and graceful disable message.
6. Replace option DIVs with semantic controls; group/label questions and announce scoped feedback.
7. **GREEN:** restore attempt across reload/file:// and finalize reproducible score/timing.
8. **Refactor:** retire legacy `checkAns/updateScore/resetQuiz` only after all callers/tests migrate; clean cutover, no aliases.

## Tests After

- `node --test tests/quiz-bank-schema.test.js tests/quiz-state-migration.test.js`.
- `npx playwright test tests/quiz-browser-render.spec.js tests/quiz-attempt-persistence.spec.js tests/quiz-keyboard-a11y.spec.js`.
- `python tools/bundle_pages.py` followed by bundle equality test.
- Existing `npm run test:quiz` and `npm run test:quiz:browser`.

## Todo

- [ ] Record quiz metadata vocabulary and pass policy.
- [ ] Add stable IDs and LO mappings.
- [ ] Add deterministic attempt/state migration.
- [ ] Convert UI to semantic keyboard controls.
- [ ] Regenerate bundle and verify all 300 items.

## Success Criteria

- 300/300 items validate, IDs unique/stable and joins resolve.
- Same seed produces identical question/order set.
- In-progress attempt survives reload; completed attempt has reproducible outcome and bounded history.
- Legacy/corrupt storage does not crash or lose current UI availability.
- Keyboard/screen-reader user can complete, review and reset quiz.

## Risk Assessment

- Data migration changes answer meaning: require item-by-item structural diff and existing answer distribution tests.
- localStorage quota/cross-tab: bounded history, last-write metadata and visible fallback.
- Privacy: no name/email/device fingerprint; document retention and clear action.

## Next Steps

Phase 8 audits quiz accessibility; Phase 11 exports canonical items to LMS formats.