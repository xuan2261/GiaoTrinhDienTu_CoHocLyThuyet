# Phase 02 Vendor Three.js Offline

## Context Links

- [Research note](./research/260602-threejs-webgl-offline-research.md)
- [Index script load order](../../index.html)
- [Package scripts](../../package.json)

## Overview

Priority: P1  
Status: Done  
Goal: add Three.js locally without introducing a runtime bundler or network dependency.

## Key Insights

- Current app is script-tag based.
- Three.js modern docs prefer module imports; `OrbitControls` is an addon.
- `file://` module loading must be verified in Playwright, not assumed.

## Requirements

Functional:
- Three.js core and controls load from local files.
- Sim3 modules can import/use Three.js in browser fixtures and `index.html`.
- If Three.js fails to load, Sim2 routes still mount.

Non-functional:
- No CDN required for Three.js.
- No bundler required at runtime.
- Keep added library files isolated under `lib/three/`.

## Architecture

Preferred options in order:

1. Vendor local ES modules:
   - `lib/three/three.module.min.js`
   - `lib/three/addons/controls/OrbitControls.js`
   - use import map or module imports.
2. If direct module imports are awkward under `file://`, create a checked-in local UMD/IIFE wrapper for only APIs used by Sim3.
3. Do not add a build pipeline as part of pilot unless both options fail.

## Related Code Files

Modify:
- `index.html`
- `tests/fixtures/sim2-ch2.html`
- `tests/fixtures/sim2-ch3.html`
- `package.json` only if adding a focused test script is useful

Create:
- `lib/three/...`
- optionally `js/sim3/vendor/three-loader.js`

Delete:
- None

## Implementation Steps

1. Install/fetch Three.js for dev only or copy from `node_modules/three` if dependency is added.
2. Commit only the minimal local runtime files needed for browser use.
3. Add script/module load path to fixtures first.
4. Verify with a tiny Playwright smoke: `window.THREE` or module-backed `window.Sim3Three` is available.
5. Add index load order after Sim2 core or before Sim3 route adapters:
   - Three vendor
   - `js/sim3/core/three-shell.js`
   - route adapters
6. Ensure failure to load Sim3 does not block Sim2 script registration.

## Todo List

- [x] Choose local vendoring method.
- [x] Add local Three.js files.
- [x] Wire fixture load.
- [x] Wire `index.html` load.
- [x] Verify no CDN dependency.

## Success Criteria

- Focused fixture creates a minimal Three scene under `file://`.
- Network disabled still allows tests to mount pilot routes.
- Existing Sim2 tests do not fail due to script load order.

## Risk Assessment

| Risk | Mitigation |
|---|---|
| Large vendor files bloat repo | Keep only core + controls |
| ES module CORS/file issues | Verify in Playwright before route implementation |
| Load failure breaks app | Guard Sim3 feature checks; Sim2 remains independent |

## Security Considerations

- Use official Three.js package/source.
- Do not add remote script URLs.
- Do not execute generated vendor code from unknown source.

## Next Steps

Proceed to Phase 03 after local Three smoke passes.
