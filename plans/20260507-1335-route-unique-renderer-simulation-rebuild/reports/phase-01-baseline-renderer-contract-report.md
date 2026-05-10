---
title: "Phase 01 Baseline Renderer Contract Report"
type: validation
created: 2026-05-07
---

# Phase 01 Baseline Renderer Contract Report

## Commands

```powershell
python -m py_compile tools\smoke_simulation_renderer_contract.py
node --check tests\simulation-browser.spec.js
node -e "JSON.parse(require('fs').readFileSync('package.json','utf8')); console.log('package-json: PASS')"
python tools\smoke_simulation_renderer_contract.py --report-current --expect-fail --require-routes 58
```

## Result

- Syntax checks: PASS.
- `SIM_MAP` routes: 58.
- Scene catalog routes: 58.
- Renderer registry: missing.
- Renderer registrations: 0.
- Family dispatch: yes.
- Family renderer groups: 14.
- Baseline strict renderer contract: EXPECTED FAIL.

## Root Causes Captured

- `window.SimRouteRenderers` is not defined.
- 58 routes missing dedicated renderer registrations.
- `SimSceneTemplates.renderScene()` still selects final renderer by `scene.family`.
- Routes missing `rendererId`, named renderer functions, and renderer body hashes.

## Unresolved Questions

None.
