/**
 * Manifest 25 route mô phỏng — id + tên + chương. Nguồn duy nhất cho test count.
 * KHÔNG hardcode số 25 nơi khác; test đọc length từ đây.
 * UMD: browser → window.SIM2_ROUTE_MANIFEST; Node → module.exports.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.SIM2_ROUTE_MANIFEST = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  return [
    // Chương 1 — tĩnh học (10)
    { id: 'ch1-1-3', chapter: 1, name: 'Véc tơ lực: điểm đặt / phương / độ lớn' },
    { id: 'ch1-1-4', chapter: 1, name: 'Mô men lực & cánh tay đòn' },
    { id: 'ch1-1-5', chapter: 1, name: 'Thu gọn hệ lực phẳng → R + Mo' },
    { id: 'ch1-1-6', chapter: 1, name: 'Ngẫu lực & mô men ngẫu' },
    { id: 'ch1-2-3', chapter: 1, name: 'Hình bình hành lực (2 đồng quy)' },
    { id: 'ch1-1-8', chapter: 1, name: 'Phản lực liên kết + dựng FBD' },
    { id: 'ch1-3-2', chapter: 1, name: 'Lực căng dây (ràng buộc 1 chiều)' },
    { id: 'ch1-3-6', chapter: 1, name: 'Phản lực & mô men ngàm' },
    { id: 'ch1-5-3', chapter: 1, name: 'Nón ma sát trên mặt nghiêng' },
    { id: 'ch1-6-3', chapter: 1, name: 'Trọng tâm hình ghép / khoét' },
    // Chương 2 — động học (7)
    { id: 'ch2-1-1', chapter: 2, name: 'Quỹ đạo chất điểm + v, a' },
    { id: 'ch2-1-3', chapter: 2, name: 'Tiếp/pháp tuyến + bán kính cong' },
    { id: 'ch2-2-2', chapter: 2, name: 'Quay quanh trục cố định (ω, α)' },
    { id: 'ch2-3-2', chapter: 2, name: 'Truyền động bánh răng–đai–puli' },
    { id: 'ch2-4-4', chapter: 2, name: 'Hợp chuyển động & Coriolis' },
    { id: 'ch2-5-2', chapter: 2, name: 'Tâm vận tốc tức thời (IC)' },
    { id: 'ch2-5-3', chapter: 2, name: 'Phân bố vận tốc điểm trên vật rắn' },
    // Chương 3 — động lực học (8)
    { id: 'ch3-2-2', chapter: 3, name: 'Định luật II Newton F = m·a' },
    { id: 'ch3-2-3', chapter: 3, name: 'Định luật III: lực & phản lực' },
    { id: 'ch3-1-3', chapter: 3, name: 'HQC quán tính vs phi quán tính' },
    { id: 'ch3-3-1', chapter: 3, name: 'Giải ODE chuyển động (RK4)' },
    { id: 'ch3-5-2', chapter: 3, name: 'Định lý động lượng & xung lượng' },
    { id: 'ch3-5-3', chapter: 3, name: 'Bảo toàn mô men động lượng' },
    { id: 'ch3-5-4', chapter: 3, name: 'Định lý động năng (công–năng)' },
    { id: 'ch3-6-2', chapter: 3, name: 'Va chạm với hệ số phục hồi e' }
  ];
});
