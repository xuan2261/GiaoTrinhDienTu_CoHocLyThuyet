# Phase 10 Full QA Docs And Release Handoff

## Context Links

- [Plan](./plan.md)
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\system-architecture.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\code-standards.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-roadmap.md`
- `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-changelog.md`

## Overview

Priority: P1. Status: Complete. Validate entire expanded simulation system, update docs, and prepare release handoff.

## Key Insights

- Full app must still open offline and by `file://`.
- Docs must reflect any module split and new activity state key.
- Generated files policy still applies.

## Requirements

| Type | Requirement |
|---|---|
| Functional | All registered sim routes render |
| Functional | Quiz/progress/notes/glossary still work |
| Functional | Search/sidebar/page nav unaffected |
| Non-functional | Syntax/audit pass |
| Non-functional | Desktop/mobile/file QA pass |
| Docs | Update architecture, standards, roadmap, changelog |

## Architecture

Final runtime:

`index.html` loads app/core -> pages -> loader -> feature modules -> sim modules. `loader.js` calls `window.SIM_MAP[currentPageId]` unchanged.

## Related Code Files

| Action | File |
|---|---|
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\system-architecture.md` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\code-standards.md` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-roadmap.md` |
| Modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\project-changelog.md` |
| Optional modify | `D:\NCKH_2025\GiaoTrinhDienTu_CoHocLyThuyet\docs\deployment-guide.md` |

## Implementation Steps

1. Run full syntax checks for all JS.
2. Run Python compile/audit.
3. Run strict equation audit if DOCX/bundle touched.
4. Smoke home, search, quiz, progress, notes, glossary.
5. Smoke all simulation routes desktop.
6. Smoke P1 simulation routes mobile widths 375 and 768.
7. Smoke `file://` load.
8. Update docs and changelog.
9. Produce QA report in plan `reports/`.

## Todo List

- [x] Full `node --check` pass.
- [x] Full `python tools\audit.py` pass.
- [x] Browser smoke: desktop.
- [x] Browser smoke: mobile.
- [x] Browser smoke: `file://`.
- [x] Docs updated.
- [x] QA report written.

## Completion Notes

- QA report: [P1 Simulation Expansion QA Report](./reports/p1-simulation-expansion-qa-report.md).
- Chrome headless `file://` smoke passed 58 registered simulation routes across 1280x900, 375x812, 768x1024.

## Tests And Verification

```powershell
node --check js\app.js
node --check js\loader.js
node --check js\quiz.js
node --check js\progress.js
node --check js\glossary.js
node --check js\notes.js
node --check js\sim-core.js
node --check js\sim-statics.js
node --check js\sim-kinematics.js
node --check js\sim-dynamics.js
node --check js\sim-activities.js
node --check js\simulations.js
python -m compileall -q tools
python tools\audit.py
```

If generated content changed:

```powershell
python tools\bundle_pages.py
python tools\audit.py --strict-equations
```

Manual verify:

- No console errors.
- No blank canvas.
- Canvas controls usable by touch.
- Page nav remains below simulations.
- Print view not broken.

## Success Criteria

- Full app passes validation.
- Docs reflect final architecture.
- Release handoff includes exact remaining backlog: P2/P3 routes not implemented.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Late QA finds broad regression | Phase gates should catch earlier; isolate by module |
| Docs drift | Update docs only after final code shape known |

## Security Considerations

Check no external scripts, no secrets, no telemetry.

## Next Steps

Run cook handoff or archive plan after completion.
