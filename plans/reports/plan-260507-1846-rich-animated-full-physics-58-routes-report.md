# Plan Report — Rich Animated Full Physics 58 Routes Rebuild

**Plan:** `plans/260507-1846-rich-animated-full-physics-58-routes/`
**Created:** 2026-05-07
**Status:** Active

## Tổng quan

Plan gồm **6 phases**, ~25 ngày, rebuild toàn bộ 58 simulation routes từ hollow framework thành production-quality labs.

## Phases

| # | Phase | Status | Effort |
|---|-------|--------|--------|
| 1 | Infrastructure & Animation Engine | Pending | ~3 ngày |
| 2 | Ch1 - 22 Statics Routes × excellent | Pending | ~5 ngày |
| 3 | Ch2 - 17 Kinematics Routes × excellent | Pending | ~5 ngày |
| 4 | Ch3 - 19 Dynamics Routes × excellent | Pending | ~6 ngày |
| 5 | Integration, QA & Polish | Pending | ~4 ngày |
| 6 | Docs & Release Handoff | Pending | ~2 ngày |

**Total: ~25 ngày**

## Key Decisions

| Decision | Value |
|---|---|
| Visual | Rich animated — animation liên tục, trails, particles, glow |
| Physics | Full physics — ODE solvers (RK4), collision 2D, energy conservation |
| Scope | 58 routes × excellent |
| Tech | Canvas 2D + requestAnimationFrame, no bundler |

## Root Cause Identified

Hệ thống simulation hiện tại là **"hollow framework"** — có đầy đủ lớp trừu tượng (registries, contracts, adapters) nhưng lớp Implementation (scene definitions + route renderers) **TRỐNG HOÀN TOÀN**.

| File | Tình trạng |
|---|---|
| `sim-scene-registry.js` | TRỐNG — 0 scene đăng ký |
| `sim-scene-templates.js` | 14 template chung cho 58 routes |
| `sim-statics/kinematics/dynamics.js` | Wrapper rỗng, chỉ gọi `lab.mount()` |
| `sim-professional-lab.js` | TỐT — mount engine well-designed |
| `sim-interactions.js` | TỐT — pointer/touch/keyboard layer hoàn chỉnh |
| `sim-assessment.js` | TỐT — checkpoint engine functional |

## Strategy: "Lấp đầy" chứ KHÔNG "Làm lại"

**Không phá vỡ:** Infrastructure tốt, assessment system, interaction layer, scope lifecycle pattern.
**Chỉ thêm:** Scene catalog, route renderers, physics helpers, animation engine.

## Deliverables per Phase

### Phase 01: Infrastructure
- 6 new JS files: animation engine, physics helpers (statics/kinematics/dynamics), visual helpers, interaction enhancements
- Enhanced `sim-professional-lab.js` với `lab.anim` API
- Play/pause/reset buttons trong lab toolbar

### Phase 02: Ch1 - 22 routes
- ~12 new files (scenes/renderers/behaviors per topic group)
- Key highlights: ch1-1-5 (force system reducer), ch1-5-3 (incline + friction với animation), ch1-4-1 (spatial 2.5D)

### Phase 03: Ch2 - 17 routes
- ~15 new files
- Key highlights: ch2-5-2 (instant center), ch2-4-4 (Coriolis), ch2-1-1 (trajectory với trail), ch2-3-2 (gear transmission)

### Phase 04: Ch3 - 19 routes
- ~18 new files
- Key highlights: ch3-3-1 (RK4 ODE solver), ch3-6-2 (collision 2D), ch3-5-4 (energy conservation bars)

### Phase 05: Integration + QA
- 11 quality gates (smoke, unit, browser, semantic, release)
- Physics unit tests
- Visual polish checklist
- Bug fixes

### Phase 06: Docs + Release
- Updated code-standards, design-guidelines, system-architecture
- Project changelog
- QA summary report
- Backup + final smoke

## Quality Gates

Mỗi phase phải pass: `node --check`, `smoke_simulation_routes`, `smoke_simulation_runtime`, `smoke_simulation_manifest`, `audit_simulation_quality`, `test:sim:unit`, `test:sim:browser`, `test:sim:release`, `audit.py`.

## Risks cao nhất

1. **ch3-3-1 (ODE solver)**: RK4 timestep sensitivity — test với harmonic oscillator
2. **ch3-6-2 (collision 2D)**: Detection + response trong 60fps loop
3. **ch2-5-2 (instant center)**: IC calculation phải continuous và smooth
4. **ch1-4-1 (3D projection)**: Canvas 2D pseudo-3D phải readable
5. **Performance**: 58 routes × 60fps animation — benchmark trên tablet

## Files plan đã tạo

```
plans/260507-1846-rich-animated-full-physics-58-routes/
├── plan.md                                      ← Overview (active)
├── phase-01-infrastructure-animation-engine.md    ← Infrastructure
├── phase-02-chapter-1-statics-22-routes.md     ← Ch1 × 22
├── phase-03-chapter-2-kinematics-17-routes.md  ← Ch2 × 17
├── phase-04-chapter-3-dynamics-19-routes.md     ← Ch3 × 19
├── phase-05-integration-qa-polish.md            ← QA + Polish
└── phase-06-docs-release-handoff.md             ← Docs + Handoff
```
