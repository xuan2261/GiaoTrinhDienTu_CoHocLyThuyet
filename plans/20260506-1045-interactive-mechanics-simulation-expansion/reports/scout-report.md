---
type: report
topic: codebase-scout
created: 2026-05-06
---

# Codebase Scout Report

## Summary

Repo là static textbook offline-first. Simulation hiện inject sau fragment load qua `loader.js:initSimulations()`, mapping route trong `window.SIM_MAP`. Có 18 sims trong `js/simulations.js`. File này đã quá lớn, nên expansion cần runtime foundation trước.

## Relevant Files

| File | Role | Plan Impact |
|---|---|---|
| `index.html` | script load order | add new simulation modules if split |
| `js/loader.js` | route load + simulation hook | keep API compatible |
| `js/simulations.js` | current all-in-one sims + SIM_MAP | refactor to registry/compat |
| `css/style.css` | simulation styles | consolidate duplicate `.sim-*` styles |
| `js/quiz.js` | quiz engine | keep independent; add micro activity separately |
| `js/pages.js` | generated bundle | do not edit |
| `tools/audit.py` | content audit | run each phase |
| `docs/*.md` | standards/architecture | update after implementation |

## Current Sim Routes

Ch1: `ch1-1-4`, `ch1-1-6`, `ch1-2-3`, `ch1-3-3`, `ch1-4-4`, `ch1-6-2`.

Ch2: `ch2-1-1`, `ch2-1-3`, `ch2-2-2`, `ch2-3-2`, `ch2-4-3`, `ch2-5-1`.

Ch3: `ch3-2-2`, `ch3-2-3`, `ch3-4-1`, `ch3-5-2`, `ch3-5-4`, `ch3-6-2`.

## Constraints

| Constraint | Decision |
|---|---|
| No package manager | No new npm flow |
| `file://` support | Script tags, no dynamic import |
| DOCX source of truth | No hand-edit generated fragments |
| Generated `js/pages.js` | Regenerate only when fragment/data changes |
| File size rule | Split simulation code before adding many sims |
| Existing localStorage keys | Add namespaced new key only |

## Verification Surface

Minimum per phase:

```powershell
node --check js\app.js
node --check js\loader.js
node --check js\quiz.js
node --check js\progress.js
node --check js\glossary.js
node --check js\notes.js
node --check js\simulations.js
python -m compileall -q tools
python tools\audit.py
```

Add new JS files to `node --check` as created.

## Unresolved Questions

- No git repo detected in this directory; branch metadata set to `none`.
