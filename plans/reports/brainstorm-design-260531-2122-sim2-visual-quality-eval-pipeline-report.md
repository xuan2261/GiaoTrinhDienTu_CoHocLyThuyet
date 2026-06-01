# Brainstorm — Đánh giá visual + chất lượng thực tế 25 sim SVG-first

- Ngày: 2026-05-31
- Phạm vi: **đánh giá** (KHÔNG sửa) diện mạo/animation/correctness-visual của 25 sim tại `js/sim2/`
- Trạng thái: phương án đã trình, user duyệt qua các câu hỏi chốt; chưa code

## 1. Vấn đề & câu trả lời thẳng

Câu hỏi user: "đã visual, kiểm tra, đánh giá thực tế chất lượng, hiển thị… của tất cả mô phỏng mới chưa?"

**Chưa.** Quét test harness thực tế:

| Đã verify (có bằng chứng) | Công cụ |
|---|---|
| Physics đúng (công thức dạng đóng 3 chương, transform round-trip, port verified-sticky) | `test:sim:physics` (8 node test) |
| Cấu trúc DOM: mỗi route CÓ panel + ≥1 công thức + ≥1 legend + readout sống ≠ rỗng + ≥1 control; dispose sạch; 0 console error | `sim2-ui-coverage.spec.js` |
| Layout cơ học: nhãn DOM không chồng, canvas underlay khớp SVG ≤1px, sim động start-paused | `ch{1,2,3}-mount.spec.js` |

**CHƯA verify (khoảng trống):**
- `grep screenshot|toMatchSnapshot|toHaveScreenshot|.png|visual` trong `tests/` → **0 kết quả**.
- `tools/*capture*` → **0 file** (capture tooling bộ 52 cũ đã gỡ cùng engine cũ).
- ⇒ Chưa ai/artifact nào nhìn **pixel thật** của 25 sim. Chỉ 2 pilot (`ch1-1-3`, `ch3-6-2`) duyệt mắt khi làm pilot.
- Test đếm DOM, KHÔNG đọc hình: 1 sim có thể pass 100% test mà vẽ sai vector/màu/animation. Rủi ro cao nhất ở **9 sim động** (Coriolis, IC, va chạm, ODE, bảo toàn mô men…) — frame giữa animation chưa ai thấy.

### Yêu cầu chốt (user)
- Phương pháp: **để tôi nghiên cứu rồi khuyến nghị** (đã làm — mục 3).
- Sim động: **chụp 2-3 frame mốc thời gian** (t=0 / giữa / cuối).
- Xử lý lỗi: **chỉ lập danh sách lỗi để duyệt** — KHÔNG sửa lần này.
- AI soi trước: **không có API Gemini → Claude tự đọc ảnh (Read tool) soi lỗi thô** trước khi user duyệt mắt.

### Ràng buộc bất biến
- Script capture **dev-only** — KHÔNG vào runtime offline `file://`, không thêm dependency runtime.
- KHÔNG đụng physics/sim đã verify (chỉ đọc, không sửa).
- Tái dùng fixture sẵn có `tests/fixtures/sim2-ch{1,2,3}.html` + mount qua `window.SIM_MAP` + count từ `sim2-route-manifest.js` (không hardcode 25).

## 2. Các hướng đã cân nhắc

| Hướng | Được | Mất | Chọn |
|---|---|---|---|
| **A. Capture → contact-sheet → mắt người duyệt** (augmented manual) | Đúng bản chất "đẹp/rõ/đúng = mắt người quyết"; rẻ, 1 lần; nghiên cứu: cắt ~36% thời gian vs mò tay thuần | Không tự chặn hồi quy về sau | ✅ |
| B. Visual-regression `toHaveScreenshot` ngay | Tự động chặn hồi quy | **SAI lúc này**: chưa có baseline "đẹp đã duyệt"; pixel-diff bắt "có đổi" chứ KHÔNG phán "đúng/đẹp". Chỉ hợp *sau* khi đã có bản duyệt | ✗ (để phase sau) |
| C. Review tương tác trong browser thuần | Đúng nhất cho "tương tác" | Tốn thời gian user, không lưu artifact, khó soát đủ 25×nhiều frame | ✗ (bổ trợ tùy chọn) |

Nguồn: [visual-regression-testing.dev](https://visual-regression-testing.dev/) (VR cần baseline + lọc nhiễu), [diffy.website](https://diffy.website/blog/stanford-webcamp-best-of-both-worlds) (VR hợp cho chặn hồi quy hàng loạt, không phải đánh giá lần đầu), [Springer 2024](https://link.springer.com/article/10.1007/s10664-024-10522-z) (augmented manual cắt 36% thời gian).

## 3. Giải pháp khuyến nghị — pipeline 1 lần, dev-only

```
1 script playwright (dev-only)
  ├─ đọc manifest → mount 25 sim qua SIM_MAP (fixture sim2-ch{1,2,3}.html sẵn có)
  ├─ sim tĩnh (~16): chụp 1 frame init + bấm ▶ chụp state sống
  ├─ sim động (9): Playwright Clock API (clock.install + pauseAt/tick) tua tới
  │                 t=0 / t=giữa / t=cuối → 3 frame deterministic
  └─ ~43 ảnh PNG (đặt ngoài runtime, vd plans/.../visuals/ hoặc test-artifacts/)
        ↓
Claude đọc trực tiếp PNG (Read tool) → cờ lỗi thô:
   canvas trắng · vector sai hướng/độ dài rõ · nhãn tràn khung ·
   màu lệch legend · (Claude biết outline ⇒ phán thêm physics-visual hợp lý?)
        ↓
contact-sheet HTML (lưới thumbnail + route-id + §mục + cờ nghi vấn của Claude)
        ↓
USER duyệt mắt (~10-15') → đánh dấu lỗi thật
        ↓
Báo cáo danh sách lỗi: route · lỗi gì · nặng/nhẹ · ảnh kèm  (CHỈ đánh giá, chưa sửa)
```

Giải pháp kỹ thuật then chốt: sim động chụp frame RAF ngẫu nhiên → không lặp lại. **Playwright Clock API** tua animation tới mốc t xác định rồi chụp → frame deterministic ([Playwright Clock](https://playwright.dev/docs/clock), [snapshot best-practices](https://www.browserstack.com/guide/playwright-snapshot-testing)).

## 4. Rủi ro & brutal honesty
1. **Claude soi ≠ thay mắt user.** Claude bắt được defect *rendering* hiển nhiên + nghi vấn physics-visual, nhưng phán cuối về "đẹp/rõ sư phạm" là của user. Cờ của Claude chỉ để giảm tải, không phải kết luận.
2. **Đọc 43 ảnh tốn token.** Chấp nhận ở phase thực thi; report này không tốn.
3. **Đây là đánh giá 1 LẦN.** Muốn giữ chất lượng lâu dài → adopt `toHaveScreenshot` baseline ở phase 2 (YAGNI bây giờ).
4. **Frame "giữa" của sim động cần chọn mốc có ý nghĩa** (vd va chạm: ngay trước/lúc/sau chạm) — không phải t/2 máy móc. Cần map mốc theo từng sim động khi thực thi.
5. **Clock API có thể không bắt mọi loop** (vài sim dùng timestamp riêng) — fallback: tick RAF thủ công n lần rồi chụp.

## 5. Success metrics / done
- 25 sim (43 ảnh) đều có ảnh thật; sim động có ≥3 frame mốc.
- Contact-sheet mở được, đủ 25 route, có cờ nghi vấn Claude.
- User duyệt xong → báo cáo danh sách lỗi phân mức nặng/nhẹ, mỗi lỗi kèm ảnh.
- Script capture dev-only, KHÔNG phá ràng buộc offline/0-dependency của app.
- `npm run test:sim:release` vẫn xanh (không đụng code đã verify).

## 6. Bước kế tiếp
1. `/ck:plan` (default — đây là THÊM tooling QA mới, không refactor code verified ⇒ không cần `--tdd`): thiết kế script capture + clock-frame map cho 9 sim động + generator contact-sheet, rồi chạy → Claude soi → user duyệt → report.
2. (Phase sau, sau khi sửa lỗi) cân nhắc chốt baseline `toHaveScreenshot` để chặn hồi quy.

## Câu hỏi chưa giải quyết
- Mốc "frame giữa" cho từng sim động: để Claude tự chọn theo ngữ nghĩa (đề xuất) hay user chỉ định mốc cho vài sim quan trọng? (đề nghị chốt khi thực thi)
- Ảnh artifact lưu ở đâu cho gọn: `plans/260531-2122-.../visuals/` hay `test-artifacts/` git-ignored? (đề nghị: thư mục plan, kèm contact-sheet để xem lại)
