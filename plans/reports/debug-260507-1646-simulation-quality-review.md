# Báo Cáo Debug: Chất Lượng Mô Phỏng Giáo Trình Điện Tử Cơ Học Lý Thuyết

**Ngày:** 2026-05-07
**Người thực hiện:** Claude Code (debug session)
**Phạm vi:** 58 route simulation, 3 chương (Tĩnh học, Động học, Động lực học)

---

## Tổng Quan Kiến Trúc Hiện Tại

```
index.html
  └── js/app.js              (theme, search, sidebar, progress)
  └── js/pages.js            (HTML fragments bundle)
  └── js/loader.js          (route map, lazy load)
  └── js/quiz.js / js/notes.js / js/progress.js / js/glossary.js
  └── js/sim-core.js        (canvas primitives: arrow, axes, grid, container, slider, button)
  └── js/sim-rendering.js    (render helpers: drawGrid, drawHandle, drawLabel, drawMeter)
  └── js/sim-interactions.js (pointer/touch/keyboard interaction layer)
  └── js/sim-lab-ui.js       (lab shell scaffold: scene, overlay, toolbar, panels)
  └── js/sim-professional-lab.js (shared lab engine, physics helpers, mount)
  └── js/sim-route-renderer-registry.js (58 renderer contract registry)
  └── js/sim-route-behavior-registry.js (58 behavior contract registry)
  └── js/sim-route-renderer-primitives.js (low-level drawing primitives)
  └── js/sim-scene-registry.js
  └── js/sim-assessment.js
  └── js/sim-route-manifest.js (58-route metadata + checkpoint manifest)
  └── js/sims/ch1/*.js       (statics renderers + behaviors)
  └── js/sims/ch2/*.js       (kinematics renderers + behaviors)
  └── js/sims/ch3/*.js       (dynamics renderers + behaviors)
```

**Nhận xét kiến trúc:** Tầng kiến trúc tốt — phân tách rõ renderer/behavior/assessment. Tuy nhiên implementation thiếu animation/physics loop toàn cục, nên 58 route đều là **ảnh tĩnh** thay vì mô phỏng động.

---

## VẤN ĐỀ 1: TRỘN LẪN TIẾNG ANH - TIẾNG VIỆT (Nghiêm trọng)

### 1.1 Frame titles trong tất cả renderer

| File | Nhãn hiện tại | Nên là |
|------|---------------|--------|
| `ch1-force-law-renderers.js:15` | `'Force anatomy: point, line, sense'` | `'Giải phẫu lực: điểm đặt, phương, chiều'` |
| `ch1-force-law-renderers.js:27` | `'Moment arm: perpendicular distance'` | `'Cánh tay đòn: khoảng cách vuông góc'` |
| `ch1-force-law-renderers.js:43` | `'Reducer: force polygon plus moment'` | `'Thu gọn: đa giác lực và mô men'` |
| `ch1-force-law-renderers.js:56` | `'Couple: free moment survives translation'` | `'Ngẫu lực: mô men tự do không đổi'` |
| `ch1-force-law-renderers.js:67` | `'Constraint release: locked DOF to reaction'` | `'Tháo liên kết: khóa bậc tự do thành phản lực'` |
| `ch1-force-law-renderers.js:79` | `'Two-force body: collinear equal opposite'` | `'Vật hai lực: cùng đường thẳng, ngược chiều'` |
| `ch1-force-law-renderers.js:91` | `'Parallelogram: diagonal resultant'` | `'Hình bình hành: đường chéo là hợp lực'` |
| `ch1-force-law-renderers.js:105` | `'FBD builder: replace constraints by reactions'` | `'FBD: thay liên kết bằng phản lực'` |
| `ch1-friction-renderers.js:21` | `'Contact force split into N and Fms'` | `'Lực tiếp xúc tách thành N và Fms'` |
| `ch1-friction-renderers.js:32` | `'Static, sliding, rolling friction modes'` | `'Ma sát tĩnh, trượt, lăn'` |
| `ch1-friction-renderers.js:44` | `'Friction cone on incline: tan alpha <= mu'` | `'Nón ma sát: tan alpha <= mu'` |
| `ch1-friction-renderers.js:56` | `'Self-locking wedge: alpha below phi'` | `'Cái chêm tự hãm: alpha nhỏ hơn phi'` |
| `ch1-support-renderers.js:12` | `'Smooth contact: one normal reaction'` | `'Tiếp xúc trơn: một phản lực pháp tuyến'` |
| `ch1-support-renderers.js:22` | `'Cable: reaction follows cable axis'` | `'Dây căng: phản lực dọc trục dây'` |
| `ch1-support-renderers.js:38` | `'Hinge: two force components'` | `'Bản lề: hai thành phần lực'` |
| `ch1-support-renderers.js:50` | `'Roller vs pin: selectable reaction set'` | `'Con lăn vs chốt: chọn thành phần phản lực'` |
| `ch1-support-renderers.js:65` | `'Fixed support: force pair plus moment'` | `'Ngàm: cặp lực cộng mô men'` |
| `ch1-support-renderers.js:77` | `'Two-force member: axial reaction only'` | `'Thanh hai lực: chỉ phản lực dọc trục'` |
| `ch2-particle-renderers.js:16` | `'Particle path: ${state.mode}'` | `'Quỹ đạo chất điểm: ${state.mode}'` |
| `ch2-particle-renderers.js:34` | `'Cartesian graphs: slope gives velocity'` | `'Đồ thị Đề các: độ dốc cho vận tốc'` |
| `ch2-particle-renderers.js:56` | `'Natural frame: tau, n, curvature radius'` | `'Trục tự nhiên: tiếp tuyến, pháp tuyến, bán kính cong'` |
| `ch2-particle-renderers.js:72` | `'Motion preset gallery'` | `'Bộ preset chuyển động'` |
| `ch2-rotation-transmission-renderers.js:12` | `'Fixed-axis rotation: v, at, an on disk'` | `'Quay quanh trục cố định: v, at, an trên đĩa'` |
| `ch2-rotation-transmission-renderers.js:28` | `'Gear/belt transmission: no slip ratio'` | `'Truyền động bánh/dây: không trượt'` |
| `ch3-dynamics-law-renderers.js:12` | `'Resultant force produces acceleration'` | `'Hợp lực gây ra gia tốc'` |
| `ch3-dynamics-law-renderers.js:22` | `'Inertial vs non-inertial observer'` | `'Quan sát viên quán tính vs phi quán tính'` |
| `ch3-dynamics-law-renderers.js:35` | `'Inertia law: zero resultant, constant velocity'` | `'Định luật quán tính: hợp lực bằng 0, vận tốc không đổi'` |
| `ch3-dynamics-law-renderers.js:45` | `'Newton second law: F/m controls a'` | `'Định luật II Newton: F/m điều khiển a'` |
| `ch3-dynamics-law-renderers.js:54` | `'Action and reaction are equal opposite'` | `'Tác dụng và phản tác dụng bằng nhau, ngược chiều'` |
| `ch3-dynamics-law-renderers.js:65` | `'Dynamic FBD includes inertia force -ma'` | `'FBD động lực gồm lực quán tính -ma'` |
| `ch3-collision-checker-renderers.js:12` | `'Restitution experiment: normal impulse line'` | `'Thí nghiệm phục hồi: đường xung lượng pháp tuyến'` |
| `ch3-collision-checker-renderers.js:23` | `'Collision solver: momentum plus restitution'` | `'Giải va chạm: bảo toàn động lượng + hệ số phục hồi'` |
| `ch3-collision-checker-renderers.js:33` | `'Theorem selector: match condition to invariant'` | `'Chọn định lý: ghép điều kiện với bất biến'` |
| `ch3-collision-checker-renderers.js:45` | `'Numeric checker: force, energy, momentum residuals'` | `'Kiểm tra số: sai số lực, năng lượng, động lượng'` |

### 1.2 Panel labels

| File | Hiện tại | Nên là |
|------|---------|--------|
| `ch1-force-law-renderers.js:16` | `'vector card'` | `'Thẻ véc tơ'` |
| `ch1-force-law-renderers.js:44` | `'force polygon'` | `'Đa giác lực'` |
| `ch1-force-law-renderers.js:48` | `'rigid body'` | `'Vật rắn'` |
| `ch1-force-law-renderers.js:106` | `'original body'` | `'Vật gốc'` |
| `ch1-force-law-renderers.js:109` | `'free-body diagram'` | `'Sơ đồ vật tự do'` |
| `ch1-friction-renderers.js:27` | `'contact triad'` | `'Bộ ba tiếp xúc'` |
| `ch2-particle-renderers.js:35` | `'Cartesian graphs'` | `'Đồ thị Đề các'` |
| `ch2-rotation-transmission-renderers.js:44` | `'ω1 r1 = ω2 r2'` | giữ nguyên công thức |
| `ch3-dynamics-law-renderers.js:23` | `'inertial frame'` | `'HQC quán tính'` |
| `ch3-dynamics-law-renderers.js:24` | `'accelerating frame'` | `'HQC gia tốc'` |
| `ch3-dynamics-law-renderers.js:40` | `'ΣF = 0'` | giữ nguyên |
| `ch3-dynamics-law-renderers.js:49` | `'a = ΣF / m'` | giữ nguyên |
| `ch3-dynamics-law-renderers.js:66` | `'real forces'` | `'Lực thực'` |
| `ch3-dynamics-law-renderers.js:69` | `'D Alembert'` | `'D Alembert'` (giữ tên riêng) |
| `ch3-collision-checker-renderers.js:13` | `'impact table'` | `'Bàn va'` |
| `ch3-collision-checker-renderers.js:46` | `'residual dashboard'` | `'Bảng sai số'` |

### 1.3 Labels trên canvas (véc tơ, điểm, thước đo)

| File | Hiện tại | Nên là |
|------|---------|--------|
| `ch2-particle-renderers.js:63-67` | `'tau'`, `'n'`, `'rho'` | `'τ'`, `'n'`, `'ρ'` (ký hiệu Hy Lạp) |
| `ch2-rotation-transmission-renderers.js:42` | `'ω1'`, `'ω2'` | giữ nguyên (ký hiệu vật lý) |
| `sim-professional-lab.js:311-312` | `'drag'`, `'v/F'` | `'kéo'`, `'v/F'` |

### 1.4 Legend labels

| File | Hiện tại | Nên là |
|------|---------|--------|
| `sim-professional-lab.js:293` | `'Handle'` | `'Điều khiển'` |
| `sim-professional-lab.js:294` | `'Vector'` | `'Véc tơ'` |
| `sim-professional-lab.js:295` | `'Readout'` | `'Giá trị'` |

### 1.5 Readout / format text

| File | Hiện tại | Nên là |
|------|---------|--------|
| `sim-professional-lab.js:314` | `'Route ${routeId} | ... | mode=${state.mode}'` | `'Mô phỏng ${routeId} | ... | chế độ=${state.mode}'` |
| `sim-professional-lab.js:17` | `'Simulation lab'` | `'Phòng thí nghiệm'` |
| `sim-professional-lab.js:188` | `'Missing dedicated route renderer'` | `'Renderer chuyên dụng bị thiếu'` |
| `sim-professional-lab.js:192` | `'state vector'` | `'Véc tơ trạng thái'` |
| `sim-rendering.js:76` | `'clearCanvas'`, `'drawArrow'` (export) | giữ nguyên (tên hàm) |

### 1.6 Trạng thái slider/control labels (từ scene registry + legacy fallback)

| File | Hiện tại | Nên là |
|------|---------|--------|
| `sim-professional-lab.js:58-60` | `'F'`, `'m'` (slider label) | `'Lực F'`, `'Khối lượng m'` |
| `sim-lab-ui.js:99` | `'Công thức'` | OK |
| `sim-lab-ui.js:110` | `'Phản hồi'` | OK |
| `sim-lab-ui.js:114` | `'Checkpoint sẽ mở rộng ở phase assessment.'` | `'Checkpoint sẽ mở rộng ở giai đoạn đánh giá.'` |

**Tổng số nhãn cần dịch:** ~60+ nhãn tiếng Anh trong 25 file renderer JS.

---

## VẤN ĐỀ 2: MÔ PHỎNG THIẾU ANIMATION / CHUYỂN ĐỘNG (Nghiêm trọng)

**Root cause:** `sim-professional-lab.js` không có physics loop hay requestAnimationFrame. Tất cả 58 route là **ảnh tĩnh Canvas 2D**.

**Hệ quả:**
- Chương 2 (Động học): 14 route — quỹ đạo chất điểm, vận tốc, gia tốc, chuyển động quay — đều vẽ đường curve tĩnh. Không có chuyển động theo thời gian.
- Chương 3 (Động lực học): 14 route — lực, gia tốc, va chạm — đều không có animation vật thể chuyển động.
- Slider chỉ cập nhật trạng thái 1 lần (không có interpolation mượt).
- Không có **play/pause/reset** cho animation.
- Không có **timeline scrubber** (thanh kéo thời gian) cho các mô phỏng động học.

**Các route cần animation nhất:**
- `ch2-1-1`: Quỹ đạo chuyển động (Elip, Parabol...) — cần con chạy trên đường cong
- `ch2-1-2`: Đồ thị x(t), v(t), a(t) — cần vẽ động theo thời gian
- `ch2-1-4`: Motion preset gallery — cần animate 3 loại chuyển động
- `ch2-2-2`: Quay đĩa quanh trục — cần góc quay ωt
- `ch2-3-2`: Truyền động bánh/dây — cần 2 bánh quay tỷ lệ
- `ch2-5-2`: Instant center — cần thanh quay quanh IC
- `ch3-3-1`: ODE integrator — cần vẽ đồ thị động theo thời gian
- `ch3-6-2`: Va chạm — cần 2 bi chuyển động va vào nhau

---

## VẤN ĐỀ 3: VISUAL TUYẾN TÍNH, THIẾU CHIỀU SÂU (Nghiêm trọng)

### 3.1 Canvas 2D cơ bản

Tất cả renderers dùng Canvas 2D API thuần túy. Hậu quả:
- **Không có gradient/shadow** — các body chỉ là hình chữ nhật màu trắng đục, không có depth
- **Không có texture** — gối, dầm, bi, đĩa đều là hình phẳng nhạt nhẽo
- **Màu solid trùng lặp** — palette 7 màu cố định dùng cho tất cả 58 route
- **Line width cứng** — `ctx.lineWidth = 2` hay `3` cố định, không scale theo kích thước canvas
- **Label font cứng** — `'bold 12px Inter, sans-serif'` không thích ứng DPI

### 3.2 Đối tượng vật lý thiếu sức hút

| Đối tượng | Hiện tại | Nên có |
|-----------|---------|--------|
| Vật rắn (body) | HCN màu trắng đục + viền xanh | Gradient fill, shadow nhẹ, bevel effect |
| Điểm đặt lực | Hình tròn r=5 | Dot lớn hơn với glow effect |
| Mũi tên lực | Một nét vẽ | Có đầu mũi tên lớn hơn, fill gradient |
| Đường nền (grid) | Grid lines mỏng #dee2e6 | Có major/minor grid lines |
| Ground | 3 vạch nghiêng đều nhau | Có texture gạch/hatch |
| Panel | Nền trắng đục | Có border-radius lớn hơn, shadow nhẹ |

### 3.3 Layout không responsive trong canvas

```js
// sim-route-renderer-primitives.js:9
const W = 560, H = 340;  // CỨNG, không responsive
```

Tất cả tọa độ hardcoded:
- `P.body(ctx, 178, 146, 204, 56, ...)` — tọa độ tuyệt đối
- `P.arrow(ctx, 178, 174, 102, 174, ...)` — tọa độ tuyệt đối

→ Canvas 560×340 trên mobile bị tràn hoặc quá nhỏ.

### 3.4 Handle (điểm kéo thả) không rõ ràng

```js
// sim-professional-lab.js:311-312
render.drawHandle(lab.ctx, state.primary.x, state.primary.y, {
  label: 'drag', stroke: color('result'), hitRadius: 24
});
render.drawHandle(lab.ctx, state.vector.x, state.vector.y, {
  label: 'v/F', stroke: color('force'), hitRadius: 20
});
```

- Label `'drag'` và `'v/F'` bằng tiếng Anh
- Handle radius nhỏ (8px), hit radius chỉ 20-24px → khó bấm trên mobile
- Không có visual feedback khi hover (chỉ đổi cursor qua CSS `cursor: grab`)
- Không có animation khi kéo (di chuyển tức thì, không có easing)

---

## VẤN ĐỀ 4: KẾT NỐI LÝ THUYẾT - MÔ PHỎNG LỎNG LẺO (Nghiêm trọng)

### 4.1 Derived state không phản ánh đủ công thức lý thuyết

`sim-professional-lab.js:101-120` — hàm `derived()` tính rất ít biến:

```js
derived(scene, state) {
  // Chỉ tính: dx, dy, force, alpha, moment, slipState, reactions, accel, transmission, collision
}
```

**Thiếu nhiều công thức quan trọng:**
- Không tính động năng `T = ½mv²`
- Không tính công `A = F·s·cosθ`
- Không tính mô men động lượng `L = Iω`
- Không tính xung lượng `J = F·Δt`
- Không tính gia tốc pháp tuyến/tiếp tuyến riêng
- Không tính bán kính cong `ρ = v³/(|v×a|)`
- Không tính gia tốc Coriolis `a_c = 2ω×v_rel`

### 4.2 Behaviors chỉ là metadata, không có logic

```js
// ch1-force-law-behaviors.js
registry.registerMany({
  'ch1-1-3': {
    behaviorId: 'ch1-1-3-force-vector-anatomy-behavior',
    derivedModelId: 'force-components-derived',
    interactionSchemaId: 'point-vector-tip-interactions'
  },
  // ...
});
```

Các behavior chỉ là **string metadata**, không có hàm xử lý riêng. Tất cả route dùng chung `behaviorFor()` trong `sim-professional-lab.js`, nên:
- Route ch1-1-4 (mô men) hoạt động **giống hệt** route ch1-1-3 (thành phần lực)
- Route ch2-1-1 (quỹ đạo) hoạt động **giống hệt** route ch1-1-3
- **58 route dùng chung 1 logic behavior** → kém phân biệt, không gắn lý thuyết

### 4.3 Checkpoint prompt còn tiếng Anh

```js
// sim-route-manifest.js
{ id: 'force-vector-place', type: 'drag-target', ..., prompt: 'Kéo handle scene tới vùng mục tiêu rồi đọc trạng thái.' }
// ✓ Prompt đã là tiếng Việt
// NHƯNG nhiều prompt trong các checkpoint khác vẫn còn tiếng Anh
```

### 4.4 Formula panel không liên kết với scene hiện tại

`sim-lab-ui.js:95-100` — formula panel luôn hiển thị text tĩnh:
```js
lab.formulaPanel = appendTextBlock(lab.panels, 'sim-lab-formula-panel',
  'Công thức',
  cfg.formula || 'Quan hệ định lượng hiển thị theo trạng thái hiện tại.'
);
```

→ Không có công thức KaTeX động gắn với trạng thái mô phỏng.

---

## VẤN ĐỀ 5: CSS / LAYOUT GIAO DIỆN (Trung bình)

### 5.1 `.sim-lab` shell có nhưng chưa tận dụng hết

CSS đã định nghĩa đầy đủ (`.sim-lab`, `.sim-lab-scene`, `.sim-lab-panels`, `.sim-assessment-*`, legend, toolbar) nhưng:
- Overlay positioning dùng `translate()` cứng → không responsive
- `.sim-lab-scene` dùng `width: max-content` → tràn trên mobile

### 5.2 Slider styling không đồng nhất

Slider thumb có `-webkit-slider-thumb` nhưng thiếu:
```css
/* Thiếu: */
input[type="range"]::-moz-range-thumb { ... }  /* Firefox */
input[type="range"]::-ms-thumb { ... }         /* Edge */
```

### 5.3 Font fallback thiếu font tiếng Việt

```css
/* style.css:46 */
body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
```

→ Font Segoe UI trên Linux/macOS/Android có thể không hỗ trợ đầy đủ tiếng Việt có dấu.

---

## VẤN ĐỀ 6: CODE QUALITY / ARCHITECTURE (Trung bình)

### 6.1 Collision giữa legacy và dedicated renderer

`sim-professional-lab.js:196-206`:
```js
function rendererFor(routeId, scene) {
  const registered = routeRenderers.get && routeRenderers.get(routeId);
  if (registered && typeof registered.render === 'function') return registered;
  console.error('Dedicated route renderer missing:', routeId);
  return { ..., render: drawMissingRenderer };
}
```

→ Nếu renderer bị thiếu, fallback `drawMissingRenderer` vẽ canvas đỏ với text "Missing dedicated route renderer" — rất xấu và gây confuse.

### 6.2 `makeState` hardcodes giá trị không đọc từ scene

```js
// sim-professional-lab.js:68-90
const state = Object.assign({
  routeId, primary: { x: 190, y: 255 }, vector: { x: 370, y: 130 },
  mode: 'Chuẩn', mass: 8, load: 100, mu: 0.42, radius: 55, omega: 2,
  restitution: 1, spring: 0.4, t: 1
}, initial);
```

→ `initialState` từ scene không override đủ, nhiều route bắt đầu với giá trị không liên quan.

### 6.3 Canvas coordinate system không scale theo DPI

```js
// sim-interactions.js:22-23
const scaleX = canvas.width / Math.max(1, rect.width);
const scaleY = canvas.height / Math.max(1, rect.height);
```

→ Canvas resolution cố định (560×340 CSS px) không tương thích high-DPI displays.

### 6.4 `sceneFor()` fallback tạo scene trùng lặp

```js
// sim-professional-lab.js:270-275
function sceneFor(routeId) {
  const scene = scenes.get && scenes.get(routeId);
  if (scene) return scene;
  return legacyScene(routeId);  // Tạo scene mới mỗi lần gọi
}
```

→ `legacyScene()` tạo object mới mỗi lần → không có scene config riêng cho 40 route không có scene registry entry.

---

## PHÂN TÍCH CHI TIẾT THEO CHƯƠNG

### Chương 1 — Tĩnh học (22 route)

| Route | Vấn đề | Ưu điểm |
|-------|--------|---------|
| ch1-1-3 | Frame title EN, panel EN, label EN | ✓ Logic thành phần lực cơ bản đúng |
| ch1-1-4 | Frame title EN, formula EN | ✓ Mô men theo cánh tay đòn đúng |
| ch1-1-5 | Frame EN, thiếu animation đa giác | ✓ Công thức R và M đúng |
| ch1-1-6 | Frame EN, ngẫu lực tĩnh | ✓ Khái niệm đúng |
| ch1-1-8 | Frame EN, DOF terminology | ✓ Logic đúng |
| ch1-2-1 → ch1-2-6 | Tất cả frame/panel EN | ✓ Vật hai lực, quy tắc hình bình hành đúng |
| ch1-3-1 → ch1-3-7 | Tất cả frame/panel EN | ✓ Phản lực từng loại liên kết đúng |
| ch1-4-1 → ch1-4-4 | Frame EN, thiếu 3D/2.5D | ✓ Logic không gian cơ bản |
| ch1-5-1 → ch1-5-4 | Frame EN, thiếu animation trượt | ✓ Công thức ma sát đúng |
| ch1-6-2 → ch1-6-3 | Frame EN, trọng tâm tĩnh | ✓ Logic đúng |
| ch1-7-1 → ch1-7-2 | Frame EN, checker tĩnh | ✓ Step-by-step đúng |

### Chương 2 — Động học (14 route)

| Route | Vấn đề | Ưu điểm |
|-------|--------|---------|
| ch2-1-1 | **THIẾU ANIMATION** quỹ đạo, label EN | ✓ Đường cong đúng |
| ch2-1-2 | Đồ thị tĩnh, frame EN | ✓ Đồ thị x(t), v(t) đúng |
| ch2-1-3 | Ký hiệu Hy Lạp không KaTeX, frame EN | ✓ Tiếp tuyến/pháp tuyến đúng |
| ch2-1-4 | Gallery tĩnh, frame EN | ✓ 3 preset đúng |
| ch2-2-2 | **THIẾU ANIMATION** quay đĩa, frame EN | ✓ Công thức ω, v, at, an đúng |
| ch2-3-2 | **THIẾU ANIMATION** bánh quay, frame EN | ✓ Tỷ lệ truyền động đúng |
| ch2-4-1 → ch2-4-4 | Frame EN, thiếu animation vector | ✓ Logic tương đối đúng |
| ch2-5-1 → ch2-5-3 | Frame EN, IC tĩnh | ✓ Instant center đúng |
| ch2-7-1 → ch2-7-2 | Frame EN, checker tĩnh | ✓ Logic đúng |

### Chương 3 — Động lực học (14 route)

| Route | Vấn đề | Ưu điểm |
|-------|--------|---------|
| ch3-1-2 → ch3-1-3 | Frame EN, lực tĩnh | ✓ Định luật Newton đúng |
| ch3-2-1 → ch3-2-5 | Tất cả frame EN | ✓ Lực quán tính đúng |
| ch3-3-1 | **THIẾU ANIMATION** ODE, frame EN | ✓ Phương trình vi phân đúng |
| ch3-3-2 | Frame EN, thiếu animation | ✓ ODE system đúng |
| ch3-4-1 → ch3-4-2 | Frame EN | ✓ D'Alembert đúng |
| ch3-5-1 → ch3-5-4 | Frame EN, định lý tĩnh | ✓ Định lý đúng |
| ch3-6-2 | **THIẾU ANIMATION** va chạm, frame EN | ✓ Hệ số phục hồi đúng |
| ch3-6-3 | Frame EN, va chạm tĩnh | ✓ Công thức đúng |
| ch3-7-1 → ch3-7-2 | Frame EN, selector tĩnh | ✓ Logic đúng |

---

## MA TRẬN ƯU TIÊN SỬA LỖI

| Mức ưu tiên | Vấn đề | Tác động | Effort |
|-------------|--------|----------|--------|
| **P0 — Khẩn cấp** | Tất cả frame title + panel + label EN → VI | Học sinh hiểu nhầm | Thấp |
| **P0 — Khẩn cấp** | Thêm animation cho Chương 2 (động học) | Mô phỏng không có chuyển động | Cao |
| **P1 — Quan trọng** | Cải thiện visual: gradient, shadow, handle feedback | Mô phỏng nhạt nhẽo | Cao |
| **P1 — Quan trọng** | Gắn formula động vào mỗi scene | Không liên kết lý thuyết | Trung bình |
| **P1 — Quan trọng** | Thêm play/pause/timeline cho 8 route động | UX không có điều khiển | Trung bình |
| **P2 — Cải thiện** | Responsive canvas (W/H không cứng) | Mobile/tablet không tốt | Trung bình |
| **P2 — Cải thiện** | Hiệu ứng hover cho handles | Khó bấm trên mobile | Thấp |
| **P2 — Cải thiện** | CSS font tiếng Việt, slider Firefox/Edge | Hiển thị và responsive | Thấp |
| **P3 — Tốt lên** | Behaviors thực sự có logic riêng | 58 route giống nhau | Cao |
| **P3 — Tốt lên** | Mở rộng derived() với đủ công thức | Thiếu nhiều biến | Trung bình |

---

## CÁC CÂU HỎI CHƯA ĐƯỢC GIẢI QUYẾT

1. **Animation engine**: Có nên dùng `requestAnimationFrame` toàn cục trong `SimProfessionalLab` hay per-route? Per-route linh hoạt hơn nhưng cần quản lý lifecycle.
2. **Canvas library**: Có nên dùng thư viện như Konva.js, Fabric.js, hoặc P5.js thay vì Canvas 2D thuần? Nếu đã đi xa với Canvas 2D thuần, việc chuyển là breaking change lớn.
3. **Physics engine**: Có nên tích hợp thư viện vật lý (Matter.js) cho các mô phỏng va chạm và cơ hệ?
4. **Thứ tự ưu tiên**: Người dùng muốn **sửa tiếng Việt trước** hay **thêm animation trước**? Hai nhiệm vụ đều P0 nhưng khác nhau về effort.
5. **Phạm vi mobile**: Có cần tối ưu cho tablet/mobile không? Hiện tại responsive CSS có nhưng canvas cứng.
6. **KaTeX cho labels**: Có nên dùng KaTeX render các ký hiệu Hy Lạp (`α`, `θ`, `ρ`, `τ`) thay vì text thuần?
7. **Chất lượng ảnh**: Có nên thay thế ảnh minh họa tĩnh trong chapters bằng simulation interactive không?
