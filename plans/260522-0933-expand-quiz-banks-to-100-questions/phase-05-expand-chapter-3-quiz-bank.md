---
title: "Phase 05 - Expand Chapter 3 quiz bank"
status: completed
priority: P1
---

# Phase 05 - Expand Chapter 3 quiz bank

## Context Links

- `data/quiz-ch3.json`
- `chapters/ch3/muc-*.html`
- `chapters/ch3/on-tap.html`

## Overview

Tang Ch3 tu 50 len 100 cau. Chapter nay can uu tien cac dinh luat co ban, phuong trinh vi phan, dinh ly tong quat, va cham, va bai tap tinh toan ngan.

## Requirements

- Final count: `100`.
- Target distribution: I:10, II:27, III:11, IV:9, V:14, VI:14, VII:15.
- Bo sung cau phan biet Newton/D'Alembert, bai toan thuan/nguoc, dong luong, mo men dong luong, dong nang, va cham.
- Calculation feedback phai co buoc tinh ngan.

## Architecture

Update `data/quiz-ch3.json` only. Keep quiz engine unchanged.

## Related Code Files

Modify:

- `data/quiz-ch3.json`

Read:

- `chapters/ch3/muc-I*.html`
- `chapters/ch3/muc-II*.html`
- `chapters/ch3/muc-III*.html`
- `chapters/ch3/muc-IV*.html`
- `chapters/ch3/muc-V*.html`
- `chapters/ch3/muc-VI*.html`
- `chapters/ch3/muc-VII*.html`

## Implementation Steps

1. Audit existing Ch3 questions.
2. Add missing items:
   - I: +6 concepts of body/force/reference frame.
   - II: +19 Newton laws, independent action, constraints, D'Alembert basics.
   - III: +5 differential equations in vector/coordinate/natural forms.
   - IV: +4 direct/inverse dynamics.
   - V: +4 theorem mix, if existing V has strong base.
   - VI: +7 collision theory and applications.
   - VII: +5 mixed calculation/review.
3. Verify answer distribution and duplicate stems.
4. Run full quiz validation.

## Todo List

- [x] Build Ch3 slot list by section.
- [x] Add 50 new/adjusted questions.
- [x] Manually verify formulas/numeric answers.
- [x] Run full validation.

## Tests

```powershell
node -e "const q=require('./data/quiz-ch3.json'); console.log(q.length)"
npm run test:quiz
```

Expected after Phase 05: all three data files pass schema/count/distribution tests.

## Success Criteria

- `data/quiz-ch3.json` has 100 valid questions.
- Distribution matches target.
- At least 20 Ch3 questions cover calculation/scenario reasoning.

## Risk Assessment

- Risk: Ch3 section II target is high and may duplicate Newton law phrasing.
- Mitigation: split by law, equation form, frame of reference, constraints, and D'Alembert interpretation.

## Security Considerations

- Plain text only; no HTML injection in data fields.

## Next Steps

- Phase 06 updates UI text, bundle, and browser smoke.
