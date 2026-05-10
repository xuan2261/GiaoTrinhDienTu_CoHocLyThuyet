---
phase: 1
title: "Environment Setup"
status: completed
priority: P1
effort: "2h"
dependencies: []
---

# Phase 01: Environment Setup

## Overview
Clean up the legacy simulation codebase and introduce the required third-party libraries (Matter.js and Chart.js) into the offline environment.

## Requirements
- Functional: All legacy simulation scripts must be removed or moved to `Old/`/`deprecated/`.
- Non-functional: Libraries must be downloaded locally to `lib/` to support offline-first mode. No npm/webpack build step required for runtime.

## Architecture
N/A - Setup phase.

## Related Code Files
- Backup To: `backups/20260510-legacy-5-layer-sim-arch/`
- Move from `js/`: `physics/`, `render/`, `interaction/`, `animation/`, `scene/`, `sims/`
- Move from `js/`: `sim-*.js` legacy files
- Create: `lib/matter.min.js`, `lib/chart.umd.js` (or similar bundled version)

## Implementation Steps
1. Create a dedicated backup directory: `backups/20260510-legacy-5-layer-sim-arch/`.
2. Move (not delete) the legacy 5-layer architecture directories (`physics`, `render`, `interaction`, `animation`, `scene`) from `js/` to the backup directory.
3. Move the legacy standalone simulation scripts (e.g., `js/sim-professional-lab.js`, `js/sim-statics.js`, etc.) to the backup directory.
4. Download `matter.js` (minified) and save it to `lib/matter.min.js`.
5. Download `chart.js` (UMD version) and save it to `lib/chart.umd.js`.
6. Update `index.html` to remove old script tags and add `<script src="lib/matter.min.js"></script>` and `<script src="lib/chart.umd.js"></script>`.

## Success Criteria
- [x] Legacy directories are moved to `backups/`.
- [x] `js/` directory is clean of legacy 5-layer modules.
- [x] `lib/matter.min.js` exists and is loadable.
- [x] `lib/chart.umd.js` exists and is loadable.
- [x] `index.html` runs without 404s for the new libs.

## Risk Assessment
- Risk: Breaking the entire site temporarily.
- Mitigation: This is a 100% rewrite, so breakage is expected. Ensure `index.html` still loads the shell (sidebar, navigation, basic quiz) without JS errors.
