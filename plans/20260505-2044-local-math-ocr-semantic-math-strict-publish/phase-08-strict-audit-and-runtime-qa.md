---
title: "Phase 08 - Strict Audit And Runtime QA"
status: complete
priority: P1
effort: 4h
---

# Phase 08 - Strict Audit And Runtime QA

## Context Links

- `tools/audit.py`
- `index.html`
- `js/loader.js`
- `lib/katex/`
- `chapters/`
- `js/pages.js`

## Overview

Run full compile/audit suite and browser runtime checks for semantic math output.

## Key Insights

- `audit.py --strict-equations` is required but not enough.
- KaTeX render can fail at runtime even if mapping JSON validates.
- Must check offline bundle path and `file://` behavior.

## Requirements

Functional:
- JS syntax checks pass.
- Python tools compile.
- Normal audit pass.
- Strict equation audit pass.
- Runtime sample pages render formulas.

Non-functional:
- No console errors from KaTeX on sample pages.
- Mobile/desktop layout does not overflow badly.

## Architecture

```text
static files -> syntax checks -> audit -> browser QA -> code review gate
```

## Related Code Files

Modify:
- Only if audit reveals actual bugs.

Create:
- `plans/.../reports/runtime-qa-report.md`.

Delete:
- None.

## Implementation Steps

1. JS syntax:
   ```powershell
   node --check js\app.js
   node --check js\loader.js
   node --check js\pages.js
   node --check js\quiz.js
   node --check js\progress.js
   node --check js\glossary.js
   node --check js\notes.js
   node --check js\simulations.js
   ```
2. Python compile:
   ```powershell
   python -m compileall -q tools
   ```
3. Audit:
   ```powershell
   python tools\audit.py
   python tools\audit.py --strict-equations
   ```
4. Runtime quick server:
   ```powershell
   python -m http.server 8000
   ```
5. Browser sample pages:
   - `ch1-1-4` moment formulas.
   - `ch1-5-3` friction formulas.
   - `ch2-2-2` rotation formulas.
   - `ch2-7-1` exercise-heavy formulas.
   - `ch3-5-2` momentum formulas.
   - `ch3-6-3` collision formulas.
6. Open `index.html` directly by file path to test offline bundle.
7. Delegate code-reviewer after any code/script changes in implementation.

## Todo List

- [x] Run all JS syntax checks.
- [x] Run Python compile.
- [x] Run normal audit.
- [x] Run strict equation audit.
- [x] Browser QA sample pages.
- [x] Check console for KaTeX warnings/errors.
- [x] Record automated QA in debug report.
- [x] Run code-reviewer if implementation changed code, or document fallback local review when subagent capacity blocks review.

## Success Criteria

- All automated checks pass.
- Browser loads from static server and `file://`.
- No equation image fallback remains.
- No severe formula overflow in sampled desktop/mobile views.

## Test And Validation

Automated:
```powershell
node --check js\pages.js
python -m compileall -q tools
python tools\audit.py
python tools\audit.py --strict-equations
```

Manual:
- Visual compare image fallback before/after for 20 sample formulas.
- Check search/sidebar still works.
- Check quiz/progress modules still initialize.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Strict audit passes but formula visually wrong | Manual sample and second pass |
| KaTeX unsupported commands | Fix mapping row or use MathML |
| Mobile overflow | Add CSS only if real issue appears |

## Security Considerations

- Ensure mapping LaTeX is escaped in generated HTML.
- Validator rejects `<script` in LaTeX.

## Next Steps

Proceed to docs sync after runtime QA pass.
