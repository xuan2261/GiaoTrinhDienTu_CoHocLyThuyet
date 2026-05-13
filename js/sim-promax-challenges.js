(function() {
'use strict';

const pilotRoutes = ['ch1-2-3', 'ch1-5-3', 'ch2-1-2', 'ch2-5-2', 'ch3-3-1', 'ch3-6-2'];
const specs = {
  'ch1-2-3': ['Chỉnh F1 và F2 để hợp lực khớp đường chéo hình bình hành.', 'Hợp lực đã khớp hình học.', 'Kéo F1/F2 để giảm sai số đường chéo.'],
  'ch1-5-3': ['Tìm ranh giới giữa bám và trượt trên nón ma sát.', 'Trạng thái nằm trong miền bám.', 'Giảm góc nghiêng hoặc tăng hệ số ma sát.'],
  'ch2-1-2': ['Đặt con trỏ để x, v, a cùng theo một chuỗi đạo hàm.', 'Đồ thị và đạo hàm đã đồng bộ.', 'Kéo con trỏ về điểm có sai số nhỏ hơn.'],
  'ch2-5-2': ['Đặt IC để vận tốc vuông góc bán kính IC.', 'Vận tốc thỏa quan hệ tâm tức thời.', 'Di chuyển IC tới giao tuyến pháp tuyến vận tốc.'],
  'ch3-3-1': ['Điều chỉnh lò xo để năng lượng dao động ít trôi.', 'Năng lượng trong ngưỡng cho phép.', 'Tạm dừng rồi kéo vật về trạng thái ổn định hơn.'],
  'ch3-6-2': ['Chọn thông số va chạm để bảo toàn động lượng và hệ số e.', 'Va chạm thỏa động lượng và phục hồi.', 'Kiểm tra dấu vận tốc trước/sau va chạm.']
};

function get(routeId) {
  const row = specs[String(routeId || '')];
  if (!row) return null;
  return { routeId, prompt: row[0], success: row[1], hint: row[2], tolerance: 1 };
}

function evaluate(routeId, invariantResult) {
  const spec = get(routeId);
  const inv = invariantResult || {};
  if (!spec) return { state: 'unavailable', message: '' };
  if (inv.status === 'pass') return { state: 'success', message: spec.success };
  if (inv.status === 'warn') return { state: 'close', message: spec.hint };
  return { state: 'retry', message: spec.hint };
}

window.SimPromaxChallenges = { pilotRoutes, get, evaluate };
})();
