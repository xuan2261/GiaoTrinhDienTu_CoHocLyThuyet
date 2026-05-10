---
title: "Phase 05 - All-Route Agent-Browser QA Matrix"
status: completed
priority: P1
effort: 3h
---

# Phase 05 - All-Route Agent-Browser QA Matrix

## Context Links

- [Agent-browser core skill evidence](../260508-1435-simple-simulation-lab-assessment-removal/reports/validation-report.md#agent-browser-evidence)
- [Validation Checklist](./reports/validation-checklist.md)

## Overview

Use `ck:agent-browser` for live browser verification of high-risk and representative routes. Automated Playwright covers all routes; agent-browser supplies human-readable evidence.

## Key Insights

- `agent-browser` can need daemon reset on Windows.
- Screenshots are more durable than raw session logs.
- Manual checks should target risk, not duplicate all 58 automated routes.

## Requirements

- Verify route shell visible and DeCuong-like: header, central canvas, compact controls, readout cards, hint.
- Verify no visible checkpoint/assessment panel.
- Verify interactions on known-risk routes.
- Save screenshots in report folder with stable names.

## Architecture

Manual matrix:

| Group | Routes |
|---|---|
| Ch2 presets/graph | `ch2-1-1`, `ch2-1-2` |
| Ch3 theorem/collision | `ch3-5-3`, `ch3-6-2` |
| Baseline smoke by chapter | `ch1-1-4`, `ch1-5-3`, `ch2-4-4`, `ch3-3-1` |

## Related Code Files

- Modify: none unless browser shows regression.
- Evidence output: `plans/260508-1435-simple-simulation-lab-assessment-removal/reports/agent-browser-*.png` or this plan `reports/`.

## Implementation Steps

1. Start or confirm static server at `http://127.0.0.1:8000/`.
2. Reset stale `agent-browser` daemon if click/eval fails.
3. Navigate to each route hash.
4. Scroll simulation into view.
5. Perform click/drag where applicable.
6. Save screenshot before/after for each high-risk interaction.

## Todo List

- [x] Confirm server returns `200`.
- [x] Open `ch2-1-1`, click presets, save screenshots.
- [x] Open `ch2-1-2`, drag graph cursor, save screenshots.
- [x] Open `ch3-5-3`, pause and drag radius, save screenshots.
- [x] Open `ch3-6-2`, pause and drag ball, save screenshots.
- [x] Check representative baseline route shell.

## Verification & Tests

```powershell
agent-browser --session simqa open http://127.0.0.1:8000/index.html#ch2-1-1
agent-browser --session simqa wait --load networkidle
agent-browser --session simqa screenshot plans\260508-1435-simple-simulation-lab-assessment-removal\reports\agent-browser-ch2-1-1-lab.png
agent-browser --session simqa close
```

Fallback if daemon stale:

```powershell
agent-browser doctor --offline --quick
```

Expected evidence:

- Screenshots show changed canvas/readout after interaction.
- No browser-visible checkpoint panel.

## Success Criteria

- At least five screenshots cover before/after risk routes.
- Manual evidence matches automated test claims.
- Any browser-only issue becomes a new Phase 02-04 fix, not ignored.

## Risk Assessment

- Risk: browser scroll coordinate mismatch.
- Mitigation: save screenshots after each action and visually inspect.

## Security Considerations

- Do not use real external sites or credentials.
- Stay on local `127.0.0.1` target URL.

## Next Steps

Proceed to automated full gate consolidation.

## Execution Result

Completed 2026-05-08. Existing agent-browser screenshots cover the high-risk matrix, and automated browser gate passed `211 passed, 1 skipped` after code hardening.

## Unresolved Questions

None.
