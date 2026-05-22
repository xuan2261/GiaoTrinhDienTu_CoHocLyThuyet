---
title: "Phase 04 - Expand Chapter 2 quiz bank"
status: completed
priority: P1
---

# Phase 04 - Expand Chapter 2 quiz bank

## Context Links

- `data/quiz-ch2.json`
- `chapters/ch2/muc-*.html`
- `chapters/ch2/on-tap.html`

## Overview

Tang Ch2 tu 50 len 100 cau. Chapter nay can phu deu dong hoc chat diem, chuyen dong co ban vat ran, truyen dong, hop chuyen dong, chuyen dong song phang, va quay quanh diem co dinh.

## Requirements

- Final count: `100`.
- Target distribution: I:15, II:11, III:10, IV:14, V:24, VI:11, VII:15.
- Tang ty le cau tinh toan dao ham, van toc/gia toc, banh rang/dai, Coriolis, TVTTT.
- Feedback sai phai chi ro cong thuc dung hoac nham lan thuong gap.

## Architecture

Update `data/quiz-ch2.json` only. Avoid code changes unless Phase 01 test reveals schema issue.

## Related Code Files

Modify:

- `data/quiz-ch2.json`

Read:

- `chapters/ch2/muc-I*.html`
- `chapters/ch2/muc-II*.html`
- `chapters/ch2/muc-III*.html`
- `chapters/ch2/muc-IV*.html`
- `chapters/ch2/muc-V*.html`
- `chapters/ch2/muc-VI*.html`
- `chapters/ch2/muc-VII*.html`

## Implementation Steps

1. Audit existing Ch2 questions and preserve valid coverage.
2. Add missing items:
   - I: +5 trajectory/coordinate/natural coordinate/calculation.
   - II: +3 translation/rotation/angular acceleration.
   - III: +5 belt/gear transmission cases.
   - IV: +8 relative motion and Coriolis cases.
   - V: +16 plane motion, velocity relation, TVTTT, slider-crank.
   - VI: +6 Euler angles/instantaneous axis.
   - VII: +7 mixed calculation/review.
3. Balance answer index distribution; avoid always `correct: 0`.
4. Validate schema and duplicates.

## Todo List

- [x] Build Ch2 slot list by section.
- [x] Add 50 new/adjusted questions.
- [x] Check calculation answers manually.
- [x] Run Ch2 validation.

## Tests

```powershell
node -e "const q=require('./data/quiz-ch2.json'); console.log(q.length)"
npm run test:quiz
```

Expected after Phase 04: Ch1/Ch2 pass count/schema; Ch3 may still fail.

## Success Criteria

- `data/quiz-ch2.json` has 100 valid questions.
- Distribution matches target.
- At least 20 Ch2 questions require formula use or scenario reasoning.

## Risk Assessment

- Risk: Coriolis and TVTTT distractors can become mathematically ambiguous.
- Mitigation: use short numeric examples and explicit direction wording.

## Security Considerations

- Plain text only in JSON values.

## Next Steps

- Phase 05 expands Chapter 3.
