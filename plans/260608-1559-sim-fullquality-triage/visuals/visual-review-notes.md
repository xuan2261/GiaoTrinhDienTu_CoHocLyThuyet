# Visual Quality Review — 35 Sim Routes (READ-ONLY triage)

Date: 2026-06-08. Reviewer pass: multimodal Read of primary frames (`__live`/`__mid`) for 25 Sim2 + 10 Sim3 3D captures.

## 1. Validity gate result

**PASS — all 35 images valid.** Every image shows theory panel (formula + readouts), legend with colored dots, and control bar (slider/playback) with full app CSS, light theme. No crop/blank/no-CSS failures. Spot-checked 5 across chapters first (ch1-1-3, ch3-1-3, ch2-1-1, ch1-1-5, ch1-1-4) then confirmed remaining 30.

Caveat on method: parallel-batch image reads do NOT guarantee image↔result ordering. Initial parallel passes *appeared* to show sim3 filename/content swaps; single-image re-reads of suspects (ch1-1-5 sim2 and ch1-1-5-sim3) DISPROVED this — bindings are correct. No filename/content mismatch exists. Recorded here so the false lead isn't re-raised.

## 2. Physics baseline (axis-2 foundation)

`test:sim:physics` = **9/9 PASS** (port, transform, ch1 10/10, ch2 7/7, ch3 8/8, regression, coverage 25, 2 guards). Already confirmed upstream. This review is presentation-coherence only (does on-screen readout/color match the drawn config), NOT a physics recompute.

## 3. Per-route table (35 rows)

| Route | Engine | Visual sev | Overlap ct | Physics/label-on-image | Comment |
|-------|--------|-----------|-----------|------------------------|---------|
| ch1-1-3 | Sim2 | low | 0 | F=100N, Fx=81.9, Fy=57.4 @35° coherent; red F vector + blue Fy dashed match legend | clean vector decomposition, mild right dead-space below panel |
| ch1-1-4 | Sim2 | low | 0 | M=F·d=50·4=200 N·m coherent; red F up, purple d arm match | balanced; lots of empty lower-left play area |
| ch1-1-5 | Sim2 | low | 0 | R: Rx20/Ry60/\|R\|63.2, Mo -20; orange R + red components match legend | F2 label near axis but readable; good |
| ch1-1-6 | Sim2 | low | 0 | couple M=150, ΣF=0 coherent; red F/F' pair + purple d match | clear; faint header crop artifact (1px black) top-left, cosmetic |
| ch1-2-3 | Sim2 | low | 0 | R=F1+F2=138.3N, ∠56° coherent; pink F1/blue F2/orange R match legend | parallelogram dashed guides readable |
| ch1-1-8 | Sim2 | low | 0 | RA=60/RB=40 for a=4,L; purple reactions + red P match | beam FBD clean; lower half empty |
| ch1-3-2 | Sim2 | low | 0 | T=W/2cosα=57.7N @30° coherent; purple T + red W match | symmetric rope OK |
| ch1-3-6 | Sim2 | low | 0 | R=P=80, M=P·a=400 coherent; legend R-purple/M-blue but diagram M drawn purple | minor: M legend-dot color (blue) vs drawn M (purple) inconsistent — low |
| ch1-5-3 | Sim2 | low | 0 | μ0.45→φ24.2°, β18° → "CÂN BẰNG" state coherent | green CÂN BẰNG tag clear; blue block OK |
| ch1-6-3 | Sim2 | low | 0 | \|v\|3.21,\|a\|3.46,R3.30; green τ/blue n/purple osculating circle match | badge reads §1.3 (content tag, not visual) — render fine |
| ch2-1-1 | Sim2 | low | 0 | F*=-m·a, a3→F*-3N, θ17° coherent; blue a + red F* match | inertial-frame box; large grey panel = some dead fill but intentional |
| ch2-1-3 | Sim2 | low | 0 | curvature ellipse, R3.30; τ/n/osculating colors match | nice nested ellipse+circle |
| ch2-2-2 | Sim2 | low | 0 | ω(t)0.65, φ0.58 coherent; purple disk + green v tangent match | M label on rim clear |
| ch2-3-2 | Sim2 | low | 0 | gear r1.4/r2.0, ω2 ∓0.70 coherent; green Z1/blue Z2/orange belt match | dense but no overlap; good 2-system layout |
| ch2-4-4 | Sim2 | high | 2 | Coriolis ω1.2,vrel0.82,acor1.98 coherent BUT "a_cor" label box overlaps "v_rel" label + both crowd the small vector cluster | vectors tiny & stacked top-of-disk; labels collide — hides which arrow is which |
| ch2-5-2 | Sim2 | low | 0 | IC at (-2,3), v_A/v_B perpendicular construction coherent; green v + purple normals match | clean; right play area empty |
| ch2-5-3 | Sim2 | low | 0 | velocity field, r3.91/\|vM\|3.91 coherent; green field arrows + red P(IC) match | dense arrow field reads well |
| ch3-2-2 | Sim2 | low | 0 | F=6,m2→a3, v(t)3 coherent; red F/blue m/green v(t) graph match | dual diagram+graph; graph small but OK |
| ch3-2-3 | Sim2 | low | 0 | F_AB+60/F_BA-60, ΣF=0 coherent; red F_AB/purple F_BA match legend | action-reaction clear; lower half empty (mid dead-space) |
| ch3-1-3 | Sim2 | low | 0 | RK4 mẍ+kx=0, ω2.0, x(t)-0.83 coherent; blue m + green x(t) match | spring + graph; green trace exits play area bottom slightly but not clipped |
| ch3-3-1 | Sim2 | low | 0 | L=Iω=36 const, r3 coherent; red m + purple arm match | dumbbell on diagonal arm; large empty corners |
| ch3-5-2 | Sim2 | high | 0 | J=F·t=12, Δp12 coherent BUT color mismatch: legend p(t)=green yet diagram p(t) line drawn ORANGE; the green rising line is unlabeled | formula/legend↔drawn-color swap misleads which line is p(t) |
| ch3-5-3 | Sim2 | low | 0 | L=Iω36 const, r3 coherent; red m + purple arm match | similar to ch3-3-1, clean |
| ch3-5-4 | Sim2 | low | 0 | W=F·d=ΔT=24J coherent; red F/blue m, purple d dashed match | work-energy clear; lower half empty |
| ch3-6-2 | Sim2 | low | 0 | restitution e0.7, p1.40 const, Tmất0 (before) coherent; red m1/blue m2 match | pre-collision frame, balls spaced OK |
| ch1-1-5 | Sim3 | low | 0 | 3D R+Mo: same readouts as 2D; orange R/pink components/purple Mo ring match | true 3D, vectors readable in perspective |
| ch1-5-3 | Sim3 | low | 0 | 3D friction cone φ vs β, μ0.45 coherent; translucent cone + orange box | true 3D, good cone depth |
| ch2-1-3 | Sim3 | low | 0 | 3D curvature, τ/n/osculating ring; labels in pill badges | true 3D, clear ring |
| ch2-2-2 | Sim3 | low | 0 | 3D rotation ω(t)0.52, φ0.07; purple sphere + ω/M/v badges | true 3D, axis line visible |
| ch2-3-2 | Sim3 | low | 0 | 3D gears+belt, r1.4/2.0; toothed gears + purple belt | true 3D, strong depth on gear teeth |
| ch2-4-4 | Sim3 | low | 0 | 3D Coriolis ω1.2/vrel1.10/acor2.65; pill badges separate the vectors (better than 2D!) | true 3D, badges prevent the overlap seen in Sim2 ch2-4-4 |
| ch2-5-3 | Sim3 | low | 0 | 3D velocity field on disk, r3.91; green v_M + purple P(IC) | true 3D, field arrows small but spaced |
| ch3-1-3 | Sim3 | low | 0 | 3D inertial frame F*=-ma; box + pendulum, a/θ/F* badges | true 3D, pink F* readable |
| ch3-5-3 | Sim3 | low | 0 | 3D ang-momentum L=Iω36; dumbbell on ring, m1/m2/L badges | true 3D, purple ring + axis clean |
| ch3-6-2 | Sim3 | low | 0 | 3D restitution e0.7, post-collision Tmất3.13; m1/m2 spheres on rod | true 3D, balls overlapping = collision moment, intended |

## 4. High-severity visual findings (evidence first)

1. **ch2-4-4 (Sim2) — label overlap, 2 collisions.** Evidence: `ch2-4-4__mid.png`. The "a_cor" label box overlaps the "v_rel" label and both sit on a tight cluster of short vectors at the top of the purple disk. Hard to tell which arrow each label belongs to. (Sim3 version fixes this via spaced pill badges.)
2. **ch3-5-2 (Sim2) — formula/legend color mismatch.** Evidence: `ch3-5-2__live.png`. Legend declares p(t)=green, but the line explicitly labeled "p(t)" in the diagram is drawn ORANGE (flat), while a separate GREEN rising line is unlabeled. Reader can't trust legend↔plot color mapping. (F-label red is fine.)

No clipped-content, no missing-panel, no washed-out-unreadable findings. ch1-1-6 has a ~1px black sliver top-left (header artifact) — cosmetic, not listed as high.

Minor (low) color note for follow-up taste pass: **ch1-3-6** legend M-dot is blue but drawn M arrow is purple.

## 5. Sim3 3D-vs-fallback status (10 routes)

All 10 rendered **true 3D (WebGL succeeded)** — perspective grid floor, depth shading, 3D meshes, orbit-style camera. None fell back to 2D.

| Route | 3D? | Note |
|-------|-----|------|
| ch1-1-5 | 3D ✓ | force system w/ Mo ring in perspective |
| ch1-5-3 | 3D ✓ | translucent friction cone, solid depth |
| ch2-1-3 | 3D ✓ | osculating ring in 3D |
| ch2-2-2 | 3D ✓ | rotating sphere + axis |
| ch2-3-2 | 3D ✓ | toothed gears, strong depth |
| ch2-4-4 | 3D ✓ | Coriolis on disk; badge labels beat 2D layout |
| ch2-5-3 | 3D ✓ | velocity field on disk |
| ch3-1-3 | 3D ✓ | inertial-frame box + pendulum |
| ch3-5-3 | 3D ✓ | angular-momentum dumbbell ring |
| ch3-6-2 | 3D ✓ | restitution spheres on rod |

Observation: Sim3 pill-badge labeling (ω/M/v/a_cor in rounded chips) is consistently more legible than Sim2 free-floating text labels — notably resolves the ch2-4-4 overlap. Candidate pattern to backport to Sim2.

## 6. Unresolved questions

1. **ch1-6-3 badge reads §1.3** while filename is ch1-6-3. Is the on-card section badge sourced from sim content (intended) or route id? Content/render is fine; flagging as possible metadata mismatch for the content owner — outside visual-triage scope.
2. **ch3-5-2 color swap**: is orange-p(t)/green-unlabeled a sim bug or did legend intend the opposite mapping? Needs a code/legend check (not done here — read-only).
3. Animated routes reviewed at `__mid` only per instructions; `__end` frames not opened — if end-state label crowding matters (e.g. ch3-6-2 post-collision overlap), a follow-up pass on `__end` would confirm.
