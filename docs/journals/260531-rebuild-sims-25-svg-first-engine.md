# Journal — Rebuild 25 sim SVG-first engine (gỡ 52 cũ)

Date: 2026-05-31 | Plan: `plans/260531-1249-rebuild-sims-25-svg-first-engine` | Tag: `archive/52-sims-pre-removal`

## Outcome

Gỡ sạch 52 sim canvas-based cũ (−25 714 dòng, 170 file), dựng lại 25 sim "ít mà tinh" trên engine SVG-first 3 tầng `js/sim2/`. 7 commit P0–P5 + fix review. `npm run test:sim:release` PASS: 8 node physics + 32 Playwright mount/content/quiz, offline file://.

## Quyết định & phát hiện đáng chú ý

### 1. SVG-first: nhãn = HTML overlay, KHÔNG vẽ chữ trong canvas

Defect kinh điển của bộ cũ là nhãn chồng/readout lệch vì canvas drawText không biết layout. Giải pháp: nhãn là `<div>` absolute-positioned qua CSS transform, test bounding-box DOM bắt được overlap. Canvas underlay chỉ dùng cho 4 sim animation dày (trail/field) — không phải mặc định.

### 2. Transform world→screen dùng chung 1 instance cho cả 3 tầng

SVG + overlay + canvas underlay đều nhận cùng `CoordTransform`. Không đồng bộ thủ công → canvas↔SVG khớp toạ độ ≤1px (test kiểm tra). Đây là bài học từ bộ cũ: mỗi tầng tự tính transform riêng → drift tích luỹ.

### 3. Physics PORT, không viết lại

Giữ 3 file physics đã verify từ bộ cũ, port sang UMD (chạy Node + browser). Code-review xác nhận 73/73 hàm khớp số học với bản gốc (<1e-9). Tính đúng gắn vào *công thức*, không vào engine render — không có lý do viết lại.

### 4. matter.js bị loại hoàn toàn

matter.js mất năng lượng, restitution sai, tích phân chỉ đúng ở 1/60s cố định. Giáo trình cơ học lý thuyết cần số khớp công thức giải tích — game-physics engine không phù hợp. Dùng RK4 ODE tự viết cho Ch3 động lực học.

### 5. dispose hygiene từ đầu

Sim-shell track listener + RAF handle, `dispose()` gỡ sạch khi đổi route. Defect rò RAF của bộ cũ (frame chồng khi navigate) không tái hiện. Test mount/dispose chạy 32 route liên tiếp không leak.

## Phát hiện không hiển nhiên (bài học thật)

**Giả định KaTeX sai hoàn toàn.** Test content-only ban đầu assert mọi route phải có `.katex`. Thực tế giáo trình render công thức chủ yếu bằng ảnh `hinh-XXX.png` — không phải KaTeX. Mất thời gian debug test đỏ trước khi nhận ra đây là lỗi giả định, không phải lỗi code.

**NaN readout từ acos(0/0).** Kéo lực về gốc → magnitude=0 → `acos(0/0)` = NaN → readout hiện "NaN°". Fix: guard `magnitude < ε → angle=0`. Nhỏ nhưng xấu — code-review bắt được (W1).

**Factory throw giữa mount → orphan shell.** Nếu factory ném exception sau khi shell đã mount nhưng trước khi RAF đăng ký, `catch` nuốt cleanup → shell mồ côi không dispose được. Fix: try/finally trong mount wrapper (W2).

**Reconcile guard phải evolve theo phase.** P0 assert "physics file phải còn" (dùng làm nguồn port). P5 xóa physics cũ → assertion P0 đỏ. Phải gỡ assertion lỗi thời thay vì để mâu thuẫn tích luỹ. Bài học: guard test là tài liệu sống, không phải bất biến vĩnh cửu.

## Cảm xúc thật

Bộ cũ 52 sim là nợ kỹ thuật tích luỹ qua nhiều tháng — mỗi lần sửa một defect lại lòi ra hai defect khác. Quyết định gỡ sạch và làm lại từ đầu với 25 sim thay vì vá tiếp là quyết định đúng nhưng đáng sợ (−25k dòng trong một commit). Kết quả: engine mới nhỏ hơn, test được, defect nhãn chồng biến mất hoàn toàn. Nhẹ người.

## Backlog (cắt — feature-add, không phải fix)

- Thêm sim Ch3 va chạm xiên 2D (hiện chỉ có 1D).
- Thêm sim Ch2 hệ quy chiếu phi quán tính.
- Tăng từ 25 lên ~30 sim nếu có nhu cầu từ nội dung giáo trình.

## Unresolved

- 4 sim canvas underlay: nếu sau này cần nhãn overlay trên canvas trail, cần thêm z-index layer — chưa thiết kế.
- Giả định 50px/m cho quy đổi px→SI ở một số sim Ch3 — chấp nhận cho mục đích minh họa, nhưng cần ghi chú rõ trong UI nếu giáo viên dùng để demo số liệu thật.
