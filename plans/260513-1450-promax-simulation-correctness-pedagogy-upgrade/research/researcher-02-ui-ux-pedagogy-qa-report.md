# Researcher 02 UI UX Pedagogy QA Report

## Summary

UI/UX Pro Max guidance says highest priority is accessibility, touch/interaction, performance, layout, typography/color. For this project, adopt the rules, not the suggested playful `Claymorphism` skin. Keep academic `dark navy + gold`, chapter accents, compact professional lab.

## Findings

| UX Topic | Recommendation | Reason |
|---|---|---|
| Visual style | Keep academic dark navy/gold | Matches docs and giáo trình tone |
| Typography | Keep system UI; optional future Vietnamese font only if bundled local | Offline-first, avoid CDN dependency |
| Interaction | Direct manipulation + visible fallback controls | Touch and keyboard support already required |
| Accessibility | Preserve focus ring, `aria-live`, `aria-describedby`, reduced motion | Current shell already has hooks |
| Charts | Add mini graph only where time-series matters | Avoid heavy chart dependency, use Canvas/SVG primitives |
| Pedagogy | Add observation/action/check modes gradually | Better learning value than decorative motion |

## Recommended UX Upgrade

1. Add `Promax Lab Contract` to every pilot route:
   - objective visible.
   - formula live.
   - readout tied to current formula.
   - route-owned handles labeled.
   - challenge state optional.
2. Add diagnostic toggles:
   - components.
   - FBD.
   - graph.
   - error band.
3. Keep controls 44px+, no icon-only without labels, no emoji as structural icons.
4. Add visual QA for 375px, 768px, 1024px, 1440px, dark/light, reduced motion.

## Anti-Patterns

- Do not add cyberpunk/neon or playful rounded clay style.
- Do not add full-screen immersive hero style inside textbook content.
- Do not show graphs on every route.
- Do not add new persistent assessment storage until checker model is stable.

## Unresolved Questions

- None blocking planning.
