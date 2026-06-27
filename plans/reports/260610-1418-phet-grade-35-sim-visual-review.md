---
type: visual-quality-review
date: 2026-06-10
scope: "25 Sim2 + 10 Sim3"
standard: "PhET-grade strict"
status: completed
---

# PhET-grade Visual Review - 35 Sim Routes

## Summary

Fresh run on 2026-06-10. Scope: all current simulations, 25 Sim2 SVG-first defaults + 10 Sim3 Three.js pilots. Standard: strict PhET-grade, not just "renders and passes tests".

Technical gates are green:

| Gate | Result |
|---|---|
| `npm run test:sim:visual:capture` | 25/25 Sim2 pass, fresh PNGs generated |
| `npm run test:sim3:visual:capture` | 10/10 Sim3 pass, fresh PNGs generated |
| `npm run test:sim:probe:unit` | 68 assertions pass |
| `npm run test:sim:probe` | 35/35 route pass |

Bottom line: no current P0/P1 render blocker. The 2026-06-09 fixes landed correctly: ch1-5-3 now has a visible 2D friction cone, ch1-1-4/ch1-3-6 have moment arcs, ch3-3-1 graph no longer clips, ch3-5-2 color mapping is coherent.

Strict PhET-grade still exposes qualitative gaps: immediate control feedback in a few dynamic routes, ch2-4-4 Sim2 vector scale, and a default-policy decision for 3D routes.

## Artifacts Reviewed

| Artifact | Path |
|---|---|
| Sim2 fresh contact sheet | `plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals/contact-sheet-260610-fresh.png` |
| Sim2 fresh manifest | `plans/260531-2122-sim2-visual-quality-eval-pipeline/visuals/capture-manifest.json` |
| Sim3 fresh contact sheet | `plans/260610-visual-review-35-sim-phET-grade/visuals/sim3/contact-sheet-260610-fresh.png` |
| Sim3 fresh manifest | `plans/260610-visual-review-35-sim-phET-grade/visuals/sim3/capture-manifest.json` |
| Probe result | `plans/260608-1559-sim-fullquality-triage/visuals/interaction-probe.json` |

Gemini vision was not used: `gemini` CLI exists, but `GEMINI_API_KEY` is not set. Review basis is local screenshot inspection + probe outputs.

## Findings

### F1 - ch2-4-4 Sim2 is correct but still under PhET-grade clarity

Severity: medium. The vectors no longer overlap badly, but the purple disk dominates the viewport and the `v_rel` / `a_cor` vector cluster remains visually small. The concept is important and the Sim3 version communicates it better: separated badges, readable arrows, clearer spatial relationship.

Recommendation: either promote Sim3 as preferred/default for this route, or backport Sim3-style callout spacing to Sim2 and shrink/shift the disk so vectors become the primary object.

### F2 - ch3-2-2 has weak immediate feedback for F/m sliders

Severity: medium. Probe passes, but `slider:F` and `slider:m` change readouts without visible scene change while paused; visible motion appears through playback. For PhET-grade, changing `F` or `m` should immediately affect something visible in the scene: force arrow length, mass/body scale or acceleration preview, not only numeric panel.

Recommendation: add immediate visual preview for acceleration/force/mass at paused state. Keep physics unchanged.

### F3 - ch3-6-2 slider feedback is technically valid but not PhET-grade rich

Severity: low-medium. `e`, `m1`, and `m2` update readouts and predicted loss, but the pre-collision scene barely changes; probe marks sceneChanged false for those sliders before playback. For a learner, mass and restitution should have visible affordance: ball size/mass marker, predicted post-collision cue, or compact before/after ghost preview.

Recommendation: add a lightweight predictive cue. Do not add heavy animation or full timeline UI.

### F4 - Sim3 is not a blanket upgrade

Severity: product decision. Sim3 is excellent for spatial/mechanical routes, but can harm planar concepts. ch1-1-5 is titled "he luc phang"; the 3D rendering is visually strong but pedagogically risky as default. ch2-1-3 curvature is fundamentally planar; 3D perspective makes the osculating circle look like an ellipse-like spatial object.

Recommendation: route-specific default policy, not "3D everywhere".

## Route Table

Grade key: A = PhET-grade or close; B = usable, below strict PhET; C = needs fix before promotion.

### Sim2 - 25 Routes

| Route | Grade | Assessment |
|---|---:|---|
| ch1-1-3 | A | Vector decomposition clear; color semantics and readout align. |
| ch1-1-4 | A- | Moment arc now visible; layout clean. Minor: pivot/moment could be more prominent. |
| ch1-1-5 | A | Resultant and components read well in 2D; best default for planar force reduction. |
| ch1-1-6 | A | Couple forces and distance are clear; no major issue. |
| ch1-2-3 | A | Parallelogram construction is readable and pedagogically direct. |
| ch1-1-8 | B+ | FBD clear; reaction magnitude difference still subtle, but acceptable. |
| ch1-3-2 | A | Rope tension geometry is clear and symmetric. |
| ch1-3-6 | B+ | Moment arc added; support/hatching and reaction moment could be stronger visually. |
| ch1-5-3 | A- | 2D cone now visible, R vertical and beta/phi relation are clear. Sim3 still stronger. |
| ch1-6-3 | A | Composite centroid and cutout read clearly. |
| ch2-1-1 | A- | Projectile animation works; graph/trajectory clear. |
| ch2-1-3 | A | 2D curvature/tangent/normal is clearer than 3D for this concept. |
| ch2-2-2 | A- | Rotation scene strong enough; Sim3 has slightly better axis depth. |
| ch2-3-2 | A | 2D gear/belt relation works; Sim3 is more engaging for mechanics. |
| ch2-4-4 | B | Correct, but vector cluster is too small relative to disk; Sim3 wins. |
| ch2-5-2 | A | IC construction is clean and direct. |
| ch2-5-3 | A | Velocity field is dense but readable. |
| ch3-2-2 | B | Physics/readout pass; F/m slider feedback is weak while paused. |
| ch3-2-3 | A- | Action-reaction pair now framed well; no clip/dead-space blocker. |
| ch3-1-3 | A | Non-inertial frame cue is clear. |
| ch3-3-1 | A- | Graph clipping fixed; spring/block + x(t) trace readable. |
| ch3-5-2 | A | Momentum/impulse color mapping now coherent. |
| ch3-5-3 | A | Angular momentum visual is clear; Sim3 adds spatial value. |
| ch3-5-4 | A- | Work-energy relation clear after worldBox fix. |
| ch3-6-2 | B+ | Collision scene clean; restitution/mass controls need richer immediate feedback for PhET-grade. |

### Sim3 - 10 Routes

| Route | Grade | Assessment |
|---|---:|---|
| ch1-1-5#sim3 | B | Visually polished, but default risk: route is planar force reduction. Keep optional. |
| ch1-5-3#sim3 | A | Strongest 3D candidate. Friction cone is materially clearer than 2D. |
| ch2-1-3#sim3 | B | Attractive, but perspective weakens the planar curvature concept. Keep optional. |
| ch2-2-2#sim3 | A- | Axis and angular motion benefit from depth. Good candidate for preferred mode. |
| ch2-3-2#sim3 | A | Gears, belt span, and labels are strong. Good candidate for preferred mode. |
| ch2-4-4#sim3 | A | Better than Sim2 for Coriolis: label separation and vector placement are much clearer. |
| ch2-5-3#sim3 | B+ | Good, but 2D already teaches the velocity field well; arrows are a little small. |
| ch3-1-3#sim3 | A- | Box + pendulum is intuitive; 2D remains sufficient. |
| ch3-5-3#sim3 | A | Better spatial understanding of angular momentum. Good candidate for preferred mode. |
| ch3-6-2#sim3 | A- | Polished before/impact/after cue; 2D is also sufficient. |

## Sim2 vs Sim3 Default Recommendation

Do not switch all Sim3 routes to default. Use a route-specific policy.

Promote or strongly recommend 3D first:

| Route | Why |
|---|---|
| ch1-5-3 | Friction cone is inherently spatial; Sim3 teaches the core concept best. |
| ch2-3-2 | Gears/belt/pulley system benefits from depth and 3D geometry. |
| ch2-4-4 | Coriolis vector separation is much clearer in Sim3. |
| ch3-5-3 | Angular momentum around an axis benefits from 3D. |
| ch2-2-2 | Rotation around fixed axis benefits slightly from 3D. |

Keep 2D default:

| Route | Why |
|---|---|
| ch1-1-5 | Planar force reduction; 3D perspective can contradict the lesson framing. |
| ch2-1-3 | Planar curvature/tangent/normal; 3D perspective adds conceptual noise. |
| ch2-5-3 | 2D field is already clearer enough; 3D is optional enrichment. |
| ch3-1-3 | Both work; 2D is simpler and reliable. |
| ch3-6-2 | Both work; 3D is polished but not necessary as default. |

## Approaches Evaluated

### Approach A - Sim2 polish only

Pros: safest, offline-first, least contract risk. Fixes F1-F3 without changing default engine policy.

Cons: misses routes where 3D is clearly more pedagogical.

Use when: next pass should be low-risk TDD polish.

### Approach B - Route-specific preferred 3D

Pros: best learner experience for spatial concepts; uses existing Sim3 investment.

Cons: needs explicit default policy, WebGL fallback guard, and route-by-route product decision. More UX surface.

Use when: user accepts per-route default changes.

### Approach C - Full Sim3 rollout

Rejected. Over-engineered and pedagogically wrong for planar topics. Higher WebGL/device risk with no proportional learning gain.

## Recommended Next Plan

Recommended next plan is `/ck:plan --tdd` with two phases:

1. PhET-grade Sim2 polish:
   - ch2-4-4: make vector cluster primary; shrink/shift disk or add callout geometry.
   - ch3-2-2: immediate visual feedback for F/m while paused.
   - ch3-6-2: predictive visual cue for e/m changes.

2. Route-specific 3D preferred-mode decision:
   - Candidate preferred 3D: ch1-5-3, ch2-3-2, ch2-4-4, ch3-5-3, maybe ch2-2-2.
   - Explicitly keep 2D default for ch1-1-5 and ch2-1-3.
   - Add fallback/visual/probe gates for default-mode behavior.

## Success Metrics

- Capture remains green: 25/25 Sim2, 10/10 Sim3.
- Probe remains green: 35/35 routes, 68 unit assertions.
- New visual tests assert immediate feedback for the sliders currently weak in ch3-2-2/ch3-6-2.
- Manual PhET-grade review sees no route below B+ and no conceptual default mismatch.

## Unresolved Questions

1. Should the next implementation plan include route-specific 3D preferred/default behavior, or only Sim2 polish?
2. For ch3-6-2, should mass be represented by ball radius/visual weight, or kept numeric with a predictive collision cue?
3. Should ch2-4-4 be solved by improving Sim2, or by making Sim3 the preferred view for that route?
