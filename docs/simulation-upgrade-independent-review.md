# Rà soát độc lập nâng cấp mô phỏng

Ngày: 2026-10-03 UTC. Baseline so sánh: `dc79ba6`. Đối tượng: working tree nâng cấp riêng, 25 route Sim2, 10 adapter Sim3, core điều khiển/panel/clock/bridge và bộ thu Q0. Báo cáo này chỉ ghi kết quả rà soát nguồn và CPU; không cấp nghiệm thu WebGL, accessibility hoặc học thuật.

## Kết luận

Các lỗi P2 xác nhận trong lượt đọc đầu đã được gửi ngay cho người thực hiện, sửa và kiểm lại: trạng thái playback sau dừng theo sự kiện; số nhập bị thay đổi khi chỉ bấm handle; màu input số ở giao diện tối. Sai tên API đọc đơn vị Ch2, hợp đồng native step và collector đối với miền liên thuộc cũng đã được sửa. Không còn phát hiện P1/P2 đã xác nhận chưa sửa trong phạm vi nguồn đã rà.

Lượt kiểm cuối kết thúc lúc **01:21:44 UTC: 110/110 test thuộc 15 tệp đạt, 0 fail, 0 skip**. Hash của toàn bộ 64 tệp thuộc phạm vi receipt giống nhau trước và sau chạy. `git diff --check` sạch. Những phần U1 chưa có tương tác đầy đủ và U2/U3 chưa làm được ghi rõ trong tài liệu từng chương; không coi việc có readout hoặc test CPU là hoàn thành toàn bộ backlog.

- Baseline đầy đủ: `dc79ba69ac0d3653f3329960e202a9f176dfad24`
- SHA-256 phạm vi nguồn/test/collector đã kiểm: `05c3e6d2a94ac536e861b0f59697ba44b873f4b57f6e0b5d862b7b1fe8630bc5`
- SHA-256 receipt TAP: `758341570b14f21ab1f10e9c862551ee0d67b3fddb6f658b9403cd52fe8b2764`
- Cách tính phạm vi: hợp các đường dẫn tracked thay đổi so với baseline, 15 tệp test trong lệnh dưới và bốn tệp `core.js`, `browser.js`, `server.js`, `run.js` của collector; bỏ docs/plans; sort đường dẫn; mỗi phần tử là `{path,sha256}` của bytes tệp; lấy SHA-256 của `JSON.stringify(array)`. Không đưa chính báo cáo này vào hash

## Phát hiện và kiểm lại

### R1 — P2: playback hiển thị đang chạy sau khi route đã dừng — đã sửa

- Điểm phát sinh: `js/sim2/core/sim-shell.js` (`start`/`stop`) và các nhánh `seek`/`reset` mới của Ch2, nhất là `ch2-1-1` và `ch2-2-2`
- Tái hiện ban đầu: bấm Play, chọn Đến đỉnh hoặc đổi tham số; route dừng nhưng nút vẫn có nhãn Tạm dừng. Bấm nút lần tiếp theo chỉ đổi nhãn, chưa chạy; cần lần thứ hai
- Oracle: trạng thái điều khiển phải cùng trạng thái clock, kể cả khi route dừng tự động, replay hoặc thay tham số
- Sửa được rà lại: shell đồng bộ `controls.setPlaying(true/false)` trong cả `start` và `stop`, ngay cả khi đã ở cùng trạng thái chạy/dừng
- Kiểm: test production shell + production controls, DOM tối thiểu, nhãn nút theo programmatic pause/play. Không phải thao tác trình duyệt thật

### R2 — P2: nhập số hợp lệ rồi bấm handle làm thay đổi vật lý — đã sửa

- Tệp: `js/sim2/sims/ch3/ch3-1-3.js`, `ch3-2-3.js`, `ch3-5-2.js`, `ch3-5-3.js`, `ch3-5-4.js`, các callback `onDrag`
- Tái hiện bằng production route callback: a=3,25 → pointer start tại đúng vị trí hiện có → a=3,5; lực tương tác 61 → 60 N; lực sinh công 4,25 → 4 N; r=1,55 → 1,6 m. Lực xung lượng 6,25 cũng đổi thành 6 N; readout cũ làm tròn che khác biệt này
- Nguyên nhân: input số mới giữ số thập phân, trong khi drag callback lượng tử cả pha start/end/cancel
- Oracle: chọn handle, hủy kéo hoặc phát lại tọa độ không đổi phải giữ state; số đọc tham số trực tiếp không được che số người dùng đã nhập
- Kiểm lại: cả năm giá trị trên giữ nguyên qua start/end; production callbacks phân biệt phase, chuyển động thực mới snap, keyboard tăng theo đại lượng vật lý và giữ phần lẻ đang có. Test Ch3 kiểm cả no-motion, round-trip và bước keyboard

### R3 — P2: input số gần trắng trên nền trắng trong theme tối — đã sửa

- Tệp: `css/style.css`, quy tắc `.sim2-number-input`
- Tái hiện từ cascade: `background: var(--bg-color, #fff)` dùng token không tồn tại; `color: inherit` lấy `--tx=#e8ecf1` từ theme tối. Tỉ số tương phản tính theo hai màu khai báo chỉ khoảng 1,186:1
- Sửa được rà lại: dùng các token hiện hữu `var(--tx)` và `var(--bg)`
- Kiểm: nguồn CSS và kiểm token; không coi đây là phép đo pixels/computed style/contrast trình duyệt cuối cùng

### R4 — P3: mô tả đơn vị Ch2 đặt sai khóa API — đã sửa

- Tệp: `js/sim2/sims/ch2/ch2-5-2.js`, `ch2-5-3.js`, cấu hình a11y của handle
- Cấu hình dùng `textFromPoint`, nhưng core chỉ đọc `valueText`; mô tả vật lý dự kiến bị bỏ qua và rơi về x/y mặc định
- Kiểm lại: cả hai dùng `valueText`; suite Ch2 thêm kiểm mô tả đơn vị theo API thật

### R5 — hợp đồng native numeric/step — đã sửa ở nguồn, browser cần qualification

DOM tối thiểu không thực hiện native range value sanitization hoặc number validity. Nếu giữ step hữu hạn nhưng nhận số ngoài lattice, ví dụ a=3,25 với step=0,5, native range và input số có thể không có cùng giá trị hợp lệ. Core cuối đặt native `step=any` cho cả hai, giữ bước vật lý trong `data-physical-step`, lượng tử range khi kéo và xử lý Arrow/Page bằng bước vật lý rõ ràng. Phím của range có `preventDefault`, Home/End chọn min/max; input số giữ phím caret và hỗ trợ ArrowUp/Down. Collector ghi cả native step và physical step. Kiểm nguồn và test exact value/key/drag đạt; vẫn cần kiểm browser thật, đặc biệt spinner số.

Core cũng đã tách draft số khỏi commit để không viết lại ký tự thập phân/dấu/số mũ mỗi lần gõ; Enter/change cùng một giá trị chỉ commit một lần. Các preset giải tích vẫn giữ giá trị chính xác khi gọi `setValue`.

## Bộ thu Q0: vấn đề cần phân biệt với lỗi sản phẩm

`tools/sim-upgrade-qualification/run.js`, nhánh `execute(... type='control')`, ban đầu yêu cầu số sau nhập bằng đúng min/max khai báo. Điều này không đúng cho miền ghép đã công khai của một số route Ch1. Ví dụ mặc định `ch1-2-3`, F₂x=25 N; nhập max tĩnh F₁x=137,5 N được route giới hạn đúng thành 112,5 N để tổng không vượt 137,5 N. **Đã sửa:** collector giữ ảnh/state, lưu riêng target/actual/targetReached và yêu cầu review bằng oracle khi lệch, không bỏ ca thành not-run vì clamp hợp lệ. Vẫn không suy targetReached=true là bằng chứng vật lý đúng.

Các test Q0 mới về handler HTTP/hash và symlink ancestor đã xuất hiện ở pha đỏ trong lúc nguồn còn được cập nhật; kiểm lại chúng đạt rồi được đưa vào lượt cuối 110/110. Không ghi lỗi TDD trung gian thành lỗi còn mở. Chỉ gọi handler bằng request/response bộ đỡ, không mở server/socket hay browser trong lượt rà soát này.

## Phạm vi xác minh

Đã đọc diff toàn bộ 41 tệp JS/CSS sản phẩm thay đổi so với baseline, kế hoạch trong `plans/20261003-simulation-roadmap/plan.md`, roadmap đánh giá trước triển khai và bốn tài liệu nâng cấp core/Ch1/Ch2/Ch3. Đã rà bổ sung package scripts và hai tệp metadata cuối. Các sửa công thức draft cho ngẫu lực, dây và ngàm phù hợp mô hình route; test metadata giữ status draft và verified=false. Không sửa product/test file; chỉ tạo báo cáo này.

- Core: pointer identity/cancel/capture loss; scalar keyboard; keyed readout node; status theo yêu cầu; cleanup; seek đúng thời gian; snapshot đóng băng sâu; playback; numeric draft/commit và theme
- Ch1: dấu/mômen/ngẫu lực, zero vector, cân bằng, ma sát cần để cân bằng, tọa độ/trọng tâm, input và reset; hai adapter 3D
- Ch2: projectile event/clock, Frenet/curvature, gia tốc quay, đai/no-slip, Coriolis với đạo hàm độc lập, IC/rigidity, field/control ngoài scene; năm adapter 3D
- Ch3: A/B cùng thang; nghiệm giải tích/sai số RK4; impulse/work graph; FBD; năng lượng quay; collision TOI/phần dư dt/pha/giữ kết quả; ba adapter 3D
- Các suite repair hiện hữu tiếp tục đạt trong lượt chạy; diff sản phẩm không thay các kernel vật lý, vendor Three, nội dung bài, quiz hoặc canonical DOCX/PDF. Kiểm integrity toàn bộ nội dung là receipt riêng của gói tích hợp

### Probe hình học bổ sung độc lập

Dùng Three r160 thật, production adapter `Sim3Ch222` và shell production với renderer/DOM bộ đỡ. Quét 1.620 cấu hình: width 320/520/900, ω₀=0/0,5/2, α=0/0,15/0,5, 60 mốc t=i/3 s. Project từng vertex của hai mũi tên gia tốc mới qua matrixWorld và camera. Giá trị lớn nhất |NDC x/y| là 0,442405, nằm trong frustum. Không suy từ phép kiểm này rằng nhãn DOM đọc được, không che nhau hoặc pixels WebGL đúng.

### Lệnh kiểm cuối đang dùng

```sh
node --test \
  tests/sim-upgrades-core.test.js \
  tests/sim-upgrades-ch1.test.js \
  tests/sim-upgrades-ch2.test.js \
  tests/sim-upgrades-ch3.test.js \
  tests/sim-upgrades-metadata.test.js \
  tests/sim-upgrade-qualification.test.js \
  tests/sim2-audit-repairs.test.js \
  tests/sim2-audit-domain-sweep.test.js \
  tests/sim3-audit-regression.test.js \
  tests/sim2-animation-clock.test.js \
  tests/sim2-ch1-physics.test.js \
  tests/sim2-ch2-physics.test.js \
  tests/sim2-ch3-physics.test.js \
  tests/sim2-visual-physics-regression.test.js \
  tests/sim3-coordinate-system.test.js
git diff --check
```

Số test của Node bao gồm một số tệp legacy có assert nội bộ; không diễn giải thành 110 ca học thuật độc lập. Không cộng các lần chạy lại để tăng coverage.

## Giới hạn và điều kiện tiếp tục

- Không khởi chạy lại browser, không đổi cờ, network, bảo mật hoặc môi trường người dùng. Runtime đã bị chặn trước render; không có screenshot/video/GPU thực trong báo cáo này
- Cần kiểm native number/range/keyboard/spinner, focus, pointer/touch/capture thật, label overlap, contrast, 320 CSS px, zoom 200/400%, light/dark và screen reader. CPU node không mô phỏng đủ các hành vi này
- Các nút mới phải được kiểm trực tiếp trong Q0: các selector FBD, A/B, reset tĩnh, equal-impulse, một chu kỳ, apex/touchdown/replay và collision event/pause controls. Step-to-time không thay cho việc kiểm từng nút
- Resource UUID/object-count ổn định không chứng minh không leak GPU; chưa có benchmark warm-up/60 s, hidden-tab/120 Hz thực hoặc context-loss/restore trên renderer thật
- Kết luận phù hợp là implementation và các hợp đồng CPU đã được kiểm; qualification sản phẩm và mọi quyết định nghiệm thu chính thức vẫn pending
