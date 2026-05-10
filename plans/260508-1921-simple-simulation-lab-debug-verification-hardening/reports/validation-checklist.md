---
title: "Validation Checklist - Simple Lab Debug Verification"
type: validation-report
created: 2026-05-08
---

# Validation Checklist

## Acceptance Checklist

| Check | Required Evidence |
|---|---|
| Shell has one visible `.sim-header` per lab | Browser DOM/test assertion |
| Legacy `.sim-info` hidden but readout still testable | Browser/unit regression |
| No `Điểm kiểm tra` / checkpoint panel | Grep + browser localization tests |
| `ch2-1-1` preset buttons update canvas/readout | Agent-browser screenshots + direct Playwright |
| `ch2-1-2` graph drag updates readout | Agent-browser screenshots + direct Playwright |
| `ch3-5-3` radius drag updates `L` | Agent-browser screenshots + direct Playwright |
| `ch3-6-2` ball drag updates momentum | Agent-browser screenshots + direct Playwright |
| 58 routes mount | `test:sim:browser:route-mount` or release gate |
| Visual quality bounded | `npm run test:sim:visual-quality` |
| Final release gate passes | `npm run test:sim:release` |

## Command Gates

```powershell
node --check js\sim-lab-ui.js
npm run test:sim:unit
npm run test:sim:quality
npm run test:sim:semantic
npm run test:sim:visual-quality
python tools\smoke_simulation_runtime.py --expect-globals SimCore,SimMath,SimRender,SimInteractions,SimLabUI,SimProfessionalLab,SimRouteRenderers,SimRouteBehaviors --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup
python tools\audit.py
npm run test:sim:browser
npm run test:sim:release
```

## Manual Browser Evidence

Store screenshots in `plans/260508-1435-simple-simulation-lab-assessment-removal/reports/` or this plan `reports/`, using names:

- `agent-browser-ch2-1-1-after-tron.png`
- `agent-browser-ch2-1-1-after-parabol.png`
- `agent-browser-ch2-1-2-after-drag.png`
- `agent-browser-ch3-5-3-after-radius-drag.png`
- `agent-browser-ch3-6-2-after-ball-drag.png`

## Unresolved Questions

None.
