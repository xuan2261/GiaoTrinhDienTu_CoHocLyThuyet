---
title: "Phase 01 - Quiz schema and RED gates"
status: completed
priority: P1
---

# Phase 01 - Quiz schema and RED gates

## Context Links

- `data/quiz-ch1.json`
- `data/quiz-ch2.json`
- `data/quiz-ch3.json`
- `js/quiz.js`
- `tools/bundle_pages.py`
- `package.json`

## Overview

Tao test fail truoc khi sua data. Phase nay khoa yeu cau 100 cau/chapter va bat cac loi schema/bundle de viec authoring khong dua repo vao trang thai stale.

## Requirements

- Validate count dung `100` cho `ch1`, `ch2`, `ch3`.
- Validate schema cho tung cau.
- Validate duplicate normalized question.
- Validate `section` nam trong allowed matrix.
- Reject `section: "VIII"`; Ch1 legacy calculation questions must be normalized to `VII`.
- Validate `js/pages.js` co `QUIZ_DATA` khop count sau khi bundle.

## Architecture

Them Node test doc file JSON truc tiep, khong can dependency moi:

```js
const fs = require('fs');
const path = require('path');
const assert = require('assert');
```

Browser smoke o Phase 06 moi chay Playwright; Phase 01 chi can static gate nhanh.

## Related Code Files

Modify:

- `tests/quiz-bank-schema.test.js`
- `package.json`

Read:

- `data/quiz-ch*.json`
- `js/pages.js`

## Implementation Steps

1. Tao `tests/quiz-bank-schema.test.js`.
2. Add constants:
   - `EXPECTED_COUNT = 100`
   - `EXPECTED_SECTIONS_BY_CHAPTER` with Ch1 allowed sections `I..VII` only.
   - `TARGET_DISTRIBUTION_BY_CHAPTER`
3. Assert schema:
   - `question` non-empty string.
   - `options` array length 4, all non-empty string.
   - `correct` integer in `0..3`.
   - `section` allowed.
   - `feedbackCorrect` and `feedbackWrong` non-empty.
4. Assert exact count is 100.
5. Assert duplicate normalized stem count is zero.
6. Assert section distribution equals target or at minimum fails with readable diff.
7. Add `test:quiz` script to `package.json`.
8. Run `npm run test:quiz`; expected RED before data expansion.

## Todo List

- [x] Create RED schema/count test.
- [x] Wire `npm run test:quiz`.
- [x] Confirm current repo fails because banks are 50, not 100.
- [x] Keep failure message actionable by chapter/section.

## Tests

```powershell
npm run test:quiz
node --check js\quiz.js
```

Expected after Phase 01 only: `npm run test:quiz` fails on count/distribution; JS syntax still passes.

## Success Criteria

- Test exists and fails for the current 50-question baseline.
- Failure clearly says each chapter has 50/100.
- No runtime behavior changed yet.

## Risk Assessment

- Risk: over-strict section distribution blocks valid content choices.
- Mitigation: make target table explicit in this plan and allow intentional updates only with plan/doc note.

## Security Considerations

- Quiz text is inserted through `innerHTML` in `js/quiz.js`; tests should reject `<script`, `onerror=`, `javascript:` in `question/options/feedback`.

## Next Steps

- Phase 02 builds the exact coverage matrix and authoring rubric used by Phase 03-05.
