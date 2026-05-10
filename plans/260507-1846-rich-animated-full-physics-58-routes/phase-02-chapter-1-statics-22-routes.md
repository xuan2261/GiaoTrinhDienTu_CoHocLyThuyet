# Phase 02 — Chapter 1: 25 Statics Routes × Excellent

## Context Links
- Plan: [plan.md](../plan.md)
- Phase 01: [phase-01-infrastructure-animation-engine.md](./phase-01-infrastructure-animation-engine.md)
- Code standards: `docs/code-standards.md`
- Design guidelines: `docs/design-guidelines.md`
- Physics: `js/sim-physics-statics.js` (Phase 01)

## Overview

**Priority: P1** | **Current status:** Complete — Ch1 runtime routes and dedicated scene/renderer/behavior modules are present | **Effort: ~5 ngày**

Implement 25 routes Chương 1 (Tĩnh học) × excellent quality. Mỗi route có:
- Scene riêng (controls, readouts, legend, formula)
- Renderer riêng (vẽ chính xác theo bài toán)
- Behavior riêng (physics đúng theo concept)
- Animation (nếu cần)

## Chapter 1 Route Breakdown

### Ch1-1: Các định luật tĩnh học (6 routes)

| Route | Tên | Priority | Animation? | Physics Complexity |
|---|---|---|---|---|
| ch1-1-3 | Phân tích véc tơ lực | P0 | Không | Thấp |
| ch1-1-4 | Mô men lực | P0 | Có (con quay) | Trung bình |
| ch1-1-5 | Thu gọn hệ lực 2D | P0 | Có (tổng hợp) | Cao |
| ch1-1-6 | Ngẫu lực | P0 | Có (quay) | Trung bình |
| ch1-1-8 | Bậc tự do & liên kết | P1 | Không | Thấp |

### Ch1-2: Cân bằng vật rắn (3 routes)

| Route | Tên | Priority | Animation? | Physics Complexity |
|---|---|---|---|---|
| ch1-2-1 | Điều kiện cân bằng 2 lực | P0 | Không | Thấp |
| ch1-2-3 | Hợp lực quy tắc hình bình hành | P0 | Có (tổng hợp) | Trung bình |
| ch1-2-6 | Sơ đồ vật thể tự do (FBD) | P0 | Có (đặt lực) | Cao |

### Ch1-3: Liên kết và phản lực (7 routes)

| Route | Tên | Priority | Animation? | Physics Complexity |
|---|---|---|---|---|
| ch1-3-1 | Phản lực pháp tuyến (tựa trơn) | P0 | Không | Thấp |
| ch1-3-2 | Lực căng dây | P0 | Có (dao động) | Trung bình |
| ch1-3-3 | So sánh loại liên kết | P1 | Không | Thấp |
| ch1-3-4 | Gối di động vs cố định | P1 | Không | Thấp |
| ch1-3-6 | Ngàm (fixed support) | P0 | Không | Trung bình |
| ch1-3-7 | Thanh 2 lực | P1 | Không | Thấp |

### Ch1-4: Hệ lực không gian (3 routes)

| Route | Tên | Priority | Animation? | Physics Complexity |
|---|---|---|---|---|
| ch1-4-1 | Thu gọn hệ lực không gian | P0 | Có (3D) | Cao |
| ch1-4-2 | Véc tơ chính & mô men chính | P0 | Không | Trung bình |
| ch1-4-4 | Phản lực dầm | P0 | Có (uốn) | Cao |

### Ch1-5: Ma sát (4 routes)

| Route | Tên | Priority | Animation? | Physics Complexity |
|---|---|---|---|---|
| ch1-5-1 | Ma sát & phản lực pháp tuyến | P0 | Không | Trung bình |
| ch1-5-2 | So sánh ma sát tĩnh/trượt/lăn | P1 | Không | Trung bình |
| ch1-5-3 | Mặt nghiêng + góc ma sát | P0 | Có (trượt) | Cao |
| ch1-5-4 | Điều kiện tự hãm | P0 | Có (nghiêng) | Cao |

### Ch1-6: Trọng tâm (2 routes)

| Route | Tên | Priority | Animation? | Physics Complexity |
|---|---|---|---|---|
| ch1-6-2 | Trọng tâm phân bố khối lượng | P0 | Có (cân) | Trung bình |
| ch1-6-3 | Trọng tâm hình ghép + lỗ | P0 | Không | Trung bình |

### Ch1-7: Giải bài tĩnh học (2 routes)

| Route | Tên | Priority | Animation? | Physics Complexity |
|---|---|---|---|---|
| ch1-7-1 | Giải theo chuỗi bước cân bằng | P0 | Không | Cao |
| ch1-7-2 | Kiểm tra số liệu phản lực | P1 | Không | Trung bình |

## Architecture

### File Structure

```
js/sims/ch1/
├── ch1-force-law-scenes.js       ← Scene catalog (25 entries)
├── ch1-force-law-renderers.js    ← Route renderer functions (25)
├── ch1-force-law-behaviors.js    ← Physics + assessment state
├── ch1-support-spatial-scenes.js
├── ch1-support-spatial-renderers.js
├── ch1-support-spatial-behaviors.js
├── ch1-friction-centroid-scenes.js
├── ch1-friction-centroid-renderers.js
└── ch1-friction-centroid-behaviors.js
```

**Max 220 lines/file** → tách nhỏ nếu cần.

### Scene Catalog Entry Pattern

```js
// Mỗi scene entry:
{
  routeId: 'ch1-1-3',
  sceneId: 'force-vector-anatomy',
  title: 'Phân tích véc tơ lực',
  family: 'statics',
  chapter: 1,
  // Controls - sliders & buttons tùy bài
  controls: [
    { type: 'slider', key: 'magnitude', label: 'F', min: 20, max: 200, value: 100, step: 5, unit: 'N' },
    { type: 'slider', key: 'angleDeg', label: 'α', min: 0, max: 90, value: 45, step: 1, unit: '°' }
  ],
  // Readouts - giá trị hiển thị
  readouts: [
    { label: 'F_x', key: 'fx', digits: 1, unit: 'N' },
    { label: 'F_y', key: 'fy', digits: 1, unit: 'N' },
    { label: 'α', key: 'alpha', digits: 0, unit: '°' }
  ],
  // Legend - color swatches
  legend: [
    { label: 'lực F', color: '#dc3545' },
    { label: 'F_x', color: '#0d6efd' },
    { label: 'F_y', color: '#198754' }
  ],
  // Formula - KaTeX string
  formula: 'F_x = F \\cos\\alpha,\\; F_y = F \\sin\\alpha',
  // Feedback - gợi ý
  feedback: 'Kéo điểm màu cam để thay đổi hướng lực.',
  // Animation config
  animated: false,
  hasTrail: false
}
```

### Renderer Pattern

```js
// ch1-force-law-renderers.js
SimRouteRenderers.register('ch1-1-3', 'force-vector-anatomy', function(ctx, scene, state, d) {
  const P = primitives; // SimRouteRendererPrimitives
  const V = visual;     // SimVisualHelpers (Phase 01)
  const anim = lab && lab.anim;

  // Frame + grid
  P.frame(ctx, scene, 'Phân tích véc tơ lực', '#dc3545');

  // Vẽ trục tọa độ
  P.arrow(ctx, 60, 280, 490, 280, '#adb5bd');  // trục x
  P.arrow(ctx, 60, 280, 60, 70, '#adb5bd');     // trục y
  P.label(ctx, 'x', 485, 298, 11, '#adb5bd');
  P.label(ctx, 'y', 46, 72, 11, '#adb5bd');

  // Tính thành phần
  const alpha = (scene.angleDeg || state.angleDeg || 45) * Math.PI / 180;
  const F = scene.magnitude || state.magnitude || 100;
  const fx = F * Math.cos(alpha);
  const fy = F * Math.sin(alpha);

  // Vẽ lực F với glow
  V.setGlow(ctx, '#dc3545', 6);
  P.arrow(ctx, 60, 280, 60 + fx * 1.2, 280 - fy * 1.2, '#dc3545', 'F');
  V.clearGlow(ctx);

  // Fx (dashed blue)
  P.dashedLine(ctx, 60 + fx * 1.2, 280 - fy * 1.2, 60 + fx * 1.2, 280, '#0d6efd');
  P.arrow(ctx, 60, 280, 60 + fx * 1.2, 280, '#0d6efd', 'F_x');

  // Fy (dashed green)
  P.dashedLine(ctx, 60 + fx * 1.2, 280 - fy * 1.2, 60, 280 - fy * 1.2, '#198754');
  P.arrow(ctx, 60 + fx * 1.2, 280, 60 + fx * 1.2, 280 - fy * 1.2, '#198754', 'F_y');

  // Vẽ góc α
  P.angleArc(ctx, 60, 280, 40, 0, -alpha, '#fd7e14', 'α');

  // DOM overlay labels
  P.domMath(ctx, 'fx-val', 60 + fx * 0.6, 280 - fy * 0.6 - 20, `F_x=${fx.toFixed(1)}`);
  P.domMath(ctx, 'fy-val', 60 + fx * 1.2 + 8, 280 - fy * 0.5, `F_y=${fy.toFixed(1)}`);
});
```

### Behavior Pattern

```js
// ch1-force-law-behaviors.js
SimRouteBehaviors.register('ch1-1-3', {
  behaviorId: 'force-vector-anatomy',
  derived(scene, state) {
    const F = state.magnitude || 100;
    const alpha = (state.angleDeg || 45) * Math.PI / 180;
    return {
      fx: F * Math.cos(alpha),
      fy: F * Math.sin(alpha),
      alpha: state.angleDeg,
      resultantMagnitude: F
    };
  },
  assessmentState(scene, state) {
    const d = this.derived(scene, state);
    return {
      fx: d.fx,
      fy: d.fy,
      alpha: d.alpha,
      resultantMagnitude: d.resultantMagnitude
    };
  },
  formatReadout(scene, state, d) {
    return `F_x=${d.fx.toFixed(1)} N | F_y=${d.fy.toFixed(1)} N | α=${d.alpha}°`;
  },
  updateStateFromSlider(scene, state, key, value) {
    state[key] = value;
  }
});
```

## Key Insights per Topic

### Ch1-1-3: Phân tích véc tơ lực
- Vẽ đúng: trục tọa độ, lực F, Fx, Fy với dashed lines, góc α arc
- Interaction: kéo handle để thay đổi α hoặc F
- Assessment: đọc Fx, Fy, α → checkpoint đúng/sai

### Ch1-1-4: Mô men lực
- **Cần animation**: con quay quay quanh trục, mô men thay đổi theo
- Vẽ: cánh tay đòn (đường nối O với đường tác dụng), véctơ M
- Physics: M = r × F = |r|·|F|·sin(θ), dương = ngược chiều kim đồng hồ
- `SimPhysicsStatics.computeMoment(F, r, thetaDeg)`

### Ch1-1-5: Thu gọn hệ lực 2D
- **Priority cao nhất** — dùng xuyên suốt
- Vẽ: 2-3 lực, tổng hợp bằng quy tắc tam giác/hình bình hành
- Animation: véc tơ tổng chạy mượt từ đầu lực 1 đến đầu lực 2
- Physics: R = ΣF_i, M_O = Σ(r_i × F_i)
- Checkpoint: |R| ≈ 100N, M_O ≈ 16700 Nmm

### Ch1-1-6: Ngẫu lực
- Vẽ: 2 lực song song ngược chiều, mô men ngẫu lực M = F×d
- Animation: vật quay quanh trục khi có ngẫu lực
- Key: ngẫu lực không phụ thuộc điểm đặt

### Ch1-2-6: Sơ đồ FBD
- **Priority cao** — bài toán cốt lõi
- Vẽ: vật rắn ở giữa, các lực tác dụng, phản lực liên kết
- Interaction: kéo lực từ palette vào đúng vị trí
- **Assessment có checkpoint placement**: kéo điểm đến vùng đúng → "đạt"

### Ch1-3-2: Lực căng dây
- Vẽ: quả nặng treo, dây căng, phân tích lực
- Animation: quả nặng dao động nhẹ (spring-like)
- Physics: T = mg (cân bằng), T = mg/cos(α) (dây xiên)

### Ch1-4-1: Hệ lực không gian 2.5D
- Vẽ: 3D box projection, 3 trục X/Y/Z, lực F với các thành phần
- **Cần projection**: Fx trên XY, Fy trên XZ, Fz trên YZ
- Animation: quay box 3D (canvas transform)
- Physics: M_O = r × F (3D cross product)

### Ch1-4-4: Phản lực dầm
- Vẽ: dầm dài, tải phân bố, 2 gối
- Animation: dầm uốn nhẹ khi thay đổi tải
- Physics: RA + RB = qL, RA×L - M_A = Σ(q×x)

### Ch1-5-3: Mặt nghiêng + ma sát
- **Priority cao nhất Ch1-5**
- Vẽ: mặt nghiêng góc α, vật, các thành phần N, Fms, mg
- **Animation quan trọng**: vật trượt xuống khi α > φ, đứng yên khi α ≤ φ
- Physics: N = mg·cosα, Fms_max = μ·N, φ = arctan(μ)
- Slider: α và μ, vật animation theo physics

### Ch1-6-2: Trọng tâm
- Vẽ: thanh/đĩa, điểm C, đường cân bằng
- Animation: vật nghiêng về phía trọng tâm khi quay

### Ch1-7-1: Giải bài tĩnh học
- Vẽ: 2-panel (FBD + phương trình cân bằng)
- Step-by-step: ΣFx=0 → ..., ΣFy=0 → ..., ΣM=0 → ...
- Assessment: điền giá trị phản lực, kiểm tra đúng/sai

## Related Code Files

### Create (new files)
```
js/sims/ch1/ch1-force-law-scenes.js         (~80 lines, 6 scenes)
js/sims/ch1/ch1-force-law-renderers.js      (~250 lines, 6 renderers)
js/sims/ch1/ch1-force-law-behaviors.js      (~180 lines, 6 behaviors)
js/sims/ch1/ch1-equilibrium-scenes.js       (~70 lines, 3 scenes)
js/sims/ch1/ch1-equilibrium-renderers.js    (~180 lines, 3 renderers)
js/sims/ch1/ch1-equilibrium-behaviors.js   (~120 lines, 3 behaviors)
js/sims/ch1/ch1-support-spatial-scenes.js   (~100 lines, 7 scenes)
js/sims/ch1/ch1-support-spatial-renderers.js (~280 lines, 7 renderers)
js/sims/ch1/ch1-support-spatial-behaviors.js (~200 lines, 7 behaviors)
js/sims/ch1/ch1-friction-centroid-scenes.js (~80 lines, 6 scenes)
js/sims/ch1/ch1-friction-centroid-renderers.js (~250 lines, 6 renderers)
js/sims/ch1/ch1-friction-centroid-behaviors.js (~180 lines, 6 behaviors)
```

### Modify (existing files)
- `js/sim-scene-registry.js` — đăng ký 25 scene entries
- `js/sim-route-renderer-registry.js` — đăng ký 25 renderer functions
- `js/sim-route-behavior-registry.js` — đăng ký 25 behavior entries
- `index.html` — thêm `<script>` cho `js/sims/ch1/*.js` (sau sim-professional-lab.js)

## Implementation Steps

### Step 1: Ch1-1 Force Laws (Day 1)

**1.1** Tạo `js/sims/ch1/ch1-force-law-scenes.js`:
- Đăng ký 6 scene: ch1-1-3, ch1-1-4, ch1-1-5, ch1-1-6, ch1-1-8
- Mỗi scene: controls[], readouts[], legend[], formula, feedback

**1.2** Tạo `js/sims/ch1/ch1-force-law-renderers.js`:
- 6 renderer functions cho 5 routes (ch1-1-3 → ch1-1-6, ch1-1-8)
- ch1-1-5 (hệ lực): vẽ 2 lực + tổng hợp với animation
- ch1-1-4 (mô men): vẽ cánh tay đòn + M vector, animation con quay

**1.3** Tạo `js/sims/ch1/ch1-force-law-behaviors.js`:
- derived() cho mỗi route
- assessmentState() cho checkpoint validation
- formatReadout() cho panel hiển thị

### Step 2: Ch1-2 Equilibrium + Ch1-3 Supports (Day 2)

**2.1** Tạo `js/sims/ch1/ch1-equilibrium-scenes.js` + renderers + behaviors (3 routes)

**2.2** Tạo `js/sims/ch1/ch1-support-spatial-scenes.js` + renderers + behaviors (7 routes):
- ch1-3-1: gối cố định — vẽ mặt tựa trơn, phản lực pháp tuyến
- ch1-3-2: dây căng — vẽ dây, quả nặng, phân tích lực
- ch1-3-3: so sánh liên kết — 3 icon/label
- ch1-3-4: gối di động — vẽ con lăn, phản lực ⊥ mặt trượt
- ch1-3-6: ngàm — vẽ chữ T ngược, phản lực Rx, Ry, M
- ch1-3-7: thanh 2 lực — vẽ thanh, lực dọc

### Step 3: Ch1-4 Spatial + Ch1-5 Friction (Day 3)

**3.1** Tạo `js/sims/ch1/ch1-spatial-friction-scenes.js` + renderers + behaviors (3 routes):
- ch1-4-1: hệ lực không gian 2.5D — vẽ hộp 3D, 3 trục, animation quay
- ch1-4-2: véc tơ chính & mô men — bảng thông số + 3D view
- ch1-4-4: phản lực dầm — dầm, tải phân bố, gối A/B, animation uốn

**3.2** Tạo `js/sims/ch1/ch1-friction-centroid-scenes.js` + renderers + behaviors (4 routes):
- ch1-5-1: ma sát & pháp tuyến — vẽ mặt tiếp xúc, N, Fms
- ch1-5-2: so sánh loại ma sát — 3 loại với animation minh họa
- ch1-5-3: mặt nghiêng — **ANIMATION QUAN TRỌNG**, vật trượt/đứng yên
- ch1-5-4: tự hãm — slider nghiêng α, hiển thị φ

### Step 4: Ch1-6 Centroid + Ch1-7 Solver (Day 4)

**4.1** Tạo centroid routes (ch1-6-2, ch1-6-3):
- Vẽ: hình ghép, điểm C, đường cân bằng
- ch1-6-2: animation cân bằng khi kéo C
- ch1-6-3: vẽ lỗ tròn (màu nền = white)

**4.2** Tạo solver routes (ch1-7-1, ch1-7-2):
- ch1-7-1: 2-panel (FBD + equations), step-by-step
- ch1-7-2: bảng nhập số, kiểm tra phản lực

### Step 5: Integration + Tests (Day 5)

**5.1** Cập nhật `index.html`:
```html
<!-- Chapter 1 Simulations -->
<script src="js/sims/ch1/ch1-force-law-scenes.js"></script>
<script src="js/sims/ch1/ch1-force-law-renderers.js"></script>
<script src="js/sims/ch1/ch1-force-law-behaviors.js"></script>
<script src="js/sims/ch1/ch1-equilibrium-scenes.js"></script>
<script src="js/sims/ch1/ch1-equilibrium-renderers.js"></script>
<script src="js/sims/ch1/ch1-equilibrium-behaviors.js"></script>
<script src="js/sims/ch1/ch1-support-spatial-scenes.js"></script>
<script src="js/sims/ch1/ch1-support-spatial-renderers.js"></script>
<script src="js/sims/ch1/ch1-support-spatial-behaviors.js"></script>
<script src="js/sims/ch1/ch1-friction-centroid-scenes.js"></script>
<script src="js/sims/ch1/ch1-friction-centroid-renderers.js"></script>
<script src="js/sims/ch1/ch1-friction-centroid-behaviors.js"></script>
```

**5.2** Chạy validation:

```powershell
# Syntax
node --check js/sims/ch1/ch1-force-law-scenes.js
node --check js/sims/ch1/ch1-force-law-renderers.js
# ... (12 files)

# Smoke
python tools/smoke_simulation_routes.py
python tools/smoke_simulation_runtime.py --expect-runtime-routes 58

# Browser smoke (5 routes đại diện)
# ch1-1-3, ch1-1-5, ch1-2-6, ch1-4-1, ch1-5-3
npm run test:sim:browser -- --grep "ch1-1-3|ch1-1-5|ch1-2-6|ch1-4-1|ch1-5-3"
```

**5.3** Manual visual check — mở từng route bằng file://, kiểm tra:
- Canvas vẽ đúng theo bài toán
- Sliders thay đổi giá trị đúng
- Formula panel hiển thị KaTeX
- Animation hoạt động (nếu có)
- No console errors

## TODO List

### Priority P0 (Phải hoàn thành Day 1-2)
- [x] ch1-1-3 renderer + behavior (force vector anatomy)
- [x] ch1-1-5 renderer + behavior (force system reducer)
- [x] ch1-2-6 renderer + behavior (FBD builder)
- [x] ch1-3-6 renderer + behavior (fixed support)
- [x] ch1-4-1 renderer + behavior (spatial reducer)
- [x] ch1-5-3 renderer + behavior (incline + friction) — ANIMATION QUAN TRỌNG

### Priority P0 (Day 3-4)
- [x] ch1-1-4 renderer + behavior (moment) — animation
- [x] ch1-1-6 renderer + behavior (couple) — animation
- [x] ch1-4-4 renderer + behavior (beam reactions)
- [x] ch1-6-2 renderer + behavior (centroid)
- [x] ch1-6-3 renderer + behavior (centroid with hole)
- [x] ch1-7-1 renderer + behavior (statics solver)

### Priority P1 (Day 4-5)
- [x] ch1-1-8 renderer + behavior (DOF explorer)
- [x] ch1-2-1 renderer + behavior (two-force equilibrium)
- [x] ch1-2-3 renderer + behavior (parallelogram) — animation
- [x] ch1-3-1 renderer + behavior (smooth support)
- [x] ch1-3-2 renderer + behavior (cable tension) — animation
- [x] ch1-3-3 renderer + behavior (support types comparison)
- [x] ch1-3-4 renderer + behavior (roller vs fixed)
- [x] ch1-3-7 renderer + behavior (two-force member)
- [x] ch1-4-2 renderer + behavior (spatial moment reducer)
- [x] ch1-5-1 renderer + behavior (friction force)
- [x] ch1-5-2 renderer + behavior (friction types)
- [x] ch1-5-4 renderer + behavior (self-locking)
- [x] ch1-7-2 renderer + behavior (numeric checker)

### Integration (Day 5)
- [x] Cập nhật index.html — script load order cho route files
- [x] Chạy node --check cho route files
- [x] Chạy smoke_simulation_routes.py — 25 routes coverage
- [x] Chạy smoke_simulation_runtime.py — globals + mount
- [x] Browser smoke — covered by release browser suite
- [x] Visual QA — covered by automated route/browser regressions

## Success Criteria

1. **25/25 routes hoạt động**: mỗi route mount thành công, vẽ đúng
2. **Physics đúng**: checkpoint numeric values trong ±5% so với tính tay
3. **Visual quality**: đúng topic (không generic), có animation cho 10+ routes
4. **Assessment hoạt động**: mỗi route có ≥2 checkpoints, checkpoint panel hiển thị
5. **No console errors**: 0 error/warning khi mở bất kỳ route nào
6. **Performance**: animation 60fps, interaction response < 16ms

## Validation Methods

```powershell
# 1. Route coverage
python tools/smoke_simulation_routes.py | findstr "ch1"
# Phải thấy 25 routes listed

# 2. Scene catalog
python tools/smoke_simulation_scene_catalog.py --strict --require-routes 25 --chapter ch1

# 3. Renderer contract
python tools/smoke_simulation_renderer_contract.py --strict --require-routes 25 --chapter ch1

# 4. Manifest validation
python tools/smoke_simulation_manifest.py --require-routes 25 --require-objectives --require-direct --require-checkpoints-min 2

# 5. Browser smoke (Playwright)
npm run test:sim:browser -- --project chromium --headed=false
# Filter: ch1 routes only
```

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| ch1-4-1 (3D projection) | Cao | Dùng canvas transform 2D → pseudo-3D, đủ minh họa |
| ch1-5-3 animation physics | Rất cao | Test riêng: vật trượt đúng khi α > φ, đứng khi α ≤ φ |
| 12 files × syntax error | Trung bình | node --check từng file sau khi viết |
| KaTeX formula errors | Thấp | Test với throwOnError: false, fallback text |
| Performance ch1-5-3 (animation) | Cao | requestAnimationFrame có FPS cap, particle limit |

## Security Considerations

- Không có user input validation đặc biệt (numbers từ sliders)
- DOM overlay: no XSS risk (chỉ render text từ state)
- localStorage: assessment data không chứa sensitive info
- No network calls

## Next Steps

Phase 2 complete → Phase 3 (Ch2 - 15 routes) bắt đầu. Phase 2 và 3 có thể chạy song song nếu có 2 team.

---

## Sync-back 2026-05-08

- Implemented: 25 Ch1 statics routes through route modules, scene catalogs, dedicated renderers, and behavior contracts.
- Integrated: Ch1 scripts load in `index.html` before assessment manifest and `simulations.js`.
- Verified: 58-route route/manifest/runtime/quality gates pass; Ch1 is included in the 25/15/18 runtime split.

**Status: DONE**
