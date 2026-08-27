---
phase: 3
title: "Visual system and slide templates"
status: pending
priority: P1
date: 2026-08-27
dependencies: [2]
---

# Phase 03: Visual system and slide templates

## Context links
- [Plan overview](plan.md)
- [Phase 02 slide map](phase-02-story-architecture-and-slide-map.md)
- [Design research](research/design-research.md)
- [Repository scout](research/repo-scout.md)
- Next: [Phase 04](phase-04-deck-authoring-and-speaker-notes.md)

## Overview
| Field | Value |
|---|---|
| Date | 2026-08-27 |
| Priority | P1 |
| Status | pending |
| Objective | Encode a restrained 16:9 “Hồ sơ Hải quân” system before composing slides. |

The system connects navy candidate captures with paper evidence pages. It prioritizes projector readability, academic restraint and provenance over decoration.

## Key Insights
- Use 65–75% paper/light slides and 25–35% navy slides; navy anchors cover, section changes and resolution.
- Gold is a locator/rule color, not body text on white.
- Real release-bound captures and canonical mechanics figures outrank redrawn or synthetic visuals.
- No repository logo exists, so identity remains text-only unless an approved asset arrives with usage permission.

## Requirements
### Functional
- Define reusable tokens for color, typography, grid, rules, spacing, footers and status labels.
- Define six templates: cover, argument/evidence, learner journey, architecture/process, QA matrix, risk/decision, plus backup marker treatment.
- Keep source/candidate/date captions on every evidence image.
- Preserve canonical colors and all labels/arrows on mechanics figures.

### Non-functional
- Canvas `720 × 405 pt` (`16:9`), safe area 36 pt horizontal and 30 pt vertical.
- Minimum text 10.5 pt; charts/labels 12 pt or larger; title no more than two lines.
- No gradients, glow, glass, decorative military motifs, stock/AI people, pseudo-HUD, emoji or invented marks.
- No required network fonts/assets; Georgia and Arial only.

## Architecture
```text
Theme tokens
  -> layout primitives (grid, title band, footer, evidence frame)
  -> slide archetypes
  -> 16 content records from Phase 02
  -> PPTX and PDF with equivalent hierarchy
```

### Locked design tokens
| Group | Token | Value / rule |
|---|---|---|
| Color | `navy-950` / `navy-900` / `navy-800` | `#07182F` / `#091A33` / `#0D2447` |
| Color | `navy-700` | `#15355F` |
| Color | `paper-50` / `white` | `#F7F5EF` / `#FFFFFF` |
| Color | `ink-800` / `slate-600` | `#243247` / `#5B6B80` |
| Color | `gold-600` / `gold-400` | `#C9963A` / `#DBB36A` |
| Color | `line-200` | `#D7DEE8` |
| Status | success / warning / danger | `#137A3D` / `#9A5B00` / `#B42318`; always pair color with text/shape. |
| Mechanics | force / velocity / acceleration | `#E03030` / `#159C3A` / `#0074D9` |
| Mechanics | resultant / reaction / moment | `#E06A00` / `#B10DC9` / `#7C3AED` |
| Type | Cover / divider | Georgia 34/39 pt / 30/35 pt |
| Type | Slide title / subhead | Georgia 24/29 pt; Arial 16/20 pt bold |
| Type | Body / table / caption | Arial 15/21 pt; 12/16 pt; 10.5/14 pt |
| Type | Metric | Arial 34–44 pt bold |
| Grid | Columns / gutter / baseline | 12 columns × 43 pt, 12 pt gutter, 6 pt baseline |
| Bands | Title / content / footer | 54 pt / 267 pt / 18 pt; 12 pt title-content gap |
| Stroke | Border / emphasis / radius | 1 pt / 2 pt / maximum 4 pt radius |

Contrast constraints: white/navy-950 `17.79:1`; paper/navy-950 `16.31:1`; gold-600/navy-950 `6.70:1`; ink-800/paper `11.87:1`; slate-600/paper `4.99:1`. Gold on white is approximately `3:1`, so it is forbidden for small text, axes or primary series.

### Template rules
1. **Cover:** navy-950, gold 2 pt rule, Georgia title, text-only institution line, full three-author block; no logo placeholder.
2. **Argument/evidence:** 5/7 or 7/5 grid; one takeaway plus release-bound capture with source rail.
3. **Learner journey:** five linear steps, no icon set unless every icon is semantic and stylistically consistent.
4. **Architecture/process:** left-to-right, maximum five main nodes, orthogonal connectors, no decorative circuitry.
5. **QA matrix:** one denominator-based chart/table; direct labels; zero baseline for bars; no donut/pie/gauge/3D chart.
6. **Risk/decision:** issue–evidence–impact–closure; do not flood rows red.
7. **Backup:** visible `DỰ PHÒNG` eyebrow and distinct slide folio; same tokens and source rules.

## Related files
### Read
- `docs/design-guidelines.md`
- `research/design-research.md`
- `backups/docx-option-b-20260826/captures/*.png`
- `release/2026.08.25-candidate/package/images/ch1/hinh-100.png`

### Create during implementation
- `tools/slides/nghiem-thu/deck-theme.mjs`
- `tools/slides/nghiem-thu/build-deck.mjs`

## Implementation Steps
1. Encode the tokens above as immutable theme constants; do not duplicate raw hex/font sizes inside slide content.
2. Implement primitives for title band, footer, source caption, evidence frame, status label and backup marker.
3. Implement the seven template rules with common safe-area and reading-order behavior.
4. Build one representative light evidence slide and one navy decision slide; inspect at 100%, projector scale and grayscale before composing all slides.
5. Place captures without recoloring or device frames; crop only task-relevant regions while retaining labels, axes and callout context.
6. Add alt text for every figure/chart and language metadata `vi-VN` where authoring APIs support it; document any manual PowerPoint step.
7. Ban nonessential animation; if a section transition is necessary, use only whole-slide Fade 0.20–0.30 s and retain equivalent PDF meaning.

## Todo
- [ ] Encode all color/type/grid tokens once.
- [ ] Build and review all seven template treatments.
- [ ] Confirm cover fits three authors without abbreviation.
- [ ] Confirm no identity placeholder or invented emblem exists.
- [ ] Check contrast, grayscale and minimum type sizes.
- [ ] Confirm images preserve canonical colors, labels and provenance captions.

## Success Criteria
- [ ] Theme renders at 16:9 with no element outside safe areas.
- [ ] Representative light and navy slides remain readable from projector distance.
- [ ] Every state has a text/shape cue in addition to color.
- [ ] Every figure/capture has a source caption and alt text.
- [ ] Deck contains none of the prohibited AI-slop or invented-brand patterns.

## Risk Assessment
| Risk | Signal | Response |
|---|---|---|
| Navy overwhelms evidence | More than 35% of slides use full navy | Convert evidence/detail slides to paper background. |
| Dense tables drive tiny type | Any meaningful text falls below 10.5 pt | Move rows to slide 15 backup; do not shrink. |
| Capture becomes unreadable | Labels fail at presentation scale | Crop to one task region or use numbered insets tied to source image. |
| New logo request arrives without provenance | File lacks owner/permission | Keep text-only cover and flag asset as blocked. |

## Security/Integrity Considerations
- Use only repository or explicitly approved assets; do not call external image-generation or stock services.
- Preserve source image aspect ratio and embedded labels; no AI upscaling or content-aware reconstruction.
- Status colors may not conceal `blocked`, `not-run` or `open-condition` labels.
- Footer source paths shown publicly must remain repo-relative and exclude local machine/user identifiers.

## Next steps
Once tokens and templates pass the representative-slide review, proceed to Phase 04. Content records remain authoritative; template changes cannot alter factual wording or timing.
