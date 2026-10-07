/**
 * Sim2Palette — hằng màu DÙNG CHUNG cho 25 sim (1 nguồn ý nghĩa màu).
 * Mirror token CSS `--sim-c-*` trong css/style.css; JS hằng cho SVG stroke, CSS class cho DOM.
 * Mọi giá trị là hex #rrggbb (test khóa định dạng). Thành phần X/Y vẽ NÉT ĐỨT cùng màu parent;
 * các khóa x/y dưới đây là màu fallback khi thành phần đứng độc lập (Fₓ rose, Fᵧ blue).
 * UMD: browser → window.Sim2Palette; Node → module.exports.
 */
(function(root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.Sim2Palette = api;
})(typeof window !== 'undefined' ? window : this, function() {
  'use strict';

  return {
    force:     '#e03030', // Lực / lực tác dụng (đỏ) — 4.45:1 trên nền #fdfdfb
    v:         '#159c3a', // Vận tốc (lục) — đậm để đạt ≥3:1 (3.53:1)
    a:         '#0074d9', // Gia tốc (lam) — 4.58:1
    resultant: '#e06a00', // Hợp lực / R (cam) — đậm để đạt ≥3:1 (3.31:1)
    reaction:  '#b10dc9', // Phản lực / pháp tuyến (tím) — 5.47:1
    moment:    '#7c3aed', // Mô men / ω / α (tím đậm) — 5.60:1
    coriolis:  '#d97706', // Coriolis (hổ phách) — 3.13:1
    x:         '#d81b60', // Thành phần X (rose) — 4.86:1 — fallback khi đứng độc lập
    y:         '#1565c0', // Thành phần Y (blue) — 5.64:1 — fallback khi đứng độc lập
    handle:    '#e8501e', // Handle kéo (coral) — đậm để đạt ≥3:1 (3.68:1)
    axis:      '#64748b', // Trục (slate) — 4.67:1
    grid:      '#cbd5e1'  // Lưới (xám nhạt) — đường phụ, miễn ngưỡng
  };
});
