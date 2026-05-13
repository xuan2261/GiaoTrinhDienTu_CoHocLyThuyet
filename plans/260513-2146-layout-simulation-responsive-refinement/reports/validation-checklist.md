# Validation Checklist

## Summary

Critical questions for plan readiness. Answers are based on current repo context and brainstorm decision.

## Questions

| Question | Answer |
|---|---|
| What exactly changes? | Scoped simulation width + compact topbar responsive CSS/tests/docs |
| What must not change? | Reading content width, canvas logical size `760x440`, route renderer/behavior contracts, offline `file://` support |
| Which files are likely touched? | `css/style.css`, tests, docs; `js/loader.js` only if class hook needed |
| Is a framework/build step needed? | No |
| Are route-specific simulation files touched? | No |
| How will success be verified? | Width/overflow/topbar tests, Playwright responsive, visual-quality, runtime smoke, screenshots |
| What is the highest risk? | CSS leakage into reading pages or horizontal overflow |
| Is the plan over-engineered? | No if fullscreen/modal/search toggle JS is avoided |

## Acceptance Gates

- [x] Phase 01 baseline report exists.
- [x] Phase 02 tests written before CSS implementation.
- [x] Phase 03 passes layout tests.
- [x] Phase 04 passes topbar tests.
- [x] Phase 05 passes mobile/touch tests.
- [x] Phase 06 docs synced.
- [x] Phase 07 full verification report complete.

## Recommended Commands

```powershell
npx playwright test tests/simulation-browser.spec.js --grep "@responsive"
npx playwright test tests/simulation-interaction-engine.spec.js --grep "@touch"
npm run test:sim:visual-quality
python tools\smoke_simulation_runtime.py --expect-runtime-routes 58 --check-mount-rollback --check-listener-cleanup --check-raf-cleanup
python tools\audit.py
```

## Unresolved Questions

- Exact `max-width` for widened simulation should be selected after baseline screenshots.
- Decide whether `layout_hientai.md` remains snapshot or living doc.
