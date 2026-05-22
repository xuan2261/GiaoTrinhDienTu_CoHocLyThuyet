---
title: "Phase 06 - Quiz pages, bundle, browser smoke"
status: completed
priority: P1
---

# Phase 06 - Quiz pages, bundle, browser smoke

## Context Links

- `chapters/ch1/trac-nghiem.html`
- `chapters/ch2/trac-nghiem.html`
- `chapters/ch3/trac-nghiem.html`
- `tools/gen_quiz_pages.py`
- `tools/bundle_pages.py`
- `js/pages.js`
- `js/quiz.js`

## Overview

Dong bo learner-facing UI tu "50 cau" thanh "100 cau", regenerate offline bundle, va them browser smoke de dam bao all/random mode render dung sau khi bank lon hon.

## Requirements

- Quiz pages show `100 cau hoi`.
- All mode renders 100 cards per chapter.
- Random mode remains 10 cards.
- Offline `QUIZ_DATA` in `js/pages.js` matches JSON files.
- `js/pages.js` regenerated, not edited manually.

## Architecture

Keep `js/quiz.js` behavior. Update HTML fragments and generator if still useful:

- Fix `tools/gen_quiz_pages.py` hardcoded Windows path before reusing, or do direct fragment edit with follow-up note.
- Run `python tools\bundle_pages.py`.

## Related Code Files

Modify:

- `chapters/ch1/trac-nghiem.html`
- `chapters/ch2/trac-nghiem.html`
- `chapters/ch3/trac-nghiem.html`
- `chapters/ch*/on-tap-trac-nghiem.html` if they are still routed/used
- `tools/gen_quiz_pages.py` if keeping generator
- `tests/quiz-browser-render.spec.js`
- `package.json`
- `js/pages.js` generated

Read:

- `js/loader.js`
- `js/pages.js`

## Implementation Steps

1. Update quiz fragment text from 50 to 100.
2. Fix generator hardcoded count/path or mark it legacy if not used.
3. Run `python tools\bundle_pages.py`.
4. Add Playwright spec:
   - open `ch1-quiz`, `ch2-quiz`, `ch3-quiz`.
   - assert all mode `.q-card` count is 100.
   - click random, assert `.q-card` count is 10.
   - assert score total initially `0/100` and random `0/10`.
   - assert random button text still communicates `Random (10)`.
5. Add `test:quiz:browser` script.
6. Run browser smoke.

## Todo List

- [x] Update visible quiz page count.
- [x] Regenerate `js/pages.js`.
- [x] Add browser smoke.
- [x] Verify `file://` mode through Playwright smoke.

## Tests

```powershell
python tools\bundle_pages.py
node --check js\pages.js
npm run test:quiz
npm run test:quiz:browser
python tools\audit.py
```

## Success Criteria

- Browser all mode renders 100 questions for each chapter.
- Browser random mode renders 10 questions for each chapter.
- Offline bundle has 100 questions per `QUIZ_DATA["quiz-ch*.json"]`.
- Audit passes.

## Risk Assessment

- Risk: Rendering 100 cards may be long on mobile.
- Mitigation: browser smoke checks render; defer pagination unless performance issue is observed.

## Security Considerations

- Existing `js/quiz.js` uses `innerHTML`; schema test from Phase 01 must block unsafe HTML-like input.

## Next Steps

- Phase 07 final QA and docs sync.
