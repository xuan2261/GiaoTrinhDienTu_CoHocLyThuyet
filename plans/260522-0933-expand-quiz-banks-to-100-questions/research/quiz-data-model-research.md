---
title: "Quiz data model research"
status: done
---

# Quiz Data Model Research

## Summary

- `data/quiz-ch1.json`, `data/quiz-ch2.json`, `data/quiz-ch3.json` each have 50 questions now.
- Schema is stable: `question`, `options`, `correct`, `section`, `feedbackCorrect`, `feedbackWrong`.
- `js/quiz.js` loads `QUIZ_DATA` first for offline mode, then fallback fetch.
- `tools/bundle_pages.py` embeds JSON into `js/pages.js`.

## Findings

| Area | Finding |
|---|---|
| Count | 50/50/50 current, target 100/100/100 |
| Validation | No current quiz schema/count test |
| Bundle | No freshness gate after JSON changes |
| UI | Quiz pages hardcode "50 cau hoi" |
| Random | Random mode slices 10 questions |

## Recommendations

- Add `npm run test:quiz` static schema/count/duplicate/bundle gate.
- Add browser smoke after data expansion.
- Keep JSON + static bundle architecture.

## Unresolved Questions

- None.
