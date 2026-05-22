---
title: "Phase 03 - Expand Chapter 1 quiz bank"
status: completed
priority: P1
---

# Phase 03 - Expand Chapter 1 quiz bank

## Context Links

- `data/quiz-ch1.json`
- `chapters/ch1/muc-*.html`
- `chapters/ch1/on-tap.html`

## Overview

Tang Ch1 tu 50 len 100 cau. Day la chuong Tinh hoc, can bo sung manh cac section dang thieu: he luc khong gian, ma sat, va bai tap tong hop.

## Requirements

- Final count: `100`.
- Target distribution: I:12, II:9, III:9, IV:18, V:32, VI:5, VII:15.
- Normalize all existing legacy `VIII` questions to `VII`; `VIII` must not remain in final Ch1 data.
- Them cau hoi tinh toan ngan co feedback giai thich cong thuc.

## Architecture

Update truc tiep `data/quiz-ch1.json`. Khong sua `js/quiz.js`. Khong sua `js/pages.js` trong phase nay.

## Related Code Files

Modify:

- `data/quiz-ch1.json`

Read:

- `chapters/ch1/muc-I*.html`
- `chapters/ch1/muc-II*.html`
- `chapters/ch1/muc-III*.html`
- `chapters/ch1/muc-IV*.html`
- `chapters/ch1/muc-V*.html`
- `chapters/ch1/muc-VI*.html`
- `chapters/ch1/muc-VII*.html`

## Implementation Steps

1. Normalize existing Ch1 questions to target section labels, including `VIII -> VII`.
2. Preserve good existing questions; do not rewrite for style only.
3. Add missing questions by section:
   - I: +4 concept/formula basics.
   - II: +1 focused law/edge case.
   - III: +2 link/reaction model comparisons.
   - IV: +13 he luc khong gian, thu gon, PTCB variants.
   - V: +27 ma sat, tu ham, ma sat lan, bai tap co ma sat.
   - VI: keep 5 if already sufficient, or replace weak items.
   - VII: +9 tong hop tinh toan.
4. Ensure each added item has 4 plausible options.
5. Run schema test; it should still fail until all chapters are 100 unless test supports per-file focus.

## Todo List

- [x] Audit existing Ch1 50 questions for duplicates/weak feedback.
- [x] Decision locked: migrate `VIII` to `VII`.
- [x] Add/adjust questions to hit target count.
- [x] Validate JSON formatting.
- [x] Run focused Ch1 validation.

## Tests

```powershell
node -e "const q=require('./data/quiz-ch1.json'); console.log(q.length)"
npm run test:quiz
```

Expected after Phase 03: Ch1 passes count/schema; Ch2/Ch3 may still fail until later phases.

## Success Criteria

- `data/quiz-ch1.json` has 100 valid questions.
- Ch1 has no duplicate normalized question.
- Ch1 section distribution matches target.
- New questions cite concepts present in current Ch1 fragments.

## Risk Assessment

- Risk: overloading Ch1 section V because matrix assigns 32 questions.
- Mitigation: split section V into concept, law, self-locking, calculation, and practical diagnosis buckets.

## Security Considerations

- Reject HTML/script-like text in quiz JSON.
- Keep feedback concise and plain text.

## Next Steps

- Phase 04 expands Chapter 2.
